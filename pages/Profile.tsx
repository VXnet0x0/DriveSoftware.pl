
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User } from '../types';

interface ProfileProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isApiKeyLoading, setIsApiKeyLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfileData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Symulacja autoryzacji sesji z DriveLoginSystem
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() < 0.05) { // Zmniejszono szansę na błąd dla lepszego UX
            reject(new Error("Błąd synchronizacji z DLS 1.0 (Błąd 403: Nieautoryzowany dostęp)."));
          } else {
            resolve(true);
          }
        }, 1200);
      });
      
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || "Wystąpił nieoczekiwany błąd podczas pobierania danych profilu.");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const generateApiKey = async () => {
    setIsApiKeyLoading(true);
    
    // Symulacja obliczeń kryptograficznych DLS 1.0
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
    const timestampPart = Date.now().toString(36).toUpperCase();
    const newKey = `DLS-1.0-${randomPart}-${timestampPart}-${user.username.substring(0, 3).toUpperCase()}`;
    
    onUpdateUser({
      ...user,
      apiKey: newKey
    });
    setIsApiKeyLoading(false);
  };

  const copyToClipboard = () => {
    if (user.apiKey) {
      navigator.clipboard.writeText(user.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadApiKey = () => {
    if (!user.apiKey) return;
    const element = document.createElement("a");
    const file = new Blob([
      `DRIVESOFT DLS 1.0 - OFFICIAL API KEY CERTIFICATE\n`,
      `==============================================\n`,
      `USER: ${user.username}\n`,
      `ID: ${user.id}\n`,
      `ROLE: ${user.role}\n`,
      `API KEY: ${user.apiKey}\n`,
      `GATEWAY: drivesoftware.pl/api/v1/auth\n`,
      `==============================================\n`,
      `Generated on: ${new Date().toLocaleString()}\n`,
      `© 2024 DriveSoft Systems - Karol Kopeć`
    ], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `dls_cert_${user.username.toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Plik jest za duży! Maksymalny rozmiar to 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onUpdateUser({
          ...user,
          avatar: base64String
        });
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-10">
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden animate-pulse">
          <div className="h-40 bg-gray-100"></div>
          <div className="px-10 pb-10">
            <div className="relative -mt-16 mb-8">
              <div className="w-32 h-32 rounded-[2rem] bg-gray-200 border-8 border-white shadow-xl"></div>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded-2xl w-64"></div>
                <div className="h-5 bg-gray-100 rounded-xl w-48"></div>
              </div>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 h-64 rounded-[2rem] border border-gray-100"></div>
              <div className="bg-gray-100 h-64 rounded-[2rem]"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-12 text-center px-4">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-red-100">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-exclamation-triangle text-3xl"></i>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-4">Błąd synchronizacji DLS</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">{error}</p>
          <button onClick={fetchProfileData} className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-black transition-all">
            Spróbuj ponownie
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-900 relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        </div>
        
        <div className="px-10 pb-10">
          <div className="relative -mt-20 mb-8 group inline-block">
            <div 
              onClick={handleAvatarClick}
              className="relative cursor-pointer overflow-hidden rounded-[2.5rem] border-8 border-white shadow-2xl transition-all duration-500 hover:scale-105"
            >
              <img 
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&size=256&background=6366f1&color=fff`} 
                alt="Profile" 
                className="w-36 h-36 object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="fas fa-camera text-white text-3xl"></i>
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">{user.username}</h1>
                {user.role === 'owner' && <i className="fas fa-shield-check text-blue-500 text-2xl" title="Verified Owner"></i>}
              </div>
              <p className="text-gray-500 font-medium">Konto DriveSoft od {new Date(user.joinedAt).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-6 py-2 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black border border-indigo-100 uppercase tracking-widest">
                {user.role} DLS Node
              </span>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* API KEY SECTION */}
            <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 relative overflow-hidden group min-h-[300px] flex flex-col justify-center">
              <h2 className="text-xl font-black mb-4 flex items-center text-gray-900">
                <i className="fas fa-key text-blue-600 mr-3"></i> DLS API Access
              </h2>
              
              {isApiKeyLoading ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-10 animate-pulse">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Generowanie klucza kryptograficznego...</p>
                </div>
              ) : !user.apiKey ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 mb-6 font-medium">
                    Nie wygenerowałeś jeszcze klucza API. Jest on wymagany do integracji z zewnętrznymi systemami.
                  </p>
                  <button 
                    onClick={generateApiKey}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 flex items-center justify-center space-x-2"
                  >
                    <i className="fas fa-wand-magic-sparkles"></i>
                    <span>Wygeneruj Klucz DLS 1.0</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 font-mono text-sm relative group/key">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Twój unikalny klucz:</span>
                    <div className="text-indigo-600 font-black break-all text-xs lg:text-sm">
                      {user.apiKey}
                    </div>
                    <button 
                      onClick={copyToClipboard}
                      className="absolute right-3 top-3 bg-gray-50 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 p-2 rounded-lg transition-colors border border-gray-100"
                      title="Kopiuj do schowka"
                    >
                      <i className={`fas ${copied ? 'fa-check text-green-500' : 'fa-copy'}`}></i>
                    </button>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={downloadApiKey}
                      className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition flex items-center justify-center space-x-2 shadow-lg"
                    >
                      <i className="fas fa-file-shield"></i>
                      <span>Pobierz Certyfikat</span>
                    </button>
                    <button 
                      onClick={generateApiKey}
                      className="px-4 bg-white border border-gray-200 text-gray-400 hover:text-rose-500 hover:border-rose-100 rounded-2xl transition-all"
                      title="Generuj nowy klucz (stary przestanie działać)"
                    >
                      <i className="fas fa-arrows-rotate"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* DEV TOOLS SECTION */}
            <div className="bg-indigo-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <i className="fas fa-code text-9xl"></i>
              </div>
              
              <h2 className="text-xl font-black mb-6 flex items-center">
                <i className="fas fa-terminal text-indigo-300 mr-3"></i> Developer Hub
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-2">Endpoint Status</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-green-400">REST API v1.0 ONLINE</span>
                  </div>
                </div>
                
                <p className="text-sm text-indigo-100/70 leading-relaxed italic">
                  "Integruj, buduj i rozwijaj ekosystem DriveSoft. Twoje aplikacje są bezpieczne dzięki autoryzacji opartej na tokenach DLS."
                </p>
                
                <a 
                  href="https://drivesoftware.pl/docs" 
                  target="_blank" 
                  className="block text-center py-3 border border-indigo-400/30 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition"
                >
                  Dokumentacja DLS <i className="fas fa-external-link-alt ml-2"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
