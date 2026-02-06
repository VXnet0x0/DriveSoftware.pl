
import React, { useState } from 'react';
import { DlsApiService } from '../services/DlsApiService';

const ApiExplorer: React.FC = () => {
  const [activeTab, setActiveTab] = useState('docs');
  const manifest = DlsApiService.getApiManifest();
  const status = DlsApiService.getSystemStatus();

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
      <header className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <span className="bg-indigo-500 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">Dev Central</span>
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">v1.0 Stable</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter mb-4">DLS API Explorer</h1>
          <p className="text-slate-400 max-w-xl font-medium">Integruj swoje aplikacje z ekosystemem DriveSoft. Korzystaj z bezpiecznej autoryzacji i globalnej bazy danych.</p>
        </div>
        <i className="fas fa-code-branch absolute right-[-5%] bottom-[-10%] text-[15rem] text-white/5"></i>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab('docs')}
            className={`w-full text-left px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'docs' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}
          >
            <i className="fas fa-book mr-3"></i> Dokumentacja
          </button>
          <button 
            onClick={() => setActiveTab('status')}
            className={`w-full text-left px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'status' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}
          >
            <i className="fas fa-signal mr-3"></i> Status Systemu
          </button>
        </aside>

        <main className="lg:col-span-3 space-y-8">
          {activeTab === 'docs' ? (
            <div className="space-y-6">
              {manifest.endpoints.map((ep, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="bg-slate-900 text-white px-3 py-1 rounded-lg text-[9px] font-black tracking-widest">{ep.method}</span>
                      <code className="text-indigo-600 font-black text-sm">{ep.path}</code>
                    </div>
                    <i className="fas fa-lock text-slate-200 text-xs"></i>
                  </div>
                  <p className="text-slate-600 text-sm font-medium">{ep.desc}</p>
                  <div className="mt-6 p-4 bg-slate-50 rounded-xl font-mono text-[11px] text-slate-500 border border-slate-100">
                    GET https://drivesoftware.pl/api/v1{ep.path}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Właściciel API</div>
                  <div className="text-xl font-black text-slate-900">{status.owner}</div>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Dostępność</div>
                  <div className="text-xl font-black text-green-600">{status.uptime}</div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Aktywne Węzły DLS</h3>
                <div className="flex flex-wrap gap-3">
                  {status.nodes.map(n => (
                    <span key={n} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold border border-indigo-100">
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ApiExplorer;
