"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react"; // Tambah useCallback
import Image from "next/image";
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { API_URL } from "@/lib/api";

interface Order {
  id: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  orderDate: string;
  transactionId?: string;
}

// Gue ganti namanya sedikit biar gak bentrok sama penamaan folder/page di build log
export default function PaymentPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pakai useCallback biar fetchOrders stabil pas di-render
  const fetchOrders = useCallback(async () => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [router]); // Tambah dependency router

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]); // Masukin fetchOrders ke sini

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "QRIS":
        return <Smartphone size={20} className="text-blue-600" />;
      case "CASH":
        return <CreditCard size={20} className="text-green-600" />;
      default:
        return <CreditCard size={20} className="text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle size={16} className="text-green-600" />;
      case "PENDING":
        return <Clock size={16} className="text-yellow-600" />;
      case "CANCELED":
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <XCircle className="text-red-600 mb-2" size={48} />
        <p className="text-red-600 font-medium">Error: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff] font-sans">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#6B3C2D] to-[#9B6C57] p-6 text-white">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white/30 rounded-full backdrop-blur-sm hover:bg-white/40 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold">Detail Pembayaran</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Belum ada riwayat pembayaran</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-md p-4 border border-gray-100"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {getPaymentIcon(order.paymentMethod)}
                    <div>
                      <p className="font-semibold text-gray-800">Order #{order.id}</p>
                      <p className="text-sm text-gray-500">{order.paymentMethod}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.paymentStatus)}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Total</span>
                    <span className="font-semibold text-gray-800">Rp {order.totalAmount.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Tanggal</span>
                    <span className="text-gray-800">{new Date(order.orderDate).toLocaleDateString("id-ID", { dateStyle: 'long' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}