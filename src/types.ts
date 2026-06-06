/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Hive {
  id: string;
  name: string;
  location: string;
  type: 'Langstroth' | 'Top-Bar' | 'Warre' | 'Nucleus';
  healthScore: number; // 0 to 100
  status: 'Healthy' | 'Active' | 'Under Observation' | 'Weak' | 'Treatment Needed';
  queenStatus: 'Present & Laying' | 'Present but Mated' | 'Not Spotted' | 'Missing';
  temp: number; // in C
  humidity: number; // in %
  breed: string; // e.g., Italian, Carniolan, Buckfast
  notes: string;
  createdAt: string;
}

export interface Inspection {
  id: string;
  hiveId: string;
  date: string;
  status: string;
  healthScore: number;
  temp: number;
  humidity: number;
  observations: string;
  actionTaken: string;
  smartAdvice?: string; // Generated with Gemini
}

export interface Harvest {
  id: string;
  hiveId: string;
  date: string;
  amountKg: number;
  honeyType: 'Wildflower' | 'Clover' | 'Manuka' | 'Orange Blossom' | 'Buckwheat' | 'Acacia' | 'Eucalyptus' | 'Multi-floral';
  yieldType: 'Honey' | 'Beeswax' | 'Propolis' | 'Pollen';
  moisturePercent: number; // ideally 16-18%
  grade: 'Grade A' | 'Grade B' | 'Raw Unfiltered';
  notes: string;
}

export interface Expense {
  id: string;
  hiveId: string;
  date: string;
  category: 'Equipment' | 'Sugar/Feed' | 'Treatments' | 'Labor' | 'Transport';
  amountKes: number; // Kenyan Shillings
  description: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string; // Placeholder or generated asset
  type: 'honey' | 'beeswax' | 'propolis' | 'starter-kit';
  flavorProfile: string; // e.g., "Floral & Smooth", "Woody & Rich"
  colorHex: string; // for theme UI
  sizeOz: number;
  rating: number;
  reviewsCount: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: OrderItem[];
  total: number;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Paid';
  date: string;
  shippingAddress: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
