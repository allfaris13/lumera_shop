"use client";

import { useState, useEffect } from "react";
import { API_URL } from "@/lib/api";

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  subtotal: number;
  product: {
    id: number;
    name: string;
  };
}

interface Order {
  id: number;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  orderDate: string;
  items: OrderItem[];
}

export default function OrderTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All orders");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) {
        console.error("No admin token found");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/orders/admin`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else if (response.status === 401) {
        console.error("Unauthorized: Invalid or expired admin token");
      }
    } catch (error: any) {
      console.error("Failed to fetch orders:", error?.message || error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (orderId: number) => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) {
        alert("No admin token found. Please login again.");
        return;
      }

      const response = await fetch(`${API_URL}/api/orders/${orderId}/payment`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ paymentStatus: "COMPLETED" }),
      });

      if (response.ok) {
        fetchOrders(); // Refresh orders
      } else if (response.status === 401) {
        alert("Session expired. Please login again.");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to confirm payment");
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      alert("Error confirming payment. Please try again.");
    }
  };

  const badgeColor = (status: string) => {
    if (status === "PENDING") return "bg-red-100 text-red-600";
    if (status === "COMPLETED") return "bg-green-100 text-green-600";
    return "bg-blue-100 text-blue-600";
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "All orders") return true;
    if (activeTab === "Pending") return order.paymentStatus === "PENDING";
    if (activeTab === "Completed") return order.paymentStatus === "COMPLETED";
    return true;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="text-center py-8">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b">
        {["All orders", "Pending", "Completed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-sm font-medium ${activeTab === tab
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-400 hover:text-blue-600"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead className="text-gray-500 border-b text-left">
          <tr>
            <th className="py-3 px-2 font-semibold">ID</th>
            <th className="py-3 px-2 font-semibold">Buyer Name</th>
            <th className="py-3 px-2 font-semibold">Phone</th>
            <th className="py-3 px-2 font-semibold">Date</th>
            <th className="py-3 px-2 font-semibold">Method</th>
            <th className="py-3 px-2 font-semibold">Total Price</th>
            <th className="py-3 px-2 font-semibold">Status</th>
            <th className="py-3 px-2 font-semibold text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr
              key={order.id}
              className="border-b last:border-none hover:bg-blue-50 transition"
            >
              <td className="py-4 px-2 font-bold text-gray-900">#{order.id}</td>
              <td className="py-4 px-2 font-semibold text-blue-900">{order.user.name}</td>
              <td className="py-4 px-2 text-gray-700 font-medium">{order.user.phone}</td>
              <td className="py-4 px-2 text-gray-500">{new Date(order.orderDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
              <td className="py-4 px-2 text-gray-800 font-medium">{order.paymentMethod}</td>
              <td className="py-4 px-2 font-bold text-gray-900">Rp {order.totalAmount.toLocaleString('id-ID')}</td>
              <td>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${badgeColor(
                    order.paymentStatus
                  )}`}
                >
                  {order.paymentStatus}
                </span>
              </td>
              <td>
                {order.paymentMethod === "CASH" &&
                  order.paymentStatus === "PENDING" && (
                    <button
                      onClick={() => handleConfirmPayment(order.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                    >
                      Confirm
                    </button>
                  )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
