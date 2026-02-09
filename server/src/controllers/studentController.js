import { supabaseAdmin } from '../config/supabase.js';

// GET /api/student/stats
export const getStudentStats = async (req, res) => {
  const studentId = req.user.id;

  try {
    // 1. Get Current Balance
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('balance')
      .eq('id', studentId)
      .single();

    if (profileError) throw profileError;

    // 2. Get Transaction History
    // We join 'admin_id' with 'profiles' to get the Name of the Admin or Vendor
    const { data: txns, error: txnError } = await supabaseAdmin
      .from('transactions')
      .select(`
        amount,
        type,
        created_at,
        counterparty:profiles!admin_id ( full_name, role )
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false }) // Newest first
      .limit(50); // Show last 50 transactions

    if (txnError) throw txnError;

    // 3. Calculate Total Spent (Sum of DEBITs)
    const totalSpent = txns
      .filter(t => t.type === 'DEBIT')
      .reduce((sum, t) => sum + t.amount, 0);

    res.json({
      balance: profile.balance,
      totalSpent,
      transactions: txns
    });

  } catch (err) {
    console.error("Student Stats Error:", err);
    res.status(500).json({ error: 'Failed to fetch wallet history' });
  }
};