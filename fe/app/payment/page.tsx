"use client"

import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { useState, useEffect, useCallback, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Truck, QrCode, Loader2, Download, XCircle } from "lucide-react"
import { API_URL } from "@/lib/api"

// --- Interfaces ---
interface Order {
  id: number
  totalAmount: number
  paymentMethod: string
  paymentStatus: string
  orderDate: string
}

// --- Komponen Utama dengan Suspense ---
export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading Payment...</div>}>
      <PaymentContent />
    </Suspense>
  )
}

function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const name = searchParams.get("name")
  const price = Number(searchParams.get("price")) || 0
  const portion = Number(searchParams.get("portion")) || 1
  const productId = Number(searchParams.get("productId")) || 1

  const taxes = 1000
  const delivery = 1000
  const subtotal = price * portion
  const total = subtotal + taxes + delivery

  const [method, setMethod] = useState("cod")
  const [showPopup, setShowPopup] = useState(false)
  const [successPopup, setSuccessPopup] = useState(false)
  const [orderId, setOrderId] = useState<number | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "checking" | "success">("idle")

  // Redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem("userToken")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  const handleContactAdmin = useCallback(() => {
    const phone = "6281239450638"
    const message = `Halo Admin, saya telah menyelesaikan pembayaran ${method === "qris" ? "QRIS" : "COD"}.\n\nDetail Pesanan:\n🍔 Pesanan: ${name}\nJumlah: ${portion} porsi\nTotal: Rp ${total.toLocaleString("id-ID")}`
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    window.open(url, "_blank")
  }, [method, name, portion, total])

  const handleConfirmOrder = async () => {
    const token = localStorage.getItem("userToken")
    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: [{ productId, quantity: portion }],
          paymentMethod: method === "qris" ? "QRIS" : "CASH"
        }),
      })

      const data = await response.json()
      if (response.ok) {
        setOrderId(data.orderId)
        setShowPopup(false)
        window.open(data.whatsappUrl, "_blank")
      } else {
        alert(data.message || "Gagal membuat pesanan")
      }
    } catch (err) {
      alert("Error: " + (err as Error).message)
    }
  }

  return (
    <div className="relative min-h-screen bg-white px-6 py-6 font-sans pb-24">
      {/* Header */}
      <div className="flex items-center mb-6 gap-4">
        <button onClick={() => router.back()} className="p-2 bg-gray-100 rounded-full shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Pembayaran</h1>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 p-4 rounded-2xl mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Ringkasan Pesanan</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{name || "Produk"} x{portion}</span>
            <span>Rp {subtotal.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Pajak & Layanan</span>
            <span>Rp {taxes.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between text-sm text-green-600">
            <span>Ongkos Kirim</span>
            <span>Rp {delivery.toLocaleString("id-ID")}</span>
          </div>
          <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg text-[#7B4540]">
            <span>Total Bayar</span>
            <span>Rp {total.toLocaleString("id-ID")}</span>
          </div>
        </div>
      </div>

      {/* Methods */}
      <h3 className="font-bold mb-4">Metode Pembayaran</h3>
      <div className="space-y-3">
        <div 
          onClick={() => setMethod("cod")}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${method === 'cod' ? 'border-[#7B4540] bg-[#7B4540]/5' : 'border-gray-100'}`}
        >
          <div className="flex items-center gap-3">
            <Truck className={method === 'cod' ? 'text-[#7B4540]' : 'text-gray-400'} />
            <div>
              <p className="font-bold text-sm">COD (Bayar di Tempat)</p>
              <p className="text-xs text-gray-500">Bayar saat makanan sampai</p>
            </div>
          </div>
        </div>

        <div 
          onClick={() => setMethod("qris")}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${method === 'qris' ? 'border-[#7B4540] bg-[#7B4540]/5' : 'border-gray-100'}`}
        >
          <div className="flex items-center gap-3">
            <QrCode className={method === 'qris' ? 'text-[#7B4540]' : 'text-gray-400'} />
            <div>
              <p className="font-bold text-sm">QRIS / E-Wallet</p>
              <p className="text-xs text-gray-500">Otomatis cek pembayaran</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Total Tagihan</p>
          <p className="text-xl font-bold text-[#7B4540]">Rp {total.toLocaleString("id-ID")}</p>
        </div>
        <button 
          onClick={() => setShowPopup(true)}
          className="bg-[#2b1d1a] text-white px-8 py-3 rounded-xl font-bold shadow-lg active:scale-95 transition"
        >
          Bayar Sekarang
        </button>
      </div>

      {/* Popup Logic */}
      <AnimatePresence>
        {showPopup && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setShowPopup(false)} className="fixed inset-0 bg-black z-40" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-8 z-50 shadow-2xl">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
              
              {method === "cod" ? (
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">Konfirmasi Pesanan</h3>
                  <p className="text-gray-500 text-sm mb-6">Pesanan akan langsung diproses dan dibayar saat kurir sampai.</p>
                  <button onClick={handleConfirmOrder} className="w-full bg-[#7B4540] text-white py-4 rounded-2xl font-bold">Konfirmasi COD</button>
                </div>
              ) : (
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-4">Scan QRIS</h3>
                  <div className="bg-white p-4 border-2 border-dashed border-gray-200 rounded-2xl inline-block mb-4">
                    <Image src="/images/qris.png/WhatsApp Image 2025-11-05 at 15.16.49_298b6f3b.jpg" alt="QRIS" width={220} height={220} className="rounded-lg" />
                  </div>
                  <p className="text-xs text-gray-400 mb-6">Silakan simpan/scan QR di atas untuk membayar Rp {total.toLocaleString("id-ID")}</p>
                  <div className="flex flex-col gap-3">
                    <button onClick={handleContactAdmin} className="w-full bg-[#7B4540] text-white py-4 rounded-2xl font-bold">Saya Sudah Bayar</button>
                    <button onClick={() => setShowPopup(false)} className="text-gray-400 text-sm">Batal</button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}