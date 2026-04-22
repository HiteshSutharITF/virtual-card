import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile, updateUserProfile } from '../../services/user.service';
import Layout from '../../components/layout/Layout';
import { toast } from 'react-hot-toast';
import { Download, Share2, Power, Contact, ShieldCheck, Info } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const response = await getUserProfile();
      if (response.success) {
        setProfile(response.data);
      }
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleToggle = async (field, value) => {
    try {
      const response = await updateUserProfile({ [field]: value });
      if (response.success) {
        setProfile(response.data);
        toast.success(`Feature ${value ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const qrValue = `https://wa.me/91${profile?.adminMobile || ''}?text=Please%20share%20the%20contact%20of%20${encodeURIComponent(profile?.name || '')}%20-${encodeURIComponent(profile?.businessName || '')}%20${profile?.userToken || ''}`;

  const downloadQR = () => {
    const svg = document.getElementById('user-qr');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${user?.name}-QR.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  if (loading) return <Layout><div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div></Layout>;

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* QR Section */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass rounded-[2.5rem] p-10 flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">My Virtual Card</h2>
            <p className="text-slate-500 text-sm mb-8">Share this QR code to exchange contacts</p>

            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-main rounded-[2.5rem] opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-500"></div>
              <div className="relative bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100">
                <QRCodeSVG
                  id="user-qr"
                  value={qrValue}
                  size={240}
                  level="H"
                  includeMargin={false}
                />
              </div>
            </div>

            <div className="mt-10 w-full flex flex-col items-center">
              <div className="bg-slate-50 rounded-2xl p-4 w-full mb-6 border border-dashed border-slate-200">
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">Your Token</p>
                <p className="text-lg font-mono font-bold text-indigo-600">{profile?.userToken}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full">
                <button
                  onClick={downloadQR}
                  className="flex items-center justify-center space-x-2 bg-white border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 transition-all py-3 rounded-2xl font-semibold text-slate-700 text-sm shadow-sm"
                >
                  <Download size={18} />
                  <span>Download</span>
                </button>
                <button className="flex items-center justify-center space-x-2 bg-white border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 transition-all py-3 rounded-2xl font-semibold text-slate-700 text-sm shadow-sm">
                  <Share2 size={18} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>

          <div className="glass rounded-[2rem] p-6 flex items-start space-x-4 bg-indigo-50/50 border-indigo-100">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
              <Info size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-indigo-900 mb-1">How it works</h4>
              <p className="text-xs text-indigo-700 leading-relaxed opacity-80">
                When someone scans your QR, a pre-filled message is created. On sending, our bot automatically exchanges contacts between you both.
              </p>
            </div>
          </div>
        </div>

        {/* Controls & Info Section */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ControlCard
              icon={<Power size={24} />}
              label="Bot Status"
              desc={profile?.isActive ? 'Active and responding' : 'Temporarily paused'}
              isActive={profile?.isActive}
              onToggle={() => handleToggle('isActive', !profile?.isActive)}
            />
            <ControlCard
              icon={<Contact size={24} />}
              label="Contact Sharing"
              desc={profile?.isContactSharingEnabled ? 'Exchanging vCards' : 'Logging scans only'}
              isActive={profile?.isContactSharingEnabled}
              onToggle={() => handleToggle('isContactSharingEnabled', !profile?.isContactSharingEnabled)}
            />
          </div>

          <div className="glass rounded-[2.5rem] p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Quick Profile</h3>
                <p className="text-sm text-slate-500">Your details as they appear to others</p>
              </div>
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                <ShieldCheck size={28} />
              </div>
            </div>

            <div className="space-y-6">
              <InfoRow label="Full Name" value={profile?.name} />
              <InfoRow label="Business" value={profile?.businessName} />
              <InfoRow label="WhatsApp" value={`+91 ${profile?.mobile}`} />

              <div className="pt-6 border-t border-slate-100">
                <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-3">Custom Message</p>
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <p className="text-slate-700 text-sm italic leading-relaxed">
                    "{profile?.customMessage}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const ControlCard = ({ icon, label, desc, isActive, onToggle }) => (
  <div className={`glass rounded-[2rem] p-6 transition-all duration-300 card-hover ${isActive ? 'ring-2 ring-indigo-500/20' : 'opacity-80'}`}>
    <div className="flex justify-between items-start mb-6">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-400'}`}>
        {icon}
      </div>
      <button
        onClick={onToggle}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 outline-none ${isActive ? 'bg-indigo-500' : 'bg-slate-200'}`}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-sm ${isActive ? 'left-7' : 'left-1'}`}></div>
      </button>
    </div>
    <h4 className="font-bold text-slate-800 mb-1">{label}</h4>
    <p className="text-xs text-slate-500">{desc}</p>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium text-slate-500">{label}</span>
    <span className="text-sm font-bold text-slate-800">{value}</span>
  </div>
);

export default UserDashboard;
