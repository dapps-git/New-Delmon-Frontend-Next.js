"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Heart, ChevronRight, ShoppingCart, Truck, ShieldCheck, Share2, AlertCircle, CreditCard, Lock, Ruler, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { homeApi } from "../../../../service/homeApi";
import ProductCard, { Product as ProductCardType } from "../../../../components/common/ProductCard";
import { useAppDispatch, useAppSelector } from "@/src/hooks/useRedux";
import { RootState } from "@/src/redux/store";
import { addToCart } from "@/src/redux/cart/cartThunk";
import { clearCartError, clearCartMessage } from "@/src/redux/cart/cartSlice";
import { addToWishlist, removeFromWishlist } from "@/src/redux/wishlist/wishlistThunk";
import { clearWishlistError, clearWishlistMessage } from "@/src/redux/wishlist/wishlistSlice";
import { ProductData, RelatedProduct } from "@/src/types/product.types";
import Image from "next/image";
import ImageMagnifier from "../../../../components/common/ImageMagnifier";
import { getProductPrice } from "@/src/utils/productPrice";

interface ProductImage {
    id: number;
    product_id: number;
    photo_name: string;
    created_at: string;
    updated_at: string | null;
}

interface WholesalePrice {
    id: number;
    product_id: number;
    min_qty: number;
    max_qty: number;
    price_per_peice: number;
    created_at: string;
    updated_at: string | null;
}

