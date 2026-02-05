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
    // Fetch all sales by this vendor
    const { data: txns, error } = await supabaseAdmin
      .from('transactions')
      .select('amount, created_at')
      .eq('admin_id', vendorId) // In DEBIT txns, admin_id is the vendor
      .eq('type', 'DEBIT');

    if (error) throw error;

    // 1. Calculate Totals
    const totalSales = txns.reduce((sum, t) => sum + t.amount, 0);
    const totalCustomers = txns.length;

    // 2. Prepare Graph Data (Footfall by Hour)
    // Create an array of 24 hours initialized to 0
    const hours = Array(24).fill(0).map((_, i) => ({ 
      hour: `${i}:00`, 
      sales: 0,
      count: 0
    }));

    txns.forEach(t => {
      const date = new Date(t.created_at);
      const hour = date.getHours(); // 0-23
      hours[hour].sales += t.amount;
      hours[hour].count += 1;
    });

    res.json({ totalSales, totalCustomers, chartData: hours });

  } catch (err) {
    res.status(500).json({ error: 'Stats failed' });
  }
};