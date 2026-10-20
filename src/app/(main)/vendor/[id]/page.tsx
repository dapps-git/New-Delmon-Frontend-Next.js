"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Store, MapPin, Calendar, Phone, Mail, Package, Grid3x3, ChevronRight, Heart, ShoppingCart, Loader2 } from "lucide-react";
import { homeApi } from "@/src/service/homeApi";
import Loading from "@/src/components/common/Loading";
import ProductCard, { Product } from "@/src/components/common/ProductCard";
import { Meta, Vendor, VendorDetailedResponse } from "@/src/types/home.types";
import { ProductData } from "@/src/types/product.types";
import { getProductPrice } from "@/src/utils/productPrice";
import { CategoryData } from "@/src/types/vendor.types";


export default function VendorDetailView() {
    const params = useParams();
    const vendorId = params?.id as string;

    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [products, setProducts] = useState<ProductData[]>([]);
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [meta, setMeta] = useState<Meta | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (vendorId) {
            fetchVendorData();
        }
    }, [vendorId, currentPage, selectedCategory]);

    const fetchVendorData = async () => {
        setLoading(true);
        try {
            const res: VendorDetailedResponse = await homeApi.getVendorById(vendorId, {
                page: currentPage,
                category_id: selectedCategory === "all" ? undefined : Number(selectedCategory)
            });
            setVendor(res.data.vendor);
            setProducts(res.data.products || []);
            setCategories(res.data.category_data || []);
            setMeta(res.meta);
        } catch (error) {
            console.error("Error fetching vendor data:", error);
        } finally {
            setLoading(false);
        }
    };

    const transformToProductCard = (product: ProductData): Product => {
        const { price: finalPrice, oldPrice, badge } = getProductPrice(product);

        return {
            id: product.id,
            slug: product.product_slug,
            category: product.category?.category_name || "Product",
            title: product.product_name,
            price: `AED ${finalPrice}`,
            oldPrice: oldPrice ? `AED ${oldPrice}` : undefined,
            image: `${process.env.NEXT_PUBLIC_IMAGE_BASE}/${product.product_thambnail}`,
            badge,
            colors: product.product_color ? product.product_color.split(',').map(c => c.trim()) : undefined,
            sizes: product.product_size ? product.product_size.split(',').map(s => s.trim()) : undefined
        };
    };

    const handleCategoryChange = (categoryId: string) => {
        setSelectedCategory(categoryId);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading && !vendor) {
        return <Loading className="min-h-screen" />;
    }

    if (!vendor) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <p className="text-gray-500 mb-4">Vendor not found</p>
                <Link href="/" className="text-green-700 underline font-medium">Back to Home</Link>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4">
                    <nav className="flex items-center text-xs md:text-sm text-gray-500 font-medium">
                        <Link href="/" className="hover:text-green-700 transition-colors">Delmon</Link>
                        <ChevronRight className="w-3 h-3 mx-2" />
                        <Link href="/vendors" className="hover:text-green-700 transition-colors">Vendors</Link>
                        <ChevronRight className="w-3 h-3 mx-2" />
                        <span className="text-gray-900">{vendor.name}</span>
                    </nav>
                </div>
            </div>

            {/* Vendor Header Section */}
            <div className="bg-linear-to-br from-[#E8F3ED] to-white border-b border-gray-100">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Vendor Avatar */}
                        <div className="w-32 h-32 bg-white rounded-2xl border-2 border-green-100 shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
                            {vendor.photo ? (
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_IMAGE_BASE}/upload/vendor_images/${vendor.photo}`}
                                    alt={vendor.name}
                                    width={128}
                                    height={128}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <Store className="w-16 h-16 text-green-600" strokeWidth={1.5} />
                            )}
                        </div>

                        {/* Vendor Info */}
                        <div className="flex-1">
                            <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-[#114f30] mb-2">
                                        {vendor.name}
                                    </h1>
                                    <p className="text-gray-600 text-sm">@{vendor.username}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${vendor.status === 'active'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {vendor.status === 'active' ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>

                            {/* Contact Information Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                                <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100">
                                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                                        <Phone className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-gray-500 mb-1">Phone</p>
                                        <p className="text-sm font-medium text-gray-900 truncate">{vendor.phone}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100">
                                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                                        <Mail className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-gray-500 mb-1">Email</p>
                                        <p className="text-sm font-medium text-gray-900 truncate">{vendor.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100">
                                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                                        <Calendar className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-gray-500 mb-1">Joined</p>
                                        <p className="text-sm font-medium text-gray-900">{vendor.vendor_join}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-bold text-[#114f30] mb-1">
                                {meta?.total || 0}
                            </div>
                            <div className="text-sm text-gray-500">Total Products</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-bold text-[#114f30] mb-1">
                                {categories.length}
                            </div>
                            <div className="text-sm text-gray-500">Categories</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-bold text-[#114f30] mb-1">
                                {products.filter(p => p.featured).length}
                            </div>
                            <div className="text-sm text-gray-500">Featured Items</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-bold text-[#114f30] mb-1">
                                {products.filter(p => p.hot_deals).length}
                            </div>
                            <div className="text-sm text-gray-500">Hot Deals</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar - Categories */}
                    <aside className="lg:w-72 shrink-0">
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Grid3x3 className="w-5 h-5 text-green-600" />
                                Categories
                            </h2>

                            <button
                                onClick={() => handleCategoryChange("all")}
                                className={`w-full text-left px-4 py-3 rounded-xl mb-2 transition-all ${selectedCategory === "all"
                                    ? "bg-green-50 text-green-700 font-medium"
                                    : "hover:bg-gray-50 text-gray-700"
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span>All Products</span>
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                                        {meta?.total || 0}
                                    </span>
                                </div>
                            </button>

                            <div className="space-y-1 mt-4">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => handleCategoryChange(category.id.toString())}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all ${selectedCategory === category.id.toString()
                                            ? "bg-green-50 text-green-700 font-medium"
                                            : "hover:bg-gray-50 text-gray-700"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm truncate">{category.category_name}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Products Grid */}
                    <main className="flex-1">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {selectedCategory === "all" ? "All Products" :
                                    categories.find(c => c.id.toString() === selectedCategory)?.category_name}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {products.length} {products.length === 1 ? 'product' : 'products'}
                            </p>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-20 bg-gray-50 rounded-2xl">
                                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No products found in this category</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {products.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={transformToProductCard(product)}
                                        />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {meta && meta.last_page > 1 && (
                                    <div className="flex items-center justify-center gap-2 mt-12">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={!meta.prev_page}
                                            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Previous
                                        </button>

                                        <div className="flex items-center gap-2">
                                            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((page) => (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${currentPage === page
                                                        ? 'bg-green-600 text-white'
                                                        : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={!meta.next_page}
                                            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}