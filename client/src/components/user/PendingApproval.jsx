import React from 'react';
import { Clock, ShieldAlert, LogOut, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PendingApproval = ({ user }) => {
  const { logout } = useAuth();

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in overflow-y-auto">
      <div className="relative mb-12">
        {/* Decorative Blurs */}
        <div className="absolute -inset-10 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -inset-20 bg-amber-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="relative">
          <div className={`w-32 h-32 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex items-center justify-center ${user?.status === 'rejected' ? 'text-rose-500 ring-8 ring-rose-50' : 'text-amber-500 ring-8 ring-amber-50/50'}`}>
            <Clock size={64} className={user?.status === 'rejected' ? "" : "animate-spin-slow"} />
          </div>
          <div className={`absolute -bottom-2 -right-2 w-12 h-12 ${user?.status === 'rejected' ? 'bg-rose-600' : 'bg-indigo-600'} rounded-2xl flex items-center justify-center text-white shadow-xl border-4 border-white`}>
            {user?.status === 'rejected' ? <ShieldAlert size={20} /> : <ShieldAlert size={20} />}
          </div>
        </div>
      </div>

      <div className="max-w-md space-y-6">
        <div className="space-y-4">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {user?.status === 'rejected' ? (
              <>Account <span className="text-rose-500 underline decoration-rose-200 underline-offset-[8px]">Rejected.</span></>
            ) : (
              <>Approval <span className="text-amber-500 underline decoration-amber-200 underline-offset-[8px]">Pending.</span></>
            )}
          </h2>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">
            {user?.status === 'rejected' 
              ? `Hi ${user?.name}, unfortunately your account application was not successful at this time.`
              : `Hi ${user?.name}, your professional account is currently under review by our administration team.`
            }
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm flex flex-col items-center space-y-6">
          <div className="flex items-start space-x-4 text-left">
            <div className={`w-10 h-10 ${user?.status === 'rejected' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <MessageSquare size={20} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 tracking-tight">
                {user?.status === 'rejected' ? "Rejection Notice" : "Identity Verification"}
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {user?.status === 'rejected'
                  ? "Your account application has been rejected after review. Please contact our support team at info@itfuturz.com for further information or to appeal this decision."
                  : "We are verifying your business details to ensure the security of the Magic QR network. This typically takes 2-24 hours."
                }
              </p>
            </div>
          </div>

          {!user?.status === 'rejected' && (
            <div className="w-full h-1 bg-slate-50 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 w-2/3 animate-shimmer"></div>
            </div>
          )}
        </div>

        <div className="pt-6">
          <button 
            onClick={logout}
            className="inline-flex items-center space-x-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200"
          >
            <LogOut size={16} />
            <span>Sign Out From Card</span>
          </button>
        </div>
      </div>

      <p className="mt-12 text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">
        SECURITY PROTOCOL &bull; LEVEL 2 REVIEW
      </p>
    </div>
  );
};

export default PendingApproval;
