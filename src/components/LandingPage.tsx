import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, Award, TrendingUp, MapPin, ChevronRight, Sparkles, 
  Globe, Users, ArrowRight, Database, WifiOff, Heart, CheckCircle2, 
  HelpCircle, Star, ShieldCheck, PlayCircle, Smartphone, Terminal, Volume2
} from "lucide-react";
import { Product } from "../types";

interface LandingPageProps {
  products: Product[];
  onStartTrial: () => void;
  onBrowseMarketplace: () => void;
  lang?: 'EN' | 'SW';
}

export function LandingPage({ products, onStartTrial, onBrowseMarketplace, lang = 'EN' }: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [profitInpKg, setProfitInpKg] = useState<number>(45);
  const [activeTab, setActiveTab] = useState<'farmers' | 'buyers'>('farmers');
  
  // Real-time globally sold feed item state for looping notifications in the Hero mockup
  const [feedIndex, setFeedIndex] = useState(0);
  const liveSalesFeed = [
    { destination: "🇯🇵 Tokyo, JP", qty: "120 Kg Acacia", value: "¥240,000", payout: "KES 184,300" },
    { destination: "🇩🇪 Berlin, DE", qty: "450 Kg Forest", value: "€3,400", payout: "KES 476,500" },
    { destination: "🇺🇸 New York, US", qty: "80 Kg Propolis", value: "$1,850", payout: "KES 240,500" },
    { destination: "🇬🇧 London, UK", qty: "200 Kg Multi-floral", value: "£1,900", payout: "KES 313,200" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setFeedIndex(prev => (prev + 1) % liveSalesFeed.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // USSD Emulator state
  const [showUssdEmulator, setShowUssdEmulator] = useState(false);
  const [ussdStep, setUssdStep] = useState<'dial' | 'menu' | 'register' | 'harvest' | 'balance' | 'success'>('dial');
  const [ussdInput, setUssdInput] = useState("");
  const [ussdLogs, setUssdLogs] = useState<string[]>([]);
  const [ussdNotification, setUssdNotification] = useState("");

  const t = (en: string, sw: string) => {
    return lang === 'SW' ? sw : en;
  };

  const handleUssdAction = (e: React.FormEvent) => {
    e.preventDefault();
    const input = ussdInput.trim();
    setUssdInput("");

    if (ussdStep === 'dial') {
      if (input === "*384*56#") {
        setUssdLogs(prev => [...prev, `>> Dialing ${input}...`, "Connecting to HiveGlobal USSD Gate..."]);
        setUssdStep('menu');
      } else {
        setUssdNotification("Invalid code. Dial *384*56#");
        setTimeout(() => setUssdNotification(""), 3000);
      }
      return;
    }

    if (ussdStep === 'menu') {
      if (input === "1") {
        setUssdStep('register');
      } else if (input === "2") {
        setUssdStep('harvest');
      } else if (input === "3") {
        setUssdStep('balance');
      } else {
        setUssdNotification("Select option 1, 2, or 3");
        setTimeout(() => setUssdNotification(""), 3000);
      }
      return;
    }

    if (ussdStep === 'register') {
      if (input) {
        setUssdLogs(prev => [...prev, `Registered Box: ${input}`]);
        setUssdStep('success');
      }
      return;
    }

    if (ussdStep === 'harvest') {
      const kg = Number(input);
      if (!isNaN(kg) && kg > 0) {
        setUssdLogs(prev => [...prev, `Logged Harvest: ${kg} Kg`]);
        setUssdStep('success');
      } else {
        setUssdNotification("Please enter a valid number of Kgs");
        setTimeout(() => setUssdNotification(""), 3000);
      }
      return;
    }
  };

  // Flip states of cards
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);

  // Play audio voice simulation
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const playSimulatedVoice = (textSwahili: string) => {
    setPlayingVoice(textSwahili);
    setTimeout(() => {
      setPlayingVoice(null);
    }, 4500);
  };

  return (
    <div className="space-y-20 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-[#1A4D2E] text-white p-8 md:p-16 border-2 border-[#F4B400]/40 shadow-xl">
        {/* Abstract honeycomb overlay background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(244,180,0,0.15),transparent_60%)] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#F4B400]/5 rounded-full filter blur-3xl pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F4B400]/20 border border-[#F4B400]/35 text-[#F4B400] rounded-full text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>{t("Your Apiary, Connected to the World", "Mizinga Yako, Imeunganishwa na Ulimwengu Mwema")}</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none text-white font-display">
              {t("Manage Hives", "Simamia Mizinga")} <span className="text-[#F4B400]">{t("Locally", "Kienyeji")}</span>.<br />
              {t("Sell Honey", "Uza Asali")} <span className="text-[#FF8C00]">{t("Globally", "Kimataifa")}</span>.
            </h1>
            
            <p className="text-[#FCF9F2]/95 text-base md:text-lg leading-relaxed max-w-xl">
              {t(
                "The ultimate platform connecting Kenya's smallholder beekeepers with premium bulk buyers in Europe, America, and Asia. Log offline logs, track honey metrics, and bypass middle brokers for 3x bigger M-Pesa returns.",
                "Mfumo mkuu unaounganisha wafugaji wadogo wa nyuki nchini Kenya na wanunuzi wakubwa wa kimataifa Ulaya, Marekani na Asia. Rekodi kwa njia ya kawaida bila mtandao, dhibiti afya ya nyuki, na uongeze mapato yako maradufu."
              )}
            </p>
            
            {/* CTA's */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={onStartTrial}
                className="px-8 py-4 bg-[#F4B400] text-[#1A4D2E] font-black text-sm uppercase tracking-wide rounded-xl shadow-lg hover:bg-white hover:text-gray-950 transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
              >
                <span>{t("Start Free Trial", "Miliki Jopo la Mkulima")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button 
                onClick={onBrowseMarketplace}
                className="px-8 py-4 bg-transparent border-2 border-white hover:border-[#F4B400] hover:bg-white/5 text-white font-bold text-sm uppercase tracking-wide rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-2"
              >
                <span>{t("Source Organic Honey", "Duka la Kimataifa")}</span>
                <ShoppingBag className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Live Statistics */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left">
              <div>
                <span className="text-2xl md:text-3xl font-black text-[#F4B400] tracking-tight font-display">4,200+</span>
                <p className="text-xs text-white/70 uppercase font-bold tracking-tight mt-1">{t("Active Hives", "Mizinga Active")}</p>
              </div>
              <div>
                <span className="text-2xl md:text-3xl font-black text-[#F4B400] tracking-tight font-display">18 {t("Tons", "Tani")}</span>
                <p className="text-xs text-white/70 uppercase font-bold tracking-tight mt-1">{t("Honey Exported", "Asali Iliyouzwa")}</p>
              </div>
              <div>
                <span className="text-2xl md:text-3xl font-black text-[#F4B400] tracking-tight font-display">KSh 12M+</span>
                <p className="text-xs text-white/70 uppercase font-bold tracking-tight mt-1">{t("Paid to Farmers", "Zilizolipwa Wafugaji")}</p>
              </div>
              <div>
                <span className="text-2xl md:text-3xl font-black text-[#F4B400] tracking-tight font-display">100%</span>
                <p className="text-xs text-white/70 uppercase font-bold tracking-tight mt-1">{t("KEBs Traced", "Kupitishwa na KEBs")}</p>
              </div>
            </div>
          </div>
          
          {/* Right Hero Mockup Frame */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-80 bg-[#2D2D2D]/95 border-4 border-[#F4B400] rounded-3xl p-6 shadow-2xl text-white font-mono text-xs overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-4 bg-black/40 flex justify-center items-center">
                <div className="w-16 h-2 bg-gray-700 rounded-full" />
              </div>
              
              <div className="mt-4 flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-[10px] uppercase font-bold text-emerald-400">● LIVE FEED</span>
                <span className="text-[9px] bg-[#1A4D2E] text-white px-1.5 py-0.5 rounded border border-[#F4B400]/40">Nairobi, KE</span>
              </div>
              
              {/* Fake animated mockup phone screen */}
              <div className="space-y-4 py-4">
                <div className="bg-black/30 p-3 rounded border border-white/5 space-y-1">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">CURRENT ACTIVE SALES</span>
                  <div className="flex justify-between items-center bg-[#1A4D2E]/40 p-2 rounded border border-[#F4B400]/20 animate-pulse">
                    <span>{liveSalesFeed[feedIndex].destination}</span>
                    <span className="text-[#F4B400] font-bold">{liveSalesFeed[feedIndex].qty}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] pt-1.5 text-gray-300">
                    <span>Export Contract Worth:</span>
                    <span className="font-bold text-[#FF8C00]">{liveSalesFeed[feedIndex].value}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-[10px] bg-amber-500/10 p-1 rounded text-amber-200 mt-1">
                    <span>Payout via M-Pesa:</span>
                    <span className="text-emerald-400">{liveSalesFeed[feedIndex].payout}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between font-bold text-[10px] text-gray-350">
                    <span>HIVE BOX HEALTH (2026)</span>
                    <span className="text-[#F4B400]">88/100</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[88%]" />
                  </div>
                </div>

                <div className="bg-amber-400/10 p-3 rounded border border-amber-500/20 text-[10px]">
                  <p className="text-amber-200 font-bold uppercase mb-1">📢 KEBS CERTIFICATION AP-74</p>
                  <p className="text-gray-350 text-[9px] leading-relaxed">
                    Moisture limit verified: 17.1%. Approved for European Union bulk botanical import standard.
                  </p>
                </div>
              </div>

              {/* Pulsing floating sticker */}
              <div className="absolute bottom-4 right-4 bg-[#FF8C00] text-black text-[9px] font-black px-2 py-1.5 rounded-full transform rotate-6 shadow animate-bounce">
                DHL ROUTED
              </div>
            </div>
            
            {/* Trust bar overlay background detail */}
            <div className="absolute -top-6 -left-6 bg-white/5 border border-[#F4B400]/25 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-[#F4B400]" />
              <div className="text-left">
                <span className="text-[10px] text-amber-100 uppercase block font-bold">WORKS OFFLINE</span>
                <span className="text-[9px] text-[#F4B400] font-mono">No network needed to log</span>
              </div>
            </div>
          </div>
          
        </div>

        {/* Brand bar banner below */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-wrap justify-center md:justify-between items-center gap-4 text-xs font-mono text-[#FCF9F2]/75 uppercase text-center tracking-wider">
          <div>💎 M-PESA API INTEGRATED</div>
          <div>🛡️ KENYA BUREAU OF STANDARDS (KEBS) COMPLIANT</div>
          <div>⚡ WORKS OFFLINE (USSD BACKFALL ENABLED)</div>
          <div>📍 ACTIVE IN 12 COUNTIES</div>
        </div>
      </section>


      {/* 2. TWO-SIDED VALUE PROPOSITION SECTION */}
      <section className="space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-950 font-display">
            {t("Unified Honey Logistics Engine", "Mfumo mmoja kwa Mkulima na Mnunuzi")}
          </h2>
          <p className="text-gray-500 text-sm max-w-2xl mx-auto font-sans">
            {t(
              "We provide world-class IoT apiary management tools for African farmers while supplying fully-traceable, high-grade honey to ethical bulk buyers globally.",
              "Tunatoa zana bora za kisasa za usimamizi wa mizinga kwa wakulima wa Afrika huku tukisambaza asali safi kwa wanunuzi wakubwa duniani."
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Farmers Column - Green Canvas */}
          <div className="bg-[#1A4D2E] text-white p-8 rounded-3xl border border-[#F4B400]/15 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex p-3 bg-white/5 border border-[#F4B400]/30 text-[#F4B400] rounded-2xl">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black font-display text-white">{t("FOR FARMERS - MANAGE LOCALLY", "KWA WAFUGAJI - SIMAMIA KISASA")}</h3>
              <p className="text-gray-200 text-sm leading-relaxed">
                {t(
                  "Log bee activity on-site using our offline-first application. Complete inspections without mobile towers, calculate pure profits, and get instant pricing advice.",
                  "Hifadhi kumbukumbu za mizinga bila kuhitaji intaneti. Pata maelezo na maelekezo ya kulisha nyuki wakati wa ukame na kujikinga dhidi ya wadudu waharibifu."
                )}
              </p>

              {/* 3 Interactive Cards inside Farmers Column */}
              <div className="grid grid-cols-1 gap-3 pt-4 font-sans">
                
                {/* Visual Hive Diary with Swahili voice recorder simulation */}
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono text-[#F4B400] uppercase font-bold">1. HIVE DIARY & VOICE DICTATION</span>
                    <Volume2 className="w-4 h-4 text-emerald-450 animate-pulse" />
                  </div>
                  <p className="text-xs text-stone-200">
                    {t(
                      "Our custom Swahili NLP translator parses raw voice transcripts into structured hive diagnostics automatically.",
                      "Utaalamu wetu wa sauti hutafsiri maelezo yako ya Kiswahili na kuandika taarifa ya mizinga papo hapo."
                    )}
                  </p>
                  
                  {/* Microphone play simulation button */}
                  <div className="flex gap-2.5">
                    <button 
                      onClick={() => playSimulatedVoice("Mzinga namba sita una asali nyingi sana, lakini malkia hajaonekana leo.")}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-[10px] font-bold rounded flex items-center gap-1.5"
                    >
                      🗣️ {t("Simulate Voice Note (Swahili)", "Sikiliza Maongezi ya Sauti")}
                    </button>
                  </div>
                  {playingVoice && (
                    <div className="bg-black/40 p-2.5 rounded border border-[#F4B400]/30 font-mono text-[10px] text-gray-300">
                      <p className="font-bold text-[#F4B400]">🗣️ TRANSCRIPT:</p>
                      <p className="italic">"{playingVoice}"</p>
                      <p className="text-xs text-emerald-400 font-bold mt-1">✓ Logged! Translated as: [Hive 6: High Nectar Yield, Queen Missing State]</p>
                    </div>
                  )}
                </div>

                {/* Smart Alerts */}
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex gap-3.5 items-start">
                  <div className="p-1.5 bg-amber-500/10 rounded-lg text-[#F4B450] border border-amber-500/20">
                    <Star className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-[#F4B400] uppercase font-bold block mb-1">2. SMART DIAGNOSTIC ALERTS</span>
                    <p className="text-xs text-stone-200">
                      {t("Instant warning algorithms: Chilled brood temperatures detected on Highland Range. Feed supplemental sugar within 48 hours.", "Arifa ya magonjwa au mabadiliko ya hewa: 'Nyuki katika mzinga wa Aberdares wanahitaji chakula cha sukari haraka!'")}
                    </p>
                  </div>
                </div>

                {/* Live Cost and profit calculator */}
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-[#F4B400] font-bold">3. PROFIT PER EXPORT KG CALCULATOR</span>
                    <span className="text-stone-300 font-bold font-mono">KES 1,280/Kg Price</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-300 block">{t("Estimated Harvest Volume:", "Kadirio la Kuvuna:")} <strong>{profitInpKg} Kg</strong></label>
                    <input 
                      type="range" 
                      min="5" 
                      max="200" 
                      value={profitInpKg} 
                      onChange={(e) => setProfitInpKg(Number(e.target.value))}
                      className="w-full accent-[#F4B400] cursor-pointer"
                    />
                  </div>
                  <div className="flex justify-between items-center bg-black/40 p-2 rounded text-[11px] font-mono">
                    <span className="text-gray-400">{t("Your payout directly on M-Pesa:", "Malipo yako kupitia M-Pesa:")}</span>
                    <span className="text-emerald-400 font-bold">Ksh {(profitInpKg * 1280).toLocaleString()}</span>
                  </div>
                </div>

              </div>
            </div>

            <button 
              onClick={onStartTrial}
              className="w-full py-4 bg-[#F4B400] hover:bg-white text-[#1A4D2E] text-xs font-black uppercase rounded-xl tracking-wider transition cursor-pointer"
            >
              {t("Register as a Beekeeping Cooperative", "Makisio ya Ufugaji - Jiunge Sasa")}
            </button>
          </div>

          {/* Buyers Column - Charcoal Canvas */}
          <div className="bg-[#2D2D2D] text-white p-8 rounded-3xl border border-white/10 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex p-3 bg-white/5 border border-[#F4B400]/30 text-[#F4B400] rounded-2xl">
                <Globe className="w-6 h-6 text-amber-400 animate-spin" />
              </div>
              <h3 className="text-2xl font-black font-display text-white">{t("FOR BUYERS - SOURCE ETHICALLY", "KWA WANUNUZI - ASALI SAFI")}</h3>
              <p className="text-gray-200 text-sm leading-relaxed">
                {t(
                  "Order heavy volume with absolute transparency. Tap to trace individual jars back to coordinates, download laboratory grade moisture certificates, and meet the rural families who gather your stock.",
                  "Pata asali bora yenye uthibitisho kamili. Thamani yako inafikia moja kwa moja jamii ya wafugaji huku ukipokea cheti rasmi cha unyevu na ubora."
                )}
              </p>

              {/* Map/Pulsing Dot + Buyer interactive features */}
              <div className="space-y-3 pt-4">
                
                {/* Small stylized Kenya map mockup */}
                <div className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-emerald-400 uppercase font-black">📍 KENYAN HIVE SUPPLY REGIONS</span>
                    <span className="text-amber-300 font-bold">3 ACTIVE DEPOTS</span>
                  </div>
                  
                  {/* Visual Map Layout */}
                  <div className="h-28 bg-[#1A4D2E]/20 relative rounded-xl border border-white/5 flex items-center justify-center">
                    <div className="absolute text-[8px] font-mono text-white/20 select-none">GREAT RIFT VALLEY REGION</div>
                    
                    {/* Pulsing Dots */}
                    <div className="absolute top-6 left-12 flex flex-col items-center">
                      <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping pointer-events-none absolute" />
                      <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full border border-black relative" />
                      <span className="text-[8px] font-mono bg-black/80 px-1 py-0.5 rounded text-[#F4B400] mt-1">Baringo Ridge</span>
                    </div>

                    <div className="absolute bottom-8 right-20 flex flex-col items-center">
                      <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping pointer-events-none absolute" />
                      <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full border border-black relative" />
                      <span className="text-[8px] font-mono bg-black/80 px-1 py-0.5 rounded text-[#F4B400] mt-1">Aberdare Mtns</span>
                    </div>

                    <div className="absolute top-10 right-28 flex flex-col items-center">
                      <span className="w-2.5 h-2.5 bg-emerald-450 rounded-full animate-ping pointer-events-none absolute" />
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full border border-black relative" />
                      <span className="text-[8px] font-mono bg-black/80 px-1 py-0.5 rounded text-emerald-300 mt-1">Kakamega Canopy</span>
                    </div>
                  </div>
                </div>

                {/* Traceability Mockup card */}
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-450" />
                    <span>{t("Blockchain Backed Lab Certs", "Uthibitisho wa Teknolojia ya Kuzuia Udanganyifu")}</span>
                  </div>
                  <p className="text-xs text-stone-200 leading-relaxed">
                    {t(
                      "Our honey undergoes complete refractive humidity testing to guarantee moisture below 18%. Verify provenance using public distributed ledgers.",
                      "Asali yetu hufanyiwa vipimo vikali vya unyevu kuhakikisha inapungua asilimia 18, kwa viwango vya juu vya kimataifa."
                    )}
                  </p>
                  <div className="flex gap-2 text-[10px] font-mono text-amber-300 bg-amber-500/10 p-1.5 rounded border border-[#F4B400]/25">
                    <span>📃 HASH: 0xBe17..9E84</span>
                    <span className="ml-auto">✓ KEBS APPROVED APPROVED</span>
                  </div>
                </div>

                {/* Impact story */}
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-xs space-y-1">
                  <p className="text-[#F4B400] font-black uppercase text-[10px] tracking-wider">👩‍🌾 {t("SOCIALLY SUSTAINABLE & EMPOWERING", "KUSAIDIA JAMII YA WAFUGAJI")}</p>
                  <p className="text-gray-300">
                    {t(
                      "Every purchase supports collective women beekeepers in rural Baringo. We invest 10% of proceeds into eco-friendly Langstroth hive infrastructure kits.",
                      "Asilimia 10 ya gharama ya kila chupa huenda moja kwa moja katika kusaidia kikundi cha akina mama wafugaji Baringo kununua mizinga bora ya kisasa."
                    )}
                  </p>
                </div>

              </div>
            </div>

            <button 
              onClick={onBrowseMarketplace}
              className="w-full py-4 bg-[#FF8C00] hover:bg-white text-black text-xs font-black uppercase rounded-xl tracking-wider transition cursor-pointer"
            >
              {t("Explore Bulk Marketplace", "Agiza Asali Safi - Katalogi")}
            </button>
          </div>

        </div>
      </section>


      {/* 3. HOW IT WORKS – 3 STEP FLOW */}
      <section className="space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-950 font-display">
            {t("Direct API Payout Flow in 3 Steps", "Jinsi Inavyofanya Kazi kwa Hatua Rahisi")}
          </h2>
          <p className="text-gray-500 text-sm max-w-2xl mx-auto font-sans">
            {t(
              "Our network cuts expensive middlemen out of the equation completely, assuring global standards and rapid payments.",
              "Mfumo rasmi unaomaliza mawakala dhalimu ili kumpa mkulima faida kubwa moja kwa moja na mnunuzi kupata asali asilia."
            )}
          </p>
        </div>

        {/* Illustrated timeline with honeycomb connector styling */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Timeline Connector Graphic (Visible on MD screens and above) */}
          <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-1 bg-amber-200 -z-10" />

          {/* Step 1 */}
          <div className="bg-white border border-[#1A4D2E]/15 rounded-3xl p-6 text-center space-y-4 hover:shadow-md transition duration-200">
            <div className="w-12 h-12 bg-[#1A4D2E] text-[#F4B400] text-lg font-black rounded-full flex items-center justify-center mx-auto border border-[#F4B400]/40">
              1
            </div>
            <h4 className="text-base font-extrabold text-gray-900 font-display">{t("Record offline on field", "Rekodi Kazi Shambani")}</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              {t(
                "Farmers register their hives and log nectar extraction dates even in remote rural forests where there is zero cellular internet connectivity.",
                "Wafugaji hurekodi ukomavu wa asali na afya ya mizinga shambani bila kuhitaji bando au intaneti yoyote."
              )}
            </p>
            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-800 rounded text-[9px] font-mono border border-amber-200 uppercase font-black">
              <WifiOff className="w-3 h-3" />
              <span>Offline Protocol Ready</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white border border-[#1A4D2E]/15 rounded-3xl p-6 text-center space-y-4 hover:shadow-md transition duration-200">
            <div className="w-12 h-12 bg-[#F4B400] text-black text-lg font-black rounded-full flex items-center justify-center mx-auto border border-[#FF8C00]/40">
              2
            </div>
            <h4 className="text-base font-extrabold text-gray-900 font-display">{t("Auto-created Quality Certificate", "Pata Cheti cha Ubora")}</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              {t(
                "Once synchronized online at any local depot, a digital product profile is generated, accompanied by testing reports and certified KEBS provenance tags.",
                "Mazao yakifika kwenye kituo cha kukusanyia, mfumo hutengeneza lebo maalum ya asali yenye vipimo sahihi vya maabara."
              )}
            </p>
            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#1A4D2E]/10 text-[#1A4D2E] rounded text-[9px] font-mono border border-[#1A4D2E]/20 uppercase font-black">
              <Award className="w-3 h-3" />
              <span>KEBS Certified Export</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white border border-[#1A4D2E]/15 rounded-3xl p-6 text-center space-y-4 hover:shadow-md transition duration-200">
            <div className="w-12 h-12 bg-[#FF8C00] text-white text-lg font-black rounded-full flex items-center justify-center mx-auto border border-amber-600">
              3
            </div>
            <h4 className="text-base font-extrabold text-gray-900 font-display">{t("Instant payouts via M-Pesa", "Malipo ya Papo kwa hapo")}</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              {t(
                "International wholesale buyers purchase securely using bank cards. The smart ledger translates the currency and fires immediate payments in Kenyan Shillings.",
                "Wanunuzi wa kimataifa wakilipa kwa kadi au PayPal, mfumo hubadilisha fedha na kumlipa mkulima papo hapo kwenye M-Pesa."
              )}
            </p>
            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-800 rounded text-[9px] font-mono border border-emerald-200 uppercase font-black">
              <span>✓ Safaricom API Push</span>
            </div>
          </div>

        </div>
      </section>


      {/* 4. LIVE MARKETPLACE PREVIEW */}
      <section className="space-y-8 bg-amber-50/50 p-8 rounded-3xl border border-[#F4B400]/25">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-950 font-display">
              {t("Traceable Harvest Showcase", "Katalogi ya Asali Halisi yenye Wasifu")}
            </h2>
            <p className="text-xs text-gray-500 font-sans">
              {t("Hover or click a card to flip and review geographical honey coordinates & lab results.", "Gusa au weka kielekezi juu ya asali ili uone mkoa ilikovunwa na vipimo rasmi vya afya.")}
            </p>
          </div>
          
          <button 
            onClick={onBrowseMarketplace}
            className="px-5 py-2.5 bg-[#1A4D2E] text-white text-xs font-bold uppercase rounded-xl flex items-center gap-2 cursor-pointer border border-[#F4B400]/20 hover:bg-[#F4B400] hover:text-black"
          >
            <span>{t("Browse Full Catalog", "Fungua Duka Kamili")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Responsive grid of product card previews */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((prod) => {
            const isFlipped = flippedCardId === prod.id;
            return (
              <div 
                key={prod.id} 
                className="relative overflow-visible h-96 w-full cursor-pointer group"
                onClick={() => setFlippedCardId(isFlipped ? null : prod.id)}
                onMouseEnter={() => setFlippedCardId(prod.id)}
                onMouseLeave={() => setFlippedCardId(null)}
              >
                {/* Simulated flip logic wrapper using state and relative positioning */}
                <div className={`relative w-full h-full transition-all duration-300 rounded-2xl overflow-hidden border border-[#1A4D2E]/10 bg-white shadow-xs p-5 flex flex-col justify-between ${isFlipped ? 'border-[#F4B400] ring-1 ring-[#F4B400]/20' : ''}`}>
                  
                  {/* Front View */}
                  {!isFlipped ? (
                    <>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] uppercase font-mono bg-[#1A4D2E]/10 text-[#1A4D2E] px-2 py-0.5 rounded-lg border border-[#1A4D2E]/20 font-bold">
                          {prod.type}
                        </span>
                        <div className="flex items-center text-amber-550 font-bold text-xs">
                          <Star className="w-3.5 h-3.5 fill-current text-amber-500 mr-1" />
                          <span>{prod.rating}</span>
                        </div>
                      </div>

                      <div className="text-center py-4">
                        <span className="text-5xl block filter drop-shadow-sm mb-3">{prod.image}</span>
                        <h4 className="text-base font-extrabold text-[#2D2D2D] line-clamp-1">{prod.name}</h4>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1.5 px-2">{prod.description}</p>
                      </div>

                      <div className="border-t border-gray-100 pt-3.5 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">{t("Wholesale Price", "Bei ya Jumla")}</span>
                          <span className="text-lg font-black text-[#1A4D2E]">${prod.price}.00 <span className="text-xs font-normal text-gray-500">/ Kg</span></span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] bg-amber-50 text-[#F4B400] border border-[#F4B400]/30 px-2 py-1 rounded font-bold font-mono">
                            {prod.stock} Kgs left
                          </span>
                        </div>
                      </div>

                      <div className="bg-[#1A4D2E]/5 p-2 rounded-xl text-center text-[9px] font-semibold text-[#1A4D2E] uppercase tracking-wider group-hover:bg-[#F4B400]/20 transition">
                        🖲️ {t("TAP TO TRACE ORIGINAL APIARY", "GUSA KUPATA HISTORIA")}
                      </div>
                    </>
                  ) : (
                    // Back View (Provenance and testing parameters)
                    <div className="flex flex-col justify-between h-full bg-[#1A4D2E] text-white p-2 rounded-xl">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                          <span className="text-[9px] text-[#F4B400] font-black uppercase">📜 BATCH PROVENANCE REPORT</span>
                          <span className="text-[8px] bg-[#FF8C00] px-1.5 py-0.5 rounded text-white font-bold">CO-OP VERIFIED</span>
                        </div>
                        
                        <div className="space-y-2 text-[11px] font-mono text-stone-200">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Floral Source:</span>
                            <span className="text-white font-bold">{prod.flavorProfile}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Origin Region:</span>
                            <span className="text-white font-bold">
                              {prod.id === 'prod-acacia' ? "Baringo Ridge, KE" : prod.id === 'prod-kakamega' ? "Kakamega Forest Canopy, KE" : "Aberdares Range, KE"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Refractive Moisture:</span>
                            <span className="text-emerald-400 font-bold">17.2% (Grade A)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Harvest Date:</span>
                            <span className="text-white font-bold">May 20, 2026</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Trace Certificate:</span>
                            <span className="text-[#F4B400] font-bold underline text-[9px]">View block-hash</span>
                          </div>
                        </div>

                        <div className="bg-black/25 p-2.5 rounded border border-[#F4B400]/25 text-[10px]">
                          <p className="text-[#F4B400] font-black uppercase tracking-wider mb-1">👩‍🌾 PRODUCER PROFILE:</p>
                          <p className="text-gray-300 leading-relaxed text-[9px] italic">
                            {prod.id === 'prod-acacia' 
                              ? "Assembled by the Kabarnet Beekeeping Cooperative of Baringo. Supports rural households directly."
                              : "Harvested by the equatorial rain canopy keepers in ancient high-altitude Kakamega, saving forestry habitats."}
                          </p>
                        </div>
                      </div>

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onBrowseMarketplace();
                        }}
                        className="w-full py-2 bg-[#F4B400] hover:bg-white text-[#1A4D2E] font-black text-[10px] uppercase rounded-lg tracking-wider block transition"
                      >
                        {t("Add this batch to basket", "Weka kwenye Kikapu ya Manunuzi")}
                      </button>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      </section>


      {/* 5. IMPACT DASHBOARD / MARY TESTIMONIAL */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#2D2D2D]/95 text-white p-8 md:p-12 rounded-3xl border border-white/10 relative overflow-hidden">
        
        {/* Subtle background graphics */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F4B400]/5 rounded-full filter blur-xl pointer-events-none" />

        <div className="lg:col-span-4 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-[#F4B400]/40 text-[#F4B400] rounded-full text-xs font-bold uppercase">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
            <span>{t("Ecosystem Stewardship", "Heshima kwa Wafugaji")}</span>
          </div>
          <h2 className="text-2xl md:text-3.5xl font-black font-display text-white">
            {t("Direct Social Impact Story", "Ukweli wa Matokeo Yetu")}
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed font-sans">
            {t(
              "By removing greedy middle brokers who pay farmers tiny crumbs, HiveGlobal provides the full value straight to family beekeepers on M-Pesa. This creates sustainable capital to fund local schools, health care, and farm updates.",
              "Kupitia kumuondoa dalali dhalimu ambaye mwanzo alikuwa anadhulumu mfugaji kule vijijini, mradi huu umewezesha akina mama na vijana kujiendeleza kimaisha."
            )}
          </p>
        </div>

        <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 relative">
          <span className="text-6xl text-[#F4B400] absolute -top-4 -left-1 font-serif select-none">“</span>
          
          <div className="space-y-6 relative z-10 pl-6">
            <p className="text-base md:text-lg italic leading-relaxed text-stone-100">
              {t(
                "Before HiveGlobal, local predatory brokers took over 60% of our yields, claiming high transport expenses and export blockages. With this system, I log my harvest on my simple mobile device without network, transport it to the local depot, and sell directly to Japan. Now, my children have high school fees fully covered, and I have added three fresh Langstroth boxes to my apiary.",
                "Kabla ya HiveGlobal, udalali dhalimu ulichukua zaidi ya asilimia 60 ya mapato yetu kwa kisingizio cha usafiri na gharama kubwa ya biashara. Sasa, narekodi asali yangu kupitia USSD bila bando, na kufanya biashara moja kwa moja hadi nchi ya Japan. Watoto wangu wanasoma na nimenunua mizinga mipya mitatu!"
              )}
            </p>

            <div className="flex items-center gap-4 border-t border-white/10 pt-4">
              <div className="w-12 h-12 rounded-full bg-[#F4B400] text-black font-black flex items-center justify-center text-sm border-2 border-[#1A4D2E] shrink-0">
                M.K
              </div>
              <div className="text-left text-xs font-sans">
                <h5 className="font-extrabold text-white text-sm">Mary Kabarnet</h5>
                <p className="text-[#F4B400] font-mono uppercase tracking-tight text-[11px]">{t("Cooperative Lead, Kabarnet Apiary", "Mwenyekiti, Ushirika wa Kabarnet Baringo")}</p>
                <p className="text-gray-400 font-mono text-[10px]">📍 BARINGO COUNTY, RIFT VALLEY REGION</p>
              </div>
            </div>
          </div>
        </div>

      </section>


      {/* 6. USSD MOBILE FALLBACK INTERACTIVE EMULATOR */}
      <section className="bg-emerald-950 text-white rounded-3xl p-8 border-2 border-emerald-500/30 shadow-lg relative overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Absolute indicators */}
        <div className="absolute top-3 right-4 font-mono text-[9px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded">
          USSD GATEWAY ACTIVE: *384*56#
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F4B400]/20 border border-[#F4B400]/30 text-[#F4B400] rounded-full text-xs font-mono font-bold">
            <Smartphone className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>{t("Interactive Offline Sandbox Emulator", "Sanduku la Kujaribu Mfumo wa USSD")}</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black font-display text-white">
            {t("Log harvests over standard USSD protocol", "Rekodi Mazao Hata Bila Simu ya Kisasa")}
          </h2>
          <p className="text-xs text-gray-300 leading-relaxed font-sans">
            {t(
              "For farmers in rural forests with basic 'kabambe' mobile handsets, standard cellular internet is unavailable. HiveGlobal's full USSD gateway integration allows on-site registry and yield inputs directly into Safaricom towers. Dial our system below to run the live simulation!",
              "Kwa wakulima wanaoishi maeneo ya ndani ya misitu ambapo hakuna smartphone au intaneti, mfumo unapatikana kupitia namba ya kawaida ya simu ya kisununu au 'kabambe'. Jaribu kupiga namba hapo pembeni ili uone jinsi inavyofanya kazi."
            )}
          </p>

          <div className="pt-2 flex flex-wrap gap-3 font-mono text-[11px]">
            <div className="bg-emerald-900 border border-emerald-700 p-2.5 rounded-lg">
              🎯 {t("Dial Command:", "Piga Namba:")} <span className="font-bold text-[#F4B400] text-sm">*384*56#</span>
            </div>
            <button 
              onClick={() => {
                setShowUssdEmulator(true);
                setUssdStep('dial');
                setUssdInput("");
                setUssdLogs([]);
              }}
              className="px-4 py-2 bg-[#F4B400] hover:bg-white text-[#1A4D2E] font-black uppercase rounded-lg text-[10px] tracking-wider transition cursor-pointer"
            >
              🚀 {t("RELAUNCH EMULATOR PANEL", "CHOMA UPYA KIIGIZAJI")}
            </button>
          </div>
        </div>

        {/* The Phone USSD Screen Panel */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-[280px] bg-black border-4 border-gray-700 rounded-3xl p-4 shadow-2xl relative">
            <div className="w-20 h-3 bg-gray-800 rounded-full mx-auto mb-3" />
            
            {/* Liquid-crystal look console overlay */}
            <div className="bg-[#181814] border border-emerald-500/20 rounded-xl p-4 h-64 flex flex-col justify-between font-mono text-xs text-emerald-400">
              
              <div className="overflow-y-auto max-h-[170px] space-y-1.5 scrollbar-thin text-[10px]">
                {ussdLogs.map((log, i) => (
                  <p key={i} className="text-gray-500">{log}</p>
                ))}

                {ussdNotification && (
                  <p className="text-red-400 font-bold animate-pulse">⚡ {ussdNotification}</p>
                )}

                {/* Simulated USSD Prompts */}
                {ussdStep === 'dial' && (
                  <div className="space-y-1 text-[#F4B400]">
                    <p className="font-bold">*** Safaricom Network ***</p>
                    <p>Enter USSD dial code for HiveGlobal register:</p>
                    <p className="text-emerald-350">Tip: Type <span className="font-bold">*384*56#</span> below</p>
                  </div>
                )}

                {ussdStep === 'menu' && (
                  <div className="space-y-1 text-emerald-400 font-bold">
                    <p className="text-[#F4B400]">--- HiveGlobal Mobile ---</p>
                    <p>1) Register New Hive Box</p>
                    <p>2) Log Honey Harvest (Kgs)</p>
                    <p>3) Check Wallet Balance (KES)</p>
                  </div>
                )}

                {ussdStep === 'register' && (
                  <div className="space-y-1 text-emerald-450">
                    <p>--- Box Registration ---</p>
                    <p>Enter Name/Location of New Hive:</p>
                    <p className="text-gray-500">e.g., Block-3-Cedar</p>
                  </div>
                )}

                {ussdStep === 'harvest' && (
                  <div className="space-y-1 text-emerald-450">
                    <p>--- Log Nectar Yields ---</p>
                    <p>Choose Hive-1 Kakamega.</p>
                    <p>Enter Kg gathered (1 - 100):</p>
                  </div>
                )}

                {ussdStep === 'balance' && (
                  <div className="space-y-1 text-[#F4B400] font-sans">
                    <p className="font-mono text-[9px]">--- HiveGlobal Wallet ---</p>
                    <p>Acc No: K-Coop-01824</p>
                    <p>Pending Payout: <span className="text-emerald-400">KES 48,250</span></p>
                    <p className="text-gray-400">Paid out weekly to Safaricom phone directly.</p>
                    <p className="text-xs text-white">Press 0 to exit USSD</p>
                  </div>
                )}

                {ussdStep === 'success' && (
                  <div className="space-y-2 text-center text-emerald-400 py-4 font-sans font-bold">
                    <p className="text-xl">✓ Logged!</p>
                    <p className="text-[10px] leading-relaxed text-gray-400">
                      Synchronized via standard satellite ping telemetry protocol. Status synced successfully!
                    </p>
                    <button 
                      onClick={() => setUssdStep('menu')}
                      className="px-2 py-1 bg-emerald-800 text-white hover:bg-emerald-600 rounded text-[9px] uppercase font-mono mt-1"
                    >
                      Return to Menu
                    </button>
                  </div>
                )}
              </div>

              {ussdStep !== 'success' && (
                <form onSubmit={handleUssdAction} className="border-t border-emerald-500/10 pt-2 flex items-center gap-1.5 mt-2">
                  <span className="text-emerald-500 animate-pulse font-mono text-[11px] font-bold">&gt;</span>
                  <input 
                    type="text" 
                    value={ussdInput}
                    onChange={(e) => setUssdInput(e.target.value)}
                    placeholder={ussdStep === 'dial' ? "*384*56#" : "Type item..."}
                    className="flex-1 bg-transparent border-none text-emerald-400 placeholder-emerald-800 text-xs py-1 px-1.5 focus:outline-none font-mono focus:ring-0"
                    autoFocus
                  />
                  <button 
                    type="submit" 
                    className="px-2 py-1 bg-emerald-800 hover:bg-[#F4B400] text-white hover:text-black rounded text-[9px] font-black uppercase font-mono cursor-pointer"
                  >
                    Send
                  </button>
                </form>
              )}

            </div>

            <div className="mt-4 flex justify-between items-center text-[10px] text-gray-500 font-mono">
              <span>Safaricom Mobile</span>
              <span>📶 4G Offline</span>
            </div>
          </div>
        </div>

      </section>

    </div>
  );
}
