import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { User, Phone, Briefcase, Lock, FileText, UserPlus, ArrowLeft, Loader2, QrCode, Eye, EyeOff } from 'lucide-react';
import AuthIllustration from '../../components/illustrations/AuthIllustration';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    businessName: '',
    password: '',
    customMessage: 'Hi {name}! Thanks for connecting.',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, token, user, loading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && token && user) {
      navigate(user.role === 'admin' ? '/admin' : '/user');
    }
  }, [token, user, navigate, authLoading]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full Name is required';
    
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'WhatsApp Mobile is required';
    } else if (!/^\d{10}$/.test(formData.mobile.trim())) {
      newErrors.mobile = 'Enter a valid 10-digit number';
    }

    if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Minimum 6 characters required';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.getElementsByName(firstErrorField)[0];
      if (element) {
        element.focus();
      }
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await registerUser(formData);
      if (response.success) {
        toast.success(response.message);
        // Automatically login after registration
        login(response.data, response.data.token);
        navigate('/user');
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Numeric only validation for mobile
    if (name === 'mobile') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length > 10) return;
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col md:flex-row overflow-hidden">
      {/* Scrollable Form Column (Left Side) */}
      <div className="flex-1 h-full overflow-y-auto bg-slate-50/30 order-2 lg:order-1">
        <div className="min-h-full flex flex-col justify-center items-center py-12 lg:py-16 px-6 sm:px-12 lg:px-24 relative">
          {/* Mobile Header */}
          <div className="lg:hidden w-full flex justify-center mb-12">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <QrCode size={22} />
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tight">VirtualCard</span>
            </div>
          </div>

          <div className="w-full max-w-lg space-y-10 animate-fade-in">
            <div className="space-y-3 text-center lg:text-left">
              <Link to="/login" className="hidden lg:inline-flex items-center text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] hover:translate-x-[-4px] transition-all mb-4">
                <ArrowLeft size={16} className="mr-1.5" /> Back to Entry
              </Link>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Join the <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-[8px]">Network.</span>
              </h1>
              <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-md mx-auto lg:mx-0">
                Create your automated vCard today and change how you network forever.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputBox icon={<User size={18} />} label="Full Name" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} error={errors.name} required />
                <InputBox icon={<Briefcase size={18} />} label="Business" name="businessName" placeholder="Acme Corp" value={formData.businessName} onChange={handleChange} error={errors.businessName} required />
              </div>
              
              <InputBox icon={<Phone size={18} />} label="WhatsApp Mobile" name="mobile" placeholder="9876543210" value={formData.mobile} onChange={handleChange} error={errors.mobile} required maxLength={10} inputMode="numeric" />
              <InputBox 
                icon={<Lock size={18} />} 
                label="Access Password" 
                name="password" 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={formData.password} 
                onChange={handleChange} 
                error={errors.password} 
                required 
                togglePassword={() => setShowPassword(!showPassword)}
                showPassword={showPassword}
              />
              
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 ml-1">Custom Welcome Reply</label>
                <div className="relative group">
                  <FileText className="absolute left-5 top-5 text-slate-300 group-focus-within:text-indigo-600 transition-all duration-300" size={18} />
                  <textarea
                    name="customMessage"
                    placeholder="Hi {name}! Thanks for connecting..."
                    className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-14 pr-4 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-bold text-sm shadow-sm min-h-[100px] resize-none group-hover:border-slate-300"
                    value={formData.customMessage}
                    onChange={handleChange}
                  ></textarea>
                </div>
                <p className="text-[9px] text-indigo-500 font-black uppercase tracking-widest ml-1 flex items-center">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-1.5 animate-pulse"></span>
                  Pro Tip: Use {"{name}"} to personalize
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-indigo-600 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-[0.98] hover:bg-slate-900 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  ) : (
                    <>
                      <UserPlus size={16} />
                      <span>Initialize My Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <p className="text-center text-slate-400 text-[13px] font-semibold tracking-tight">
              Managed account already?{' '}
              <Link to="/login" className="text-indigo-600 font-black hover:underline decoration-indigo-200 underline-offset-8 transition-all">
                Portal Access
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Fixed Hero Column (Right Side) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#4f46e5] relative flex-shrink-0 h-full order-1 lg:order-2">
        <div className="absolute top-10 right-10 z-20 flex items-center space-x-3">
          <span className="text-2xl font-black text-white tracking-tight">VirtualCard</span>
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
            <QrCode className="text-[#4f46e5] w-7 h-7" />
          </div>
        </div>
        <AuthIllustration type="register" />
      </div>
    </div>
  );
};

const InputBox = ({ icon, label, error, required, type, togglePassword, showPassword, ...props }) => (
  <div className="space-y-2 flex-1">
    <label className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative group">
      <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-all duration-300 ${error ? 'text-red-500' : 'text-slate-300 group-focus-within:text-indigo-600'}`}>
        {icon}
      </div>
      <input
        {...props}
        type={type}
        className={`w-full bg-white border rounded-2xl py-3.5 pl-14 pr-12 transition-all font-bold text-sm shadow-sm focus:outline-none ${
          error 
            ? 'border-red-500 focus:ring-4 focus:ring-red-500/10 focus:border-red-600' 
            : 'border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 group-hover:border-slate-300'
        } text-slate-900 placeholder-slate-300`}
      />
      {togglePassword && (
        <button
          type="button"
          onClick={togglePassword}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
    {error && <p className="text-[10px] text-red-500 font-bold ml-1 animate-fade-in">{error}</p>}
  </div>
);

export default Register;
