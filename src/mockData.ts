import { Hive, Inspection, Harvest, Product, Order, Expense } from "./types";

export const initialHives: Hive[] = [
  {
    id: "hive-1",
    name: "Kakamega Forest Stand",
    location: "Kakamega Canopy - Plot B",
    type: "Langstroth",
    healthScore: 94,
    status: "Healthy",
    queenStatus: "Present & Laying",
    temp: 34.8,
    humidity: 55,
    breed: "African Honey Bee (Apis mellifera scutellata)",
    notes: "Aggressive defenders but top-tier honey producers. Queen spotted and highly active. High honey super filling rate.",
    createdAt: "2026-02-10"
  },
  {
    id: "hive-2",
    name: "Baringo Acacia Valley",
    location: "Rift Valley Plains - North Ridge",
    type: "Top-Bar",
    healthScore: 88,
    status: "Active",
    queenStatus: "Present & Laying",
    temp: 33.9,
    humidity: 50,
    breed: "African Honey Bee (Apis mellifera scutellata)",
    notes: "Top-Bar traditional design. Exceptionally pale, light acacia nectar gathered. Minimal mite counts.",
    createdAt: "2026-03-05"
  },
  {
    id: "hive-3",
    name: "Aberdare Range Forest",
    location: "Highland Forest Border - Block 4",
    type: "Warre",
    healthScore: 71,
    status: "Under Observation",
    queenStatus: "Not Spotted",
    temp: 31.4,
    humidity: 62,
    breed: "Mountain Bee (Apis mellifera monticola)",
    notes: "Darker high-altitude bees. Currently sluggish due to heavy rains. Being monitored for potential emergency splits.",
    createdAt: "2026-04-12"
  },
  {
    id: "hive-4",
    name: "Mount Kenya Foothills Colony",
    location: "Nursery Greenhouse Stand",
    type: "Nucleus",
    healthScore: 96,
    status: "Healthy",
    queenStatus: "Present & Laying",
    temp: 34.5,
    humidity: 52,
    breed: "African Honey Bee (Apis mellifera scutellata)",
    notes: "Vibrant brood development. High pollen capture. Excellent queen laying pattern recently confirmed.",
    createdAt: "2026-05-01"
  }
];

export const initialInspections: Inspection[] = [
  {
    id: "ins-1",
    hiveId: "hive-1",
    date: "2026-05-28",
    status: "Healthy",
    healthScore: 94,
    temp: 34.6,
    humidity: 56,
    observations: "Double honey super is 80% filled and capped. No varroa mites seen. Excellent swarm cup control.",
    actionTaken: "Added empty queen excluder and second honey super. Cleaned landing board debris.",
    smartAdvice: "Colony is near peak strength! Schedule harvest split immediately to prevent natural absconding or wild swarming."
  },
  {
    id: "ins-2",
    hiveId: "hive-3",
    date: "2026-06-03",
    status: "Weak",
    healthScore: 71,
    temp: 31.4,
    humidity: 62,
    observations: "Spotty capping. Queen not seen. Heavy rain has chilled hive entrance.",
    actionTaken: "Reduced hive entrance. Supplied warm 1:1 sugar feed. Cleaned bottom tray.",
    smartAdvice: "Chilled climate detected. Keep background insulated and inspect in 48 hours for emergency queen cells. Consider moving hive box if rain floods."
  }
];

export const initialHarvests: Harvest[] = [
  {
    id: "harv-1",
    hiveId: "hive-1",
    date: "2026-05-15",
    amountKg: 28.5,
    honeyType: "Multi-floral",
    yieldType: "Honey",
    moisturePercent: 16.8,
    grade: "Raw Unfiltered",
    notes: "Beautiful rich dark texture. Clean centrifugal extraction. KEBS Grade A moisture level achieved."
  },
  {
    id: "harv-2",
    hiveId: "hive-2",
    date: "2026-05-20",
    amountKg: 19.2,
    honeyType: "Acacia",
    yieldType: "Honey",
    moisturePercent: 17.5,
    grade: "Grade A",
    notes: "Supremely clear golden acacia honey. Excellent aromatic finish."
  },
  {
    id: "harv-3",
    hiveId: "hive-1",
    date: "2026-05-21",
    amountKg: 4.2,
    honeyType: "Multi-floral",
    yieldType: "Beeswax",
    moisturePercent: 18.0,
    grade: "Grade A",
    notes: "Pure pristine golden beeswax cap melter harvest."
  }
];

