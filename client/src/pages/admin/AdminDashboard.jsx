import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllUsers } from '../../services/admin.service';
import { getWhatsAppStatus } from '../../services/whatsapp.service';
import Layout from '../../components/layout/Layout';
import { Users, UserCheck, MessageSquare, Smartphone, ArrowRight, Activity, ShieldCheck, Clock, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    expiredUsers: 0,
    totalScans: 0,
  });
  const [waStatus, setWaStatus] = useState('disconnected');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const usersRes = await getAllUsers();
      if (usersRes.success) {
        const users = usersRes.data;
        const now = new Date();
        setStats({
          totalUsers: users.length,
          pendingUsers: users.filter(u => u.status === 'pending').length,
          expiredUsers: users.filter(u => u.subscriptionExpiresAt && new Date(u.subscriptionExpiresAt) < now).length,
          totalScans: users.reduce((sum, u) => sum + (u.scansCount || 0), 0),
        });
      }

      const waRes = await getWhatsAppStatus();
      if (waRes.success) {
        setWaStatus(waRes.data.status);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Polling for status
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      <div className="space-y-10">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Admin Overview</h1>
            <p className="text-slate-500 mt-2 font-medium">Monitoring system health and user registrations</p>
          </div>
          <Link 
            to="/admin/whatsapp" 
            className="glass px-6 py-4 rounded-[2rem] flex items-center space-x-4 border-slate-200 card-hover"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              waStatus === 'connected' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
            }`}>
              <Smartphone size={24} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">WhatsApp Engine</p>
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${
                  waStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                }`}></span>
                <p className="text-sm font-bold text-slate-700 capitalize">{waStatus}</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<Users />} label="Total Users" value={stats.totalUsers} color="bg-indigo-600" />
          <StatCard icon={<UserCheck />} label="Pending" value={stats.pendingUsers} color="bg-amber-500" highlight={stats.pendingUsers > 0} />
          <StatCard icon={<Clock />} label="Expired" value={stats.expiredUsers} color="bg-rose-500" highlight={stats.expiredUsers > 0} />
          <StatCard icon={<BarChart3 />} label="Total Scans" value={stats.totalScans} color="bg-violet-600" />
        </div>

        {/* Action Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ActionCard 
            title="User Approvals" 
            desc="Review and approve new user registrations to grant platform access."
            icon={<UserCheck className="w-8 h-8" />}
            link="/admin/users"
            badge={stats.pendingUsers > 0 ? `${stats.pendingUsers} Pending` : null}
          />
          <ActionCard 
            title="WhatsApp Control" 
            desc="Manage the centralized WhatsApp bot connection and monitor QR codes."
            icon={<MessageSquare className="w-8 h-8" />}
            link="/admin/whatsapp"
            status={waStatus}
          />
        </div>
      </div>
    </Layout>
  );
};

const StatCard = ({ icon, label, value, color, highlight }) => (
  <div className={`glass rounded-[2rem] p-6 card-hover ${highlight ? 'ring-2 ring-pink-500/20' : ''}`}>
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg ${color}`}>
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <p className="text-sm font-semibold text-slate-500">{label}</p>
    <p className="text-3xl font-extrabold text-slate-800 mt-1">{value}</p>
  </div>
);

const ActionCard = ({ title, desc, icon, link, badge, status }) => (
  <Link to={link} className="glass rounded-[2.5rem] p-8 group relative overflow-hidden card-hover block">
    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -mr-16 -mt-16 group-hover:bg-indigo-50 transition-colors duration-500"></div>
    
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-6">
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-800 shadow-sm border border-slate-100">
          {icon}
        </div>
        {badge && <span className="px-4 py-1 bg-pink-100 text-pink-600 rounded-full text-xs font-bold">{badge}</span>}
        {status && (
          <span className={`px-4 py-1 rounded-full text-xs font-bold capitalize ${
            status === 'connected' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
          }`}>
            {status}
          </span>
        )}
      </div>
      
      <h3 className="text-2xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-sm">{desc}</p>
      
      <div className="flex items-center text-indigo-600 font-bold text-sm">
        <span>Open Console</span>
        <ArrowRight size={18} className="ml-2 group-hover:translate-x-2 transition-transform duration-300" />
      </div>
    </div>
  </Link>
);

export default AdminDashboard;
