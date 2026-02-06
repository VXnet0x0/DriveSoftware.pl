
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'owner' | 'user' | 'developer';
  avatar?: string;
  joinedAt: string;
  birthDate?: string;
  gender?: string;
  apiKey?: string;
}

export interface Software {
  id: string;
  name: string;
  description: string;
  version: string;
  format: 'exe' | 'zip' | 'iso';
  iconUrl: string;
  downloadUrl: string;
  updateUrl: string;
  updateCode: string;
  author: string;
  releaseDate: string;
}

export interface ForumPost {
  id: string;
  title: string;
  author: string;
  content: string;
  date: string;
  type: 'blog' | 'tutorial' | 'discussion';
  likes: number;
  commentsCount: number;
  likedBy: string[];
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface SearchResult {
  title: string;
  snippet: string;
  link: string;
  source: string;
}
