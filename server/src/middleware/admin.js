import { supabaseAdmin } from '../config/supabase.js';

export const requireAdmin = async (req, res, next) => {
  try {
    // req.user is already populated by the previous 'verifyToken' middleware
    const userId = req.user.id;

    // Check the 'role' in the database
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (error || !profile) {
      return res.status(403).json({ error: 'Access denied: User profile not found' });
    }

    if (profile.role !== 'admin') {
      // 🚨 Security Alert: A non-admin tried to access an admin route
      console.warn(`Unauthorized Access Attempt by User ID: ${userId}`);
      return res.status(403).json({ error: 'Access denied: Admins only' });
    }

    // Pass - The user is an admin
    next();
  } catch (err) {
    console.error('Admin Check Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};