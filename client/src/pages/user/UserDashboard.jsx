import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/layout/Layout';
import { toast } from 'react-hot-toast';
import { Download, Save, ShieldCheck, Info, Smartphone, Loader2, QrCode, Image, Clock } from 'lucide-react';
import { getWhatsAppStatus } from '../../services/whatsapp.service';
import { toPng } from 'html-to-image';
import { Phone } from 'lucide-react';
import { updateUserProfile, getUserProfile } from '../../services/user.service';
import Modal from '../../components/common/Modal';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Keyboard } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const IdentityCard = React.forwardRef(function IdentityCard({ profile, qrValue, cardScale = 1, unscaled, isExpired }, ref) {
  return (
    <div
      ref={ref}
      style={{
        width: '480px',
        height: '270px',
        ...(!unscaled ? { transform: `scale(${cardScale})`, transformOrigin: 'top left' } : {}),
      }}
      className="bg-white border border-slate-100 shadow-sm flex overflow-hidden rounded-sm relative"
    >
      {isExpired && (
        <div className="absolute inset-0 z-50 bg-white/40 backdrop-blur-[1px] flex items-center justify-center rotate-[-15deg] pointer-events-none select-none">
          <div className="border-[12px] border-rose-500/30 px-12 py-6 rounded-[3rem]">
            <span className="text-7xl font-black text-rose-500/40 uppercase tracking-[0.3em]">Expired</span>
          </div>
        </div>
      )}
      <div className="w-2.5 bg-indigo-600 flex-shrink-0" />
      <div className="flex-1 flex flex-col px-6 py-5 justify-between relative">
        {profile?.logo ? (
          <>
            <div className="pb-3 border-b border-slate-100">
              <img src={`${import.meta.env.VITE_API_BASE_URL.split('/api')[0]}${profile.logo}`} alt="Logo" className="h-8 w-auto object-contain" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-snug max-w-[220px]">{profile?.name}</h3>
              <span className="text-[8px] font-extrabold uppercase tracking-[0.18em] text-slate-400 mt-0.5 block">{profile?.businessName}</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 bg-slate-900 rounded-md flex items-center justify-center text-white font-black text-[10px]">VC</div>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-700">{profile?.businessName}</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">{profile?.name}</h3>
              <p className="text-indigo-500 text-[8px] font-extrabold uppercase tracking-widest mt-0.5">Verified Digital Profile</p>
            </div>
          </>
        )}
        <div className="flex items-center gap-1.5 text-slate-500">
          <Phone size={10} className="text-indigo-400" />
          <span className="text-[10px] font-semibold">+91 {profile?.mobile}</span>
        </div>
      </div>
      <div className="w-[140px] bg-slate-50 border-l border-slate-100 flex flex-col items-center justify-center gap-2 p-4 relative">
        <div className="p-2 bg-white shadow-sm rounded">
          <QRCodeSVG value={qrValue} size={100} level="M" includeMargin={false} />
        </div>
        <p className="text-[7px] font-bold uppercase tracking-[0.15em] text-slate-400">Scan to Connect</p>
        <div className="absolute bottom-2 left-0 right-0 text-center text-[6px] font-bold uppercase tracking-wider text-slate-300/80">Powered by itfuturz</div>
      </div>
    </div>
  );
});

