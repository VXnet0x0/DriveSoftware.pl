
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Software, ForumPost, User } from '../types';
import { DlsApiService } from '../services/DlsApiService';
import { GoogleApiService } from '../services/GoogleApiService';

const GlobalSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [software, setSoftware] = useState<Software[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  useEffect(() => {
    setSoftware(DlsApiService.getSoftwareRegistry());
    const savedPosts = localStorage.getItem('dls_forum_posts');
    if (savedPosts) setPosts(JSON.parse(savedPosts));

    const fetchDrive = async () => {
      try {
        const files = await GoogleApiService.listDriveFiles();
        setDriveFiles(files);
      } catch (e) {
        console.warn("GlobalSearch: Drive cloud not active.");
      }
    };
    fetchDrive();
  }, []);

  const handleTakeSoftware = (soft: Software) => {
    setIsDownloading(soft.id);
    DlsApiService.triggerDownload(soft);
    setTimeout(() => setIsDownloading(null), 2000);
  };

  const handleTakeDriveFile = async (file: any) => {
    setIsDownloading(file.id);
    try {
      await GoogleApiService.downloadFile(file.id, file.name);
    } finally {
      setIsDownloading(null);
    }
  };

  const results = useMemo(() => {
    if (!query.trim()) return { software: [], posts: [], drive: [] };
    const lowerQuery = query.toLowerCase();
    return {
      software: software.filter(s => s.name.toLowerCase().includes(lowerQuery) || s.description.toLowerCase().includes(lowerQuery)),
      posts: posts.filter(p => p.title.toLowerCase().includes(lowerQuery) || p.content.toLowerCase().includes(lowerQuery)),
      drive: driveFiles.filter(f => f.name.toLowerCase().includes(lowerQuery))
    };
  }, [query, software, posts, driveFiles]);

  const totalResults = results.software.length + results.posts.length + results.drive.length;

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-10 animate-in fade-in duration-700">
      <div className="text-center space-y-6">
        <h1 className="text-7xl font-black text-slate-900 tracking-tighter italic">DriveFetcher</h1>
        <p className="text-indigo-600 font-black uppercase text-[10px] tracking-[0.5em]">Globalny system pobierania DriveSoft 1.0</p>
        
        <div className="relative max-w-3xl mx-auto mt-10">
          <div className="absolute inset-y-0 left-0 pl-8 flex items-center pointer-events-none">
            <i className="fas fa-search text-indigo-400 text-xl"></i>
          </div>
          <input 
            type="text" 
            placeholder="Wpisz nazwę aplikacji lub pliku, który chcesz POBRAĆ..."
            className="w-full bg-white border-4 border-slate-100 rounded-[3rem] py-8 pl-20 pr-10 text-2xl font-black shadow-2xl focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 italic"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      {query.trim() && (
        <div className="space-y-16">
          {/* Software: "Bierz Pliki" */}
          {results.software.length > 0 && (
            <section className="space-y-8">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 ml-6 flex items-center">
                <span className="w-12 h-[1px] bg-slate-200 mr-4"></span>
                Software Registry (EXE/ZIP/ISO)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {results.software.map(soft => (
                  <div key={soft.id} className="group bg-white p-8 rounded-[3.5rem] border border-slate-100 hover:border-indigo-600 shadow-xl transition-all flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <img src={soft.iconUrl} className="w-20 h-20 rounded-2xl bg-slate-50 p-3 shadow-inner group-hover:rotate-6 transition-transform" alt="" />
                      <div>
                        <h3 className="text-xl font-black text-slate-900">{soft.name}</h3>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="bg-indigo-600 text-white text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">{soft.format}</span>
                          <span className="text-[10px] text-slate-400 font-bold italic">v{soft.version}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleTakeSoftware(soft)}
                      disabled={isDownloading === soft.id}
                      className="bg-slate-900 text-white w-16 h-16 rounded-[1.5rem] flex items-center justify-center hover:bg-indigo-600 transition-all shadow-xl active:scale-90"
                    >
                      <i className={`fas ${isDownloading === soft.id ? 'fa-circle-notch fa-spin' : 'fa-download'} text-xl`}></i>
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* DriveFiles: "Bierz Pliki" */}
          {results.drive.length > 0 && (
            <section className="space-y-8">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-teal-600 ml-6 flex items-center">
                <span className="w-12 h-[1px] bg-teal-100 mr-4"></span>
                Twoje Pliki Cloud
              </h2>
              <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl overflow-hidden">
                <table className="w-full">
                  <tbody className="divide-y divide-slate-50">
                    {results.drive.map(file => (
                      <tr key={file.id} className="hover:bg-teal-50/30 transition-colors">
                        <td className="px-10 py-6">
                          <div className="flex items-center space-x-4">
                            <i className="fas fa-file-invoice text-teal-400 text-xl"></i>
                            <span className="font-black text-slate-700 text-lg">{file.name}</span>
                          </div>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <button 
                            onClick={() => handleTakeDriveFile(file)}
                            className="bg-teal-500 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-600 transition shadow-lg flex items-center space-x-2"
                          >
                            <i className="fas fa-cloud-arrow-down"></i>
                            <span>Bierz plik</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Forum Results: Info only */}
          {results.posts.length > 0 && (
            <section className="space-y-8">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 ml-6 flex items-center">
                <span className="w-12 h-[1px] bg-slate-200 mr-4"></span>
                Poradniki & Posty
              </h2>
              <div className="space-y-4">
                {results.posts.map(post => (
                  <Link key={post.id} to="/forum" className="block bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:shadow-2xl transition-all">
                    <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600">{post.title}</h3>
                    <p className="text-sm text-slate-500 mt-2 line-clamp-2 italic">{post.content}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {totalResults === 0 && (
            <div className="text-center py-32 bg-white rounded-[4rem] border border-dashed border-slate-200">
              <i className="fas fa-box-open text-6xl text-slate-100 mb-6"></i>
              <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter italic">Brak zasobów</h3>
              <p className="text-slate-400 font-medium italic">Nie znaleźliśmy żadnych plików do "pobrania" dla frazy "{query}"</p>
            </div>
          )}
        </div>
      )}

      {!query.trim() && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20">
          <div className="p-12 bg-indigo-900 text-white rounded-[4rem] shadow-2xl relative overflow-hidden group">
            <i className="fas fa-download text-9xl absolute right-[-5%] bottom-[-10%] opacity-10 group-hover:scale-110 transition-transform"></i>
            <h4 className="text-2xl font-black italic mb-4">Software Hub</h4>
            <p className="text-indigo-200 text-sm leading-relaxed mb-8">Przeszukuj oficjalne oprogramowanie Karol Kopeć DriveSoft i pobieraj instalatory bezpośrednio tutaj.</p>
            <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-indigo-400">
              Tryb: Direct Download Aktywny
            </div>
          </div>
          <div className="p-12 bg-white border-4 border-slate-100 rounded-[4rem] shadow-xl relative overflow-hidden group">
             <i className="fas fa-cloud-meatball text-9xl absolute right-[-5%] bottom-[-10%] opacity-5 text-indigo-600"></i>
             <h4 className="text-2xl font-black italic mb-4">Cloud Bridge</h4>
             <p className="text-slate-500 text-sm leading-relaxed mb-8">Twoje pliki z Google Drive są teraz zsynchronizowane z wyszukiwarką. Znajdź i bierz pliki w sekundę.</p>
             <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-teal-600">
              API: Google v3 Connect
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
