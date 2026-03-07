"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { ArrowLeft, CreditCard, Smartphone, CheckCircle, Clock, XCircle } from "lucide-react"
import { API_URL } from "@/lib/api"

interface Order {
  id: number
  totalAmount: number
  paymentMethod: string
  paymentStatus: string
  orderStatus: string
  orderDate: string
  transactionId?: string
}

// Pastikan NAMA FUNGSINYA sederhana: PaymentPage
const PaymentPage = () => {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    try {
      const token = localStorage.getItem("userToken")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) throw new Error("Failed to fetch orders")
      const data = await response.json()
      setOrders(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  if (loading) return <div className="flex justify-center items-center h-screen font-sans">Loading...</div>

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      <div className="bg-gradient-to-b from-[#6B3C2D] to-[#9B6C57] p-6 text-white">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 bg-white/20 rounded-full">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">Detail Pembayaran</h1>
        </div>
      </div>

      <div className="p-6">
        {orders.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">Belum ada riwayat pembayaran.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="p-4 border border-gray-100 rounded-2xl shadow-sm bg-white">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold">Order #{order.id}</span>
                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                    {order.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total:</span>
                  <span className="font-semibold text-blue-600">Rp {order.totalAmount.toLocaleString("id-ID")}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// INI BAGIAN PALING PENTING. TULIS DI BARIS PALING BAWAH:
export default PaymentPage