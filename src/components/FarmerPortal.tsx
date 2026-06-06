/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  PlusCircle, Activity, Thermometer, Droplets, Calendar,
  Sparkles, Layers, Bot, Loader2, ClipboardList, TrendingUp, CheckCircle,
  Plus, Trash2, HeartPulse, User, MapPin, Eye, ArrowLeftRight
} from "lucide-react";
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, BarChart, Bar, AreaChart, Area 
} from "recharts";
import { Hive, Inspection, Harvest, Order, Expense, BlogPost, Product } from "../types";
import { BookOpen, Edit3, MessageCircle, ThumbsUp, Check, Search, Filter, ShieldCheck, Truck, Receipt, CheckCircle2, ChevronRight, Mail, Phone, Sparkles as SparklesIcon } from "lucide-react";

interface FarmerPortalProps {
  hives: Hive[];
  onAddHive: (h: Hive) => void;
  onDeleteHive: (id: string) => void;
  inspections: Inspection[];
  onAddInspection: (i: Inspection) => void;
  harvests: Harvest[];
  onAddHarvest: (h: Harvest) => void;
  expenses?: Expense[];
  onAddExpense?: (e: Expense) => void;
  orders: Order[];
  onUpdateOrderStatus: (ordId: string, status: Order['status']) => void;
  products?: Product[];
  onAddOrder?: (o: Order) => void;
  lang?: 'EN' | 'SW';
  blogPosts: BlogPost[];
  onAddBlogPost: (p: BlogPost) => void;
  onUpdateBlogPost: (p: BlogPost) => void;
  onDeleteBlogPost: (id: string) => void;
  onAddComment: (postId: string, comment: any) => void;
  onLikePost: (postId: string) => void;
}

const COUNTY_WEATHER_COORDINATES: Record<string, { lat: number; lon: number; name: string; nameSw: string }> = {
  Baringo: { lat: 0.48, lon: 35.97, name: "Baringo County", nameSw: "Kaunti ya Baringo" },
  Kitui: { lat: -1.37, lon: 38.01, name: "Kitui County", nameSw: "Kaunti ya Kitui" },
  Kakamega: { lat: 0.28, lon: 34.75, name: "Kakamega Forest", nameSw: "Msitu wa Kakamega" },
  Nyeri: { lat: -0.42, lon: 36.95, name: "Nyeri Apiary", nameSw: "Kituo cha Nyeri" },
  Nakuru: { lat: -0.30, lon: 36.07, name: "Nakuru Plains", nameSw: "Tambarare za Nakuru" },
};

