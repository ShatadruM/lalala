import { supabaseAdmin } from '../config/supabase.js';

// POST /api/admin/credit
export const addTokens = async (req, res) => {
  const { studentId, amount } = req.body;
  const adminId = req.user.id; // From middleware

  if (!studentId || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid details provided' });
  }

  try {
    // 1. Fetch current student data to ensure they exist
    const { data: student, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('balance, full_name')
      .eq('id', studentId)
      .maybeSingle();

    if (fetchError || !student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // 2. Calculate new balance
    const newBalance = (student.balance || 0) + parseInt(amount);

    // 3. Update Profile (Add Money + Activate Account)
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        balance: newBalance,
        is_active: true // Auto-activate if they pay
      })
      .eq('id', studentId);

    if (updateError) throw updateError;

    // 4. Log the Transaction (Audit Trail)
    const { error: logError } = await supabaseAdmin
      .from('transactions')
      .insert({
        student_id: studentId,
        admin_id: adminId,
        amount: parseInt(amount),
        type: 'CREDIT'
      });

    if (logError) {
      console.error("Audit Log Failed (Critical):", logError);
      // Note: In a banking app, we would rollback. For a fest, logging the error is acceptable.
    }

    console.log(`✅ Admin ${adminId} credited ${amount} to Student ${studentId}`);

    res.json({ 
      success: true, 
      message: `Added ${amount} tokens to ${student.full_name}`,
      newBalance: newBalance 
    });

  } catch (err) {
    console.error('Credit Transaction Error:', err);
    res.status(500).json({ error: 'Transaction failed' });
  }
};