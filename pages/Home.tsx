
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Software, User } from '../types';
import CreatorSection from '../components/CreatorSection';
import { DlsApiService } from '../services/DlsApiService';

interface HomeProps {
  user: User | null;
}

const Home: React.FC<HomeProps> = ({ user }) => {
  const [search, setSearch] = useState('');
  const [format, setFormat] = useState('all');
  const [software, setSoftware] = useState<Software[]>([]);
  const [showExternal, setShowExternal] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const saved = DlsApiService.getSoftwareRegistry();
    if (saved.length > 0) {
      setSoftware(saved);
    } else {
      const initial: Software[] = [
        {
          id: '1',
          name: 'DriveSoft Studio Pro',
          description: 'Najlepsze IDE dla twórców aplikacji w systemie DriveSoft. Pełne wsparcie dla DLS API.',
          version: '1.2.0',
          format: 'exe',
          iconUrl: 'https://cdn-icons-png.flaticon.com/512/1005/1005141.png',
          downloadUrl: 'https://drivesoftware.pl/dl/studio_pro.exe',
          updateUrl: 'https://drivesoftware.pl/api/v1/update',
          updateCode: 'studio_v120.dll',
          author: 'Karol Kopeć',
          releaseDate: '2024-05-10'
        },
        {
          id: '2',
          name: 'DLS Gateway Core',
          description: 'Biblioteka do integracji własnych stron z systemem logowania DriveSoft 1.0.',
          version: '1.0.4',
          format: 'zip',
          iconUrl: 'https://cdn-icons-png.flaticon.com/512/919/919853.png',
          downloadUrl: 'https://drivesoftware.pl/dl/dls_core.zip',
          updateUrl: 'https://drivesoftware.pl/api/v1/sync',
          updateCode: 'dls_v104.bin',
          author: 'Karol Kopeć',
          releaseDate: '2024-11-15'
        }
      ];
      setSoftware(initial);
      localStorage.setItem('dls_software', JSON.stringify(initial));
    }
  }, []);

  const handleUpdate = async (soft: Software) => {
    setUpdating(soft.id);
    const result = await DlsApiService.checkUpdate(soft.id, soft.version);
    
    setTimeout(() => {
      setUpdating(null);
      if (result.updateAvailable) {
        alert(`Dostępna aktualizacja: v${result.newVersion}. Pobieranie przez DLS Update Engine...`);
      } else {
        alert("Twoja aplikacja jest aktualna (Zweryfikowano przez DLS API Gateway).");
      }
    }, 1200);
  };

  const handleDownload = (soft: Software) => {
    if (!user) {
      alert("Musisz być zalogowany przez DLS 1.0, aby pobierać pliki z Rejestru.");
      return;
    }
    DlsApiService.triggerDownload(soft);
  };

  const filtered = software.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.description.toLowerCase().includes(search.toLowerCase());
    const matchesFormat = format === 'all' || s.format === format;
    return matchesSearch && matchesFormat;
  });

  return (
    <div className="space-y-16 pb-20">
      <section className="bg-gradient-to-br from-indigo-700 via-indigo-900 to-black rounded-[4rem] p-16 text-white shadow-2xl relative overflow-hidden animate-in fade-in duration-1000">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center space-x-3 mb-6">
             <span className="bg-indigo-500/30 backdrop-blur-md px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-white/10">DLS 1.0 Registry Gateway</span>
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          </div>
          <h1 className="text-7xl font-black mb-8 tracking-tighter leading-tight italic">DriveSoft Software</h1>
          <p className="text-indigo-100/80 text-xl mb-12 font-medium leading-relaxed max-w-2xl">
            Oficjalne centrum dystrybucji oprogramowania DriveSoft. Pobieraj instalatory EXE, archiwa ZIP i obrazy ISO zweryfikowane przez system DLS.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 bg-white/5 backdrop-blur-xl p-4 rounded-[2.5rem] border border-white/10 shadow-3xl">
            <div className="flex-1 flex items-center bg-white/5 rounded-2xl px-6 py-2 border border-white/5 focus-within:border-indigo-400 transition-all">
              <i className="fas fa-search text-indigo-300 mr-4"></i>
              <input 
                type="text" 
                placeholder="Szukaj aplikacji (np. Studio, Core, ISO)..." 
                className="w-full bg-transparent border-none outline-none text-white placeholder:text-indigo-200/50 font-bold py-2" 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
            </div>
            <button onClick={() => setShowExternal(!showExternal)} className={`px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center space-x-3 ${showExternal ? 'bg-indigo-500 text-white shadow-indigo-500/50' : 'bg-white text-indigo-900 hover:scale-105 shadow-xl'}`}>
              <i className={showExternal ? "fas fa-times" : "fas fa-robot"}></i>
              <span>{showExternal ? 'Zamknij Asystenta' : 'DriveSoft AI 1.0'}</span>
            </button>
          </div>
        </div>
        
        <div className="absolute right-[-10%] bottom-[-20%] opacity-10 rotate-12 scale-150">
          <i className="fas fa-cloud-arrow-down text-[30rem]"></i>
        </div>
      </section>

      {!showExternal ? (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex flex-wrap items-center gap-3 bg-white p-2.5 rounded-[2rem] border border-slate-100 shadow-xl w-fit">
              {['all', 'exe', 'zip', 'iso'].map(f => (
                <button 
                  key={f} 
                  onClick={() => setFormat(f)} 
                  className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase transition-all tracking-[0.2em] ${format === f ? 'bg-indigo-600 text-white shadow-lg' : 'bg-transparent text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                >
                  {f === 'all' ? 'Wszystkie' : f.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm italic">
              Zarejestrowane obiekty: <span className="text-indigo-600 ml-1">{filtered.length}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filtered.map(soft => (
              <div key={soft.id} className="group bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 hover:shadow-3xl transition-all duration-700 relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/30 rounded-bl-[4rem] -mr-12 -mt-12 group-hover:bg-indigo-100/50 transition-all duration-700"></div>
                
                <div className="flex justify-between items-start mb-10 relative">
                  <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] p-5 flex items-center justify-center border border-slate-100 group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 shadow-inner">
                    <img src={soft.iconUrl} className="w-full h-full object-contain drop-shadow-lg" alt={soft.name} />
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">{soft.format}</span>
                    {soft.updateUrl && <span className="bg-green-100 text-green-600 px-3 py-1 rounded-lg text-[8px] font-black uppercase">Live Update</span>}
                  </div>
                </div>

                <h3 className="text-3xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tighter mb-4 italic">{soft.name}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10 flex-grow">{soft.description}</p>
                
                <div className="space-y-6 pt-8 border-t border-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">Wersja {soft.version}</div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Autor: {soft.author}</div>
                    </div>
                    <div className="text-right">
                       <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Rel: {soft.releaseDate}</div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => handleUpdate(soft)} 
                      title="Sprawdź aktualizacje przez DLS API"
                      className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100 shadow-sm"
                    >
                      <i className={`fas fa-sync-alt text-lg ${updating === soft.id ? 'fa-spin' : ''}`}></i>
                    </button>
                    <button 
                      onClick={() => handleDownload(soft)}
                      className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 hover:shadow-2xl transition-all shadow-xl shadow-slate-200 flex items-center justify-center space-x-3 group/btn"
                    >
                      <i className="fas fa-download group-hover:animate-bounce"></i>
                      <span>Pobierz {soft.format.toUpperCase()}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <CreatorSection />
        </>
      ) : (
        <div className="bg-white p-24 rounded-[4rem] text-center border border-slate-100 shadow-3xl animate-in zoom-in-95 duration-700">
           <div className="w-24 h-24 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl animate-bounce">
              <i className="fas fa-robot text-4xl"></i>
           </div>
           <h2 className="text-5xl font-black mb-6 tracking-tighter italic">DSAI 1.0 (Legacy Core)</h2>
           <p className="text-slate-500 max-w-xl mx-auto mb-12 text-xl font-medium leading-relaxed italic">
             "Witaj w systemie DriveSoft AI. Jestem wersją 1.0 opartą na klasycznym silniku Gemini. Zapytaj o oprogramowanie, kody lub aktualności."
           </p>
           <Link to="/ai" className="inline-flex items-center space-x-4 bg-indigo-600 text-white px-16 py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.3em] hover:bg-black hover:scale-105 transition-all shadow-2xl">
              <span>Uruchom Chatbot AI</span>
              <i className="fas fa-arrow-right"></i>
           </Link>
        </div>
      )}
    </div>
  );
};

export default Home;
