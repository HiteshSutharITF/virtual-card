import React, { useState, useEffect } from 'react';
import { getScannedContacts, exportScannedContacts } from '../../services/user.service';
import Layout from '../../components/layout/Layout';
import { toast } from 'react-hot-toast';
import { Search, Calendar, Phone, User, Clock, Filter, ArrowUpRight, Download, Loader2 } from 'lucide-react';

const ScannedContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchContacts = async () => {
    try {
      const response = await getScannedContacts();
      if (response.success) {
        setContacts(response.data);
      }
    } catch (error) {
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleDownloadExcel = async () => {
    if (contacts.length === 0) {
      toast.error('No contacts to download');
      return;
    }
    setDownloading(true);
    try {
      const response = await exportScannedContacts();
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `connections_report_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Excel registry downloaded');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download registry');
    } finally {
      setDownloading(false);
    }
  };

  const filteredContacts = contacts.filter(contact => 
    contact.scannerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    contact.scannerMobile.includes(searchTerm)
  );

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Connection History</h1>
            <p className="text-slate-500 font-medium">People who have scanned your professional QR code</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={handleDownloadExcel}
              disabled={downloading || contacts.length === 0}
              className="flex items-center space-x-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Download size={18} />
              )}
              <span>Download Registry</span>
            </button>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search index..."
                className="glass rounded-2xl py-3.5 pl-12 pr-6 border-slate-200 text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none w-full sm:w-64 transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="flex items-center space-x-6 overflow-x-auto pb-2 scrollbar-hide">
          <HistoryStat label="Total Scans" value={contacts.length} icon={<ArrowUpRight size={20} />} />
          <HistoryStat label="This Week" value={contacts.filter(c => new Date(c.scannedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} icon={<Calendar size={20} />} />
        </div>

        {/* Contacts List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
          ) : filteredContacts.length === 0 ? (
            <div className="col-span-full py-20 text-center glass rounded-[2.5rem]">
              <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-4">
                <User size={32} />
              </div>
              <p className="text-slate-400 font-bold">No connections found yet.</p>
              <p className="text-slate-400 text-xs mt-1">Share your QR code to start getting scans!</p>
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <ContactCard key={contact._id} contact={contact} />
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

const ContactCard = ({ contact }) => (
  <div className="glass rounded-[2rem] p-6 card-hover group border border-slate-100">
    <div className="flex items-start justify-between mb-6">
      <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-xl ring-8 ring-indigo-50/30 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
        {contact.scannerName.charAt(0)}
      </div>
      <div className="flex flex-col items-end">
        <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 flex items-center mb-1">
          <Clock size={10} className="mr-1" /> {new Date(contact.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <span className="text-xs font-bold text-slate-700">
          {new Date(contact.scannedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
    
    <div className="space-y-4">
      <div>
        <h4 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors uppercase truncate">
          {contact.scannerName}
        </h4>
        <div className="flex items-center text-slate-500 text-sm mt-1">
          <Phone size={14} className="mr-2" />
          <span className="font-medium">{contact.scannerMobile}</span>
        </div>
      </div>
      
      <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">Verified Connection</span>
        <button className="text-indigo-600 p-1 hover:bg-indigo-50 rounded-lg transition-colors">
          <ArrowUpRight size={18} />
        </button>
      </div>
    </div>
  </div>
);

const HistoryStat = ({ label, value, icon }) => (
  <div className="glass px-6 py-4 rounded-2xl flex items-center space-x-4 border-slate-200 shadow-sm min-w-[200px]">
    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
      {icon}
    </div>
    <div>
      <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{label}</p>
      <p className="text-xl font-extrabold text-slate-800">{value}</p>
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="glass rounded-[2rem] p-6 animate-pulse">
    <div className="flex items-start justify-between mb-6">
      <div className="w-14 h-14 bg-slate-100 rounded-2xl"></div>
      <div className="h-4 bg-slate-50 w-20 rounded"></div>
    </div>
    <div className="space-y-2">
      <div className="h-6 bg-slate-100 w-3/4 rounded"></div>
      <div className="h-4 bg-slate-50 w-1/2 rounded"></div>
    </div>
  </div>
);

export default ScannedContacts;