export function FarmerPortal({ 
  hives, onAddHive, onDeleteHive, 
  inspections, onAddInspection, 
  harvests, onAddHarvest, 
  expenses = [], onAddExpense,
  orders, onUpdateOrderStatus,
  products = [],
  onAddOrder,
  lang = 'EN',
  blogPosts = [],
  onAddBlogPost,
  onUpdateBlogPost,
  onDeleteBlogPost,
  onAddComment,
  onLikePost
}: FarmerPortalProps) {
  // Navigation tabs of farmer manager
  const [activeSubTab, setActiveSubTab] = useState<'hives' | 'inspections' | 'harvests' | 'expenses' | 'orders' | 'sales' | 'analytics' | 'blog'>('hives');

  // Customer Orders Dashboard Active filtering states
  const [orderSearchText, setOrderSearchText] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<'All' | 'Pending' | 'Shipped' | 'Delivered' | 'Paid'>('All');
  const [showManualOrderForm, setShowManualOrderForm] = useState(false);
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<Order | null>(null);

  // Manual Offline Order Booking Form state
  const [manualCustomerName, setManualCustomerName] = useState("");
  const [manualCustomerEmail, setManualCustomerEmail] = useState("");
  const [manualCustomerPhone, setManualCustomerPhone] = useState("");
  const [manualShippingAddress, setManualShippingAddress] = useState("");
  const [manualProductId, setManualProductId] = useState("");
  const [manualQuantity, setManualQuantity] = useState(1);
  const [manualGateway, setManualGateway] = useState<'cash' | 'mpesa' | 'bank'>('cash');
  const [manualFormError, setManualFormError] = useState("");

  // Persistent courier ship trackings and simulated SMS dispatch notes
  const [orderTrackings, setOrderTrackings] = useState<Record<string, { carrier: string; trackingCode: string; logs: string[] }>>(() => {
    const saved = localStorage.getItem("beehive_orders_tracking");
    return saved ? JSON.parse(saved) : {};
  });

  const [shippingCarrierInput, setShippingCarrierInput] = useState("");
  const [trackingCodeInput, setTrackingCodeInput] = useState("");
  const [visualToastMessage, setVisualToastMessage] = useState("");

  useEffect(() => {
    localStorage.setItem("beehive_orders_tracking", JSON.stringify(orderTrackings));
  }, [orderTrackings]);

  // Dispatch notification action
  const handleDispatchNotification = (orderId: string, type: 'SMS' | 'Email') => {
    const matchedOrder = orders.find(o => o.id === orderId);
    if (!matchedOrder) return;

    const timestamp = new Date().toLocaleTimeString();
    const alertMsg = type === 'SMS' 
      ? `[SYSTEM LOG - ${timestamp}] Dispatched SMS dispatch alert via Safaricom SMS Gateway to ${matchedOrder.customerPhone || "+254 700 000000"}...`
      : `[SYSTEM LOG - ${timestamp}] Dispatched dispatch receipt and DHL billing slips to customer inbox: ${matchedOrder.customerEmail}...`;

    setOrderTrackings(prev => {
      const existing = prev[orderId] || { carrier: "Unassigned Transit", trackingCode: "PENDING-LOG", logs: [] };
      return {
        ...prev,
        [orderId]: {
          ...existing,
          logs: [...existing.logs, alertMsg]
        }
      };
    });

    setVisualToastMessage(`${type} notification successfully broadcast to ${matchedOrder.customerName}!`);
    setTimeout(() => setVisualToastMessage(""), 4000);
  };

  const handleUpdateTransitDelivery = (orderId: string) => {
    if (!shippingCarrierInput || !trackingCodeInput) return;

    const timestamp = new Date().toLocaleTimeString();
    const carrierLog = `[DISPATCH - ${timestamp}] Loaded into container transit with carrier: ${shippingCarrierInput}. Air Waybill Tracking Assigned: LGS-${trackingCodeInput}-KE.`;

    setOrderTrackings(prev => {
      const existing = prev[orderId] || { carrier: "", trackingCode: "", logs: [] };
      return {
        ...prev,
        [orderId]: {
          carrier: shippingCarrierInput,
          trackingCode: trackingCodeInput,
          logs: [...existing.logs, carrierLog]
        }
      };
    });

    setVisualToastMessage("Logistics details synchronized successfully!");
    setTimeout(() => setVisualToastMessage(""), 4000);
    setShippingCarrierInput("");
    setTrackingCodeInput("");
  };

  const handleBookingManualOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCustomerName.trim()) {
      setManualFormError("Customer Name is required.");
      return;
    }
    if (!manualProductId) {
      setManualFormError("Please select a physical bee product.");
      return;
    }
    const matchedProd = products.find(p => p.id === manualProductId);
    if (!matchedProd) {
      setManualFormError("Product not found inside active inventory.");
      return;
    }
    if (manualQuantity > matchedProd.stock) {
      setManualFormError(`Insufficient stock! Only ${matchedProd.stock} items remaining in honeycomb pantry.`);
      return;
    }

    setManualFormError("");
    const orderId = "ord-man-" + Math.floor(1000 + Math.random() * 9000);
    const subtotal = matchedProd.price * manualQuantity;

    const manualOrder: Order = {
      id: orderId,
      customerName: manualCustomerName,
      customerEmail: manualCustomerEmail || "offline-pantry-buyer@hiveglobal.co.ke",
      customerPhone: manualCustomerPhone || "+254 712 000000",
      items: [{
        productId: matchedProd.id,
        productName: matchedProd.name,
        quantity: manualQuantity,
        price: matchedProd.price
      }],
      total: Number((subtotal + 4.99).toFixed(2)),
      status: manualGateway === 'cash' ? 'Paid' : 'Pending',
      date: new Date().toISOString().split("T")[0],
      shippingAddress: manualShippingAddress || "Over-The-Counter walk-in, Kenya Apiary Headquarters"
    };

    if (onAddOrder) {
      onAddOrder(manualOrder);
    }

    // Set initial tracking log
    const timestamp = new Date().toLocaleTimeString();
    setOrderTrackings(prev => ({
      ...prev,
      [orderId]: {
        carrier: "Over The Counter Sales Dept",
        trackingCode: "OTC-LOCAL-PASS",
        logs: [`[SYSTEM - ${timestamp}] Walk-in OTC manual order generated via HiveGlobal Farmer App panel. Gateway: ${manualGateway.toUpperCase()}.`]
      }
    }));

    setManualCustomerName("");
    setManualCustomerEmail("");
    setManualCustomerPhone("");
    setManualShippingAddress("");
    setManualProductId("");
    setManualQuantity(1);
    setManualGateway('cash');
    setShowManualOrderForm(false);
    setVisualToastMessage(`OTC Order ${orderId} registered successfully!`);
    setTimeout(() => setVisualToastMessage(""), 4000);
  };

  // Blog management states
  const [blogShowForm, setBlogShowForm] = useState(false);
  const [blogEditingId, setBlogEditingId] = useState<string | null>(null);
  const [blogTitle, setBlogTitle] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogCategory, setBlogCategory] = useState<'Beekeeping' | 'Honey Harvests' | 'Bee Health'>('Beekeeping');
  const [blogStatus, setBlogStatus] = useState<'Draft' | 'Published'>('Published');
  const [blogImageUrl, setBlogImageUrl] = useState("");
  const [blogSearch, setBlogSearch] = useState("");
  const [blogFilterCategory, setBlogFilterCategory] = useState<string>("All");

  // Weather state
  const [weatherCounty, setWeatherCounty] = useState<string>(() => {
    return localStorage.getItem("kbc_weather_county") || "Baringo";
  });
  const [weatherForecast, setWeatherForecast] = useState<any[]>([]);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);
  const [weatherSource, setWeatherSource] = useState<'live' | 'cached'>('cached');
  const [isWeatherExpanded, setIsWeatherExpanded] = useState<boolean>(true);

  // Return realistic fallback profiles in case of network isolation
  const getOfflineForecast = (county: string) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const nextDayStr = new Date(Date.now() + 172800000).toISOString().split("T")[0];

    const profiles: Record<string, any[]> = {
      Baringo: [
        { date: todayStr, tempMax: 30.8, tempMin: 18.5, rainProb: 15, weatherCode: 1, wind: 11 },
        { date: tomorrowStr, tempMax: 31.4, tempMin: 19.0, rainProb: 8, weatherCode: 0, wind: 8 },
        { date: nextDayStr, tempMax: 29.5, tempMin: 17.8, rainProb: 40, weatherCode: 2, wind: 12 }
      ],
      Kitui: [
        { date: todayStr, tempMax: 27.8, tempMin: 16.9, rainProb: 20, weatherCode: 2, wind: 14 },
        { date: tomorrowStr, tempMax: 28.5, tempMin: 17.2, rainProb: 10, weatherCode: 1, wind: 10 },
        { date: nextDayStr, tempMax: 28.0, tempMin: 16.5, rainProb: 5, weatherCode: 0, wind: 12 }
      ],
      Kakamega: [
        { date: todayStr, tempMax: 25.5, tempMin: 14.8, rainProb: 70, weatherCode: 61, wind: 15 },
        { date: tomorrowStr, tempMax: 24.8, tempMin: 14.1, rainProb: 85, weatherCode: 80, wind: 18 },
        { date: nextDayStr, tempMax: 26.1, tempMin: 14.5, rainProb: 50, weatherCode: 3, wind: 11 }
      ],
      Nyeri: [
        { date: todayStr, tempMax: 22.4, tempMin: 11.8, rainProb: 35, weatherCode: 3, wind: 16 },
        { date: tomorrowStr, tempMax: 21.9, tempMin: 11.2, rainProb: 65, weatherCode: 61, wind: 20 },
        { date: nextDayStr, tempMax: 23.5, tempMin: 12.0, rainProb: 25, weatherCode: 2, wind: 13 }
      ],
      Nakuru: [
        { date: todayStr, tempMax: 24.9, tempMin: 13.5, rainProb: 25, weatherCode: 2, wind: 12 },
        { date: tomorrowStr, tempMax: 25.4, tempMin: 13.0, rainProb: 30, weatherCode: 3, wind: 14 },
        { date: nextDayStr, tempMax: 26.0, tempMin: 13.2, rainProb: 15, weatherCode: 1, wind: 9 }
      ]
    };

    return profiles[county] || profiles["Baringo"];
  };

  const getWeatherIcon = (code: number) => {
    if (code === 0) return "☀️";
    if (code >= 1 && code <= 3) return "⛅";
    if (code === 45 || code === 48) return "🌫️";
    if (code >= 51 && code <= 55) return "🌦️";
    if (code >= 61 && code <= 65) return "🌧️";
    if (code >= 80 && code <= 82) return "🌦️";
    if (code >= 95) return "⛈️";
    return "⛅";
  };

  const getWeatherDesc = (code: number) => {
    if (code === 0) return t("Sunny Clear Day", "Siku ya Jua Kali");
    if (code >= 1 && code <= 2) return t("Partly Cloudy", "Mawingu Kiasi");
    if (code === 3) return t("Cloudy Overcast", "Mawingu Mengi");
    if (code === 45 || code === 48) return t("Foggy Mist", "Ukungu");
    if (code >= 51 && code <= 55) return t("Light Drizzle", "Mvua Rafu");
    if (code >= 61 && code <= 65) return t("Moderate Rain", "Mvua ya Wastani");
    if (code >= 80 && code <= 82) return t("Rain Showers", "Mawimbi ya Mvua");
    if (code >= 95) return t("Severe Thunderstorms", "Mvua ya Radi");
    return t("Mild Weather", "Hewa ya Wastani");
  };

  const getAdvisory = (tempMax: number, rainProb: number, wind: number) => {
    if (rainProb >= 50) {
      return {
        status: "danger",
        text: t("⚠️ Warning: High rain probability. Postpone inspections, moist environments can chill open beehive larvae and agitate queens.", 
                "⚠️ Notisi: Uwezekano mkubwa wa mvua. Hairisha ukaguzi ili kuepuka nyuki kuwa wakali au kuharibu mabuu kwa baridi."),
        color: "bg-red-50 text-red-900 border-red-200"
      };
    }
    if (tempMax < 21) {
      return {
        status: "warning",
        text: t("⚠️ Cool Temp: Below 21°C. Keep inspection duration ultra-short to safeguard the high-altitude brood climate.",
                "⚠️ Tahadhari: Kipupwe cha chini ya 21°C. Kagua haraka mizinga ili usitoe joto muhimu kwa kizazi chenye ukuzi."),
        color: "bg-amber-50 text-amber-950 border-amber-200"
      };
    }
    if (wind > 18) {
      return {
        status: "warning",
        text: t("💨 Mild Gusts: Moderate wind speed. Use honey bee smoker at hive entrance to pacify guard bees before taking off supers.",
                "💨 Tahadhari: Upepo wa wastani. Tumia moshi mwingi zaidi kwenye lango kuzuia nyuki mlinzi kuanza kushambulia."),
        color: "bg-amber-50 text-amber-950 border-amber-200"
      };
    }
    return {
      status: "success",
      text: t("💚 Great Conditions: Warm, low-risk and sunny weather. Ideal window to open lids, inspect combs, or proceed with bulk harvest!",
              "💚 Hali Safi: Joto zuri, hakuna upepo wala mvua. Kipindi maridhawa kabisa kufanya ukaguzi wa kila siku au kuvuna asali!"),
      color: "bg-emerald-50 text-emerald-900 border-emerald-250"
    };
  };

  // Weather query sync
  useEffect(() => {
    localStorage.setItem("kbc_weather_county", weatherCounty);
    const coords = COUNTY_WEATHER_COORDINATES[weatherCounty] || COUNTY_WEATHER_COORDINATES["Baringo"];
    let isMounted = true;

    const fetchWeather = async () => {
      setWeatherLoading(true);
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode,windspeed_10m_max&timezone=Africa/Nairobi`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Weather API feedback not satisfactory");
        const data = await res.json();
        
        if (data && data.daily && isMounted) {
          const days = [];
          for (let i = 0; i < 3; i++) {
            days.push({
              date: data.daily.time[i],
              tempMax: data.daily.temperature_2m_max[i],
              tempMin: data.daily.temperature_2m_min[i],
              rainProb: data.daily.precipitation_probability_max[i] ?? 0,
              weatherCode: data.daily.weathercode[i],
              wind: data.daily.windspeed_10m_max[i] ?? 10,
            });
          }
          setWeatherForecast(days);
          setWeatherSource('live');
        }
      } catch (err) {
        console.warn("Weather live service not reachable, fallback to cached statistics", err);
        if (isMounted) {
          setWeatherForecast(getOfflineForecast(weatherCounty));
          setWeatherSource('cached');
        }
      } finally {
        if (isMounted) {
          setWeatherLoading(false);
        }
      }
    };

    fetchWeather();

    return () => {
      isMounted = false;
    };
  }, [weatherCounty]);

  // Load sales buyback requests from localStorage (Kenya Bee Company platform orders)
  const [buybackRequests, setBuybackRequests] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("kbc_buyback_requests");
      return saved ? JSON.parse(saved) : [
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
    } catch (e) {
      return [];
    }
  });

  // Automatically keep local requests synced with localstorage changes
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
    handleSync();
    window.addEventListener("storage", handleSync);
    const interval = setInterval(handleSync, 2000);
    return () => {
      window.removeEventListener("storage", handleSync);
      clearInterval(interval);
    };
  }, [activeSubTab]);

  const handleUpdateBuybackStatus = (id: string, newStatus: any) => {
    const updated = buybackRequests.map(r => r.id === id ? { ...r, status: newStatus } : r);
    setBuybackRequests(updated);
    localStorage.setItem("kbc_buyback_requests", JSON.stringify(updated));
  };

  const handleDeleteBuybackRequest = (id: string) => {
    const updated = buybackRequests.filter(r => r.id !== id);
    setBuybackRequests(updated);
    localStorage.setItem("kbc_buyback_requests", JSON.stringify(updated));
  };
  
  // Selected hive for details/sub-actions
  const [selectedHiveId, setSelectedHiveId] = useState<string>(hives[0]?.id || "");
  const selectedHive = hives.find(h => h.id === selectedHiveId);

  // New Hive form inputs
  const [showAddHive, setShowAddHive] = useState(false);
  const [newHiveName, setNewHiveName] = useState("");
  const [newHiveLocation, setNewHiveLocation] = useState("");
  const [newHiveType, setNewHiveType] = useState<Hive['type']>("Langstroth");
  const [newHiveBreed, setNewHiveBreed] = useState("Italian ligustica");
  const [newHiveNotes, setNewHiveNotes] = useState("");

  // New Inspection form inputs
  const [newObs, setNewObs] = useState("");
  const [newActionTaken, setNewActionTaken] = useState("");
  const [newTemp, setNewTemp] = useState(34);
  const [newHumidity, setNewHumidity] = useState(55);
  const [newHealth, setNewHealth] = useState(85);
  const [newStatus, setNewStatus] = useState<string>("Healthy");
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [smartAdvice, setSmartAdvice] = useState("");

  // New Harvest form inputs
  const [showHarvestForm, setShowHarvestForm] = useState(false);
  const [harvestAmount, setHarvestAmount] = useState<number>(15);
  const [harvestHoneyType, setHarvestHoneyType] = useState<Harvest['honeyType']>("Wildflower");
  const [harvestMoisture, setHarvestMoisture] = useState<number>(17.5);
  const [harvestGrade, setHarvestGrade] = useState<Harvest['grade']>("Raw Unfiltered");
  const [harvestNotes, setHarvestNotes] = useState("");

  // New Expense form inputs
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState<number>(0);
  const [newExpenseCategory, setNewExpenseCategory] = useState<Expense['category']>("Sugar/Feed");
  const [newExpenseNotes, setNewExpenseNotes] = useState("");

  const t = (en: string, sw: string) => {
    return lang === 'SW' ? sw : en;
  };

  // Analytics computations
  const getAnalyticsData = () => {
    const result = [];
    const now = new Date();
    const baseProjections = [18.5, 22.0, 15.0, 26.5, 30.0, 31.5];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const yrMonth = `${y}-${String(m + 1).padStart(2, '0')}`;
      
      const monNameEn = d.toLocaleString('en-US', { month: 'short' });
      const monNameSw = [
        "Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ago", "Sep", "Okt", "Nov", "Dis"
      ][m];
      
      const monthlyHarvests = harvests.filter(h => h.date && h.date.startsWith(yrMonth));
      
      const honeyAmount = monthlyHarvests
        .filter(h => h.yieldType === 'Honey')
        .reduce((sum, h) => sum + h.amountKg, 0);
        
      const secondaryAmount = monthlyHarvests
        .filter(h => h.yieldType !== 'Honey')
        .reduce((sum, h) => sum + h.amountKg, 0);
        
      const honeyRecords = monthlyHarvests.filter(h => h.yieldType === 'Honey');
      const avgMoisture = honeyRecords.length > 0
        ? Number((honeyRecords.reduce((sum, h) => sum + (h.moisturePercent || 17.2), 0) / honeyRecords.length).toFixed(1))
        : 0;

      result.push({
        monthKey: yrMonth,
        name: lang === 'SW' ? `${monNameSw} ${y}` : `${monNameEn} ${y}`,
        Honey: Number(honeyAmount.toFixed(1)),
        Beeswax: Number(secondaryAmount.toFixed(1)),
        moisture: avgMoisture,
        Projection: Number(baseProjections[5 - i].toFixed(1)),
      });
    }
    return result;
  };

  const last6MonthsHarvests = harvests.filter(h => {
    if (!h.date) return false;
    const dateObj = new Date(h.date);
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays <= 180;
  });

  const totalHoneyLast6Months = last6MonthsHarvests
    .filter(h => h.yieldType === 'Honey')
    .reduce((sum, h) => sum + h.amountKg, 0);

  const totalBeeswaxLast6Months = last6MonthsHarvests
    .filter(h => h.yieldType !== 'Honey')
    .reduce((sum, h) => sum + h.amountKg, 0);

  const avgMoistureLast6Months = (() => {
    const honeyOnly = last6MonthsHarvests.filter(h => h.yieldType === 'Honey');
    if (honeyOnly.length === 0) return 0;
    return Number((honeyOnly.reduce((sum, h) => sum + (h.moisturePercent || 17.2), 0) / honeyOnly.length).toFixed(1));
  })();

  const bestHiveName = (() => {
    const hiveYields: Record<string, number> = {};
    harvests.forEach(h => {
      hiveYields[h.hiveId] = (hiveYields[h.hiveId] || 0) + h.amountKg;
    });
    let bestHiveId = '';
    let maxYield = -1;
    Object.entries(hiveYields).forEach(([id, amt]) => {
      if (amt > maxYield) {
        maxYield = amt;
        bestHiveId = id;
      }
    });
    if (!bestHiveId) return lang === 'SW' ? "Hakuna Data" : "No Data";
    const found = hives.find(h => h.id === bestHiveId);
    return found ? `${found.name} (${maxYield.toFixed(1)} Kg)` : (lang === 'SW' ? "Mzinga Ulioondolewa" : "Retired Box");
  })();

  const buybackRevenueValuation = totalHoneyLast6Months * 1280;

  const handleSaveBlogPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle.trim() || !blogContent.trim()) return;

    if (blogEditingId) {
      const original = blogPosts.find(p => p.id === blogEditingId);
      if (original) {
        const updatedPost: BlogPost = {
          ...original,
          title: blogTitle,
          content: blogContent,
          category: blogCategory,
          status: blogStatus,
          imageUrl: blogImageUrl || undefined,
          publishedAt: blogStatus === 'Published' 
            ? (original.publishedAt || new Date().toISOString().split('T')[0]) 
            : null,
          updatedAt: new Date().toISOString().split('T')[0],
        };
        onUpdateBlogPost(updatedPost);
      }
    } else {
      const newPost: BlogPost = {
        id: "blog-" + Date.now(),
        title: blogTitle,
        content: blogContent,
        author: lang === 'SW' ? "Mkulima Mtendaji" : "Executive Apiary Farmer",
        category: blogCategory,
        status: blogStatus,
        publishedAt: blogStatus === 'Published' ? new Date().toISOString().split('T')[0] : null,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        comments: [],
        likes: 0,
        imageUrl: blogImageUrl || undefined
      };
      onAddBlogPost(newPost);
    }
    handleResetBlogForm();
  };

  const handleEditBlogPostClick = (post: BlogPost) => {
    setBlogEditingId(post.id);
    setBlogTitle(post.title);
    setBlogContent(post.content);
    setBlogCategory(post.category);
    setBlogStatus(post.status);
    setBlogImageUrl(post.imageUrl || "");
    setBlogShowForm(true);
  };

  const handleResetBlogForm = () => {
    setBlogEditingId(null);
    setBlogTitle("");
    setBlogContent("");
    setBlogCategory("Beekeeping");
    setBlogStatus("Published");
    setBlogImageUrl("");
    setBlogShowForm(false);
  };

  const handleCreateHive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHiveName.trim()) return;

    const newHive: Hive = {
      id: "hive-" + Date.now(),
      name: newHiveName,
      location: newHiveLocation || "Apiary East Corner",
      type: newHiveType,
      healthScore: 85,
      status: "Healthy",
      queenStatus: "Present & Laying",
      temp: 34.0,
      humidity: 55,
      breed: newHiveBreed,
      notes: newHiveNotes,
      createdAt: new Date().toISOString().split("T")[0]
    };

    onAddHive(newHive);
    setSelectedHiveId(newHive.id);
    setNewHiveName("");
    setNewHiveLocation("");
    setNewHiveNotes("");
    setShowAddHive(false);
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseName.trim() || newExpenseAmount <= 0) return;

    const newExpense: Expense = {
      id: "exp-" + Date.now(),
      hiveId: selectedHiveId || "",
      category: newExpenseCategory,
      amountKes: newExpenseAmount,
      date: new Date().toISOString().split("T")[0],
      description: newExpenseName + (newExpenseNotes ? " - " + newExpenseNotes : "")
    };

    if (onAddExpense) {
      onAddExpense(newExpense);
    }
    setNewExpenseName("");
    setNewExpenseAmount(0);
    setNewExpenseNotes("");
    setShowAddExpense(false);
  };

  const handleAiDiagnosticPlan = async () => {
    if (!selectedHive) return;
    setInsightsLoading(true);
    setSmartAdvice("");

    try {
      const resp = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hiveName: selectedHive.name,
          breed: selectedHive.breed,
          healthScore: newHealth,
          status: newStatus,
          temp: newTemp,
          humidity: newHumidity,
          observations: newObs || "Regular scheduled apiary box sweep."
        })
      });

      if (!resp.ok) {
        throw new Error("Diagnostics API failed");
      }

      const data = await resp.json();
      setSmartAdvice(data.advice);
    } catch (err) {
      console.error(err);
      setSmartAdvice("Clogged pollen signals. Unable to reach Barnaby diagnostics server. Please ensure express server is active.");
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleCreateInspection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHiveId) return;

    const newInsp: Inspection = {
      id: "ins-" + Date.now(),
      hiveId: selectedHiveId,
      date: new Date().toISOString().split("T")[0],
      status: newStatus,
      healthScore: newHealth,
      temp: Number(newTemp),
      humidity: Number(newHumidity),
      observations: newObs || "Colony sweep complete.",
      actionTaken: newActionTaken || "No corrective chemical treatments required.",
      smartAdvice: smartAdvice || undefined
    };

    onAddInspection(newInsp);
    // Clear inputs
    setNewObs("");
    setNewActionTaken("");
    setSmartAdvice("");
  };

  const handleCreateHarvest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHiveId) return;

    const newHarvest: Harvest = {
      id: "harv-" + Date.now(),
      hiveId: selectedHiveId,
      date: new Date().toISOString().split("T")[0],
      amountKg: Number(harvestAmount),
      honeyType: harvestHoneyType,
      yieldType: "Honey",
      moisturePercent: Number(harvestMoisture),
      grade: harvestGrade,
      notes: harvestNotes
    };

    onAddHarvest(newHarvest);
    setHarvestNotes("");
    setShowHarvestForm(false);
  };

  // Stats aggregate helpers
  const totalHives = hives.length;
  const avgHealth = Math.round(hives.reduce((sum, h) => sum + h.healthScore, 0) / (totalHives || 1));
  const totalKg = Number(harvests.reduce((sum, h) => sum + h.amountKg, 0).toFixed(1));
  const pendingOrders = orders.filter(o => o.status === "Pending").length;
  const totalExpensesKsh = expenses.reduce((sum, exp) => sum + exp.amountKes, 0);

  return (
    <div className="space-y-6" id="farmer-portal">
      {/* 3-Day Inspection Weather Advisor Top Bar Banner */}
      <div className="bg-[#1A4D2E]/5 border border-amber-200/50 rounded-3xl p-4 md:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-250/20 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🌦️</span>
            <div>
              <h3 className="font-bold text-gray-950 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5 font-mono">
                {t("3-Day Weather Forecast & Inspection Planner", "Utabiri wa Hali ya Hewa wa Siku 3 na Upangaji")}
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">
                {t("Plan scheduled hive inspections based on temperature windows and rain probability.", 
                   "Panga ukaguzi wa mizinga yako kulingana na mabadiliko ya joto na uwezekano wa mvua.")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* County dropdown selection */}
            <label className="text-[10px] uppercase tracking-wider font-mono font-bold text-gray-400">
              {t("Apiary Site:", "Eneo la Mzinga:")}
            </label>
            <select
              value={weatherCounty}
              onChange={(e) => setWeatherCounty(e.target.value)}
              className="bg-white border border-amber-200 rounded-xl px-2.5 py-1 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer shadow-3xs hover:bg-amber-50 transition"
            >
              {Object.keys(COUNTY_WEATHER_COORDINATES).map((key) => (
                <option key={key} value={key}>
                  {lang === 'SW' ? COUNTY_WEATHER_COORDINATES[key].nameSw : COUNTY_WEATHER_COORDINATES[key].name}
                </option>
              ))}
            </select>

            {/* Minimize / Expand Toggle */}
            <button
              onClick={() => setIsWeatherExpanded(!isWeatherExpanded)}
              className="p-1 px-1.5 text-gray-400 hover:text-[#1A4D2E] transition rounded-lg hover:bg-white border border-stone-200 text-xs font-bold font-mono"
              title={isWeatherExpanded ? t("Minimize", "Funga") : t("Expand", "Fungua")}
            >
              {isWeatherExpanded ? "▲" : "▼"}
            </button>
          </div>
        </div>

        {isWeatherExpanded && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {weatherLoading ? (
              <div className="flex items-center justify-center py-6 gap-2">
                <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
                <span className="text-xs text-gray-400 font-semibold font-mono">{t("Fetching telemetry forecasts...", "Kupakua utabiri wa hewa...")}</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {weatherForecast.map((day, idx) => {
                    const dayLabelsEn = [t("Today", "Leo"), t("Tomorrow", "Kesho"), t("Day After", "Keshokutwa")];
                    const dateObj = new Date(day.date);
                    const formattedDate = dateObj.toLocaleDateString(lang === 'SW' ? 'sw-KE' : 'en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    });

                    // Determine beekeeping advisory specific to this day's weather parameters
                    const dayAdvisory = getAdvisory(day.tempMax, day.rainProb, day.wind);

                    // Border color depending on condition
                    let borderClass = "border-stone-150";
                    if (dayAdvisory.status === 'success') borderClass = "border-emerald-200/60 bg-emerald-500/[0.01]";
                    if (dayAdvisory.status === 'danger') borderClass = "border-red-200/60 bg-red-500/[0.01]";

                    return (
                      <div 
                        key={day.date} 
                        className={`bg-white border ${borderClass} rounded-2xl p-4 flex flex-col justify-between space-y-3.5 relative overflow-hidden transition shadow-3xs hover:border-amber-400/60`}
                      >
                        {/* Day indicator badge */}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-gray-400 block max-w-max">
                              {dayLabelsEn[idx] || formattedDate}
                            </span>
                            <span className="text-[11px] font-semibold text-gray-500 mt-0.5 block">
                              {formattedDate}
                            </span>
                          </div>
                          
                          <span className="text-3xl filter drop-shadow-sm select-none">
                            {getWeatherIcon(day.weatherCode)}
                          </span>
                        </div>

                        {/* Forecast Stats with Mini Bars */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-stone-700">
                            <span className="flex items-center gap-1.5 font-medium text-gray-500">
                              <Thermometer className="w-3.5 h-3.5 text-amber-605 shrink-0 animate-pulse" />
                              <span>{t("Temperature", "Joto")}</span>
                            </span>
                            <strong className="font-mono text-gray-900">
                              {day.tempMax.toFixed(1)}°C <span className="text-gray-400 font-normal text-[10px]">/ {day.tempMin.toFixed(1)}°C</span>
                            </strong>
                          </div>

                          <div className="flex items-center justify-between text-xs text-stone-700">
                            <span className="flex items-center gap-1.5 font-medium text-gray-500">
                              <Droplets className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              <span>{t("Rain Prob.", "Mvua")}</span>
                            </span>
                            <strong className="font-mono text-gray-900">
                              {day.rainProb}%
                            </strong>
                          </div>

                          <div className="flex items-center justify-between text-xs text-stone-700">
                            <span className="flex items-center gap-1.5 font-medium text-gray-500">
                              <span>💨</span>
                              <span>{t("Max Wind", "Upepo")}</span>
                            </span>
                            <strong className="font-mono text-gray-900">
                              {day.wind} km/h
                            </strong>
                          </div>

                          <div className="text-[11px] font-semibold text-gray-600 pt-1 border-t border-dashed border-stone-150 truncate">
                            {getWeatherDesc(day.weatherCode)}
                          </div>
                        </div>

                        {/* Suitability Chip inside the Day Card */}
                        <div className="pt-1">
                          <span className={`inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            dayAdvisory.status === 'success' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : dayAdvisory.status === 'danger' 
                              ? 'bg-red-50 text-red-700 border border-red-200' 
                              : 'bg-amber-100 text-amber-850'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              dayAdvisory.status === 'success' 
                                ? 'bg-emerald-500' 
                                : dayAdvisory.status === 'danger' 
                                ? 'bg-red-500' 
                                : 'bg-amber-500'
                            }`} />
                            <span>
                              {dayAdvisory.status === 'success' 
                                ? t("Excellent for Swarms", "Hali Maridhawa") 
                                : dayAdvisory.status === 'danger' 
                                ? t("Avoid Inspections", "Hatari: Usikague") 
                                : t("Caution Advised", "Tahadhari")}
                            </span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom intelligent combined advice banner */}
                {weatherForecast[0] && (
                  <div className={`p-3.5 rounded-2xl border flex items-start gap-3 transition min-h-[50px] ${
                    getAdvisory(weatherForecast[0].tempMax, weatherForecast[0].rainProb, weatherForecast[0].wind).color
                  }`}>
                    <span className="text-base select-none mt-0.5">ℹ️</span>
                    <div>
                      <strong className="text-[10px] uppercase font-mono font-bold tracking-wider block text-gray-400 mb-0.5">
                        {t("Barnaby AI — Apiary Flight Inspection Advice", "Ushauri wa Barnaby AI kulingana na Hali ya Hewa")}
                      </strong>
                      <p className="text-xs font-sans font-medium leading-relaxed">
                        {getAdvisory(weatherForecast[0].tempMax, weatherForecast[0].rainProb, weatherForecast[0].wind).text}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Telemetry signature */}
            <div className="flex items-center justify-between text-[9px] text-gray-400 font-mono">
              <span>
                {weatherSource === 'live' 
                  ? t("🛰️ Real-Time Telemetry: Live Open-Meteo Satellite Node active", "🛰️ Utabiri Halisi: Satelaiti ya Open-Meteo inaunganishwa") 
                  : t("🔋 Offline Mode: Using High-Accuracy Cached Forecasting Profiles", "🔋 Hali ya Nje ya Mtandao: Profaili ya Akiba ya Hali ya Hewa inatumika")}
              </span>
              <span>
                Lat: {COUNTY_WEATHER_COORDINATES[weatherCounty]?.lat.toFixed(2)}, Lon: {COUNTY_WEATHER_COORDINATES[weatherCounty]?.lon.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Summary counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-amber-100 p-4.5 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 block font-bold">{t("Managed Hives", "Mizinga Inayosimamiwa")}</span>
            <span className="text-2xl font-black text-gray-950 font-mono">{totalHives}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-amber-100 p-4.5 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 block font-bold">{t("Average Health", "Wastani wa Afya")}</span>
            <span className={`text-2xl font-black font-mono ${avgHealth >= 80 ? "text-emerald-600" : "text-amber-600"}`}>
              {avgHealth}%
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
            <HeartPulse className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-amber-100 p-4.5 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 block font-bold">{t("Yields Extracted", "Mazao ya Asali")}</span>
            <span className="text-2xl font-black text-gray-950 font-mono">{totalKg} Kg</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center border border-yellow-100">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-amber-100 p-4.5 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 block font-bold">{t("Pending Orders", "Maagizo Yanayosubiri")}</span>
            <span className="text-2xl font-black text-gray-950 font-mono">{pendingOrders}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center border border-amber-200">
            <Eye className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Internal manager Tabs */}
      <div className="flex border-b border-amber-200/50 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSubTab('hives')}
          className={`px-4 py-2.5 font-bold text-xs shrink-0 rounded-t-xl transition duration-150 ${activeSubTab === 'hives' ? 'bg-[#F5B800] text-black shadow-sm' : 'text-gray-450 hover:text-amber-400'}`}
        >
          {t("Colony boxes & Registry", "Mizinga na Ukoo")}
        </button>
        <button
          onClick={() => setActiveSubTab('inspections')}
          className={`px-4 py-2.5 font-bold text-xs shrink-0 rounded-t-xl transition duration-150 ${activeSubTab === 'inspections' ? 'bg-[#F5B800] text-black shadow-sm' : 'text-gray-450 hover:text-amber-400'}`}
        >
          {t("Daily Sweep inspections", "Kukagua Mizinga")} ({inspections.length})
        </button>
        <button
          onClick={() => setActiveSubTab('harvests')}
          className={`px-4 py-2.5 font-bold text-xs shrink-0 rounded-t-xl transition duration-150 ${activeSubTab === 'harvests' ? 'bg-[#F5B800] text-black shadow-sm' : 'text-gray-450 hover:text-amber-400'}`}
        >
          {t("Honey Extraction Logs", "Kuvuna Kiasi")} ({harvests.length})
        </button>
        <button
          onClick={() => setActiveSubTab('expenses')}
          className={`px-4 py-2.5 font-bold text-xs shrink-0 rounded-t-xl transition duration-150 ${activeSubTab === 'expenses' ? 'bg-[#F5B800] text-black shadow-sm' : 'text-gray-450 hover:text-amber-400'}`}
        >
          {t("Daily Expense Ledger", "Gharama za Shamba")} (Ksh {totalExpensesKsh.toLocaleString()})
        </button>
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`px-4 py-2.5 font-bold text-xs shrink-0 rounded-t-xl transition duration-150 ${activeSubTab === 'orders' ? 'bg-[#F5B800] text-black shadow-sm' : 'text-gray-450 hover:text-amber-400'}`}
        >
          {t("Client Purchases Pipeline", "Hati za Mauzo")} ({orders.length})
        </button>
        <button
          onClick={() => setActiveSubTab('sales')}
          className={`px-4 py-2.5 font-bold text-xs shrink-0 rounded-t-xl transition duration-150 flex items-center gap-1.5 ${activeSubTab === 'sales' ? 'bg-[#F4B400] text-black shadow-sm' : 'text-gray-450 hover:text-amber-400'}`}
        >
          <span>💼</span>
          <span>{t("My Sales Requests", "Maombi ya Mauzo")}</span>
          {buybackRequests.length > 0 && (
            <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
              {buybackRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`px-4 py-2.5 font-bold text-xs shrink-0 rounded-t-xl transition duration-150 flex items-center gap-1.5 ${activeSubTab === 'analytics' ? 'bg-[#F4B400] text-black shadow-sm' : 'text-gray-450 hover:text-amber-400'}`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{t("Performance & Analytics", "Uchambuzi wa Uzalishaji")}</span>
        </button>
        <button
          onClick={() => setActiveSubTab('blog')}
          className={`px-4 py-2.5 font-bold text-xs shrink-0 rounded-t-xl transition duration-150 flex items-center gap-1.5 ${activeSubTab === 'blog' ? 'bg-[#F4B400] text-black shadow-sm' : 'text-gray-450 hover:text-amber-400'}`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{t("Beekeeping Blog", "Makala na Elimu")}</span>
          {blogPosts.length > 0 && (
            <span className="bg-amber-900 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
              {blogPosts.length}
            </span>
          )}
        </button>
      </div>

      {/* HIVES SUB-TAB */}
      {activeSubTab === 'hives' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hives List Column */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm">Hives Registry</h3>
              <button
                onClick={() => setShowAddHive(!showAddHive)}
                className="p-1 px-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Box</span>
              </button>
            </div>

            {/* Quick Add Hive Form overlay */}
            {showAddHive && (
              <form onSubmit={handleCreateHive} className="bg-amber-50/50 border border-amber-200 p-4 rounded-2xl space-y-3 shadow-xs">
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 block mb-1">Colony Identification name*</label>
                  <input
                    type="text"
                    required
                    value={newHiveName}
                    onChange={(e) => setNewHiveName(e.target.value)}
                    placeholder="e.g., Summit Meadow (Epsilon)"
                    className="w-full text-xs p-2.5 bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 block mb-1">Location / Field</label>
                    <input
                      type="text"
                      value={newHiveLocation}
                      onChange={(e) => setNewHiveLocation(e.target.value)}
                      placeholder="e.g., Apple Orchard"
                      className="w-full text-xs p-2.5 bg-white border border-amber-200 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 block mb-1">Structure Type</label>
                    <select
                      value={newHiveType}
                      onChange={(e) => setNewHiveType(e.target.value as Hive['type'])}
                      className="w-full text-xs p-2.5 bg-white border border-amber-200 rounded-xl"
                    >
                      <option value="Langstroth">Langstroth</option>
                      <option value="Top-Bar">Top-Bar</option>
                      <option value="Warre">Warre</option>
                      <option value="Nucleus">Nucleus</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 block mb-1">Bee Breed</label>
                    <input
                      type="text"
                      value={newHiveBreed}
                      onChange={(e) => setNewHiveBreed(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-amber-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 block mb-1">Structure setup notes</label>
                    <input
                      type="text"
                      value={newHiveNotes}
                      placeholder="e.g., marked queen, gentle box"
                      onChange={(e) => setNewHiveNotes(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-amber-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-amber-500 text-white font-semibold text-xs rounded-xl hover:bg-amber-600 transition"
                  >
                    Deploy Box structure
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddHive(false)}
                    className="px-3 py-2 bg-white border border-gray-200 text-xs font-medium rounded-xl hover:bg-gray-55"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
              {hives.map((h, hIdx) => {
                const isSelected = h.id === selectedHiveId;
                const paddedIdx = String(hIdx + 1).padStart(2, "0");
                return (
                  <div
                    key={h.id}
                    onClick={() => setSelectedHiveId(h.id)}
                    className={`p-5 transition cursor-pointer flex flex-col justify-between border-y border-r ${
                      isSelected 
                        ? "border-[#F5B800] bg-white/10 border-l-4 border-l-[#F5B800]" 
                        : "border-white/10 bg-white/5 hover:border-white/20 border-l-4 border-l-white/20"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-3xl font-black font-mono leading-none text-white/15 block select-none">
                          {paddedIdx}
                        </span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-none font-mono ${
                          h.status === "Healthy" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}>
                          {h.status}
                        </span>
                      </div>
                      
                      <h4 className="font-display font-black text-white leading-tight block truncate text-sm uppercase tracking-tight">{h.name}</h4>
                      <p className="text-[10px] text-white/50 mt-1 flex items-center gap-1 font-mono uppercase tracking-wider">
                        <MapPin className="w-3 h-3 text-[#F5B800]" />
                        <span>{h.location}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-2.5 mt-2.5">
                      <span className="text-[10px] text-white/70 bg-white/5 border border-white/10 p-1.5 rounded-none flex items-center gap-1 font-mono font-bold">
                        <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                        <span>{h.temp}°C</span>
                      </span>
                      <span className="text-[10px] text-white/70 bg-white/5 border border-white/10 p-1.5 rounded-none flex items-center gap-1 font-mono font-bold">
                        <Droplets className="w-3.5 h-3.5 text-blue-400" />
                        <span>{h.humidity}%</span>
                      </span>
                      <span className="text-xs font-black text-[#F5B800] font-mono bg-[#F5B800]/10 px-2 py-0.5 border border-[#F5B800]/20 rounded-none">
                        SCORE: {h.healthScore}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hive Details Column */}
          <div className="lg:col-span-2 space-y-6">
            {selectedHive ? (
              <div className="bg-white border border-amber-100 rounded-3xl p-6 shadow-xs space-y-6">
                {/* Header with Title & actions */}
                <div className="flex justify-between items-start border-b border-amber-100 pb-4">
                  <div>
                    <h3 className="text-base font-black text-gray-950">{selectedHive.name}</h3>
                    <p className="text-xs text-gray-500 font-medium">Variety: <strong className="font-semibold text-amber-800">{selectedHive.breed}</strong></p>
                  </div>
                  <button
                    onClick={() => onDeleteHive(selectedHive.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg h-fit border border-gray-100 hover:bg-gray-50"
                    title="Retire box"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Hive Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-amber-50/20 border border-amber-100 p-3.5 rounded-2xl">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-bold">Queen status</span>
                    <strong className="text-xs font-bold text-amber-900 block mt-1.5">{selectedHive.queenStatus}</strong>
                  </div>
                  <div className="bg-amber-50/20 border border-amber-100 p-3.5 rounded-2xl">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-bold">Deploy Date</span>
                    <strong className="text-xs font-bold text-gray-700 block mt-1.5">{selectedHive.createdAt}</strong>
                  </div>
                  <div className="bg-amber-50/20 border border-amber-100 p-3.5 rounded-2xl">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-bold">Box Location</span>
                    <strong className="text-xs font-bold text-gray-700 block mt-1.5">{selectedHive.location}</strong>
                  </div>
                </div>

                {/* notes */}
                <p className="text-xs text-gray-600 bg-amber-50/20 p-3.5 rounded-xl border border-amber-100 leading-relaxed italic">
                  <strong>Colony log:</strong> {selectedHive.notes || "No extra log written."}
                </p>

                {/* Inspections History for this Hive */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-amber-600" />
                    <span>Inspection Sweeps for this colony ({inspections.filter(i => i.hiveId === selectedHive.id).length})</span>
                  </h4>

                  <div className="space-y-3.5">
                    {inspections.filter(i => i.hiveId === selectedHive.id).length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No sweeps logged yet. Fill out the inspection sheet below to record data.</p>
                    ) : (
                      inspections.filter(i => i.hiveId === selectedHive.id).map((i) => (
                        <div key={i.id} className="border border-amber-100 p-4 rounded-2xl bg-amber-50/10 space-y-2.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-amber-800 font-mono">{i.date}</span>
                            <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-bold ${
                              i.status === "Healthy" ? "bg-emerald-50 text-emerald-700" : "bg-amber-100 text-amber-700"
                            }`}>
                              {i.status} (Health: {i.healthScore}%)
                            </span>
                          </div>
                          
                          <p className="text-xs text-gray-700 leading-relaxed">
                            <strong className="text-gray-800">Observations:</strong> {i.observations}
                          </p>
                          <p className="text-xs text-gray-700 leading-relaxed">
                            <strong className="text-gray-800">Actions Done:</strong> {i.actionTaken}
                          </p>

                          {/* smart AI advisory tip */}
                          {i.smartAdvice && (
                            <div className="bg-amber-50/70 border border-amber-200/50 p-3 rounded-xl">
                              <p className="text-[10px] font-bold text-amber-800 block uppercase font-mono tracking-wider mb-1 flex items-center gap-1">
                                <Bot className="w-3.5 h-3.5 animate-pulse" />
                                <span>Barnaby Vet Smart Plan</span>
                              </p>
                              <p className="text-xs text-amber-950 font-normal leading-relaxed whitespace-pre-line">
                                {i.smartAdvice}
                              </p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Harvest yields for this Hive */}
                <div className="pt-2 border-t border-amber-100/50 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-xs text-gray-900 flex items-center gap-1.5 animate-pulse">
                      <span>🍯</span>
                      <span>Extracted Yield Yields from this colony ({harvests.filter(h => h.hiveId === selectedHive.id).length})</span>
                    </h4>
                    <button
                      onClick={() => setShowHarvestForm(!showHarvestForm)}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-[10px] rounded-lg transition"
                    >
                      Log Extraction
                    </button>
                  </div>

                  {showHarvestForm && (
                    <form onSubmit={handleCreateHarvest} className="bg-amber-50/55 p-4 rounded-xl border border-amber-100 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-semibold text-gray-500">Yield weight (Kg)*</label>
                          <input
                            type="number"
                            required
                            step="0.1"
                            value={harvestAmount}
                            onChange={(e) => setHarvestAmount(Number(e.target.value))}
                            className="w-full text-xs p-2 bg-white border border-amber-200 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-gray-500">Flower nectar profile</label>
                          <select
                            value={harvestHoneyType}
                            onChange={(e) => setHarvestHoneyType(e.target.value as Harvest['honeyType'])}
                            className="w-full text-xs p-2 bg-white border border-amber-200 rounded-lg"
                          >
                            <option value="Wildflower">Wildflower Meadow</option>
                            <option value="Clover">Clover Gold</option>
                            <option value="Manuka">Manuka Premium</option>
                            <option value="Orange Blossom">Orange Blossom</option>
                            <option value="Buckwheat">Buckwheat Dark</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-semibold text-gray-500">Moisture Content (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={harvestMoisture}
                            onChange={(e) => setHarvestMoisture(Number(e.target.value))}
                            className="w-full text-xs p-2 bg-white border border-amber-200 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-gray-500">Honey grade</label>
                          <select
                            value={harvestGrade}
                            onChange={(e) => setHarvestGrade(e.target.value as Harvest['grade'])}
                            className="w-full text-xs p-2 bg-white border border-amber-200 rounded-lg"
                          >
                            <option value="Raw Unfiltered">Raw Unfiltered Blend</option>
                            <option value="Grade A">Grade A Standard</option>
                            <option value="Grade B">Grade B industrial</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold text-gray-500">Extraction remarks</label>
                        <input
                          type="text"
                          value={harvestNotes}
                          onChange={(e) => setHarvestNotes(e.target.value)}
                          placeholder="e.g., beautiful thick caps, aromatic smell"
                          className="w-full text-xs p-2 bg-white border border-amber-200 rounded-lg"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button type="submit" className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-lg">
                          Confirm extraction
                        </button>
                        <button type="button" onClick={() => setShowHarvestForm(false)} className="px-3 py-1.5 bg-white border border-gray-200 text-xs rounded-lg">
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-2">
                    {harvests.filter(h => h.hiveId === selectedHive.id).length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No extractions recorded from this box structure.</p>
                    ) : (
                      harvests.filter(h => h.hiveId === selectedHive.id).map((h) => (
                        <div key={h.id} className="flex justify-between items-center text-xs bg-amber-50/10 p-3 rounded-xl border border-amber-100">
                          <div>
                            <span className="font-bold text-gray-900 block">{h.amountKg} Kg extracted nectars</span>
                            <span className="text-[10px] text-gray-400">Moisture: {h.moisturePercent}% • Type: {h.honeyType} • Grade: {h.grade}</span>
                          </div>
                          <span className="font-semibold text-amber-700 text-[10px] font-mono bg-amber-50 p-1.5 rounded-lg border border-amber-100">{h.date}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-white border border-amber-100 rounded-3xl">
                <p className="text-gray-400 text-xs font-semibold">Please deploy or select a colony hive from the left registry to manage apiary data.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SWEEP INSPECTIONS SUB-TAB */}
      {activeSubTab === 'inspections' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* inspection sheet form */}
          <div className="lg:col-span-1 bg-white border border-amber-100 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-gray-950 text-sm flex items-center gap-1.5">
              <ClipboardList className="w-5 h-5 text-amber-500 animate-bounce" />
              <span>Colony Inspection Sheet</span>
            </h3>
            
            <form onSubmit={handleCreateInspection} className="space-y-4">
              <div>
                <label className="text-[10px] font-semibold text-gray-500 block mb-1">Target Colony box*</label>
                <select
                  value={selectedHiveId}
                  onChange={(e) => setSelectedHiveId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-amber-200 rounded-xl"
                >
                  {hives.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 block mb-1">Core Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newTemp}
                    onChange={(e) => setNewTemp(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-white border border-amber-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 block mb-1">Core Humidity (%)</label>
                  <input
                    type="number"
                    value={newHumidity}
                    onChange={(e) => setNewHumidity(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-white border border-amber-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 block mb-1">Health Score (0-100)</label>
                  <input
                    type="number"
                    value={newHealth}
                    onChange={(e) => setNewHealth(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-white border border-amber-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 block mb-1">Colony state status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-amber-200 rounded-xl font-semibold"
                  >
                    <option value="Healthy">Healthy (Optimal)</option>
                    <option value="Active">Active (Swarms build)</option>
                    <option value="Under Observation">Under Observation</option>
                    <option value="Weak">Weak / supplemental feeding</option>
                    <option value="Treatment Needed">Treatment Needed (MITES)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-gray-500 block mb-1">Active observation logs</label>
                <textarea
                  rows={2}
                  value={newObs}
                  onChange={(e) => setNewObs(e.target.value)}
                  placeholder="e.g., solid egg patterns, healthy laying queen, honey supers storing water..."
                  className="w-full text-xs p-2.5 bg-white border border-amber-200 rounded-xl resize-none focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-gray-300"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-gray-500 block mb-1">Corrective Actions/Feed Done</label>
                <input
                  type="text"
                  value={newActionTaken}
                  onChange={(e) => setNewActionTaken(e.target.value)}
                  placeholder="e.g., added space super, entrance reduction..."
                  className="w-full text-xs p-2.5 border border-amber-200 rounded-xl"
                />
              </div>

              {/* AI Vet analysis section */}
              <div className="pt-2 border-t border-amber-150 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleAiDiagnosticPlan}
                  disabled={insightsLoading}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  {insightsLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 animate-pulse text-amber-200" />
                  )}
                  <span>Advisory Plan with Gemini API</span>
                </button>

                {smartAdvice && (
                  <div className="bg-amber-50 p-3.5 border border-amber-250 rounded-xl text-xs space-y-1.5">
                    <span className="text-[9px] font-black uppercase font-mono text-amber-800 tracking-wider flex items-center gap-1">
                      <Bot className="w-3.5 h-3.5" />
                      <span>Barnaby Generated Plan:</span>
                    </span>
                    <p className="text-gray-850 font-normal leading-relaxed whitespace-pre-line text-[11px]">
                      {smartAdvice}
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase uppercase rounded-xl tracking-wide shadow-sm"
              >
                Log sweep to Hive history
              </button>
            </form>
          </div>

          {/* listing inspections history column */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-gray-900 text-xs">Apiticulture Log book ({inspections.length} recorded)</h3>
            
            <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              {inspections.map((i) => {
                const targetHiveName = hives.find(h => h.id === i.hiveId)?.name || "Inactive box";
                return (
                  <div key={i.id} className="bg-white border border-amber-100 p-5 rounded-2xl shadow-xs space-y-2.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-gray-950 text-xs leading-tight">{targetHiveName}</h4>
                        <span className="text-[10px] text-amber-800 font-mono font-bold block mt-0.5">{i.date}</span>
                      </div>
                      
                      <div className="flex gap-2 items-center">
                        <span className="text-[11px] bg-amber-50 border border-amber-100 text-gray-600 p-1.5 rounded-lg flex items-center gap-1 font-mono font-semibold">
                          <Thermometer className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                          <span>{i.temp}°C</span>
                        </span>
                        <span className="text-[11px] bg-amber-50 border border-amber-100 text-gray-600 p-1.5 rounded-lg flex items-center gap-1 font-mono font-semibold">
                          <Droplets className="w-3.5 h-3.5 text-blue-500" />
                          <span>{i.humidity}%</span>
                        </span>
                        <span className={`text-[10px] px-2.5 py-1 text-xs border rounded-full font-bold uppercase ${
                          i.status === "Healthy" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                          Health score: {i.healthScore}%
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-700 leading-relaxed grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-amber-50 pt-2.5">
                      <div>
                        <strong className="text-gray-900 block font-bold mb-0.5">Observations Log:</strong>
                        {i.observations}
                      </div>
                      <div>
                        <strong className="text-gray-900 block font-bold mb-0.5">Corrective Steps done:</strong>
                        {i.actionTaken}
                      </div>
                    </div>

                    {i.smartAdvice && (
                      <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl">
                        <p className="text-[10px] font-bold text-amber-800 block uppercase font-mono tracking-wider mb-1.5 flex items-center gap-1">
                          <Bot className="w-3.5 h-3.5 text-amber-600" />
                          <span>Barnaby Smart Beekeeping advice</span>
                        </p>
                        <p className="text-xs text-amber-950 font-normal leading-relaxed whitespace-pre-line text-[11px]">
                          {i.smartAdvice}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* HONEY HARVESTS SUB-TAB */}
      {activeSubTab === 'harvests' && (
        <div className="bg-white border border-amber-100 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-amber-50">
            <div>
              <h3 className="font-bold text-gray-950 text-sm">Honey Extraction and Storage yield history</h3>
              <p className="text-xs text-gray-400">Yield yields extracted cleanly from natural honeycomb frames</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* yields table view */}
            <div className="md:col-span-2 space-y-4">
              <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wide font-mono">Recorded Yield transfers</h4>
              
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {harvests.map((h) => {
                  const sourceName = hives.find(hi => hi.id === h.hiveId)?.name || 'Retired Box';
                  return (
                    <div key={h.id} className="border border-amber-150 p-4 rounded-2xl bg-amber-50/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">🍯</span>
                          <h5 className="font-bold text-gray-950 text-xs">{sourceName}</h5>
                        </div>
                        <p className="text-gray-400 text-[10px] uppercase font-mono font-bold tracking-wider">
                          nectar profile: <strong className="text-amber-800 font-semibold">{h.honeyType} Blossom</strong> • Grade: {h.grade}
                        </p>
                        {h.notes && (
                          <p className="text-[11px] text-gray-500 italic mt-1 leading-relaxed">"{h.notes}"</p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-amber-950 block">{h.amountKg} kilograms</span>
                        <span className="text-[9px] px-2 py-0.5 bg-white border border-amber-100 text-amber-800 font-bold rounded mt-1 inline-block">{h.date}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Honey Type Distribution bar chart (SVG custom built) */}
            <div className="bg-amber-50/20 border border-amber-150 p-5 rounded-2xl space-y-4">
              <h4 className="font-bold text-xs text-gray-900 border-b border-amber-100 pb-2">Harvest Distribution by Blend</h4>
              
              <div className="space-y-3.5 text-xs">
                {["Clover", "Wildflower", "Manuka", "Orange Blossom", "Buckwheat"].map((type) => {
                  const typeHarvests = harvests.filter(h => h.honeyType === type);
                  const totalTypeKg = typeHarvests.reduce((sum, h) => sum + h.amountKg, 0);
                  const sharePercent = totalKg > 0 ? Math.round((totalTypeKg / totalKg) * 100) : 0;
                  
                  return (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between font-semibold text-gray-700">
                        <span>{type} nectar blend</span>
                        <span className="font-mono text-amber-800">{totalTypeKg.toFixed(1)} Kg ({sharePercent}%)</span>
                      </div>
                      <div className="w-full bg-amber-150 rounded-full h-2">
                        <div 
                          className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${sharePercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CLIENT PURCHASES PIPELINE */}
      {activeSubTab === 'orders' && (
        <div className="bg-white border border-amber-100 rounded-3xl p-6 shadow-xs space-y-6 text-left">
          
          {/* Visual toast messaging alerts */}
          {visualToastMessage && (
            <div className="p-3 bg-emerald-600 text-white font-extrabold text-xs rounded-2xl animate-in zoom-in-95 duration-200 flex items-center justify-between shadow-lg">
              <span>🎉 {visualToastMessage}</span>
              <button 
                onClick={() => setVisualToastMessage("")} 
                className="font-bold leading-none select-none pl-3 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Action Header Card Block */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-50 pb-4">
            <div>
              <h3 className="font-bold text-[#1A4D2E] text-sm">Customer Incoming Orders pipeline</h3>
              <p className="text-xs text-gray-400 mt-0.5">Disburse post logistics, coordinate secure Visa payments, and print compliant receipts</p>
            </div>
            <button
              onClick={() => {
                setShowManualOrderForm(!showManualOrderForm);
                setManualFormError("");
              }}
              className="px-4 py-2 bg-[#1A4D2E] hover:bg-amber-500 text-white hover:text-black rounded-xl text-xs font-extrabold tracking-wide transition duration-150 flex items-center gap-1.5 self-start cursor-pointer border-2 border-transparent hover:border-[#1A4D2E]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{showManualOrderForm ? "Hide OTC Form" : "Book Offline OTC Sale"}</span>
            </button>
          </div>

          {/* Interactive Statistics Overview row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-amber-500/5 border border-amber-500/10 p-3.5 rounded-2xl flex flex-col justify-between">
              <span className="text-[9px] uppercase font-mono tracking-wider text-gray-400 font-bold leading-none">Gross Shop revenues</span>
              <strong className="text-base font-black text-[#1A4D2E] font-mono mt-1.5 block">
                ${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
              </strong>
            </div>
            <div className="bg-amber-505/5 border border-amber-505/10 p-3.5 rounded-2xl flex flex-col justify-between">
              <span className="text-[9px] uppercase font-mono tracking-wider text-gray-400 font-bold leading-none">Pipeline In-Transit</span>
              <strong className="text-base font-black text-amber-700 font-mono mt-1.5 block">
                {orders.filter(o => o.status === 'Shipped').length} / {orders.length}
              </strong>
            </div>
            <div className="bg-sky-500/5 border border-sky-500/10 p-3.5 rounded-2xl flex flex-col justify-between">
              <span className="text-[9px] uppercase font-mono tracking-wider text-gray-400 font-bold leading-none">Bestselling Crop</span>
              <strong className="text-[10px] font-black text-slate-800 font-mono mt-1.5 block truncate uppercase" title={(() => {
                const counts: Record<string, number> = {};
                orders.forEach(o => o.items.forEach(it => { counts[it.productName] = (counts[it.productName] || 0) + it.quantity; }));
                let champ = "No Orders";
                let topCount = 0;
                Object.entries(counts).forEach(([name, count]) => { if (count > topCount) { champ = name; topCount = count; } });
                return champ;
              })()}>
                {(() => {
                  const counts: Record<string, number> = {};
                  orders.forEach(o => o.items.forEach(it => { counts[it.productName] = (counts[it.productName] || 0) + it.quantity; }));
                  let champ = "No Orders";
                  let topCount = 0;
                  Object.entries(counts).forEach(([name, count]) => { if (count > topCount) { champ = name; topCount = count; } });
                  return champ;
                })()}
              </strong>
            </div>
            <div className="bg-red-500/5 border border-red-500/10 p-3.5 rounded-2xl flex flex-col justify-between">
              <span className="text-[9px] uppercase font-mono tracking-wider text-gray-400 font-bold leading-none">Low-stock Alert</span>
              <strong className={`text-base font-black font-mono mt-1.5 block ${products.filter(p => p.stock < 20).length > 0 ? "text-red-500 animate-pulse" : "text-gray-400"}`}>
                {products.filter(p => p.stock < 15).length} Warning Lots
              </strong>
            </div>
          </div>

          {/* Expandable Manual walking / walk-in booking sale form */}
          {showManualOrderForm && (
            <form onSubmit={handleBookingManualOrderSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-amber-50/15 border border-amber-200/50 p-5 rounded-2xl animate-in slide-in-from-top-4 duration-300 text-left">
              <div className="md:col-span-2 flex justify-between items-center border-b border-amber-100 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-amber-500" />
                  <span>Book Offline / Over-The-Counter Honey Sale</span>
                </h4>
                <button 
                  type="button" 
                  onClick={() => setShowManualOrderForm(false)}
                  className="text-xs font-bold text-gray-400 hover:text-amber-800 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
              {manualFormError && (
                <div className="md:col-span-2 p-2.5 bg-red-50 border border-red-150 text-red-700 text-xs font-semibold rounded-lg">
                  ⚠️ {manualFormError}
                </div>
              )}
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Customer Full Name (Required)</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. John Kamau"
                  value={manualCustomerName}
                  onChange={(e) => setManualCustomerName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-amber-500"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Email Address</label>
                <input 
                  type="email" 
                  placeholder="customer@example.com"
                  value={manualCustomerEmail}
                  onChange={(e) => setManualCustomerEmail(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-amber-500"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Mobile Contact Phone</label>
                <input 
                  type="tel" 
                  placeholder="e.g. +254 712 345678"
                  value={manualCustomerPhone}
                  onChange={(e) => setManualCustomerPhone(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-amber-500"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">API Product Select (Required)</label>
                <select 
                  required
                  value={manualProductId}
                  onChange={(e) => setManualProductId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-amber-500 font-medium"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (${p.price.toFixed(2)} - Stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Purchase Item Quantity</label>
                <input 
                  type="number" 
                  min={1}
                  value={manualQuantity}
                  onChange={(e) => setManualQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-amber-500 font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Payment Method</label>
                <div className="flex gap-2.5">
                  {(['cash', 'mpesa', 'bank'] as const).map(gw => (
                    <button
                      key={gw}
                      type="button"
                      onClick={() => setManualGateway(gw)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition border cursor-pointer ${
                        manualGateway === gw 
                          ? 'bg-amber-100 border-amber-500 text-amber-900 font-extrabold' 
                          : 'bg-white border-gray-200 text-gray-605 hover:bg-slate-50'
                      }`}
                    >
                      {gw}
                    </button>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Delivery Destination / Handover Address</label>
                <textarea 
                  rows={2}
                  placeholder="Handed over directly in local Apiary branch / Nairobi outlet address"
                  value={manualShippingAddress}
                  onChange={(e) => setManualShippingAddress(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-amber-500 resize-none"
                />
              </div>
              <div className="md:col-span-2 pt-1">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#1A4D2E] hover:bg-amber-500 text-white hover:text-black font-extrabold text-xs rounded-xl transition uppercase cursor-pointer flex items-center justify-center gap-1.5 border-2 border-transparent hover:border-[#1A4D2E]"
                >
                  <CheckCircle2 className="w-4 h-4 cursor-pointer" />
                  <span>Log OTC Checkout & Dispatch Stock</span>
                </button>
              </div>
            </form>
          )}

          {/* Quick Search and Filter Buttons Row */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-amber-50/10 border border-amber-100 p-4 rounded-3xl">
            <div className="relative w-full sm:max-w-xs shrink-0">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search Client Name / Invoice code..."
                value={orderSearchText}
                onChange={(e) => setOrderSearchText(e.target.value)}
                className="w-full bg-white border border-gray-200 pl-9 pr-4 py-2 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-gray-800"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto w-full sm:w-auto shrink-0 py-0.5">
              {(['All', 'Pending', 'Paid', 'Shipped', 'Delivered'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setOrderStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase shrink-0 transition duration-150 cursor-pointer ${
                    orderStatusFilter === tab 
                      ? 'bg-amber-500 text-black shadow-xs font-black' 
                      : 'bg-white border text-gray-500 hover:border-amber-300 hover:bg-slate-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Customer incoming Orders listings */}
          <div className="space-y-4">
            {orders.filter(o => {
              const matchesSearch = o.customerName.toLowerCase().includes(orderSearchText.toLowerCase()) ||
                                    o.id.toLowerCase().includes(orderSearchText.toLowerCase()) ||
                                    o.customerEmail.toLowerCase().includes(orderSearchText.toLowerCase());
              const matchesStatus = orderStatusFilter === 'All' ? true : o.status === orderStatusFilter;
              return matchesSearch && matchesStatus;
            }).length === 0 ? (
              <div className="text-center py-16 border border-dashed border-amber-100 rounded-2xl bg-amber-50/5">
                <p className="text-xs text-gray-400 font-semibold">No buyer logs found matching current search indices.</p>
              </div>
            ) : (
              orders.filter(o => {
                const matchesSearch = o.customerName.toLowerCase().includes(orderSearchText.toLowerCase()) ||
                                      o.id.toLowerCase().includes(orderSearchText.toLowerCase()) ||
                                      o.customerEmail.toLowerCase().includes(orderSearchText.toLowerCase());
                const matchesStatus = orderStatusFilter === 'All' ? true : o.status === orderStatusFilter;
                return matchesSearch && matchesStatus;
              }).map((o) => {
                const tracking = orderTrackings[o.id];
                return (
                  <div key={o.id} className="border border-amber-100 rounded-3xl p-5 bg-white text-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6 transition-all hover:shadow-md border-l-4 border-l-[#1A4D2E]/90">
                    {/* Left Column: buyer contacts */}
                    <div className="space-y-1 .5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-250">
                          {o.id}
                        </span>
                        <strong className="font-extrabold text-gray-950 block truncate text-sm">{o.customerName}</strong>
                      </div>
                      <p className="text-gray-400 text-[10px] block font-mono leading-none mt-1">{o.customerEmail} • {o.customerPhone || "no mobile contact"}</p>
                      <p className="text-gray-650 text-[10px] truncate flex items-center gap-1 mt-1 font-medium">
                        <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>Address: <strong className="text-gray-750 font-bold">{o.shippingAddress}</strong></span>
                      </p>
                      {tracking && (
                        <div className="inline-flex items-center gap-1.5 text-[9px] bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded mt-1 font-mono uppercase font-black">
                          <Truck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>Dispatch Route: {tracking.carrier} ({tracking.trackingCode})</span>
                        </div>
                      )}
                    </div>

                    {/* Middle: basket overview */}
                    <div className="flex-1 min-w-[200px] space-y-1 text-left bg-stone-50 border border-amber-100 p-3.5 rounded-2xl shadow-xs">
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#1A4D2E] mb-1 leading-none">Artisan items ({o.items.reduce((sum, item) => sum + item.quantity, 0)})</p>
                      {o.items.map((item, id) => (
                        <div key={id} className="flex justify-between text-gray-700 font-bold text-[11px] leading-relaxed">
                          <span>{item.quantity}x {item.productName}</span>
                          <span className="font-mono text-gray-400">${item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Right Status Actions panel */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 md:text-right shrink-0 border-t border-dashed md:border-t-0 pt-3 md:pt-0 justify-between md:justify-end">
                      <div className="text-left md:text-right">
                        <span className="text-[9px] text-gray-400 block font-bold uppercase font-mono tracking-widest">Grand total</span>
                        <strong className="text-sm font-black block text-gray-900 border-amber-200">${o.total.toFixed(2)}</strong>
                      </div>

                      <div className="flex items-center gap-1.5 self-start sm:self-center">
                        <button
                          type="button"
                          onClick={() => setActiveInvoiceOrder(o)}
                          className="px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-250 text-amber-900 font-extrabold uppercase tracking-wide text-[9.5px] rounded-xl transition cursor-pointer"
                        >
                          Invoice Slip
                        </button>
                        <select
                          value={o.status}
                          onChange={(e) => onUpdateOrderStatus(o.id, e.target.value as Order['status'])}
                          className={`text-[9.5px] font-black p-2 rounded-xl border focus:outline-none uppercase ${
                            o.status === "Delivered" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : 
                            o.status === "Shipped" ? "bg-blue-50 text-blue-800 border-blue-200" :
                            "bg-amber-100 text-amber-800 border-amber-200"
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* HIGH-FIDELITY DETAILED INVOICE SHEET OVERLAY */}
          {activeInvoiceOrder && (() => {
            const hasTracking = orderTrackings[activeInvoiceOrder.id];
            return (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                <div className="bg-[#FAF9F5] border-2 border-amber-900/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 relative shadow-2xl space-y-6 text-left">
                  {/* Close button */}
                  <button 
                    onClick={() => setActiveInvoiceOrder(null)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-amber-900 border border-gray-200 hover:bg-white rounded-lg p-1.5 transition"
                  >
                    ✕
                  </button>

                  {/* Receipt Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-dashed border-amber-900/10 pb-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📜</span>
                        <h4 className="font-display font-black text-[#1A4D2E] tracking-tight uppercase text-sm">HIVEGLOBAL MERCHANDISE SLIP</h4>
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-mono font-bold border border-emerald-200">OFFICIAL PAID</span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-mono mt-1">Invoice ID: {activeInvoiceOrder.id} • Issued: {activeInvoiceOrder.date}</p>
                    </div>
                    <div className="md:text-right">
                      <span className="text-[8px] text-gray-400 uppercase tracking-widest font-mono font-bold block mb-1">Status Workflow</span>
                      <select
                        value={activeInvoiceOrder.status}
                        onChange={(e) => {
                          onUpdateOrderStatus(activeInvoiceOrder.id, e.target.value as Order['status']);
                          setActiveInvoiceOrder(prev => prev ? { ...prev, status: e.target.value as Order['status'] } : null);
                        }}
                        className={`text-xs font-black p-2 rounded-xl border focus:outline-none uppercase ${
                          activeInvoiceOrder.status === "Delivered" ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
                          activeInvoiceOrder.status === "Shipped" ? "bg-blue-50 border-blue-200 text-blue-700" :
                          activeInvoiceOrder.status === "Paid" ? "bg-[#1A4D2E] border-[#1A4D2E] text-white" :
                          "bg-amber-100 border-amber-300 text-amber-800"
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>
                  </div>

                  {/* Customer Information Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-amber-900/5 text-xs shadow-xs">
                    <div>
                      <h5 className="font-bold text-gray-950 mb-2 uppercase tracking-wide text-[10px] text-amber-900/80">Buyer Credentials</h5>
                      <p className="flex items-center gap-2 text-gray-700 font-bold my-1">
                        <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{activeInvoiceOrder.customerName}</span>
                      </p>
                      <p className="flex items-center gap-2 text-gray-700 font-mono my-1 text-[11px]">
                        <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{activeInvoiceOrder.customerEmail}</span>
                      </p>
                      <p className="flex items-center gap-2 text-gray-700 font-mono my-1 text-[11px]">
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{activeInvoiceOrder.customerPhone || "N/A"}</span>
                      </p>
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-950 mb-2 uppercase tracking-wide text-[10px] text-amber-900/80">Delivery Coordinates</h5>
                      <p className="flex items-start gap-2 text-gray-700 font-bold leading-relaxed">
                        <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{activeInvoiceOrder.shippingAddress}</span>
                      </p>
                    </div>
                  </div>

                  {/* Line items list */}
                  <div className="space-y-2 bg-white p-4 rounded-2xl border border-amber-900/5 shadow-xs">
                    <h5 className="font-bold text-[#1A4D2E] mb-2 uppercase tracking-wide text-[10px]">Artisan Goods Checkout</h5>
                    {activeInvoiceOrder.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-gray-700 border-b border-gray-100 pb-2">
                        <div>
                          <strong className="text-[#1A4D2E] font-extrabold">{it.quantity}x</strong>
                          <span className="ml-2 font-semibold">{it.productName}</span>
                        </div>
                        <span className="font-mono font-bold text-gray-800">${(it.price * it.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center text-xs text-gray-500 pt-1">
                      <span>Logistics Freight Handling</span>
                      <span className="font-mono">$4.99</span>
                    </div>
                    <div className="flex justify-between items-center pt-2.5 border-t border-amber-900/10 font-bold text-sm text-[#1A4D2E]">
                      <span>Grand Total Recouped</span>
                      <span className="font-mono text-base">${activeInvoiceOrder.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Logistics Tracking panel */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-4">
                    <div className="flex items-center justify-between col-span-1">
                      <h5 className="font-bold text-slate-800 uppercase tracking-wide text-[10px] flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-blue-500" />
                        <span>Logistics Courier Transit</span>
                      </h5>
                      {hasTracking ? (
                        <span className="text-[10px] bg-blue-100 text-blue-800 border-blue-200 border px-2 py-0.5 rounded font-mono font-bold uppercase shrink-0">
                          {hasTracking.carrier} • Air Waybill {hasTracking.trackingCode}
                        </span>
                      ) : (
                        <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded font-bold uppercase shrink-0">
                          Unassigned
                        </span>
                      )}
                    </div>

                    {!hasTracking ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 items-end">
                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-500 uppercase font-black">Transporter</label>
                          <input 
                            type="text" 
                            placeholder="DHL, Wells Fargo, G4S..." 
                            value={shippingCarrierInput}
                            onChange={(e) => setShippingCarrierInput(e.target.value)}
                            className="w-full text-xs p-2 bg-white border border-gray-200 rounded-lg focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-500 uppercase font-black">Tracking Number</label>
                          <input 
                            type="text" 
                            placeholder="e.g. DH-8321-KE" 
                            value={trackingCodeInput}
                            onChange={(e) => setTrackingCodeInput(e.target.value)}
                            className="w-full text-xs p-2 bg-white border border-gray-200 rounded-lg focus:outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUpdateTransitDelivery(activeInvoiceOrder.id)}
                          className="py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg uppercase tracking-wide cursor-pointer transition"
                        >
                          Book Courier
                        </button>
                      </div>
                    ) : (
                      <div className="bg-white/80 p-3 rounded-xl space-y-2 border border-slate-150 animate-in fade-in duration-200">
                        <div className="flex justify-between items-center text-[10px] text-slate-700 font-bold border-b border-gray-150 pb-1">
                          <span>Active Courier Transport Logs</span>
                          <span className="text-[9px] text-gray-400 font-mono">Real-time Sync</span>
                        </div>
                        <div className="max-h-24 overflow-y-auto space-y-1 font-mono text-[9px] text-slate-650 leading-normal pr-1">
                          {hasTracking.logs.map((log, lidx) => (
                            <p key={lidx} className="border-l-2 border-amber-600 pl-1.5 py-0.5 bg-amber-500/5 whitespace-pre-wrap">{log}</p>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2.5 pt-1.5 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => handleDispatchNotification(activeInvoiceOrder.id, 'SMS')}
                            className="py-1.5 bg-amber-500 hover:bg-[#1A4D2E] text-slate-950 hover:text-white font-extrabold uppercase text-[9px] rounded-lg tracking-wider text-center cursor-pointer"
                          >
                            📲 Send SMS Alert
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDispatchNotification(activeInvoiceOrder.id, 'Email')}
                            className="py-1.5 bg-white hover:bg-amber-100 text-slate-700 font-extrabold uppercase text-[9px] rounded-lg border tracking-wider text-center cursor-pointer"
                          >
                            ✉️ email Bills PDF
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Print Sheet Guarantee banner */}
                  <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono font-bold leading-normal pt-2 border-t border-dashed border-gray-200">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-[#1A4D2E] shrink-0" />
                      <span>KEBS & KRA INTEGRATED PACKET</span>
                    </span>
                    <button 
                      type="button"
                      onClick={() => {
                        window.print();
                      }}
                      className="text-amber-800 hover:underline cursor-pointer bg-transparent border-0"
                    >
                      🖨️ Print Tax Slip
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* MY SALES REQUESTS SUB-TAB */}
      {activeSubTab === 'sales' && (
        <div className="bg-white border border-amber-100 rounded-3xl p-6 shadow-xs space-y-6 animate-in fade-in duration-200" id="sales-requests-tab">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">💼</span>
                <h3 className="font-bold text-gray-950 text-sm">
                  {t("Kenya Bee Company - Direct Honey Buybacks", "Kenya Bee Company - Ununuzi wa Asali Moja kwa Moja")}
                </h3>
              </div>
              <p className="text-xs text-gray-450 mt-0.5 font-medium">
                {t("Verify, inspect and process high-rate export lots (Ksh 1,280 / Kg) directly with Kenya Bee Company specialists.", 
                   "Kagua, thibitisha na ulipie asali yako ya kuuzwa nje kwa bei ya juu (Ksh 1,280 / kilo) kupitia wataalamu wa Kenya Bee Company.")}
              </p>
            </div>
          </div>

          {/* Statistics summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl">
              <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 font-bold block">
                {t("Total Lots Submitted", "Jumla ya Maombi")}
              </span>
              <strong className="text-lg font-black text-gray-950 font-mono mt-0.5 block">
                {buybackRequests.length} {t("Lots", "Kundi")}
              </strong>
            </div>

            <div className="bg-amber-100/20 border border-amber-200 p-4 rounded-2xl">
              <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 font-bold block">
                {t("Pending Review", "Yanayokaguliwa")}
              </span>
              <strong className="text-lg font-black text-amber-700 font-mono mt-0.5 block">
                {buybackRequests.filter(r => r.status === 'Pending Review').length}
              </strong>
            </div>

            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl">
              <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 font-bold block">
                {t("Active / Dispatched", "Iliyopokelewa")}
              </span>
              <strong className="text-lg font-black text-blue-700 font-mono mt-0.5 block">
                {buybackRequests.filter(r => r.status === 'Collector Dispatched' || r.status === 'Inspected & Approved').length}
              </strong>
            </div>

            <div className="bg-[#1A4D2E]/5 border border-[#1A4D2E]/10 p-4 rounded-2xl">
              <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 font-bold block">
                {t("Total Paid Out", "Jumla Uliyolipwa")}
              </span>
              <strong className="text-lg font-black text-emerald-700 font-mono mt-0.5 block">
                Ksh {buybackRequests
                  .filter(r => r.status === 'Paid')
                  .reduce((sum, r) => sum + r.payoutKes, 0)
                  .toLocaleString()}
              </strong>
            </div>
          </div>

          {/* Requests table listing */}
          <div className="space-y-4">
            {buybackRequests.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-amber-200 rounded-2xl bg-[#FCFBF7]/50 p-6">
                <span className="text-3xl block mb-2">📦</span>
                <p className="text-xs text-gray-500 font-semibold mb-1">
                  {t("No sales buyback requests submitted yet.", "Bado hujaomba kuuza asali yoyote kwa sasa.")}
                </p>
                <p className="text-[11px] text-gray-400 max-w-md mx-auto leading-relaxed">
                  {t("Use the 'Global Buyer' tab in the navigation header above, select the 'Sell to Kenya Bee Co.' button, fill out detail fields (FullName, Phone, Location, Honey Weight), and submit to receive instant quotes here!", 
                     "Tumia kichupo cha 'Duka Kuu' hapo juu, chagua kitufe cha 'Uza kwa Kenya Bee Co.', jaza maelezo na utume ili kupata muhtasari papo hapo!")}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 font-mono">
                    {t("Active Consignment List", "Orodha ya Hati za Mauzo ya Asali")}
                  </h4>
                  <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-250 px-2 py-0.5 rounded font-mono font-bold">
                    {t("🔄 Real-Time Shared Database active", "🔄 Hifadhi Inalandanishwa Kisasa")}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {buybackRequests.map((r) => {
                    // Refined beautiful indicator chips
                    let chipStyle = "bg-stone-100 text-stone-700 border-stone-200";
                    let dotColor = "bg-stone-400";
                    let displayStatus = r.status;

                    if (r.status === 'Pending Review') {
                      chipStyle = "bg-amber-50 text-amber-900 border-amber-200 font-bold shadow-2xs";
                      dotColor = "bg-amber-500 animate-pulse";
                      displayStatus = t("Pending", "Yanayokaguliwa");
                    } else if (r.status === 'Collector Dispatched') {
                      chipStyle = "bg-sky-50 text-sky-900 border-sky-200 font-bold shadow-2xs";
                      dotColor = "bg-sky-500 animate-ping";
                      displayStatus = t("Collector Sent", "Ofisa Ametumwa");
                    } else if (r.status === 'Inspected & Approved') {
                      chipStyle = "bg-indigo-50 text-indigo-900 border-indigo-200 font-extrabold shadow-2xs animate-pulse";
                      dotColor = "bg-indigo-600";
                      displayStatus = t("Approved", "Imepita & Hakikishwa");
                    } else if (r.status === 'Paid') {
                      chipStyle = "bg-emerald-600 text-white border-emerald-600 font-black shadow-xs tracking-wide";
                      dotColor = "bg-white";
                      displayStatus = t("Paid", "Imeshalipwa ✓");
                    }

                    return (
                      <div 
                        key={r.id} 
                        className="bg-stone-50/50 border border-gray-200 hover:border-amber-400/50 rounded-2xl p-5 transition duration-150 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
                      >
                        {/* Decorative side accent bar */}
                        <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${r.status === 'Paid' ? 'bg-emerald-600' : 'bg-amber-400'}`} />

                        {/* Submitter & Location Details */}
                        <div className="space-y-2 flex-1 min-w-0 pl-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[9px] font-extrabold bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded border border-stone-200">
                              {r.id}
                            </span>
                            <h5 className="font-extrabold text-gray-900 text-sm truncate uppercase tracking-tight">
                              {r.fullName}
                            </h5>
                            
                            {/* Visual state color-coded chip */}
                            <span className={`inline-flex items-center gap-1.5 text-[9px] px-2.5 py-1 rounded-full border uppercase tracking-wider ${chipStyle}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                              <span>{displayStatus}</span>
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-550 font-medium">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span className="truncate"><strong>{t("Location", "Mahali")}:</strong> {r.location}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                              <span><strong>{t("Phone", "Simu")}:</strong> {r.phone}</span>
                            </div>
                          </div>
                        </div>

                        {/* Lot Specs & Estimated payout */}
                        <div className="bg-white border border-gray-150 p-3 rounded-xl min-w-[210px] flex items-center justify-between gap-4 shadow-2xs">
                          <div>
                            <span className="text-[9px] text-gray-400 uppercase font-mono block leading-none font-bold">
                              {t("Honey Crop Spec", "Uainisho")}
                            </span>
                            <strong className="text-amber-950 text-[11px] block mt-1 font-semibold truncate max-w-[110px]">
                              {r.honeyType}
                            </strong>
                            <span className="text-[11px] text-gray-500 font-medium block mt-0.5">
                              {t("Qty", "Kiasi")}: <strong className="font-bold text-gray-800">{r.amountKg} Kg</strong>
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-[9px] text-gray-400 uppercase font-mono block leading-none font-bold">
                              {t("Payout Due", "Malipo Utakayopata")}
                            </span>
                            <strong className="text-xs font-black text-emerald-800 block mt-1 font-mono">
                              Ksh {r.payoutKes.toLocaleString()}
                            </strong>
                            <span className="text-[9px] text-stone-400 block mt-0.5">
                              {r.date}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Status Changer & Cancellation Buttons */}
                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] text-gray-400 uppercase font-mono font-bold">
                              {t("KBC Actions", "Hatua za KBC")}
                            </span>
                            <select
                              value={r.status}
                              onChange={(e) => handleUpdateBuybackStatus(r.id, e.target.value)}
                              className="text-[10px] font-bold p-1 px-1.5 border rounded-lg focus:outline-none bg-white hover:bg-stone-50 cursor-pointer uppercase transition duration-150 text-gray-600 font-sans"
                            >
                              <option value="Pending Review">Pending Review</option>
                              <option value="Collector Dispatched">Collector Dispatched</option>
                              <option value="Inspected & Approved">Inspected & Approved</option>
                              <option value="Paid">Mark as Paid</option>
                            </select>
                          </div>

                          <button
                            onClick={() => handleDeleteBuybackRequest(r.id)}
                            className="p-1 px-2.5 text-stone-400 hover:text-red-600 hover:bg-red-50 border border-stone-200 rounded-lg transition duration-150 self-end text-xs font-bold shrink-0 flex items-center gap-1.5"
                            title={t("Revoke Request", "Futa ombi")}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="text-[10px] uppercase font-bold">{t("Cancel", "Cancel")}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-[#1A4D2E]/5 border border-[#1A4D2E]/10 p-4.5 rounded-2xl flex items-start gap-3 mt-4">
                  <span className="text-lg">📢</span>
                  <div className="text-xs space-y-1">
                    <h6 className="font-extrabold text-[#1A4D2E] uppercase tracking-wide">
                      {t("Direct Kenya Bee Company Logistics Notice", "Notisi ya Usafirishaji ya Kenya Bee Company")}
                    </h6>
                    <p className="text-gray-600 leading-relaxed font-sans text-[11px]">
                      {t("When marked as 'Collector Dispatched', a certified bio-security technician is assigned with weighing scales to inspect your moisture content (must be below 19% standard) and transfer the raw honey. Payment is instantly sent to your verified phone number via real-time M-Pesa B2C payout API once verified.",
                         "Inapowekwa kama 'Mkusanyaji ametumwa', fundi aliyethibitishwa huja kupima uzito na kukagua maji kwenye asali (lazima iwe chini ya 19% ya kiwango cha KEBS). Malipo hutumwa mara moja kwa nambari yako ya simu iliyothibitishwa kupitia API ya M-Pesa.")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DAILY EXPENSE LEDGER SUB-TAB */}
      {activeSubTab === 'expenses' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Form & Statistics */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm">{t("Expense Summary", "Muhtasari wa Gharama")}</h3>
              <button
                onClick={() => setShowAddExpense(!showAddExpense)}
                className="p-1 px-2.5 bg-[#F5B800] hover:bg-amber-600 text-black font-semibold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{t("New Expense", "Gharama Mpya")}</span>
              </button>
            </div>

            {showAddExpense && (
              <form onSubmit={handleCreateExpense} className="bg-amber-50/50 border border-amber-250 p-4 rounded-2xl space-y-3 shadow-xs text-xs text-gray-800">
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">{t("Expense Title / Item Name*", "Jina la Bidhaa au Gharama*")}</label>
                  <input
                    type="text"
                    required
                    value={newExpenseName}
                    onChange={(e) => setNewExpenseName(e.target.value)}
                    placeholder={t("e.g., 50kg Sugar for auxiliary feeding", "Mfano: Sukari ya kulisha nyuki wakati wa ukame")}
                    className="w-full text-xs p-2.5 bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">{t("Amount (KES)*", "Kiasi (Shilingi)*")}</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newExpenseAmount || ""}
                      onChange={(e) => setNewExpenseAmount(Number(e.target.value))}
                      placeholder="e.g., 4500"
                      className="w-full text-xs p-2.5 bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">{t("Category", "Aina ya Gharama")}</label>
                    <select
                      value={newExpenseCategory}
                      onChange={(e) => setNewExpenseCategory(e.target.value as Expense['category'])}
                      className="w-full text-xs p-2.5 bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="Sugar/Feed">{t("Sugar & auxiliary Feed", "Kulisha Sukari")}</option>
                      <option value="Equipment">{t("Hive boxes & Equipment", "Kununua Mzinga")}</option>
                      <option value="Treatments">{t("Medicines & treatments", "Dawa za Nyuki")}</option>
                      <option value="Labor">{t("Labor & helpers", "Kazi na Malipo")}</option>
                      <option value="Transport">{t("Logistics & Transport", "Usafirishaji")}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">{t("Notes (Optional)", "Maelezo ya Ziada (Si lazima)")}</label>
                  <textarea
                    rows={2}
                    value={newExpenseNotes}
                    onChange={(e) => setNewExpenseNotes(e.target.value)}
                    placeholder={t("Bought from Agrovet Nakuru Branch...", "Kutoka duka la Agrovet Nakuru...")}
                    className="w-full text-xs p-2.5 bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none animate-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddExpense(false)}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-[11px] font-semibold text-gray-550 hover:bg-gray-50"
                  >
                    {t("Cancel", "Futa")}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#F5B800] hover:bg-amber-600 text-black rounded-xl text-[11px] font-extrabold"
                  >
                    {t("Save & Ledger", "Hifadhi Kwenye Leja")}
                  </button>
                </div>
              </form>
            )}

            {/* Expenses breakdown card */}
            <div className="bg-white border border-amber-100 p-5 rounded-2xl shadow-xs space-y-4 text-xs font-medium text-gray-700">
              <h4 className="font-extrabold text-[#F5B800] text-xs font-mono tracking-wider uppercase border-b border-amber-100 pb-2">{t("Spend Category Dist.", "Mchanganuo wa Gharama")}</h4>
              <div className="space-y-3 font-mono text-[10px] text-gray-650">
                {["Equipment", "Sugar/Feed", "Treatments", "Labor", "Transport"].map((cat) => {
                  const catSums = expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amountKes, 0);
                  const sharePct = totalExpensesKsh > 0 ? Math.round((catSums / totalExpensesKsh) * 100) : 0;
                  
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between font-bold text-gray-800">
                        <span>
                          {cat === "Equipment" && t("Hives & Gear", "Mizinga na Vifaa")}
                          {cat === "Sugar/Feed" && t("Auxiliary Feeding", "Oksijeni & Sukari")}
                          {cat === "Treatments" && t("Mite Treatments", "Matibabu ya Nyuki")}
                          {cat === "Labor" && t("Apiary Labor", "Kazi za Shamba")}
                          {cat === "Transport" && t("Logistics/Transport", "Usafirishaji")}
                        </span>
                        <span className="text-amber-900 font-black">Ksh {catSums.toLocaleString()} ({sharePct}%)</span>
                      </div>
                      <div className="w-full bg-amber-50 rounded-full h-1">
                        <div 
                          className="bg-[#F5B800] h-1 rounded-full animate-none"
                          style={{ width: `${sharePct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Ledger List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-amber-100 rounded-3xl p-6 shadow-xs">
              <h3 className="font-bold text-gray-900 text-sm mb-3.5">{t("Ledger Registry Logs", "Leja Kamili ya Matumizi ya Shamba")}</h3>
              
              <div className="space-y-3.5">
                {expenses.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-amber-250/60 rounded-2xl">
                    <p className="text-xs text-gray-400 font-bold">{t("No expenses have been registered yet.", "Hakuna gharama iliyorekodiwa bado.")}</p>
                  </div>
                ) : (
                  [...expenses].sort((a,b) => b.id.localeCompare(a.id)).map((exp) => (
                    <div key={exp.id} className="p-4 border border-amber-100 rounded-2xl hover:bg-amber-50/10 flex items-start gap-4 transition duration-150 text-gray-800">
                      <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-800 shrink-0 border border-amber-100">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between gap-2.5">
                          <span className="font-bold text-gray-950 text-[13px]">
                            {exp.category === "Sugar/Feed" && t("Sugar Auxiliary Feed", "Malisho ya Sukari")}
                            {exp.category === "Equipment" && t("Apiary Equipment & Gear", "Mizinga au Mavazi ya Shamba")}
                            {exp.category === "Treatments" && t("Mite Treatments & Medicines", "Dawa kuua Miti / Wadudu")}
                            {exp.category === "Labor" && t("Farm Labor & Helpers", "Malipo ya Wagavi")}
                            {exp.category === "Transport" && t("Logistics & Transport", "Usafirishaji ya Asali")}
                          </span>
                          <span className="font-mono text-xs font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-200">
                            Ksh {exp.amountKes.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-450 text-[10px] uppercase font-bold tracking-tight font-mono mt-0.5">{exp.date}</p>
                        {exp.description && (
                          <p className="text-gray-650 bg-amber-50/30 font-medium p-2 rounded-lg border border-[#F5B800]/20 text-[11px] mt-2.5 text-left">
                            <strong className="text-amber-900 font-bold uppercase text-[9px] block mb-0.5">{t("Ledger Details", "Maelezo ya Mhazini")}</strong>
                            {exp.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'analytics' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Overview KPI Bento Box Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-amber-100 p-5 rounded-3xl shadow-3xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                    {t("Honey Extracted (6M)", "Asali Iliyovunwa (Miezi 6)")}
                  </span>
                  <span className="text-xl">🍯</span>
                </div>
                <h4 className="text-2xl font-black text-gray-900 font-sans tracking-tight">
                  {totalHoneyLast6Months.toFixed(1)} <span className="text-xs text-gray-400 font-semibold uppercase">Kg</span>
                </h4>
              </div>
              <p className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 mt-3 max-w-max">
                ↑ {t("From natural nectar", "Kutoka tunda la asili")}
              </p>
            </div>

            <div className="bg-white border border-amber-100 p-5 rounded-3xl shadow-3xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                    {t("Wax & Byproducts (6M)", "Nishati Nyingine (Miezi 6)")}
                  </span>
                  <span className="text-xl">🕯️</span>
                </div>
                <h4 className="text-2xl font-black text-gray-900 font-sans tracking-tight">
                  {totalBeeswaxLast6Months.toFixed(1)} <span className="text-xs text-gray-400 font-semibold uppercase">Kg</span>
                </h4>
              </div>
              <p className="text-[10px] text-[#FF8C00] font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100 mt-3 max-w-max">
                {t("Pure Beeswax / Propolis", "Nta & Gundi")}
              </p>
            </div>

            <div className="bg-white border border-amber-100 p-5 rounded-3xl shadow-3xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                    {t("Avg Honey Moisture", "Wastani wa Unyevunyevu")}
                  </span>
                  <span className="text-xl">💧</span>
                </div>
                <h4 className="text-2xl font-black text-gray-900 font-sans tracking-tight">
                  {avgMoistureLast6Months > 0 ? `${avgMoistureLast6Months}%` : "17.2%"}
                </h4>
              </div>
              <p className="text-[10px] text-emerald-800 font-bold bg-[#E6F4EA] px-2 py-0.5 rounded-lg border border-emerald-200 mt-3 max-w-max flex items-center gap-1">
                <span>✓</span> {t("Excellent KEBS Quality (<19%)", "Ladha Bora na Salama kabisa")}
              </p>
            </div>

            <div className="bg-white border border-amber-100 p-5 rounded-3xl shadow-3xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                    {t("Est. Buyback Revenue", "Hali ya Mauzo ya KBC")}
                  </span>
                  <span className="text-xl">💸</span>
                </div>
                <h4 className="text-2xl font-black text-emerald-900 font-sans tracking-tight">
                  KES {buybackRevenueValuation.toLocaleString()}
                </h4>
              </div>
              <p className="text-[10px] text-amber-900 font-bold bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-200 mt-3 max-w-max">
                @ Ksh 1,280 / Kg
              </p>
            </div>
          </div>

          {/* Line Chart of honey harvest trends */}
          <div className="bg-white border border-amber-150 rounded-3xl p-5 md:p-6 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-amber-50">
              <div>
                <h3 className="font-bold text-gray-950 text-sm flex items-center gap-2">
                  <span>📈</span>
                  {t("6-Month Honey & Wax Harvesting Trend", "Mwenendo wa Uzalishaji wa Asali na Nta - Miezi 6")}
                </h3>
                <p className="text-xs text-gray-400">
                  {t("Compare dynamic real extraction metrics (Kg) against seasonal standard profiles.", 
                     "Linganisha uzalishaji wako halisi dhidi ya makadirio ya kawaida ya msimu.")}
                </p>
              </div>
              
              {/* Top performer information */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <span className="text-xs font-bold text-gray-500">{t("Apiary Champion:", "Bingwa wa Mzinga:")}</span>
                <span className="bg-[#1A4D2E] text-white text-xs px-3 py-1 rounded-full font-extrabold shadow-sm">
                  👑 {bestHiveName}
                </span>
              </div>
            </div>

            {/* Line Chart Container */}
            <div className="h-80 w-full" id="honey-harvest-chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={getAnalyticsData()}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2EFE9" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 'bold' }} 
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 'bold' }} 
                    axisLine={{ stroke: '#E5E7EB' }}
                    label={{ value: 'Kg', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 10, fill: '#9CA3AF' } }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF', 
                      borderRadius: '16px', 
                      border: '1px solid #ECE3D4', 
                      boxShadow: '0 4px 12px -2px rgba(0,0,0,0.05)' 
                    }}
                    labelStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#111827', fontFamily: 'monospace' }}
                    itemStyle={{ fontSize: '12px', padding: '1px 0' }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#374151', textTransform: 'uppercase' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Honey" 
                    name={t("Honey Yield (Kg)", "Mavuno ya Asali (Kg)")} 
                    stroke="#F4B400" 
                    strokeWidth={3} 
                    activeDot={{ r: 6 }} 
                    dot={{ stroke: '#F4B400', strokeWidth: 2, r: 4, fill: '#FFF' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Beeswax" 
                    name={t("Beeswax & Others (Kg)", "Nta na Propolis (Kg)")} 
                    stroke="#1A4D2E" 
                    strokeWidth={2} 
                    dot={{ stroke: '#1A4D2E', strokeWidth: 1, r: 3, fill: '#FFF' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Projection" 
                    name={t("Seasonal Reference Target", "Lengo la Marejeleo")} 
                    stroke="#A3A3A3" 
                    strokeWidth={1.5} 
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Moisture Quality Standards Chart */}
            <div className="bg-white border border-amber-100 rounded-3xl p-6 shadow-xs space-y-4">
              <div>
                <h4 className="font-bold text-gray-950 text-sm flex items-center gap-1.5">
                  <span>📊</span> {t("Moisture Level of Honey Crops", "Kipimo cha Unyevunyevu wa Asali")}
                </h4>
                <p className="text-xs text-gray-400">
                  {t("Moisture percent must remain below 19% to deter custom shelf-life fermentation.", 
                     "Kiwango cha juu cha unyevunyevu kinatakiwa kuwa chini ya 19% kuzuia asali kuharibika.")}
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getAnalyticsData()}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2EFE9" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 'bold' }} 
                      axisLine={{ stroke: '#E5E7EB' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 'bold' }} 
                      axisLine={{ stroke: '#E5E7EB' }}
                      domain={[0, 25]}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#FFF', borderRadius: '12px', border: '1px solid #ECE3D4' }}
                      labelStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                    />
                    <Bar 
                      dataKey="moisture" 
                      name={t("Avg Moisture (%)", "Unyevunyevu (%)")} 
                      fill="#3B82F6" 
                      radius={[4, 4, 0, 0]} 
                      maxBarSize={45}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Smart yield suggestions */}
            <div className="bg-white border border-amber-100 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm">🐝</div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider font-mono">
                      {t("Barnaby AI — Extraction & Quality Insights", "Ushauri wa Barnaby AI wa Kukuza Mavuno")}
                    </h4>
                    <p className="text-[11px] text-gray-500 font-medium">
                      {t("Dynamic optimizations based on current 6-month curves.", "Ushauri maalum kulingana na mienendo ya sasa ya mavuno")}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs divide-y divide-amber-50">
                  <div className="py-2.5 flex items-start gap-2.5">
                    <span className="text-emerald-700">✓</span>
                    <p className="text-gray-700">
                      <strong>{t("Moisture Level Safe:", "Kipimo cha Unyevunyevu Kiko Sawa:")}</strong>{" "}
                      {t("Your current average of 17.2% qualifies for Premium Grade A export. Package into airtight jars immediately.", 
                         "Wastani wako wa sasa wa 17.2% unakubalika kwa soko la nje ya nchi (Grade A).")}
                    </p>
                  </div>

                  <div className="py-2.5 flex items-start gap-2.5">
                    <span className="text-amber-700">🍯</span>
                    <p className="text-gray-700">
                      <strong>{t("Nectar Flow Windows:", "Kipupwe cha Maua na Nectar:")}</strong>{" "}
                      {t("Prepare your hives with deep honey supers by late November. Kitui counties undergo massive Acacia pollination starting early December.", 
                         "Andaa mizinga yako kwa kuongeza masanduku mapema mwezi wa Novemba ili nyuki waweze kuvuna nectar ya Acacia Kitui.")}
                    </p>
                  </div>

                  <div className="py-2.5 flex items-start gap-2.5">
                    <span className="text-[#FF8C00]">💡</span>
                    <p className="text-gray-700">
                      <strong>{t("Extract Comb Care:", "Uhifadhi wa Seli za Nta:")}</strong>{" "}
                      {t("Avoid heat damage to extracted honey beeswax. Use a solar wax lifter melter during midday hours to maintain bright color grades.", 
                         "Usitumie bunduki ya moto au joto kali kukausha nta. Tumia kisafishaji cha nishati ya jua wakati mchana.")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action link */}
              <div className="bg-amber-50/50 rounded-2xl p-3 border border-amber-200/50 text-[11px] text-amber-900 font-semibold flex items-center justify-between mt-2">
                <span>{t("Need help on increasing global honey quality grade parameters?", "Je, unahitaji msaada ili kukuza zaidi ubora wa asali?")}</span>
                <button 
                  onClick={() => setActiveSubTab('hives')}
                  className="bg-[#1A4D2E] text-white px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold shrink-0 shadow-3xs"
                >
                  {t("Inspect Hives", "Kagua Mizinga")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'blog' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-amber-100">
            <div>
              <h3 className="font-extrabold text-gray-950 text-base flex items-center gap-2">
                <span>📚</span>
                {t("Beekeeping Blog & Extension Agency", "Kituo cha Makala na Elimu ya Ufugaji Nyuki")}
              </h3>
              <p className="text-xs text-gray-500">
                {t("Publish extension articles, hive health journals, and harvest tips to educate customers and guests.", 
                   "Andika makala, ripoti za afya ya nyuki na mbinu za uvunaji ili kuelimisha wateja na wageni wako.")}
              </p>
            </div>
            
            <button
              onClick={() => {
                if (blogShowForm) {
                  handleResetBlogForm();
                } else {
                  setBlogShowForm(true);
                }
              }}
              className="px-4 py-2 bg-[#1A4D2E] hover:bg-[#F4B400] text-white hover:text-black font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition duration-150 cursor-pointer self-start md:self-auto"
            >
              {blogShowForm ? "✕" : <Plus className="w-4 h-4" />}
              <span>{blogShowForm ? t("Cancel", "Futa") : t("Write New Post", "Andika Makala Mpya")}</span>
            </button>
          </div>

          {/* Form Block (Write / Edit) */}
          {blogShowForm && (
            <div className="bg-amber-50/40 border border-amber-200 p-5 md:p-6 rounded-3xl shadow-xs space-y-4 animate-in slide-in-from-top-4 duration-300">
              <h4 className="font-extrabold text-[#1A4D2E] text-xs uppercase font-mono tracking-wider">
                {blogEditingId 
                  ? t("📝 Edit Beekeeping Publication", "📝 Hariri Makala ya Ufugaji Nyuki") 
                  : t("✍️ Create New Beekeeping Publication", "✍️ Andaa Makala Mpya ya Ufugaji Nyuki")}
              </h4>

              <form onSubmit={handleSaveBlogPost} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {t("Title / Heading *", "Kichwa cha Habari *")}
                    </label>
                    <input
                      type="text"
                      required
                      value={blogTitle}
                      onChange={(e) => setBlogTitle(e.target.value)}
                      placeholder={t("e.g., 5 Ways to Keep Queen Bees Active", "Mf. Njia 5 za Kuweka Malkia Akiwa Imara")}
                      className="w-full bg-white border border-amber-200/80 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        {t("Category *", "Kundi / Jamii *")}
                      </label>
                      <select
                        value={blogCategory}
                        onChange={(e) => setBlogCategory(e.target.value as any)}
                        className="w-full bg-white border border-amber-200/80 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                      >
                        <option value="Beekeeping">{t("Beekeeping", "Ufugaji Nyuki")}</option>
                        <option value="Honey Harvests">{t("Honey Harvests", "Mavuno ya Asali")}</option>
                        <option value="Bee Health">{t("Bee Health", "Afya ya Nyuki")}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        {t("Publication Status *", "Hali ya Makala *")}
                      </label>
                      <select
                        value={blogStatus}
                        onChange={(e) => setBlogStatus(e.target.value as any)}
                        className="w-full bg-white border border-amber-200/80 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                      >
                        <option value="Published">{t("Live & Published", "Imechapishwa Moja kwa Moja")}</option>
                        <option value="Draft">{t("Draft (Internal Only)", "Rasimu ya Ndani Pekee")}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {t("Cover Image URL (Optional)", "Anwani ya Picha - Sio Lazima")}
                    </label>
                    <input
                      type="url"
                      value={blogImageUrl}
                      onChange={(e) => setBlogImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full bg-white border border-amber-200/80 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-3 flex flex-col justify-between">
                  <div className="flex-1 flex flex-col">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {t("Article Content (Markdown supported) *", "Maelezo ya Makala *")}
                    </label>
                    <textarea
                      required
                      value={blogContent}
                      onChange={(e) => setBlogContent(e.target.value)}
                      rows={6}
                      placeholder={t("Write detailed observations, guidance points, or harvest results...", "Andika maelezo ya kina, ushauri, kiasi kilichovunwa, n.k...")}
                      className="w-full flex-1 bg-white border border-amber-200/80 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none resize-none animate-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleResetBlogForm}
                      className="px-3.5 py-1.5 border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      {t("Cancel", "Ghairi")}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{blogEditingId ? t("Save Changes", "Hifadhi Maandishi") : t("Publish Post", "Chapisha Makala")}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Search and Category Filtering Bar */}
          <div className="bg-white border border-amber-100 p-4 rounded-3xl shadow-3xs flex flex-col sm:flex-row items-center gap-3 justify-between">
            <div className="w-full sm:w-72 relative">
              <input
                type="text"
                placeholder={t("Search publications...", "Tafuta makala...")}
                value={blogSearch}
                onChange={(e) => setBlogSearch(e.target.value)}
                className="w-full bg-amber-50/30 border border-amber-100 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:ring-1 focus:ring-amber-400 outline-none text-gray-800"
              />
              <span className="absolute left-2.5 top-2 text-[#F4B400]">🔍</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono shrink-0">
                {t("Filter:", "Chuja:")}
              </span>
              {["All", "Beekeeping", "Honey Harvests", "Bee Health"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setBlogFilterCategory(cat)}
                  className={`px-3 py-1 text-[10px] font-extrabold rounded-full transition cursor-pointer ${
                    blogFilterCategory === cat 
                      ? "bg-amber-400 text-black shadow-3xs" 
                      : "bg-gray-100 text-gray-500 hover:bg-[#1A4D2E]/10"
                  }`}
                >
                  {cat === "All" ? t("All Topics", "Mada Zote") : t(cat, cat === "Beekeeping" ? "Ufugaji Nyuki" : cat === "Honey Harvests" ? "Mavuno ya Asali" : "Afya ya Nyuki")}
                </button>
              ))}
            </div>
          </div>

          {/* Main List of Blog Posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts
              .filter((post) => {
                const matchesSearch = post.title.toLowerCase().includes(blogSearch.toLowerCase()) || 
                  post.content.toLowerCase().includes(blogSearch.toLowerCase());
                const matchesCategory = blogFilterCategory === "All" || post.category === blogFilterCategory;
                return matchesSearch && matchesCategory;
              })
              .map((post) => {
                const categoryColor = post.category === "Bee Health" 
                  ? "bg-red-50 text-red-700 border-red-100" 
                  : post.category === "Honey Harvests"
                    ? "bg-amber-50 text-amber-800 border-amber-150"
                    : "bg-emerald-50 text-emerald-800 border-emerald-100";

                return (
                  <div key={post.id} className="bg-white border border-amber-100 hover:border-amber-400/50 rounded-3xl overflow-hidden shadow-3xs flex flex-col justify-between transition duration-200 group">
                    {/* Optional cover thumbnail */}
                    {post.imageUrl ? (
                      <div className="h-36 w-full overflow-hidden relative bg-stone-100">
                        <img 
                          src={post.imageUrl} 
                          alt={post.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2.5 right-2.5 bg-black/50 text-white rounded-md text-[9px] uppercase font-bold font-mono px-1.5 py-0.5">
                          {post.status === 'Published' ? t("LIVE", "IMENYOKA") : t("DRAFT", "RASIMU")}
                        </div>
                      </div>
                    ) : (
                      <div className="h-36 w-full bg-gradient-to-br from-amber-50 to-orange-50/40 relative flex items-center justify-center p-4">
                        <span className="text-4xl">
                          {post.category === "Bee Health" ? "🏥" : post.category === "Honey Harvests" ? "🍯" : "🐝"}
                        </span>
                        <div className="absolute top-2.5 right-2.5 bg-black/40 text-white rounded-md text-[9px] uppercase font-bold font-mono px-1.5 py-0.5">
                          {post.status === 'Published' ? t("LIVE", "IMENYOKA") : t("DRAFT", "RASIMU")}
                        </div>
                      </div>
                    )}

                    {/* Blog Card Content Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-wider ${categoryColor}`}>
                            {t(post.category, post.category === "Beekeeping" ? "Ufugaji Nyuki" : post.category === "Honey Harvests" ? "Mavuno ya Asali" : "Afya ya Nyuki")}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono font-medium">
                            {post.publishedAt || post.createdAt}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-gray-950 text-xs sm:text-sm line-clamp-2 leading-tight group-hover:text-[#1A4D2E] transition">
                          {post.title}
                        </h4>

                        <p className="text-[11px] text-gray-500 line-clamp-3 leading-relaxed">
                          {post.content}
                        </p>
                      </div>

                      {/* Interaction Summary & Controls */}
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold font-mono">
                          <span className="flex items-center gap-1">
                            <span>❤️</span> {post.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <span>💬</span> {post.comments.length}
                          </span>
                        </div>

                        {/* Farmer Controls */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEditBlogPostClick(post)}
                            className="p-1.5 bg-gray-100 hover:bg-amber-100 text-gray-650 hover:text-amber-950 rounded-lg transition cursor-pointer"
                            title={t("Edit Post", "Hariri Makala")}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          
                          {/* Toggle publish state directly from card */}
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateBlogPost({
                                ...post,
                                status: post.status === 'Published' ? 'Draft' : 'Published',
                                publishedAt: post.status === 'Published' ? null : new Date().toISOString().split('T')[0]
                              });
                            }}
                            className={`p-1 px-2 font-mono text-[9px] font-black rounded-lg transition border cursor-pointer ${
                              post.status === 'Published' 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-amber-100 hover:text-black hover:border-amber-200' 
                                : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200'
                            }`}
                            title={post.status === 'Published' ? t("Unpublish", "Badili kuwa Rasimu") : t("Publish Now", "Chapisha sasa")}
                          >
                            {post.status === 'Published' ? t("Live", "Hai") : t("Draft", "Rasimu")}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(t("Are you sure you want to delete this publication?", "Je, una uhakika unataka kufuta makala hii?"))) {
                                onDeleteBlogPost(post.id);
                              }
                            }}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg transition cursor-pointer font-bold"
                            title={t("Delete Post", "Futa Makala")}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Direct Review of visitor comments within Farmer view */}
                    {post.comments.length > 0 && (
                      <div className="bg-amber-100/10 border-t border-amber-100/50 p-4 space-y-2 max-h-36 overflow-y-auto text-xs">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                          {t("Guest Reviews / Comments", "Maoni ya Wageni")} ({post.comments.length})
                        </span>
                        <div className="space-y-1.5">
                          {post.comments.map((comm) => (
                            <div key={comm.id} className="bg-white border border-[#F2EFE9] rounded-xl p-2 space-y-0.5 shadow-3xs">
                              <div className="flex items-center justify-between text-[10px] font-bold text-gray-650">
                                <span className="font-sans">👤 {comm.authorName}</span>
                                <span className="font-mono text-[8px] text-gray-400">{comm.date}</span>
                              </div>
                              <p className="text-[10px] text-gray-650 font-sans leading-tight">
                                {comm.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

            {blogPosts.filter((post) => {
              const matchesSearch = post.title.toLowerCase().includes(blogSearch.toLowerCase()) || 
                post.content.toLowerCase().includes(blogSearch.toLowerCase());
              const matchesCategory = blogFilterCategory === "All" || post.category === blogFilterCategory;
              return matchesSearch && matchesCategory;
            }).length === 0 && (
              <div className="col-span-full py-12 text-center bg-gray-50 border border-dashed border-amber-200 rounded-3xl">
                <span className="text-4xl">📭</span>
                <p className="text-xs text-gray-400 font-bold mt-2 font-mono">
                  {t("No publications match your criteria.", "Hakuna makala yoyote inayolingana na ulivyotafuta.")}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
