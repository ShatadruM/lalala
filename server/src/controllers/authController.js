import { supabaseAdmin } from '../config/supabase.js';

// GET /api/me
export const getMyStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch profile using Admin Client 
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Database Fetch Error:', error);
      return res.status(500).json({ error: 'Failed to retrieve profile' });
    }

    // Determine registration status
    const isRegistered = !!(profile && profile.registration_number && profile.college_name);

    res.json({
      user: req.user,       
      profile: profile,     
      isRegistered          
    });

  } catch (err) {
    console.error('Controller Error:', err);
    res.status(500).json({ error: 'Server crashed processing request' });
  }
};