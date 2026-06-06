import React, { useState } from "react";
import { 
  FileText, BookOpen, MessageSquare, Plus, Edit3, Trash2, Check,
  Eye, ThumbsUp, Calendar, User, Heart, ChevronLeft,
  Search, BookOpenCheck, Settings, ArrowLeft, Send, Sparkles, Filter
} from "lucide-react";
import { BlogPost, BlogComment } from "../types";

export interface BlogPortalProps {
  posts: BlogPost[];
  onAddPost: (newPost: BlogPost) => void;
  onUpdatePost: (updatedPost: BlogPost) => void;
  onDeletePost: (postId: string) => void;
  lang?: 'EN' | 'SW';
}

export function BlogPortal({ 
  posts, 
  onAddPost, 
  onUpdatePost, 
  onDeletePost, 
  lang = 'EN' 
}: BlogPortalProps) {
  // Navigation role: reader vs farmer
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  
  // Filtering & searching
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Beekeeping' | 'Honey Harvests' | 'Bee Health'>('All');
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Detailed view of a post
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Comment input state
  const [commentName, setCommentName] = useState<string>("");
  const [commentText, setCommentText] = useState<string>("");

  // Create & Edit form state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null); // null means creating standard new post
  
  // New/Edit post fields
  const [formTitle, setFormTitle] = useState<string>("");
  const [formCategory, setFormCategory] = useState<'Beekeeping' | 'Honey Harvests' | 'Bee Health'>("Beekeeping");
  const [formContent, setFormContent] = useState<string>("");
  const [formAuthor, setFormAuthor] = useState<string>("");
  const [formStatus, setFormStatus] = useState<'Draft' | 'Published'>("Published");
  const [formImageUrl, setFormImageUrl] = useState<string>("");

  const t = (en: string, sw: string) => {
    return lang === 'SW' ? sw : en;
  };

  // Helper categorized images/colors
  const getCategoryDetails = (category: BlogPost['category']) => {
    switch (category) {
      case 'Beekeeping':
        return {
          icon: '🐝',
          colorBg: 'bg-amber-50 border-amber-200 text-amber-900',
          darkColor: 'text-amber-800',
          gradientHex: 'from-amber-400 to-amber-600',
          desc: t('Essential husbandry, tools and queen advice.', 'Ufugaji, vifaa na ushauri wa kitaalamu wa malkia.')
        };
      case 'Honey Harvests':
        return {
          icon: '🍯',
          colorBg: 'bg-yellow-50 border-yellow-250 text-amber-900',
          darkColor: 'text-yellow-800',
          gradientHex: 'from-[#F4B400] to-[#FF8C00]',
          desc: t('Timing nectar flow, spinning & quality metrics.', 'Kutabiri msimu, uvunaji na vipimo vya ubora wa asali.')
        };
      case 'Bee Health':
        return {
          icon: '🩺',
          colorBg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
          darkColor: 'text-emerald-800',
          gradientHex: 'from-emerald-500 to-emerald-700',
          desc: t('Monitoring mites, diseases & climate resilience.', 'Kukabili wadudu, magonjwa na kuimarisha uvumilivu wa nyuki.')
        };
    }
  };

  // Filtered posts logic
  const getFilteredPosts = () => {
    return posts.filter(post => {
      // If we are in user reader view, hide drafts!
      const matchesStatus = isAdminMode ? true : post.status === 'Published';
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      const matchesSearch = searchQuery.trim() === "" || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesStatus && matchesCategory && matchesSearch;
    });
  };

  const handlePostLike = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const updated: BlogPost = {
      ...post,
      likes: post.likes + 1
    };
    onUpdatePost(updated);
  };

  const handleAddComment = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const newComment: BlogComment = {
      id: `comm-${Date.now()}`,
      authorName: commentName.trim() || t("Anonymous Bee Enthusiast", "Wapenzi wa Nyuki"),
      text: commentText.trim(),
      date: new Date().toISOString().split('T')[0]
    };

    const updated: BlogPost = {
      ...post,
      comments: [...post.comments, newComment]
    };

    onUpdatePost(updated);
    setCommentName("");
    setCommentText("");
  };

  const handleOpenCreateForm = () => {
    setEditingPost(null);
    setFormTitle("");
    setFormCategory("Beekeeping");
    setFormContent("");
    setFormAuthor(t("Lead Apiary Officer", "Mtaalamu Kiongozi wa Mizinga"));
    setFormStatus("Published");
    setFormImageUrl("");
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (post: BlogPost) => {
    setEditingPost(post);
    setFormTitle(post.title);
    setFormCategory(post.category);
    setFormContent(post.content);
    setFormAuthor(post.author);
    setFormStatus(post.status);
    setFormImageUrl(post.imageUrl || "");
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    const postData: BlogPost = {
      id: editingPost ? editingPost.id : `blog-${Date.now()}`,
      title: formTitle.trim(),
      content: formContent.trim(),
      category: formCategory,
      author: formAuthor.trim() || t("Apiary Manager", "Meneja wa Apiari"),
      status: formStatus,
      imageUrl: formImageUrl.trim() || undefined,
      likes: editingPost ? editingPost.likes : 0,
      comments: editingPost ? editingPost.comments : [],
      createdAt: editingPost ? editingPost.createdAt : new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      publishedAt: formStatus === 'Published' 
        ? (editingPost?.publishedAt || new Date().toISOString().split('T')[0])
        : null
    };

    if (editingPost) {
      onUpdatePost(postData);
    } else {
      onAddPost(postData);
    }

    setIsFormOpen(false);
    setEditingPost(null);
  };

  const handleTogglePublish = (post: BlogPost) => {
    const isNewPublished = post.status === 'Published' ? 'Draft' : 'Published';
    const updated: BlogPost = {
      ...post,
      status: isNewPublished,
      publishedAt: isNewPublished === 'Published' ? new Date().toISOString().split('T')[0] : null,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    onUpdatePost(updated);
  };

  const selectedPost = posts.find(p => p.id === selectedPostId);

  return (
    <div className="space-y-6">
      
      {/* Blog Control Header Panel */}
      <div className="bg-white border-2 border-amber-100 rounded-3xl p-5 md:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-bounce">📖</span>
            <h2 className="text-xl font-display font-black text-gray-900 uppercase tracking-tight">
              {t("HiveGlobal Knowledge Base", "Mkusanyiko wa Makala ya Nyuki")}
            </h2>
          </div>
          <p className="text-xs text-gray-500 max-w-xl">
            {t(
              "Learn scientific hive methodologies, honey harvest techniques, and parasite solutions curated by lead experts and rural agrarian champions.",
              "Jifunze teknolojia ya mizinga, uvunaji borabora wa asali na kuzuia wadudu viharibifu vya mizinga yetu."
            )}
          </p>
        </div>

        {/* Dynamic Dual Role Toggler */}
        <div className="flex items-center gap-2 bg-amber-50 p-1.5 rounded-2xl border border-amber-200/50 self-stretch md:self-auto justify-between md:justify-start">
          <span className="text-[10px] font-bold text-amber-900 uppercase font-mono tracking-wider px-2">
            {t("View Role:", "Hali ya Jopo:")}
          </span>
          <div className="flex gap-1 bg-white p-0.5 rounded-xl shadow-3xs border border-amber-100">
            <button 
              onClick={() => {
                setIsAdminMode(false);
                if (isFormOpen) setIsFormOpen(false);
              }}
              className={`px-3 py-1 text-[10px] font-extrabold rounded-lg transition duration-150 flex items-center gap-1 cursor-pointer ${!isAdminMode ? 'bg-[#1A4D2E] text-white' : 'text-gray-500 hover:text-black'}`}
            >
              <User className="w-3 h-3" />
              <span>{t("Visitor / Reader", "Mtembeleaji")}</span>
            </button>
            <button 
              onClick={() => setIsAdminMode(true)}
              className={`px-3 py-1 text-[10px] font-extrabold rounded-lg transition duration-150 flex items-center gap-1 cursor-pointer ${isAdminMode ? 'bg-[#F4B400] text-black' : 'text-gray-500 hover:text-black'}`}
            >
              <Settings className="w-3 h-3" />
              <span>{t("Farmer / Author", "Mkulima")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* RENDER POST FORM MODAL OR FULL EDITOR CONTENT */}
      {isFormOpen && isAdminMode ? (
        <div className="bg-white border border-amber-200 rounded-3xl p-5 md:p-8 shadow-xs animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-gray-150 mb-6">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 bg-amber-100 rounded-lg text-amber-950 font-bold text-xs uppercase font-mono">
                {editingPost ? t("EDIT", "HARIRI") : t("NEW", "MPYA")}
              </span>
              <h3 className="font-bold text-gray-900 text-base">
                {editingPost ? t("Edit Blog Post", "Hariri Makala ya Blogu") : t("Compose Beekeeping Article", "Andika Makala Mpya ya Nyuki")}
              </h3>
            </div>
            <button 
              onClick={() => {
                setIsFormOpen(false);
                setEditingPost(null);
              }}
              className="px-3 py-1 border border-gray-200 text-[10px] uppercase font-bold rounded-lg text-gray-500 hover:text-gray-950"
            >
              {t("Cancel", "Shairi")}
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                  {t("Article Title *", "Kichwa cha Habari *")}
                </label>
                <input 
                  type="text" 
                  required
                  placeholder={t("e.g., Comb Care During Swarm Ingress", "Mfano: Uhifadhi wa Masega Wakati wa Nguli")}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-[#FCFBF7] border border-amber-100 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-[#F4B400]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                  {t("Category *", "Kundi la Makala *")}
                </label>
                <select 
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as BlogPost['category'])}
                  className="w-full bg-[#FCFBF7] border border-amber-100 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-[#F4B400]"
                >
                  <option value="Beekeeping">{t("Beekeeping Methods", "Ufugaji na Utunzaji")}</option>
                  <option value="Honey Harvests">{t("Honey Harvests & Quality", "Mavuno na Ubora")}</option>
                  <option value="Bee Health">{t("Bee Health & Predators", "Afya ya Nyuki na Vihasiri")}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                  {t("Author Name *", "Mwandishi mkuu *")}
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Josephat Kamau"
                  value={formAuthor}
                  onChange={(e) => setFormAuthor(e.target.value)}
                  className="w-full bg-[#FCFBF7] border border-amber-100 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-[#F4B400]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                  {t("Visual Key Icon / Cover (Optional emoji/char)", "Faharasa Picha ya Jalada")}
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. 🍯, 🐝, 🔬, 🌸"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full bg-[#FCFBF7] border border-amber-100 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-[#F4B400]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                  {t("Publishing Policy", "Msimamo Kamili wa Makala")}
                </label>
                <div className="flex gap-2 p-1 bg-gray-50 border border-gray-150 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFormStatus('Published')}
                    className={`flex-1 py-1 text-[10px] font-bold rounded-lg uppercase ${formStatus === 'Published' ? 'bg-[#1A4D2E] text-white shadow-3xs' : 'text-gray-500 hover:text-black'}`}
                  >
                    {t("Publish Immediately", "Chapisha sasa")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStatus('Draft')}
                    className={`flex-1 py-1 text-[10px] font-bold rounded-lg uppercase ${formStatus === 'Draft' ? 'bg-amber-100 text-amber-950 shadow-3xs' : 'text-gray-500 hover:text-black'}`}
                  >
                    {t("Save as Draft", "Mswada")}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono flex justify-between">
                <span>{t("Article Body Content (English & Swahili bilingual blocks recommended) *", "Kiini cha Habari na Mafunzo *")}</span>
                <span className="text-gray-400 text-[9px] lowercase">{formContent.length} chars</span>
              </label>
              <textarea 
                required
                rows={9}
                placeholder={t(
                  "Explain dynamic practical concepts. Be detailed and technical!\n\ne.g.,\nTo deter ants, build a water ditch moat around the stand poles...\n\nKwa kuzuia siafu, tengeneza mfereji wenye maji kuzunguka nguzo...",
                  "Andika maelekezo yako hapa kwa ufasaha zaidi..."
                )}
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                className="w-full bg-[#FCFBF7] border border-amber-100 rounded-xl p-3 text-xs text-gray-900 font-sans focus:outline-[#F4B400] leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#1A4D2E] hover:bg-[#F4B400] text-white hover:text-black font-extrabold rounded-2xl text-xs uppercase duration-150 shadow-xs border-2 border-transparent hover:border-[#1A4D2E] flex items-center justify-center gap-2"
            >
              <BookOpenCheck className="w-4 h-4" />
              <span>
                {editingPost 
                  ? t("Commit and Apply Updates", "Hifadhi Maandishi Yote") 
                  : t("Publish Official Article & Broadcast", "Chapisha na Tangaza Makala")}
              </span>
            </button>
          </form>
        </div>
      ) : null}

      {/* MAIN LAYOUT: POST DETAIL SPLIT VIEW OR FILTERABLE GRID */}
      {selectedPost ? (
        // DETAIL READ SCREEN
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-250">
          
          {/* Post Article Body (8 cols on lg) */}
          <div className="lg:col-span-8 bg-white border border-amber-100 rounded-3xl p-5 md:p-8 shadow-xs space-y-6">
            
            {/* Navigation back and header metadata */}
            <div className="flex items-center justify-between pb-3 border-b border-amber-50">
              <button 
                onClick={() => setSelectedPostId(null)}
                className="flex items-center gap-1 text-xs text-[#1A4D2E] hover:text-[#FF8C00] font-extrabold group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>{t("Back to Gazette Feed", "Rudi Kwenye Mkusanyiko")}</span>
              </button>

              <div className="flex items-center gap-1">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getCategoryDetails(selectedPost.category).colorBg}`}>
                  {getCategoryDetails(selectedPost.category).icon} {t(selectedPost.category, selectedPost.category)}
                </span>
                
                {selectedPost.status === 'Draft' && (
                  <span className="bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded-lg text-[9px] font-extrabold uppercase font-mono">
                    {t("Draft", "Mswada")}
                  </span>
                )}
              </div>
            </div>

            {/* Author box / Title summary */}
            <div className="space-y-3">
              <h1 className="text-xl md:text-3xl font-display font-black text-gray-900 tracking-tight leading-tight">
                {selectedPost.title}
              </h1>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-gray-400 font-medium">
                <div className="flex items-center gap-1.5 red-mono">
                  <User className="w-3.5 h-3.5 text-[#1A4D2E]" />
                  <span className="text-gray-700 font-bold">{selectedPost.author}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {selectedPost.publishedAt 
                      ? `${t("Published", "Ilichapishwa")} ${selectedPost.publishedAt}` 
                      : `${t("Created Draft", "Mswada Ulirekodiwa")} ${selectedPost.createdAt}`}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Likes:</span>
                  <span className="font-bold text-gray-800">{selectedPost.likes} 👍</span>
                </div>
              </div>
            </div>

            {/* Large Cover Illustration placeholder */}
            <div className="w-full bg-gradient-to-br from-amber-50 to-orange-50/30 border border-amber-100 rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-3xs min-h-[160px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_75%,rgba(244,180,0,0.08),transparent_50%)] pointer-events-none" />
              <div className="text-5xl md:text-6xl mb-3 animate-pulse">{selectedPost.imageUrl || getCategoryDetails(selectedPost.category).icon}</div>
              <p className="text-[10px] font-black tracking-widest text-[#1A4D2E]/40 uppercase font-mono leading-none">
                {t("HIVGLOBAL EDUCATIONAL PRESS", "CHAPA YA MAFUNZO YA HIVEGLOBAL")}
              </p>
              <span className="text-[9px] text-[#FF8C00] font-bold mt-1 max-w-sm">
                {getCategoryDetails(selectedPost.category).desc}
              </span>
            </div>

            {/* Content paragraph blocks */}
            <div className="text-gray-800 text-sm md:text-base leading-relaxed whitespace-pre-line font-sans space-y-4">
              {selectedPost.content}
            </div>

            {/* Dynamic interaction panel (Likes + share prompt) */}
            <div className="pt-4 border-t border-amber-50 flex items-center justify-between flex-wrap gap-4">
              <button 
                onClick={() => handlePostLike(selectedPost.id)}
                className="px-4 py-2 bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 font-extrabold text-xs rounded-full transition flex items-center gap-2 group cursor-pointer"
              >
                <Heart className="w-4 h-4 text-pink-500 fill-pink-500 transition-transform group-hover:scale-125" />
                <span>{t("Appreciate Article", "Sifu Makala")} ({selectedPost.likes})</span>
              </button>

              <div className="text-[10px] text-gray-400 font-mono font-bold uppercase">
                {t("Verified Educational Content", "Yaliyomo Yamethibitishwa")}
              </div>
            </div>

          </div>

          {/* Comments & Sidebar Discussion Panel (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Panel: Comments Column */}
            <div className="bg-white border border-amber-100 rounded-3xl p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-gray-950 text-sm flex items-center gap-2 pb-2 border-b border-amber-50">
                <MessageSquare className="w-4 h-4 text-[#F4B400]" />
                <span>Discussion ({selectedPost.comments.length})</span>
              </h3>

              {/* Comments List Container */}
              <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                {selectedPost.comments.length === 0 ? (
                  <div className="py-6 text-center text-xs text-gray-400 italic">
                    {t(
                      "No comments yet. Be the first to share your apiary feedback!",
                      "Hakuna maoni bado. Kuwa wa kwanza kutoa maoni yako hapa!"
                    )}
                  </div>
                ) : (
                  selectedPost.comments.map(comment => (
                    <div key={comment.id} className="bg-amber-50/30 border border-amber-100/50 p-3 rounded-2xl space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-gray-800">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          {comment.authorName}
                        </span>
                        <span className="text-gray-400 font-mono">{comment.date}</span>
                      </div>
                      <p className="text-xs text-gray-600 font-sans leading-relaxed">
                        {comment.text}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Comment submission form */}
              <form onSubmit={(e) => handleAddComment(e, selectedPost.id)} className="space-y-2 pt-2 border-t border-amber-50">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                  {t("Add Public Comment", "Weka Maoni Yako")}
                </h4>
                
                <div className="space-y-2">
                  <input 
                    type="text"
                    placeholder={t("Your Name...", "Jina lako...")}
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    className="w-full bg-[#FCFBF7] border border-amber-100 rounded-xl px-2 py-1.5 text-xs text-gray-900 focus:outline-[#F4B400]"
                  />
                  <textarea 
                    required
                    rows={3}
                    placeholder={t("Constructive feedback or question...", "Uliza swali au weka mrejesho wako hapa...")}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full bg-[#FCFBF7] border border-amber-100 rounded-xl p-2 text-xs text-gray-900 focus:outline-[#F4B400] leading-normal"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-[#1A4D2E] hover:bg-[#F4B400] text-white hover:text-black font-bold rounded-xl text-[11px] uppercase transition duration-150 flex items-center justify-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>{t("Post Comment", "Tuma Maoni")}</span>
                </button>
              </form>
            </div>

            {/* Smart Side Suggestions card */}
            <div className="bg-[#1A4D2E] text-white rounded-3xl p-5 border border-amber-250/20 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-xs text-black">🎓</span>
                <h4 className="font-bold text-xs uppercase font-mono tracking-wider text-amber-300">
                  {t("Related Harvesting Guideline", "Miondoko ya Uzalishaji")}
                </h4>
              </div>
              <p className="text-[11px] text-amber-50 leading-relaxed font-sans">
                {t(
                  "All high-yield honey parameters recorded here can be cataloged inside HiveGlobal. Go to Farmer Portal tab to log real yields for automatic KEBS grading profiles.",
                  "Mavuno yote yakirekodiwa kwenye jopo la mkulima yanaelekezwa moja kwa moja kufikia viwango vya KEBS Grade A."
                )}
              </p>
              <button 
                onClick={() => setSelectedPostId(null)}
                className="w-full py-1.5 bg-[#FF8C00] hover:bg-[#F4B400] text-black font-extrabold rounded-xl text-[10px] uppercase transition"
              >
                {t("Explore Other Topics", "Tazama Makala Nyingine")}
              </button>
            </div>

          </div>

        </div>
      ) : (
        // LIST & GRID BLOG SCREEN
        <div className="space-y-6">
          
          {/* Categories and Search Filter Panel */}
          <div className="bg-white border border-amber-100 rounded-3xl p-4 shadow-3xs flex flex-col lg:flex-row items-center justify-between gap-4">
            
            {/* Category tabs */}
            <div className="flex items-center gap-1 px-1 py-1 bg-amber-5 p-1 rounded-2xl border border-amber-100 w-full lg:w-auto overflow-x-auto">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-3 py-1.5 text-[10.5px] font-extrabold tracking-tight rounded-xl shrink-0 transition ${selectedCategory === 'All' ? 'bg-[#1A4D2E] text-white shadow-3xs' : 'text-gray-500 hover:text-black'}`}
              >
                🌐 {t("All Articles", "Zote")} ({posts.filter(p => !isAdminMode ? p.status === 'Published' : true).length})
              </button>
              
              <button
                onClick={() => setSelectedCategory('Beekeeping')}
                className={`px-3 py-1.5 text-[10.5px] font-extrabold tracking-tight rounded-xl shrink-0 transition ${selectedCategory === 'Beekeeping' ? 'bg-[#1A4D2E] text-white shadow-3xs' : 'text-gray-500 hover:text-black'}`}
              >
                🐝 {t("Beekeeping", "Utunzaji")}
              </button>

              <button
                onClick={() => setSelectedCategory('Honey Harvests')}
                className={`px-3 py-1.5 text-[10.5px] font-extrabold tracking-tight rounded-xl shrink-0 transition ${selectedCategory === 'Honey Harvests' ? 'bg-[#1A4D2E] text-white shadow-3xs' : 'text-gray-500 hover:text-black'}`}
              >
                🍯 {t("Honey Harvests", "Uvunaji Asali")}
              </button>

              <button
                onClick={() => setSelectedCategory('Bee Health')}
                className={`px-3 py-1.5 text-[10.5px] font-extrabold tracking-tight rounded-xl shrink-0 transition ${selectedCategory === 'Bee Health' ? 'bg-[#1A4D2E] text-white shadow-3xs' : 'text-gray-500 hover:text-black'}`}
              >
                🩺 {t("Bee Health", "Afya ya Nyuki")}
              </button>
            </div>

            {/* Right side Search bar and New Post Button for admin */}
            <div className="flex items-center gap-2 w-full lg:w-auto self-stretch md:self-auto">
              <div className="relative flex-1 lg:w-60">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                <input 
                  type="text"
                  placeholder={t("Search articles...", "Tafuta makala...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#FCFBF7] border border-amber-100 rounded-2xl pl-9 pr-3 py-2 text-xs focus:outline-[#F4B400]"
                />
              </div>

              {isAdminMode && (
                <button
                  onClick={handleOpenCreateForm}
                  className="px-4 py-2 bg-[#F4B400] hover:bg-[#1A4D2E] text-black hover:text-white font-extrabold rounded-2xl text-xs uppercase duration-150 flex items-center gap-1 shrink-0 shadow-3xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t("Compose", "Andika")}</span>
                </button>
              )}
            </div>

          </div>

          {/* BLOG POSTS RESPONSIVE GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredPosts().length === 0 ? (
              <div className="col-span-full bg-white border border-dashed border-amber-200 rounded-3xl p-12 text-center text-gray-400 space-y-2">
                <div className="text-4xl">📭</div>
                <h4 className="font-bold text-gray-700 text-sm">{t("No Articles Found", "Hakuna Makala Kupatikana")}</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  {t(
                    "Try revising your search prompt or choose and toggle another category filter.",
                    "Jaribu kubadilisha maneno ya utafutaji au kubadili masuala mengine hapa."
                  )}
                </p>
                {isAdminMode && (
                  <button 
                    onClick={handleOpenCreateForm}
                    className="mt-2 text-xs bg-[#1A4D2E] text-white px-3 py-1.5 rounded-xl font-bold hover:bg-[#F4B400] hover:text-black"
                  >
                    {t("Create One Now", "Anza Kunadika Makala ya Kwanza")}
                  </button>
                )}
              </div>
            ) : (
              getFilteredPosts().map(post => {
                const catInfo = getCategoryDetails(post.category);
                return (
                  <div 
                    key={post.id}
                    className="bg-white border border-amber-100 rounded-3xl shadow-3xs overflow-hidden flex flex-col justify-between hover:shadow-xs transition duration-200 group relative"
                  >
                    
                    {/* Cover Art Box with specific category gradient */}
                    <div className="h-32 bg-gradient-to-br from-[#FCFBF7] to-amber-50 p-4 relative flex items-center justify-center border-b border-amber-50 overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(244,180,0,0.06),transparent_60%)] pointer-events-none" />
                      <span className="text-4xl transition-transform duration-300 group-hover:scale-125 select-none z-10">
                        {post.imageUrl || catInfo.icon}
                      </span>
                      
                      {/* Top Absolute tags */}
                      <div className="absolute top-3 left-3 flex gap-1 z-20">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide border bg-white ${catInfo.colorBg}`}>
                          {t(post.category, post.category)}
                        </span>
                      </div>

                      {/* Draft or published status (Visible in Admin Mode) */}
                      {isAdminMode && (
                        <div className="absolute top-3 right-3 z-20">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase ${post.status === 'Published' ? 'bg-emerald-100 text-emerald-950 border border-emerald-200' : 'bg-rose-100 text-rose-950 border border-rose-200'}`}>
                            {t(post.status === 'Published' ? 'Published' : 'Draft', post.status === 'Published' ? 'Ilichapishwa' : 'Mswada')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Blog details block */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold font-mono">
                          <span>{post.publishedAt || post.createdAt}</span>
                          <span>•</span>
                          <span>{post.comments.length} comments</span>
                        </div>

                        <h3 
                          onClick={() => setSelectedPostId(post.id)}
                          className="font-display font-black text-gray-900 group-hover:text-[#1A4D2E] transition-colors leading-tight cursor-pointer line-clamp-2 text-sm uppercase md:text-base"
                        >
                          {post.title}
                        </h3>

                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 font-sans">
                          {post.content}
                        </p>
                      </div>

                      {/* Bottom row actions (Reader vs Admin) */}
                      <div className="pt-3 border-t border-amber-50 flex items-center justify-between gap-2 flex-wrap">
                        
                        <button 
                          onClick={() => setSelectedPostId(post.id)}
                          className="text-xs font-extrabold text-[#1A4D2E] hover:text-[#FF8C00] flex items-center gap-1 cursor-pointer"
                        >
                          <span>{t("Read Article", "Soma Makala")}</span>
                          <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
                        </button>

                        <div className="flex items-center gap-1">
                          
                          {/* Admin actions */}
                          {isAdminMode ? (
                            <>
                              <button
                                onClick={() => handleTogglePublish(post)}
                                title={post.status === 'Published' ? t("Revert to Draft", "Badili kuwa mswada") : t("Publish Post", "Chapisha makala")}
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-amber-100 hover:text-black transition"
                              >
                                {post.status === 'Published' ? <FileText className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => handleOpenEditForm(post)}
                                title={t("Edit Post", "Hariri")}
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-blue-50 hover:text-blue-700 transition"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(t("Are you sure you want to delete this post?", "Je, una uhakika unataka kufuta makala hii?"))) {
                                    onDeletePost(post.id);
                                  }
                                }}
                                title={t("Delete Post", "Futa")}
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-rose-50 hover:text-rose-700 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={() => handlePostLike(post.id)}
                              className="px-2 py-1 bg-pink-50 border border-pink-100 hover:bg-pink-100 rounded-lg text-[10px] font-bold text-pink-700 flex items-center gap-1 transition-colors"
                            >
                              <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
                              <span>{post.likes}</span>
                            </button>
                          )}

                        </div>

                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>

          {/* Informational Banner Footer */}
          <div className="bg-gradient-to-r from-[#1A4D2E] to-emerald-900 text-white rounded-3xl p-6 shadow-xs border border-amber-250/20 text-center space-y-2">
            <h4 className="font-display font-black text-sm uppercase tracking-wider text-amber-300">
              {t("📣 Have Beekeeping Stories to Share?", "Je, una Maelekezo au Stori ya Kukuza Nyuki?")}
            </h4>
            <p className="text-xs text-amber-50 max-w-xl mx-auto leading-relaxed">
              {t(
                "Knowledge keeps colonies resilient! If you are a certified apiary scientist or high-yield cooperative leader, switch to the Farmer/Author view above to compose an entry.",
                "Ujuzi ndio unaowawezesha wananchi kukabili mabadiliko ya tabianchi na mbegu mpya za nyuki nchini Kenya!"
              )}
            </p>
          </div>

        </div>
      )}

    </div>
  );
}
