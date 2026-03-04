"use client";

import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Home,
  User,
  Heart,
  ShoppingCart,
  ShoppingBag,
} from "lucide-react";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Navigation items with labels
  const navItems = [
    { 
      name: "Home", 
      label: "Home",
      shortLabel: "Home",
      icon: <Home size={14} />, 
      path: "/" 
    },
    {
      name: "Orders",
      label: "Orders",
      shortLabel: "Orders", 
      icon: <ShoppingBag size={14} />,
      path: "/dashboard/orders",
    },
    { 
      name: "Cart", 
      label: "Cart",
      shortLabel: "Cart",
      icon: <ShoppingCart size={14} />, 
      path: "/cart",
      isCart: true 
    },
    { 
      name: "Favorites", 
      label: "Favorites",
      shortLabel: "Favs",
      icon: <Heart size={14} />, 
      path: "/favorites" 
    },
    { 
      name: "Profile", 
      label: "Profile",
      shortLabel: "Profile",
      icon: <User size={14} />, 
      path: "/dashboard/profile" 
    },
  ];

  // Scroll detection
  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      
      // Show navbar when scrolling up or at top
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } 
      // Hide navbar when scrolling down (and not at top)
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, [lastScrollY]);

  const handleNavClick = (item: any) => {
    if (item.name === "Cart") {
      const user = localStorage.getItem("user");
      if (!user) {
        router.push("/login");
      } else {
        router.push("/cart");
      }
    } else {
      router.push(item.path);
    }
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ 
        y: isVisible ? 0 : 100, 
        opacity: isVisible ? 1 : 0 
      }}
      transition={{ 
        duration: 0.3, 
        ease: "easeInOut"
      }}
      className="fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-4 w-full max-w-fit"
    >
      {/* Capsule Container */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, delay: 1.8 }}
        className="bg-gradient-to-r from-white via-cream-50 to-amber-50/80 backdrop-blur-xl rounded-full px-1.5 sm:px-3 md:px-4 py-1.5 sm:py-2.5 md:py-3 shadow-2xl border border-orange-100/60 max-w-fit mx-auto"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #fefcf7 20%, #fef9f0 40%, #fdf4e6 60%, #fcf0dc 80%, #fbebd2 100%)',
          boxShadow: '0 10px 40px rgba(139, 69, 19, 0.15), 0 4px 20px rgba(139, 69, 19, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.95), inset 0 -1px 0 rgba(251, 235, 210, 0.5)'
        }}
      >
        <div className="flex items-center gap-0.5 sm:gap-1">
          {navItems.map((item, index) => {
            const isActive = pathname === item.path;
            
            return (
              <motion.button
                key={item.name}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.3, 
                  delay: 1.9 + index * 0.08,
                  type: "spring",
                  stiffness: 200 
                }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNavClick(item)}
                className={`relative flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 md:px-3 py-1.5 sm:py-2 md:py-2.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-[#7B4540] text-white shadow-lg"
                    : "text-[#8B4513] hover:text-[#7B4540] hover:bg-[#7B4540]/10"
                }`}
              >
                {/* Active background */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-[#7B4540] rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                {/* Content */}
                <div className="relative z-10 flex items-center gap-0.5 sm:gap-1">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {item.icon}
                  </div>
                  
                  {/* Label - responsive text with different labels */}
                  <span className="text-[10px] sm:text-xs md:text-sm font-medium whitespace-nowrap">
                    <span className="sm:hidden">{item.shortLabel}</span>
                    <span className="hidden sm:inline">{item.label}</span>
                  </span>
                </div>

                {/* Cart badge */}
                {item.isCart && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold z-20"
                  >
                    3
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Floating effect shadow */}
      <div 
        className="absolute inset-0 rounded-full blur-xl scale-110 -z-10"
        style={{
          background: 'linear-gradient(135deg, rgba(251, 235, 210, 0.4) 0%, rgba(252, 240, 220, 0.3) 50%, rgba(253, 244, 230, 0.2) 100%)'
        }}
      ></div>
    </motion.div>
  );
}
