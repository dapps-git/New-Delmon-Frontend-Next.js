"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { contractApi } from "@/src/service/contractApi";
import FormInput from "@/src/components/common/FormInput";
import ProtectedRoute from "@/src/components/auth/ProtectedRoute";
import { useAppDispatch, useAppSelector } from "@/src/hooks/useRedux";
import { fetchUserProfile } from "@/src/redux/auth/authThunk";

export default function ContractRequestPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const contractStatus = useAppSelector((state) => state.auth.user?.contract_status);
    const [loading, setLoading] = useState(false);

    // Already requested/approved users shouldn't see the form again
    useEffect(() => {
        if (contractStatus === "Requested") {
            router.replace("/contract/success");
        } else if (contractStatus === "Approved") {
            router.replace("/contract/products");
        }
    }, [contractStatus, router]);
    const [form, setForm] = useState({
        name: "",
        company_name: "",
        email: "",
        phone: "",
        address: "",
        agree: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        setForm({ ...form, [e.target.name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.agree) {
            toast.error("Please agree to the Terms & Policy");
            return;
        }

        setLoading(true);
        try {
            const res = await contractApi.reqContracts({
                name: form.name,
                company_name: form.company_name,
                email: form.email,
                phone: form.phone,
                address: form.address,
            });

            if (res.status !== false) {
                toast.success(res.message || "Request submitted successfully");
                dispatch(fetchUserProfile());
                router.push("/contract/success");
            } else {
                toast.error(res.error || res.message || "Failed to submit request");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (contractStatus === "Requested" || contractStatus === "Approved") {
        return null;
    }

    return (
        <ProtectedRoute>

            <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-[1400px] mx-auto border border-[#8fccab] rounded-[20px] p-8 md:p-12">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a Contract</h1>
                        <div className="text-xs text-gray-500">
                            Delmon &gt; Home &gt; Create Contract
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 text-gray-900">
                        <div className="grid md:grid-cols-2 gap-6">
                            <FormInput
                                name="name"
                                label="User Name *"
                                placeholder=""
                                value={form.name}
                                onChange={handleChange}
                                className="h-12 border-[#8fccab] focus:ring-black rounded-lg"
                                required
                            />
                            <FormInput
                                name="company_name"
                                label="Company name*"
                                placeholder=""
                                value={form.company_name}
                                onChange={handleChange}
                                className="h-12 border-[#8fccab] focus:ring-black rounded-lg"
                                required
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <FormInput
                                name="email"
                                label="Email *"
                                type="email"
                                placeholder=""
                                value={form.email}
                                onChange={handleChange}
                                className="h-12 border-[#8fccab] focus:ring-black rounded-lg"
                                required
                            />
                            <FormInput
                                name="phone"
                                label="Phone *"
                                type="tel"
                                placeholder=""
                                value={form.phone}
                                onChange={handleChange}
                                className="h-12 border-[#8fccab] focus:ring-black rounded-lg"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address *
                            </label>
                            <input
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                className="w-full p-3 border border-[#8fccab] rounded-lg focus:outline-none focus:ring-1 focus:ring-black h-24"
                                required
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                name="agree"
                                id="agree"
                                checked={form.agree}
                                onChange={handleChange}
                                className="w-5 h-5 accent-[#114f30] border-gray-300 rounded"
                            />
                            <label htmlFor="agree" className="text-sm text-gray-600">
                                I Agree to know Terms & Policy
                            </label>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-[#114f30] text-white font-semibold px-8 py-3 rounded-full hover:bg-[#0d3d25] transition-colors disabled:opacity-70"
                            >
                                {loading ? "Requesting..." : "Request To Contract"}
                            </button>
                        </div>

                        <p className="text-xs text-gray-500 mt-6 leading-relaxed">
                            Note : Your personal data will be used to support your experience through out the website,
                            to manage access to your account, and for other purposes describe in our privacy policy
                        </p>
                    </form>
                </div>
            </div>
        </ProtectedRoute>
    );
}
