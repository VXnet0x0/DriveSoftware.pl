
import React, { useState, useEffect, useMemo } from 'react';
import { GoogleApiService } from '../services/GoogleApiService';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime: string;
  iconLink?: string;
}

const DriveModule: React.FC = () => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    GoogleApiService.initGsi((token) => {
      setIsAuth(true);
      fetchDriveData();
    });
  }, []);

  const fetchDriveData = async () => {
    setLoading(true);
    try {
      const data = await GoogleApiService.listDriveFiles();
      setFiles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFiles = useMemo(() => {
    return files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
  }, [files, search]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await GoogleApiService.uploadFile(file);
      alert(`Plik ${file.name} został pomyślnie wysłany do DriveCloud!`);
      fetchDriveData();
    } catch (err) {
      alert("Błąd wysyłania: Brak autoryzacji sesji.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic">DriveCloud v1.0</h1>
          <p className="text-indigo-600 font-black uppercase text-[10px] tracking-[0.4em] mt-2 flex items-center">
            <span className={`w-2 h-2 rounded-full mr-2 ${isAuth ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></span>
            {isAuth ? 'Google API: SESJA AKTYWNA' : 'DriveSoft Gateway: OCZEKIWANIE'}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          {!isAuth ? (
            <button 
              onClick={() => GoogleApiService.requestToken()}
              className="bg-indigo-600 text-white px-10 py-5 rounded-[2rem] font-black hover:bg-indigo-700 transition shadow-2xl flex items-center space-x-3"
            >
              <i className="fab fa-google-drive"></i>
              <span>Połącz z Google Drive</span>
            </button>
          ) : (
            <div className="flex space-x-4">
              <div className="bg-white px-6 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3 focus-within:border-indigo-400 transition-all">
                <i className="fas fa-search text-slate-300"></i>
                <input 
                  type="text" 
                  placeholder="Szukaj w chmurze..." 
                  className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 w-48"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <label className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black hover:bg-black transition cursor-pointer flex items-center space-x-3 shadow-2xl relative overflow-hidden group">
                {uploading && <div className="absolute inset-0 bg-indigo-600 flex items-center justify-center z-10"><i className="fas fa-circle-notch fa-spin"></i></div>}
                <i className="fas fa-cloud-arrow-up"></i>
                <span>Wyślij plik</span>
                <input type="file" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex items-center space-x-4 mb-4">
             <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl shadow-inner">
                <i className="fas fa-microchip"></i>
             </div>
             <div>
               <div className="text-2xl font-black text-slate-900">{filteredFiles.length}</div>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Widoczne obiekty</div>
             </div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex items-center space-x-4 mb-4">
             <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl shadow-inner">
                <i className="fas fa-shield-halved"></i>
             </div>
             <div>
               <div className="text-2xl font-black text-slate-900">v1.0</div>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bezpieczeństwo DLS</div>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[4rem] border border-slate-50 shadow-2xl overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[400px]">
            <i className="fas fa-circle-notch fa-spin text-3xl text-indigo-600 mb-4"></i>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizacja z Google Cloud...</p>
          </div>
        ) : !isAuth ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center p-12">
            <i className="fas fa-folder-open text-6xl text-slate-100 mb-6"></i>
            <h3 className="text-2xl font-black text-slate-900 mb-3">Chmura nieaktywna</h3>
            <p className="text-slate-400 text-sm max-w-sm">Połącz się ze swoim kontem Google, aby zarządzać plikami DriveSoft bezpośrednio z Twojego dysku wirtualnego.</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center p-12">
            <i className="fas fa-search text-6xl text-slate-100 mb-6"></i>
            <h3 className="text-2xl font-black text-slate-900 mb-3">Nic nie znaleziono</h3>
            <p className="text-slate-400 text-sm">Brak plików pasujących do frazy "{search}" w Twoim DriveCloud.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nazwa pliku</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Typ</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rozmiar</th>
                  <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredFiles.map(file => (
                  <tr key={file.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex items-center space-x-4">
                        <img src={file.iconLink || 'https://cdn-icons-png.flaticon.com/512/3767/3767084.png'} className="w-6 h-6" alt="" />
                        <span className="font-bold text-slate-900">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase">{file.mimeType.split('/').pop()}</td>
                    <td className="px-10 py-6 text-xs font-bold text-slate-500">{file.size ? `${(parseInt(file.size)/1024/1024).toFixed(2)} MB` : '--'}</td>
                    <td className="px-10 py-6 text-right">
                      <button className="bg-slate-100 hover:bg-indigo-600 hover:text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition">
                        Pobierz
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriveModule;
