import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAdminProfile, updateAdminProfile } from '../../services/admin.service';
import Layout from '../../components/layout/Layout';
import { toast } from 'react-hot-toast';
import { User, Mail, Phone, Lock, Save, Loader2, ShieldCheck, Camera } from 'lucide-react';

const AdminProfile = () => {
  const { user: authUser, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
  });

  const fetchProfile = async () => {
    try {
      const response = await getAdminProfile();
      if (response.success) {
        const p = response.data;
        setFormData({
          name: p.name || '',
          email: p.email || '',
          mobile: p.mobile || '',
          password: '',
        });
      }
    } catch (error) {
      toast.error('Failed to load admin profile');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const updateData = { ...formData };
      if (!updateData.password) delete updateData.password;

      const response = await updateAdminProfile(updateData);
      if (response.success) {
        toast.success('Admin profile updated');
        updateUser({
          ...authUser,
          name: response.data.name,
          email: response.data.email,
        });
        setFormData(prev => ({ ...prev, password: '' }));
      }
    } catch (error) {
      toast.error(error.message || 'Update failed');
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
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">System Profile</h1>
          <p className="text-slate-500 mt-2 font-medium">Administrator identity and security settings</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Avatar & Status */}
            <div className="space-y-6">
              <div className="glass rounded-[2rem] p-8 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none"></div>
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-slate-800 text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-xl ring-4 ring-white transition-transform duration-500 group-hover:scale-105">
                    <User size={48} />
                  </div>
                  <button type="button" className="absolute bottom-0 right-1/2 translate-x-12 bg-white text-slate-600 p-2 rounded-xl shadow-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                    <Camera size={16} />
                  </button>
                </div>
                <h3 className="text-xl font-bold text-slate-800">{formData.name}</h3>
                <div className="inline-flex items-center space-x-2 bg-slate-800 text-white px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest mt-4">
                  <ShieldCheck size={12} className="text-emerald-400" />
                  <span>Super Admin</span>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
                <h4 className="text-sm font-bold text-slate-800 mb-4">Security Overview</h4>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3 text-xs font-medium text-slate-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5"></div>
                    <span>JWT Session active (7 days)</span>
                  </li>
                  <li className="flex items-start space-x-3 text-xs font-medium text-slate-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5"></div>
                    <span>Bcrypt hashing protection</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column: Form Fields */}
            <div className="lg:col-span-2">
              <div className="glass rounded-[2.5rem] p-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Admin Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full glass rounded-2xl py-3.5 pl-12 pr-4 border-slate-200 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm font-bold text-slate-700"
                        placeholder="System Admin"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full glass rounded-2xl py-3.5 pl-12 pr-4 border-slate-200 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm font-bold text-slate-700"
                        placeholder="admin@example.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">WhatsApp Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        className="w-full glass rounded-2xl py-3.5 pl-12 pr-4 border-slate-200 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm font-bold text-slate-700"
                        placeholder="Enter Mobile"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 text-indigo-600 flex items-center">
                      <Lock size={12} className="mr-1" /> New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full glass rounded-2xl py-3.5 pl-12 pr-4 border-slate-200 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm font-bold text-slate-700"
                        placeholder="Unchanged if empty"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center space-x-3 shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>
                        <Save size={18} />
                        <span>Save Administrative Changes</span>
                      </>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-slate-400 mt-6 font-bold uppercase tracking-tight italic">
                    Note: Changing the WhatsApp number will require a fresh engine scan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AdminProfile;
