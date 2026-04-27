import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllUsers, updateUserStatus, adminCreateUser, adminUpdateUser, updateSubscriptionExpiry } from '../../services/admin.service';
import Layout from '../../components/layout/Layout';
import { toast } from 'react-hot-toast';
import { Search, UserCheck, UserX, Clock, Eye, EyeOff, Briefcase, Phone, MessageSquare, UserPlus, Lock, Loader2, User, AlertCircle, ArrowRight, Pencil, Save, RefreshCw, Gift, Copy } from 'lucide-react';
import Modal from '../../components/common/Modal';
import { QRCodeSVG } from 'qrcode.react';
import { Link } from 'react-router-dom';
import Toggle from '../../components/common/Toggle';

const UsersManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    mobile: '',
    businessName: '',
    password: '',
    customMessage: 'Hi {name}! Thanks for connecting.',
  });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    userId: null,
    status: '',
    userName: '',
    currentStatus: '',
    expiryDate: '',
    isCustomExpiry: false
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    mobile: '',
    businessName: '',
    password: '',
    customMessage: '',
    isActive: true,
    isContactSharingEnabled: true,
    subscriptionExpiresAt: '',
  });

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const formatForDateTimeLocal = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const getTimeLeftLabel = (expiry) => {
    if (!expiry) return 'Not Set';
    const now = new Date();
    const expDate = new Date(expiry);
    const isExpired = expDate < now;
    
    const diffMs = Math.abs(expDate - now);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (isExpired) return 'Expired';
    if (diffMins < 60) return `${diffMins}m left`;
    if (diffHours < 24) return `${diffHours}h left`;
    return `${diffDays}d left`;
  };

  const handleStatusUpdate = async () => {
    const { userId, status, expiryDate } = confirmModal;
    setLoading(true);
    try {
      // Step 1: Update Status
      const response = await updateUserStatus(userId, status);
      if (response.success) {
        // Step 2: If approved and expiry date is set, update expiry
        if (status === 'approved' && expiryDate) {
          await updateSubscriptionExpiry(userId, { expiryDate });
        }
        
        toast.success(response.message);
        setConfirmModal({ ...confirmModal, isOpen: false });
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const openConfirmModal = (user, status) => {
    // Default expiry: 1 Year from now if status is approved
    const defaultExpiry = status === 'approved' 
      ? formatForDateTimeLocal(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000))
      : '';

    setConfirmModal({
      isOpen: true,
      userId: user._id,
      status: status,
      userName: user.name,
      currentStatus: user.status,
      expiryDate: defaultExpiry,
      isCustomExpiry: false
    });
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (user) => {
    setEditUser(user);
    setEditFormData({
      name: user.name || '',
      mobile: user.mobile || '',
      businessName: user.businessName || '',
      password: '',
      customMessage: user.customMessage || '',
      isActive: user.isActive ?? true,
      isContactSharingEnabled: user.isContactSharingEnabled ?? true,
      status: user.status || 'pending',
      subscriptionExpiresAt: user.subscriptionExpiresAt ? formatForDateTimeLocal(user.subscriptionExpiresAt) : '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const response = await adminUpdateUser(editUser._id, editFormData);
      if (response.success) {
        // Also update expiry if changed
        if (editFormData.subscriptionExpiresAt) {
          await updateSubscriptionExpiry(editUser._id, { expiryDate: editFormData.subscriptionExpiresAt });
        }
        
        toast.success(response.message || 'User updated successfully');
        setIsEditModalOpen(false);
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update user');
    } finally {
      setEditLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const response = await adminCreateUser(newUser);
      if (response.success) {
        toast.success('Professional account created and approved!');
        setIsCreateModalOpen(false);
        setNewUser({ 
          name: '', 
          mobile: '', 
          businessName: '', 
          password: '',
          customMessage: 'Hi {name}! Thanks for connecting.'
        });
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setCreateLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const nameMatch = user.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const mobileMatch = user.mobile?.includes(searchTerm);
    const matchesSearch = nameMatch || mobileMatch;
    const matchesFilter = filter === 'all' || user.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Business Directory</h1>
            <p className="text-slate-500 font-medium">Manage professional registrations and account status</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => fetchUsers()}
              disabled={loading}
              className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              title="Refresh Directory"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-[0.98]"
            >
              <UserPlus size={18} />
              <span>Add User</span>
            </button>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search index..."
                className="glass rounded-2xl py-3 pl-12 pr-6 border-slate-200 text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none w-full sm:w-64 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex justify-center md:justify-start">
          <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-slate-200">
            {['all', 'pending', 'approved'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-[1rem] text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="glass rounded-[2rem] overflow-hidden border-slate-200 shadow-xl shadow-indigo-100/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Profile</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Business</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Expiry</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Scans</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Affiliate</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-4">
                          <Search size={32} />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">No matching accounts found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr 
                      key={user._id} 
                      className={`hover:bg-slate-50/50 transition-colors group ${
                        user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) < new Date() ? 'bg-rose-50/70' : ''
                      }`}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-sm ring-4 ring-indigo-50/50 group-hover:ring-white transition-all">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800 tracking-tight">{user.name}</p>
                            <p className="text-xs text-slate-400 font-bold tracking-widest">{user.mobile}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-black text-slate-700 tracking-tight">{user.businessName}</p>
                        <p className="text-[9px] text-indigo-500 font-black uppercase tracking-[0.1em]">{user.createdBy === 'admin' ? 'Managed' : 'Self-Reg'}</p>
                      </td>
                      <td className="px-8 py-6">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <p className="text-sm font-black text-slate-700 tracking-tight">
                            {user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt).toLocaleDateString() : 'Not Set'}
                          </p>
                          <p className={`text-[9px] font-black uppercase tracking-[0.1em] ${
                            !user.subscriptionExpiresAt ? 'text-slate-300' :
                            new Date(user.subscriptionExpiresAt) < new Date() ? 'text-rose-500' : 'text-emerald-500'
                          }`}>
                            {getTimeLeftLabel(user.subscriptionExpiresAt)}
                          </p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-black text-indigo-600 bg-indigo-50/50 px-3 py-1.5 rounded-lg border border-indigo-100/50">{user.scansCount || 0}</span>
                      </td>
                       <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <div className="flex items-center space-x-2">
                            <p className="text-[10px] font-black text-slate-700 tracking-tight">Ref By: <span className="text-indigo-600">{user.referrerName}</span></p>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/register?ref=${user.userToken}`);
                                toast.success('Link copied!');
                              }}
                              className="p-1 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-600 hover:text-white transition-all"
                              title="Copy Affiliate Link"
                            >
                              <Copy size={10} />
                            </button>
                          </div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Total Ref: {user.referralsCount || 0}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end space-x-3">
                          {user.status === 'pending' && (
                            <>
                              <button
                                onClick={() => openConfirmModal(user, 'approved')}
                                className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                title="Approve Entry"
                              >
                                <UserCheck size={18} />
                              </button>
                              <button
                                onClick={() => openConfirmModal(user, 'rejected')}
                                className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                title="Reject Entry"
                              >
                                <UserX size={18} />
                              </button>
                            </>
                          )}
                          <Link
                            to={`/admin/users/${user._id}/scanned`}
                            className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                            title="Analytics History"
                          >
                            <Clock size={18} />
                          </Link>
                          <button
                            onClick={() => handleViewUser(user)}
                            className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-800 hover:text-white transition-all shadow-sm"
                            title="Quick View"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEditClick(user)}
                            className="p-2.5 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                            title="Edit Details"
                          >
                            <Pencil size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create User Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Add Business User"
          icon={<UserPlus size={20} className="text-indigo-600" />}
          size="md"
          footer={
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all active:scale-[0.98] text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="create-user-form"
                disabled={createLoading || !newUser.name || !newUser.mobile || !newUser.businessName || !newUser.password}
                className="flex-1 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-slate-900 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-[0.98] text-sm"
              >
                {createLoading ? <Loader2 size={18} className="animate-spin text-white" /> : <span>Create Account</span>}
              </button>
            </div>
          }
        >
          <form id="create-user-form" onSubmit={handleCreateUser} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputBox
                icon={<User size={18} />}
                label="Full Name *"
                placeholder="John Doe"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
              <InputBox
                icon={<Briefcase size={18} />}
                label="Business Name *"
                placeholder="Acme Corp"
                value={newUser.businessName}
                onChange={(e) => setNewUser({ ...newUser, businessName: e.target.value })}
              />
            </div>
            <InputBox
              icon={<Phone size={18} />}
              label="WhatsApp Mobile *"
              placeholder="9876543210"
              value={newUser.mobile}
              onChange={(e) => setNewUser({ ...newUser, mobile: e.target.value })}
            />
            <InputBox
              icon={<Lock size={18} />}
              label="Temporary Password *"
              type="password"
              placeholder="••••••••"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Custom Reply Message</label>
              <div className="relative">
                <div className="absolute left-4 top-4 text-slate-400">
                  <MessageSquare size={18} />
                </div>
                <textarea
                  value={newUser.customMessage}
                  onChange={(e) => setNewUser({ ...newUser, customMessage: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all h-24 resize-none"
                  placeholder="Hi {name}! Thanks for connecting."
                />
              </div>
            </div>
          </form>
        </Modal>

        {/* Edit User Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Update Account Details"
          icon={<Pencil size={20} className="text-amber-600" />}
          size="md"
          footer={
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all active:scale-[0.98] text-sm"
              >
                Discard
              </button>
              <button
                type="submit"
                form="edit-user-form"
                disabled={editLoading}
                className="flex-1 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-slate-900 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-[0.98] text-sm"
              >
                {editLoading ? <Loader2 size={18} className="animate-spin text-white" /> : <><Save size={18} /> <span>Save Changes</span></>}
              </button>
            </div>
          }
        >
          <form id="edit-user-form" onSubmit={handleUpdateUser} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputBox
                icon={<User size={18} />}
                label="Full Name *"
                placeholder="Name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              />
              <InputBox
                icon={<Briefcase size={18} />}
                label="Business Name *"
                placeholder="Business"
                value={editFormData.businessName}
                onChange={(e) => setEditFormData({ ...editFormData, businessName: e.target.value })}
              />
            </div>
            <InputBox
              icon={<Phone size={18} />}
              label="WhatsApp Mobile *"
              placeholder="Mobile"
              value={editFormData.mobile}
              onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })}
            />
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
               <InputBox
                icon={<Lock size={18} />}
                label="Update Password"
                type="password"
                placeholder="Leave empty to keep current"
                value={editFormData.password}
                onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
              />
              <p className="text-[9px] text-amber-600 font-bold uppercase tracking-wider mt-2 ml-1 flex items-center gap-1.5">
                <AlertCircle size={10} /> Password update will take effect on next login
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Custom Reply Message</label>
                <div className="relative">
                  <div className="absolute left-4 top-4 text-slate-400">
                    <MessageSquare size={18} />
                  </div>
                  <textarea
                    value={editFormData.customMessage}
                    onChange={(e) => setEditFormData({ ...editFormData, customMessage: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all h-24 resize-none"
                    placeholder="Message..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Toggle 
                  label="Bot Status" 
                  description="Enable/Disable bot"
                  enabled={editFormData.isActive}
                  onChange={(v) => setEditFormData({ ...editFormData, isActive: v })}
                />
                <Toggle 
                  label="Sharing" 
                  description="Contact sharing"
                  enabled={editFormData.isContactSharingEnabled}
                  onChange={(v) => setEditFormData({ ...editFormData, isContactSharingEnabled: v })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Account Status</label>
                <select
                  value={editFormData.status || 'pending'}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Subscription Expiry</label>
                <input
                  type="datetime-local"
                  value={editFormData.subscriptionExpiresAt}
                  onChange={(e) => setEditFormData({ ...editFormData, subscriptionExpiresAt: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                />
              </div>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Account Identity"
          icon={<Eye size={20} className="text-slate-600" />}
          size="md"
          footer={
            <div className="flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-8 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all active:scale-[0.98] text-sm"
              >
                Dismiss View
              </button>
            </div>
          }
        >
          {selectedUser && (
            <div className="space-y-8">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="absolute -inset-2 bg-indigo-500/10 rounded-full blur-xl pointer-events-none"></div>
                  <div className="relative bg-white p-5 rounded-[2.5rem] shadow-xl border border-slate-100 flex items-center justify-center">
                    <QRCodeSVG
                      value={`https://wa.me/91${currentUser?.mobile || ''}?text=Please%20share%20the%20contact%20of%20${encodeURIComponent(selectedUser.name)}%20-${encodeURIComponent(selectedUser.businessName)}%20${selectedUser.userToken}`}
                      size={160}
                      level="H"
                    />
                  </div>
                </div>

                <h4 className="text-xl font-bold text-slate-800 uppercase tracking-tight">{selectedUser.name}</h4>
                <div className="flex items-center space-x-2 text-indigo-600 font-bold text-sm mt-1">
                  <span className="bg-indigo-50 px-3 py-1 rounded-full">{selectedUser.userToken}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <DetailItem icon={<Briefcase size={16} />} label="Business" value={selectedUser.businessName} />
                <DetailItem icon={<Phone size={16} />} label="Mobile" value={selectedUser.mobile} />
                <DetailItem icon={<MessageSquare size={16} />} label="Created By" value={selectedUser.createdBy} />
                <DetailItem icon={<Clock size={16} />} label="Status" value={selectedUser.status} color={selectedUser.status === 'approved' ? 'text-emerald-500' : 'text-amber-500'} />
              </div>

              <div className="bg-indigo-50/50 rounded-[2rem] p-6 border border-indigo-100/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-indigo-600">
                    <Gift size={18} />
                    <h4 className="text-sm font-black uppercase tracking-widest">Affiliate Program</h4>
                  </div>
                  <span className="text-[10px] font-black text-indigo-500 bg-white px-3 py-1 rounded-full border border-indigo-100 shadow-sm">
                    {selectedUser.referralsCount || 0} TOTAL REFS
                  </span>
                </div>
                
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unique Referral Link</p>
                  <div className="flex items-center bg-white border border-indigo-100 rounded-xl p-3 shadow-sm group">
                    <input 
                      type="text" 
                      readOnly 
                      value={`${window.location.origin}/register?ref=${selectedUser.userToken}`} 
                      className="flex-1 bg-transparent border-none outline-none text-[11px] font-bold text-slate-600 truncate"
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/register?ref=${selectedUser.userToken}`);
                        toast.success('Affiliate link copied!');
                      }}
                      className="ml-2 p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-400 font-bold ml-1 italic">Joined via: <span className="text-indigo-600 not-italic">{selectedUser.referrerName || 'Direct'}</span></p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-3 ml-1">Automated Welcome Message</p>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 italic text-slate-600 text-sm leading-relaxed">
                  "{selectedUser.customMessage}"
                </div>
              </div>
            </div>
          )}
        </Modal>
        {/* Confirmation Modal */}
        <Modal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
          title="Identity Verification"
          icon={confirmModal.status === 'approved' ? <UserCheck size={20} className="text-emerald-600" /> : <UserX size={20} className="text-rose-600" />}
          size="sm"
          footer={
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-[0.98] text-sm"
              >
                No, Go Back
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={loading}
                className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 active:scale-[0.98] text-sm ${confirmModal.status === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-100'}`}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <span>Confirm Action</span>}
              </button>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Identity Bar */}
            <div className="bg-slate-50 rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              {/* Row 1: Profile Info */}
              <div className="p-4 flex items-center space-x-4 border-b border-white shadow-[0_1px_0_0_rgba(0,0,0,0.02)]">
                <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-md">
                  {confirmModal.userName?.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-black text-slate-900 tracking-tight leading-none">{confirmModal.userName}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Professional Account</p>
                </div>
              </div>

              {/* Row 2: Status Transition */}
              <div className="bg-white/50 px-5 py-4 flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">Current Status</p>
                  <span className="text-[10px] font-black uppercase text-slate-400 bg-white border border-slate-100 px-3 py-1.5 rounded-xl shadow-sm self-start">
                    {confirmModal.currentStatus}
                  </span>
                </div>
                
                <div className="text-slate-200">
                  <ArrowRight size={18} />
                </div>

                <div className="flex flex-col items-end text-right">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Update To</p>
                  <span className={`px-5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all shadow-sm ${confirmModal.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                    {confirmModal.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Expiry Selection for Approval */}
            {confirmModal.status === 'approved' && (
              <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Set Subscription Expiry</label>
                  <button 
                    onClick={() => setConfirmModal(p => ({ ...p, isCustomExpiry: !p.isCustomExpiry }))}
                    className="text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700"
                  >
                    {confirmModal.isCustomExpiry ? 'Use Presets' : 'Custom Date'}
                  </button>
                </div>

                {!confirmModal.isCustomExpiry ? (
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: '7 Days', days: 7 },
                      { label: '1 Month', days: 30 },
                      { label: '1 Year', days: 365 },
                      { label: '2 Years', days: 730 },
                    ].map((d) => {
                      const date = new Date(Date.now() + d.days * 24 * 60 * 60 * 1000);
                      const isSelected = confirmModal.expiryDate === formatForDateTimeLocal(date);
                      return (
                        <button
                          key={d.label}
                          onClick={() => setConfirmModal(p => ({ ...p, expiryDate: formatForDateTimeLocal(date) }))}
                          className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                            isSelected 
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' 
                              : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-indigo-200'
                          }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <input
                    type="datetime-local"
                    value={confirmModal.expiryDate}
                    onChange={(e) => setConfirmModal(p => ({ ...p, expiryDate: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  />
                )}
                <div className="flex items-center gap-2 px-1">
                  <Clock size={12} className="text-slate-300" />
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    Expires: <span className="text-indigo-600 font-black">{new Date(confirmModal.expiryDate).toLocaleDateString()}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Warning Box */}
            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 flex space-x-4">
              <div className="shrink-0 pt-0.5">
                <AlertCircle className="text-amber-600" size={20} />
              </div>
              <div className="space-y-1">
                <p className="text-[13px] font-bold text-amber-900 leading-relaxed">
                  {confirmModal.status === 'approved' 
                    ? 'This will grant professional access until the selected expiry date.' 
                    : 'This will deny professional access to this user.'}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

const DetailItem = ({ icon, label, value, color = 'text-slate-700' }) => (
  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
    <div className="flex items-center space-x-2 text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">
      {icon}
      <span>{label}</span>
    </div>
    <span className={`text-sm font-bold truncate block ${color}`}>{value}</span>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    approved: 'bg-emerald-100 text-emerald-600 ring-emerald-50',
    pending: 'bg-amber-100 text-amber-600 ring-amber-50',
    rejected: 'bg-rose-100 text-rose-600 ring-rose-50',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ring-4 ${styles[status]}`}>
      {status}
    </span>
  );
};

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-8 py-5"><div className="flex items-center space-x-4"><div className="w-10 h-10 bg-slate-100 rounded-full"></div><div className="h-4 bg-slate-100 w-24 rounded"></div></div></td>
    <td className="px-8 py-5"><div className="h-4 bg-slate-100 w-32 rounded"></div></td>
    <td className="px-8 py-5"><div className="h-6 bg-slate-100 w-20 rounded-full"></div></td>
    <td className="px-8 py-5"><div className="h-4 bg-slate-100 w-20 rounded"></div></td>
    <td className="px-8 py-5"><div className="h-4 bg-slate-100 w-16 rounded"></div></td>
    <td className="px-8 py-5"><div className="h-4 bg-slate-100 w-24 rounded"></div></td>
    <td className="px-8 py-5"><div className="h-8 bg-slate-100 w-8 rounded ml-auto"></div></td>
  </tr>
);

const InputBox = ({ icon, label, placeholder, value, onChange, type = "text" }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === 'password';

  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">
        {label.includes('*') ? (
          <>
            {label.replace('*', '')} <span className="text-rose-500">*</span>
          </>
        ) : label}
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>
        <input
          type={isPasswordType ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-12 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default UsersManagement;
