"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Search,
  Scale,
  Heart,
  User,
  ShoppingCart,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Phone,
  Menu,
  X,
  LogIn,
  Tag,
  Zap,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { homeApi } from "@/src/service/homeApi";
import { useAppSelector, useAppDispatch } from "@/src/hooks/useRedux";
import { RootState } from "@/src/redux/store";
import { logout } from "@/src/redux/auth/authSlice";
import { resetCart } from "@/src/redux/cart/cartSlice";
import { resetWishlist } from "@/src/redux/wishlist/wishlistSlice";

interface Category {
  id: number;
  main_category_name: string;
  main_category_slug: string;
  main_category_image?: string;
  created_at: string;
  updated_at?: string;
  main_category_title: string;
  main_category_desc: string;
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { wishlist } = useAppSelector((state: RootState) => state.wishlist);
  const { cart } = useAppSelector((state: RootState) => state.cart);
  const { token, user } = useAppSelector((state: RootState) => state.auth);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Scroll-based header visibility
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);

  // Desktop nav scroll arrows
  const navScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateNavScrollState = useCallback(() => {
    const el = navScrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = navScrollRef.current;
    if (!el) return;
    updateNavScrollState();
    el.addEventListener('scroll', updateNavScrollState, { passive: true });
    window.addEventListener('resize', updateNavScrollState);
    return () => {
      el.removeEventListener('scroll', updateNavScrollState);
      window.removeEventListener('resize', updateNavScrollState);
    };
  }, [updateNavScrollState, categories]);

  const scrollNav = (direction: 'left' | 'right') => {
    const el = navScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  // Handle scroll for header visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Announcement bar: only show at the very top
      setIsAtTop(currentScrollY < 10);

      if (currentScrollY < 10) {
        // Always show header at top of page
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past threshold - hide header
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show header
        setIsHeaderVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const fetchMainCategories = async () => {
      try {
        const res = await homeApi.getCategories("main-category", 8);
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchMainCategories();
  }, []);

  const handleLogout = () => {
    const isVendor = user?.role === "vendor";
    dispatch(logout());
    dispatch(resetCart());
    dispatch(resetWishlist());
    if (isVendor) {
      router.push("/login?role=vendor");
    } else {
      router.push("/login");
    }
  };

  const handleVendorAuth = (e: React.MouseEvent, path: string) => {
    if (token) {
      e.preventDefault();
      sessionStorage.clear();
      sessionStorage.removeItem("redirectAfterLogin")
      dispatch(logout());
      dispatch(resetCart());
      dispatch(resetWishlist());
      window.location.href = path;
    }
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const res = await homeApi.searchProducts(searchQuery);
          if (res.success && res.data) {
            setSuggestions(res.data);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
          }
        } catch (error) {
          console.error("Search error:", error);
          setSuggestions([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = () => setShowSuggestions(false);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) {
      if ('preventDefault' in e) e.preventDefault();
    }
    if (searchQuery.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      setSearchOpen(false);
    }
  };

  const handleSuggestionClick = (slug: string) => {
    router.push(`/product/${encodeURIComponent(slug)}`);
    setSearchQuery("");
    setShowSuggestions(false);
    setSearchOpen(false);
  };


  return (
    <header className={`w-full fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      {/* Announcement Bar - only visible at top of page */}
      <div
        className={`bg-[#0b5c30] text-white overflow-hidden relative border-b border-[#094725] transition-all duration-300 ease-in-out ${
          isAtTop ? 'max-h-12 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex whitespace-nowrap animate-marquee w-max py-1.5 sm:py-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-8 md:gap-14 px-4 md:px-7 items-center shrink-0">
              <span className="flex items-center gap-1.5 text-[11px] sm:text-[13px] font-medium tracking-wide uppercase">
                <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ffeb3b]" />
                Mega Offers: Get up to 50% Off!
              </span>
              <span className="flex items-center gap-1.5 text-[11px] sm:text-[13px] font-medium tracking-wide uppercase">
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ffeb3b]" />
                Flash Sale: Free Shipping Over AED 5000
              </span>
              <span className="flex items-center gap-1.5 text-[11px] sm:text-[13px] font-medium tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ffeb3b]" />
                New Arrivals: Explore Latest Equipment
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between py-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>

            <div onClick={() => router.push('/')} className="shrink-0">
              <div className="w-32 h-10 bg-white rounded-md flex items-center justify-center">
                <Image
                  src="/delmon-logo-only.png"
                  alt="Delmon"
                  width={170}
                  height={60}
                  priority
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2"
              >
                <Search className="w-5 h-5 text-gray-700" />
              </button>
              <Link href="/cart" className="relative p-2" id="header-cart-icon-mobile">
                <ShoppingCart className="w-5 h-5 text-gray-700" />
                <span className="absolute top-0 right-0 bg-green-700 text-white text-[10px] font-medium rounded-full w-4 h-4 flex items-center justify-center">
                  {cart?.cart_count || 0}
                </span>
              </Link>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {searchOpen && (
            <div className="lg:hidden pb-3">
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search For Products"
                  className="w-full h-10 px-4 pr-10 bg-white border text-gray-900 border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700"
                />
                <button className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center">
                  {isSearching ? (
                    <div className="w-5 h-5 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {/* Mobile Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 z-50 max-h-[60vh] overflow-y-auto overflow-x-hidden">
                    {suggestions.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleSuggestionClick(product.product_slug)}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                      >
                        <div className="w-12 h-12 shrink-0 bg-gray-50 rounded-md overflow-hidden relative">
                          <Image
                            src={`${process.env.NEXT_PUBLIC_IMAGE_BASE}/${product.product_thambnail}`}
                            alt={product.product_name}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.product_name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm font-bold text-green-700">
                              AED {product.discount_price || product.selling_price}
                            </span>
                            {product.discount_price && (
                              <span className="text-xs text-gray-400 line-through">
                                AED {product.selling_price}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="px-4 py-3 border-t border-gray-50 text-center">
                      <button
                        onClick={handleSearch}
                        className="text-xs font-semibold text-green-700 hover:text-green-800"
                      >
                        View all results for "{searchQuery}"
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between py-4 gap-4">
            {/* Logo with Border */}
            <div className="shrink-0">
              <div onClick={() => router.push('/')} className="rounded-lg p-2 cursor-pointer">
                <Image
                  src="/delmon-logo-only.png"
                  alt="Delmon"
                  width={120}
                  height={40}
                  priority
                  className="object-contain"
                />
              </div>
            </div>

            {/* Phone Info */}
            <div className="hidden xl:flex items-center gap-3">
              <a
                href="tel:+97142881400"
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                title="Call Us"
              >
                <Phone className="w-5 h-5 text-green-700" />
              </a>
              <div className="flex flex-col">
                <a
                  href="tel:+97142881400"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-900 font-semibold text-sm leading-tight hover:text-green-700 transition-colors"
                  title="Call Us"
                >
                  +971 42 88 1400
                </a>
                <span className="text-gray-500 text-xs leading-tight">
                  24/7 Support Center
                </span>
              </div>
            </div>

            {/* Search Bar - Centered */}
            <div className="flex-1 max-w-xl mx-4 relative" onClick={(e) => e.stopPropagation()}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search For Products"
                  className="w-full h-11 px-5 text-gray-900 pr-12 bg-gray-50 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                />
                <button onClick={handleSearch} className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center">
                  {isSearching ? (
                    <div className="w-5 h-5 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Desktop Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 max-h-[400px] overflow-y-auto overflow-x-hidden py-2">
                  <div className="px-4 py-2 border-b border-gray-50">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Search Results</span>
                  </div>
                  {suggestions.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleSuggestionClick(product.product_slug)}
                      className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors group"
                    >
                      <div className="w-14 h-14 shrink-0 bg-gray-50 rounded-lg overflow-hidden relative border border-gray-100">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_IMAGE_BASE}/${product.product_thambnail}`}
                          alt={product.product_name}
                          fill
                          className="object-contain p-1 group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-green-700 transition-colors">
                          {product.product_name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-bold text-green-700">
                            AED {product.discount_price || product.selling_price}
                          </span>
                          {product.discount_price && (
                            <span className="text-xs text-gray-400 line-through">
                              AED {product.selling_price}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                        <ChevronDown className="w-4 h-4 text-gray-300 -rotate-90" />
                      </div>
                    </div>
                  ))}
                  {suggestions.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-50 text-center">
                      <button
                        onClick={handleSearch}
                        className="text-xs font-semibold text-green-700 hover:text-green-800"
                      >
                        View all results for "{searchQuery}"
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* No results state */}
              {showSuggestions && searchQuery.length >= 2 && !isSearching && suggestions.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 p-8 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">No products found</h3>
                  <p className="text-xs text-gray-500">We couldn't find any products matching your search.</p>
                </div>
              )}
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-3 xl:gap-5">

              {user?.contract_status === "Approved" ? (
                <Link
                  href="/contract/products"
                  className="hidden xl:flex flex-col items-center gap-1 text-gray-700 hover:text-green-700 min-w-[50px]"
                >
                  <Scale className="w-5 h-5" />
                  <span className="text-[11px] font-medium">Contract</span>
                </Link>
              ) : (
                <Link href={user?.contract_status === "Requested" ? "/contract/success" : "/contract/request"} className="hidden xl:flex flex-col items-center gap-1 text-gray-700 hover:text-green-700 min-w-[50px]">
                  <Scale className="w-5 h-5" />
                  <span className="text-[11px] font-medium">Contract</span>
                </Link>
              )}
              <Link
                href="/login?role=vendor"
                onClick={(e) => handleVendorAuth(e, "/login?role=vendor")}
                className="hidden xl:flex flex-col items-center gap-1 text-gray-700 hover:text-green-700 min-w-[50px]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="text-[11px] font-medium">Vendor</span>
              </Link>
              <Link href="/wishlist" className="flex flex-col items-center gap-1 text-gray-700 hover:text-green-700 min-w-[50px] relative" id="header-wishlist-icon">
                <div className="relative">
                  <Heart className="w-5 h-5" />
                  {wishlist && wishlist.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-green-700 text-white text-[9px] font-medium rounded-full w-3.5 h-3.5 flex items-center justify-center">
                      {wishlist.length}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-medium">Wishlist</span>
              </Link>
              <Link href="/account" className="flex flex-col items-center gap-1 text-gray-700 hover:text-green-700 min-w-[50px]">
                <User className="w-5 h-5" />
                <span className="text-[11px] font-medium">Account</span>
              </Link>
              <Link href="/cart" className="flex flex-col items-center gap-1 text-gray-700 hover:text-green-700 relative min-w-[50px]" id="header-cart-icon">
                <div className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 bg-green-700 text-white text-[9px] font-medium rounded-full w-3.5 h-3.5 flex items-center justify-center">
                    {cart?.cart_count || 0}
                  </span>
                </div>
                <span className="text-[11px] font-medium">Cart</span>
              </Link>
              {token ? (
                <button
                  onClick={handleLogout}
                  className="flex flex-col items-center gap-1 text-gray-700 hover:text-green-700 min-w-[50px]"
                >
                  <LogIn className="w-5 h-5 rotate-180" />
                  <span className="text-[11px] font-medium">Logout</span>
                </button>
              ) : (
                <Link href="/login" className="flex flex-col items-center gap-1 text-gray-700 hover:text-green-700 min-w-[50px]">
                  <LogIn className="w-5 h-5" />
                  <span className="text-[11px] font-medium">Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden lg:block bg-[#0d6838] relative">

        {/* Left scroll arrow */}
        <button
          onClick={() => scrollNav('left')}
          className={`absolute left-0 top-0 bottom-0 z-10 flex items-center justify-center w-10 bg-linear-to-r from-[#0d6838] to-transparent transition-opacity duration-200 ${
            canScrollLeft ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Scroll categories left"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        <div className="max-w-[1400px] mx-auto">
          {/* Scrollable nav strip */}
          <div
            ref={navScrollRef}
            className="flex items-center justify-start overflow-x-auto scrollbar-hide px-6"
          >
            {/* View All Categories Button */}
            <button
              onClick={() => router.push('/all-categories')}
              className="flex items-center gap-1.5 text-white px-3 xl:px-4 py-3.5 text-[13px] font-semibold tracking-wide hover:bg-green-800 whitespace-nowrap border-r border-green-700 cursor-pointer shrink-0"
            >
              <span>All Categories</span>
            </button>

            {/* All Brands */}
            <button
              onClick={() => router.push('/all-brands')}
              className="flex items-center gap-1.5 text-white px-3 xl:px-4 py-3.5 text-[13px] font-semibold tracking-wide hover:bg-green-800 whitespace-nowrap border-r border-green-700 cursor-pointer shrink-0"
            >
              <span>All Brands</span>
            </button>

            {/* Category Links */}
            {categories.length > 0 ? (
              categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => router.push(`/main-category/${category.main_category_slug}`)}
                  className="flex items-center gap-1.5 text-white px-3 xl:px-4 py-3.5 text-[13px] font-medium tracking-wide hover:bg-green-800 whitespace-nowrap cursor-pointer shrink-0"
                >
                  <span className="capitalize">{category.main_category_name.toLowerCase()}</span>
                </button>
              ))
            ) : (
              // Skeleton loading placeholders for categories
              [...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center px-3 xl:px-4 py-3.5 shrink-0"
                >
                  <div
                    className="h-3 rounded bg-green-700/60 animate-pulse"
                    style={{ width: `${60 + (i % 3) * 20}px` }}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right scroll arrow */}
        <button
          onClick={() => scrollNav('right')}
          className={`absolute right-0 top-0 bottom-0 z-10 flex items-center justify-center w-10 bg-linear-to-l from-[#0d6838] to-transparent transition-opacity duration-200 ${
            canScrollRight ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Scroll categories right"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200">
          <div className="px-4 py-2">
            {/* View All Categories - Mobile */}
            <button
              onClick={() => {
                router.push('/all-categories');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between py-3 text-gray-900 text-sm font-semibold border-b border-gray-100"
            >
              <span>All Categories</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* All Brands - mobile */}
            <button
              onClick={() => {
                router.push('/all-brands');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between py-3 text-gray-900 text-sm font-semibold border-b border-gray-100"
            >
              <span>All Brands</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {categories.length > 0 ? (
              categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    router.push(`/main-category/${category.main_category_slug}`);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between py-3 text-gray-900 text-sm font-medium border-b border-gray-100 last:border-0"
                >
                  <span className="capitalize">{category.main_category_name.toLowerCase()}</span>
                </button>
              ))
            ) : (
              // Skeleton loading placeholders for mobile categories
              [...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center py-3 border-b border-gray-100">
                  <div
                    className="h-3 rounded bg-gray-200 animate-pulse"
                    style={{ width: `${80 + (i % 3) * 30}px` }}
                  />
                </div>
              ))
            )}

            <div className="flex items-center gap-4 py-4 border-t border-gray-200 mt-2">
              <a
                href="tel:+97142881400"
                className="p-2 rounded-full bg-gray-50 text-green-700"
              >
                <Phone className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/97142881400"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-700 hover:text-green-700"
              >
                +971 42 88 1400
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}