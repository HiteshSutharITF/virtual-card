import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserScannedContacts } from '../../services/admin.service';
import Layout from '../../components/layout/Layout';
import { toast } from 'react-hot-toast';
import { Search, Calendar, Phone, User, Clock, ArrowLeft, ArrowUpRight, Filter } from 'lucide-react';

const UserScannedContacts = () => {
  const { id } = useParams();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userName, setUserName] = useState('User');

  const fetchContacts = async () => {
    try {
      const response = await getUserScannedContacts(id);
      if (response.success) {
        setContacts(response.data);
        // We could also fetch user details here to get the name, 
        // but for now we rely on the parent or list
      }
    } catch (error) {
      toast.error('Failed to load contact history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [id]);

  const filteredContacts = contacts.filter(contact => 
    contact.scannerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    contact.scannerMobile.includes(searchTerm)
  );

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <Link to="/admin/users" className="flex items-center text-indigo-600 font-bold text-xs hover:translate-x-[-4px] transition-transform">
              <ArrowLeft size={16} className="mr-1" /> Back to Users
            </Link>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Scan History</h1>
              <p className="text-slate-500 font-medium">Monitoring connections for this specific user account</p>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search scanners..."
              className="glass rounded-2xl py-3 pl-12 pr-6 border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none w-full sm:w-64 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <HistoryStat label="Total Leads" value={contacts.length} icon={<ArrowUpRight size={20} />} color="bg-indigo-600" />
          <HistoryStat label="New Today" value={contacts.filter(c => new Date(c.scannedAt).toDateString() === new Date().toDateString()).length} icon={<Calendar size={20} />} color="bg-emerald-500" />
          <HistoryStat label="Latest Scan" value={contacts.length > 0 ? new Date(contacts[0].scannedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'} icon={<Clock size={20} />} color="bg-violet-600" />
        </div>

        {/* Contacts Table/List */}
        <div className="glass rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scanner Details</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Scan Date</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
                ) : filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-8 py-20 text-center text-slate-400 font-medium italic">
                      No scan history found for this user yet.
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((contact) => (
                    <tr key={contact._id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-white shadow-sm border border-slate-100 text-slate-700 rounded-xl flex items-center justify-center font-bold text-xs group-hover:scale-110 transition-transform">
                            {contact.scannerName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{contact.scannerName}</p>
                            <p className="text-xs text-slate-500 font-medium">{contact.scannerMobile}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <p className="text-sm font-bold text-slate-700">{new Date(contact.scannedAt).toLocaleDateString()}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(contact.scannedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-extrabold uppercase tracking-widest ring-4 ring-emerald-50">Log Recorded</span>
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

const HistoryStat = ({ label, value, icon, color }) => (
  <div className="glass rounded-3xl p-6 flex items-center space-x-4 border-slate-200 shadow-sm transition-all hover:translate-y-[-2px]">
    <div className={`w-12 h-12 ${color} text-white rounded-2xl flex items-center justify-center shadow-lg`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{label}</p>
      <p className="text-2xl font-extrabold text-slate-800">{value}</p>
    </div>
  </div>
);

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-8 py-5"><div className="flex items-center space-x-4"><div className="w-10 h-10 bg-slate-100 rounded-xl"></div><div className="h-4 bg-slate-100 w-32 rounded"></div></div></td>
    <td className="px-8 py-5"><div className="h-4 bg-slate-100 w-24 mx-auto rounded"></div></td>
    <td className="px-8 py-5"><div className="h-6 bg-slate-100 w-24 ml-auto rounded-full"></div></td>
  </tr>
);

export default UserScannedContacts;
