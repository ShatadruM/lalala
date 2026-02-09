import { supabaseAdmin } from '../config/supabase.js';

// POST /api/vendor/deduct
export const deductTokens = async (req, res) => {
  const { studentId, amount } = req.body;
  const vendorId = req.user.id;

  if (!studentId || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid details' });
  }

  try {
    const { data, error } = await supabaseAdmin.rpc('deduct_tokens_atomic', {
      p_vendor_id: vendorId,
      p_student_id: studentId,
      p_amount: parseInt(amount)
    });

    if (error) {
      // Handle "Not Enough Money" gracefully
      if (error.message.includes('INSUFFICIENT_FUNDS')) {
        return res.status(402).json({ error: 'Insufficient Balance!', code: 'LOW_BALANCE' });
      }
      throw error;
    }

    res.json({ success: true, ...data });

  } catch (err) {
    console.error('Vendor Error:', err);
    res.status(500).json({ error: err.message });
  }
};


// GET /api/vendor/stats
export const getVendorStats = async (req, res) => {
  const vendorId = req.user.id;
  
  try {
    // Fetch transactions AND the Student Name in one query
    const { data: txns, error } = await supabaseAdmin
      .from('transactions')
      .select(`
        amount, 
        created_at, 
        student:profiles!student_id ( full_name, registration_number ) 
      `)
      .eq('admin_id', vendorId) // For vendors, admin_id = vendor_id
      .eq('type', 'DEBIT')
      .order('created_at', { ascending: false }) // Newest first
      .limit(100); // Limit to last 100 to keep it fast

    if (error) throw error;

    // 1. Calculate Totals
    const totalSales = txns.reduce((sum, t) => sum + t.amount, 0);
    const totalCustomers = txns.length;

    // 2. Prepare Graph Data (Footfall by Hour)
    // Initialize 24 hours
    const hours = Array(24).fill(0).map((_, i) => ({ 
      hour: `${i}:00`, 
      sales: 0,
      count: 0
    }));

    // Fill graph data
    txns.forEach(t => {
      // Convert UTC DB time to local hour
      const date = new Date(t.created_at);
      const hour = date.getHours(); 
      if (hours[hour]) {
        hours[hour].sales += t.amount;
        hours[hour].count += 1;
      }
    });

    // 3. Send everything including the raw list
    res.json({ 
      totalSales, 
      totalCustomers, 
      chartData: hours,
      recentTransactions: txns // <--- The new list
    });

  } catch (err) {
    console.error("Stats Error:", err);
    res.status(500).json({ error: 'Stats failed' });
  }
};