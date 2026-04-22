import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { getWhatsAppStatus, connectWhatsApp, disconnectWhatsApp } from '../../services/whatsapp.service';
import Layout from '../../components/layout/Layout';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-hot-toast';
import { RefreshCw, Power, Smartphone, ShieldCheck, Loader2, AlertCircle, Trash2, X } from 'lucide-react';
import Modal from '../../components/common/Modal';

const WhatsAppConnect = () => {
  const socket = useSocket();
  const [status, setStatus] = useState('loading');
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const fetchInitialStatus = async () => {
    try {
      const response = await getWhatsAppStatus();
      if (response.success) {
        setStatus(response.data.status);
        setQrCode(response.data.qr);
        if (response.data.status === 'reconnecting') {
          setIsInitializing(true);
        }
      }
    } catch (error) {
      toast.error('Failed to connect to backend');
    }
  };

  useEffect(() => {
    fetchInitialStatus();

    if (socket) {
      socket.on('whatsapp_status', (data) => {
        setStatus(data.status);
        if (data.status === 'connected' || data.status === 'qr_ready') {
          setIsInitializing(false);
        }
        if (data.status === 'reconnecting') {
          setIsInitializing(true);
        }
        if (data.status === 'connected') setQrCode('');
      });

      socket.on('whatsapp_qr', (data) => {
        setStatus('qr_ready');
        setQrCode(data.qr);
      });

      return () => {
        socket.off('whatsapp_status');
        socket.off('whatsapp_qr');
      };
    }
  }, [socket]);

  const handleConnect = async () => {
    setLoading(true);
    setIsInitializing(true);
    try {
      await connectWhatsApp();
      toast.success('Waking up WhatsApp engine...');
    } catch (error) {
      toast.error(error.message);
      setIsInitializing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    try {
      await disconnectWhatsApp();
      toast.success('WhatsApp disconnected');
      setStatus('disconnected');
      setQrCode('');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">WhatsApp Engine</h1>
            <p className="text-slate-500 font-medium">Link your centralized number to the bot</p>
          </div>
          <div className={`px-4 py-2 rounded-2xl flex items-center space-x-2 border ${
            status === 'connected' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
            status === 'qr_ready' ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full ${
              status === 'connected' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse' : 
              status === 'qr_ready' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-slate-300'
            }`}></span>
            <span className="text-sm font-bold capitalize">{status.replace('_', ' ')}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Status/Control Card */}
          <div className="glass rounded-[2.5rem] p-8 flex flex-col justify-between">
            <div>
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-slate-800 shadow-sm border border-slate-100 mb-8">
                <Smartphone size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Bot Configuration</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                By connecting your WhatsApp, the platform will be able to intercept messages and share contacts automatically on behalf of your users.
              </p>
              
              <ul className="space-y-4 mb-10">
                <StatusItem icon={<ShieldCheck size={18} />} text="End-to-end encrypted bot connection" />
                <StatusItem icon={<RefreshCw size={18} />} text="Persistence across server restarts" />
                <StatusItem icon={<AlertCircle size={18} />} text="Single number multi-user support" />
              </ul>
            </div>

            {status === 'connected' ? (
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={loading}
                className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-2xl hover:bg-red-100 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><Power size={20} /> <span>Disconnect Session</span></>}
              </button>
            ) : status === 'disconnected' ? (
              <button
                onClick={handleConnect}
                disabled={loading}
                className="w-full btn-premium bg-gradient-main text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-100 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><RefreshCw size={20} /> <span>Initialize Connection</span></>}
              </button>
            ) : (
              <button
                className="w-full bg-slate-100 text-slate-400 font-bold py-4 rounded-2xl flex items-center justify-center space-x-2"
                disabled
              >
                <Loader2 className="animate-spin" /> <span>Loading Engine...</span>
              </button>
            )}
          </div>

          {/* QR Scan Section */}
          <div className="glass rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center relative overflow-hidden">
            {isInitializing && (
              <div className="absolute inset-0 z-20 glass flex flex-col items-center justify-center animate-fade-in">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                  <Smartphone className="absolute inset-0 m-auto text-indigo-600 w-8 h-8 animate-pulse" />
                </div>
                <h4 className="mt-6 text-indigo-900 font-bold">Booting Engine</h4>
                <p className="text-xs text-indigo-500 mt-2 max-w-[180px]">Setting up Puppeteer and Chromium instance...</p>
              </div>
            )}

            {status === 'connected' ? (
              <div className="py-12 flex flex-col items-center">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <ShieldCheck size={48} />
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">Bot is Live</h4>
                <p className="text-slate-500 text-sm max-w-[200px]">Successfully connected and ready to parse messages.</p>
              </div>
            ) : qrCode ? (
              <div className="animate-fade-in">
                <p className="text-sm font-bold text-slate-700 mb-6">Scan this QR to Link Device</p>
                <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 relative">
                  <img src={qrCode} alt="WhatsApp QR" className="w-[200px] h-[200px]" />
                  <div className="absolute -inset-2 border-2 border-indigo-500/20 rounded-[3rem] pointer-events-none"></div>
                </div>
                <div className="mt-8 flex items-center justify-center space-x-2 text-indigo-500">
                  <RefreshCw size={14} className="animate-spin" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">Waiting for scan</span>
                </div>
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mb-4">
                  <RefreshCw size={32} />
                </div>
                <p className="text-slate-400 text-sm">QR Code will appear once you click 'Initialize'</p>
              </div>
            )}
          </div>
        </div>

        {/* Confirmation Modal */}
        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Disconnect WhatsApp?"
          size="sm"
        >
          <div className="flex flex-col items-center text-center space-y-6 py-4">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center shadow-inner">
              <AlertCircle size={40} />
            </div>
            
            <div>
              <p className="text-slate-600 font-medium">
                This will unpair the bot from your device. You will need to scan a new QR code to reconnect.
              </p>
              <p className="text-rose-500 font-bold mt-2 text-sm">
                Proceed with logout?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full pt-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnect}
                className="px-6 py-3 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 flex items-center justify-center space-x-2"
              >
                <Trash2 size={18} />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

const StatusItem = ({ icon, text }) => (
  <li className="flex items-center space-x-3 text-slate-600 text-sm font-medium">
    <div className="text-indigo-500">{icon}</div>
    <span>{text}</span>
  </li>
);

export default WhatsAppConnect;
