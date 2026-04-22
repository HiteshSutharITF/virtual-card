import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile } from '../../services/user.service';
import Layout from '../../components/layout/Layout';
import { toast } from 'react-hot-toast';
import { Download, Share2, ShieldCheck, Info, Smartphone, Mail, Phone, MapPin, Globe } from 'lucide-react';
import { getWhatsAppStatus } from '../../services/whatsapp.service';
import { toPng } from 'html-to-image';

const UserDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [waStatus, setWaStatus] = useState('disconnected');
  const [loading, setLoading] = useState(true);
  const cardRef = useRef(null);

  const fetchData = async () => {
    try {
      const response = await getUserProfile();
      if (response.success) {
        setProfile(response.data);
      }

      const waRes = await getWhatsAppStatus();
      if (waRes.success) {
        setWaStatus(waRes.data.status);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Polling for WA status
    return () => clearInterval(interval);
  }, []);

  const qrValue = `https://wa.me/91${profile?.adminMobile || ''}?text=Please%20share%20the%20contact%20of%20${encodeURIComponent(profile?.name || '')}%20-${encodeURIComponent(profile?.businessName || '')}%20${profile?.userToken || ''}`;

  const downloadCard = async () => {
    if (cardRef.current === null) return;
    
    const loadingToast = toast.loading('Generating print-quality card...');
    try {
      const dataUrl = await toPng(cardRef.current, { 
        cacheBust: true, 
        pixelRatio: 4, // Ultra high resolution for "real" look
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `Professional-Card-${profile?.name}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Card ready for sharing!', { id: loadingToast });
    } catch (err) {
      toast.error('Failed to generate card.', { id: loadingToast });
      console.error(err);
    }
  };

  if (loading) return <Layout><div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div></Layout>;

  return (
    <Layout>
      <div className="space-y-12 max-w-6xl mx-auto px-4">
        {/* Header with WhatsApp Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Business Hub</h1>
            <div className="flex items-center space-x-2 text-slate-500 mt-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <p className="font-semibold text-sm">System Connected: {profile?.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
             <div className="glass px-4 py-2 rounded-xl flex items-center space-x-3 border-slate-200 shadow-sm bg-white/50">
              <Smartphone size={16} className={
                waStatus === 'connected' ? 'text-emerald-500' : 
                waStatus === 'disconnected' ? 'text-rose-500' : 
                'text-amber-500'
              } />
              <span className={`text-[10px] font-black uppercase tracking-widest ${
                waStatus === 'connected' ? 'text-emerald-600' : 
                waStatus === 'disconnected' ? 'text-rose-600' : 
                'text-amber-600'
              }`}>{waStatus}</span>
            </div>
            <button
              onClick={downloadCard}
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
            >
              <Download size={18} />
              <span>Export Card</span>
            </button>
          </div>
        </div>

        <div className="space-y-16">
          {/* Authentic Business Card Display */}
          <div className="flex flex-col items-center justify-center space-y-10">
            <div className="w-full flex flex-col items-center">
              <div 
                ref={cardRef}
                className="w-full max-w-[620px] aspect-[1.75/1] bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] rounded-sm border border-slate-100 flex overflow-hidden relative"
              >
                {/* Left Accent Bar */}
                <div className="w-4 bg-indigo-600 h-full"></div>
                
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col p-10 justify-between">
                  {/* Business Brand Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black italic">VC</div>
                      <span className="text-sm font-black uppercase tracking-[0.3em] text-slate-800">{profile?.businessName}</span>
                    </div>
                  </div>

                  {/* Personal Brand Section */}
                  <div className="space-y-1">
                    <h3 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">{profile?.name}</h3>
                    <p className="text-indigo-600 text-[10px] font-black uppercase tracking-widest">Digital Connection &bull; Verified Partner</p>
                  </div>

                  {/* Contact Grid */}
                  <div className="flex items-end justify-between pt-4">
                    <div className="grid grid-cols-1 gap-y-2">
                      <CardContactItem icon={<Phone size={12} />} value={`+91 ${profile?.mobile}`} />
                    </div>
                  </div>
                </div>

                {/* Secure QR Vault */}
                <div className="w-[200px] bg-slate-50/30 border-l border-slate-50 flex flex-col items-center justify-center p-8">
                  <div className="p-3 bg-white shadow-sm ring-1 ring-slate-100 rounded-lg mb-4">
                    <QRCodeSVG
                      id="user-qr"
                      value={qrValue}
                      size={130}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">SCAN FOR CONTACT</p>
                </div>

                {/* Secure Watermark */}
                <div className="absolute bottom-6 right-8 opacity-40">
                   <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-300">
                     Powered by <span className="text-slate-400">itfuturz</span>
                   </p>
                </div>
              </div>
              <p className="mt-8 text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Previewing Digital Master &bull; Ready for Download</p>
            </div>

            {/* Utility & Info Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
              <div className="glass rounded-[2rem] p-8 border-slate-200/60 bg-white/40 shadow-sm flex items-start space-x-6">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm flex-shrink-0">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-800 mb-2 tracking-tight">Verified Protocol</h4>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    Your digital card uses <span className="text-indigo-600 font-bold">Encrypted QR Bridge</span> technology. Scanners are automatically redirected to our secure contact exchange bot.
                  </p>
                </div>
              </div>

              <div className="glass rounded-[2rem] p-8 border-slate-200/60 bg-white/40 shadow-sm">
                <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-4">Digital Identity Signature</p>
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-inner italic text-slate-600 text-sm leading-relaxed">
                  "{profile?.customMessage}"
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const CardContactItem = ({ icon, value }) => (
  <div className="flex items-center space-x-2 text-slate-500">
    <div className="text-indigo-600">{icon}</div>
    <span className="text-[10px] font-bold tracking-tight">{value}</span>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-1">
    <span className="text-sm font-medium text-slate-500">{label}</span>
    <span className="text-sm font-bold text-slate-800">{value}</span>
  </div>
);

export default UserDashboard;
