import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Calendar, CalendarDays, Archive, LayoutDashboard, CalendarPlus, LogOut } from 'lucide-react';

const TopNavbar = () => {
    const { user, logoutUser } = useAuth();

    if (!user) return null;

    const isAdminOrStaff = user.is_staff || user.is_superuser;

    // Helper for active link styles
    const navLinkClass = ({ isActive }) =>
      `flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
        isActive
          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-inner'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-500'
      }`;

    return (
        <nav className="w-full h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between font-sans z-50 sticky top-0 shadow-sm">
            {/* Left: Brand */}
            <div className="flex items-center gap-2">
                <span className="text-emerald-500 text-2xl"></span>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white hidden sm:block">
                    Garden Studio
                </h2>
            </div>

            {/* Center: Navigation Links */}
            <ul className="flex-1 flex items-center justify-center gap-2 md:gap-4 overflow-x-auto mx-4 no-scrollbar">
                {isAdminOrStaff ? (
                    <>
                        <li>
                            <NavLink to={user.is_superuser ? "/admin-dashboard" : "/staff-dashboard"} className={navLinkClass}>
                                <LayoutDashboard size={18} className="md:mr-2" />
                                <span className="hidden md:inline">Dashboard</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/manage-availability" className={navLinkClass}>
                                <CalendarDays size={18} className="md:mr-2" />
                                <span className="hidden md:inline">Manage Availability</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/view-bookings" className={navLinkClass}>
                                <Calendar size={18} className="md:mr-2" />
                                <span className="hidden md:inline">View Bookings</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/inventory" className={navLinkClass}>
                                <Archive size={18} className="md:mr-2" />
                                <span className="hidden md:inline">Inventory</span>
                            </NavLink>
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <NavLink to="/user-dashboard" className={navLinkClass}>
                                <LayoutDashboard size={18} className="md:mr-2" />
                                <span className="hidden md:inline">Dashboard</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/studio" className={navLinkClass}>
                                <Home size={18} className="md:mr-2" />
                                <span className="hidden md:inline">My 3D Studio</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/book-service" className={navLinkClass}>
                                <CalendarPlus size={18} className="md:mr-2" />
                                <span className="hidden md:inline">Book a Service</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/my-bookings" className={navLinkClass}>
                                <Calendar size={18} className="md:mr-2" />
                                <span className="hidden md:inline">My Bookings</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/my-orders" className={navLinkClass}>
                                <Archive size={18} className="md:mr-2" />
                                <span className="hidden md:inline">My Orders</span>
                            </NavLink>
                        </li>
                    </>
                )}
            </ul>

            {/* Right: User Profile & Logout */}
            <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight">Logged in as</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-emerald-400 leading-tight">{user.username}</span>
                </div>
                <button
                    onClick={logoutUser}
                    className="flex items-center justify-center p-2 md:px-4 md:py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl text-sm font-bold transition-all duration-300"
                    title="Logout"
                >
                    <LogOut size={18} className="md:mr-2" />
                    <span className="hidden md:inline">Logout</span>
                </button>
            </div>
        </nav>
    );
};

export default TopNavbar;
