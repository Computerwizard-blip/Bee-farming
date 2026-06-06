/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, Trash2, Search, Info, Plus, Minus, 
  CheckCircle, ArrowRight, Heart, Award, FileText, Gift,
  BookOpen, Sparkles, Filter, ShieldCheck, Mail, Pin, CreditCard, ChevronRight
} from "lucide-react";
import { Product, Order, OrderItem } from "../types";

export interface BuybackRequest {
  id: string;
  fullName: string;
  phone: string;
  location: string;
  amountKg: number;
  honeyType: string;
  status: 'Pending Review' | 'Collector Dispatched' | 'Inspected & Approved' | 'Paid';
  payoutKes: number;
  date: string;
}

interface StorefrontPortalProps {
  products: Product[];
  onAddOrder: (order: Order) => void;
  orders: Order[];
  lang?: 'EN' | 'SW';
}

export function StorefrontPortal({ products, onAddOrder, orders, lang = 'EN' }: StorefrontPortalProps) {
  // Navigation tabs within Storefront
  const [activeSubTab, setActiveSubTab] = useState<'shop' | 'buyback' | 'learn' | 'recipes' | 'orders'>('shop');
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<'all' | 'honey' | 'beeswax'>('all');
  
  // Kenya Bee Company Buyback states
  const [buybackRequests, setBuybackRequests] = useState<BuybackRequest[]>(() => {
    const saved = localStorage.getItem("kbc_buyback_requests");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "REQ-3921",
        fullName: "Wycliffe Kiprop",
        phone: "0722334455",
        location: "Baringo County, Marigat",
        amountKg: 150,
        honeyType: "Acacia Honey",
        status: "Inspected & Approved",
        payoutKes: 192000,
        date: "2026-06-02"
      },
      {
        id: "REQ-2018",
        fullName: "Agnes Mumbua",
        phone: "0733887766",
        location: "Kitui Center, Kathiyani",
        amountKg: 85,
        honeyType: "Multi-floral Honey",
        status: "Paid",
        payoutKes: 108800,
        date: "2026-05-28"
      }
    ];
  });

  // Save buybacks to localStorage
  useEffect(() => {
    localStorage.setItem("kbc_buyback_requests", JSON.stringify(buybackRequests));
  }, [buybackRequests]);

  // Synchronize buybacks live across portals
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem("kbc_buyback_requests");
        if (saved) {
          setBuybackRequests(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Localstorage sync error", e);
      }
    };
    window.addEventListener("storage", handleSync);
    const interval = setInterval(handleSync, 2000);
    return () => {
      window.removeEventListener("storage", handleSync);
      clearInterval(interval);
    };
  }, []);

  // Buyback Sell Form controls
  const [bbName, setBbName] = useState("");
  const [bbPhone, setBbPhone] = useState("");
  const [bbCounty, setBbCounty] = useState("Baringo");
  const [bbAreaInput, setBbAreaInput] = useState("");
  const [bbAmountKg, setBbAmountKg] = useState<number | "">("");
  const [bbHoneyType, setBbHoneyType] = useState("Wildflower Raw Honey");
  const [bbSubmitting, setBbSubmitting] = useState(false);
  const [bbSuccessMsg, setBbSuccessMsg] = useState<{ id: string; payout: number; amount: number; location: string; phone: string } | null>(null);

  // Cart state
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Checkout states
  const [checkoutStep, setCheckoutStep] = useState<'idle' | 'form' | 'success'>('idle');
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [recentOrderId, setRecentOrderId] = useState("");

  // M-Pesa specific states for high realism
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');
  const [mpesaNumber, setMpesaNumber] = useState("");
  const [mpesaStatus, setMpesaStatus] = useState<'idle' | 'pushing' | 'awaiting_pin' | 'paid' | 'failed'>('idle');
  const [mpesaStatusMsg, setMpesaStatusMsg] = useState("");

  // Translation helper
  const t = (en: string, sw: string) => {
    return lang === 'SW' ? sw : en;
  };

  // Quiz state
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Honey pairing state
  const [pairingFood, setPairingFood] = useState<string>("Charcuterie Board");

  // Filtering products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' ? true : p.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as {product: Product, quantity: number}[]);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !shippingAddress) return;

    const orderId = "ord-" + Math.floor(1000 + Math.random() * 9000);
    const newOrderItems: OrderItem[] = cart.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      price: item.product.price
    }));

    const executeFinalizeOrder = () => {
      const newOrder: Order = {
        id: orderId,
        customerName,
        customerEmail,
        customerPhone,
        items: newOrderItems,
        total: Number((getCartTotal() + 4.99).toFixed(2)),
        status: paymentMethod === 'mpesa' ? 'Paid' : 'Pending',
        date: new Date().toISOString().split("T")[0],
        shippingAddress
      };

      onAddOrder(newOrder);
      setRecentOrderId(orderId);
      setCart([]);
      setCheckoutStep('success');
      setMpesaStatus('idle');
    };

    if (paymentMethod === 'mpesa') {
      const phoneToUse = customerPhone || "0712345678";
      setMpesaStatus('pushing');
      setMpesaStatusMsg(`[M-PESA API] Initiating Safaricom STK Push to ${phoneToUse}...`);
      
      setTimeout(() => {
        setMpesaStatus('awaiting_pin');
        setMpesaStatusMsg(`[Awaiting PIN] STK Prompt popped up on your kabambe/handset. Please enter your M-Pesa PIN...`);
        
        setTimeout(() => {
          setMpesaStatus('success');
          setMpesaStatusMsg(`[SUCCESS] M-Pesa payment received! TXN ID: MP-KGM${Math.floor(100000 + Math.random() * 900000)}Y. Paid Ksh ${(Math.round((getCartTotal() + 4.99) * 128)).toLocaleString()} KES.`);
          
          setTimeout(() => {
            executeFinalizeOrder();
          }, 1500);
        }, 2200);
      }, 1500);
    } else {
      executeFinalizeOrder();
    }
  };

  const handleBuybackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bbName || !bbPhone || !bbAmountKg || Number(bbAmountKg) <= 0) return;

    setBbSubmitting(true);
    setBbSuccessMsg(null);
    const payoutRaw = Number(bbAmountKg) * 1280;
    const locationFull = `${bbCounty} County${bbAreaInput ? `, ${bbAreaInput}` : ''}`;
    const newId = "REQ-" + Math.floor(1000 + Math.random() * 9000);

    setTimeout(() => {
      const newReq: BuybackRequest = {
        id: newId,
        fullName: bbName,
        phone: bbPhone,
        location: locationFull,
        amountKg: Number(bbAmountKg),
        honeyType: bbHoneyType,
        status: 'Pending Review',
        payoutKes: payoutRaw,
        date: new Date().toISOString().split("T")[0]
      };

      setBuybackRequests((prev) => [newReq, ...prev]);
      setBbSuccessMsg({
        id: newId,
        payout: payoutRaw,
        amount: Number(bbAmountKg),
        location: locationFull,
        phone: bbPhone
      });

      // Clear fields
      setBbName("");
      setBbPhone("");
      setBbAreaInput("");
      setBbAmountKg("");
    }, 1200);
  };

  // Educational Quiz questions dataset
  const quizQuestions = [
    {
      question: "How many flowers must a bee colony visit to construct just one pound of golden honey?",
      options: [
        "Around 100,000 flowers",
        "Roughly 500,000 flowers",
        "Fully 2 million flowers",
        "About 10 million flowers"
      ],
      correctIndex: 2,
      explanation: "Amazing isn't it? An entire hive travels approximately 55,000 miles and lands on roughly 2 million individual flowers to construct just a single pound of pure honey!"
    },
    {
      question: "Which honey variety is highly celebrated for carrying intense antimicrobial and bioactive healing compounds?",
      options: [
        "Clover Blossom Gold",
        "Active Manuka Honey",
        "Orange Blossom Infusion",
        "Buckwheat Amber Honey"
      ],
      correctIndex: 1,
      explanation: "Active Manuka Honey (derived from the tea tree shrub of New Zealand) boasts incredibly high levels of Methylglyoxal (MGO) which gives it supreme wellness and skin-care therapeutic benefits!"
    }
  ];

  const handleAnswerSelect = (index: number) => {
    setSelectedQuizAnswer(index);
    if (index === quizQuestions[currentQuestionIndex].correctIndex) {
      setQuizScore((prev) => (prev || 0) + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    setSelectedQuizAnswer(null);
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Finished
    }
  };

  const foodPairings: { [key: string]: { honey: string, reason: string, rating: string } } = {
    "Charcuterie Board": {
      honey: "Woodland Wildflower Honey",
      reason: "The deep, slightly fruity and robust notes of Wildflower honey perfectly balance standard goat cheese and salted prosciutto slices.",
      rating: "⭐⭐⭐⭐⭐ Outstanding"
    },
    "Warm Tea or Coffee": {
      honey: "Clover Blossom Gold",
      reason: "An ultra-clean floral sweet light profile that doesn't overwhelm. Dissolves seamlessly to leave an organic, aromatic shine.",
      rating: "⭐⭐⭐⭐⭐ Staple Classic"
    },
    "Oatmeal & Yogurt Bowls": {
      honey: "Active Manuka Reserve",
      reason: "Earthy, mineral-packed medicinal sweetness that turns standard cold oatmeal into a premium power meal with high longevity benefits.",
      rating: "⭐⭐⭐⭐⭐ Wellness Pick"
    },
    "Fresh Grapefruit & Berries": {
      honey: "Orange Blossom Infusion",
      reason: "A spectacular overlay of citrus-on-citrus. Complements citrus oil zest and rounds off bitter subtones of fresh berries.",
      rating: "⭐⭐⭐⭐ Chef Approved"
    }
  };

  return (
    <div className="relative" id="storefront-portal">
      {/* Visual store Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-amber-950 text-white p-8 md:p-12 mb-8 shadow-md border border-amber-800/40">
        <div className="absolute inset-0 bg-radial-gradient from-amber-700/25 to-black/60 pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-full text-xs font-medium mb-4">
            <Award className="w-3.5 h-3.5" />
            <span>{t("100% Raw, Organic & Family Harvested", "Asali Halisi, Safi na Mbichi 100% iliyovunwa kiasili")}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 font-display">
            {t("HiveTrack Honey Shop", "Duka Kuu la Asali")}
          </h1>
          <p className="text-amber-100 text-sm md:text-base mb-6 leading-relaxed">
            {t("Freshly extracted using eco-sensitive centrifuging. Every jar retains pure honeycomb pollen, local enzymes, and organic nectar profiles.", "Asali safi iliyovunwa kiasili kutoka milima na misitu ya Kenya. Kila chupa ina virutubisho hai, nta safi na poleni asilia ya maua ya nyitini.")}
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => setActiveSubTab('shop')} 
              className={`px-5 py-2.5 rounded-xl font-medium text-sm transition duration-150 ${activeSubTab === 'shop' ? 'bg-amber-500 text-white font-semibold shadow-sm' : 'bg-white/10 hover:bg-white/20 text-white'}`}
            >
              {t("Browse Artisan Goods", "Katalogi ya Bidhaa")}
            </button>
            <button 
              onClick={() => setActiveSubTab('buyback')} 
              className={`px-5 py-2.5 rounded-xl font-medium text-sm transition duration-150 relative flex items-center gap-1.5 ${activeSubTab === 'buyback' ? 'bg-[#F4B400] text-black font-semibold shadow-sm' : 'bg-white/10 hover:bg-white/20 text-white'}`}
            >
              <span>💼</span>
              <span>{t("Sell to Kenya Bee Co.", "Uza kwa Kenya Bee Co.")}</span>
              {buybackRequests.length > 0 && (
                <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold leading-none">
                  {buybackRequests.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveSubTab('learn')} 
              className={`px-5 py-2.5 rounded-xl font-medium text-sm transition duration-150 ${activeSubTab === 'learn' ? 'bg-amber-500 text-white font-semibold' : 'bg-white/10 hover:bg-white/20 text-white'}`}
            >
              {t("School of Bees", "Masomo ya Ufugaji")}
            </button>
            <button 
              onClick={() => setActiveSubTab('recipes')} 
              className={`px-5 py-2.5 rounded-xl font-medium text-sm transition duration-150 ${activeSubTab === 'recipes' ? 'bg-amber-500 text-white font-semibold' : 'bg-white/10 hover:bg-white/20 text-white'}`}
            >
              {t("Chef's Pairing Lab", "Mchanganyiko wa Mapishi")}
            </button>
            {orders.length > 0 && (
              <button 
                onClick={() => setActiveSubTab('orders')} 
                className={`px-5 py-2.5 rounded-xl font-medium text-sm transition duration-150 relative ${activeSubTab === 'orders' ? 'bg-amber-500 text-white font-semibold' : 'bg-white/10 hover:bg-white/20 text-white'}`}
              >
                {t("My Orders", "Hati za Mauzo")}
                <span className="absolute -top-1.5 -right-1.5 bg-[#F5B800] text-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black">
                  {orders.length}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SHOP CATALOGUE SUB-TAB */}
      {activeSubTab === 'shop' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-amber-50/40 border border-amber-100 p-4 rounded-2xl">
            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-3 flex items-center text-amber-700/50">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search honeys, candles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-amber-200 pl-10 pr-4 py-2 text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-gray-800 placeholder-amber-700/35"
              />
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto shrink-0">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold shrink-0 cursor-pointer ${typeFilter === 'all' ? 'bg-amber-500 text-white shadow-sm' : 'bg-white border border-amber-200 text-amber-800 hover:bg-amber-50/50'}`}
              >
                All Products ({products.length})
              </button>
              <button
                onClick={() => setTypeFilter('honey')}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold shrink-0 cursor-pointer ${typeFilter === 'honey' ? 'bg-amber-500 text-white shadow-sm' : 'bg-white border border-amber-200 text-amber-800 hover:bg-amber-50/50'}`}
              >
                Raw Honey
              </button>
              <button
                onClick={() => setTypeFilter('beeswax')}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold shrink-0 cursor-pointer ${typeFilter === 'beeswax' ? 'bg-amber-500 text-white shadow-sm' : 'bg-white border border-amber-200 text-amber-800 hover:bg-amber-50/50'}`}
              >
                Beeswax Crafts
              </button>
            </div>
          </div>

          {/* Product Cards Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white border border-dashed border-amber-200 rounded-3xl">
              <ShoppingBag className="w-12 h-12 text-amber-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No sweet artisan goods match your filter.</p>
              <button 
                onClick={() => { setSearchTerm(""); setTypeFilter('all'); }} 
                className="mt-3 text-sm text-amber-600 hover:underline font-semibold"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((p) => (
                <div key={p.id} className="bg-white border border-amber-100 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between group">
                  <div>
                    {/* Header line */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl text-amber-500 group-hover:scale-110 transition-transform duration-200 select-none">
                        {p.image}
                      </span>
                      <span className="text-[11px] px-2.5 py-1 bg-amber-50 font-semibold text-amber-700 rounded-full border border-amber-100 flex items-center gap-1">
                        <Gift className="w-3 h-3" />
                        <span>{p.sizeOz} oz jar</span>
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 group-hover:text-amber-700 transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-xs font-semibold text-amber-600/80 mb-2 font-mono">
                      {p.flavorProfile}
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed mb-4">
                      {p.description}
                    </p>
                  </div>

                  <div>
                    {/* Rating display */}
                    <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold mb-4 bg-amber-50/40 p-1.5 rounded-lg border border-amber-100">
                      <span>★</span>
                      <span>{p.rating}</span>
                      <span className="text-gray-400 font-normal">({p.reviewsCount} customer reviews)</span>
                    </div>

                    {/* Footer price & Add order action button */}
                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">Unit Price</p>
                        <p className="text-lg font-bold text-gray-900">${p.price.toFixed(2)}</p>
                      </div>

                      {p.stock > 0 ? (
                        <button
                          onClick={() => handleAddToCart(p)}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition duration-150"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Jar</span>
                        </button>
                      ) : (
                        <span className="px-3 py-2 bg-gray-100 text-gray-400 text-xs font-medium rounded-xl">
                          Sold Out
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BUYBACK TAB: SELL TO KENYA BEE CO. */}
      {activeSubTab === 'buyback' && (
        <div className="bg-white border border-amber-100 rounded-3xl p-6 shadow-xs max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200" id="buyback-seller-portal">
          <div className="border-b border-amber-100 pb-5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-amber-700 bg-amber-50 border border-amber-200/50 px-2.5 py-1 rounded-md font-bold mb-2 inline-block">
              💼 {t("Direct Honey Buyback Program", "Mpango wa Ununuzi wa Asali")}
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
              {t("Sell Your Raw Honey to Kenya Bee Company", "Uza Asali Yako Mbichi kwa Kenya Bee Company")}
            </h2>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed max-w-3xl font-medium">
              We buy premium honey crops directly from local apiaries at a guaranteed export rate of <strong className="text-emerald-700 font-extrabold">Ksh 1,280 per Kilogram</strong>. 
              Our certified inspectors can dispatch to your farm and settle the payout directly to your mobile phone.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Sell Request Form */}
            <div className="lg:col-span-5 bg-[#FCFBF7]/50 border border-amber-100 rounded-2xl p-5 md:p-6 space-y-4">
              <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wide border-b border-amber-200/40 pb-2">
                ✍️ {t("Submit Sales Request", "Tuma Ombi la Mauzo")}
              </h3>

              {bbSuccessMsg ? (
                <div className="bg-emerald-50 border border-emerald-250 p-4 rounded-xl text-xs space-y-2.5 animate-in zoom-in-95 duration-150">
                  <div className="flex items-center gap-1.5 text-emerald-850 font-bold">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{t("Sales Request Drafted Successfully!", "Ombi Limetumwa kwa Mafanikio!")}</span>
                  </div>
                  <p className="text-[#1A4D2E] font-medium leading-relaxed">
                    Your request has been filed in the real-time shared ledger with ID <strong className="font-mono font-bold bg-white/60 px-1 py-0.5 rounded border border-emerald-200">{bbSuccessMsg.id}</strong>.
                  </p>
                  <div className="border-t border-emerald-200/50 pt-2.5 space-y-1 text-[11px] text-[#1A4D2E]">
                    <div>• <strong>{t("Amount", "Kiasi")}:</strong> {bbSuccessMsg.amount} Kg Raw Honey</div>
                    <div>• <strong>{t("Estimated Payout", "Malipo ya Kadirio")}:</strong> Ksh {bbSuccessMsg.payout.toLocaleString()}</div>
                    <div>• <strong>{t("Location Listed", "Mahali")}:</strong> {bbSuccessMsg.location}</div>
                  </div>
                  <button 
                    onClick={() => setBbSuccessMsg(null)}
                    className="w-full mt-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] transition"
                  >
                    {t("Submit Another Consignment", "Tuma Ombi Jingine")}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBuybackSubmit} className="space-y-4 text-xs font-medium text-gray-800">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-amber-800 block">
                      {t("Farmer Full Name", "Jina Kamili la Mkulima")}
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Wycliffe Kiprop"
                      value={bbName}
                      onChange={(e) => setBbName(e.target.value)}
                      className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-amber-800 block">
                      {t("Verified Phone Number (M-Pesa Payout)", "Nambari ya Simu ya M-Pesa")}
                    </label>
                    <input 
                      type="tel"
                      required
                      placeholder="e.g. 0722334455"
                      value={bbPhone}
                      onChange={(e) => setBbPhone(e.target.value)}
                      className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-amber-800 block">
                        {t("Current County", "Kaunti Uliopo")}
                      </label>
                      <select
                        value={bbCounty}
                        onChange={(e) => setBbCounty(e.target.value)}
                        className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold"
                      >
                        <option value="Baringo">Baringo</option>
                        <option value="Kitui">Kitui</option>
                        <option value="Nakuru">Nakuru</option>
                        <option value="Narok">Narok</option>
                        <option value="Laikipia">Laikipia</option>
                        <option value="Nyeri">Nyeri</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-amber-800 block">
                        {t("Specific Area / Village", "Kijiji / Mtaa")}
                      </label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. Katitu"
                        value={bbAreaInput}
                        onChange={(e) => setBbAreaInput(e.target.value)}
                        className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-amber-800 block">
                        {t("Net Honey Amount (Kg)", "Uzito wa Asali (Kilo)")}
                      </label>
                      <input 
                        type="number"
                        required
                        min="1"
                        placeholder="e.g. 50"
                        value={bbAmountKg}
                        onChange={(e) => setBbAmountKg(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-amber-800 block">
                        {t("Honey Flora Spec Type", "Aina ya Asali")}
                      </label>
                      <select
                        value={bbHoneyType}
                        onChange={(e) => setBbHoneyType(e.target.value)}
                        className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                      >
                        <option value="Acacia Raw Honey">Acacia Raw Honey</option>
                        <option value="Multi-floral Honey">Multi-floral Honey</option>
                        <option value="Wildflower Raw Honey">Wildflower Raw Honey</option>
                        <option value="Eucalyptus Nectar Honey">Eucalyptus Nectar Honey</option>
                      </select>
                    </div>
                  </div>

                  {/* Dynamic calculation banner */}
                  {Number(bbAmountKg) > 0 && (
                    <div className="p-3 bg-[#1A4D2E]/5 border border-[#1A4D2E]/10 rounded-xl space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-gray-500">
                        <span>Rate / Kg:</span>
                        <span className="font-mono font-bold text-gray-700">Ksh 1,280</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold text-gray-900">
                        <span>{t("Guaranteed Payout:", "Malipo ya Uhakika:")}</span>
                        <span className="font-mono text-emerald-800 text-sm">Ksh {(Number(bbAmountKg) * 1280).toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={bbSubmitting || !bbName || !bbPhone || !bbAmountKg}
                    className="w-full py-2.5 bg-[#F4B400] hover:bg-black hover:text-[#F4B400] text-black font-extrabold uppercase rounded-xl transition duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {bbSubmitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-amber-900 border-t-transparent rounded-full animate-spin" />
                        <span>Filing request...</span>
                      </>
                    ) : (
                      <>
                        <span>💼</span>
                        <span>{t("Submit Honey Consignment", "Tuma Asali kwa Kampuni")}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Right Column: Submitted Consignment List (My Sales Requests Portfolio) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 font-mono">
                  📂 {t("My Sales Requests Portfolio", "Hati na Portfolio ya Mauzo")}
                </h3>
                <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Active Sync ({buybackRequests.length})
                </span>
              </div>

              {buybackRequests.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-amber-200 rounded-2xl bg-[#FCFBF7]/50 p-6">
                  <span className="text-3xl block mb-2">📦</span>
                  <p className="text-xs text-gray-500 font-semibold mb-1">
                    {t("You haven't submitted any sales lots yet.", "Bado hujaomba kuuza asali yoyote kwa sasa.")}
                  </p>
                  <p className="text-[10px] text-gray-400 max-w-sm mx-auto leading-relaxed">
                    {t("As soon as you fill out the left form and submit, your consignment will register immediately with live status tracking chips.", 
                       "Mara tu unapojaza fomu ya kushoto, mzigo wako utasajiliwa papo hapo ukiwa na chipu za kufuatilia hali halisi.")}
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                  {buybackRequests.map((r) => {
                    // Status styling chips specifically distinguished
                    let chipColor = "bg-stone-50 text-stone-600 border-stone-200";
                    let statusLabel = r.status;
                    
                    if (r.status === 'Pending Review' || r.status as string === 'Pending') {
                      chipColor = "bg-amber-100 text-amber-800 border-amber-300 font-bold shadow-2xs";
                      statusLabel = t("Pending Review", "Kaguzi Inasubiriwa");
                    } else if (r.status === 'Collector Dispatched') {
                      chipColor = "bg-sky-100 text-sky-800 border-sky-300 font-bold shadow-2xs";
                      statusLabel = t("Collector Dispatched", "Ofisa Ametumwa");
                    } else if (r.status === 'Inspected & Approved') {
                      chipColor = "bg-indigo-100 text-indigo-800 border-indigo-300 font-semibold shadow-2xs";
                      statusLabel = t("Approved", "Imekubaliwa");
                    } else if (r.status === 'Paid') {
                      chipColor = "bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold shadow-2xs";
                      statusLabel = t("Paid & Settled ✓", "Imelipwa tayari ✓");
                    }

                    return (
                      <div 
                        key={r.id} 
                        className="bg-stone-50/40 border border-stone-150 hover:border-amber-400/50 rounded-2xl p-4 transition duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden"
                      >
                        {/* Status visual vertical strip */}
                        <div className={`absolute top-0 bottom-0 left-0 w-1 ${r.status === 'Paid' ? 'bg-emerald-500' : 'bg-amber-400'}`} />

                        <div className="space-y-1 flex-1 pl-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-[9px] font-extrabold bg-stone-100 text-stone-600 px-1 py-0.5 rounded border border-stone-200">
                              {r.id}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${chipColor}`}>
                              {statusLabel}
                            </span>
                          </div>

                          <div className="text-xs">
                            <p className="font-extrabold text-gray-900 uppercase tracking-tight">{r.fullName}</p>
                            <p className="text-gray-500 text-[10px] mt-0.5 flex items-center gap-1">
                              <span>📍 {r.location}</span>
                              <span className="text-stone-300">|</span>
                              <span>📞 {r.phone}</span>
                            </p>
                          </div>
                        </div>

                        {/* Financial Details */}
                        <div className="bg-white border border-stone-200 px-4 py-2 rounded-xl text-right min-w-[150px] shadow-3xs shrink-0 self-start md:self-auto">
                          <span className="text-[9px] text-gray-400 uppercase font-mono block block leading-normal mt-0.5">
                            {r.honeyType}
                          </span>
                          <span className="text-xs text-gray-700 font-semibold block">
                            {r.amountKg} Kg raw bulk
                          </span>
                          <strong className="text-xs font-mono font-black text-[#1A4D2E] block mt-0.5">
                            Ksh {r.payoutKes.toLocaleString()}
                          </strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Secure partner badge notice */}
              <div className="p-4 bg-emerald-50/40 border border-emerald-150 rounded-xl space-y-1.5">
                <h4 className="text-xs font-bold text-[#1A4D2E] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{t("Secure Sourcing Standard (KEBS compliant)", "Kiwango cha Sourcing Salama")}</span>
                </h4>
                <p className="text-gray-500 text-[10px] leading-relaxed">
                  Every honey buyback lot is checked for organic pollen counts, density consistency, moisture levels (&lt;19%), and completely pesticide-free harvesting structures. Sourced in proud partnership with Baringo and Kitui Small-Scale Honey Apiaries.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeSubTab === 'learn' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Beekeeping Trivia Quiz */}
          <div className="bg-amber-50/40 border border-amber-200/60 p-6 rounded-3xl">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-gray-900">Beekeeping Trivia Quiz</h2>
            </div>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Let's see how much you know about your local apiculture ecosystem. Take our educational quiz to unlock Barnaby's seal!
            </p>

            <div className="bg-white border border-amber-100 p-5 rounded-2xl shadow-xs">
              <span className="text-[10px] uppercase font-mono text-amber-600 tracking-wider font-bold">
                Question {currentQuestionIndex + 1} of {quizQuestions.length}
              </span>
              <h4 className="font-semibold text-gray-950 mt-1 mb-4 leading-snug">
                {quizQuestions[currentQuestionIndex].question}
              </h4>

              <div className="space-y-2.5">
                {quizQuestions[currentQuestionIndex].options.map((option, idx) => {
                  let buttonStyle = "border-amber-100 hover:bg-amber-50 hover:border-amber-300 bg-white";
                  if (selectedQuizAnswer !== null) {
                    if (idx === quizQuestions[currentQuestionIndex].correctIndex) {
                      buttonStyle = "bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold";
                    } else if (idx === selectedQuizAnswer) {
                      buttonStyle = "bg-red-50 border-red-300 text-red-800";
                    } else {
                      buttonStyle = "opacity-50 bg-white border-gray-100 cursor-not-allowed";
                    }
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => selectedQuizAnswer === null && handleAnswerSelect(idx)}
                      disabled={selectedQuizAnswer !== null}
                      className={`w-full text-left p-3.5 border rounded-xl text-xs transition duration-150 flex items-center justify-between ${buttonStyle}`}
                    >
                      <span>{option}</span>
                      {selectedQuizAnswer !== null && idx === quizQuestions[currentQuestionIndex].correctIndex && (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedQuizAnswer !== null && (
                <div className="mt-5 p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-xs text-amber-900 leading-relaxed">
                    <strong>Context Insight:</strong> {quizQuestions[currentQuestionIndex].explanation}
                  </p>
                  
                  {currentQuestionIndex < quizQuestions.length - 1 ? (
                    <button
                      onClick={handleNextQuizQuestion}
                      className="mt-4 inline-flex items-center gap-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl"
                    >
                      <span>Next Question</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="mt-4 pt-3 border-t border-amber-200/40 text-xs font-medium text-emerald-700">
                      🎉 Challenge Complete! Thank you for supporting organic local farms and understanding our sweet pollinating heroes.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Core Beekeeping Ecological pillars Card */}
          <div className="space-y-6">
            <div className="border border-amber-100 p-6 rounded-3xl bg-white shadow-xs">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3.5">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <span>Our Biological Quality Promise</span>
              </h3>
              <ul className="space-y-3.5 text-xs text-gray-600 leading-relaxed">
                <li className="flex gap-3">
                  <span className="p-1 bg-amber-50 text-amber-600 rounded-lg shrink-0 h-fit">✓</span>
                  <div>
                    <strong className="text-gray-900 block font-semibold">Zero Synthetic Synthetics</strong>
                    We never use chemical miticides or synthetic antibiotics inside any honey hives. Our colony health relies purely on organic essential oil treatments and split management.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="p-1 bg-amber-50 text-amber-600 rounded-lg shrink-0 h-fit">✓</span>
                  <div>
                    <strong className="text-gray-900 block font-semibold">Cold extraction centrifuge</strong>
                    Pasteurizing honey completely destroys beneficial pollen enzymes and flavor elements. Our harvest process utilizes cold-extraction speeds so that raw nectar properties are fully preserved.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="p-1 bg-amber-50 text-amber-600 rounded-lg shrink-0 h-fit">✓</span>
                  <div>
                    <strong className="text-gray-900 block font-semibold">Diverse Pasture Corridors</strong>
                    By surrounding our honey boxes with organic clover plots, ancient oak stands, and orange orchard paths, we secure superior bee nutrition and incredibly unique floral profiles.
                  </div>
                </li>
              </ul>
            </div>

            {/* Micro-Stat banner */}
            <div className="bg-radial-gradient from-amber-50 to-orange-50/50 border border-amber-100 p-5 rounded-2xl text-center">
              <Sparkles className="w-5 h-5 text-orange-500 mx-auto mb-2 animate-bounce" />
              <p className="text-xs font-semibold text-amber-900">Did you know?</p>
              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                Bees are critical for 1/3 of every single bite of food we swallow. By supporting local managed apiaries, you are actively backing local biodiversity corridors!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* RECIPES & PAIRINGS TAB */}
      {activeSubTab === 'recipes' && (
        <div className="bg-white border border-amber-100 rounded-3xl p-6 shadow-xs max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-gray-900">Meadow Springs Chef's Pairing Lab</h2>
          </div>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            Select a kitchen base from the list below to discover which of our local organic honey types best unleashes its premium aromatic profile.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="md:col-span-2 flex flex-col gap-2">
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-gray-400">Select Kitchen Base</span>
              {Object.keys(foodPairings).map((food) => (
                <button
                  key={food}
                  onClick={() => setPairingFood(food)}
                  className={`text-left text-xs px-4 py-3 rounded-xl border transition duration-150 flex items-center justify-between ${pairingFood === food ? 'bg-amber-500 border-amber-500 text-white font-semibold' : 'bg-white border-gray-100 hover:bg-amber-50/25 text-gray-700'}`}
                >
                  <span>{food}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-65" />
                </button>
              ))}
            </div>

            <div className="md:col-span-3 bg-amber-50/30 border border-amber-100 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono bg-amber-200/50 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                  Recommended Pairing
                </span>
                <h4 className="text-base font-bold text-amber-950 mt-2 mb-1.5 flex items-center gap-1.5">
                  <span>🍯</span> 
                  <span>{foodPairings[pairingFood].honey}</span>
                </h4>
                <p className="text-xs text-gray-700 leading-relaxed mb-4">
                  {foodPairings[pairingFood].reason}
                </p>
              </div>

              <div className="border-t border-amber-200/50 pt-4 flex justify-between items-center text-xs font-medium">
                <span className="text-amber-800">{foodPairings[pairingFood].rating}</span>
                <span className="text-gray-400">Match Accuracy: 100%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* USER ORDER HISTORY IN STORE */}
      {activeSubTab === 'orders' && (
        <div className="bg-white border border-amber-100 rounded-3xl p-6 shadow-xs max-w-4xl mx-auto space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-gray-900">Your Checkout Requests</h2>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Review your purchase pipeline and delivery details verified by our farm shipping software.
          </p>

          <div className="space-y-4">
            {orders.map((o) => (
              <div key={o.id} className="border border-amber-150 rounded-2xl p-5 bg-amber-50/10">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-100 pb-3 mb-3">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-gray-400 block">Invoice Code</span>
                    <span className="text-xs font-bold font-mono text-amber-800">{o.id}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-gray-400 block">Invoice Date</span>
                    <span className="text-xs font-semibold text-gray-700">{o.date}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-gray-400 block">Status</span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border uppercase tracking-wider ${
                      o.status === "Delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-250"
                    }`}>
                      {o.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono text-gray-400 block">Grand Total</span>
                    <span className="text-sm font-bold text-gray-950">${o.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Basket Overview:</p>
                  {o.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs text-gray-700">
                      <span>{item.quantity}x {item.productName}</span>
                      <span className="font-mono text-gray-500">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="text-[11px] text-gray-400 font-medium pt-2 border-t border-amber-100 flex items-center justify-between">
                    <span>Delivering to: <strong className="text-gray-600 font-semibold">{o.shippingAddress}</strong></span>
                    <span>Shipping method: Free eco post packet</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SHOPPING CART OVERLAY DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" id="cart-overlay">
          <div className="w-full max-w-md bg-white h-full flex flex-col justify-between p-6 shadow-2xl relative">
            
            {/* Header */}
            <div>
              <div className="flex items-center justify-between border-b border-gray-150 pb-4 mb-4">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-500" />
                  <span>Your Honey Harvest Basket</span>
                </h3>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                </button>
              </div>

              {checkoutStep === 'idle' && (
                <>
                  {cart.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-xs font-medium space-y-3">
                      <p className="text-4xl text-amber-500 animate-pulse">🍯</p>
                      <p>Your basket is completely empty.</p>
                      <button 
                        onClick={() => setIsCartOpen(false)}
                        className="text-amber-600 font-semibold hover:underline mt-2 text-xs"
                      >
                        Start selecting products
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                      {cart.map((item) => (
                        <div key={item.product.id} className="flex items-center justify-between border-b border-gray-100 pb-3 gap-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{item.product.image}</span>
                            <div>
                              <h4 className="text-xs font-bold text-gray-900">{item.product.name}</h4>
                              <p className="text-[10px] text-amber-600 font-mono font-bold">${item.product.price.toFixed(2)}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-2 py-1 rounded-xl">
                            <button 
                              onClick={() => updateCartQuantity(item.product.id, -1)}
                              className="text-amber-800 p-0.5 hover:bg-amber-100/50 rounded"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold font-mono text-amber-900 px-1">{item.quantity}</span>
                            <button 
                              onClick={() => updateCartQuantity(item.product.id, 1)}
                              className="text-amber-800 p-0.5 hover:bg-amber-100/50 rounded"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Checkout shipping info form */}
              {checkoutStep === 'form' && (
                <div className="relative">
                  {mpesaStatus !== 'idle' ? (
                    <div className="p-8 text-center bg-amber-50/50 rounded-2xl border-2 border-amber-500/30 space-y-4 animate-pulse">
                      <div className="w-14 h-14 bg-amber-500 text-black font-black rounded-full flex items-center justify-center mx-auto text-xs animate-bounce">
                        M-PESA
                      </div>
                      <h4 className="text-sm font-bold text-amber-900 uppercase tracking-widest">{t("PROCESSING PAYMENT", "MALIPO YANASINDISHWA")}</h4>
                      <p className="text-xs text-amber-850 font-mono font-bold max-w-xs mx-auto leading-relaxed">
                        {mpesaStatusMsg}
                      </p>
                      <div className="w-full bg-amber-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-amber-600 transition-all duration-1000 ${
                            mpesaStatus === 'pushing' ? 'w-1/3' : mpesaStatus === 'awaiting_pin' ? 'w-2/3' : 'w-full'
                          }`}
                        />
                      </div>
                      <p className="text-[10px] text-gray-500 uppercase">
                        {t("Do not close this panel. Confirm PIN on your Safaricom screen.", "Usipepese dirisha hili. Weka siri yako kwenye simu.")}
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleCheckoutSubmit} className="space-y-3.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-850 bg-amber-50 p-2.5 rounded-lg border border-amber-100 flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-amber-500" />
                        <span>{t("Provide Shipping & Delivery Contact", "Weka Maelezo ya Uwasilishaji")}</span>
                      </h4>
                      
                      {/* Payment Method Selector */}
                      <div>
                        <label className="text-[10px] uppercase font-bold text-amber-800 block mb-1.5">{t("Select Payment Gateway", "Chagua Njia ya Malipo")}</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('mpesa')}
                            className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                              paymentMethod === 'mpesa' 
                                ? 'bg-amber-100 border-amber-500 text-amber-900' 
                                : 'bg-transparent border-gray-200 text-gray-600 hover:border-amber-400'
                            }`}
                          >
                            <span className="font-black text-emerald-600">M-PESA Express</span>
                            <span className="text-[9px] text-gray-500 uppercase">STK Push (Kenya)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('card')}
                            className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                              paymentMethod === 'card' 
                                ? 'bg-amber-100 border-amber-500 text-amber-900' 
                                : 'bg-transparent border-gray-200 text-gray-600 hover:border-amber-400'
                            }`}
                          >
                            <span className="font-bold text-gray-700">{t("Safaricom Card", "Kadi ya Benki")}</span>
                            <span className="text-[9px] text-gray-500 uppercase">{t("Visa / Mastercard", "Kimataifa")}</span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-semibold text-gray-500 block mb-1">{t("Your Full Name", "Jina Lako Kamili")}</label>
                        <input 
                          type="text" 
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Jane Nyambura"
                          className="w-full text-xs p-2.5 bg-amber-55/20 border border-amber-250 rounded-xl focus:outline-amber-400 placeholder-amber-900/30"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] uppercase font-semibold text-gray-500 block mb-1">{t("Email Address", "Barua Pepe")}</label>
                          <input 
                            type="email" 
                            required
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            placeholder="nyambura@example.com"
                            className="w-full text-xs p-2.5 bg-amber-55/20 border border-amber-250 rounded-xl focus:outline-amber-400 placeholder-amber-900/30"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-semibold text-gray-500 block mb-1">
                            {paymentMethod === 'mpesa' ? t("M-Pesa Mobile No", "Namba ya M-Pesa") : t("Phone (Optional)", "Simu ya Mkononi")}
                          </label>
                          <input 
                            type="tel" 
                            required={paymentMethod === 'mpesa'}
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="0712345678"
                            className="w-full text-xs p-2.5 bg-amber-55/20 border border-amber-250 rounded-xl focus:outline-amber-400 placeholder-amber-900/30"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-semibold text-gray-500 block mb-1">{t("Shipping Postal Address", "Anwani ya Kusafirisha")}</label>
                        <textarea 
                          required
                          rows={2}
                          value={shippingAddress}
                          onChange={(e) => setShippingAddress(e.target.value)}
                          placeholder={t("Nairobi City, Westlands, Woodvale Grove House 12...", "Mfano: Nakuru Town, Shabab Estate House G4...")}
                          className="w-full text-xs p-2.5 bg-amber-55/20 border border-amber-250 rounded-xl focus:outline-amber-400 placeholder-amber-900/30 resize-none"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl shadow-sm tracking-wide transition uppercase cursor-pointer"
                        >
                          {paymentMethod === 'mpesa' ? t("Request Safaricom STK Push", "Tuma Ombi la M-Pesa STK") : t("Authorize Simulated Transfer", "Thibitisha Malipo ya Jaribio")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setCheckoutStep('idle')}
                          className="w-full text-center text-amber-700 hover:underline text-xs mt-3.5 cursor-pointer"
                        >
                          {t("Return to Basket View", "Rudi Kwenye Kikapu")}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Checkout success banner */}
              {checkoutStep === 'success' && (
                <div className="text-center py-10 space-y-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-gray-900">Your Harvest Order Has Been Placed!</h4>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">
                    A mock receipt has been generated with Code <strong className="text-amber-800 font-mono font-bold">{recentOrderId}</strong>. We've updated the Farmer's active dashboard sales database queue.
                  </p>
                  
                  <div className="pt-4 space-y-2">
                    <button
                      onClick={() => {
                        setCheckoutStep('idle');
                        setIsCartOpen(false);
                        setActiveSubTab('orders');
                      }}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl transition"
                    >
                      Review My Invoices
                    </button>
                    <button
                      onClick={() => {
                        setCheckoutStep('idle');
                        setIsCartOpen(false);
                      }}
                      className="w-full text-center text-gray-400 text-[11px] hover:underline"
                    >
                      Keep Browsing Goods
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Total Block */}
            {checkoutStep === 'idle' && cart.length > 0 && (
              <div className="border-t border-gray-150 pt-5 mt-auto bg-white">
                <div className="space-y-2 text-xs mb-4">
                  <div className="flex justify-between text-gray-500">
                    <span>Products Subtotal</span>
                    <span className="font-mono text-gray-800">${getCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Express Carbon-Free Post</span>
                    <span className="font-mono text-gray-800">$4.99</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-gray-950 pt-2 border-t border-gray-100">
                    <span>Order Total</span>
                    <span className="font-mono">${(getCartTotal() + 4.99).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="flex-1 py-3 border border-amber-200 text-amber-800 hover:bg-amber-50/30 text-xs font-semibold rounded-xl text-center"
                  >
                    Keep Shopping
                  </button>
                  <button
                    onClick={() => setCheckoutStep('form')}
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-sm text-center"
                  >
                    Proceed to Delivery Info
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
