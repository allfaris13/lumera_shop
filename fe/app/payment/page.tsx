"use client"

import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { useState, useEffect, useCallback, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Truck, QrCode, Download } from "lucide-react" // Hapus XCircle & Loader2
import { API_URL } from "@/lib/api"

// --- Interfaces ---
// Interface Order tetap ada untuk referensi tipe data
export interface Order {
  id: number
  totalAmount: number
  paymentMethod: string
  paymentStatus: string
  orderDate: string
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen font-sans">Memuat Halaman Pembayaran...</div>}>
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
  // Hapus successPopup & paymentStatus jika tidak ada logic pengecekan otomatis

  useEffect(() => {
    const token = localStorage.getItem("userToken")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  const handleContactAdmin = useCallback(() => {
    const phone = "6281239450638"
    const message = `Halo Admin, saya ingin konfirmasi pembayaran ${method === "qris" ? "QRIS" : "COD"}.\n\nDetail Pesanan:\n🍔 Pesanan: ${name}\nJumlah: ${portion} porsi\nTotal: Rp ${total.toLocaleString("id-ID")}`
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
        setShowPopup(false)
        window.open(data.whatsappUrl || `https://wa.me/6281239450638`, "_blank")
      } else {
        alert(data.message || "Gagal membuat pesanan")
      }
    } catch (err) {
      alert("Error: " + (err as Error).message)
    }
  }

  return (
    <div className="relative min-h-screen bg-white px-6 py-6 font-sans pb-24 text-gray-800">
      <div className="flex items-center mb-6 gap-4">
        <button onClick={() => router.back()} className="p-2 bg-gray-100 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Pembayaran</h1>
      </div>

      <div className="bg-gray-50 p-5 rounded-2xl mb-8 border border-gray-100">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Ringkasan Pesanan</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{name || "Produk"} x{portion}</span>
            <span className="font-medium text-gray-900">Rp {subtotal.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Pajak & Layanan</span>
            <span className="font-medium text-gray-900">Rp {taxes.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between text-sm text-green-600">
            <span>Ongkos Kirim</span>
            <span className="font-medium">Rp {delivery.toLocaleString("id-ID")}</span>
          </div>
          <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between font-bold text-lg text-[#7B4540]">
            <span>Total Bayar</span>
            <span>Rp {total.toLocaleString("id-ID")}</span>
          </div>
        </div>
      </div>

      <h3 className="font-bold mb-4">Metode Pembayaran</h3>
      <div className="space-y-3">
        <div 
          onClick={() => setMethod("cod")}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${method === 'cod' ? 'border-[#7B4540] bg-[#7B4540]/5' : 'border-gray-100 bg-white'}`}
        >
          <div className="flex items-center gap-3">
            <Truck className={method === 'cod' ? 'text-[#7B4540]' : 'text-gray-400'} size={24} />
            <div>
              <p className="font-bold text-sm">COD (Bayar di Tempat)</p>
              <p className="text-xs text-gray-500">Bayar saat makanan sampai</p>
            </div>
          </div>
        </div>

        <div 
          onClick={() => setMethod("qris")}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${method === 'qris' ? 'border-[#7B4540] bg-[#7B4540]/5' : 'border-gray-100 bg-white'}`}
        >
          <div className="flex items-center gap-3">
            <QrCode className={method === 'qris' ? 'text-[#7B4540]' : 'text-gray-400'} size={24} />
            <div>
              <p className="font-bold text-sm">QRIS / E-Wallet</p>
              <p className="text-xs text-gray-500">Scan kode QR</p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 flex items-center justify-between z-30">
        <div>
          <p className="text-xs text-gray-500">Total Tagihan</p>
          <p className="text-xl font-bold text-[#7B4540]">Rp {total.toLocaleString("id-ID")}</p>
        </div>
        <button 
          onClick={() => setShowPopup(true)}
          className="bg-[#2b1d1a] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-black active:scale-95 transition"
        >
          Bayar Sekarang
        </button>
      </div>

      <AnimatePresence>
        {showPopup && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setShowPopup(false)} className="fixed inset-0 bg-black z-40" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-8 z-50 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
              
              {method === "cod" ? (
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">Konfirmasi Pesanan</h3>
                  <p className="text-gray-500 text-sm mb-6">Pesanan akan langsung diproses dan dibayar tunai ke kurir.</p>
                  <button onClick={handleConfirmOrder} className="w-full bg-[#7B4540] text-white py-4 rounded-2xl font-bold hover:bg-[#633732]">Konfirmasi COD</button>
                </div>
              ) : (
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-4">Scan QRIS</h3>
                  <div className="bg-white p-4 border-2 border-dashed border-gray-200 rounded-2xl inline-block mb-4 shadow-sm">
                    <Image 
                      src="/images/qris.png/WhatsApp Image 2025-11-05 at 15.16.49_298b6f3b.jpg" 
                      alt="QRIS" 
                      width={220} 
                      height={220} 
                      className="rounded-lg"
                      priority
                    />
                  </div>
                  <p className="text-xs text-gray-400 mb-6">Silakan simpan/scan QR di atas untuk membayar <br/><span className="font-bold text-gray-700 underline text-sm">Rp {total.toLocaleString("id-ID")}</span></p>
                  <div className="flex flex-col gap-3">
                    <button onClick={handleConfirmOrder} className="w-full bg-[#7B4540] text-white py-4 rounded-2xl font-bold">Saya Sudah Bayar</button>
                    <button onClick={() => setShowPopup(false)} className="text-gray-400 text-sm py-2">Batal</button>
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