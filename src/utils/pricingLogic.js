export const computeRecommendedPrice = (product, k) => {
    const sellingPrice = parseFloat(product['Selling Price']);
    const marketPrice = parseFloat(product['Market Price']);
    const costPrice = parseFloat(product['Cost Price']);
    const marketDemand = parseFloat(product['Market Demand']);

    // 1. Relative price gap (lambda) - unused in direct calculation but part of analysis
    const lambda = (sellingPrice - marketPrice) / marketPrice;

    // 2. Demand Pressure (S)
    const S = 1 - marketDemand;

    // 3. Preferred Price (PP)
    let PP = sellingPrice - (sellingPrice * S * k);

    // 4. Avoid overpricing
    PP = Math.min(PP, marketPrice);

    // 5. Ensure cost constraint: Cost Price < PP < Selling Price
    if (PP <= costPrice) {
        PP = costPrice + (sellingPrice - costPrice) * 0.1; // adjust slightly above cost
    }
    if (PP >= sellingPrice && sellingPrice > costPrice) {
        PP = sellingPrice - 0.01; // can't exceed current selling price conceptually
    }

    return parseFloat(PP.toFixed(2));
};

export const needsRevision = (currentPrice, recommendedPrice) => {
    if (!currentPrice || !recommendedPrice) return false;
    // If price differs by more than 5%
    const diff = Math.abs(currentPrice - recommendedPrice) / currentPrice;
    return diff > 0.05;
};

export const generateTimeSeriesData = (baseRevenue, baseSales, days = 31, history = null) => {
    const today = new Date();

    return Array.from({ length: days }, (_, i) => {
        const dayNum = i + 1;
        // We assume the window ends TODAY. 
        // So index (days - 1) is Today.
        const slotDate = new Date();
        slotDate.setDate(today.getDate() - (days - 1 - i));
        const dateStr = slotDate.toISOString().split('T')[0];

        const historyData = history && history[dateStr];

        if (historyData) {
            return {
                day: dayNum,
                revenue: historyData.revenue || 0,
                sales: historyData.units || 0,
                isActual: true,
                date: dateStr
            };
        }

        // Projection logic for slots without history
        // If the date is in the future relative to the latest history point, or just generic baseline
        const variance = 1 + (Math.random() * 0.2 - 0.1);
        return {
            day: dayNum,
            revenue: Math.floor(baseRevenue * variance),
            sales: Math.floor(baseSales * variance),
            isActual: false,
            date: dateStr
        };
    });
};
