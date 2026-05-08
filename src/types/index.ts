// src/types/index.ts
export interface User {
  uid: string;
  email: string;
  fullName: string;
  initialBalance: number;
}

export interface Transaction {
  id: string;
  userId: string;
  title: string;
  amount: number;
  category: string;
  icon: string;
  color: string;
  createdAt: Date | any; // Firestore Timestamp or Date
}

export interface Category {
  label: string;
  icon: string;
  color: string;
}

export interface AuthError {
  code: string;
  message: string;
}
