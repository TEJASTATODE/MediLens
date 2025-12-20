import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // High-end animations
import { GoogleLogin } from "@react-oauth/google";
import api from "../services/api";
import { 
  LogIn, Mail, Lock, Loader, ShieldCheck, 
  Stethoscope, ArrowRight, Eye, EyeOff, Sparkles 
} from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", formData);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);
      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden">
      

      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100/50 rounded-full blur-[100px]"
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
        transition={{ duration: 15, repeat: Infinity, delay: 2 }}
        className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-100/50 rounded-full blur-[100px]"
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[460px] relative z-10"
      >
 
        <div className="flex flex-col items-center mb-12">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: -5 }}
            className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[24px] shadow-2xl shadow-blue-200 flex items-center justify-center mb-6 relative"
          >
            <Stethoscope className="text-white" size={36} />
            <motion.div 
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1"
            >
            </motion.div>
          </motion.div>
          
          <h1 className="text-4xl font-[900] text-slate-900 tracking-tight">
            Medi<span className="text-blue-600">Lens</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium tracking-wide">Advanced AI Pharmaceutical Analysis</p>
        </div>

   
        <div className="bg-white/80 backdrop-blur-xl rounded-[48px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-white p-10 md:p-12 relative overflow-hidden">
          
       
          <div className="flex items-center gap-2 mb-10 bg-blue-50/50 px-4 py-2 rounded-2xl border border-blue-100/50 w-fit">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-widest">Secure-user Portal</span>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl mb-8 text-sm font-medium overflow-hidden"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-10 hover:scale-[1.01] transition-transform">
            <GoogleLogin
              onSuccess={() => {}}
              theme="filled_blue"
              shape="pill"
              width="100%"
            />
          </div>

          <div className="relative flex items-center mb-10">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="px-6 text-slate-300 text-[10px] font-black uppercase tracking-[0.3em]">Patient-Login</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

     
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[12px] font-black text-slate-500 uppercase tracking-wider ml-1">Enter your Email</label>
              <div className="relative group">
                <input
                  type="email"
                  name="email"
                  placeholder="doctor@gmail.com"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-[22px] py-5 pl-6 pr-4 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all duration-300"
                  required
                />
                <Mail className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[12px] font-black text-slate-500 uppercase tracking-wider">Password</label>
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-[22px] py-5 pl-6 pr-14 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all duration-300"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-5 rounded-[22px] shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 transition-colors group"
            >
              {loading ? (
                <Loader className="animate-spin" size={22} />
              ) : (
                <>
                  Access Analytics
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          <p className="mt-12 text-center text-slate-400 text-sm font-medium">
            New User?{" "}
            <Link to="/signup" className="text-blue-600 hover:text-indigo-600 font-bold decoration-2 underline-offset-8 hover:underline transition-all">
              Create an Account
            </Link>
          </p>
        </div>
        

        <div className="mt-10 flex items-center justify-center gap-8">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="text-green-500" size={16} />
            <span className="text-sm font-medium">Data Encrypted</span>

        </div>

          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="text-green-500" size={16} />
            <span className="text-sm font-medium">HIPAA Compliant</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;