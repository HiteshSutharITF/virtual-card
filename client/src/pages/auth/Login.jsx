import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminLogin, userLogin } from '../../services/auth.service';
import { toast } from 'react-hot-toast';
import { Mail, Lock, Phone, LogIn, ArrowRight, Loader2, QrCode } from 'lucide-react';
import AuthIllustration from '../../components/illustrations/AuthIllustration';

const Login = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    mobile: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (isAdmin) {
        response = await adminLogin({ email: formData.email, password: formData.password });
      } else {
        response = await userLogin({ mobile: formData.mobile, password: formData.password });
      }

      if (response.success) {
        login(response.data, response.data.token);
        toast.success(response.message);
        navigate(isAdmin ? '/admin' : '/user');
      }
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col md:flex-row overflow-hidden">
      {/* Left Side: Hero / Illustration (Fixed) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#4f46e5] relative flex-shrink-0 h-full">
        <div className="absolute top-10 left-10 z-20 flex items-center space-x-3">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
            <QrCode className="text-[#4f46e5] w-7 h-7" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">VirtualCard</span>
        </div>
        <AuthIllustration type="login" />
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 h-full lg:overflow-hidden bg-slate-50/30 overflow-y-auto">
        <div className="min-h-full flex flex-col justify-center items-center py-12 lg:py-0 px-6 sm:px-12 lg:px-24 relative">
          {/* Mobile Logo */}
          <div className="lg:hidden w-full flex justify-center mb-12">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <QrCode size={22} />
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tight">VirtualCard</span>
            </div>
          </div>

          <div className="w-full max-w-md space-y-10 animate-fade-in">
            <div className="space-y-3 text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Hello <span className="text-indigo-600 underline decoration-indigo-100 underline-offset-[6px]">Again.</span>
              </h1>
              <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-sm mx-auto lg:mx-0">
                Access your virtual card manager and track your connections in real-time.
              </p>
            </div>

            <div className="flex p-1.5 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
              <button
                type="button"
                onClick={() => setIsAdmin(false)}
                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.25em] rounded-[1.5rem] transition-all duration-500 ${!isAdmin ? 'bg-indigo-600 text-white shadow-xl scale-100' : 'text-slate-400 hover:text-slate-600 scale-95'
                  }`}
              >
                User Portal
              </button>
              <button
                type="button"
                onClick={() => setIsAdmin(true)}
                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.25em] rounded-[1.5rem] transition-all duration-500 ${isAdmin ? 'bg-indigo-600 text-white shadow-xl scale-100' : 'text-slate-400 hover:text-slate-600 scale-95'
                  }`}
              >
                Admin Area
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {isAdmin ? (
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 ml-1">Admin Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-all duration-300" size={18} />
                    <input
                      type="email"
                      required
                      placeholder="admin@virtualcard.com"
                      className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-14 pr-4 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-bold text-sm shadow-sm"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 ml-1">Mobile Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-all duration-300" size={18} />
                    <input
                      type="text"
                      required
                      placeholder="9876543210"
                      className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-14 pr-4 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-bold text-sm shadow-sm"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400">Security Key</label>
                  <button type="button" className="text-[9px] uppercase font-black text-indigo-500 hover:text-indigo-700 tracking-tighter transition-colors">Forgot Password?</button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-all duration-300" size={18} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-14 pr-4 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-bold text-sm shadow-sm"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-indigo-600 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl shadow-indigo-100 hover:bg-slate-900 transition-all flex items-center justify-center space-x-3 disabled:opacity-50 active:scale-[0.98]"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Enter Workspace</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="pt-8 text-center">
              {!isAdmin && (
                <p className="text-slate-400 text-sm font-semibold tracking-tight">
                  New professional?{' '}
                  <Link to="/register" className="text-indigo-600 font-black hover:underline decoration-indigo-200 underline-offset-8 transition-all">
                    Register Yours Now
                  </Link>
                </p>
              )}
            </div>
          </div>

          {/* <p className="mt-20 text-[10px] font-black uppercase tracking-[0.5em] text-slate-200 whitespace-nowrap">
            SECURE ACCESS PROTOCOL &bull; 2026
          </p> */}
        </div>
      </div>
    </div>
  );
};

export default Login;
