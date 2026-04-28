import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { getOtpLogs, deleteAllOtpLogs } from '../../services/admin.service';
import { toast } from 'react-hot-toast';
import { ShieldCheck, Clock, Phone, Hash, Search, Loader2, RefreshCw, Trash2, User } from 'lucide-react';

const AdminOtpLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async (isRefresh = false) => {
    if (isRefresh) setLoading(true);
    try {
      const response = await getOtpLogs();
      if (response.success) {
        setLogs(response.data);
        if (isRefresh) toast.success('Logs refreshed');
      }
    } catch (error) {
      toast.error('Failed to load OTP logs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete all OTP logs? This action cannot be undone.')) return;
    
    setDeleteLoading(true);
    try {
      const response = await deleteAllOtpLogs();
      if (response.success) {
        toast.success(response.message);
        setLogs([]);
      }
    } catch (error) {
      toast.error('Failed to delete logs');
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.mobile?.includes(searchTerm) || 
    log.otp?.includes(searchTerm) ||
    log.type?.includes(searchTerm) ||
    log.userName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Security & OTP Logs</h1>
            <p className="text-slate-500 font-medium">Monitor authentication codes and verification attempts</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchLogs(true)}
              disabled={loading}
              className="p-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              title="Refresh Logs"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleDeleteAll}
              disabled={deleteLoading || logs.length === 0}
              className="flex items-center space-x-2 bg-rose-50 text-rose-600 px-5 py-3.5 rounded-2xl font-bold hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {deleteLoading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
              <span className="text-sm">Clear All</span>
            </button>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search mobile, name or OTP..."
                className="glass rounded-2xl py-3.5 pl-12 pr-6 border-slate-200 text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none w-full sm:w-64 transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="glass rounded-[2rem] overflow-hidden border-slate-200 shadow-xl shadow-indigo-100/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">User</th>

                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">OTP Code</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Type</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Sent Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-4">
                          <ShieldCheck size={32} />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">No logs found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-black text-xs">
                            {log.userName?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700 tracking-tight">{log.userName}</span>
                            <div className="flex items-center space-x-1.5 text-slate-500 mt-0.5">
                              <Phone size={10} />
                              <span className="text-[10px] font-bold tracking-wider">{log.mobile}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[13px] font-mono font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                          {log.otp}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          {log.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <StatusBadge status={log.status} />
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-2 text-slate-400">
                          <Clock size={14} />
                          <span className="text-xs font-medium">
                            {new Date(log.createdAt).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    sent: 'bg-indigo-100 text-indigo-600 ring-indigo-50',
    verified: 'bg-emerald-100 text-emerald-600 ring-emerald-50',
    expired: 'bg-rose-100 text-rose-600 ring-rose-50',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] ring-4 ${styles[status] || styles.expired}`}>
      {status}
    </span>
  );
};

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-8 py-5"><div className="h-4 bg-slate-100 w-24 rounded"></div></td>
    <td className="px-8 py-5"><div className="h-4 bg-slate-100 w-16 rounded"></div></td>
    <td className="px-8 py-5"><div className="h-4 bg-slate-100 w-24 rounded"></div></td>
    <td className="px-8 py-5"><div className="h-6 bg-slate-100 w-20 rounded-full"></div></td>
    <td className="px-8 py-5"><div className="h-4 bg-slate-100 w-32 rounded"></div></td>
  </tr>
);

export default AdminOtpLogs;
