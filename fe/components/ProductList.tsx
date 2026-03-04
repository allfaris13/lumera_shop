"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  isAvailable: boolean;
}

export default function ProductList() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('http://localhost:5000/api/products', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // Add timeout
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="w-full px-4 py-6 bg-[#f7f7f7] min-h-screen">
        <h2 className="text-xl font-semibold mb-5 text-[#7B4540]">
          🍔 Menu Terbaik Hari Ini
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
              {/* Image skeleton */}
              <div className="w-full aspect-square bg-gray-200"></div>
              
              {/* Content skeleton */}
              <div className="p-3">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2 w-3/4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-8"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-4 py-6 bg-[#f7f7f7] min-h-screen">
        <h2 className="text-xl font-semibold mb-5 text-[#7B4540]">
          🍔 Menu Terbaik Hari Ini
        </h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error!</p>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-6 bg-[#f7f7f7] min-h-screen">
      <h2 className="text-xl font-semibold mb-5 text-[#7B4540]">
        🍔 Menu Terbaik Hari Ini
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {products.map((item, index) => (
          <motion.div
            key={item.id}
            onClick={() => router.push(`/product/${item.id}`)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200"
          >
            {/* Image Container */}
            <div className="relative w-full aspect-square bg-gray-50">
              <Image
                src={item.imageUrl || '/images/placeholder.png'}
                alt={item.name}
                fill
                className="object-cover"
                priority={index < 4}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
              
              {/* Stock Badge */}
              {item.stock > 0 ? (
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  {item.stock} left
                </div>
              ) : (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  Sold Out
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-3">
              {/* Product Name */}
              <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 leading-tight">
                {item.name}
              </h3>
              
              {/* Description */}
              <p className="text-xs text-gray-500 line-clamp-1 mb-2">
                {item.description}
              </p>

              {/* Price */}
              <div className="flex items-center justify-between">
                <span className="text-[#FF6B35] font-bold text-sm">
                  Rp {item.price.toLocaleString()}
                </span>
                
                {/* Rating placeholder - you can add actual rating later */}
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400 text-xs">⭐</span>
                  <span className="text-xs text-gray-500">4.5</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
