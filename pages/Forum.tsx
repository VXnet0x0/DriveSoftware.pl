
import React, { useState, useEffect, useRef } from 'react';
import { ForumPost, User } from '../types';

interface ForumProps {
  user: User | null;
}

const Forum: React.FC<ForumProps> = ({ user }) => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', type: 'discussion' as const });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const savedPosts = localStorage.getItem('dls_forum_posts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      const mockPosts: ForumPost[] = [
        {
          id: '1',
          title: 'Jak używać DLS 1.0 w swoim projekcie?',
          author: 'Karol Kopeć',
          content: 'DriveLoginSystem 1.0 to potężne narzędzie, które pozwala na bezpieczną autoryzację w chmurze DriveSoft. W tym poradniku pokażę jak wygenerować klucz API...',
          date: '2024-11-22',
          type: 'tutorial',
          likes: 45,
          commentsCount: 12,
          likedBy: []
        },
        {
          id: '2',
          title: 'Mój setup developerski 2024',
          author: 'DevUser99',
          content: 'Chciałbym podzielić się moimi narzędziami, których używam do tworzenia aplikacji na system DriveSoft. Podstawą jest oczywiście DriveSoft Studio Pro...',
          date: '2024-11-21',
          type: 'blog',
          likes: 28,
          commentsCount: 5,
          likedBy: []
        }
      ];
      setPosts(mockPosts);
      localStorage.setItem('dls_forum_posts', JSON.stringify(mockPosts));
    }
  }, []);

  // Automatyczne dopasowanie wysokości pola tekstowego podczas pisania
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [newPost.content]);

  const savePosts = (updatedPosts: ForumPost[]) => {
    setPosts(updatedPosts);
    localStorage.setItem('dls_forum_posts', JSON.stringify(updatedPosts));
    
    // Symulacja rejestracji aktywności w User.json (localStorage)
    if (user) {
      const activity = {
        type: 'POST_CREATED',
        userId: user.id,
        timestamp: new Date().toISOString()
      };
      const logs = JSON.parse(localStorage.getItem('dls_user_logs') || '[]');
      localStorage.setItem('dls_user_logs', JSON.stringify([...logs, activity]));
    }
  };

  const handleAddPost = () => {
    if (!user) {
      alert("Musisz być zalogowany przez DriveLoginSystem (DLS 1.0), aby dodać wpis!");
      return;
    }
    if (!newPost.title.trim()) {
      alert("Wpisz tytuł swojego posta.");
      return;
    }
    if (newPost.content.trim().length < 10) {
      alert("Treść wpisu musi mieć co najmniej 10 znaków.");
      return;
    }

    const post: ForumPost = {
      id: Date.now().toString(),
      title: newPost.title,
      author: user.username,
      content: newPost.content,
      date: new Date().toISOString().split('T')[0],
      type: newPost.type,
      likes: 0,
      commentsCount: 0,
      likedBy: []
    };

    savePosts([post, ...posts]);
    setShowModal(false);
    setNewPost({ title: '', content: '', type: 'discussion' });
  };

  const handleLike = (postId: string) => {
    if (!user) {
      alert("Zaloguj się, aby polubić ten wpis!");
      return;
    }

    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const hasLiked = post.likedBy.includes(user.id);
        return {
          ...post,
          likes: hasLiked ? post.likes - 1 : post.likes + 1,
          likedBy: hasLiked 
            ? post.likedBy.filter(id => id !== user.id) 
            : [...post.likedBy, user.id]
        };
      }
      return post;
    });

    savePosts(updatedPosts);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Forum & Blogi</h1>
          <p className="text-gray-500 font-medium">Miejsce wymiany wiedzy i doświadczeń twórców DriveSoft</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 flex items-center justify-center space-x-2"
        >
          <i className="fas fa-edit"></i>
          <span>Napisz nowy wpis</span>
        </button>
      </div>

      <div className="space-y-8">
        {posts.map(post => {
          const isLiked = user ? post.likedBy.includes(user.id) : false;
          
          return (
            <div key={post.id} className="group bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center space-x-3 mb-6">
                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                  post.type === 'tutorial' ? 'bg-green-50 text-green-600 border border-green-100' :
                  post.type === 'blog' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 
                  'bg-gray-50 text-gray-600 border border-gray-100'
                }`}>
                  {post.type}
                </span>
                <span className="text-gray-400 text-xs font-bold uppercase tracking-tight">{post.date}</span>
              </div>
              
              <h2 className="text-3xl font-black text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors leading-tight">
                {post.title}
              </h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed font-medium whitespace-pre-wrap">
                {post.content}
              </p>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-8 border-t border-gray-50 gap-6">
                <div className="flex items-center space-x-3">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${post.author}&background=random`} 
                    className="w-10 h-10 rounded-2xl border-2 border-white shadow-md" 
                    alt={post.author}
                  />
                  <div>
                    <span className="text-sm font-black text-gray-900 block">{post.author}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Użytkownik DriveSoft</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-2 transition-all duration-300 transform active:scale-90 ${
                      isLiked ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      isLiked ? 'bg-rose-50' : 'bg-gray-50'
                    }`}>
                      <i className={`${isLiked ? 'fas' : 'far'} fa-heart text-lg`}></i>
                    </div>
                    <span className="font-black text-sm">{post.likes}</span>
                  </button>
                  
                  <div className="flex items-center space-x-2 text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer group/comment">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover/comment:bg-indigo-50 flex items-center justify-center transition-colors">
                      <i className="far fa-comment-dots text-lg"></i>
                    </div>
                    <span className="font-black text-sm">{post.commentsCount}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl border border-gray-50 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-3xl font-black text-gray-900">Tworzenie wpisu</h3>
                <p className="text-gray-500 font-medium">Twój głos ma znaczenie w społeczności DriveSoft.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-300 hover:text-gray-600 transition">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tytuł</label>
                  <input 
                    type="text" 
                    placeholder="Wpisz przyciągający tytuł..."
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-indigo-100 focus:bg-white transition-all font-bold text-gray-900"
                    value={newPost.title}
                    onChange={e => setNewPost({...newPost, title: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kategoria</label>
                  <select 
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-indigo-100 focus:bg-white transition-all font-bold text-gray-900 appearance-none"
                    value={newPost.type}
                    onChange={e => setNewPost({...newPost, type: e.target.value as any})}
                  >
                    <option value="discussion">💡 Dyskusja</option>
                    <option value="blog">📝 Blog</option>
                    <option value="tutorial">🛠️ Poradnik</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Treść wiadomości</label>
                  <span className={`text-[9px] font-black uppercase ${newPost.content.length > 500 ? 'text-orange-500' : 'text-gray-400'}`}>
                    {newPost.content.length} znaków
                  </span>
                </div>
                <textarea 
                  ref={textareaRef}
                  placeholder="Co masz na myśli? Podziel się kodem, pomysłem lub pytaniem..."
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-indigo-100 focus:bg-white transition-all font-medium text-gray-700 resize-none min-h-[150px] overflow-hidden"
                  value={newPost.content}
                  onChange={e => setNewPost({...newPost, content: e.target.value})}
                ></textarea>
              </div>

              <div className="flex space-x-4 pt-4">
                <button 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-8 py-4 rounded-2xl font-black text-gray-400 hover:bg-gray-50 transition-all uppercase tracking-widest text-xs"
                >
                  Odrzuć zmiany
                </button>
                <button 
                  onClick={handleAddPost}
                  className="flex-2 px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 uppercase tracking-widest text-xs flex items-center justify-center space-x-2"
                >
                  <i className="fas fa-paper-plane"></i>
                  <span>Opublikuj wpis teraz</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forum;
