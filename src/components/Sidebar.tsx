import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Search, 
  CalendarClock, 
  Bell, 
  Stethoscope, 
  User as UserIcon, 
  Settings as SettingsIcon, 
  LogOut, 
  HeartPulse, 
  SlidersHorizontal,
  X
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { currentUser, logout, notifications } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  if (!currentUser) return null;

  const unreadNotificationsCount = notifications.filter(
    n => n.userId === currentUser.id && !n.read
  ).length;

  const handleLogout = () => {
    navigate('/', { replace: true });
    logout();
    if (onCloseMobile) onCloseMobile();
  };

  // Define sidebar links based on role
  const getLinks = () => {
    const common = [
      { name: 'Profile', path: '/profile', icon: UserIcon },
      { name: 'Settings', path: '/settings', icon: SettingsIcon },
    ];

    if (currentUser.role === 'patient') {
      return [
        { name: 'Dashboard', path: '/dashboard/patient', icon: LayoutDashboard },
        { name: 'Appointments', path: '/appointments', icon: CalendarClock },
        { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadNotificationsCount },
        ...common
      ];
    }

    if (currentUser.role === 'doctor') {
      return [
        { name: 'Doctor Portal', path: '/dashboard/doctor', icon: LayoutDashboard },
        { name: 'Appointments', path: '/appointments', icon: CalendarClock },
        { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadNotificationsCount },
        ...common
      ];
    }

    if (currentUser.role === 'admin') {
      return [
        { name: 'Admin Console', path: '/dashboard/admin', icon: LayoutDashboard },
        { name: 'Appointments', path: '/appointments', icon: CalendarClock },
        { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadNotificationsCount },
        ...common
      ];
    }

    return common;
  };

  const links = getLinks();

  return (
    <div className="h-full bg-slate-900 text-slate-300 flex flex-col justify-between select-none">
      {/* Upper Brand Section */}
      <div>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <HeartPulse className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              BookMy<span className="text-blue-500">Doctor</span>
            </span>
          </div>
          {onCloseMobile && (
            <button 
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 md:hidden transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* User Mini Profile */}
        <div className="px-5 py-5 border-b border-slate-800 flex items-center gap-3 bg-slate-950/20">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            referrerPolicy="no-referrer"
            className="h-10 w-10 rounded-xl border border-slate-700 object-cover"
          />
          <div className="min-w-0">
            <h5 className="text-xs font-bold text-white truncate max-w-[150px]">{currentUser.name}</h5>
            <span className="text-[10px] text-slate-500 capitalize font-semibold tracking-wide block">
              {currentUser.role} Account
            </span>
          </div>
        </div>

        {/* Links Navigation */}
        <nav className="p-4 space-y-1.5">
          {links.map((link) => {
            const LinkIcon = link.icon;
            const isLinkActive = location.pathname === link.path;

            return (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl transition-all font-semibold text-xs cursor-pointer ${
                  isLinkActive
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <LinkIcon className={`h-4.5 w-4.5 ${isLinkActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                </div>
                {link.badge !== undefined && link.badge > 0 && (
                  <span className={`h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isLinkActive ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
                  }`}>
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Sign out Section */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 font-bold text-xs transition-all text-left focus:outline-none cursor-pointer"
        >
          <LogOut className="h-4.5 w-4.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
