import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import Layout from "../components/Layout";

export default function Register() {
  const { user, setProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); // New state for strict validation

  const [formData, setFormData] = useState({
    full_name: user?.user_metadata?.full_name || "",
    phone: "",
    college_name: "",
    registration_number: "",
    branch: "",
    year: "1",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(""); // Clear previous errors

    // 1. STRICT MANUAL VALIDATION
    const {
      full_name,
      phone,
      college_name,
      registration_number,
      branch,
      year,
    } = formData;

    if (
      !full_name.trim() ||
      !phone.trim() ||
      !college_name.trim() ||
      !registration_number.trim() ||
      !branch.trim() ||
      !year
    ) {
      setErrorMsg("🛑 ALL fields are mandatory. Please fill out everything.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setErrorMsg("🛑 Phone number must be exactly 10 digits.");
      return;
    }

    setLoading(true);

    const updates = {
      id: user.id,
      email: user.email,
      ...formData,
      balance: 0,
      role: "student",
      is_active: false,
    };

    // 2. SUPABASE UPSERT
    const { error } = await supabase.from("profiles").upsert(updates);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setProfile(updates);
      navigate("/dashboard");
    }
    setLoading(false);
  };

  // Reusable input styling for the theme
  const inputBaseClass =
    "mt-1 block w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono";
  const labelBaseClass =
    "block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1";

  return (
    <Layout>
      <div className="max-w-md mx-auto animate-fade-in pb-10">
        {/* Glassmorphic Container */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -z-10"></div>

          <h2 className="text-3xl font-black bg-clip-text text-white mb-4 drop-shadow-md">
            Register
          </h2>

          {/* Error Banner */}
          {errorMsg && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm font-bold mb-6 animate-shake shadow-inner">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className={labelBaseClass}>Full Name</label>
              <input
                type="text"
                required
                placeholder="John Doe"
                className={inputBaseClass}
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
              />
            </div>

            {/* College Name */}
            <div>
              <label className={labelBaseClass}>College Name</label>
              <input
                type="text"
                required
                placeholder="e.g. SRM University, AP"
                className={inputBaseClass}
                value={formData.college_name}
                onChange={(e) =>
                  setFormData({ ...formData, college_name: e.target.value })
                }
              />
            </div>

            {/* Registration Number */}
            <div>
              <label className={labelBaseClass}>Registration Number</label>
              <input
                type="text"
                required
                placeholder="e.g. AP23XXXXXXX"
                className={`${inputBaseClass} uppercase`}
                value={formData.registration_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    registration_number: e.target.value.toUpperCase(),
                  })
                }
              />
            </div>

            {/* Phone */}
            <div>
              <label className={labelBaseClass}>Phone Number</label>
              <input
                type="tel"
                required
                placeholder="10-digit mobile number"
                maxLength={10}
                className={inputBaseClass}
                value={formData.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone: e.target.value.replace(/\D/g, ""),
                  })
                } // Forces numbers only
              />
            </div>

            {/* Branch & Year */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelBaseClass}>Branch</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CSE"
                  className={inputBaseClass}
                  value={formData.branch}
                  onChange={(e) =>
                    setFormData({ ...formData, branch: e.target.value })
                  }
                />
              </div>
              <div>
                <label className={labelBaseClass}>Year</label>
                <select
                  required
                  className={`${inputBaseClass} appearance-none`}
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
                    backgroundPosition: "right 1rem center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.2em",
                  }}
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: e.target.value })
                  }
                >
                  <option
                    value=""
                    disabled
                    className="bg-gray-900 text-gray-500"
                  >
                    Select Year
                  </option>
                  <option value="1" className="bg-gray-900 text-white">
                    1st Year
                  </option>
                  <option value="2" className="bg-gray-900 text-white">
                    2nd Year
                  </option>
                  <option value="3" className="bg-gray-900 text-white">
                    3rd Year
                  </option>
                  <option value="4" className="bg-gray-900 text-white">
                    4th Year
                  </option>
                  <option value="5" className="bg-gray-900 text-white">
                    5th Year / Other
                  </option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-6 py-3.5 rounded-xl font-semibold transition-all duration-200 active:scale-[0.98]
    ${
      loading
        ? "bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed"
        : "bg-white text-black hover:bg-gray-200 shadow-sm"
    }`}
            >
              {loading ? "Processing..." : "Generate Pass"}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
