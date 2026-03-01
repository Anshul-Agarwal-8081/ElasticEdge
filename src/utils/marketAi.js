/**
 * Market intelligence service for calculating "Actual Demand"
 * Formula: Demand Index = (Peak Consumer Interest) / (Current Market Saturation)
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Simulates a request to a Google Trends proxy.
 * In a production backend, this would use 'google-trends-api' package.
 */
export const getMarketSignals = async (productName) => {
    // Simulated Search Interest peak for various categories
    // Scale 0-100
    const mockTrends = {
        'Widget': Math.random() * 40 + 60, // Popular
        'Gizmo': Math.random() * 30 + 40,  // Moderate
        'Thingamajig': Math.random() * 20 + 10, // Niche
        'default': Math.random() * 50 + 25
    };

    const key = Object.keys(mockTrends).find(k => productName.includes(k)) || 'default';
    return {
        interestScore: mockTrends[key],
        timestamp: new Date().toISOString()
    };
};

/**
 * Calculates Demand based on formula: consumed / produced
 * @param {Object} product - Product record
 * @param {Number} searchInterest - 0-100 scale from Trends
 */
export const calculateActualDemand = (product, searchInterest) => {
    const consumed = searchInterest * 10; // scale up interest to "estimated units consumption rate"
    const produced = parseFloat(product['Quantity']) || 100; // market saturation / stock

    // User formula: consumed / produced
    let rawDemand = consumed / produced;

    // Normalize to 0.0 - 1.0 scale used by the simulator
    // A value of 1.0 means high scarcity/high demand (Interest > Produced)
    const normalizedDemand = Math.min(Math.max(rawDemand / 10, 0.1), 0.99);

    return normalizedDemand.toFixed(2);
};

/**
 * Uses Gemini AI to provide context on WHY the demand changed based on trends
 */
export const getAiMarketContext = async (productName, demandIndex) => {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-key-for-market-research') {
        return "Connect your Gemini API Key in .env.local to see deep market analysis.";
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Act as a pricing analyst. For the product "${productName}", the market demand index is currently ${demandIndex} (where 0.1 is low and 0.9 is extreme). 
                        Based on simulated Google Trends research, provide a concise 2-sentence market update explaining why this demand index makes sense for this product.`
                    }]
                }]
            })
        });
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (e) {
        console.error("Gemini Error:", e);
        return "Market data suggests a fluctuation in consumer retention patterns.";
    }
};
