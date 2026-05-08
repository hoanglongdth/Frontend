// src/hooks/useTransactions.ts
import { useState, useEffect } from "react";
import { Transaction } from "../types";
import { db, auth } from "../services/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    // Nếu là admin, lấy tất cả transactions; ngược lại chỉ của user hiện tại
    const isAdmin = user.email === "admin@admin.com";
    const q = isAdmin
      ? query(collection(db, "transactions"), orderBy("createdAt", "desc"))
      : query(
          collection(db, "transactions"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
        );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Transaction[];
      setTransactions(txs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { transactions, loading };
};
