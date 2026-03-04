"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  Eye,
  X,
  Calendar,
  Receipt,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  subtotal: number;
  product: {
    id: number;
    name: string;
    imageUrl?: string;
  };
}

interface Order {
  id: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  orderDate: string;
  items: OrderItem[];
}

export default function OrderHistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("http://localhost:5000/api/orders", {
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

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const calculateSubtotal = (order: Order) => {
    return order.items.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const calculateTax = (subtotal: number) => {
    return subtotal * 0.1; // 10% tax
  };

  const calculateDeliveryFee = () => {
    return 5000; // Fixed delivery fee
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600 p-4">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-[#fff] font-sans">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#6B3C2D] to-[#9B6C57] p-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white/30 rounded-full text-white backdrop-blur-sm hover:bg-white/40 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold text-white">Order History</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 pb-24">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No orders yet</p>
            <p className="text-gray-400 text-sm mt-2">
              Your order history will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-md p-4 border border-gray-100"
              >
                {/* Order Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-gray-800">
                      Order #{order.id}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.orderDate).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.paymentStatus)}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        order.paymentStatus
                      )}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {order.paymentMethod}
                  </span>
                </div>

                {/* Order Items */}
                <div className="space-y-2 mb-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                    >
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        {item.product.imageUrl ? (
                          <Image
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            width={48}
                            height={48}
                            className="rounded-lg object-cover"
                          />
                        ) : (
                          <Package size={20} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-800">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.quantity} x Rp{" "}
                          {(item.subtotal / item.quantity).toLocaleString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                      <p className="font-semibold text-sm text-gray-800">
                        Rp {item.subtotal.toLocaleString("id-ID")}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Total and View Details */}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-gray-800">Total</span>
                    <span className="font-bold text-lg text-[#5B2D24]">
                      Rp {order.totalAmount.toLocaleString("id-ID")}
                    </span>
                  </div>
                  
                  {/* View Details Button */}
                  <button
                    onClick={() => openOrderDetails(order)}
                    className="w-full bg-[#7B4540] text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#5B2D24] transition-colors"
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800">Order Details</h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-6">
              {/* Order Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Receipt size={20} className="text-[#7B4540]" />
                  <h3 className="font-semibold text-gray-800">Order Information</h3>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium">#{selectedOrder.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {new Date(selectedOrder.orderDate).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status:</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedOrder.paymentStatus)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.paymentStatus)}`}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        {item.product.imageUrl ? (
                          <Image
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            width={48}
                            height={48}
                            className="rounded-lg object-cover"
                          />
                        ) : (
                          <Package size={20} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-800">{item.product.name}</p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity} × Rp {(item.subtotal / item.quantity).toLocaleString("id-ID")}
                        </p>
                      </div>
                      <p className="font-semibold text-sm text-gray-800">
                        Rp {item.subtotal.toLocaleString("id-ID")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Price Breakdown</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">Rp {calculateSubtotal(selectedOrder).toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (10%):</span>
                    <span className="font-medium">Rp {calculateTax(calculateSubtotal(selectedOrder)).toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee:</span>
                    <span className="font-medium">Rp {calculateDeliveryFee().toLocaleString("id-ID")}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-800">Total Amount:</span>
                      <span className="font-bold text-lg text-[#7B4540]">
                        Rp {selectedOrder.totalAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Payment Information</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#7B4540] rounded-lg flex items-center justify-center">
                      <CreditCard size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{selectedOrder.paymentMethod}</p>
                      <p className="text-sm text-gray-500">
                        Payment Status: <span className="font-medium">{selectedOrder.paymentStatus}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={closeModal}
                className="w-full bg-[#7B4540] text-white py-3 px-4 rounded-xl font-medium hover:bg-[#5B2D24] transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
