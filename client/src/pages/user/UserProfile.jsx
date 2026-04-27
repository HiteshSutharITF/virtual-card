import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile, updateUserProfile } from '../../services/user.service';
import Layout from '../../components/layout/Layout';
import Toggle from '../../components/common/Toggle';
import { toast } from 'react-hot-toast';
import { User, Briefcase, Phone, Lock, MessageSquare, Save, Loader2, ShieldCheck, Zap, Camera, Trash2, Image as ImageIcon, Pencil, Gift, Clock } from 'lucide-react';
import { format } from 'date-fns';

const UserProfile = () => {
  const { user: authUser, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    mobile: '',
    password: '',
    customMessage: '',
    isActive: true,
    isContactSharingEnabled: true,
    userToken: '',
    logo: '',
    subscriptionExpiresAt: null,
  });
  const [logoPreview, setLogoPreview] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchProfile = async () => {
    try {
      const response = await getUserProfile();
      if (response.success) {
        const p = response.data;
        setFormData({
          name: p.name || '',
          businessName: p.businessName || '',
          mobile: p.mobile || '',
          password: '',
          customMessage: p.customMessage || '',
          isActive: p.isActive,
          isContactSharingEnabled: p.isContactSharingEnabled,
          userToken: p.userToken || '',
          logo: p.logo || '',
          subscriptionExpiresAt: p.subscriptionExpiresAt,
        });
        if (p.logo) {
          const baseUrl = import.meta.env.VITE_API_BASE_URL.split('/api')[0];
          setLogoPreview(`${baseUrl}${p.logo}`);
        }
      }
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2000000) {
        toast.error('Image size should be less than 2MB');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setFormData(prev => ({ ...prev, logo: '' }));
    setLogoPreview('');
    setSelectedFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Use FormData for file upload
      const data = new FormData();
      data.append('name', formData.name);
      data.append('businessName', formData.businessName);
      data.append('mobile', formData.mobile);
      data.append('customMessage', formData.customMessage);
      data.append('isActive', formData.isActive);
      data.append('isContactSharingEnabled', formData.isContactSharingEnabled);

      if (formData.password) {
        data.append('password', formData.password);
      }

      if (selectedFile) {
        data.append('logo', selectedFile);
      } else if (formData.logo === '') {
        data.append('logo', '');
      }

      const response = await updateUserProfile(data);
      if (response.success) {
        toast.success('Profile updated successfully');
        updateUser({
          ...authUser,
          name: response.data.name,
          businessName: response.data.businessName,
          logo: response.data.logo
        });
        setFormData(prev => ({ ...prev, password: '', logo: response.data.logo }));
        const baseUrl = import.meta.env.VITE_API_BASE_URL.split('/api')[0];
        setLogoPreview(`${baseUrl}${response.data.logo}`);
        setSelectedFile(null);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto pb-20">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Account Settings</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage your identity and bot preferences</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Toggles & Status */}
            <div className="space-y-6">
              <div className="glass rounded-[2rem] p-6 text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center shadow-lg border-4 border-indigo-50 overflow-hidden ring-1 ring-slate-100">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Profile Logo" className="w-full h-full object-contain p-2" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-black italic text-3xl">
                        {formData.name?.charAt(0) || 'V'}
                      </div>
                    )}
                  </div>
                  <label className="absolute -bottom-3 -right-3 w-11 h-11 bg-indigo-600 text-white rounded-[1.25rem] flex items-center justify-center shadow-2xl cursor-pointer hover:scale-105 transition-all border-4 border-white z-10">
                    <Pencil size={20} />
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                  </label>
                  {logoPreview && (
                    <button
                      onClick={removeLogo}
                      type="button"
                      className="absolute -top-3 -right-3 w-9 h-9 bg-rose-500 text-white rounded-[1rem] flex items-center justify-center shadow-xl hover:scale-105 transition-all border-4 border-white z-10"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-800 truncate px-2">{formData.name}</h3>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Verified Member</p>
              </div>

              <div className="space-y-4">
                <Toggle
                  label="Bot Status"
                  description="Enable or disable the entire automated engine."
                  enabled={formData.isActive}
                  onChange={(v) => handleToggle('isActive', v)}
                />
                <Toggle
                  label="Contact Sharing"
                  description="Automatically share your vCard with scanners."
                  enabled={formData.isContactSharingEnabled}
                  onChange={(v) => handleToggle('isContactSharingEnabled', v)}
                />
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] p-6 text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
                      <Gift size={18} className="text-amber-400" />
                    </div>
                    <h4 className="font-bold text-sm">Subscription</h4>
                  </div>
                  {formData.subscriptionExpiresAt && new Date(formData.subscriptionExpiresAt) > new Date() ? (
                    <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-lg">Active</span>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-widest bg-rose-500/20 text-rose-400 px-2 py-1 rounded-lg">Expired</span>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-slate-400">
                      <Clock size={14} />
                      <span className="text-xs font-medium">Valid Until</span>
                    </div>
                    <span className="text-xs font-bold">
                      {formData.subscriptionExpiresAt ? format(new Date(formData.subscriptionExpiresAt), 'MMM dd, yyyy') : 'N/A'}
                    </span>
                  </div>

                  {formData.subscriptionExpiresAt && (
                    <div className="pt-2">
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-2">Remaining Access</p>
                       <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${new Date(formData.subscriptionExpiresAt) > new Date() ? 'bg-indigo-500' : 'bg-rose-500'}`}
                            style={{ width: '100%' }}
                          ></div>
                       </div>
                       <p className="text-xs mt-2 text-slate-300 font-medium">
                         {(() => {
                           if (!formData.subscriptionExpiresAt) return 'No active subscription';
                           const now = new Date();
                           const expDate = new Date(formData.subscriptionExpiresAt);
                           if (expDate < now) return 'Please contact admin to renew';
                           
                           const diffMs = expDate - now;
                           const diffMins = Math.floor(diffMs / 60000);
                           const diffHours = Math.floor(diffMs / 3600000);
                           const diffDays = Math.floor(diffMs / 86400000);

                           if (diffMins < 60) return `${diffMins} minutes remaining`;
                           if (diffHours < 24) return `${diffHours} hours remaining`;
                           return `${diffDays} days remaining`;
                         })()}
                       </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                    <Zap size={18} className="text-amber-400" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">Pro Tips</h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Use the <span className="text-indigo-600 font-bold">{"{name}"}</span> variable in your message to greet scanners by their WhatsApp name!
                </p>
              </div>
            </div>

            {/* Right Column: Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass rounded-[2.5rem] p-8 space-y-8">
                <section>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                      <ShieldCheck size={18} />
                    </div>
                    <h4 className="text-lg font-bold text-slate-800">Primary Information</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full glass rounded-2xl py-3 pl-12 pr-4 border-slate-200 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm font-medium"
                          placeholder="Your Name"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Business Name</label>
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          name="businessName"
                          value={formData.businessName}
                          onChange={handleChange}
                          className="w-full glass rounded-2xl py-3 pl-12 pr-4 border-slate-200 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm font-medium"
                          placeholder="Acme Corp"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Mobile Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleChange}
                          className="w-full glass rounded-2xl py-3 pl-12 pr-4 border-slate-200 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm font-medium"
                          placeholder="Enter Mobile"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-indigo-500 uppercase ml-1 flex items-center">
                        <ShieldCheck size={12} className="mr-1" /> Security Token
                      </label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
                        <input
                          value={formData.userToken || '---'}
                          readOnly
                          className="w-full bg-indigo-50/50 rounded-2xl py-3 pl-12 pr-4 border-indigo-100 outline-none text-sm font-bold text-indigo-600 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1 text-indigo-600 flex items-center">
                        <Lock size={12} className="mr-1" /> New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          name="password"
                          type="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full glass rounded-2xl py-3 pl-12 pr-4 border-slate-200 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm font-medium"
                          placeholder="Leave blank to keep current"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <hr className="border-slate-100" />

                <section className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                      <MessageSquare size={18} />
                    </div>
                    <h4 className="text-lg font-bold text-slate-800">Bot Messaging</h4>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Custom Reply Message</label>
                    <textarea
                      name="customMessage"
                      value={formData.customMessage}
                      onChange={handleChange}
                      rows={4}
                      className="w-full glass rounded-[2rem] p-6 border-slate-200 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm font-medium leading-relaxed"
                      placeholder="Hi {name}! Thanks for connecting..."
                    ></textarea>

                    <div className="mt-4 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-indigo-400 mb-2">Live Preview Example</p>
                      <p className="text-sm text-slate-600 italic">
                        "{formData.customMessage.replace(/{name}/g, 'Rahul')}"
                      </p>
                    </div>
                  </div>
                </section>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full btn-premium bg-gradient-main text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-3 shadow-xl shadow-indigo-200 transition-all hover:-translate-y-1 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="animate-spin" /> : <><Save size={20} /> <span>Save Profile Changes</span></>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default UserProfile;
