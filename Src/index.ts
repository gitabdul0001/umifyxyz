export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Product {
  id: string;
  userId: string;
  name: string;
  description: string;
  price: number;
  image: string; // Keep for backward compatibility
  images?: string[]; // New field for multiple images
  features: string[];
  walletAddress: string;
  uniqueCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  walletAddress: string;
  orderDate: string;
  notes?: string;
  txHash?: string;
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Wishlist {
  id: string;
  productId: string;
  email: string;
  createdAt: string;
  productName?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}