const ProductAccordion = ({ title, content, isOpen, onClick }: { title: string, content: string | React.ReactNode, isOpen: boolean, onClick: () => void }) => {
    return (
        <div className="border-b border-gray-200">
            <button
                className="w-full py-4 flex items-center justify-between text-left focus:outline-none"
                onClick={onClick}
            >
                <span className="text-base font-medium text-gray-900">{title}</span>
                {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
            </button>
            {isOpen && (
                <div className="pb-4 text-gray-600 leading-relaxed text-[11px] font-calibri">
                    {typeof content === 'string' ? (
                        <div dangerouslySetInnerHTML={{ __html: content }} />
                    ) : (
                        content
                    )}
                </div>
            )}
        </div>
    );
};

export default function ProductDetailsPage() {
    const params = useParams();
    const slug = params.slug as string;
    const dispatch = useAppDispatch();
    const { loading: cartLoading, error: cartError, message: cartMessage } = useAppSelector((state: RootState) => state.cart);
    const { token } = useAppSelector((state: RootState) => state.auth);
    const { wishlist, loadingProductId, error: wishlistError, message: wishlistMessage } = useAppSelector((state: RootState) => state.wishlist);

    const [product, setProduct] = useState<ProductData | null>(null);
    const [productImages, setProductImages] = useState<ProductImage[]>([]);
    const [relatedProducts, setRelatedProducts] = useState<ProductCardType[]>([]);
    const [wholesalePrices, setWholesalePrices] = useState<WholesalePrice[]>([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState("");
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [openAccordion, setOpenAccordion] = useState<string | null>("description");

    const isInWishlist = wishlist?.some(item => item.product_id === product?.id);
    const isWishlistLoading = loadingProductId === product?.id;

    const handleWishlistToggle = async () => {
        if (!token) {
            toast.error("Please login to manage your wishlist");
            return;
        }
        if (!product) return;
        try {
            if (isInWishlist) {
                await dispatch(removeFromWishlist(product.id)).unwrap();
            } else {
                await dispatch(addToWishlist(product.id)).unwrap();
            }
        } catch (error: any) {
            console.error("Wishlist operation failed", error);
        }
    };

    const colorMap: Record<string, string> = {
        "red": "#EF4444", "blue": "#3B82F6", "green": "#10B981", "yellow": "#EAB308",
        "black": "#000000", "white": "#FFFFFF", "brown": "#78350F", "navy": "#1E3A8A",
        "orange": "#F97316", "purple": "#A855F7", "grey": "#6B7280", "gray": "#6B7280"
    };

    useEffect(() => {
        const fetchProductDetails = async () => {
            if (!slug) return;
            setLoading(true);
            try {
                const response = await homeApi.getProductBySlug(slug);
                if (response.success && response.data) {
                    setProduct({ ...response.data.product, specification_list: response.data.specification_list });
                    setActiveImage(response.data.product.product_thambnail);
                    if (response.data.images && response.data.images.length > 0) {
                        setProductImages(response.data.images);
                    }
                    if (response.data.product.wholesale_prices?.length > 0) {
                        setWholesalePrices(response.data.product.wholesale_prices);
                    }
                    if (response.data.product.product_color) {
                        const colors = response.data.product.product_color.split(',').map((c: string) => c.trim());
                        if (colors.length > 0) setSelectedColor(colors[0]);
                    }
                    if (response.data.product.product_size) {
                        const sizes = response.data.product.product_size.split(',').map((s: string) => s.trim());
                        if (sizes.length > 0) setSelectedSize(sizes[0]);
                    }
                    if (response.data.related?.length > 0) {
                        const mappedRelated: ProductCardType[] = response.data.related.map((item: RelatedProduct) => {
                            const { price: finalPrice, oldPrice, badge } = getProductPrice(item);
                            return {
                                id: item.id,
                                slug: item.product_slug,
                                category: item.category_name || item.brand?.brand_name || "Uncategorized",
                                title: item.product_name,
                                price: `AED${finalPrice}`,
                                oldPrice: oldPrice ? `AED${oldPrice}` : undefined,
                                image: `${process.env.NEXT_PUBLIC_IMAGE_BASE}/${item.product_thambnail}`,
                                badge,
                                product_qty: item.product_qty,
                                colors: item.product_color?.split(',').map(c => c.trim()).filter(Boolean),
                                sizes: item.product_size?.split(',').map(s => s.trim()).filter(Boolean)
                            };
                        });
                        setRelatedProducts(mappedRelated);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch product details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProductDetails();
        setQuantity(1);
    }, [slug]);

    useEffect(() => {
        if (cartMessage) { toast.success(cartMessage); setTimeout(() => dispatch(clearCartMessage()), 3000); }
    }, [cartMessage, dispatch]);

    useEffect(() => {
        if (cartError) { toast.error(cartError); setTimeout(() => dispatch(clearCartError()), 5000); }
    }, [cartError, dispatch]);

    useEffect(() => {
        if (wishlistMessage) { toast.success(wishlistMessage); setTimeout(() => dispatch(clearWishlistMessage()), 3000); }
    }, [wishlistMessage, dispatch]);

    useEffect(() => {
        if (wishlistError) { toast.error(wishlistError); setTimeout(() => dispatch(clearWishlistError()), 5000); }
    }, [wishlistError, dispatch]);

    const handleAddToCart = async () => {
        if (!product) return;

        // Check stock limit
        const maxQty = parseInt(product.product_qty) || 0;

        if (maxQty > 0 && quantity > maxQty) {
            toast.warning(`Only ${maxQty} items available in stock`);
            return;
        }

        const payload: any = { qty: quantity };
        if (selectedColor) payload.color = selectedColor;
        if (selectedSize) payload.size = selectedSize;
        await dispatch(addToCart({ productId: product.id, payload }));
    };

    if (loading) return (
        <div className="bg-white min-h-screen font-sans animate-pulse">
            {/* Breadcrumb skeleton */}
            <div className="max-w-[1500px] mx-auto px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <div className="h-3 w-10 bg-gray-200 rounded" />
                <div className="h-3 w-3 bg-gray-100 rounded" />
                <div className="h-3 w-24 bg-gray-200 rounded" />
                <div className="h-3 w-3 bg-gray-100 rounded" />
                <div className="h-3 w-40 bg-gray-200 rounded" />
            </div>

            <main className="max-w-[1500px] mx-auto px-4 py-6 md:py-8">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

                    {/* Column 1: Image gallery skeleton (35%) */}
                    <div className="lg:w-[35%]">
                        <div className="flex flex-col-reverse lg:flex-row gap-3">
                            {/* Thumbnails */}
                            <div className="flex lg:flex-col gap-2 py-1">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="w-14 h-14 md:w-16 md:h-16 lg:w-[60px] lg:h-[70px] shrink-0 bg-gray-200 rounded-lg" />
                                ))}
                            </div>
                            {/* Main image */}
                            <div className="w-full lg:flex-1 h-[300px] md:h-[500px] bg-gray-200 rounded-2xl" />
                        </div>
                    </div>

                    {/* Column 2: Product details skeleton (45%) */}
                    <div className="lg:w-[45%] flex flex-col gap-4">
                        {/* Brand */}
                        <div className="h-3.5 w-20 bg-gray-200 rounded" />
                        {/* Title */}
                        <div className="space-y-2">
                            <div className="h-5 w-full bg-gray-200 rounded" />
                            <div className="h-5 w-3/4 bg-gray-200 rounded" />
                        </div>
                        {/* Model / stock badges */}
                        <div className="flex items-center gap-3">
                            <div className="h-3.5 w-28 bg-gray-200 rounded" />
                            <div className="h-3.5 w-16 bg-gray-200 rounded-full" />
                        </div>

                        <div className="h-px bg-gray-100 w-full" />

                        {/* Price */}
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-gray-200 rounded" />
                            <div className="h-8 w-32 bg-gray-200 rounded" />
                        </div>
                        <div className="h-4 w-24 bg-gray-100 rounded" />

                        {/* Color swatches */}
                        <div className="space-y-2">
                            <div className="h-4 w-14 bg-gray-200 rounded" />
                            <div className="flex gap-2">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="w-9 h-9 bg-gray-200 rounded-full" />
                                ))}
                            </div>
                        </div>

                        {/* Size buttons */}
                        <div className="space-y-2">
                            <div className="h-4 w-10 bg-gray-200 rounded" />
                            <div className="flex gap-2">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-10 w-14 bg-gray-200 rounded-lg" />
                                ))}
                            </div>
                        </div>

                        {/* Qty + Add to Cart */}
                        <div className="flex gap-3 mt-2">
                            <div className="w-24 h-11 bg-gray-200 rounded-lg" />
                            <div className="flex-1 h-11 bg-gray-200 rounded-lg" />
                            <div className="w-11 h-11 bg-gray-200 rounded-lg" />
                        </div>

                        {/* Accordion rows */}
                        <div className="mt-6 border-t border-gray-100 space-y-4 pt-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100">
                                    <div className="h-4 w-32 bg-gray-200 rounded" />
                                    <div className="h-4 w-4 bg-gray-100 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Column 3: Sidebar skeleton (20%, desktop only) */}
                    <div className="hidden lg:block lg:w-[20%] space-y-4">
                        {/* Delivery card */}
                        <div className="border border-gray-100 rounded-xl p-4 space-y-3">
                            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                                <div className="w-7 h-7 bg-gray-200 rounded-full" />
                                <div className="h-3.5 w-20 bg-gray-200 rounded" />
                            </div>
                            <div className="h-3 w-full bg-gray-200 rounded" />
                            <div className="h-3 w-4/5 bg-gray-200 rounded" />
                        </div>
                        {/* Brand promise card */}
                        <div className="border border-gray-100 rounded-xl p-4 space-y-3">
                            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                                <div className="w-7 h-7 bg-gray-200 rounded-full" />
                                <div className="h-3.5 w-24 bg-gray-200 rounded" />
                            </div>
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-3.5 h-3.5 bg-gray-200 rounded-full" />
                                    <div className="h-3 w-28 bg-gray-200 rounded" />
                                </div>
                            ))}
                        </div>
                        {/* Payment card */}
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col items-center gap-2">
                            <div className="h-3 w-16 bg-gray-200 rounded" />
                            <div className="flex gap-2">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-5 w-8 bg-gray-200 rounded" />
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Related products skeleton */}
                <div className="mt-16 pt-8 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <div className="h-6 w-40 bg-gray-200 rounded" />
                        <div className="h-4 w-16 bg-gray-200 rounded" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-5">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <div className="h-44 bg-gray-200 rounded-xl" />
                                <div className="h-3 w-3/4 bg-gray-200 rounded" />
                                <div className="h-4 w-1/2 bg-gray-200 rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );

    if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

    const getWholesalePrice = (qty: number): number | null => {
        const applicablePrice = wholesalePrices.find(wp => qty >= wp.min_qty && qty <= wp.max_qty);
        return applicablePrice ? applicablePrice.price_per_peice : null;
    };

    // Same precedence as the cart: wholesale > contract > discount > selling
    const pricing = getProductPrice(product);
    const wholesalePrice = getWholesalePrice(quantity);
    const currentPrice = wholesalePrice ? wholesalePrice.toString() : pricing.price;

    const allImages = [{ id: 0, photo_name: product.product_thambnail }, ...productImages];
    const colors = product.product_color?.split(',').map(c => c.trim()) || [];
    const sizes = product.product_size?.split(',').map(s => s.trim()) || [];

    return (
        <div className="bg-white min-h-screen font-sans">
            {/* Breadcrumb - Compact */}
            <div className="max-w-[1500px] mx-auto px-4 py-3 text-[11px] md:text-xs text-gray-500 flex items-center gap-1.5 border-b border-gray-100">
                <Link href="/" className="hover:underline">Home</Link>
                <ChevronRight className="w-3 h-3 text-gray-400" />
                {product.category && (
                    <>
                        <Link href="/products" className="hover:underline">{product.category.category_name}</Link>
                        <ChevronRight className="w-3 h-3 text-gray-400" />
                    </>
                )}
                <span className="truncate max-w-[200px] text-gray-900 font-medium">{product.product_name}</span>
            </div>

            <main className="max-w-[1500px] mx-auto px-4 py-6 md:py-8">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

                    {/* Column 1: Sticky Image Gallery (35%) */}
                    <div className="lg:w-[35%]">
                        <div className="lg:sticky lg:top-24">
                            <div className="flex flex-col-reverse lg:flex-row gap-3">
                                {/* Thumbnails */}
                                {allImages.length > 1 && (
                                    <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[500px] scrollbar-hide py-1">
                                        {allImages.map((img, index) => (
                                            <button
                                                key={img.id || index}
                                                onMouseEnter={() => setActiveImage(img.photo_name)}
                                                onClick={() => setActiveImage(img.photo_name)}
                                                className={`relative w-14 h-14 md:w-16 md:h-16 lg:w-[60px] lg:h-[70px] shrink-0 border rounded-lg overflow-hidden bg-white transition-all cursor-pointer ${activeImage === img.photo_name
                                                    ? 'border-[#006637] ring-1 ring-[#006637] opacity-100'
                                                    : 'border-gray-200 hover:border-gray-400 opacity-80 hover:opacity-100'
                                                    }`}
                                            >
                                                <Image
                                                    src={`${process.env.NEXT_PUBLIC_IMAGE_BASE}/${img.photo_name}`}
                                                    alt={`Thumbnail ${index + 1}`}
                                                    fill
                                                    className="object-contain p-1 mix-blend-multiply"
                                                    unoptimized
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Main Image */}
                                <div className="w-full lg:flex-1 bg-white relative h-[300px] md:h-[500px] rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    {/* Badges */}
                                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                                        {pricing.discountPercent ? (
                                            <span className="bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded shadow-sm">
                                                -{pricing.discountPercent}%
                                            </span>
                                        ) : null}
                                        {product.new_product === 1 && (
                                            <span className="bg-[#006637] text-white text-xs font-bold px-3 py-1 rounded shadow-sm">
                                                NEW
                                            </span>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                                        <button
                                            onClick={handleWishlistToggle}
                                            disabled={isWishlistLoading}
                                            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md border border-gray-100 bg-white transition-all hover:scale-105 cursor-pointer ${isInWishlist ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-500'
                                                }`}
                                        >
                                            {isWishlistLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
                                            )}
                                        </button>
                                        <button className="w-9 h-9 rounded-full flex items-center justify-center shadow-md border border-gray-100 bg-white text-gray-400 hover:text-[#006637] transition-all hover:scale-105 cursor-pointer">
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {activeImage ? (
                                        <ImageMagnifier
                                            src={`${process.env.NEXT_PUBLIC_IMAGE_BASE}/${activeImage}`}
                                            alt={product.product_name}
                                            className="w-full h-full"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-50 animate-pulse" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Details & Actions (45%) */}
                    <div className="lg:w-[45%] flex flex-col gap-4">

                        {/* Title & Brand */}
                        <div>
                            {product.brand && (
                                <Link href="#" className="text-[#006637] text-[12px] font-bold hover:underline uppercase tracking-wide mb-1.5 block">
                                    {product.brand.brand_name}
                                </Link> 
                            )}
                            <h1 className="text-[12px] md:text-[17px] lg:text-[17px] text-gray-900 font-bold leading-tight mb-2">
                                {product.product_name}
                            </h1>

                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                 <span>Model: <span className="font-semibold text-gray-900">{product.product_code}</span></span>
                                <div className="h-3 w-px bg-gray-300"></div>
                                {product.status === 1 && parseInt(product.product_qty) > 0 ? (
                                    <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                         <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                        In Stock
                                    </span>
                                ) : (
                                    <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                        Out of Stock
                                    </span>
                                )}
                                {product.status === 1 && parseInt(product.product_qty) > 0 && parseInt(product.product_qty) < 5 && (
                                    <span className="text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-full text-[10px] uppercase">
                                        Only {product.product_qty} left
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="h-px bg-gray-100 w-full" />

                        {/* Price Block */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                                <Image src="/price-icon.png" alt="AED" width={20} height={10} className="w-5.5 h-5.5 object-contain" unoptimized />
                                <span className="text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">{currentPrice}</span>
                                <span className="text-[8px] text-gray-400 self-end mb-1.5 font-medium">Inclusive of VAT</span>
                            </div>

                            {!wholesalePrice && (pricing.oldPrice || pricing.isContract) && (
                                <div className="flex items-center gap-2">
                                    {pricing.oldPrice && (
                                        <span className="text-sm text-gray-400 line-through">AED {pricing.oldPrice}</span>
                                    )}
                                    {pricing.isContract ? (
                                        <span className="text-xs font-bold text-white bg-[#006637] px-1.5 py-0.5 rounded uppercase">
                                            Your Contract Price
                                        </span>
                                    ) : pricing.discountPercent ? (
                                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                            {pricing.discountPercent}% OFF
                                        </span>
                                    ) : null}
                                </div>
                            )}

                            {wholesalePrice && (
                                <div className="mt-1 bg-[#f0f9f6] border border-[#006637]/20 rounded-lg p-2.5 inline-block w-full">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <AlertCircle className="w-3.5 h-3.5 text-[#006637]" />
                                        <span className="text-xs text-[#006637] font-bold uppercase">Wholesale Applied</span>
                                    </div>
                                    <span className="text-xs text-[#006637] font-medium block">
                                        Quantity: <span className="font-bold">{quantity}</span> units <span className="mx-1">•</span> Price: <span className="font-bold">AED {wholesalePrice}</span>/unit
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Selectors Section */}
                        {(colors.length > 0 || sizes.length > 0) && (
                            <div className="space-y-4 py-2">
                                {colors.length > 0 && (
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-bold text-gray-900">Color</span>
                                            <span className="text-xs text-gray-500 capitalize">{selectedColor}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2.5">
                                            {colors.map(color => {
                                                const clrLower = color.toLowerCase();
                                                const bg = colorMap[clrLower] || clrLower;
                                                const isSelected = selectedColor === color;
                                                return (
                                                    <button
                                                        key={color}
                                                        onClick={() => setSelectedColor(color)}
                                                        className={`w-9 h-9 rounded-full border shadow-sm transition-all focus:outline-none flex items-center justify-center cursor-pointer ${isSelected
                                                            ? 'border-[#006637] ring-2 ring-[#006637]/20 scale-110'
                                                            : 'border-gray-200 hover:scale-105'
                                                            }`}
                                                        style={{ backgroundColor: bg }}
                                                        title={color}
                                                    >
                                                        {isSelected && (
                                                            <svg className="w-4 h-4" fill="none" stroke={bg === '#FFFFFF' ? '#000' : '#fff'} viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {sizes.length > 0 && (
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                                                <Ruler className="w-4 h-4 text-gray-500" />
                                                Size
                                            </span>
                                            <span className="text-xs text-gray-500">Select Size</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {sizes.map(size => (
                                                <button
                                                    key={size}
                                                    onClick={() => setSelectedSize(size)}
                                                    className={`group relative min-w-[3.5rem] h-10 px-3 border rounded-lg text-sm font-semibold transition-all flex items-center justify-center uppercase overflow-hidden cursor-pointer ${selectedSize === size
                                                        ? 'border-[#006637] bg-[#006637] text-white shadow-md scale-105'
                                                        : 'border-gray-200 text-gray-700 bg-white hover:border-[#006637]/50 hover:text-[#006637]'
                                                        }`}
                                                >
                                                    {/* Visual hover effect line */}
                                                    <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-[#006637] transition-transform duration-300 ${selectedSize === size ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 mt-2 justify-end items-end">
                            <div className="w-24">
                                <label className="text-[10px] font-bold text-gray-500 mb-1 block">Qty</label>
                                <div className="w-full h-11 border border-gray-300 rounded-lg px-2 flex items-center justify-between bg-white text-gray-800 font-bold text-sm">
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            const maxQty = parseInt(product.product_qty) || 0;
                                            if (isNaN(val) || val < 1) {
                                                setQuantity(1);
                                            } else if (maxQty > 0 && val > maxQty) {
                                                setQuantity(maxQty);
                                                toast.warning(`Only ${maxQty} items available in stock`);
                                            } else {
                                                setQuantity(val);
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") setQuantity(1);
                                        }}
                                        className="w-full bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-center"
                                        min="1"
                                    />
                                    <div className="flex flex-col gap-0.5 border-l border-gray-100 pl-1">
                                        <button
                                            onClick={() => {
                                                const maxQty = parseInt(product.product_qty) || 0;
                                                if (maxQty > 0 && quantity >= maxQty) {
                                                    toast.warning(`Only ${maxQty} items available in stock`);
                                                    return;
                                                }
                                                setQuantity(q => q + 1);
                                            }}
                                            className="text-gray-400 hover:text-[#006637] transition-colors"
                                        >
                                            <ChevronUp className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            className="text-gray-400 hover:text-[#006637] transition-colors"
                                        >
                                            <ChevronDown className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1">
                                <label className="text-[10px] font-bold text-transparent mb-1 block select-none">Add</label>
                                <button
                                    onClick={handleAddToCart}
                                    disabled={cartLoading || product.status === 0 || (parseInt(product.product_qty) || 0) <= 0}
                                    className="w-full h-11 bg-[#006637] hover:bg-[#005530] text-white text-sm md:text-base font-bold rounded-lg shadow-lg shadow-[#006637]/20 transition-all hover:shadow-[#006637]/40 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform cursor-pointer"
                                >
                                    {cartLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Adding...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="w-4 h-4" />
                                            <span>Add to Cart</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <button
                                onClick={handleWishlistToggle}
                                disabled={isWishlistLoading}
                                className={`w-11 h-11 rounded-lg flex items-center justify-center border transition-all ${isInWishlist
                                    ? 'border-red-200 bg-red-50 text-red-500'
                                    : 'border-gray-200 bg-white text-gray-400 hover:border-[#006637] hover:text-[#006637]'
                                    }`}
                            >
                                {isWishlistLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                                )}
                            </button>
                        </div>

                        {/* Description & Specs */}
                        {/* Description & Specs & Reviews */}
                        <div className="mt-6 border-t border-gray-100">
                            <ProductAccordion
                                title="Description"
                                content={product.long_description || "No description available."}
                                isOpen={openAccordion === "description"}
                                onClick={() => setOpenAccordion(openAccordion === "description" ? null : "description")}
                            />
                            <ProductAccordion
                                title="Specification"
                                content={
                                    product.specification_list && product.specification_list.length > 0 ? (
                                        <ul className="list-disc list-inside space-y-1 pl-1">
                                            {product.specification_list.map((spec, index) => (
                                                <li key={index}>{spec}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        product.specification || "No specifications available."
                                    )
                                }
                                isOpen={openAccordion === "specification"}
                                onClick={() => setOpenAccordion(openAccordion === "specification" ? null : "specification")}
                            />
                            <ProductAccordion
                                title="Review"
                                content={<div className="text-gray-500 italic">No reviews yet.</div>}
                                isOpen={openAccordion === "review"}
                                onClick={() => setOpenAccordion(openAccordion === "review" ? null : "review")}
                            />
                        </div>
                    </div>

                    {/* Column 3: Sidebar - Trust, Delivery, Payment (20%) */}
                    <div className="hidden lg:block lg:w-[20%] mt-6 lg:mt-0">
                        <div className="lg:sticky lg:top-24 space-y-4">
                            {/* Delivery Card */}
                            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-50">
                                    <div className="p-1.5 bg-[#f0f9f6] rounded-full text-[#006637]">
                                        <Truck className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold text-gray-900">Delivery</span>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-start gap-2">
                                        <span className="bg-[#feef1a] text-black text-[9px] font-bold px-1.5 py-0.5 rounded-sm shrink-0 mt-0.5">
                                            EXPRESS
                                        </span>
                                        <p className="text-[11px] text-gray-600 leading-snug">
                                            Free delivery on orders over <span className="font-semibold text-gray-900">AED 100</span>.
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0"></div>
                                        <p className="text-[11px] text-gray-500 leading-snug">
                                            Order before 2 PM for same-day dispatch.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Trust Card */}
                            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-50">
                                    <div className="p-1.5 bg-[#f0f9f6] rounded-full text-[#006637]">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold text-gray-900">Brand Promise</span>
                                </div>
                                <ul className="space-y-2.5">
                                    <li className="flex items-center gap-2 text-[11px] text-gray-600">
                                        <ShieldCheck className="w-3.5 h-3.5 text-[#006637]" />
                                        <span>1 Year Warranty</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-[11px] text-gray-600">
                                        <AlertCircle className="w-3.5 h-3.5 text-[#006637]" />
                                        <span>Hassle-free Returns</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-[11px] text-gray-600">
                                        <Lock className="w-3.5 h-3.5 text-[#006637]" />
                                        <span>100% Secure Checkout</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Payment Partners */}
                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                                <span className="text-[10px] font-semibold text-gray-400 block mb-2">We Accept</span>
                                <div className="flex items-center justify-center gap-2 grayscale opacity-70">
                                    <div className="h-5 w-8 bg-white rounded border border-gray-200 flex items-center justify-center text-[7px] font-bold text-gray-400">VISA</div>
                                    <div className="h-5 w-8 bg-white rounded border border-gray-200 flex items-center justify-center text-[7px] font-bold text-gray-400">MC</div>
                                    <div className="h-5 w-8 bg-white rounded border border-gray-200 flex items-center justify-center text-[7px] font-bold text-gray-400">AMEX</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16 pt-8 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">You may also like</h2>
                            <Link href="/products" className="text-[#006637] font-semibold text-xs md:text-sm hover:underline flex items-center gap-1">
                                View All <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-5">
                            {relatedProducts.map((prod) => (
                                <ProductCard key={prod.id} product={prod} />
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}