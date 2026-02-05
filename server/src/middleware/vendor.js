import { supabaseAdmin } from '../config/supabase.js';

export const requireVendor = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (!profile || profile.role !== 'vendor') {
      return res.status(403).json({ error: 'Access Denied: Vendors only' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Auth check failed' });
  }
};