import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, LogOut, Menu } from 'lucide-react';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="border-b bg-white">
      <div className="container relative mx-auto flex items-center justify-between px-4 py-3">
  <Link to="/" className="brand-font text-2xl leading-none text-primary-700">Event Karo</Link>

        <div className="absolute inset-0 hidden items-center justify-center md:flex pointer-events-none">
          <nav className="flex items-end gap-4 pointer-events-auto">
            {!isAuthenticated ? (
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Home</NavLink>
            ) : (
              <NavLink to="/events" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Events</NavLink>
            )}
            {isAuthenticated && user?.role === 'organizer' && (
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Dashboard</NavLink>
            )}
            {isAuthenticated && user?.role === 'attendee' && (
              <NavLink to="/my-bookings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>My Bookings</NavLink>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="btn btn-primary"><LogIn className="mr-2 h-4 w-4" />Login</Link>
              <Link to="/register" className="btn btn-outline border-primary-600 text-primary-700 hover:bg-primary-50">Register</Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className="hidden md:inline-flex brand-font text-base text-gray-700">Hi,&nbsp;<span className="brand-font">{user?.name}</span></span>
              <button onClick={logout} className="btn btn-outline"><LogOut className="mr-2 h-4 w-4" />Logout</button>
              <button className="md:hidden"><Menu /></button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
