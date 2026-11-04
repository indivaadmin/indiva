export type Role = "customer" | "founder" | "admin";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // in INR
  category: string;
  tags: string[];
  image: string; // emoji / gradient placeholder rendered as art
  rating: number;
  reviews: number;
  stock: number;
  featured?: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  qty: number;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  items: { productId: string; name: string; price: number; qty: number }[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  orders: number;
  spent: number;
  joinedAt: string;
}

export interface Analytics {
  revenue: number;
  orders: number;
  customers: number;
  avgOrderValue: number;
  revenueByDay: { day: string; revenue: number }[];
  topProducts: { name: string; sold: number; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
  categoryRevenue: { category: string; revenue: number }[];
}
