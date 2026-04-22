import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminLogin, userLogin } from '../../services/auth.service';
import { toast } from 'react-hot-toast';
import { Mail, Lock, Phone, User, LogIn, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-main flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="glass rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-8 pb-4">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/30 shadow-inner">
                <LogIn className="text-white w-8 h-8" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center text-white mb-2">Welcome Back</h1>
            <p className="text-indigo-100 text-center text-sm mb-8">
              Sign in to manage your virtual card and contacts
            </p>

            <div className="flex p-1 bg-white/10 rounded-xl mb-8">
              <button
                onClick={() => setIsAdmin(false)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  !isAdmin ? 'bg-white text-indigo-600 shadow-lg' : 'text-white hover:bg-white/10'
                }`}
              >
                User Login
              </button>
              <button
                onClick={() => setIsAdmin(true)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  isAdmin ? 'bg-white text-indigo-600 shadow-lg' : 'text-white hover:bg-white/10'
                }`}
              >
                Admin Login
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isAdmin ? (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-indigo-100 ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white transition-colors" size={18} />
                    <input
                      type="email"
                      required
                      placeholder="admin@example.com"
                      className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all font-medium"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-indigo-100 ml-1">Mobile Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white transition-colors" size={18} />
                    <input
                      type="text"
                      required
                      placeholder="9876543210"
                      className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all font-medium"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-indigo-100 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white transition-colors" size={18} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all font-medium"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-premium bg-white text-indigo-600 font-bold py-4 rounded-xl shadow-xl hover:shadow-2xl hover:bg-white/95 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 mt-4 disabled:opacity-70"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
          </div>
          
          {!isAdmin && (
            <div className="p-8 pt-0 mt-4 text-center">
              <p className="text-indigo-100 text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="text-white font-bold hover:underline decoration-white/30 underline-offset-4">
                  Register here
                </Link>
              </p>
            </div>
          )}
        </div>
        
        <p className="text-center text-white/40 text-xs mt-8 font-medium tracking-wider">
          VIRTUAL CARD PROJECT &bull; 2026
        </p>
      </div>
    </div>
  );
};

export default Login;
