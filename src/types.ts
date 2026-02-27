import React from 'react';

export interface ApiService {
  service: number;
  name: string;
  type: string;
  category: string;
  rate: string;
  min: string;
  max: string;
  refill: boolean;
  cancel: boolean;
}

export interface Service {
  id: string;
  name: string;
  ratePer1000: number;
  min: number;
  max: number;
  description: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  services: Service[];
}

export interface Order {
  id: string;
  category: string;
  service: string;
  link: string;
  quantity: number;
  charge: number;
  transactionId: string;
  status: string;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  method: 'nagad' | 'bkash';
  amount: number;
  transactionId: string;
  status: 'pending' | 'completed' | 'rejected';
  createdAt: string;
}

export interface UserData {
  userId: string;
  email: string;
  name: string;
  balance: number;
}
