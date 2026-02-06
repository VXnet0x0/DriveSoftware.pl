
import { User } from '../types';

/**
 * DriveSoft Google API Integration Module v1.0
 */

const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'; 
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly';

export class GoogleApiService {
  private static STORAGE_KEY = 'dls_registry_users';
  private static LOGS_KEY = 'dls_user_logs';
  private static tokenClient: any = null;
  private static accessToken: string | null = null;

  static initGsi(callback: (token: string) => void) {
    const google = (window as any).google;
    if (typeof google === 'undefined') return;
    
    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response: any) => {
        if (response.access_token) {
          this.accessToken = response.access_token;
          callback(response.access_token);
        }
      },
    });
  }

  static requestToken() {
    if (this.tokenClient) {
      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    }
  }

  static async listDriveFiles(): Promise<any[]> {
    if (!this.accessToken) throw new Error("Brak autoryzacji Google Drive.");
    const response = await fetch('https://www.googleapis.com/drive/v3/files?fields=files(id,name,mimeType,size,createdTime,iconLink,webContentLink)', {
      headers: { Authorization: `Bearer ${this.accessToken}` }
    });
    const data = await response.json();
    return data.files || [];
  }

  static async downloadFile(fileId: string, fileName: string) {
    if (!this.accessToken) {
      alert("Najpierw połącz się z DriveCloud w zakładce Cloud!");
      return;
    }
    // Pobieranie binarne przez Google API
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${this.accessToken}` }
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static async uploadFile(file: File): Promise<any> {
    if (!this.accessToken) throw new Error("Brak autoryzacji do wysyłania.");
    const metadata = { name: file.name, mimeType: file.type };
    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', file);
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.accessToken}` },
      body: formData
    });
    return await response.json();
  }

  static getAllUsers(): any[] {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
  }

  static isEmailAvailable(email: string): boolean {
    if (email === 'karol000@dls.pl') return false;
    const users = this.getAllUsers();
    return !users.some(u => u.email === email);
  }

  static validateCredentials(email: string, password: string): any | null {
    if (email === 'karol000@dls.pl' && password === '94730005') {
      return {
        id: 'dls-owner-001',
        username: 'Karol Kopeć',
        email: 'karol000@dls.pl',
        role: 'owner',
        joinedAt: '2024-01-01T10:00:00.000Z',
        avatar: 'https://ui-avatars.com/api/?name=Karol+Kopec&background=4f46e5&color=fff',
        apiKey: 'DLS-1.0-MASTER-9473-0005'
      };
    }
    const users = this.getAllUsers();
    return users.find(u => u.email === email && u.password === password) || null;
  }

  static dlsRegister(email: string, username: string, password: string): User {
    const users = this.getAllUsers();
    if (email === 'karol000@dls.pl') throw new Error("E-mail zarezerwowany.");
    const isOwnerByPattern = username.toLowerCase().includes('karol kopeć');
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      email,
      role: isOwnerByPattern ? 'owner' : 'user',
      joinedAt: new Date().toISOString(),
      avatar: `https://ui-avatars.com/api/?name=${username}&background=random`,
      apiKey: `DLS-1.0-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
    };
    users.push({ ...newUser, password }); 
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
    this.logActivity(newUser.id, 'ACCOUNT_CREATED', `Konto utworzone.`);
    return newUser;
  }

  static logActivity(userId: string, type: string, description: string) {
    const logs = JSON.parse(localStorage.getItem(this.LOGS_KEY) || '[]');
    logs.push({ id: Date.now().toString(), userId, type, description, timestamp: new Date().toISOString() });
    localStorage.setItem(this.LOGS_KEY, JSON.stringify(logs));
  }
}
