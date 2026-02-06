
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Auth from './pages/Auth';
import DriveModule from './pages/DriveModule';
import Forum from './pages/Forum';
import AIChat from './pages/AIChat';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import ApiExplorer from './pages/ApiExplorer';
import DownloadCenter from './pages/DownloadCenter';
import GlobalSearch from './pages/GlobalSearch';
import { User } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('dls_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('dls_user');
    setCurrentUser(null);
  };

  const handleUpdateUser = (updatedUser: User) => {
    localStorage.setItem('dls_user', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
  };

  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen font-sans">
        <Navbar user={currentUser} onLogout={handleLogout} />
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home user={currentUser} />} />
            <Route path="/search" element={<GlobalSearch />} />
            <Route path="/auth" element={<Auth onLogin={setCurrentUser} />} />
            <Route path="/drive" element={currentUser ? <DriveModule /> : <Navigate to="/auth" />} />
            <Route path="/forum" element={<Forum user={currentUser} />} />
            <Route path="/ai" element={<AIChat />} />
            <Route path="/api-docs" element={<ApiExplorer />} />
            <Route path="/downloads" element={<DownloadCenter />} />
            <Route 
              path="/profile" 
              element={currentUser ? <Profile user={currentUser} onUpdateUser={handleUpdateUser} /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/admin" 
              element={currentUser?.role === 'owner' ? <AdminDashboard /> : <Navigate to="/" />} 
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;