export const initialExpenses: Expense[] = [
  {
    id: "exp-1",
    hiveId: "hive-1",
    date: "2026-04-10",
    category: "Equipment",
    amountKes: 4800,
    description: "Anti-sting full canvas bee suit with boots and reinforced leather gloves"
  },
  {
    id: "exp-2",
    hiveId: "hive-2",
    category: "Equipment",
    date: "2026-04-18",
    amountKes: 3500,
    description: "Stainless steel beehive smoker with protective safety guard"
  },
  {
    id: "exp-3",
    hiveId: "hive-3",
    category: "Sugar/Feed",
    date: "2026-05-02",
    amountKes: 1200,
    description: "Premium brown sugar feed supplement bags for cold weather maintenance"
  },
  {
    id: "exp-4",
    hiveId: "hive-4",
    category: "Treatments",
    date: "2026-05-12",
    amountKes: 1500,
    description: "Organic essential oil varroa treatment pads and thymol trays"
  }
];

export const initialProducts: Product[] = [
  {
    id: "prod-acacia",
    name: "Baringo Raw Acacia Nectar",
    description: "Harvested from dry acacia woodlands of Baringo county. Incredible pale clear golden hue, smooth slow crystallization, and light delicate flavor. Highly prized organic honey.",
    price: 15.00,
    stock: 92,
    image: "🍯",
    type: "honey",
    flavorProfile: "Slow Crystallizing Pure Sweet",
    colorHex: "#FCD34D",
    sizeOz: 16,
    rating: 4.9,
    reviewsCount: 54
  },
  {
    id: "prod-kakamega",
    name: "Kakamega Forest Dark Multi-Floral",
    description: "Deep mahogany multi-floral rich honey from the dense tropical rain forest canopies. Rich in natural local pollen, vitamins, and antioxidants. Unfiltered and cold-centrifuged.",
    price: 12.00,
    stock: 65,
    image: "🌿",
    type: "honey",
    flavorProfile: "Rich Forest Tannin & Earthy",
    colorHex: "#B45309",
    sizeOz: 16,
    rating: 5.0,
    reviewsCount: 47
  },
  {
    id: "prod-propolis",
    name: "Pure Premium Propolis Tincture",
    description: "Hand-extracted concentrated bee propolis in dropper bottles. Gathered from wild mountain pines and medicinal shrubs. Naturally supports wellness with strong antibacterial benefits.",
    price: 24.00,
    stock: 35,
    image: "⭐",
    type: "honey",
    flavorProfile: "Earthy, Bitter & Highly Active",
    colorHex: "#10B981",
    sizeOz: 2,
    rating: 4.8,
    reviewsCount: 22
  },
  {
    id: "prod-beeswax-candle",
    name: "Athi River Pure Beeswax Candle",
    description: "Handmade solid beeswax candles that emit a warm soft glow and sweet natural honey scent. Burns clean without producing toxic soot. Hypoallergenic.",
    price: 8.50,
    stock: 140,
    image: "🕯️",
    type: "beeswax",
    flavorProfile: "Warm Honeycomb Amber Ray",
    colorHex: "#FBBF24",
    sizeOz: 8,
    rating: 4.7,
    reviewsCount: 16
  }
];

export const initialOrders: Order[] = [
  {
    id: "ord-1002",
    customerName: "Kamau Njoroge",
    customerEmail: "kamau.njo@outlook.com",
    customerPhone: "+254 712 345678",
    items: [
      { productId: "prod-acacia", productName: "Baringo Raw Acacia Nectar", quantity: 2, price: 15.00 },
      { productId: "prod-beeswax-candle", productName: "Athi River Pure Beeswax Candle", quantity: 1, price: 8.50 }
    ],
    total: 38.50,
    status: "Delivered",
    date: "2026-05-24",
    shippingAddress: "Ngong Road, Suite 4B, Nairobi"
  },
  {
    id: "ord-1003",
    customerName: "Fatuma Mwangi",
    customerEmail: "fatuma.mwangi@gmail.com",
    customerPhone: "+254 722 987654",
    items: [
      { productId: "prod-kakamega", productName: "Kakamega Forest Dark Multi-Floral", quantity: 1, price: 12.00 }
    ],
    total: 12.00,
    status: "Pending",
    date: "2026-06-05",
    shippingAddress: "Kasarani Estate, Lane 10, Nairobi"
  }
];
