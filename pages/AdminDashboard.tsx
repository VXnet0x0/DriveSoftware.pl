
import React, { useState, useEffect, useRef } from 'react';
import { Software } from '../types';
import { GoogleApiService } from '../services/GoogleApiService';
import { DlsApiService } from '../services/DlsApiService';

const AdminDashboard: React.FC = () => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [ver, setVer] = useState('1.0.0');
  const [icon, setIcon] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const [software, setSoftware] = useState<Software[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSoftware(DlsApiService.getSoftwareRegistry());
    setUsers(GoogleApiService.getAllUsers());
  }, []);

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedIcon(file);
      const reader = new FileReader();
      reader.onloadend = () => setIcon(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handlePublish = async () => {
    if (!name || !selectedFile) {
      alert("Musisz podać nazwę i wybrać plik instalacyjny (EXE/ZIP/ISO)!");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    // Symulacja procesu przesyłania do DLS Vault
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    try {
      await DlsApiService.uploadSoftware(
        { name, description: desc, version: ver },
        selectedFile,
        selectedIcon || undefined
      );

      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setName(''); setDesc(''); setVer('1.0.0'); setIcon(''); 
        setSelectedFile(null); setSelectedIcon(null);
        setSoftware(DlsApiService.getSoftwareRegistry());
        alert(`Aplikacja ${name} została pomyślnie przesłana do systemowego magazynu DriveSoft!`);
      }, 500);
    } catch (err) {
      alert("Błąd przesyłania do DLS Vault.");
      setIsUploading(false);
    }
  };

  const stats = {
    exe: software.filter(s => s.format === 'exe').length,
    zip: software.filter(s => s.format === 'zip').length,
    iso: software.filter(s => s.format === 'iso').length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter italic">DLS Vault Manager</h1>
          <p className="text-indigo-600 font-black uppercase text-[10px] tracking-[0.5em] mt-3">
            System Przesyłania Zasobów: Karol Kopeć | DriveSoft v2024
          </p>
        </div>
        <div className="flex space-x-4">
          <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-black uppercase text-slate-400">DLS Node: Online</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-50 relative overflow-hidden">
            <h2 className="text-3xl font-black mb-10 flex items-center text-slate-900 italic">
              <i className="fas fa-cloud-arrow-up text-indigo-600 mr-4"></i> Prześlij Software
            </h2>

            <div className="space-y-8">
              {/* Sekcja Plików */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Ikona PNG */}
                <div 
                  onClick={() => iconInputRef.current?.click()}
                  className="group relative h-48 bg-slate-50 border-4 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all overflow-hidden"
                >
                  {icon ? (
                    <img src={icon} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <>
                      <i className="fas fa-image text-slate-300 text-3xl mb-3"></i>
                      <span className="text-[10px] font-black uppercase text-slate-400">Ikona PNG (Odzwierciedlenie)</span>
                    </>
                  )}
                  <input type="file" ref={iconInputRef} onChange={handleIconChange} className="hidden" accept="image/png" />
                </div>

                {/* Plik Binarny */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`group relative h-48 border-4 border-dashed rounded-[3rem] flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${selectedFile ? 'bg-indigo-900 border-indigo-900 text-white' : 'bg-slate-50 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50'}`}
                >
                  <i className={`fas ${selectedFile ? 'fa-file-circle-check text-indigo-400' : 'fa-file-zipper text-slate-300'} text-3xl mb-3`}></i>
                  <span className={`text-[10px] font-black uppercase ${selectedFile ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {selectedFile ? selectedFile.name : 'Wybierz EXE / ZIP / ISO'}
                  </span>
                  {selectedFile && <span className="text-[8px] font-bold mt-1 text-indigo-400 uppercase tracking-widest">Gotowy do przesyłu</span>}
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".exe,.zip,.iso" />
                </div>
              </div>

              {/* Dane tekstowe */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nazwa Aplikacji</label>
                  <input type="text" placeholder="DriveSoft App..." className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:border-indigo-500 transition-all" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Wersja</label>
                  <input type="text" placeholder="1.0.0" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:border-indigo-500 transition-all" value={ver} onChange={e => setVer(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Opis zmian i funkcji</label>
                <textarea placeholder="Opisz co potrafi ten program..." className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:border-indigo-500 transition-all h-32 resize-none" value={desc} onChange={e => setDesc(e.target.value)} />
              </div>

              {isUploading && (
                <div className="space-y-3 animate-in fade-in zoom-in-95">
                  <div className="flex justify-between text-[10px] font-black uppercase text-indigo-600 tracking-widest">
                    <span>Przesyłanie do DLS Vault...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}

              <button 
                onClick={handlePublish}
                disabled={isUploading}
                className={`w-full py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-3 ${isUploading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'}`}
              >
                <i className={`fas ${isUploading ? 'fa-circle-notch fa-spin' : 'fa-paper-plane'}`}></i>
                <span>{isUploading ? 'Przetwarzanie zasobów...' : 'Wyślij do systemu DLS'}</span>
              </button>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-slate-900 text-white p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
            <h3 className="text-xl font-black mb-8 flex items-center relative z-10">
              <i className="fas fa-database text-indigo-400 mr-3"></i> Ostatnie wgrania
            </h3>
            <div className="space-y-4 relative z-10">
              {software.slice(0, 5).map(s => (
                <div key={s.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center space-x-4">
                    <img src={s.iconUrl} className="w-8 h-8 rounded-lg" alt="" />
                    <div>
                      <div className="text-[10px] font-black truncate max-w-[100px]">{s.name}</div>
                      <div className="text-[8px] text-slate-400 font-bold uppercase">{s.format} | v{s.version}</div>
                    </div>
                  </div>
                  <i className="fas fa-check-circle text-green-500 text-xs"></i>
                </div>
              ))}
            </div>
            <i className="fas fa-server absolute right-[-10%] bottom-[-5%] text-9xl text-white/5 group-hover:scale-110 transition-transform"></i>
          </section>

          <section className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-100">
            <h3 className="text-xl font-black mb-8 text-slate-900">Statystyki Vault</h3>
            <div className="space-y-6">
              {[
                { label: 'Instalatory EXE', count: stats.exe, color: 'bg-indigo-600' },
                { label: 'Archiwa ZIP', count: stats.zip, color: 'bg-teal-500' },
                { label: 'Obrazy ISO', count: stats.iso, color: 'bg-amber-500' }
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 mb-2">
                    <span>{item.label}</span>
                    <span className="text-slate-900">{item.count}</span>
                  </div>
                  <div className="h-2 bg-slate-50 rounded-full border border-slate-100">
                    <div className={`${item.color} h-full transition-all duration-1000`} style={{ width: `${(item.count / (software.length || 1)) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
