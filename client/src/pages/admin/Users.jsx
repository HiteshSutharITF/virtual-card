import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllUsers, updateUserStatus, adminCreateUser } from '../../services/admin.service';
import Layout from '../../components/layout/Layout';
import { toast } from 'react-hot-toast';
import { Search, UserCheck, UserX, Clock, Eye, Briefcase, Phone, MessageSquare, UserPlus, Lock, Loader2, User, AlertCircle, ArrowRight } from 'lucide-react';
import Modal from '../../components/common/Modal';
import { QRCodeSVG } from 'qrcode.react';
import { Link } from 'react-router-dom';

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
  });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    userId: null,
    status: '',
    userName: '',
    currentStatus: ''
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

  const handleStatusUpdate = async () => {
    const { userId, status } = confirmModal;
    setLoading(true);
    try {
      const response = await updateUserStatus(userId, status);
      if (response.success) {
        toast.success(response.message);
        setConfirmModal({ ...confirmModal, isOpen: false });
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const openConfirmModal = (user, status) => {
    setConfirmModal({
      isOpen: true,
      userId: user._id,
      status: status,
      userName: user.name,
      currentStatus: user.status
    });
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const response = await adminCreateUser(newUser);
      if (response.success) {
        toast.success('Professional account created and approved!');
        setIsCreateModalOpen(false);
        setNewUser({ name: '', mobile: '', businessName: '', password: '' });
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
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Access ID</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-24 text-center">
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
                    <tr key={user._id} className="hover:bg-slate-50/50 transition-colors group">
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
                        <code className="text-[11px] font-mono font-black text-indigo-600 bg-indigo-50/50 px-3 py-1.5 rounded-lg border border-indigo-100/50">{user.userToken}</code>
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
                          >
                            <Eye size={18} />
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
                disabled={createLoading}
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
                label="Full Name"
                placeholder="John Doe"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
              <InputBox
                icon={<Briefcase size={18} />}
                label="Business Name"
                placeholder="Acme Corp"
                value={newUser.businessName}
                onChange={(e) => setNewUser({ ...newUser, businessName: e.target.value })}
              />
            </div>
            <InputBox
              icon={<Phone size={18} />}
              label="WhatsApp Mobile"
              placeholder="9876543210"
              value={newUser.mobile}
              onChange={(e) => setNewUser({ ...newUser, mobile: e.target.value })}
            />
            <InputBox
              icon={<Lock size={18} />}
              label="Temporary Password"
              type="password"
              placeholder="••••••••"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
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

            {/* Warning Box */}
            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 flex space-x-4">
              <div className="shrink-0 pt-0.5">
                <AlertCircle className="text-amber-600" size={20} />
              </div>
              <div className="space-y-1">
                <p className="text-[13px] font-bold text-amber-900 leading-relaxed">
                  This will grant the user access to professional features. This action can be reversed at any time from the management panel.
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
    <td className="px-8 py-5"><div className="h-4 bg-slate-100 w-16 rounded"></div></td>
    <td className="px-8 py-5"><div className="h-8 bg-slate-100 w-8 rounded ml-auto"></div></td>
  </tr>
);

const InputBox = ({ icon, label, placeholder, value, onChange, type = "text" }) => (
  <div className="space-y-2">
    <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">{label}</label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
        {icon}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
      />
    </div>
  </div>
);

export default UsersManagement;
