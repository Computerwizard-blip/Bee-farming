/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { 
  ShoppingBag, ShieldAlert, Sparkles, HelpCircle, Bot, X,
  ExternalLink, Layers, Award, FileText, ChevronRight, MessageSquare,
  Globe, Home
} from "lucide-react";
import { Hive, Inspection, Harvest, Product, Order, Expense, BlogPost } from "./types";
import { 
  initialHives, initialInspections, initialHarvests, 
  initialProducts, initialOrders, initialExpenses, initialBlogPosts
} from "./mockData";
import { FarmerPortal } from "./components/FarmerPortal";
import { StorefrontPortal } from "./components/StorefrontPortal";
import { HiveAssistant } from "./components/HiveAssistant";
import { LandingPage } from "./components/LandingPage";
import { BlogPortal } from "./components/BlogPortal";

export default function App() {
  // Main Navigation router state
  const [viewMode, setViewMode] = useState<'landing' | 'visitor' | 'farmer' | 'blog'>('landing');
  
  // Enterprise language toggle state (En / Swahili)
  const [lang, setLang] = useState<'EN' | 'SW'>('EN');

  // Offline/Online simulation state
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'syncing'>('synced');

  // Persistent Local States
  const [hives, setHives] = useState<Hive[]>(() => {
    const saved = localStorage.getItem("beehive_hives");
    return saved ? JSON.parse(saved) : initialHives;
  });

  const [inspections, setInspections] = useState<Inspection[]>(() => {
    const saved = localStorage.getItem("beehive_inspections");
    return saved ? JSON.parse(saved) : initialInspections;
  });

  const [harvests, setHarvests] = useState<Harvest[]>(() => {
    const saved = localStorage.getItem("beehive_harvests");
    return saved ? JSON.parse(saved) : initialHarvests;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem("beehive_expenses");
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("beehive_products");
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem("beehive_orders");
    return saved ? JSON.parse(saved) : initialOrders;
  });

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => {
    const saved = localStorage.getItem("beehive_blogposts");
    return saved ? JSON.parse(saved) : initialBlogPosts;
  });

  // Toggle Barnaby floating companion
  const [showAiAssistant, setShowAiAssistant] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem("beehive_hives", JSON.stringify(hives));
  }, [hives]);

  useEffect(() => {
    localStorage.setItem("beehive_inspections", JSON.stringify(inspections));
  }, [inspections]);

  useEffect(() => {
    localStorage.setItem("beehive_harvests", JSON.stringify(harvests));
  }, [harvests]);

  useEffect(() => {
    localStorage.setItem("beehive_expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("beehive_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("beehive_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("beehive_blogposts", JSON.stringify(blogPosts));
  }, [blogPosts]);

  // Actions
  const handleAddHive = (newHive: Hive) => {
    setHives((prev) => [newHive, ...prev]);
  };

  const handleDeleteHive = (hiveId: string) => {
    setHives((prev) => prev.filter((h) => h.id !== hiveId));
  };

  const handleAddInspection = (newInsp: Inspection) => {
    setInspections((prev) => [newInsp, ...prev]);
    // Also intelligently update the parent hive's health score and status!
    setHives((prevHives) => 
      prevHives.map((h) => 
        h.id === newInsp.hiveId 
          ? { 
              ...h, 
              healthScore: newInsp.healthScore, 
              status: newInsp.status as Hive['status'],
              temp: newInsp.temp,
              humidity: newInsp.humidity
            } 
          : h
      )
    );
  };

  const handleAddHarvest = (newHarvest: Harvest) => {
    setHarvests((prev) => [newHarvest, ...prev]);
    // Slightly decrease hive health or update stock upon harvest for super-realism!
    setProducts((prevProds) => 
      prevProds.map((p) => {
        if (p.id === `prod-${newHarvest.honeyType.toLowerCase()}`) {
          return { ...p, stock: p.stock + Math.round(newHarvest.amountKg * 2.2) }; // convert kg yield to oz retail jars
        }
        return p;
      })
    );
  };

  const handleAddOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    // Deduct stock of items
    setProducts((prevProds) => 
      prevProds.map((p) => {
        const itemOrdered = newOrder.items.find((item) => item.productId === p.id);
        if (itemOrdered) {
          return { ...p, stock: Math.max(0, p.stock - itemOrdered.quantity) };
        }
        return p;
      })
    );
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) => 
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const handleAddExpense = (newExpense: Expense) => {
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const handleAddBlogPost = (newPost: BlogPost) => {
    setBlogPosts((prev) => [newPost, ...prev]);
  };

  const handleUpdateBlogPost = (updatedPost: BlogPost) => {
    setBlogPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    );
  };

  const handleDeleteBlogPost = (postId: string) => {
    setBlogPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleAddBlogComment = (postId: string, comment: any) => {
    setBlogPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, comments: [...p.comments, comment] }
          : p
      )
    );
  };

  const handleLikeBlogPost = (postId: string) => {
    setBlogPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p))
    );
  };

  const handleSyncData = () => {
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('synced');
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-[#FCFBF7] text-[#2D2D2D] selection:bg-[#F4B400] selection:text-black flex flex-col justify-between font-sans">
      {/* Top Compact Professional Apiary Header */}
      <header className="sticky top-0 bg-[#1A4D2E] text-white border-b-2 border-[#F4B400] z-40 px-3 md:px-6 py-2 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4">
          
          {/* Logo & farm branding */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#F4B400] flex items-center justify-center text-black rounded-lg border border-[#1A4D2E] shadow-sm shrink-0">
              <span className="font-display font-black text-[10px]">HG</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-display font-black text-[#F4B400] tracking-tight text-sm uppercase">
                  HiveGlobal
                </h1>
                <span className="text-[8px] bg-[#FF8C00] text-white px-1 py-0.2 rounded font-mono font-bold">PRO</span>
              </div>
              <p className="hidden sm:block text-[9px] font-sans tracking-wide text-amber-100/90 leading-none">
                {lang === 'EN' ? "Local Hives. Global Sales." : "Mizinga ya Kienyeji. Mauzo ya Kimataifa."}
              </p>
            </div>
          </div>

          {/* Sync status & Language indicators */}
          <div className="flex items-center gap-2 flex-wrap justify-center text-[9px]">
            {/* Work Offline, Sync Indicator */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 border border-[#F4B400]/20 rounded font-mono text-[9px] uppercase">
              <span className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'synced' ? 'bg-emerald-400 animate-pulse' : syncStatus === 'syncing' ? 'bg-[#FF8C00] animate-spin' : 'bg-red-400'}`} />
              <span className="text-stone-300 text-[8px]">{syncStatus === 'synced' ? 'Offline' : syncStatus === 'syncing' ? 'Sync...' : 'Pending'}</span>
              <button 
                onClick={handleSyncData}
                disabled={syncStatus === 'syncing'}
                className="ml-1 px-1 bg-[#F4B400] text-black font-extrabold uppercase text-[7px] rounded hover:bg-white disabled:opacity-50"
              >
                {syncStatus === 'syncing' ? '...' : 'Sync'}
              </button>
            </div>

            {/* Language Switcher */}
            <div className="flex bg-white/5 border border-[#F4B400]/15 p-0.5 rounded">
              <button 
                onClick={() => setLang('EN')}
                className={`px-1.5 py-0.2 font-mono font-bold rounded transition text-[8px] ${lang === 'EN' ? 'bg-[#F4B400] text-black' : 'text-stone-300 hover:text-white'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLang('SW')}
                className={`px-1.5 py-0.2 font-mono font-bold rounded transition text-[8px] ${lang === 'SW' ? 'bg-[#F4B400] text-black' : 'text-stone-300 hover:text-white'}`}
              >
                SW
              </button>
            </div>
          </div>

          {/* View Mode selection slider toggles (4 tabs: Home Pitch, Marketplace, Farmer App, Blog) - Ultra Compact */}
          <div className="bg-black/25 p-0.5 border border-white/10 flex items-center gap-0.5 font-sans rounded-lg">
            <button
              onClick={() => setViewMode('landing')}
              className={`px-2 md:px-3 py-1 text-[10px] font-bold uppercase tracking-tight transition duration-150 flex items-center gap-1 cursor-pointer rounded-md ${
                viewMode === 'landing' 
                  ? "bg-[#F4B400] text-black font-extrabold shadow-sm" 
                  : "text-stone-300 hover:text-white"
              }`}
            >
              <Home className="w-3 h-3" />
              <span>{lang === 'EN' ? 'Pitch' : 'Mwanzo'}</span>
            </button>
            <button
              onClick={() => setViewMode('visitor')}
              className={`px-2 md:px-3 py-1 text-[10px] font-bold uppercase tracking-tight transition duration-150 flex items-center gap-1 cursor-pointer rounded-md ${
                viewMode === 'visitor' 
                  ? "bg-[#F4B400] text-black font-extrabold shadow-sm" 
                  : "text-stone-300 hover:text-white"
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>{lang === 'EN' ? 'Buyer' : 'Duka'}</span>
            </button>
            <button
              onClick={() => setViewMode('farmer')}
              className={`px-2 md:px-3 py-1 text-[10px] font-bold uppercase tracking-tight transition duration-150 flex items-center gap-1 cursor-pointer rounded-md ${
                viewMode === 'farmer' 
                  ? "bg-[#F4B400] text-black font-extrabold shadow-sm" 
                  : "text-stone-300 hover:text-white"
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>{lang === 'EN' ? 'Farmer' : 'Jopo'}</span>
            </button>
            <button
              onClick={() => setViewMode('blog')}
              className={`px-2 md:px-3 py-1 text-[10px] font-bold uppercase tracking-tight transition duration-150 flex items-center gap-1 cursor-pointer rounded-md ${
                viewMode === 'blog' 
                  ? "bg-[#F4B400] text-black font-extrabold shadow-sm" 
                  : "text-stone-300 hover:text-white"
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>{lang === 'EN' ? 'Blog' : 'Blogu'}</span>
            </button>
          </div>

          {/* AI Helper Assistant Button */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setShowAiAssistant(!showAiAssistant)}
              className={`px-2 py-1 border text-[10px] font-extrabold uppercase tracking-tight flex items-center gap-1 cursor-pointer rounded-md transition duration-150 ${
                showAiAssistant
                  ? "bg-[#FF8C00] border-[#FF8C00] text-black"
                  : "bg-transparent border-white/10 text-white hover:text-black hover:bg-[#F4B400] hover:border-[#F4B400]"
              }`}
            >
              <Bot className="w-3 h-3" />
              <span>AI</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main page Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
        
        {/* Core dynamic content router */}
        {viewMode === 'landing' ? (
          <LandingPage 
            products={products}
            onStartTrial={() => setViewMode('farmer')}
            onBrowseMarketplace={() => setViewMode('visitor')}
            lang={lang}
            onExploreBlog={() => setViewMode('blog')}
          />
        ) : viewMode === 'visitor' ? (
          <StorefrontPortal 
            products={products} 
            onAddOrder={handleAddOrder}
            orders={orders}
            lang={lang}
            blogPosts={blogPosts}
            onAddComment={handleAddBlogComment}
            onLikePost={handleLikeBlogPost}
          />
        ) : viewMode === 'farmer' ? (
          <FarmerPortal 
            hives={hives}
            onAddHive={handleAddHive}
            onDeleteHive={handleDeleteHive}
            inspections={inspections}
            onAddInspection={handleAddInspection}
            harvests={harvests}
            onAddHarvest={handleAddHarvest}
            expenses={expenses}
            onAddExpense={handleAddExpense}
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            lang={lang}
            blogPosts={blogPosts}
            onAddBlogPost={handleAddBlogPost}
            onUpdateBlogPost={handleUpdateBlogPost}
            onDeleteBlogPost={handleDeleteBlogPost}
            onAddComment={handleAddBlogComment}
            onLikePost={handleLikeBlogPost}
          />
        ) : (
          <BlogPortal
            posts={blogPosts}
            onAddPost={handleAddBlogPost}
            onUpdatePost={handleUpdateBlogPost}
            onDeletePost={handleDeleteBlogPost}
            lang={lang}
          />
        )}
      </main>

      {/* Persistent floating AI helper panel (Barnaby chat drawer) */}
      {showAiAssistant && (
        <div className="fixed bottom-6 right-6 w-[360px] md:w-[420px] max-w-full z-50 animate-in fade-in slide-in-from-bottom-6 duration-200">
          <div className="relative shadow-2xl bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setShowAiAssistant(false)}
              className="absolute top-3.5 right-4 text-[#2D2D2D] hover:text-[#1A4D2E] transition z-15 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <HiveAssistant />
          </div>
        </div>
      )}

      {/* If AI helper is closed, present a elegant button to reopen instantly */}
      {!showAiAssistant && (
        <button
          onClick={() => setShowAiAssistant(true)}
          className="fixed bottom-6 right-6 p-4 bg-[#1A4D2E] hover:bg-[#F4B400] text-white hover:text-black rounded-full shadow-lg hover:shadow-xl transition-all duration-150 z-40 flex items-center gap-2 group cursor-pointer border-2 border-[#F4B400]"
          title="Open Barnaby AI helper"
        >
          <Bot className="w-5 h-5 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider pr-1">Barnaby AI</span>
        </button>
      )}

      {/* Beautiful Ivory/Earthy Footer with honeycomb divider decoration */}
      <footer className="bg-white border-t border-[#1A4D2E]/10 py-8 px-4 md:px-8 mt-12 text-center text-xs text-gray-500 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left space-y-1 max-w-lg">
            <div className="flex items-center gap-1.5 font-display font-black text-gray-800 text-sm">
              <span>🐝</span>
              <span>HIVEGLOBAL</span>
            </div>
            <p className="text-[11px] text-gray-400">
              © 2026 HiveGlobal Agrarian Technologies Enterprise. All rights reserved. M-Pesa API, DHL logistics integrations, and KEBS standard approvals registered under active cooperative licenses.
            </p>
          </div>
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex gap-2 items-center text-[10px] bg-amber-50 px-2 py-1 rounded text-[#1A4D2E] border border-amber-200">
              <span>💳 Supported: M-Pesa, Visa, Mastercard</span>
            </div>
            <a href="https://ai.studio" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1 text-[11px] font-bold text-[#1A4D2E]">
              <span>AI Studio Cloud Deploy</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
