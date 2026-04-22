import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../services/auth.service';
import { toast } from 'react-hot-toast';
import { User, Phone, Briefcase, Lock, FileText, UserPlus, ArrowLeft } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    businessName: '',
    password: '',
    customMessage: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(false); // Should be true, but following my standard pattern

    try {
      setLoading(true);
      const response = await registerUser(formData);
      if (response.success) {
        toast.success(response.message);
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl shadow-indigo-100 overflow-hidden border border-slate-100 animate-fade-in">
        <div className="flex flex-col md:flex-row h-full">
          {/* Left Decorative Sidebar */}
          <div className="md:w-1/3 bg-gradient-main p-8 flex flex-col justify-between text-white">
            <div>
              <Link to="/login" className="p-2 bg-white/20 rounded-xl inline-flex items-center justify-center mb-12 hover:bg-white/30 transition-all">
                <ArrowLeft size={20} />
              </Link>
              <h2 className="text-3xl font-bold mb-4">Join Us.</h2>
              <p className="text-indigo-100 text-sm leading-relaxed">
                Start sharing your contact information seamlessly with the world.
              </p>
            </div>
            <div className="mt-12 hidden md:block">
              <div className="w-12 h-1 bg-white/30 rounded-full mb-2"></div>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-50">Virtual Card v1.0</p>
            </div>
          </div>

          {/* Right Form Area */}
          <div className="md:w-2/3 p-8 md:p-12">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <UserPlus size={24} />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">Create Account</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <InputGroup icon={<User size={18} />} label="Full Name" type="text" placeholder="John Doe" value={formData.name} onChange={(val) => setFormData({ ...formData, name: val })} />
              <InputGroup icon={<Phone size={18} />} label="Mobile Number" type="text" placeholder="9876543210" value={formData.mobile} onChange={(val) => setFormData({ ...formData, mobile: val })} />
              <InputGroup icon={<Briefcase size={18} />} label="Business Name" type="text" placeholder="Acme Corp" value={formData.businessName} onChange={(val) => setFormData({ ...formData, businessName: val })} />
              <InputGroup icon={<Lock size={18} />} label="Password" type="password" placeholder="••••••••" value={formData.password} onChange={(val) => setFormData({ ...formData, password: val })} />
              
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 ml-1 flex items-center">
                  <FileText size={12} className="mr-1" /> Custom Welcome Message
                </label>
                <textarea
                  placeholder="Hi {name}! Thanks for connecting..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[100px] text-sm resize-none"
                  value={formData.customMessage}
                  onChange={(e) => setFormData({ ...formData, customMessage: e.target.value })}
                ></textarea>
                <p className="text-[10px] text-indigo-500 font-medium ml-1 flex items-center">
                  <span>Tip: Use <b>{"{name}"}</b> to greet scanners by their WhatsApp name.</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-premium bg-gradient-main text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-100 hover:shadow-indigo-200 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2 mt-4 disabled:opacity-70"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Create My Account</span>
                  </>
                )}
              </button>
            </form>
            
            <p className="text-center text-slate-500 text-sm mt-8">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 font-bold hover:underline decoration-indigo-200 underline-offset-4">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputGroup = ({ icon, label, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 ml-1 flex items-center">
      {React.cloneElement(icon, { size: 12, className: 'mr-1' })} {label}
    </label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
        {icon}
      </div>
      <input
        {...props}
        required
        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
        onChange={(e) => props.onChange(e.target.value)}
      />
    </div>
  </div>
);

export default Register;
