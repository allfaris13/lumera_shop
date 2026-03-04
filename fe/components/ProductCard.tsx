"use client";
import Image from "next/image";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    desc: string;
    price: number;
    rating: number;
    image: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => router.push(`/product/${product.id}`)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200"
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square bg-gray-50">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
        />
        
        {/* Heart Icon */}
        <button 
          className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            // Add to favorites logic here
          }}
        >
          <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
        </button>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Product Name */}
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 leading-tight">
          {product.name}
        </h3>
        
        {/* Description */}
        <p className="text-xs text-gray-500 line-clamp-1 mb-2">
          {product.desc}
        </p>

        {/* Price and Rating */}
        <div className="flex items-center justify-between">
          <span className="text-[#FF6B35] font-bold text-sm">
            Rp {product.price.toLocaleString()}
          </span>
          
          <div className="flex items-center gap-1">
            <span className="text-yellow-400 text-xs">⭐</span>
            <span className="text-xs text-gray-500">{product.rating}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
