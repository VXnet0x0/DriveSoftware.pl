
import { User, Software, ForumPost } from '../types';

export interface DownloadSession {
  id: string;
  name: string;
  progress: number;
  status: 'connecting' | 'downloading' | 'verifying' | 'installing' | 'completed' | 'failed';
  format: string;
}

export class DlsApiService {
  private static STORAGE_KEY = 'dls_installed_apps';

  static getSoftwareRegistry(): Software[] {
    const saved = localStorage.getItem('dls_software');
    return saved ? JSON.parse(saved) : [];
  }

  static getInstalledApps(): string[] {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  }

  static isInstalled(appId: string): boolean {
    return this.getInstalledApps().includes(appId);
  }

  static async uploadSoftware(
    appData: Partial<Software>,
    binaryFile: File,
    iconFile?: File
  ): Promise<Software> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const iconUrl = iconFile ? (URL.createObjectURL(iconFile)) : 'https://cdn-icons-png.flaticon.com/512/1005/1005141.png';
        
        const newApp: Software = {
          id: Date.now().toString(),
          name: appData.name || 'Nowa Aplikacja',
          description: appData.description || '',
          version: appData.version || '1.0.0',
          format: (binaryFile.name.split('.').pop() as any) || 'exe',
          iconUrl: iconUrl,
          downloadUrl: `dls-internal://vault/${binaryFile.name}`,
          updateUrl: appData.updateUrl || '',
          updateCode: `hash_${Math.random().toString(36).substr(2, 9)}.bin`,
          author: 'Karol Kopeć',
          releaseDate: new Date().toISOString().split('T')[0]
        };

        const registry = this.getSoftwareRegistry();
        const updated = [newApp, ...registry];
        localStorage.setItem('dls_software', JSON.stringify(updated));
        resolve(newApp);
      };
      if (iconFile) reader.readAsDataURL(iconFile);
      else reader.onloadend(null as any);
    });
  }

  static async startSecureDownload(
    soft: Software, 
    onProgress: (session: DownloadSession) => void
  ) {
    const session: DownloadSession = {
      id: soft.id,
      name: soft.name,
      progress: 0,
      status: 'connecting',
      format: soft.format
    };

    onProgress({...session});
    await new Promise(r => setTimeout(r, 600));
    
    session.status = 'downloading';
    for (let i = 0; i <= 70; i += 10) {
      session.progress = i;
      onProgress({...session});
      await new Promise(r => setTimeout(r, 100));
    }

    if (soft.format === 'exe') {
      session.status = 'installing';
      for (let i = 71; i <= 95; i += 5) {
        session.progress = i;
        onProgress({...session});
        await new Promise(r => setTimeout(r, 200));
      }
    }

    session.status = 'verifying';
    session.progress = 98;
    onProgress({...session});
    await new Promise(r => setTimeout(r, 800));

    session.status = 'completed';
    session.progress = 100;
    onProgress({...session});

    // Rejestracja instalacji
    const installed = this.getInstalledApps();
    if (!installed.includes(soft.id)) {
      installed.push(soft.id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(installed));
    }

    this.triggerBrowserDownload(soft);
  }

  static triggerDownload(soft: Software) {
    const installed = this.getInstalledApps();
    if (!installed.includes(soft.id)) {
      installed.push(soft.id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(installed));
    }
    this.triggerBrowserDownload(soft);
  }

  private static triggerBrowserDownload(soft: Software) {
    const mimeType = soft.format === 'exe' ? 'application/x-msdownload' : 
                     soft.format === 'iso' ? 'application/x-iso9660-image' : 'application/zip';
    
    // Generowanie większego "atrapy" pliku dla EXE, aby system go nie blokował jako pustego
    const dummyContent = new Uint8Array(1024 * 10); // 10KB atrapy binariów
    dummyContent.set([0x4D, 0x5A]); // Nagłówek MZ dla plików EXE
    
    const blob = new Blob([dummyContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${soft.name.replace(/ /g, '_').toLowerCase()}_v${soft.version}.${soft.format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static runApplication(soft: Software) {
    if (soft.format !== 'exe') {
      alert(`Plik .${soft.format} nie może zostać uruchomiony bezpośrednio. Rozpakuj go najpierw.`);
      return;
    }
    // Symulacja uruchomienia środowiska runtime DLS
    const win = window.open('', '_blank', 'width=800,height=600');
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>DLS Runtime: ${soft.name}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
          </head>
          <body class="bg-slate-900 text-white flex items-center justify-center h-screen overflow-hidden font-sans">
            <div className="text-center space-y-6">
              <div class="w-32 h-32 bg-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl mb-8">
                 <img src="${soft.iconUrl}" class="w-20 h-20 object-contain">
              </div>
              <h1 class="text-4xl font-black italic">${soft.name}</h1>
              <p class="text-indigo-400 font-bold uppercase tracking-widest text-xs">Uruchomiono w DriveSoft 1.0 Runtime</p>
              <div class="mt-10 p-8 bg-white/5 rounded-3xl border border-white/10 max-w-md">
                <p class="text-sm text-slate-400 leading-relaxed">${soft.description}</p>
              </div>
              <p class="mt-8 text-[10px] text-slate-600 uppercase font-black tracking-widest">Wersja binarna: ${soft.version} | Hash: ${soft.updateCode}</p>
            </div>
          </body>
        </html>
      `);
    }
  }

  static async checkUpdate(appId: string, currentVersion: string) {
    const registry = this.getSoftwareRegistry();
    const app = registry.find(s => s.id === appId);
    if (app && app.version !== currentVersion) {
      return { updateAvailable: true, newVersion: app.version };
    }
    return { updateAvailable: false };
  }

  static getApiManifest() {
    return {
      name: "DriveSoft DLS API Gateway",
      version: "1.0",
      endpoints: [
        { path: "/vault/upload", method: "POST", desc: "Przesyłanie plików binarnych do systemu" },
        { path: "/vault/fetch", method: "GET", desc: "Pobieranie plików z DLS Vault" },
        { path: "/auth/verify", method: "POST", desc: "Weryfikacja klucza DLS 1.0" }
      ]
    };
  }

  static getSystemStatus() {
    return {
      status: "OPERATIONAL",
      version: "DLS 1.0.12-VAULT",
      uptime: "99.99%",
      owner: "Karol Kopeć",
      nodes: ["Warszawa-Main-01", "Kraków-Edge-02", "DLS-Cloud-Global"]
    };
  }
}
