import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, LayoutDashboard, QrCode, Settings, Users } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-4 left-4 right-4 z-50">
      <div className="max-w-7xl mx-auto glass rounded-2xl px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-main rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <QrCode className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-main">
            VirtualCard
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
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
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
