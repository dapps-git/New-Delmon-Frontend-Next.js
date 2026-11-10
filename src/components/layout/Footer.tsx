"use client";

import React, { useEffect } from "react";
import {
  Facebook, Twitter, Instagram, Youtube, MapPin, Phone, Mail,
  Info, FileText, Shield, Headphones, Briefcase, LogIn, LogOut,
  ShoppingBag, Heart, Truck, Map, Store, FileSignature, Package
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/src/hooks/useRedux";
import { RootState } from "@/src/redux/store";
import { logout } from "@/src/redux/auth/authSlice"; 
import { resetCart } from "@/src/redux/cart/cartSlice";
import { resetWishlist } from "@/src/redux/wishlist/wishlistSlice";
import { useRouter } from "next/navigation";

import { homeApi } from "@/src/service/homeApi";

const Footer = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { token, user } = useAppSelector((state: RootState) => state.auth);
  const [footerData, setFooterData] = React.useState<any>(null);

  useEffect(() => {
    const fetchOtherPage = async () => {
      try {
        const res = await homeApi.getOtherPage();
        if (res?.data?.content) {
          setFooterData(res.data.content);
        }
      } catch (error) {
        console.error("Failed to fetch other page", error);
      }
    };
    fetchOtherPage();
  }, []);

  const handleVendorAuth = (e: React.MouseEvent, path: string) => {
    if (token) {
      e.preventDefault();
      dispatch(logout());
      dispatch(resetCart());
      dispatch(resetWishlist());
      window.location.href = path;
    }
  };

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

  const ListItem = ({ href, icon: Icon, children, onClick }: { href?: string; icon: any; children: React.ReactNode; onClick?: (e: any) => void }) => {
    const content = (
      <span className="flex items-center gap-2 group">
        <Icon className="w-4 h-4 text-gray-300 group-hover:text-white transition-colors" />
        <span className="text-white text-sm group-hover:text-gray-200 group-hover:translate-x-1 transition-all duration-300">
          {children}
        </span>
      </span>
    );

    if (href) {
      return (
        <li>
          <Link href={href} onClick={onClick} className="block w-fit">
            {content}
          </Link>
        </li>
      );
    }

    return (
      <li>
        <button onClick={onClick} className="block w-fit">
          {content}
        </button>
      </li>
    );
  };

  return (
    <footer className="w-full">
      {/* Main Footer - Green Background */}
      <div className="bg-[#0d6838] text-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 md:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12">
            {/* Company Info Column */}
            <div className="col-span-1 lg:col-span-2 space-y-6">
              {/* Logo */}
              <div className="w-48 h-16 rounded-md flex items-center justify-start relative -ml-2">
                
                  <Image
                    src="/IMG_6042-k.PNG"
                    alt="Delmon"
                    width={170} 
                    height={60}
                    style={{ height: "auto" }}
                    priority
                    className="object-contain"
                  /> 
                
              </div>

              <p className="text-gray-100 text-sm leading-relaxed max-w-lg">
                In <span className="font-semibold text-white">{ "Newdelmon Goods Wholesalers LLC"}</span>, We are a
                locally owned and operated business committed to providing our
                customers with top-quality products. If you have any suggestions
                or feedback, please feel free to contact us.
              </p>

              <div className="flex flex-col gap-3 pt-2 lg:flex-row lg:flex-wrap lg:items-center lg:gap-6">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(footerData?.address || "Dubai, United Arab Emirates")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-sm text-gray-100 hover:text-white transition-colors"
                >
                  <MapPin className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />
                  <span>{footerData?.address || "Dubai, United Arab Emirates"}</span>
                </a>
                <a
                  href={`tel:${(footerData?.support_center || "").replace(/[^\d+]/g, '')}`}
                  className="flex items-center gap-3 text-sm text-gray-100 hover:text-white transition-colors"
                >
                  <Phone className="w-5 h-5 text-gray-300 shrink-0" />
                  <span>Tel: {footerData?.support_center}</span>
                </a>
                {footerData?.cell && (
                  <a
                    href={`https://wa.me/${footerData.cell.replace(/\s+/g, '').replace('+', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-gray-100 hover:text-white transition-colors"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white shrink-0">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span>WhatsApp: {footerData?.cell}</span>
                  </a>
                )}
                <a
                  href={`mailto:${footerData?.email || "info@newdelmonstationery.com"}`}
                  className="flex items-center gap-3 text-sm text-gray-100 hover:text-white transition-colors"
                >
                  <Mail className="w-5 h-5 text-gray-300 shrink-0" />
                  <span>Email: {footerData?.email || "info@newdelmonstationery.com"}</span>
                </a>
              </div>
            </div>

            {/* Useful Links Column */}
            <div className="lg:pl-8">
              <h3 className="text-white text-lg font-bold mb-6 border-b border-white/20 pb-2 inline-block">
                Useful Links
              </h3>
              <ul className="space-y-3">
                <ListItem href="/about-us" icon={Info}>About Us</ListItem>
                <ListItem href="/terms-and-conditions" icon={FileText}>Terms & Conditions</ListItem>
                <ListItem href="/privacy-policy" icon={Shield}>Privacy Policy</ListItem>
                <ListItem href="/support-center" icon={Headphones}>Support Center</ListItem>
                <ListItem href="/careers" icon={Briefcase}>Careers</ListItem>
              </ul>
            </div>

            {/* My Account Column */}
            <div className="lg:pl-4">
              <h3 className="text-white text-lg font-bold mb-6 border-b border-white/20 pb-2 inline-block">
                My Account
              </h3>
              <ul className="space-y-3">
                {token ? (
                  <ListItem onClick={handleLogout} icon={LogOut}>Logout</ListItem>
                ) : (
                  <ListItem href="/login" icon={LogIn}>Login</ListItem>
                )}
                <ListItem href="/account/orders" icon={ShoppingBag}>Order History</ListItem>
                <ListItem href="/wishlist" icon={Heart}>My Wishlist</ListItem>
                <ListItem href="/account/track-orders" icon={Truck}>Track Order</ListItem>
                <ListItem href="/account/details" icon={Map}>Shipping Details</ListItem>
              </ul>
            </div>

            {/* Seller Zone Column */}
            <div>
              <h3 className="text-white text-lg font-bold mb-6 border-b border-white/20 pb-2 inline-block">
                Seller Zone
              </h3>
              <ul className="space-y-3">
                <ListItem
                  href="/register?role=vendor"
                  onClick={(e) => handleVendorAuth(e, "/register?role=vendor")}
                  icon={Store}
                >
                  Become a Vendor
                </ListItem>
                <ListItem
                  href="/login?role=vendor"
                  onClick={(e) => handleVendorAuth(e, "/login?role=vendor")}
                  icon={LogIn}
                >
                  Login to Vendor Panel
                </ListItem>
                <ListItem href="/contract/request" icon={FileSignature}>Contract Panel</ListItem>
                <ListItem href="/contract/products" icon={Package}>See Contract Products</ListItem>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer - White Background */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 md:py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
            
            <p className="text-gray-600 text-xs sm:text-sm text-center md:text-left order-3 md:order-1 flex-1">
              ©All Right Reserved. Powered by : Newdelmon Goods Wholesalers LLC
            </p>

            {/* Accepted Payment Methods */}
            <div className="flex items-center gap-2 order-1 md:order-2 flex-wrap justify-center flex-1">
              <span className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mr-2 hidden lg:block">Payments:</span>
              
              {/* Visa */}
              <div className="w-[46px] h-[30px] bg-[#1434CB] rounded shadow-sm flex items-center justify-center text-white text-[11px] font-black italic tracking-wider cursor-default hover:-translate-y-0.5 transition-transform ring-1 ring-black/5">
                VISA
              </div>
              
              {/* Mastercard */}
              <div className="w-[46px] h-[30px] bg-white rounded shadow-sm flex items-center justify-center overflow-hidden relative cursor-default hover:-translate-y-0.5 transition-transform ring-1 ring-black/5">
                <div className="w-[18px] h-[18px] rounded-full bg-[#EB001B] absolute left-[5px] opacity-90" />
                <div className="w-[18px] h-[18px] rounded-full bg-[#F79E1B] absolute right-[5px] opacity-90 mix-blend-multiply" />
              </div>

          
              
              {/* Noon */}
              <div className="w-[46px] h-[30px] bg-[#FEE000] rounded shadow-sm flex items-center justify-center text-black text-[13px] font-black tracking-tight cursor-default hover:-translate-y-0.5 transition-transform ring-1 ring-black/5">
                noon
              </div>

              {/* Tabby */}
              <div className="w-[46px] h-[30px] bg-[#3EEDAA] rounded shadow-sm flex items-center justify-center text-black text-[12px] font-black tracking-tight cursor-default hover:-translate-y-0.5 transition-transform ring-1 ring-black/5">
                tabby
              </div>
            </div>

            {/* Social Media Icons */}
            <div className="flex items-center gap-4 order-2 md:order-3 flex-1 justify-center md:justify-end">
              {/* WhatsApp Icon in Footer */}
              {footerData?.cell && (
                <a
                  href={`https://wa.me/${footerData.cell.replace(/\s+/g, '').replace('+', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:-translate-y-1 transition-transform shadow-sm"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
              )}
              {footerData?.facebook && (
                <a
                  href={footerData.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:-translate-y-1 transition-transform shadow-sm"
                >  
                  <Facebook className="w-4 h-4" />
                </a> 
              )}
              {footerData?.twitter && (
                <a
                  href={footerData.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center hover:-translate-y-1 transition-transform shadow-sm"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {footerData?.instagram && (
                <a
                  href={footerData.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] text-white flex items-center justify-center hover:-translate-y-1 transition-transform shadow-sm"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {footerData?.youtube && (
                <a
                  href={footerData.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#FF0000] text-white flex items-center justify-center hover:-translate-y-1 transition-transform shadow-sm"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Floating Buttons Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end">
        {/* Phone Floating Button */}
        <a
          href={`tel:${(footerData?.support_center || "+971 42 88 1400").replace(/[^\d+]/g, '')}`}
          className="flex items-center justify-center bg-[#0d6838] hover:bg-[#0a522c] text-white p-3 md:p-4 rounded-full shadow-lg transition-all duration-300 group overflow-hidden"
          aria-label="Call us"
        >
          <div className="relative w-6 h-6 md:w-8 md:h-8 shrink-0 text-white">
            <Phone className="w-full h-full" />
          </div>
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:pl-2 transition-all duration-500 ease-in-out font-bold text-sm md:text-base">
            Call us
          </span>
        </a>

        {/* WhatsApp Floating Button */}
        {footerData?.cell && (  
          <a
            href={`https://wa.me/${footerData.cell.replace(/\s+/g, '').replace('+', '')}?text=${encodeURIComponent("Hello New Delmon Team, I would like to inquire about your products.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center bg-[#25D366] hover:bg-[#20bd5a] text-white p-3 md:p-4 rounded-full shadow-lg transition-all duration-300 group overflow-hidden"
            aria-label="Chat with us on WhatsApp"
          >
            <div className="relative w-6 h-6 md:w-8 md:h-8 shrink-0 text-white">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:pl-2 transition-all duration-500 ease-in-out font-bold text-sm md:text-base">
              Chat with us
            </span>
          </a>
        )}
      </div>

        <p className="mt-2 text-xs opacity-75 text-center">
          Powered by{" "}
          <a
            href="https://www.crevionads.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline hover:opacity-100 transition-opacity"
          >
            Crevion Ads
          </a>
        </p>
    </footer>
  );
};

export default Footer;