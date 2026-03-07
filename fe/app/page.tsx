"use client";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { API_URL } from "@/lib/api";
import {
  Heart,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Search,
  Star,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

export default function HomePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState<
    {
      id: number;
      name: string;
      desc: string;
      price: number;
      rating: number;
      image: string;
      category: string;
    }[]
  >([]);

  const [user, setUser] = useState<{
    name: string;
    image: string;
  }>({
    name: "Guest User",
    image: "/images/profile/avatar.png",
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  interface Product {
    id: number;
    name: string;
    desc: string;
    description?: string;
    price: number;
    image: string;
    imageUrl?: string;
    rating: number;
    category: string;
  }

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { label: "All", value: "All" },
    { label: "Desserts", value: "Dessert" },
    { label: "Savory", value: "Makanan Asin" },
  ];

  // Fetch products via Proxy
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        const mappedProducts = data.map((product: Record<string, any>) => ({
          id: product.id,
          name: product.name,
          desc: product.description || "No description available",
          description: product.description,
          price: product.price,
          rating: product.rating || 4.5,
          image: product.imageUrl || "/images/burgers/burger.png",
          imageUrl: product.imageUrl || "/images/burgers/burger.png",
          category: product.category || "Makanan Asin",
        }));
        setProducts(mappedProducts);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p: Product) => {
      const matchCategory =
        selectedCategory === "All" || p.category === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchTerm, products]);

  useEffect(() => {
    const fetchUserData = async (token: string) => {
      try {
        const response = await fetch(`${API_URL}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          console.error("Failed to fetch user profile for header");
          return;
        }

        const data = await response.json();
        setUser({
          name: data.user.name || "User",
          image: data.user.image || "/images/profile/avatar.png",
        });

        localStorage.setItem(
          "user",
          JSON.stringify({
            name: data.user.name || "User",
            type: data.user.type || "user",
          })
        );

        if (data.user.type === "admin") {
          router.push("/admin");
          return;
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    const token = localStorage.getItem("userToken");

    if (token) {
      setIsLoggedIn(true);
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser({
          name: parsed.name || "User",
          image: "/images/profile/avatar.png",
        });
        if (parsed.type === "admin") {
          router.push("/admin");
          return;
        }
      }
      fetchUserData(token);
    } else {
      setUser({
        name: "Guest User",
        image: "/images/avatar.jpg",
      });
      setIsLoggedIn(false);
    }

    const savedFav = localStorage.getItem("favorites");
    if (savedFav) setFavorites(JSON.parse(savedFav));
  }, [router]);

  const toggleFavorite = (
    product: {
      id: number;
      name: string;
      desc: string;
      price: number;
      rating: number;
      image: string;
      category: string;
    },
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    let updated;
    if (favorites.some((fav) => fav.id === product.id)) {
      updated = favorites.filter((fav) => fav.id !== product.id);
    } else {
      updated = [...favorites, product];
    }
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const isFavorite = (id: number) => favorites.some((fav) => fav.id === id);

  const handleCardClick = (id: number) => {
    router.push(`/product/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D9B894] mx-auto mb-4"></div>
          <p className="text-[#8B7355]">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <div className="text-center">
          <p className="text-[#8B7355] mb-4">Failed to load products</p>
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col justify-between bg-[#FAF7F2]"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-[#E8DCC4]/30"
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Brand */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-2"
            >
              <motion.div
                whileHover={{ rotate: -10 }}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-[#7B4540] rounded-lg flex items-center justify-center"
              >
                <span className="text-white font-bold text-lg sm:text-xl">
                  L
                </span>
              </motion.div>
              <motion.h1
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-[#7B4540] to-[#2b1d1a]"
              >
                Lumera
              </motion.h1>
            </motion.div>

            {/* Auth & Profile */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 sm:gap-4"
            >
              {isLoggedIn ? (
                <motion.div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative group cursor-pointer"
                    onClick={() => router.push("/dashboard/profile")}
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden ring-2 ring-[#7B4540]/20 ring-offset-2 transition-all group-hover:ring-[#7B4540]/40">
                      <Image
                        src={user.image}
                        alt="Profile"
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                    <motion.div
                      className="absolute -bottom-1 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                  </motion.div>
                </motion.div>
              ) : (
                <div className="flex items-center gap-2 sm:gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/login")}
                    className="px-4 sm:px-6 py-2 text-[#7B4540] font-medium text-sm sm:text-base hover:text-[#2b1d1a] transition-colors"
                  >
                    Login
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/register")}
                    className="px-4 sm:px-6 py-2 bg-[#7B4540] text-white rounded-full text-sm sm:text-base font-medium shadow-lg shadow-[#7B4540]/20 hover:bg-[#2b1d1a] transition-all"
                  >
                    Register
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-24 sm:pt-32 pb-12 bg-gradient-to-br from-white via-[#FAF7F2] to-[#F5F1E8]"
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2b1d1a] leading-tight">
                  Discover Your
                  <br />
                  <span className="text-[#7B4540]">Favorite Taste at</span>
                  <br />
                  <span className="text-[#2b1d1a]">Lumera Shop.</span>
                </h1>
                <p className="text-lg text-gray-600 max-w-lg capitalize">
                  {isLoggedIn
                    ? `Welcome back, ${user.name}! find the best menu that interests you and don't forget to order.`
                    : "find the best menu that interests you and don't forget to order."
                  }
                </p>
              </div>

              {/* Stats */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex gap-8 pt-4"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#2b1d1a]">50+</div>
                  <div className="text-sm text-gray-500">Menu Items</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#2b1d1a]">1k+</div>
                  <div className="text-sm text-gray-500">Happy Customers</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Content - Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <div className="relative bg-white rounded-3xl p-8 shadow-2xl">
                <div className="absolute -top-4 -right-4 bg-white rounded-full px-4 py-2 shadow-lg border border-red-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      50+
                    </div>
                    <span className="text-sm font-medium text-gray-600">Delicious Menus</span>
                  </div>
                </div>

                <div className="relative">
                  <div className="w-full h-80 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl overflow-hidden">
                    <Image
                      src="/images/burgers/burger.png"
                      alt="Delicious Food"
                      width={400}
                      height={320}
                      className="w-full h-full object-contain p-8"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Product Grid Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="px-8 pt-12 pb-8 bg-linear-to-b from-[#F9F6F0] to-[#FAF7F2]"
      >
        <div className="max-w-[1100px] mx-auto">
          <div className="flex items-center justify-between mb-6 px-4">
            <h3 className="text-lg sm:text-xl font-bold text-[#2b1d1a]">
              Categories
            </h3>
            <div className="flex-1 max-w-md ml-4 sm:ml-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search your favorite food..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-full bg-white shadow-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7B4540]/20 transition-all text-[#2b1d1a] text-sm"
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-4 px-4 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-6 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat.value
                  ? "bg-[#7B4540] text-white shadow-lg shadow-[#7B4540]/20"
                  : "bg-white text-[#2b1d1a] border border-[#E8DCC4]/30"
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-8">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-sm p-4 cursor-pointer"
                onClick={() => handleCardClick(product.id)}
              >
                <div className="relative aspect-square mb-4">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="font-semibold text-[#2b1d1a]">{product.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-2">{product.desc}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#7B4540]">
                    Rp {product.price.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star size={14} fill="currentColor" />
                    <span className="text-xs font-medium">{product.rating}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <Footer />
      <WhatsAppFloat />
      <BottomNav />
    </motion.div>
  );
}
