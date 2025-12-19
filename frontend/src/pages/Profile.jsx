import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  History, Trash2, ShieldCheck, Edit3, X, Save, Plus, RefreshCw, 
  ChevronRight, Pill, UserCircle, ShoppingCart, MapPin, Info, Search,
  ArrowUpRight, Microscope, Zap, Database, Mail, Activity, LayoutGrid,
  LogOut // Added LogOut icon
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedScan, setSelectedScan] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : {};
  });
  const [newUsername, setNewUsername] = useState(user.username || "");

  const categories = ["All", "Verified", "Recent", "Chemicals"];

  // --- LOGOUT LOGIC ---
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/history"); 
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const filteredHistory = history.filter((scan) => {
    const matchesSearch = scan.medicineName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          scan.composition?.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeCategory === "All") return matchesSearch;
    if (activeCategory === "Verified") return matchesSearch && scan.usage;
    return matchesSearch;
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put("/auth/update-profile", { username: newUsername });
      const updatedUser = { ...user, username: res.data.username };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  const deleteRecord = async (id) => {
    if (!window.confirm("Archiving: Confirm removal of this clinical record?")) return;
    try {
      await api.delete(`/history/${id}`);
      setHistory(prev => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const avatarUrl = user.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${user.username || 'U'}&backgroundColor=0066FF&textColor=ffffff`;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-[#F8FAFC] p-4 md:p-12 pt-28 font-sans selection:bg-blue-100"
    >
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-400/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-indigo-400/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto space-y-12">
        
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <motion.div 
            initial={{ x: -30, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }}
            className="lg:col-span-3 bg-white rounded-[44px] p-8 md:p-10 flex flex-col md:flex-row items-center gap-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-200/50 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[100px] -z-0" />
            <div className="relative group z-10">
              <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" />
              <img src={avatarUrl} alt="User" className="relative w-32 h-32 md:w-40 md:h-40 rounded-[48px] object-cover border-4 border-white shadow-2xl bg-slate-50 transition-transform duration-500 group-hover:scale-[1.02]" />
              <div className="absolute -bottom-2 -right-2 bg-blue-600 p-2.5 rounded-2xl shadow-lg ring-4 ring-white">
                <ShieldCheck size={20} className="text-white" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-6 z-10">
              <div className="space-y-2">
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">{user.username}</h1>
                  <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                    <Edit3 size={18} />
                  </button>
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-500 font-medium text-sm">
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                    <Mail size={14} className="text-blue-500" /> {user.email}
                  </div>
                  <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100 text-green-700">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                    User Access Active
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <button onClick={() => navigate("/scan")} className="bg-slate-900 text-white px-8 py-4 rounded-[22px] font-black uppercase tracking-widest text-[11px] flex items-center gap-3 hover:bg-blue-600 transition-all shadow-xl shadow-slate-200">
                  <Plus size={18} /> Launch Analysis
                </button>
                {/* --- LOGOUT BUTTON ADDED HERE --- */}
                <button onClick={handleLogout} className="bg-white text-rose-600 border border-rose-100 px-8 py-4 rounded-[22px] font-black uppercase tracking-widest text-[11px] flex items-center gap-3 hover:bg-rose-50 transition-all">
                  <LogOut size={18} /> End Session
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            className="bg-blue-600 rounded-[44px] p-8 text-white flex flex-col justify-between shadow-xl shadow-blue-100 relative overflow-hidden group"
          >
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <Database className="text-blue-200" size={28} />
                <Activity className="text-blue-300 opacity-50 group-hover:opacity-100 transition-opacity" size={20} />
              </div>
              <h3 className="text-blue-100 font-bold uppercase tracking-[0.2em] text-[10px] mt-6">Medicinal Records</h3>
              <p className="text-6xl font-black mt-2 leading-none">{history.length}</p>
            </div>
            <div className="relative z-10 mt-6 pt-6 border-t border-white/10">
              <p className="text-[10px] font-medium text-blue-100/80 leading-relaxed uppercase tracking-wider">Verified via Med-AI Engine</p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-3xl transition-transform group-hover:scale-150 duration-700" />
          </motion.div>
        </section>

        {/* ... (rest of the component remains exactly the same) */}
        
        {/* --- CLINICAL ARCHIVE SECTION --- */}
        <div className="space-y-10 pt-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-slate-900 p-2.5 rounded-xl"><History size={20} className="text-white" /></div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Medicine Records</h2>
              </div>
              <div className="flex gap-2">
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      activeCategory === cat 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                      : "bg-white text-slate-400 border border-slate-200 hover:border-blue-400"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative group w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
              <input 
                type="text"
                placeholder="Search compounds or drugs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border-2 border-slate-100 rounded-[22px] py-4 pl-12 pr-12 text-slate-700 font-bold focus:border-blue-500 outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-[400px] bg-white rounded-[44px] animate-pulse border border-slate-100" />
                ))}
              </div>
            ) : filteredHistory.length > 0 ? (
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredHistory.map((scan, index) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
                    key={scan._id} 
                    className="group relative bg-white border border-slate-200/50 rounded-[44px] p-4 pb-8 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-500 flex flex-col h-full overflow-hidden"
                  >
                    <div className="relative h-56 rounded-[32px] overflow-hidden mb-6 shadow-inner bg-slate-50">
                      <img src={scan.image} alt={scan.medicineName} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[1.5s] ease-out" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-800 border border-white">
                        Med-ID: {scan._id.slice(-5)}
                      </div>
                      <button onClick={() => deleteRecord(scan._id)} className="absolute top-4 right-4 p-2.5 bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-rose-500 hover:text-white rounded-2xl transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div className="px-4 flex-1 flex flex-col relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-blue-50 text-blue-600 text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border border-blue-100/50">
                          {scan.composition?.split(' ')[0] || "Verified"}
                        </span>
                        <div className="h-1 w-1 bg-slate-300 rounded-full" />
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(scan.createdAt).toLocaleDateString()}</span>
                      </div>

                      <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-blue-600 transition-colors duration-300 mb-3">
                        {scan.medicineName}
                      </h3>
                      
                      <p className="text-slate-500 text-sm leading-relaxed font-medium line-clamp-2 mb-6 h-10">
                        {scan.usage || "Clinical records verified. Awaiting further indexing for usage details."}
                      </p>
                      
                      <div className="mt-auto flex items-center justify-between">
                        <button 
                          onClick={() => setSelectedScan(scan)} 
                          className="w-full bg-slate-50 text-slate-900 group-hover:bg-blue-600 group-hover:text-white py-4 rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                          View Report <ArrowUpRight size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32 bg-white rounded-[48px] border-2 border-dashed border-slate-200 flex flex-col items-center">
                <LayoutGrid className="text-slate-200 mb-4" size={48} />
                <h3 className="text-2xl font-black text-slate-900">No records found</h3>
                <p className="text-slate-500 mt-2 font-medium mb-8">Try adjusting your filters or performing a fresh scan.</p>
                <button onClick={() => {setSearchQuery(""); setActiveCategory("All")}} className="text-blue-600 font-black uppercase tracking-widest text-[11px] hover:underline">Clear all filters</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- CLINICAL DETAILS MODAL --- */}
      <AnimatePresence>
        {selectedScan && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[110]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedScan(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ y: 100, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 100, opacity: 0, scale: 0.95 }} className="bg-white rounded-[48px] w-full max-w-2xl max-h-[85vh] overflow-hidden relative z-10 shadow-3xl border border-slate-100 flex flex-col">
              <div className="p-8 pb-4 flex justify-between items-start bg-white z-20 sticky top-0">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="bg-blue-100 text-blue-700 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Clinical Analysis</span>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Record #{selectedScan._id.slice(-8)}</span>
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">{selectedScan.medicineName}</h2>
                </div>
                <button onClick={() => setSelectedScan(null)} className="p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400"><X size={24} /></button>
              </div>
              
              <div className="overflow-y-auto p-8 pt-4 space-y-8 scrollbar-hide">
                <div className="relative h-72 w-full rounded-[36px] overflow-hidden bg-slate-50 border border-slate-100 p-4">
                  <img src={selectedScan.image} className="w-full h-full object-contain" alt="scan" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex flex-col justify-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Compound Structure</span>
                    <p className="text-lg font-bold text-slate-800">{selectedScan.composition}</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex flex-col justify-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Manufracturer</span>
                    <p className="text-lg font-bold text-slate-800">{selectedScan.manufacturer || "Certified Producer"}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-6 items-start p-6 rounded-[32px] bg-green-50/50 border border-green-100/50">
                    <div className="bg-green-100 p-4 rounded-2xl shadow-sm"><Info className="text-green-600" size={24}/></div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 mb-2 tracking-tight">Clinical Usage</h4>
                      <p className="text-slate-600 leading-relaxed font-medium">{selectedScan.usage}</p>
                      <div className="mt-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-700 bg-white px-4 py-2 rounded-xl shadow-sm border border-green-100">
                        Prescribed Dosage: {selectedScan.dosage}
                      </div>
                    </div>
                  </div>

                  {selectedScan.alternatives?.length > 0 && (
                    <div className="flex gap-6 items-start p-6 rounded-[32px] bg-indigo-50/50 border border-indigo-100/50">
                      <div className="bg-indigo-100 p-4 rounded-2xl shadow-sm"><Pill className="text-indigo-600" size={24}/></div>
                      <div>
                        <h4 className="text-lg font-black text-slate-900 mb-3 tracking-tight">Bio-Equivalent Medicine</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedScan.alternatives.map((alt, i) => (
                            <span key={i} className="bg-white border border-indigo-100 text-slate-700 text-[10px] font-bold px-4 py-2 rounded-xl shadow-sm uppercase">
                              {alt}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 pb-8">
                  <button className="flex items-center justify-center gap-3 bg-slate-900 text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all shadow-xl shadow-slate-200">
                    <MapPin size={18} /> Nearby Stores
                  </button>
                  <a href={`https://www.google.com/search?q=buy+${selectedScan.medicineName}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 bg-blue-50 text-blue-700 border border-blue-100 py-5 rounded-[24px] font-black uppercase tracking-widest text-[10px] hover:bg-blue-100 transition-all">
                    <ShoppingCart size={18} /> Buy Online
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- EDIT IDENTITY MODAL --- */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[100]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditing(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white p-10 rounded-[44px] w-full max-w-sm relative z-10 shadow-3xl border border-slate-100">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Edit Profile</h2>
                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-all"><X size={24} /></button>
              </div>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Change Username</label>
                  <div className="relative">
                    <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-900 focus:border-blue-500 outline-none transition-all font-bold" />
                  </div>
                </div>
                <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[22px] font-black uppercase tracking-widest text-[11px] hover:bg-blue-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200">
                  <Save size={18} /> Confirm Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Profile;