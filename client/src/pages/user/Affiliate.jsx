import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../context/AuthContext';
import { getAffiliateStats, updateAffiliateTemplates } from '../../services/user.service';
import { toast } from 'react-hot-toast';
import { Copy, Share2, MessageSquare, Users, TrendingUp, Save, Plus, Trash2, ExternalLink, Loader2, User as UserIcon, Mail, AlertCircle } from 'lucide-react';

const Affiliate = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({ totalReferred: 0, referredUsers: [], referrerInfo: { name: 'Direct', mobile: '' } });
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  const affiliateLink = user?.userToken ? `${window.location.origin}/register?ref=${user?.userToken}` : '';

  const fetchAffiliateData = async () => {
    try {
      const response = await getAffiliateStats();
      if (response.success) {
        setStats(response.data);
      }
      setTemplates(user?.affiliateTemplates || []);
    } catch (error) {
      toast.error('Failed to load affiliate data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAffiliateData();
    }
  }, [user]);

  const handleCopyLink = () => {
    if (!affiliateLink) return;
    navigator.clipboard.writeText(affiliateLink);
    toast.success('Affiliate link copied!');
  };

  const handleShareWhatsApp = (message) => {
    if (!affiliateLink) return;
    const finalMessage = message.replace('{link}', affiliateLink);
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(finalMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleAddTemplate = () => {
    setTemplates([...templates, '']);
  };

  const handleTemplateChange = (index, value) => {
    const newTemplates = [...templates];
    newTemplates[index] = value;
    setTemplates(newTemplates);
  };

  const handleRemoveTemplate = (index) => {
    const newTemplates = templates.filter((_, i) => i !== index);
    setTemplates(newTemplates);
  };

  const handleSaveTemplates = async () => {
    setSaveLoading(true);
    try {
      const response = await updateAffiliateTemplates(templates.filter(t => t.trim() !== ''));
      if (response.success) {
        toast.success('Templates saved successfully');
      }
    } catch (error) {
      toast.error('Failed to save templates');
    } finally {
      setSaveLoading(false);
    }
  };

  if (authLoading || (loading && !stats.referredUsers.length)) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-400 font-bold text-sm animate-pulse">Syncing affiliate data...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Affiliate Program</h1>
            <p className="text-slate-500 font-medium">Earn rewards by inviting others to join Magic QR</p>
          </div>
          
          {/* Referrer Info Badge */}
          <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
              <UserIcon size={20} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Referred By</p>
              <p className="text-sm font-bold text-slate-700">{stats.referrerInfo?.name || 'Direct Join'}</p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass p-6 rounded-[2rem] border-slate-200 shadow-xl shadow-indigo-100/20 flex items-center space-x-4">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
              <Users size={24} />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Total Referrals</p>
              <h3 className="text-2xl font-black text-slate-800">{stats.totalReferred}</h3>
            </div>
          </div>
          
          <div className="glass p-6 rounded-[2rem] border-slate-200 shadow-xl shadow-indigo-100/20 flex items-center space-x-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Conversion Rate</p>
              <h3 className="text-2xl font-black text-slate-800">High</h3>
            </div>
          </div>

          <div className="glass p-6 rounded-[2rem] border-slate-200 shadow-xl shadow-indigo-100/20 flex items-center space-x-4">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner">
              <Share2 size={24} />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Active Link</p>
              <h3 className="text-sm font-black text-slate-800 truncate">{user?.userToken || 'Generating...'}</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Link Section */}
          <div className="space-y-6">
            <div className="glass rounded-[2rem] p-8 border-slate-200 shadow-xl shadow-indigo-100/20 space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-black text-slate-800 tracking-tight">Your Unique Link</h4>
                <div className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Active</div>
              </div>
              
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                <div className="relative flex items-center bg-slate-50 border border-slate-100 rounded-2xl p-4 overflow-hidden">
                  <input
                    type="text"
                    readOnly
                    value={affiliateLink || 'Your link is being generated...'}
                    className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-600 truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    disabled={!affiliateLink}
                    className="ml-3 p-2.5 bg-white text-indigo-600 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Copy size={18} />
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-black text-slate-800 tracking-tight">Share Templates</h4>
                  <button
                    onClick={handleAddTemplate}
                    className="flex items-center space-x-1.5 text-indigo-600 hover:text-indigo-700 font-bold text-xs"
                  >
                    <Plus size={16} />
                    <span>Add New</span>
                  </button>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {templates.map((template, index) => (
                    <div key={index} className="space-y-2 group">
                      <div className="relative">
                        <textarea
                          value={template}
                          onChange={(e) => handleTemplateChange(index, e.target.value)}
                          placeholder="Write your message here. Use {link} for your affiliate link."
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium focus:ring-4 focus:ring-indigo-50/10 outline-none transition-all h-28 resize-none"
                        />
                        <button
                          onClick={() => handleRemoveTemplate(index)}
                          className="absolute top-3 right-3 p-1.5 bg-white text-rose-500 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleShareWhatsApp(template)}
                          disabled={!affiliateLink}
                          className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm disabled:opacity-50"
                        >
                          <MessageSquare size={14} />
                          <span>Share on WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {templates.length === 0 && (
                    <div className="text-center py-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                      <p className="text-slate-400 text-sm font-bold">No templates created yet</p>
                      <button onClick={handleAddTemplate} className="mt-2 text-indigo-600 font-black text-xs uppercase tracking-widest">Create One Now</button>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSaveTemplates}
                  disabled={saveLoading}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {saveLoading ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> <span>Save All Templates</span></>}
                </button>
              </div>
            </div>
          </div>

          {/* Referrals List Section */}
          <div className="glass rounded-[2rem] p-8 border-slate-200 shadow-xl shadow-indigo-100/20 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-lg font-black text-slate-800 tracking-tight">Recent Referrals</h4>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stats.totalReferred} Joins</span>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
              {stats.referredUsers.length > 0 ? (
                stats.referredUsers.map((refUser) => (
                  <div key={refUser._id} className="flex flex-col p-5 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-md transition-all space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-11 h-11 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xs">
                          {refUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{refUser.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold tracking-widest">{refUser.mobile}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {new Date(refUser.createdAt).toLocaleDateString()}
                        </p>
                        <div className={`text-[9px] font-black uppercase tracking-widest ${refUser.status === 'approved' ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {refUser.status}
                        </div>
                      </div>
                    </div>

                    {refUser.status !== 'approved' && (
                      <div className={`${refUser.status === 'rejected' ? 'bg-rose-50 border-rose-100/50' : 'bg-amber-50 border-amber-100/50'} rounded-xl p-3 flex items-start space-x-2 border`}>
                        <AlertCircle size={14} className={refUser.status === 'rejected' ? 'text-rose-500' : 'text-amber-500'} />
                        <p className={`text-[10px] font-bold ${refUser.status === 'rejected' ? 'text-rose-700' : 'text-amber-700'} leading-relaxed`}>
                          Account {refUser.status}. Please contact admin at <span className="text-indigo-600 font-black">info@itfuturz.com</span> to verify or re-check this account.
                        </p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-20 text-center opacity-40">
                  <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mb-4">
                    <ExternalLink size={24} />
                  </div>
                  <p className="text-sm font-bold text-slate-500">Your network starts here.</p>
                  <p className="text-xs font-medium text-slate-400 mt-1">Share your link to see your referrals grow.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Affiliate;
