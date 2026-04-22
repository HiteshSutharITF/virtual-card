import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllUsers, updateUserStatus } from '../../services/admin.service';
import Layout from '../../components/layout/Layout';
import { toast } from 'react-hot-toast';
import { Search, UserCheck, UserX, Clock, Filter, MoreVertical, Eye, MapPin, Briefcase, Phone, MessageSquare } from 'lucide-react';
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
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleStatusUpdate = async (id, status) => {
    try {
      const response = await updateUserStatus(id, status);
      if (response.success) {
        toast.success(response.message);
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.mobile.includes(searchTerm);
    const matchesFilter = filter === 'all' || user.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">User Directory</h1>
            <p className="text-slate-500 font-medium">Manage registrations and account status</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or mobile..."
                className="glass rounded-2xl py-3 pl-12 pr-6 border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-slate-200">
              {['all', 'pending', 'approved'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${filter === f ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="glass rounded-[2rem] overflow-hidden border-slate-200 shadow-xl shadow-slate-200/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">User Details</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Business</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Token</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-medium">No users found matching your criteria.</td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-indigo-50/50 group-hover:ring-white transition-all">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{user.name}</p>
                            <p className="text-xs text-slate-500 font-medium">{user.mobile}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-semibold text-slate-700">{user.businessName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{user.createdBy === 'admin' ? 'Admin Created' : 'Self Registered'}</p>
                      </td>
                      <td className="px-8 py-5">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="px-8 py-5">
                        <code className="text-xs font-mono font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md">{user.userToken}</code>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {user.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(user._id, 'approved')}
                                className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                title="Approve"
                              >
                                <UserCheck size={18} />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(user._id, 'rejected')}
                                className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                title="Reject"
                              >
                                <UserX size={18} />
                              </button>
                            </>
                          )}
                          <Link
                            to={`/admin/users/${user._id}/scanned`}
                            className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                            title="Scan History"
                          >
                            <Clock size={18} />
                          </Link>
                          <button
                            onClick={() => handleViewUser(user)}
                            className="p-2 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-800 hover:text-white transition-all shadow-sm"
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

        {/* User View Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="User Scan Details"
          size="md"
        >
          {selectedUser && (
            <div className="space-y-8 py-4">
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

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          )}
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

export default UsersManagement;
