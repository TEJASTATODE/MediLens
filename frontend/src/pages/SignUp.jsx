import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import api from "../services/api";
import { 
  Mail, Lock, User, Loader, ShieldCheck, 
  Stethoscope, ArrowRight, ScanEye, BrainCircuit, Activity
} from "lucide-react";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/register", formData);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFE] flex flex-col md:flex-row font-sans overflow-hidden">
      
      {/* ─── LEFT SIDE: BRAND & FEATURES ─── */}
      <div className="hidden md:flex w-[40%] bg-[#007AFF] p-12 flex-col justify-between text-white relative">
        {/* Abstract Background Animation */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <Stethoscope className="text-[#007AFF]" size={28} />
            </div>
            <span className="text-6xl font-bold tracking-tight">MediLens</span>
          </div>

          <h2 className="text-4xl font-bold leading-tight mb-8">
            The next generation of <br />
            <span className="text-blue-200">Medicine Analysis.</span>
          </h2>
          <p className="text-blue-100/80 mb-10">Empowering healthcare professionals and patients with cutting-edge AI technology for accurate medication insights.</p>          
          <div className="space-y-10">
            {/* Feature 1 */}
            <div className="flex gap-5">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-lg rounded-xl flex items-center justify-center shrink-0 border border-white/20">
                <ScanEye size={24} />
              </div>
              <div>
                <h4 className="font-bold text-lg">Precision OCR Engine</h4>
                <p className="text-blue-100/70 text-sm leading-relaxed">Advanced PaddleOCR technology for text accuracy on prescriptions.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-5">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-lg rounded-xl flex items-center justify-center shrink-0 border border-white/20">
                <BrainCircuit size={24} />
              </div>
              <div>
                <h4 className="font-bold text-lg">AI-Driven Insights</h4>
                <p className="text-blue-100/70 text-sm leading-relaxed">Instant pharmacological analysis of scanned medication data.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-5">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-lg rounded-xl flex items-center justify-center shrink-0 border border-white/20">
                <Activity size={24} />
              </div>
              <div>
                <h4 className="font-bold text-lg">User-Friendly Solution</h4>
                <p className="text-blue-100/70 text-sm leading-relaxed">Intuitive interface designed for seamless navigation and ease of use.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-10 border-t border-white/10 flex items-center gap-4">
          <ShieldCheck size={20} className="text-blue-200" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-blue-100">MediLens Copyright © 2025</span>
        </div>
      </div>

      {/* ─── RIGHT SIDE: SIGN UP FORM ─── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-20 relative bg-white">
        
        {/* Mobile Logo Only */}
        <div className="md:hidden mb-10 flex items-center gap-3">
          <Stethoscope className="text-[#007AFF]" size={32} />
          <h1 className="text-2xl font-bold text-slate-900">MediLens</h1>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-10 text-center md:text-left">
            <h3 className="text-3xl font-bold text-slate-900">Create Account</h3>
            <p className="text-slate-500 mt-2 font-medium">Begin your secure medical analysis journey.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input Group: Name */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-600 ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#007AFF] transition-colors" size={18} />
                <input
                  type="text"
                  name="username"
                  placeholder="e.g. Rohan Sharma"
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-14 pr-6 text-slate-900 focus:bg-white focus:border-[#007AFF]/20 focus:ring-4 focus:ring-[#007AFF]/5 outline-none transition-all font-medium"
                  required
                />
              </div>
            </div>

            {/* Input Group: Email */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-600 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#007AFF] transition-colors" size={18} />
                <input
                  type="email"
                  name="email"
                  placeholder="name@gmail.com"
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-14 pr-6 text-slate-900 focus:bg-white focus:border-[#007AFF]/20 focus:ring-4 focus:ring-[#007AFF]/5 outline-none transition-all font-medium"
                  required
                />
              </div>
            </div>

            {/* Input Group: Password */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-600 ml-1">Security Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#007AFF] transition-colors" size={18} />
                <input
                  type="password"
                  name="password"
                  placeholder="Min. 6 characters"
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-14 pr-6 text-slate-900 focus:bg-white focus:border-[#007AFF]/20 focus:ring-4 focus:ring-[#007AFF]/5 outline-none transition-all font-medium"
                  required
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-[#007AFF] text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-200 flex items-center justify-center gap-3 transition-all active:scale-[0.98] group"
            >
              {loading ? <Loader className="animate-spin" /> : <>Complete Registration <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
            </button>
          </form>

          <div className="my-10 flex items-center gap-4">
            <div className="h-[1px] grow bg-slate-100" />
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.1em]">One-Tap Access</span>
            <div className="h-[1px] grow bg-slate-100" />
          </div>

          <div className="flex justify-center">
            <GoogleLogin theme="outline" shape="pill" width="320px" />
          </div>

          <p className="mt-10 text-center text-slate-400 text-sm font-large">
            Already registered?{" "}
            <Link to="/login" className="text-[#007AFF] font-bold hover:underline underline-offset-4">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;