const UserDashboard = () => {
  const { user } = useAuth();
  const [activeSlide, setActiveSlide] = useState(0);
  const [profile, setProfile] = useState(null);
  const [waStatus, setWaStatus] = useState('disconnected');
  const [loading, setLoading] = useState(true);
  const [cardScale, setCardScale] = useState(1);
  const [customMessage, setCustomMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const desktopCardRef = useRef(null);
  const mobileCardRef = useRef(null);
  const desktopQrRef = useRef(null);
  const mobileQrRef = useRef(null);
  const desktopContainerRef = useRef(null);
  const mobileContainerRef = useRef(null);
  const swiperRef = useRef(null);

  const getVisibleNode = (desktopRef, mobileRef) => {
    const d = desktopRef.current;
    const m = mobileRef.current;
    const visible = (n) => n && n.getClientRects().length > 0;
    if (visible(d)) return d;
    if (visible(m)) return m;
    return d || m;
  };

  const fetchData = async () => {
    try {
      const response = await getUserProfile();
      if (response.success) {
        setProfile(response.data);
        setCustomMessage(response.data.customMessage || '');
      }
      const waRes = await getWhatsAppStatus();
      if (waRes.success) setWaStatus(waRes.data.status);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const updateScale = () => {
    const target = window.innerWidth >= 1024 ? desktopContainerRef.current : mobileContainerRef.current;
    if (target) {
      const w = target.offsetWidth;
      const cardW = 480;
      if (w > 0) setCardScale(w < cardW ? w / cardW : 1);
    }
  };

  useEffect(() => {
    fetchData();
    updateScale();
    window.addEventListener('resize', updateScale);
    const interval = setInterval(fetchData, 10000);
    return () => { window.removeEventListener('resize', updateScale); clearInterval(interval); };
  }, []);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(updateScale, 150);
      return () => clearTimeout(t);
    }
  }, [loading, activeSlide, cardScale]);

  const isExpired = profile?.subscriptionExpiresAt && new Date(profile.subscriptionExpiresAt) < new Date();

  const qrValue = isExpired
    ? "Subscription Expired. Please renew your plan to continue using this service."
    : `https://wa.me/91${profile?.adminMobile || ''}?text=Please%20share%20the%20contact%20of%20${encodeURIComponent(profile?.name || '')}%20-%20${encodeURIComponent(profile?.businessName || '')}%20${profile?.userToken || ''}`;

  const downloadCard = async () => {
    const cardEl = getVisibleNode(desktopCardRef, mobileCardRef);
    if (!cardEl) return;
    const id = toast.loading('Generating card...');
    try {
      const dataUrl = await toPng(cardEl, {
        cacheBust: true,
        pixelRatio: 4,
        backgroundColor: '#ffffff',
        style: { transform: 'scale(1)', transformOrigin: 'top left' }
      });
      const a = document.createElement('a');
      a.download = `${profile?.name?.split(' ')[0]}-Card.png`;
      a.href = dataUrl; a.click();
      toast.success('Downloaded!', { id });
    } catch { toast.error('Failed.', { id }); }
    finally { setIsModalOpen(false); }
  };

  const downloadQRCode = async () => {
    const qrEl = getVisibleNode(desktopQrRef, mobileQrRef);
    if (!qrEl) return;
    const id = toast.loading('Generating QR...');
    try {
      const dataUrl = await toPng(qrEl, {
        pixelRatio: 4,
        backgroundColor: '#ffffff',
        style: { padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
      });
      const a = document.createElement('a');
      a.download = `${profile?.name?.split(' ')[0]}-QR.png`;
      a.href = dataUrl; a.click();
      toast.success('Downloaded!', { id });
    } catch { toast.error('Failed.', { id }); }
    finally { setIsModalOpen(false); }
  };

  const handleSaveMessage = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append('customMessage', customMessage);
      const res = await updateUserProfile(fd);
      if (res.success) {
        toast.success('Saved!');
        setProfile(p => ({ ...p, customMessage }));
      }
    } catch { toast.error('Failed to save'); }
    finally { setIsSaving(false); }
  };

  if (loading) return (
    <Layout>
      <div className="flex justify-center items-center h-64">
        <div className="w-7 h-7 border-2 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-3 sm:px-5 py-4 space-y-4 pb-12">

        {/* ── Subscription Status ── */}
        <SubscriptionBanner expiry={profile?.subscriptionExpiresAt} />

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1 mb-0.5">
              <ShieldCheck size={10} className="text-indigo-500" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-500">Secure Portal</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">My Dashboard</h1>
            <p className="hidden lg:flex text-slate-400 text-xs mt-0.5">Digital identity &amp; connectivity</p>
          </div>
          <StatusBadge status={waStatus} />
        </div>

        {/* ── DESKTOP: side-by-side ── */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-start">
          {/* QR */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col items-center">
              <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-3 self-start">QR Code</div>
              <div ref={desktopQrRef} className="p-3 bg-white border border-slate-100 rounded-lg shadow-sm relative overflow-hidden group">
                <QRCodeSVG value={qrValue} size={180} level="H" includeMargin={false} />
                {isExpired && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center p-4 pointer-events-none select-none">
                    <div className="border-4 border-rose-500/40 px-4 py-2 rounded-xl rotate-[-15deg]">
                      <span className="text-3xl font-black text-rose-500/50 uppercase tracking-widest">Expired</span>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-400 text-center mt-2.5 leading-relaxed max-w-[160px]">
                {isExpired ? 'Renew subscription to reactivate QR' : 'Scanner instantly receives your business contact'}
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={isExpired}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={13} /> Download
              </button>
            </div>
          </div>

          {/* Card */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
              <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-3">Identity Card</div>
              <div ref={desktopContainerRef} className="w-full flex justify-center">
                <div style={{ width: 480 * cardScale, height: 270 * cardScale, position: 'relative' }}>
                  <IdentityCard ref={desktopCardRef} profile={profile} qrValue={qrValue} cardScale={cardScale} isExpired={isExpired} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── MOBILE: Swiper ── */}
        <div className="lg:hidden">
          {/* Pill tabs */}
          <div className="flex p-1 bg-slate-50/50 rounded-full mb-4 border border-slate-100">
            {['QR Code', 'Identity Card'].map((label, i) => (
              <button
                key={i}
                onClick={() => { setActiveSlide(i); swiperRef.current?.slideTo(i); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all 
                  ${i === 0 ? 'rounded-l-full' : 'rounded-r-full'} 
                  ${activeSlide === i
                    ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-700'
                    : 'bg-indigo-50/40 text-indigo-400'}`}
              >
                {i === 0 ? <QrCode size={12} /> : <Image size={12} />}
                {label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <Swiper
              modules={[Pagination, Keyboard]}
              spaceBetween={0}
              slidesPerView={1}
              keyboard={{ enabled: true }}
              onSwiper={s => (swiperRef.current = s)}
              onSlideChange={s => setActiveSlide(s.activeIndex)}
              className="w-full mobile-swiper-equal-slides"
            >
              {/* Slide 1: QR — panel height matches taller slide; content centered if shorter */}
              <SwiperSlide className="!flex !h-auto min-w-0 max-w-full flex-col self-stretch overflow-x-hidden">
                <div className="flex min-h-0 min-w-0 max-w-full flex-1 w-full flex-col items-center justify-center px-4 py-5">
                  <div className="flex flex-col items-center">
                    <div ref={mobileQrRef} className="p-3 bg-white border border-slate-100 rounded-lg shadow-sm inline-block relative overflow-hidden">
                      <QRCodeSVG value={qrValue} size={200} level="H" includeMargin={false} />
                      {isExpired && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center p-4 pointer-events-none select-none">
                          <div className="border-4 border-rose-500/40 px-4 py-2 rounded-xl rotate-[-15deg]">
                            <span className="text-4xl font-black text-rose-500/50 uppercase tracking-widest">Expired</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 text-center mt-2.5 leading-relaxed max-w-[200px]">
                      {isExpired ? 'Renew subscription to reactivate QR' : 'Scanner instantly receives your shared business contact'}
                    </p>
                  </div>
                </div>
              </SwiperSlide>

              {/* Slide 2: Card — same panel height as QR slide; clip so 480px layout cannot bleed into adjacent slide */}
              <SwiperSlide className="!flex !h-auto min-w-0 max-w-full flex-col self-stretch overflow-x-hidden">
                <div className="flex min-h-0 min-w-0 max-w-full flex-1 w-full flex-col items-center justify-center px-3 py-5">
                  <div className="flex min-w-0 max-w-full w-full flex-col items-center">
                    <div ref={mobileContainerRef} className="flex w-full min-w-0 max-w-full justify-center">
                      <div className="relative mx-auto shrink-0 overflow-hidden rounded-sm" style={{ width: 480 * cardScale, height: 270 * cardScale, maxWidth: '100%' }}>
                        <div
                          className="absolute left-0 top-0"
                          style={{
                            width: 480,
                            height: 270,
                            transform: `scale(${cardScale})`,
                            transformOrigin: 'top left',
                          }}
                        >
                          <IdentityCard ref={mobileCardRef} profile={profile} qrValue={qrValue} unscaled isExpired={isExpired} />
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 text-center mt-2.5 leading-relaxed max-w-[200px]">
                      Your verified visual identity card
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            </Swiper>

            {/* Dot nav */}
            <div className="flex justify-center gap-1.5 py-2.5">
              {[0, 1].map(i => (
                <button
                  key={i}
                  onClick={() => { setActiveSlide(i); swiperRef.current?.slideTo(i); }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${activeSlide === i ? 'bg-indigo-600 w-5' : 'bg-slate-200 w-1.5'}`}
                />
              ))}
            </div>

            {/* Download button */}
            <div className="px-4 pb-4">
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={isExpired}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={13} />
                Download {activeSlide === 0 ? 'QR Code' : 'Identity Card'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Custom Reply Message ── */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Custom Reply Message</h4>
              <p className="hidden lg:block text-[10px] text-slate-400 mt-0.5">Sent automatically when someone scans your QR</p>
            </div>
            <button
              onClick={handleSaveMessage}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
              Save
            </button>
          </div>
          <textarea
            value={customMessage}
            onChange={e => setCustomMessage(e.target.value)}
            placeholder="Enter auto-reply message..."
            className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5 text-[12px] text-slate-600 placeholder:text-slate-300 focus:bg-white focus:border-indigo-200 focus:ring-2 focus:ring-indigo-50 outline-none transition-all resize-none h-20"
          />
          <div className="flex items-center gap-1.5 mt-2">
            <Info size={10} className="text-indigo-400 flex-shrink-0" />
            <p className="text-[10px] text-slate-400 italic">Appears in scanner's WhatsApp upon scan.</p>
          </div>
        </div>

        {/* ── Status Banner ── */}
        <StatusBanner status={waStatus} adminMobile={profile?.adminMobile} />

      </div>

      {/* ── Download Modal ── */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Download Asset">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={downloadCard}
            className="group flex flex-col items-center p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 rounded-xl transition-all"
          >
            <div className="w-10 h-10 bg-white shadow-sm rounded-lg flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors mb-2">
              <Image size={20} strokeWidth={2} />
            </div>
            <span className="text-[11px] font-bold text-slate-700 group-hover:text-indigo-700">Identity Card</span>
            <span className="text-[9px] text-slate-400 mt-0.5">PNG · 4× resolution</span>
          </button>
          <button
            onClick={downloadQRCode}
            className="group flex flex-col items-center p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 rounded-xl transition-all"
          >
            <div className="w-10 h-10 bg-white shadow-sm rounded-lg flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors mb-2">
              <QrCode size={20} strokeWidth={2} />
            </div>
            <span className="text-[11px] font-bold text-slate-700 group-hover:text-indigo-700">QR Code</span>
            <span className="text-[9px] text-slate-400 mt-0.5">PNG · 4× resolution</span>
          </button>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
           High-resolution assets generated on demand
        </div>
      </Modal>
    </Layout>
  );
};

/* ── Status Badge ── */
const StatusBadge = ({ status }) => {
  const cfg = {
    connected: { cls: 'bg-emerald-50 border-emerald-100', dot: 'bg-emerald-500 animate-pulse', label: 'Live', color: 'text-emerald-600' },
    reconnecting: { cls: 'bg-amber-50 border-amber-100', dot: '', label: 'Sync', color: 'text-amber-600', spin: true },
    disconnected: { cls: 'bg-rose-50 border-rose-100', dot: 'bg-rose-500', label: 'Offline', color: 'text-rose-600' },
  };
  const s = cfg[status] || cfg.disconnected;
  return (
    <div className={`flex items-center gap-1.5 border px-2.5 py-1 rounded-full ${s.cls}`}>
      {s.spin
        ? <Loader2 size={9} className={`${s.color} animate-spin`} />
        : <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />}
      <span className={`text-[10px] font-bold uppercase tracking-wider ${s.color}`}>{s.label}</span>
    </div>
  );
};

/* ── Status Banner ── */
const StatusBanner = ({ status, adminMobile }) => {
  if (status === 'connected') return (
    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg">
      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse flex-shrink-0" />
      <span className="text-[11px] font-semibold text-emerald-700">WhatsApp Bridge Active — Ready to receive contact requests</span>
    </div>
  );
  if (status === 'reconnecting') return (
    <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-3 py-2 rounded-lg">
      <Loader2 size={11} className="text-amber-500 animate-spin flex-shrink-0" />
      <span className="text-[11px] font-semibold text-amber-700">Initializing bridge… please wait</span>
    </div>
  );
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 bg-rose-50 border border-rose-100 px-3 py-2.5 rounded-lg">
      <div className="flex items-center gap-2">
        <Smartphone size={12} className="text-rose-400 flex-shrink-0" />
        <span className="text-[11px] font-semibold text-rose-700">System Offline — Action required</span>
      </div>
      <span className="sm:ml-auto text-[10px] text-slate-400">
        Support: <span className="text-rose-500 font-bold">+91 {adminMobile || '6354390540'}</span>
      </span>
    </div>
  );
};

/* ── Subscription Banner ── */
const SubscriptionBanner = ({ expiry }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculate = () => {
      if (!expiry) {
        setTimeLeft('No active subscription');
        setIsExpired(true);
        return;
      }
      const now = new Date();
      const expDate = new Date(expiry);
      if (expDate < now) {
        setTimeLeft('Subscription Expired');
        setIsExpired(true);
        return;
      }
      
      const diffMs = expDate - now;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 60) setTimeLeft(`${diffMins} minutes remaining`);
      else if (diffHours < 24) setTimeLeft(`${diffHours} hours remaining`);
      else setTimeLeft(`${diffDays} days remaining`);
      setIsExpired(false);
    };

    calculate();
    const interval = setInterval(calculate, 60000);
    return () => clearInterval(interval);
  }, [expiry]);

  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${isExpired ? 'bg-rose-50 border-rose-100' : 'bg-indigo-50 border-indigo-100'}`}>
      <div className="flex items-center gap-2">
        <Clock size={14} className={isExpired ? 'text-rose-500' : 'text-indigo-500'} />
        <span className={`text-[11px] font-bold uppercase tracking-wider ${isExpired ? 'text-rose-600' : 'text-indigo-600'}`}>
          Subscription Status
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-[11px] font-black uppercase tracking-widest ${isExpired ? 'text-rose-700' : 'text-indigo-700'}`}>
          {timeLeft}
        </span>
        {isExpired && (
          <a href="mailto:info@itfuturz.com" className="bg-rose-600 text-white text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest hover:bg-slate-900 transition-all">
            Renew
          </a>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
