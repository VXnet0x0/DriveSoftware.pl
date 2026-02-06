
import React, { useState, useEffect, useMemo } from 'react';
import { Software } from '../types';
import { DlsApiService, DownloadSession } from '../services/DlsApiService';

const DownloadCenter: React.FC = () => {
  const [apps, setApps] = useState<Software[]>([]);
  const [activeDownloads, setActiveDownloads] = useState<DownloadSession[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'exe' | 'zip' | 'iso'>('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    setApps(DlsApiService.getSoftwareRegistry());
  }, []);

  const handleDownload = (soft: Software) => {
    DlsApiService.startSecureDownload(soft, (session) => {
      setActiveDownloads(prev => {
        const exists = prev.find(d => d.id === session.id);
        if (exists) {
          return prev.map(d => d.id === session.id ? session : d);
        }
        return [...prev, session];
      });
      if (session.status === 'completed') {
        setRefreshTrigger(prev => prev + 1);
      }
    });
  };

  const handleRun = (soft: Software) => {
    DlsApiService.runApplication(soft);
  };

  const filteredApps = useMemo(() => {
    return apps.filter(app => {
      const matchesSearch = 
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        app.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = activeFilter === 'all' || app.format === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [apps, searchTerm, activeFilter]);

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 animate-in fade-in duration-1000">
      {/* Header & Search Section */}
      <header className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter italic">Drive Distribution</h1>
            <p className="text-indigo-600 font-black uppercase text-[10px] tracking-[0.5em] mt-3 flex items-center">
              <span className="w-8 h-[1px] bg-indigo-600 mr-3"></span>
              DLS 1.0 Engine Service
            </p>
          </div>
          
          <div className="bg-white p-2 rounded-3xl shadow-xl border border-slate-100 flex items-center space-x-2 w-full md:w-auto min-w-[300px]">
            <div className="flex-1 flex items-center px-4">
              <i className="fas fa-search text-slate-300 mr-3"></i>
              <input 
                type="text" 
                placeholder="Szukaj plików..." 
                className="bg-transparent border-none outline-none py-3 text-sm font-bold text-slate-700 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {[
            { id: 'all', label: 'Wszystkie Pliki', icon: 'fa-layer-group' },
            { id: 'exe', label: 'Instalatory EXE', icon: 'fa-window-maximize' },
            { id: 'zip', label: 'Pakiety ZIP', icon: 'fa-file-archive' },
            { id: 'iso', label: 'Obrazy ISO', icon: 'fa-compact-disc' }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id as any)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2 border ${
                activeFilter === filter.id 
                ? 'bg-slate-900 text-white border-slate-900 shadow-xl scale-105' 
                : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-200 hover:text-indigo-600'
              }`}
            >
              <i className={`fas ${filter.icon}`}></i>
              <span>{filter.label}</span>
            </button>
          ))}
          
          <div className="ml-auto text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:block">
            Znaleziono: <span className="text-indigo-600">{filteredApps.length}</span> plików
          </div>
        </div>
      </header>

      {/* Active Downloads Status */}
      {activeDownloads.filter(d => d.status !== 'completed').length > 0 && (
        <section className="bg-indigo-900 p-8 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <h2 className="text-white text-xs font-black uppercase tracking-[0.3em] mb-6 flex items-center">
            <i className="fas fa-satellite-dish mr-3 animate-pulse"></i> Kolejka Transferu DLS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeDownloads.filter(d => d.status !== 'completed').map(dl => (
              <div key={dl.id} className="bg-white/10 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/10 shadow-xl animate-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white text-indigo-900 rounded-2xl flex items-center justify-center text-xl shadow-lg">
                      <i className={`fas ${dl.status === 'verifying' ? 'fa-shield-check' : dl.status === 'installing' ? 'fa-screwdriver-wrench' : 'fa-download'} ${dl.status === 'downloading' || dl.status === 'installing' ? 'animate-bounce' : ''}`}></i>
                    </div>
                    <div>
                      <div className="text-sm font-black text-white">{dl.name}</div>
                      <div className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">{dl.status}</div>
                    </div>
                  </div>
                  <div className="text-xl font-black text-white">{dl.progress}%</div>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.5)] transition-all duration-300" 
                    style={{ width: `${dl.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Software Grid */}
      {filteredApps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredApps.map(app => {
            const isInstalled = DlsApiService.isInstalled(app.id);
            return (
              <div key={app.id} className="group bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm hover:shadow-3xl transition-all duration-500 relative flex flex-col">
                <div className="absolute top-8 right-10 flex flex-col items-end space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Hash: {app.updateCode.substring(0, 8)}</span>
                </div>

                <div className="flex justify-between items-start mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-600 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                    <img src={app.iconUrl} className="w-20 h-20 rounded-[2rem] shadow-inner p-4 bg-slate-50 relative z-10 border border-slate-100 group-hover:scale-110 transition-transform duration-500" alt="" />
                    {isInstalled && (
                       <div className="absolute -bottom-2 -right-2 bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center border-4 border-white text-[10px] shadow-lg">
                          <i className="fas fa-check"></i>
                       </div>
                    )}
                  </div>
                  <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                    app.format === 'exe' ? 'bg-blue-600 text-white' :
                    app.format === 'zip' ? 'bg-amber-500 text-white' :
                    'bg-indigo-600 text-white'
                  }`}>
                    {app.format}
                  </span>
                </div>
                
                <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tighter italic group-hover:text-indigo-600 transition-colors">{app.name}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10 line-clamp-3">
                  {app.description}
                </p>
                
                <div className="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Wersja Stabilna</div>
                    <div className="text-lg font-black text-slate-900">v{app.version}</div>
                  </div>
                  <div className="flex space-x-2">
                    {isInstalled && app.format === 'exe' ? (
                       <button 
                        onClick={() => handleRun(app)}
                        className="bg-indigo-600 text-white px-8 py-4 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-indigo-700 hover:shadow-2xl transition-all flex items-center space-x-3 active:scale-95"
                      >
                        <i className="fas fa-play"></i>
                        <span>Uruchom</span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleDownload(app)}
                        className="bg-slate-900 text-white px-10 py-4 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-indigo-600 hover:shadow-2xl transition-all flex items-center space-x-3 active:scale-95"
                      >
                        <i className="fas fa-cloud-arrow-down"></i>
                        <span>{isInstalled ? 'Pobierz Ponownie' : 'Pobierz'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-32 bg-white rounded-[4rem] border border-slate-100 shadow-inner animate-in fade-in zoom-in-95">
          <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-slate-100">
            <i className="fas fa-search-minus text-4xl"></i>
          </div>
          <h3 className="text-3xl font-black text-slate-900 mb-3">Brak wyników</h3>
          <p className="text-slate-400 font-medium max-w-sm mx-auto">Nie znaleźliśmy plików pasujących do frazy "{searchTerm}" w tej kategorii.</p>
          <button 
            onClick={() => { setSearchTerm(''); setActiveFilter('all'); }}
            className="mt-8 text-indigo-600 font-black uppercase text-[10px] tracking-widest hover:text-indigo-800"
          >
            Wyczyść wszystkie filtry
          </button>
        </div>
      )}
    </div>
  );
};

export default DownloadCenter;
