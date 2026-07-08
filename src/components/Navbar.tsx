import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Menu, X, HeartPulse, User as UserIcon, LogOut, LayoutDashboard } from 'lucide-react';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    navigate('/', { replace: true });
    logout();
    setIsOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-[#2E6F40] font-bold' : 'text-[#6B7280] hover:text-[#2E6F40] font-semibold';
  };

  // Determine dashboard link
  const getDashboardLink = () => {
    if (!currentUser) return '/login';
    if (currentUser.role === 'patient') return '/dashboard/patient';
    if (currentUser.role === 'doctor') return '/dashboard/doctor';
    if (currentUser.role === 'admin') return '/dashboard/admin';
    return '/';
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Doctors', path: '/#doctors' },
    ...(currentUser?.role === 'doctor' || currentUser?.role === 'admin' ? [] : [{ name: 'Apply as Doctor', path: '/apply-doctor' }]),
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleScrollToDoctors = (e: React.MouseEvent, path: string) => {
    if (path === '/#doctors') {
      if (location.pathname !== '/') {
        navigate('/?scroll=doctors');
      } else {
        const el = document.getElementById('doctors-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
      setIsOpen(false);
    }
  };

  return (
    <nav className="bg-[#FAF9F6]/85 backdrop-blur-md border-b border-[#E5E7EB] sticky top-0 z-40 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="h-10 w-10 rounded-xl bg-[#2E6F40] flex items-center justify-center text-white shadow-md shadow-emerald-900/10 group-hover:scale-105 transition-transform duration-300">
                <HeartPulse className="h-5 w-5 animate-pulse" />
              </div>
              <span className="text-xl font-extrabold text-[#1F2937] tracking-tight">
                BookMy<span className="text-[#2E6F40] transition-colors group-hover:text-[#245A33]">Doctor</span>
              </span>
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              link.path.startsWith('/#') ? (
                <a
                  key={link.name}
                  href={link.path}
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollToDoctors(e, link.path);
                  }}
                  className="text-[#6B7280] hover:text-[#2E6F40] font-semibold cursor-pointer transition-colors"
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`${isActive(link.path)} transition-colors`}
                >
                  {link.name}
                </Link>
              )
            ))}
          </div>

          {/* Desktop Auth State */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center gap-4">
                <Link
                  to={getDashboardLink()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[#2E6F40] bg-[#E8F5EC] hover:bg-[#D1EADE] font-bold text-sm transition-colors cursor-pointer"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <div className="flex items-center gap-2 border-l border-[#E5E7EB] pl-4">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="h-8 w-8 rounded-full border border-[#E5E7EB] object-cover"
                  />
                  <div className="text-left">
                    <p className="text-xs font-bold text-[#1F2937] max-w-[100px] truncate leading-tight">
                      {currentUser.name}
                    </p>
                    <span className="text-[10px] text-[#6B7280] capitalize font-semibold">{currentUser.role}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-[#6B7280] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-[#6B7280] hover:text-[#2E6F40] font-bold text-sm transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 rounded-xl bg-[#2E6F40] hover:bg-[#245A33] text-white font-bold text-sm transition-all shadow-sm shadow-emerald-950/10 hover:scale-[1.03]"
                >
                  Join BMD
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 focus:outline-none transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-[#E5E7EB] bg-white px-4 py-3 space-y-3 shadow-lg">
          <div className="space-y-1">
            {navLinks.map((link) => (
              link.path.startsWith('/#') ? (
                <a
                  key={link.name}
                  href={link.path}
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollToDoctors(e, link.path);
                  }}
                  className="block px-3 py-2 rounded-xl text-[#6B7280] hover:text-[#2E6F40] hover:bg-[#F5F7F5] font-semibold"
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={toggleMenu}
                  className="block px-3 py-2 rounded-xl text-[#6B7280] hover:text-[#2E6F40] hover:bg-[#F5F7F5] font-semibold"
                >
                  {link.name}
                </Link>
              )
            ))}
          </div>

          <div className="pt-3 border-t border-[#E5E7EB]">
            {currentUser ? (
              <div className="space-y-3 px-3">
                <div className="flex items-center gap-3 text-left">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="h-9 w-9 rounded-full border border-[#E5E7EB] object-cover"
                  />
                  <div>
                    <h5 className="text-sm font-bold text-[#1F2937]">{currentUser.name}</h5>
                    <span className="text-xs text-[#6B7280] capitalize font-semibold">{currentUser.role}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to={getDashboardLink()}
                    onClick={toggleMenu}
                    className="flex justify-center items-center gap-1.5 px-4 py-2 rounded-xl text-[#2E6F40] bg-[#E8F5EC] hover:bg-[#D1EADE] font-bold text-xs text-center"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex justify-center items-center gap-1.5 px-4 py-2 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 font-bold text-xs text-center cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 px-3">
                <Link
                  to="/login"
                  onClick={toggleMenu}
                  className="text-center px-4 py-2 rounded-xl border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F5F7F5] font-bold text-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={toggleMenu}
                  className="text-center px-4 py-2 rounded-xl bg-[#2E6F40] hover:bg-[#245A33] text-white font-bold text-sm"
                >
                  Join BMD
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
