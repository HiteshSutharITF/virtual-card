import React, { useState, useEffect } from 'react';
import { getScannedContacts, exportScannedContacts } from '../../services/user.service';
import Layout from '../../components/layout/Layout';
import { toast } from 'react-hot-toast';
import { Search, Calendar, Phone, User, Clock, Filter, ArrowUpRight, Download, Loader2, RefreshCcw, AlertCircle } from 'lucide-react';

const ScannedContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchContacts = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    
    try {
      const response = await getScannedContacts();
      if (response.success) {
        setContacts(response.data);
        if (isRefresh) toast.success('Registry updated');
      } else {
        setError(response.message || 'Failed to load contacts');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to load connection history. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
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
    contact.scannerName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    contact.scannerMobile?.includes(searchTerm)
  );

  return (
    <Layout>
      <div className="space-y-8 pb-10">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Connection History</h1>
            <p className="text-slate-500 font-medium">People who have scanned your professional QR code</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
              <button
                onClick={() => fetchContacts(true)}
                disabled={refreshing || loading}
                className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                title="Refresh Registry"
              >
                <RefreshCcw size={20} className={refreshing ? 'animate-spin' : ''} />
              </button>

              <button
                onClick={handleDownloadExcel}
                disabled={downloading || contacts.length === 0}
                className="flex-1 flex items-center justify-center space-x-2 bg-slate-900 text-white px-5 py-3.5 rounded-2xl font-bold text-sm hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {downloading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Download size={18} />
                )}
                <span>Download Registry</span>
              </button>
            </div>

            <div className="relative flex-1 sm:min-w-[280px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search Index..."
                className="w-full glass rounded-2xl py-3.5 pl-12 pr-6 border-slate-200 text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="flex items-center space-x-4 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
          <HistoryStat label="Total Scans" value={contacts.length} icon={<ArrowUpRight size={20} />} />
          <HistoryStat label="This Week" value={contacts.filter(c => new Date(c.scannedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} icon={<Calendar size={20} />} />
        </div>

        {/* Contacts List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
          ) : error ? (
            <div className={`col-span-full py-20 text-center glass rounded-[2.5rem] ${error.includes('subscription') ? 'border-amber-100 bg-amber-50/10' : 'border-red-100 bg-red-50/10'}`}>
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 ${error.includes('subscription') ? 'bg-amber-50 text-amber-500' : 'bg-red-50 text-red-500'}`}>
                {error.includes('subscription') ? <AlertCircle size={32} /> : <RefreshCcw size={32} />}
              </div>
              <h3 className="text-slate-800 font-bold text-xl mb-2 px-4">
                {error.includes('subscription') ? 'Subscription Required' : error}
              </h3>
              {error.includes('subscription') ? (
                <p className="text-slate-500 mb-6 max-w-sm mx-auto font-medium">{error}</p>
              ) : (
                <p className="text-slate-400 text-sm mb-6">We encountered an issue while fetching your connections.</p>
              )}
              {error.includes('subscription') ? (
                <a 
                  href="mailto:info@itfuturz.com"
                  className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-slate-900 transition-all shadow-lg active:scale-95"
                >
                  <Phone size={16} />
                  <span>Contact Support</span>
                </a>
              ) : (
                <button 
                  onClick={() => fetchContacts()}
                  className="inline-flex items-center space-x-2 bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
                >
                  <RefreshCcw size={16} />
                  <span>Retry Now</span>
                </button>
              )}
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="col-span-full py-20 text-center glass rounded-[2.5rem]">
              <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-4">
                <User size={32} />
              </div>
              <h3 className="text-slate-800 font-bold text-xl mb-2">No connections found yet</h3>
              <p className="text-slate-400 text-sm mb-6">Share your QR code to start building your professional network!</p>
              <button 
                onClick={() => fetchContacts(true)}
                className="inline-flex items-center space-x-2 text-indigo-600 font-bold hover:underline"
              >
                <RefreshCcw size={14} />
                <span>Refresh Registry</span>
              </button>
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

const ContactCard = ({ contact }) => {
  const openWhatsApp = () => {
    const whatsappUrl = `https://wa.me/91${contact.scannerMobile}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div 
      onClick={openWhatsApp}
      className="glass rounded-[2rem] p-6 card-hover group border border-slate-100 cursor-pointer transition-all active:scale-[0.98]"
    >
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
            <Phone size={14} className="mr-2 text-emerald-500" />
            <span className="font-medium">{contact.scannerMobile}</span>
          </div>
        </div>
        
        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">Verified Connection</span>
          <div className="text-indigo-600 p-1 bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white rounded-lg transition-colors">
            <ArrowUpRight size={18} />
          </div>
        </div>
      </div>
    </div>
  );
};

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
