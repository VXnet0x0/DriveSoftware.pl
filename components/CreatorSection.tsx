
import React from 'react';

const CreatorSection: React.FC = () => {
  return (
    <section className="bg-white p-12 rounded-[4rem] shadow-xl border border-slate-100 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-indigo-500/10 transition-colors duration-700"></div>
      
      <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
        <div className="shrink-0">
          <div className="relative">
            <div className="w-48 h-48 rounded-[3rem] bg-gradient-to-tr from-indigo-600 to-blue-400 p-1">
              <img 
                src="https://ui-avatars.com/api/?name=Karol+Kopeć&size=200&background=fff&color=4f46e5" 
                className="w-full h-full object-cover rounded-[2.8rem] border-4 border-white shadow-2xl" 
                alt="Karol Kopeć" 
              />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-2xl shadow-xl border border-slate-100 animate-float">
              <i className="fas fa-award text-amber-500 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <span className="text-indigo-600 font-black uppercase text-[10px] tracking-[0.3em] mb-3 block">Twórca & Główny Deweloper</span>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Karol Kopeć</h2>
          <p className="text-slate-500 font-medium leading-relaxed mb-8 max-w-xl">
            Wizjoner i architekt ekosystemu DriveSoft. Od 2024 roku rozwija autorski system logowania DLS 1.0 oraz platformę dystrybucji oprogramowania, kładąc nacisk na bezpieczeństwo i łatwość integracji dla deweloperów z całego świata.
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <a href="https://drivesoftware.pl" className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-black transition-all shadow-lg flex items-center space-x-2">
              <i className="fas fa-globe"></i>
              <span>drivesoftware.pl</span>
            </a>
            <div className="flex items-center space-x-4 ml-2">
              <i className="fab fa-github text-slate-300 text-2xl hover:text-slate-900 transition-colors cursor-pointer"></i>
              <i className="fab fa-linkedin text-slate-300 text-2xl hover:text-blue-600 transition-colors cursor-pointer"></i>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreatorSection;
