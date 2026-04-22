import React from 'react';

const AuthIllustration = ({ type = 'login' }) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-12 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      {/* Illustration Composition */}
      <div className="relative z-10 w-full max-w-md">
        {type === 'login' ? (
          <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="200" cy="200" r="160" stroke="#818cf8" strokeWidth="2" strokeDasharray="8 8" opacity="0.3" />
            <circle cx="200" cy="200" r="120" stroke="#818cf8" strokeWidth="2" strokeDasharray="12 4" opacity="0.5" />
            
            {/* Central Node */}
            <rect x="160" y="140" width="80" height="120" rx="20" fill="white" shadow="0 10 30 rgba(0,0,0,0.1)" />
            <rect x="175" y="160" width="50" height="50" rx="12" fill="#4f46e5" />
            <path d="M190 185L200 195L215 180" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Orbiting Elements */}
            <g className="animate-bounce" style={{ animationDuration: '3s' }}>
              <circle cx="80" cy="200" r="20" fill="white" fillOpacity="0.1" stroke="white" strokeWidth="1" />
              <path d="M75 200H85M80 195V205" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </g>
            
            <g className="animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }}>
              <circle cx="320" cy="150" r="25" fill="white" fillOpacity="0.1" stroke="white" strokeWidth="1" />
              <rect x="310" y="140" width="20" height="20" rx="4" fill="white" fillOpacity="0.2" />
            </g>

            {/* Connecting Lines */}
            <path d="M240 200L320 150" stroke="white" strokeWidth="1" strokeDasharray="4 4" opacity="0.2" />
            <path d="M160 200L80 200" stroke="white" strokeWidth="1" strokeDasharray="4 4" opacity="0.2" />
          </svg>
        ) : (
          <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 200C50 117.157 117.157 50 200 50C282.843 50 350 117.157 350 200C350 282.843 282.843 350 200 350C117.157 350 50 282.843 50 200Z" stroke="white" strokeOpacity="0.1" strokeWidth="2" />
            
            {/* User Cards Composition */}
            <g transform="translate(140, 120)">
              <rect width="120" height="160" rx="24" fill="white" fillOpacity="0.05" stroke="white" strokeOpacity="0.1" />
              <rect x="20" y="20" width="40" height="40" rx="12" fill="#818cf8" fillOpacity="0.3" />
              <rect x="20" y="80" width="80" height="8" rx="4" fill="white" fillOpacity="0.2" />
              <rect x="20" y="100" width="60" height="8" rx="4" fill="white" fillOpacity="0.1" />
            </g>
            
            <g transform="translate(180, 160)" className="animate-fade-in shadow-2xl">
              <rect width="120" height="160" rx="24" fill="white" stroke="#e2e8f0" strokeWidth="1" />
              <rect x="20" y="20" width="40" height="40" rx="12" fill="#4f46e5" />
              <rect x="20" y="80" width="80" height="8" rx="4" fill="#f1f5f9" />
              <rect x="20" y="100" width="60" height="8" rx="4" fill="#f1f5f9" />
              <circle cx="40" cy="40" r="8" fill="white" fillOpacity="0.2" />
            </g>
            
            {/* Action Element */}
            <g transform="translate(260, 260)" className="animate-pulse">
              <circle r="30" fill="#4f46e5" />
              <path d="M-10 0H10M0 -10V10" stroke="white" strokeWidth="4" strokeLinecap="round" />
            </g>
          </svg>
        )}
      </div>

      {/* Floating Info */}
      <div className="absolute bottom-12 left-12 right-12">
        <div className="glass-dark rounded-3xl p-6 border-white/5 backdrop-blur-3xl shadow-2xl">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#818cf8]">Network Shield Active</p>
          </div>
          <h4 className="text-white font-bold mb-1">Instant vCard Exchange</h4>
          <p className="text-white/40 text-xs font-medium leading-relaxed">
            Revolutionizing the way professionals connect through zero-friction QR automated workflows.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthIllustration;
