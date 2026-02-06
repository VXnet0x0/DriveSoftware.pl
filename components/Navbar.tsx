
import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  return (
    <nav className="bg-white shadow-md border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <i className="fas fa-server text-white text-xl"></i>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            DriveSoft 2024
          </span>
        </Link>

        <div className="hidden lg:flex space-x-8 text-gray-600 font-medium">
          <Link to="/" className="hover:text-blue-600 transition-colors">Software</Link>
          <Link to="/search" className="hover:text-blue-600 transition-colors">Szukaj</Link>
          <Link to="/downloads" className="hover:text-blue-600 transition-colors">Pobieranie</Link>
          <Link to="/forum" className="hover:text-blue-600 transition-colors">Community</Link>
          <Link to="/drive" className="hover:text-blue-600 transition-colors">Cloud</Link>
          <Link to="/ai" className="hover:text-blue-600 transition-colors">DSAI 1.0</Link>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-3">
              <Link to="/profile" className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 transition">
                <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}`} alt="Avatar" className="w-8 h-8 rounded-full border border-blue-200" />
                <span className="text-sm font-semibold">{user.username}</span>
              </Link>
              {user.role === 'owner' && (
                <Link to="/admin" className="text-blue-600 hover:text-blue-700 font-bold p-2" title="Owner Panel">
                  <i className="fas fa-cog"></i>
                </Link>
              )}
              <button onClick={onLogout} className="text-red-500 hover:text-red-600 p-2">
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </div>
          ) : (
            <Link to="/auth" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
              DLS 1.0 Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
