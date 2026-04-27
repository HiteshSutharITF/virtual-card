import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { toast } from 'react-hot-toast';
import { DollarSign, Search, Filter, Calendar, Clock, CreditCard, Plus, Eye, History, Settings as SettingsIcon, Save, Loader2, Image as ImageIcon, CheckCircle, AlertCircle, TrendingUp, Pencil, RefreshCcw } from 'lucide-react';
import Modal from '../../components/common/Modal';
import { format } from 'date-fns';
import { getAllSubscriptions, addUserPayment, getGlobalSettings, updateGlobalSettings, updateSubscriptionExpiry } from '../../services/admin.service';

const Earnings = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExpiryModalOpen, setIsExpiryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [expiryLoading, setExpiryLoading] = useState(false);
  const [settings, setSettings] = useState({
    trialDuration: { value: 7, unit: 'days' }
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  
  const [paymentData, setPaymentData] = useState({
    amount: '',
    description: '',
    status: 'done',
    durationValue: '1',
    durationUnit: 'years',
  });
  const [paymentLoading, setPaymentLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2000000) {
        toast.error('Image size should be less than 2MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const fetchData = async () => {
    try {
      const [subRes, settingsRes] = await Promise.all([
        getAllSubscriptions(),
        getGlobalSettings()
      ]);
      
      if (subRes.success) {
        setSubscriptions(subRes.data);
      } else {
        toast.error(subRes.message || 'Failed to load subscriptions');
      }

      if (settingsRes.success) {
        setSettings(settingsRes.data);
      } else {
        toast.error(settingsRes.message || 'Failed to load settings');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error(error.message || 'Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateSettings = async () => {
    setSettingsLoading(true);
    try {
      const response = await updateGlobalSettings(settings);
      if (response.success) {
        toast.success('Global settings updated');
        setIsSettingsModalOpen(false);
      }
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);
    try {
      const formData = new FormData();
      formData.append('amount', paymentData.amount);
      formData.append('description', paymentData.description);
      formData.append('status', paymentData.status);
      formData.append('durationValue', paymentData.durationValue);
      formData.append('durationUnit', paymentData.durationUnit);
      if (selectedFile) {
        formData.append('receiptImage', selectedFile);
      }

      const response = await addUserPayment(selectedUser._id, formData);
      if (response.success) {
        toast.success('Payment recorded and subscription updated');
        setIsPaymentModalOpen(false);
        setPaymentData({
          amount: '',
          description: '',
          status: 'done',
          durationValue: '1',
          durationUnit: 'years',
        });
        setSelectedFile(null);
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to record payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkData, setBulkData] = useState({
    durationValue: '30',
    durationUnit: 'days'
  });
  const [bulkLoading, setBulkLoading] = useState(false);

  const handleUpdateExpiry = async (e) => {
    e.preventDefault();
    setExpiryLoading(true);
    try {
      const response = await updateSubscriptionExpiry(selectedUser._id, { expiryDate: newExpiryDate });
      if (response.success) {
        toast.success('Expiry date updated');
        setIsExpiryModalOpen(false);
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to update expiry date');
    } finally {
      setExpiryLoading(false);
    }
  };

  const handleBulkUpdate = async (e) => {
    e.preventDefault();
    if (selectedUsers.length === 0) return;
    setBulkLoading(true);
    let successCount = 0;
    
    try {
      for (const userId of selectedUsers) {
        const user = subscriptions.find(u => u._id === userId);
        if (!user) continue;

        const currentExpiry = user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt) : new Date();
        const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
        
        const newDate = new Date(baseDate);
        const value = parseInt(bulkData.durationValue);
        
        if (bulkData.durationUnit === 'days') newDate.setDate(newDate.getDate() + value);
        else if (bulkData.durationUnit === 'hours') newDate.setHours(newDate.getHours() + value);
        else if (bulkData.durationUnit === 'minutes') newDate.setMinutes(newDate.getMinutes() + value);
        else if (bulkData.durationUnit === 'years') newDate.setFullYear(newDate.getFullYear() + value);

        const response = await updateSubscriptionExpiry(userId, { expiryDate: newDate.toISOString() });
        if (response.success) successCount++;
      }
      
      toast.success(`Successfully updated ${successCount} users`);
      setIsBulkModalOpen(false);
      setSelectedUsers([]);
      fetchData();
    } catch (error) {
      toast.error('Some updates failed');
    } finally {
      setBulkLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredSubs.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredSubs.map(u => u._id));
    }
  };

  const toggleSelectUser = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter(uid => uid !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };
  const formatForDateTimeLocal = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - offset).toISOString().slice(0, 16);
    return localISOTime;
  };

  const getStatusInfo = (expiry) => {
    if (!expiry) return { label: 'No Trial', color: 'text-slate-400 bg-slate-50' };
    const now = new Date();
    const expDate = new Date(expiry);
    if (expDate < now) return { label: 'Expired', color: 'text-rose-600 bg-rose-50' };
    
    const diffMs = expDate - now;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return { label: `${diffMins} mins left`, color: 'text-rose-600 bg-rose-50' };
    if (diffHours < 24) return { label: `${diffHours} hours left`, color: 'text-amber-600 bg-amber-50' };
    if (diffDays <= 3) return { label: `${diffDays} days left`, color: 'text-amber-600 bg-amber-50' };
    
    return { label: `${diffDays} days left`, color: 'text-emerald-600 bg-emerald-50' };
  };

  const filteredSubs = subscriptions.filter(sub => 
    sub.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.mobile?.includes(searchTerm) ||
    sub.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEarnings = subscriptions.reduce((acc, user) => {
    const userTotal = user.payments?.filter(p => p.status === 'done').reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    return acc + userTotal;
  }, 0);

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Earnings & Subscriptions</h1>
            <p className="text-slate-500 font-medium">Manage payments and global trial settings</p>
          </div>

          <div className="flex items-center space-x-3">
             <button
               onClick={() => {
                 setLoading(true);
                 fetchData();
               }}
               disabled={loading}
               className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm active:scale-95 disabled:opacity-50"
               title="Refresh Data"
             >
               <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
             </button>
             <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm active:scale-95 flex items-center space-x-2"
            >
              <SettingsIcon size={20} />
              <span className="text-sm font-bold">Settings</span>
            </button>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search users..."
                className="glass rounded-2xl py-3.5 pl-12 pr-6 border-slate-200 text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none w-full transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<DollarSign size={24} />} label="Total Revenue" value={`₹${totalEarnings}`} color="emerald" />
          <StatCard icon={<TrendingUp size={24} />} label="Active Users" value={subscriptions.filter(u => new Date(u.subscriptionExpiresAt) > new Date()).length} color="indigo" />
          <StatCard icon={<AlertCircle size={24} />} label="Expiring Soon" value={subscriptions.filter(u => {
            const exp = new Date(u.subscriptionExpiresAt);
            const now = new Date();
            const threeDays = 3 * 24 * 60 * 60 * 1000;
            return exp > now && (exp - now) < threeDays;
          }).length} color="amber" />
          <StatCard icon={<CreditCard size={24} />} label="Payments Made" value={subscriptions.reduce((acc, curr) => acc + (curr.payments?.length || 0), 0)} color="rose" />
        </div>

        {/* Subscriptions Table */}
        <div className="relative glass rounded-[2rem] overflow-hidden border-slate-200 shadow-xl shadow-indigo-100/20">
          {/* Bulk Action Bar */}
          {selectedUsers.length > 0 && (
            <div className="absolute top-0 left-0 right-0 z-10 bg-indigo-600 text-white px-8 py-4 flex items-center justify-between animate-in slide-in-from-top duration-300">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-bold">{selectedUsers.length} Users Selected</span>
                <button 
                  onClick={() => setSelectedUsers([])}
                  className="text-xs font-medium underline underline-offset-4 hover:text-indigo-100"
                >
                  Clear Selection
                </button>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="flex items-center space-x-2 bg-white text-indigo-600 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-lg"
              >
                <Plus size={14} />
                <span>Bulk Extend Expiry</span>
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 w-10">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      checked={selectedUsers.length === filteredSubs.length && filteredSubs.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Professional</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Expiry Date</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Paid</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                   Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
                ) : filteredSubs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-24 text-center">
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">No subscription data found</p>
                    </td>
                  </tr>
                ) : (
                  filteredSubs.map((sub) => {
                    const statusInfo = getStatusInfo(sub.subscriptionExpiresAt);
                    const totalPaid = sub.payments?.filter(p => p.status === 'done').reduce((acc, p) => acc + (p.amount || 0), 0) || 0;
                    const isSelected = selectedUsers.includes(sub._id);
                    
                    return (
                      <tr key={sub._id} className={`hover:bg-slate-50/50 transition-colors group ${isSelected ? 'bg-indigo-50/30' : ''}`}>
                        <td className="px-8 py-6">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            checked={isSelected}
                            onChange={() => toggleSelectUser(sub._id)}
                          />
                        </td>
                        <td className="px-8 py-6">
                          <div>
                            <p className="text-sm font-bold text-slate-800 tracking-tight">{sub.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">{sub.businessName}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-2">
                             <Calendar size={14} className="text-slate-400" />
                             <span className="text-[11px] font-bold text-slate-600">
                               {sub.subscriptionExpiresAt ? format(new Date(sub.subscriptionExpiresAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
                             </span>
                             <button 
                               onClick={() => {
                                 setSelectedUser(sub);
                                 setNewExpiryDate(formatForDateTimeLocal(sub.subscriptionExpiresAt));
                                 setIsExpiryModalOpen(true);
                               }}
                               className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                             >
                               <Pencil size={12} />
                             </button>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-black text-slate-700">₹{totalPaid}</p>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                setSelectedUser(sub);
                                setIsHistoryModalOpen(true);
                              }}
                              className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
                              title="Payment History"
                            >
                              <History size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(sub);
                                setIsPaymentModalOpen(true);
                              }}
                              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100"
                            >
                              <Plus size={14} />
                              <span>Add Pay</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Settings Modal */}
        <Modal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          title="Global Freemium Settings"
          icon={<SettingsIcon size={20} className="text-indigo-600" />}
          size="sm"
          footer={
            <button
              onClick={handleUpdateSettings}
              disabled={settingsLoading}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center space-x-2"
            >
              {settingsLoading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> <span>Save Configuration</span></>}
            </button>
          }
        >
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Default Trial Duration</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={settings.trialDuration.value}
                  onChange={(e) => setSettings({ ...settings, trialDuration: { ...settings.trialDuration, value: parseInt(e.target.value) } })}
                  className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none"
                />
                <select
                  value={settings.trialDuration.unit}
                  onChange={(e) => setSettings({ ...settings, trialDuration: { ...settings.trialDuration, unit: e.target.value } })}
                  className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
              <p className="text-[10px] text-slate-400 font-medium italic">* New users will automatically get this trial time upon registration.</p>
            </div>
          </div>
        </Modal>

        {/* Add Payment Modal */}
        <Modal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          title="Record Payment & Extend"
          icon={<CreditCard size={20} className="text-emerald-600" />}
          size="md"
        >
          {selectedUser && (
            <form onSubmit={handleAddPayment} className="space-y-6">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Extending For</p>
                <h4 className="text-base font-bold text-slate-800">{selectedUser.name} ({selectedUser.businessName})</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Amount (₹) - Optional</label>
                  <input
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none"
                    placeholder="0 (Free)"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Payment Status</label>
                  <select
                    value={paymentData.status}
                    onChange={(e) => setPaymentData({ ...paymentData, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none"
                  >
                    <option value="done">Done / Free</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Extend Access By</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={paymentData.durationValue}
                    onChange={(e) => setPaymentData({ ...paymentData, durationValue: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none"
                  />
                  <select
                    value={paymentData.durationUnit}
                    onChange={(e) => setPaymentData({ ...paymentData, durationUnit: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none"
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Payment Receipt (Image)</label>
                <div className="relative">
                   <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-[2rem] hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer bg-slate-50 group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-8 h-8 mb-3 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                      <p className="mb-2 text-xs text-slate-500 font-bold">
                        {selectedFile ? selectedFile.name : <><span className="text-indigo-600">Click to upload</span> or drag and drop</>}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">PNG, JPG or PDF (MAX. 2MB)</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description / Notes</label>
                <textarea
                  value={paymentData.description}
                  onChange={(e) => setPaymentData({ ...paymentData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 outline-none h-20 resize-none"
                  placeholder="Subscription renewal for 1 year..."
                />
              </div>

              <button
                type="submit"
                disabled={paymentLoading}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center space-x-2"
              >
                {paymentLoading ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle size={18} /> <span>Submit Payment</span></>}
              </button>
            </form>
          )}
        </Modal>

        {/* Bulk Extend Modal */}
        <Modal
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
          title="Bulk Extend Expiry"
          icon={<Plus size={20} className="text-indigo-600" />}
          size="sm"
        >
          <form onSubmit={handleBulkUpdate} className="space-y-6">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Users</p>
              <h4 className="text-base font-bold text-slate-800">{selectedUsers.length} Professionals</h4>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Extend Access By</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={bulkData.durationValue}
                  onChange={(e) => setBulkData({ ...bulkData, durationValue: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none"
                />
                <select
                  value={bulkData.durationUnit}
                  onChange={(e) => setBulkData({ ...bulkData, durationUnit: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                  <option value="years">Years</option>
                </select>
              </div>
              <p className="text-[10px] text-slate-400 font-medium italic mt-2">
                * This will add time to each user's current expiry date (or current time if already expired).
              </p>
            </div>

            <button
              type="submit"
              disabled={bulkLoading}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center space-x-2"
            >
              {bulkLoading ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle size={18} /> <span>Apply Bulk Extension</span></>}
            </button>
          </form>
        </Modal>

        {/* Edit Expiry Modal */}
        <Modal
          isOpen={isExpiryModalOpen}
          onClose={() => setIsExpiryModalOpen(false)}
          title="Directly Edit Expiry"
          icon={<Clock size={20} className="text-indigo-600" />}
          size="sm"
        >
          {selectedUser && (
            <form onSubmit={handleUpdateExpiry} className="space-y-6">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Editing Expiry For</p>
                <h4 className="text-base font-bold text-slate-800">{selectedUser.name}</h4>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">New Expiry Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={newExpiryDate}
                  onChange={(e) => setNewExpiryDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={expiryLoading}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center space-x-2"
              >
                {expiryLoading ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle size={18} /> <span>Update Expiry Date</span></>}
              </button>
            </form>
          )}
        </Modal>

        {/* History Modal */}
        <Modal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          title="Payment History"
          icon={<History size={20} className="text-indigo-600" />}
          size="md"
        >
          {selectedUser && (
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
              {selectedUser.payments && selectedUser.payments.length > 0 ? (
                selectedUser.payments.map((p, i) => (
                  <div key={i} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3 hover:border-indigo-100 transition-all">
                    <div className="flex items-center justify-between">
                       <span className="text-lg font-black text-slate-800">₹{p.amount}</span>
                       <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${p.status === 'done' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                         {p.status}
                       </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{p.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                       <span className="text-[10px] text-slate-400 font-bold uppercase">{format(new Date(p.date), 'MMM dd, yyyy')}</span>
                       {p.receiptImage && (
                         <a 
                           href={`${import.meta.env.VITE_API_BASE_URL.split('/api')[0]}${p.receiptImage}`} 
                           target="_blank" 
                           rel="noreferrer" 
                           className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center space-x-1"
                         >
                           <ImageIcon size={12} />
                           <span>View Receipt</span>
                         </a>
                       )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-400 text-sm font-bold">No payment records found</p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

const StatCard = ({ icon, label, value, color }) => {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
  };

  return (
    <div className="glass p-6 rounded-[2rem] border-slate-200 shadow-xl shadow-indigo-100/20 flex items-center space-x-4">
      <div className={`w-14 h-14 ${colors[color]} rounded-2xl flex items-center justify-center shadow-inner`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <h3 className="text-2xl font-black text-slate-800">{value}</h3>
      </div>
    </div>
  );
};

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-8 py-5"><div className="h-4 bg-slate-100 w-4 rounded"></div></td>
    <td className="px-8 py-5"><div className="h-4 bg-slate-100 w-32 rounded"></div></td>
    <td className="px-8 py-5"><div className="h-4 bg-slate-100 w-32 rounded"></div></td>
    <td className="px-8 py-5"><div className="h-6 bg-slate-100 w-16 rounded"></div></td>
    <td className="px-8 py-5"><div className="h-4 bg-slate-100 w-24 rounded"></div></td>
    <td className="px-8 py-5"><div className="h-10 bg-slate-100 w-24 rounded ml-auto"></div></td>
  </tr>
);

export default Earnings;
