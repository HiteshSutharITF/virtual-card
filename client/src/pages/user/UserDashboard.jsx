import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile } from '../../services/user.service';
import Layout from '../../components/layout/Layout';
import { toast } from 'react-hot-toast';
import { Download, Share2, ShieldCheck, Info, Smartphone, Mail, Phone, MapPin, Globe, Loader2 } from 'lucide-react';
import { getWhatsAppStatus } from '../../services/whatsapp.service';
import { toPng } from 'html-to-image';

const UserDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [waStatus, setWaStatus] = useState('disconnected');
  const [loading, setLoading] = useState(true);
  const [cardScale, setCardScale] = useState(1);
  const cardRef = useRef(null);
  const containerRef = useRef(null);

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

  const updateScale = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const cardWidth = 620; // Fixed internal width
      if (containerWidth < cardWidth) {
        setCardScale(containerWidth / cardWidth);
      } else {
        setCardScale(1);
      }
    }
  };

  useEffect(() => {
    fetchData();
    window.addEventListener('resize', updateScale);
    const interval = setInterval(fetchData, 10000);
    return () => {
      window.removeEventListener('resize', updateScale);
      clearInterval(interval);
    };
  }, []);

  // Recalculate scale when loading is done
  useEffect(() => {
    if (!loading) {
      // Small delay to ensure DOM is fully painted
      const timer = setTimeout(updateScale, 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const qrValue = `https://wa.me/91${profile?.adminMobile || ''}?text=Please%20share%20the%20contact%20of%20${encodeURIComponent(profile?.name || '')}%20-%20${encodeURIComponent(profile?.businessName || '')}%20${profile?.userToken || ''}`;

  const downloadCard = async () => {
    if (cardRef.current === null) return;

    const loadingToast = toast.loading('Generating high-resolution card...');
    try {
      // Ensure the capture happens at 1:1 scale even if preview is scaled
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: '#ffffff',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        }
      });

      const link = document.createElement('a');
      link.download = `${profile?.name?.replace(/\s+/g, '-')}-Visual-Identity.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Card downloaded successfully!', { id: loadingToast });
    } catch (err) {
      toast.error('Failed to generate card.', { id: loadingToast });
      console.error(err);
    }
  };

  if (loading) return <Layout><div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div></Layout>;

  return (
    <Layout>
      <div className="space-y-12 max-w-6xl mx-auto sm:px-4">
        {/* Header with WhatsApp Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Business Hub</h1>
            <div className="flex items-center space-x-2 text-slate-500 mt-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <p className="font-semibold text-sm">Active Session: {profile?.name}</p>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end w-full md:w-auto">
            {waStatus === 'connected' ? (
              <div className="flex items-center space-x-3 bg-emerald-50 border border-emerald-100 px-5 py-2.5 rounded-2xl shadow-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">
                  Systems Active &bull; Ready to Connect
                </span>
              </div>
            ) : waStatus === 'reconnecting' ? (
              <div className="flex items-center space-x-3 bg-amber-50 border border-amber-100 px-5 py-2.5 rounded-2xl shadow-sm">
                <Loader2 className="w-3 h-3 text-amber-500 animate-spin" />
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none">
                  Initializing Bridge... Please Wait
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center md:items-end space-y-2">
                <div className="flex items-center space-x-3 bg-rose-50 border border-rose-100 px-5 py-2.5 rounded-2xl shadow-sm">
                  <Smartphone size={14} className="text-rose-500" />
                  <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest leading-none">
                    Company Offline &bull; Action Required
                  </span>
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em] text-center md:text-right">
                  WhatsApp Support: <span className="text-rose-500 tracking-normal">+91 {profile?.adminMobile || 'ADMIN'}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-16">
          {/* Authentic Business Card Display */}
          <div className="flex flex-col items-center justify-center w-full overflow-hidden">
            <div
              ref={containerRef}
              className="w-full flex justify-center py-6 sm:py-10"
            >
              {/* Outer sizing container that defines the layout space */}
              <div
                style={{
                  width: 620 * cardScale,
                  height: 360 * cardScale,
                  position: 'relative',
                  transition: 'all 0.3s ease-out'
                }}
                className="flex-shrink-0"
              >
                {/* Fixed-size card that is scaled down to fit the outer container */}
                <div
                  ref={cardRef}
                  style={{
                    width: '620px',
                    height: '360px',
                    transform: `scale(${cardScale})`,
                    transformOrigin: 'top left',
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}
                  className="bg-white shadow-[0_40px_80px_-15px_rgba(0,0,0,0.12)] rounded-sm border border-slate-100 flex overflow-hidden group hover:shadow-2xl transition-shadow duration-500"
                >
                  {/* Left Accent Bar */}
                  <div className="w-4 bg-indigo-600 h-full"></div>

                  {/* Main Content Area */}
                  <div className="flex-1 flex flex-col p-10 justify-between">
                    {/* Business Brand Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 via-slate-900 to-black rounded-xl flex items-center justify-center text-white font-black italic tracking-tighter shadow-lg ring-1 ring-white/20">VC</div>
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
                        <CardContactItem icon={<Smartphone size={12} />} value="WhatsApp Link Active" />
                      </div>
                    </div>
                  </div>

                  {/* Secure QR Section */}
                  <div className="w-[200px] bg-slate-50/50 border-l border-slate-50 flex flex-col items-center justify-center p-8">
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
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center space-y-6">
              <button
                onClick={downloadCard}
                className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex items-center space-x-3 group"
              >
                <Download size={18} className="group-hover:rotate-12 transition-transform" />
                <span>Save Card</span>
              </button>

              <div className="flex flex-col items-center space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
                  Visual Identity Signature &bull; {cardScale < 1 ? 'Scaled to Viewport' : 'Native High-Res'}
                </p>
                <div className="flex items-center space-x-2 text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em]">
                  <ShieldCheck size={10} />
                  <span>Encrypted Connection Enabled</span>
                </div>
              </div>
            </div>

            {/* Utility & Info Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full mt-16">
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

export default UserDashboard;
