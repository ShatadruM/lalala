import { supabaseAdmin } from "../config/supabase.js";

// POST /api/admin/credit 
export const addTokens = async (req, res) => {
  const { studentId, amount, proofUrl, utrNumber } = req.body; // <-- Added utrNumber
  const adminId = req.user.id;

  //  Strict Validation of UTR 
  if (!studentId || !amount || !proofUrl || !utrNumber) {
    return res
      .status(400)
      .json({ error: "Missing details: Proof image and UTR are mandatory." });
  }

  //  Double-check UTR length 
  if (utrNumber.trim().length !== 12) {
    return res
      .status(400)
      .json({ error: "Invalid UTR: Must be exactly 12 characters." });
  }

  const creditAmount = parseInt(amount);
  if (isNaN(creditAmount) || creditAmount <= 0) {
    return res.status(400).json({ error: "Invalid amount." });
  }

  try {
    // ATOMIC CALL: sending one request to Supabase.
    const { data, error } = await supabaseAdmin.rpc("add_tokens_atomic", {
      p_admin_id: adminId,
      p_student_id: studentId,
      p_amount: creditAmount,
      p_proof_url: proofUrl,
      p_utr_number: utrNumber.trim().toUpperCase(), 
    });

    if (error) {
      console.error("RPC Error:", error);

      // Handle the duplicate UTR error specifically if it bubbles up from Postgres
      if (error.code === "23505" || error.message.includes("utr_number")) {
        return res
          .status(400)
          .json({
            error: "FRAUD ALERT: This UTR has already been used in the system.",
          });
      }

      return res
        .status(400)
        .json({ error: error.message || "Transaction failed" });
    }

    // Success response
    console.log(
      `✅ Atomic Transaction: Admin ${adminId} -> ${creditAmount} -> Student ${studentId} (UTR: ${utrNumber})`,
    );

    res.json({
      success: true,
      message: `Successfully added ${creditAmount} tokens`,
      studentName: data.student_name,
      newBalance: data.new_balance,
    });
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: "Internal system error" });
  }
};

// GET /api/admin/stats
export const getAdminStats = async (req, res) => {
  const adminId = req.user.id;

  try {
   
    const statsPromise = supabaseAdmin.rpc("get_admin_stats", {
      p_admin_id: adminId,
    });

    //  Run a standard query for the "Recent History" list
    const listPromise = supabaseAdmin
      .from("transactions")
      .select(
        `
        amount, 
        created_at, 
        student:profiles!student_id ( full_name, registration_number )
      `,
      )
      .eq("admin_id", adminId)
      .eq("type", "CREDIT") 
      .order("created_at", { ascending: false }) 
      .limit(50);

    // Run both in parallel for speed
    const [statsResult, listResult] = await Promise.all([
      statsPromise,
      listPromise,
    ]);

    if (statsResult.error) throw statsResult.error;
    if (listResult.error) throw listResult.error;

    // Combine the data
    res.json({
      ...statsResult.data, // totalTokens, uniqueStudents
      recentTransactions: listResult.data,
    });
  } catch (err) {
    console.error("Stats Error:", err);
    res.status(500).json({ error: "Failed to fetch admin stats" });
  }
};
