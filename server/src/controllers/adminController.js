import { supabaseAdmin } from '../config/supabase.js';

export const addTokens = async (req, res) => {
  const { studentId, amount, proofUrl } = req.body;
  const adminId = req.user.id;

  if (!studentId || !amount || !proofUrl) {
    return res.status(400).json({ error: 'Missing details: Proof image is mandatory.' });
  }

  const creditAmount = parseInt(amount);
  if (isNaN(creditAmount) || creditAmount <= 0) {
    return res.status(400).json({ error: 'Invalid amount.' });
  }

  try {
    // ATOMIC CALL: We send ONE request to Supabase.
    // The database handles the transaction internally.
    const { data, error } = await supabaseAdmin.rpc('add_tokens_atomic', {
      p_admin_id: adminId,
      p_student_id: studentId,
      p_amount: creditAmount,
      p_proof_url: proofUrl
    });

    if (error) {
      console.error("RPC Error:", error);
      // Pass the database error message to the frontend (e.g., "Student not found")
      return res.status(400).json({ error: error.message || 'Transaction failed' });
    }

    // Success response
    console.log(`✅ Atomic Transaction: Admin ${adminId} -> ${creditAmount} -> Student ${studentId}`);
    
    res.json({ 
      success: true, 
      message: `Successfully added ${creditAmount} tokens`,
      studentName: data.student_name,
      newBalance: data.new_balance 
    });

  } catch (err) {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Internal system error' });
  }
};

// GET /api/admin/stats
export const getAdminStats = async (req, res) => {
  const adminId = req.user.id;

  try {
    // 1. Run the RPC for the big numbers (Total & Unique)
    const statsPromise = supabaseAdmin.rpc('get_admin_stats', {
      p_admin_id: adminId
    });

    // 2. Run a standard query for the "Recent History" list
    const listPromise = supabaseAdmin
      .from('transactions')
      .select(`
        amount, 
        created_at, 
        student:profiles!student_id ( full_name, registration_number )
      `)
      .eq('admin_id', adminId)
      .eq('type', 'CREDIT') // Only show money GIVEN
      .order('created_at', { ascending: false }) // Newest first
      .limit(50);

    // Run both in parallel for speed
    const [statsResult, listResult] = await Promise.all([statsPromise, listPromise]);

    if (statsResult.error) throw statsResult.error;
    if (listResult.error) throw listResult.error;

    // Combine the data
    res.json({
      ...statsResult.data, // totalTokens, uniqueStudents
      recentTransactions: listResult.data
    });

  } catch (err) {
    console.error('Stats Error:', err);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
};