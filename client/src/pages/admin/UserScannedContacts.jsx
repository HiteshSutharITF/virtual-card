import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link } from 'react-router-dom';
import { getUserScannedContacts, updateScannedContact } from '../../services/admin.service';
import Layout from '../../components/layout/Layout';
import { toast } from 'react-hot-toast';
import { Search, Calendar, Phone, User, Clock, ArrowLeft, ArrowUpRight, Filter, Edit2, FileText, X, Loader2 } from 'lucide-react';

const UserScannedContacts = () => {
  const { id } = useParams();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userName, setUserName] = useState('User');
  const [editingContact, setEditingContact] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
          <HistoryStat label="Latest Scan" value={contacts.length > 0 ? new Date(contacts[0].scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'} icon={<Clock size={20} />} color="bg-violet-600" />
        </div>

        {/* Contacts Table/List */}
        <div className="glass rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scanner Details</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notes</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Scan Date</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
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
                            <p className="text-sm font-bold text-slate-800 uppercase">{contact.scannerName}</p>
                            <p className="text-xs text-slate-500 font-medium">{contact.scannerMobile}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        {contact.notes ? (
                          <div 
                            onClick={() => {
                              setEditingContact(contact);
                              setIsEditModalOpen(true);
                            }}
                            className="flex items-start text-slate-700 max-w-[200px] cursor-pointer hover:bg-white p-2 rounded-lg border border-transparent hover:border-slate-100 transition-all group/notes"
                          >
                            <FileText size={14} className="mr-2 text-indigo-500 mt-0.5 shrink-0" />
                            <span className="text-xs font-medium italic line-clamp-2">"{contact.notes}"</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300 italic">No notes</span>
                        )}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <p className="text-sm font-bold text-slate-700">{new Date(contact.scannedAt).toLocaleDateString()}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(contact.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button
                          onClick={() => {
                            setEditingContact(contact);
                            setIsEditModalOpen(true);
                          }}
                          className="p-2 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 rounded-xl transition-all shadow-sm group-hover:shadow-md"
                          title="Edit Contact Details"
                        >
                          <Edit2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && (
          <EditContactModal
            contact={editingContact}
            onClose={() => setIsEditModalOpen(false)}
            onSuccess={() => {
              setIsEditModalOpen(false);
              fetchContacts();
            }}
          />
        )}
      </div>
    </Layout>
  );
};

const EditContactModal = ({ contact, onClose, onSuccess }) => {
  const [name, setName] = useState(contact?.scannerName || '');
  const [notes, setNotes] = useState(contact?.notes || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name is required');

    setLoading(true);
    try {
      const response = await updateScannedContact(contact._id, {
        scannerName: name,
        notes: notes
      });
      if (response.success) {
        toast.success('Contact updated successfully');
        onSuccess();
      } else {
        toast.error(response.message || 'Failed to update contact');
      }
    } catch (error) {
      toast.error('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Edit Contact</h2>
            <p className="text-slate-500 text-sm font-medium">Update person details and add notes</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white hover:text-red-500 rounded-2xl transition-all text-slate-400 shadow-sm border border-transparent hover:border-slate-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Contact Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
                <input
                  type="text"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 pl-12 pr-6 text-sm font-bold text-slate-800 focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Notes (Optional)</label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 text-indigo-500" size={18} />
                <textarea 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 pl-12 pr-6 text-sm font-bold text-slate-800 focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-300 min-h-[100px] resize-none"
                  placeholder="Add any notes about this contact..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Mobile Number</p>
                  <p className="text-sm font-bold text-indigo-900">{contact.scannerMobile}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-6 border-2 border-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-all text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-4 px-6 bg-slate-900 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all text-sm shadow-xl shadow-indigo-100 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <span>Save Changes</span>
                  <ArrowUpRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
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
