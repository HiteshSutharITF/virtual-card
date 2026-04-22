import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, LayoutDashboard, QrCode, Settings, Users } from 'lucide-react';
import Modal from '../common/Modal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);

  const handleLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="fixed top-4 left-4 right-4 z-50">
        <div className="max-w-7xl mx-auto glass rounded-2xl px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-main rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <QrCode className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-indigo-600 tracking-tight">
              Virtual<span className="text-slate-800">Card</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
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
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 pr-4 border-r border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                <User size={18} />
              </div>
            </div>
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="p-2 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Logout Confirmation"
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
              className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 py-4 bg-rose-500 text-white font-bold rounded-2xl hover:bg-rose-600 shadow-xl shadow-rose-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
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
    className="flex items-center space-x-2 text-slate-600 hover:text-indigo-600 font-medium transition-colors"
  >
    {icon}
    <span>{label}</span>
  </Link>
);

export default Navbar;
