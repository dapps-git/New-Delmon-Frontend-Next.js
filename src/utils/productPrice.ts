interface PriceSource {
    selling_price: string | number;
    discount_price?: string | number | null;
    contract_price?: string | number | null;
}

export interface ProductPrice {
    price: string;
    oldPrice?: string;
    badge?: string;
    discountPercent?: number;
    isContract: boolean;
}

const hasValue = (v: unknown) => v !== null && v !== undefined && v !== "" && !isNaN(parseFloat(String(v)));

/**
 * Resolves the price to display for a product.
 * contract_price is only returned by the API for the logged-in user's approved
 * contract products, so when present it takes priority (same as the cart).
 */
export function getProductPrice(item: PriceSource): ProductPrice {
    const selling = String(item.selling_price);
    const sell = parseFloat(selling);

    if (hasValue(item.contract_price)) {
        const contract = String(item.contract_price);
        return {
            price: contract,
            oldPrice: parseFloat(contract) < sell ? selling : undefined,
            badge: "Contract Price",
            isContract: true,
        };
    }

    if (hasValue(item.discount_price) && parseFloat(String(item.discount_price)) > 0) {
        const discount = String(item.discount_price);
        const percent = sell > 0 ? Math.round(((sell - parseFloat(discount)) / sell) * 100) : undefined;
        return {
            price: discount,
            oldPrice: selling,
            badge: percent ? `${percent}% Off` : undefined,
            discountPercent: percent,
            isContract: false,
        };
    }

    return { price: selling, isContract: false };
}
