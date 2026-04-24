import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden font-outfit">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,rgba(15,23,42,0.8)_100%)] z-1"></div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl animate-fade-in">
        {/* 404 Text with Gradient and Shadow */}
        <div className="relative group">
          <h1 className="text-[10rem] md:text-[14rem] font-black leading-none tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white/80 to-white/10 select-none transition-transform duration-500 group-hover:scale-105">
            404
          </h1>
          <div className="absolute -inset-1 bg-white/20 blur-3xl rounded-full -z-10 group-hover:bg-white/30 transition-all duration-500"></div>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            Oops! Lost in Space?
          </h2>
          <p className="text-slate-400 text-lg md:text-xl max-w-md mx-auto leading-relaxed">
            The page you're looking for has vanished into the digital void or never existed in the first place.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="group relative px-8 py-4 bg-white text-slate-950 font-bold rounded-2xl flex items-center gap-3 transition-all duration-300 hover:bg-slate-100 hover:scale-105 hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.4)]"
          >
            <Home className="w-5 h-5 transition-transform group-hover:rotate-12" />
            <span>Go Back Home</span>
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-2xl flex items-center gap-3 backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:border-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Previous Page</span>
          </button>
        </div>

        {/* Footer Detail */}
        <div className="mt-16 pt-8 border-t border-white/5 w-full flex justify-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} Virtual Card Platform. All rights reserved.</p>
        </div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
    </div>
  );
};

export default NotFound;
