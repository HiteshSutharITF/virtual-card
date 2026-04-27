import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { getAllUsers, getReferralsByUserId, updateUserStatus } from '../../services/admin.service';
import { toast } from 'react-hot-toast';
import { Gift, Copy, Eye, Users, TrendingUp, Search, Clock, ArrowRight, User as UserIcon, Loader2, UserCheck, UserX } from 'lucide-react';
import Modal from '../../components/common/Modal';

const AffiliateManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [refLoading, setRefLoading] = useState(false);
  const [isRefModalOpen, setIsRefModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const response = await getAllUsers();
      if (response.success) {
        // Filter users who have at least 1 referral or are self-registered
        setUsers(response.data);
      }
    } catch (error) {
      toast.error('Failed to load affiliate data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopyLink = (userToken) => {
    const link = `${window.location.origin}/register?ref=${userToken}`;
    navigator.clipboard.writeText(link);
    toast.success('Affiliate link copied!');
  };

  const handlePreviewReferrals = async (user) => {
    setSelectedUser(user);
    setIsRefModalOpen(true);
    setRefLoading(true);
    try {
      const response = await getReferralsByUserId(user._id);
      if (response.success) {
        setReferrals(response.data);
      }
    } catch (error) {
      toast.error('Failed to load referrals');
    } finally {
      setRefLoading(false);
    }
  };

  const handleUpdateStatus = async (userId, status) => {
    try {
      const response = await updateUserStatus(userId, status);
      if (response.success) {
        toast.success(`User ${status} successfully`);
        // Refresh referrals in modal
        if (selectedUser) {
          const refResponse = await getReferralsByUserId(selectedUser._id);
          if (refResponse.success) {
            setReferrals(refResponse.data);
          }
        }
        // Refresh main list
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.mobile?.includes(searchTerm) ||
    user.userToken?.includes(searchTerm)
  );

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Affiliate Management</h1>
            <p className="text-slate-500 font-medium">Monitor referral trees and user network growth</p>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, mobile or code..."
              className="glass rounded-2xl py-3.5 pl-12 pr-6 border-slate-200 text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none w-full sm:w-80 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<Gift size={24} />} label="Total Programs" value={users.length} color="indigo" />
          <StatCard icon={<Users size={24} />} label="Network Joins" value={users.reduce((acc, curr) => acc + (curr.referralsCount || 0), 0)} color="emerald" />
          <StatCard icon={<TrendingUp size={24} />} label="Active Links" value={users.filter(u => u.referralsCount > 0).length} color="amber" />
          <StatCard icon={<Clock size={24} />} label="Pending Verifications" value={users.filter(u => u.status === 'pending').length} color="rose" />
        </div>

        {/* Affiliate Table */}
        <div className="glass rounded-[2rem] overflow-hidden border-slate-200 shadow-xl shadow-indigo-100/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Partner User</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Referral Link</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Stats</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Source</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                   Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-24 text-center">
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">No affiliate data found</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xs">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 tracking-tight">{user.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">{user.userToken}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-2 bg-white border border-slate-100 rounded-xl px-3 py-2 shadow-sm max-w-[200px]">
                          <span className="text-[11px] font-bold text-slate-400 truncate flex-1">
                            {`${window.location.origin.split('//')[1]}/reg?ref=${user.userToken}`}
                          </span>
                          <button 
                            onClick={() => handleCopyLink(user.userToken)}
                            className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-2">
                           <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                            {user.referralsCount || 0} REFS
                           </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                           <p className="text-[10px] font-black text-slate-700 tracking-tight">By: {user.referrerName || 'Direct'}</p>
                           <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{user.mobile}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={() => handlePreviewReferrals(user)}
                          className="flex items-center space-x-2 ml-auto px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100 active:scale-95"
                        >
                          <Eye size={14} />
                          <span>Preview Tree</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Referrals Tree Modal */}
        <Modal
          isOpen={isRefModalOpen}
          onClose={() => setIsRefModalOpen(false)}
          title="Network Referral Tree"
          icon={<Gift size={20} className="text-indigo-600" />}
          size="md"
        >
          {selectedUser && (
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-50">
                    <UserIcon size={24} />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-800 leading-none">{selectedUser.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">Network Owner</p>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-2xl font-black text-indigo-600 leading-none">{selectedUser.referralsCount || 0}</p>
                   <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Direct Referrals</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Referral List</p>
                <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                  {refLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="animate-spin text-indigo-600" size={32} />
                    </div>
                  ) : referrals.length > 0 ? (
                    referrals.map((ref) => (
                      <div key={ref._id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 transition-all group">
                         <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                               <ArrowRight size={16} />
                            </div>
                            <div>
                               <p className="text-sm font-bold text-slate-700">{ref.name}</p>
                               <p className="text-[10px] text-slate-400 font-medium">{ref.mobile}</p>
                            </div>
                         </div>
                         <div className="flex items-center space-x-3">
                            <div className="text-right">
                               <p className="text-[10px] font-bold text-slate-400">{new Date(ref.createdAt).toLocaleDateString()}</p>
                               <span className={`text-[9px] font-black uppercase tracking-widest ${ref.status === 'approved' ? 'text-emerald-500' : ref.status === 'rejected' ? 'text-rose-500' : 'text-amber-500'}`}>
                                 {ref.status}
                               </span>
                            </div>
                            <div className="flex items-center space-x-1 border-l border-slate-100 pl-3">
                              <button
                                onClick={() => handleUpdateStatus(ref._id, 'approved')}
                                className={`p-1.5 rounded-lg transition-all shadow-sm ${ref.status === 'approved' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                                title="Approve User"
                              >
                                <UserCheck size={14} />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(ref._id, 'rejected')}
                                className={`p-1.5 rounded-lg transition-all shadow-sm ${ref.status === 'rejected' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                                title="Reject User"
                              >
                                <UserX size={14} />
                              </button>
                            </div>
                         </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-slate-400 text-sm font-bold">No direct referrals yet</p>
                    </div>
                  )}
                </div>
              </div>
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
    <td className="px-8 py-5"><div className="h-4 bg-slate-100 w-32 rounded"></div></td>
    <td className="px-8 py-5"><div className="h-8 bg-slate-100 w-32 rounded"></div></td>
    <td className="px-8 py-5"><div className="h-6 bg-slate-100 w-16 rounded"></div></td>
    <td className="px-8 py-5"><div className="h-4 bg-slate-100 w-24 rounded"></div></td>
    <td className="px-8 py-5"><div className="h-10 bg-slate-100 w-24 rounded ml-auto"></div></td>
  </tr>
);

export default AffiliateManagement;
