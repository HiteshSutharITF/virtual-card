import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, LayoutDashboard, QrCode, Settings, Users, Menu, X } from 'lucide-react';
import Modal from '../common/Modal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when switching routes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
    navigate('/login');
  };

  const NavLinks = () => (
    <>
      {user?.role === 'admin' ? (
        <>
          <NavLink icon={<LayoutDashboard size={18} />} label="Dashboard" to="/admin" />
          <NavLink icon={<Users size={18} />} label="Users" to="/admin/users" />
          <NavLink icon={<Settings size={18} />} label="WhatsApp" to="/admin/whatsapp" />
          <NavLink icon={<User size={18} />} label="Profile" to="/admin/profile" />
        </>
      ) : (
        <>
          <NavLink icon={<LayoutDashboard size={18} />} label="My QR" to="/user" />
          <NavLink icon={<Users size={18} />} label="Contacts" to="/user/scanned" />
          <NavLink icon={<User size={18} />} label="Profile" to="/user/profile" />
        </>
      )}
    </>
  );

  return (
    <>
      <nav className="fixed top-4 left-4 right-4 z-50">
        <div className="max-w-7xl mx-auto glass rounded-2xl px-4 md:px-6 py-3 flex items-center justify-between shadow-xl ring-1 ring-white/20">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <QrCode className="text-white w-6 h-6" />
            </div>
            <span className="text-xl md:text-2xl font-black text-indigo-600 tracking-tight">
              Virtual<span className="text-slate-800">Card</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLinks />
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {/* User Profile Info (Desktop) */}
            <div className="hidden md:flex items-center space-x-3 pr-4 border-r border-slate-200">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                <User size={18} />
              </div>
            </div>

            {/* Logout Button (Desktop) */}
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="hidden md:flex p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-50 transition-all duration-200"
            >
              <LogOut size={20} />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Sidebar Panel */}
        <div
          className={`absolute top-0 right-0 h-full w-[280px] bg-white shadow-2xl transition-transform duration-300 ease-out transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
          <div className="h-full flex flex-col p-6">
            <div className="flex items-center justify-between mb-10">
              <span className="text-xl font-black text-indigo-600">Navigation</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-slate-50 text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 flex flex-col space-y-2">
              <NavLinks />
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100 pb-4">
              <div className="flex items-center space-x-3 mb-6 px-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center text-indigo-600 font-black">
                  {user?.name?.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-black text-slate-800 truncate">{user?.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{user?.role}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsLogoutModalOpen(true);
                }}
                className="w-full flex items-center justify-center space-x-3 p-4 bg-rose-50 text-rose-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-100 transition-colors"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Logout"
        size="sm"
      >
        <div className="space-y-8 py-2">
          <div className="bg-rose-50 border border-rose-100 rounded-[2rem] p-6 flex items-start space-x-4">
            <div className="bg-white p-3 rounded-2xl shadow-sm text-rose-500">
              <LogOut size={24} />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-800 tracking-tight">Confirm Logout</h4>
              <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                Are you sure you want to exit? You will need to log in again to access your dashboard.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setIsLogoutModalOpen(false)}
              className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-all font-black uppercase tracking-widest text-[10px]"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 py-4 bg-rose-500 text-white rounded-2xl hover:bg-rose-600 shadow-xl shadow-rose-200 transition-all hover:scale-[1.02] active:scale-[0.98] font-black uppercase tracking-widest text-[10px]"
            >
              Log me out
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

const NavLink = ({ icon, label, to }) => (
  <Link
    to={to}
    className="flex items-center space-x-3 p-3 md:p-0 text-slate-600 hover:text-indigo-600 font-bold md:font-medium transition-all rounded-xl hover:bg-indigo-50 md:hover:bg-transparent"
  >
    <div className="md:hidden p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
      {icon}
    </div>
    <div className="hidden md:block">{icon}</div>
    <span className="tracking-tight text-sm">{label}</span>
  </Link>
);

export default Navbar;
