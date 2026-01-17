import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Pill, AlertCircle, X, History, User, 
  ChevronLeft, Loader2, Save, Trash2, ArrowRight, 
  RefreshCcw, Zap, Info, ShieldCheck, Microscope,
  Maximize, Scan, Sparkles, HandMetal, Lightbulb,
  Stethoscope, Activity, Thermometer
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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

    const API_NODE = "https://d2mjyalgrqdo8v.cloudfront.net/api/history";
    const API_PYTHON = "https://hossie449-medilens.hf.space/analyze";

    const startCamera = async () => {
        setError(null);
        try {
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
            
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: "environment", 
                    width: { ideal: 1920 }, 
                    height: { ideal: 1080 },
                }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) { setError("Camera hardware not detected."); }
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
        const scale = video.videoWidth / video.offsetWidth;
        const scanWidth = 400 * scale; 
        const scanHeight = 250 * scale;
        const startX = (video.videoWidth - scanWidth) / 2;
        const startY = (video.videoHeight - scanHeight) / 2;

        canvas.width = scanWidth;
        canvas.height = scanHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.filter = 'contrast(1.1) brightness(1.02) saturate(1.1)';
        ctx.drawImage(video, startX, startY, scanWidth, scanHeight, 0, 0, scanWidth, scanHeight);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
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
            setError("Analysis failed. Please try again with better lighting.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased text-slate-900">
            <header className="fixed top-0 left-0 right-0 z-[60] bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <motion.button 
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/profile')}
                            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            <ChevronLeft size={20} className="text-slate-600" />
                        </motion.button>
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                                <Scan size={18} />
                            </div>
                            <h1 className="text-md font-bold tracking-tight text-slate-800">MediLens <span className="text-blue-600">Analyser</span></h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="pt-24 pb-8 px-4 max-w-7xl mx-auto h-[calc(100vh-20px)] flex flex-col lg:flex-row gap-6">

                <div className="w-full lg:w-[55%] relative flex flex-col">
                    <div className="relative flex-1 bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white ring-1 ring-slate-200">
                        <AnimatePresence mode="wait">
                            {!image ? (
                                <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative h-full w-full">
                                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                                    
                              
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="relative w-[320px] h-[200px] md:w-[450px] md:h-[280px]">
                                    
                                            <div className="absolute -top-2 -left-2 w-10 h-10 border-t-4 border-l-4 border-blue-500 rounded-tl-xl" />
                                            <div className="absolute -top-2 -right-2 w-10 h-10 border-t-4 border-r-4 border-blue-500 rounded-tr-xl" />
                                            <div className="absolute -bottom-2 -left-2 w-10 h-10 border-b-4 border-l-4 border-blue-500 rounded-bl-xl" />
                                            <div className="absolute -bottom-2 -right-2 w-10 h-10 border-b-4 border-r-4 border-blue-500 rounded-br-xl" />
                                 
                                            <motion.div 
                                                animate={{ top: ['0%', '100%', '0%'] }}
                                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                                className="absolute left-0 right-0 h-0.5 bg-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.5)] z-10"
                                            />
                                        </div>
                                    </div>

                                    <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2">
                                        <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-2">
                                            <Lightbulb size={14} className="text-yellow-400" />
                                            <p className="text-white text-[10px] font-bold uppercase tracking-wider">Center Medicine Strip</p>
                                        </div>
                                    </div>

                                    <div className="absolute bottom-10 left-0 right-0 flex justify-center">
                                        <motion.button 
                                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
                                            onClick={capturePhoto}
                                            className="group relative"
                                        >
                                            <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                                            <div className="relative w-20 h-20 bg-white rounded-full p-1 shadow-2xl">
                                                <div className="w-full h-full rounded-full border-[3px] border-slate-900 flex items-center justify-center">
                                                    <div className="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center text-white">
                                                        <Camera size={24} />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative h-full w-full bg-slate-900 flex items-center justify-center">
                                    <img src={image} className="max-w-[90%] max-h-[80%] rounded-2xl shadow-2xl border-4 border-white/10" alt="Captured" />
                                    
                                    <div className="absolute top-6 right-6 flex gap-3">
                                        <button 
                                            onClick={() => { setImage(null); setResult(null); }}
                                            className="bg-white/10 backdrop-blur-md p-3 rounded-2xl text-white hover:bg-rose-500 transition-all border border-white/20"
                                        >
                                            <RefreshCcw size={20} />
                                        </button>
                                    </div>

                                    {!result && !loading && (
                                        <div className="absolute bottom-8 left-8 right-8">
                                            <button 
                                                onClick={analyzeAndSave}
                                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-3 transition-all"
                                            >
                                                <Sparkles size={18} /> Confirm & Analyze
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="w-full lg:w-[45%] flex flex-col">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-xl flex-1 flex flex-col overflow-hidden">
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                                    <div className="relative mb-8">
                                        <Loader2 className="animate-spin text-blue-600" size={64} strokeWidth={1} />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Microscope size={24} className="text-blue-400" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">Decoding Composition</h3>
                                    <p className="text-slate-500 mt-2 text-sm max-w-[240px]">Our Engine is cross-referencing chemical compounds...</p>
                                </motion.div>
                            ) : result ? (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                        
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold uppercase mb-3 border border-green-100">
                                                <ShieldCheck size={12} /> Verified Analysis
                                            </div>
                                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">{result.medicineName}</h2>
                                            <p className="text-blue-600 font-semibold text-xs mt-2 uppercase tracking-widest">{result.manufacturer}</p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-2xl">
                                            <Pill className="text-blue-600" size={28} />
                                        </div>
                                    </div>

                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                                            <div className="flex items-center gap-2 mb-2 text-blue-700">
                                                <Activity size={16} />
                                                <span className="text-[10px] font-bold uppercase">Usage</span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-700 leading-snug"><ReactMarkdown>{result.usage}</ReactMarkdown></p>
                                        </div>
                                        <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100/50">
                                            <div className="flex items-center gap-2 mb-2 text-purple-700">
                                                <Thermometer size={16} />
                                                <span className="text-[10px] font-bold uppercase">Dosage</span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-700 leading-snug">{result.dosage}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Stethoscope size={14} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Medical Build</span>
                                        </div>
                                        <div className="p-5 bg-slate-50 rounded-2xl text-xs text-slate-600 leading-relaxed border border-slate-100">
                                            {result.composition}
                                        </div>
                                    </div>

                                    <div className="relative group overflow-hidden">
                                        <div className="absolute inset-0 bg-rose-500/5 group-hover:bg-rose-500/10 transition-colors" />
                                        <div className="relative p-5 border-l-4 border-rose-500 bg-rose-50/30 rounded-r-2xl">
                                            <div className="flex items-center gap-2 text-rose-700 mb-2">
                                                <AlertCircle size={16} />
                                                <span className="text-[10px] font-black uppercase">Contraindications</span>
                                            </div>
                                            <p className="text-[11px] font-bold text-rose-800 leading-relaxed italic">{result.warning}</p>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => navigate('/profile')}
                                        className="w-full mt-4 group relative py-4 bg-slate-900 text-white rounded-2xl overflow-hidden transition-all active:scale-[0.98]"
                                    >
                                        <div className="relative z-10 flex items-center justify-center gap-3">
                                            <span className="text-xs font-bold uppercase tracking-widest">Save to Digital Health Profile</span>
                                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </button>
                                </motion.div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                                        <Scan className="text-slate-300" size={40} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">Scanner Ready</h3>
                                    <p className="text-slate-400 mt-2 text-sm max-w-[200px]">Align the medication strip and capture proper image for AI analysis.</p>
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