
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { GoogleApiService } from '../services/GoogleApiService';
import { DlsMailer } from '../services/DlsMailer';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  
  const [verifying, setVerifying] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleAvailable, setGoogleAvailable] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(true);

  useEffect(() => {
    const initGoogle = async () => {
      const google = (window as any).google;
      if (google) {
        try {
          // Sprawdzenie czy Client ID nie jest placeholderem
          const clientId = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
          if (clientId.includes('YOUR_GOOGLE')) {
            setGoogleAvailable(false);
            setGoogleLoading(false);
            return;
          }

          google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCallback,
            auto_select: false,
            cancel_on_tap_outside: true
          });
          
          google.accounts.id.renderButton(
            document.getElementById('googleSignInBtn'),
            { theme: 'outline', size: 'large', width: '100%' }
          );
          
          // Małe opóźnienie, aby upewnić się, że przycisk został wyrenderowany przed ukryciem skeletona
          setTimeout(() => setGoogleLoading(false), 500);
        } catch (e) {
          console.warn("DLS Gateway: Google Sign-In initialization failed (Missing/Invalid Keys). Using DLS 1.0 Native Auth.");
          setGoogleAvailable(false);
          setGoogleLoading(false);
        }
      } else {
        setGoogleAvailable(false);
        setGoogleLoading(false);
      }
    };

    initGoogle();
  }, []);

  const handleGoogleCallback = (response: any) => {
    // Symulacja profilu dla celów prezentacji przy braku połączenia z serwerem JWT
    const dummyGoogleUser: User = {
      id: 'g-' + Math.random().toString(36).substr(2, 9),
      username: 'Użytkownik Google',
      email: 'social@gmail.com',
      role: 'user',
      joinedAt: new Date().toISOString(),
      avatar: 'https://cdn-icons-png.flaticon.com/512/300/300221.png'
    };
    onLogin(dummyGoogleUser);
  };

  const initiateAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted) { setError('Zaakceptuj protokół DLS 1.0.'); return; }
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const user = GoogleApiService.validateCredentials(email, password);
        if (!user) throw new Error("Błędne poświadczenia w bazie DriveSoft.");
      } else {
        if (!GoogleApiService.isEmailAvailable(email)) throw new Error("Ten adres e-mail jest już zarejestrowany.");
      }

      // Generowanie kodu OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      
      // Wywołanie mailera DLS (Pobieranie pliku klucza)
      await DlsMailer.sendVerificationCode(email, code, isLogin ? email : username);
      
      setVerifying(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = () => {
    if (inputCode !== generatedCode) { 
      setError('Kod z pliku certyfikatu jest nieprawidłowy.'); 
      return; 
    }
    
    let finalUser: User;
    if (isLogin) {
      const uData = GoogleApiService.validateCredentials(email, password);
      const { password: _, ...cleanUser } = uData;
      finalUser = cleanUser as User;
    } else {
      finalUser = GoogleApiService.dlsRegister(email, username, password);
    }
    
    localStorage.setItem('dls_user', JSON.stringify(finalUser));
    onLogin(finalUser);
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-500"></div>
        
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-100 animate-float">
            <i className={`fas ${verifying ? 'fa-file-shield' : 'fa-fingerprint'} text-white text-3xl`}></i>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">DriveLoginSystem</h2>
          <p className="text-[10px] font-black uppercase text-indigo-500 tracking-[0.4em] mt-2">DLS 1.0 Ecosystem Security</p>
        </div>

        {verifying ? (
          <div className="space-y-8 animate-in zoom-in-95 duration-300 text-center">
            <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100">
              <i className="fas fa-download text-indigo-600 text-2xl mb-3 animate-bounce"></i>
              <p className="text-sm font-black text-slate-900 uppercase">Pobrano Certyfikat DLS</p>
              <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">Sprawdź plik <span className="font-bold text-indigo-600">DLS_AUTH_TOKEN.txt</span> w folderze pobierania i przepisz 6-cyfrowy kod.</p>
            </div>

            <input 
              type="text" 
              maxLength={6}
              placeholder="000000"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-6 text-center text-4xl font-black tracking-[0.4em] outline-none focus:border-indigo-500 transition-all"
              value={inputCode}
              onChange={e => setInputCode(e.target.value.replace(/\D/g, ''))}
            />

            <button 
              onClick={handleVerify} 
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all"
            >
              Autoryzuj sesję DLS
            </button>
          </div>
        ) : (
          <form onSubmit={initiateAuth} className="space-y-4">
            <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-4">
              <button type="button" onClick={() => setIsLogin(true)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Logowanie</button>
              <button type="button" onClick={() => setIsLogin(false)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${!isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Rejestracja</button>
            </div>

            {!isLogin && (
              <input type="text" placeholder="Twój Pseudonim" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:border-indigo-500" value={username} onChange={e => setUsername(e.target.value)} required />
            )}
            <input type="email" placeholder="E-mail (np. karol000@dls.pl)" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:border-indigo-500" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Hasło DLS" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:border-indigo-500" value={password} onChange={e => setPassword(e.target.value)} required />

            <label className="flex items-center space-x-3 p-2 cursor-pointer group">
              <input type="checkbox" checked={accepted} onChange={() => setAccepted(!accepted)} className="hidden" />
              <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${accepted ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 group-hover:border-indigo-300'}`}>
                {accepted && <i className="fas fa-check text-[8px] text-white"></i>}
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">Akceptuję protokół DLS 1.0 (File-Key-Auth)</span>
            </label>

            {error && <p className="text-rose-500 text-[9px] font-black text-center uppercase tracking-widest bg-rose-50 p-3 rounded-xl border border-rose-100">{error}</p>}

            <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black shadow-xl transition-all">
              {loading ? <i className="fas fa-circle-notch fa-spin"></i> : (isLogin ? 'Zaloguj przez DLS' : 'Zarejestruj w DLS')}
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-[9px] uppercase font-black text-slate-300 tracking-widest bg-white px-4">Zewnętrzne API (Social)</div>
            </div>

            {googleLoading ? (
              <div className="w-full h-11 bg-slate-100 rounded-lg animate-pulse border border-slate-200 flex items-center justify-center mb-3">
                <i className="fab fa-google text-slate-300 mr-2"></i>
                <div className="h-2 w-24 bg-slate-200 rounded"></div>
              </div>
            ) : googleAvailable ? (
              <div id="googleSignInBtn" className="mb-3"></div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center mb-4">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Social API: Wyłączone (Brak Kluczy)</p>
                <p className="text-[8px] text-slate-400 mt-1 italic">Użyj DLS Native Login dla pełnego dostępu.</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3 opacity-50 cursor-not-allowed">
              <div className="flex items-center justify-center space-x-2 py-3 bg-slate-50 rounded-xl border border-slate-200">
                <i className="fab fa-github"></i>
                <span className="text-[9px] font-black uppercase">GitHub</span>
              </div>
              <div className="flex items-center justify-center space-x-2 py-3 bg-slate-50 rounded-xl border border-slate-200">
                <i className="fab fa-facebook text-blue-600"></i>
                <span className="text-[9px] font-black uppercase">Facebook</span>
              </div>
            </div>
          </form>
        )}
      </div>
      <p className="mt-8 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">
        DLS Gateway: drivesoftware.pl | 2024
      </p>
    </div>
  );
};

export default Auth;
