import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Pill, AlertCircle, X, History, User, 
  ChevronLeft, Loader2, Save, Trash2, ArrowRight, 
  RefreshCcw, Zap, Info, ShieldCheck, Microscope,
  Maximize, Scan, Sparkles, HandMetal, Lightbulb
} from 'lucide-react';

const Detection = () => {
    const navigate = useNavigate();
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null); 
    const [error, setError] = useState(null);
    const [isFlashActive, setIsFlashActive] = useState(false);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    const API_NODE = "http://localhost:5000/api/history";
    const API_PYTHON = "http://localhost:8000/analyze";

    const startCamera = async () => {
        setError(null);
        try {
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
            
            // OPTIMIZED: High resolution (4K ideal) and wider aspect ratio for mobile
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: "environment", 
                    width: { ideal: 3840 }, 
                    height: { ideal: 2160 },
                    aspectRatio: { ideal: 1.777 } // 16:9 for wider view
                }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) { setError("Camera hardware not detected or permission denied."); }
    };

    useEffect(() => {
        if (!image) startCamera();
        return () => streamRef.current?.getTracks().forEach(t => t.stop());
    }, [image]);

    const capturePhoto = () => {
        setIsFlashActive(true);
        setTimeout(() => setIsFlashActive(false), 150);

        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        // OPTIMIZED: Capture at full hardware resolution
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        // Apply slight sharpening filter for OCR
        ctx.filter = 'contrast(1.1) brightness(1.05)';
        ctx.drawImage(video, 0, 0);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 1.0); // Max quality
        setImage(dataUrl);
        streamRef.current?.getTracks().forEach(t => t.stop());
    };

    const analyzeAndSave = async () => {
        if (!image) return;
        setLoading(true);
        setError(null);

        try {
            const base64Res = await fetch(image);
            const blob = await base64Res.blob();
            const formData = new FormData();
            formData.append('file', blob, 'scan.jpg');

            const aiRes = await axios.post(API_PYTHON, formData);

            if (aiRes.data.success) {
                let rawAnalysis = aiRes.data.gemini_analysis;
                const cleanJson = rawAnalysis.replace(/```json|```/g, "").trim();
                const parsedAnalysis = JSON.parse(cleanJson);
                
                setResult(parsedAnalysis);

                const token = localStorage.getItem('token');
                await axios.post(`${API_NODE}/save`, { ...parsedAnalysis, image }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        } catch (err) {
            setError("Vision AI failed to interpret the text. Ensure lighting is sufficient.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFDFF] font-sans antialiased text-slate-900 overflow-hidden">
            <header className="fixed top-0 left-0 right-0 z-[60] bg-white/70 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <motion.button 
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/profile')}
                            className="p-2.5 hover:bg-slate-50 rounded-2xl transition-all"
                        >
                            <ChevronLeft size={24} className="text-slate-600" />
                        </motion.button>
                        <div className="h-8 w-[1px] bg-slate-200 mx-2" />
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
                                <Scan size={20} />
                            </div>
                            <h1 className="text-lg font-black tracking-tight">MediLens <span className="text-blue-600">Pro</span></h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="pt-24 pb-8 px-4 max-w-7xl mx-auto h-screen flex flex-col lg:flex-row gap-6">
                
                {/* ─── LEFT: CAMERA INTERFACE (Enhanced Resolution/View) ─── */}
                <div className="w-full lg:w-1/2 xl:w-[60%] relative flex flex-col min-h-[400px]">
                    <div className="relative flex-1 bg-slate-900 rounded-[32px] md:rounded-[40px] overflow-hidden shadow-2xl border-4 md:border-[8px] border-white ring-1 ring-slate-200 group">
                        
                        <AnimatePresence mode="wait">
                            {!image ? (
                                <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative h-full w-full">
                                    <video ref={videoRef} className="w-full h-full object-cover md:object-contain bg-black" autoPlay muted playsInline />
                                    
                                    {/* Flash Effect */}
                                    <AnimatePresence>
                                        {isFlashActive && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white z-50" />
                                        )}
                                    </AnimatePresence>

                                    {/* --- REMARKS / STABILITY OVERLAY --- */}
                                    <div className="absolute top-6 left-6 right-6 flex flex-col gap-2 pointer-events-none">
                                        <motion.div 
                                            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                                            className="bg-black/40 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 flex items-center gap-3"
                                        >
                                            <HandMetal size={18} className="text-yellow-400" />
                                            <p className="text-white text-[11px] font-bold uppercase tracking-wider">Keep hands stable for sharp OCR</p>
                                        </motion.div>
                                        <motion.div 
                                            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                                            className="bg-black/40 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 flex items-center gap-3"
                                        >
                                            <Lightbulb size={18} className="text-blue-400" />
                                            <p className="text-white text-[11px] font-bold uppercase tracking-wider">Clean strip & avoid glares</p>
                                        </motion.div>
                                    </div>

                                    {/* HUD Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="relative w-72 h-48 md:w-[400px] md:h-64 border-2 border-white/20 rounded-[32px]">
                                            <div className="absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-[24px]" />
                                            <div className="absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 border-blue-500 rounded-tr-[24px]" />
                                            <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 border-blue-500 rounded-bl-[24px]" />
                                            <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-[24px]" />
                                            
                                            <motion.div 
                                                animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.4, 0.2] }}
                                                transition={{ duration: 3, repeat: Infinity }}
                                                className="absolute inset-0 bg-blue-500/5 rounded-[30px]"
                                            />
                                        </div>
                                    </div>

                                    {/* Capture Button */}
                                    <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center">
                                        <motion.button 
                                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                            onClick={capturePhoto}
                                            className="w-20 h-20 bg-white rounded-full p-1.5 shadow-2xl transition-all"
                                        >
                                            <div className="w-full h-full rounded-full border-4 border-slate-900 flex items-center justify-center">
                                                <div className="w-12 h-12 bg-slate-900 rounded-full" />
                                            </div>
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative h-full w-full bg-black">
                                    <img src={image} className="w-full h-full object-contain" alt="Captured" />
                                    <div className="absolute top-6 right-6">
                                        <button 
                                            onClick={() => { setImage(null); setResult(null); }}
                                            className="bg-white p-4 rounded-2xl text-slate-800 shadow-xl hover:bg-rose-500 hover:text-white transition-all border border-white"
                                        >
                                            <RefreshCcw size={20} />
                                        </button>
                                    </div>

                                    {!result && !loading && (
                                        <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="absolute bottom-8 left-8 right-8">
                                            <button 
                                                onClick={analyzeAndSave}
                                                className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-widest text-xs shadow-2xl flex items-center justify-center gap-3"
                                            >
                                                <Sparkles size={20} /> Analyze Clear Image
                                            </button>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ─── RIGHT: DIAGNOSTIC REPORT (Condensed for Mobile) ─── */}
                <div className="w-full lg:w-1/2 xl:w-[40%] flex flex-col overflow-hidden">
                    <div className="bg-white rounded-[32px] md:rounded-[44px] p-6 md:p-8 border border-slate-100 shadow-xl flex-1 overflow-y-auto scrollbar-hide">
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center text-center py-12">
                                    <Loader2 className="animate-spin text-blue-600 mb-6" size={48} />
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">AI Processing...</h3>
                                    <p className="text-slate-400 mt-2 text-xs font-bold uppercase tracking-widest">Identifying chemical compounds</p>
                                </motion.div>
                            ) : result ? (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <div className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[9px] font-black uppercase border border-green-100 flex items-center gap-1.5">
                                            <ShieldCheck size={12} /> High Accuracy
                                        </div>
                                    </div>

                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-1">{result.medicineName}</h2>
                                        <p className="text-blue-600 font-bold text-xs uppercase tracking-widest">{result.manufacturer || "Certified Product"}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Dosage</span>
                                            <div className="text-xs font-black text-slate-900">{result.dosage}</div>
                                        </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Side Effects</span>
                                        <div className="text-xs font-black text-slate-900">{result.side_effects}</div>
                                    </div>
                                    </div>
 
                                    <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                        <h4 className="text-[10px] font-black uppercase text-slate-900 mb-2">Molecular Build</h4>
                                        <p className="text-xs text-slate-600 leading-relaxed">{result.composition}</p>
                                    </div>

                                    <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl">
                                        <h4 className="text-[10px] font-black uppercase text-rose-800 mb-2">Warning</h4>
                                        <p className="text-[11px] font-bold text-rose-700 leading-relaxed italic">{result.warning}</p>
                                    </div>

                                    <button 
                                        onClick={() => navigate('/profile')}
                                        className="w-full py-5 bg-slate-900 text-white rounded-[20px] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3"
                                    >
                                        Save To History <ArrowRight size={16} />
                                    </button>
                                </motion.div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                                        <Camera className="text-slate-300" size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 uppercase">Awaiting Scan</h3>
                                        <p className="text-slate-400 mt-2 text-xs font-medium">Please align medicine strip within the blue guide for AI extraction.</p>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export default Detection;