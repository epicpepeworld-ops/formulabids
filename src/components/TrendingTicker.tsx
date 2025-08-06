import { useReadContract } from "thirdweb/react";
import { contract } from "@/constants/contract";
import { TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export function TrendingTicker() {
    const [tickerItems, setTickerItems] = useState<string[]>([]);
    const [selectedMarketIds, setSelectedMarketIds] = useState<number[]>([]);

    // Get active markets
    const { data: activeMarketIds, refetch: refetchActiveMarkets } = useReadContract({
        contract,
        method: "function getActiveMarkets() view returns (uint256[])",
        params: []
    });

    // Get market info for each selected market (we'll fetch up to 5)
    const { data: market1 } = useReadContract({
        contract,
        method: "function getMarketInfo(uint256 _marketId) view returns (string question, string optionA, string optionB, string imageUrl, uint256 endTime, uint8 outcome, uint256 totalOptionAShares, uint256 totalOptionBShares, bool resolved)",
        params: selectedMarketIds.length > 0 ? [BigInt(selectedMarketIds[0])] : [BigInt(0)]
    });

    const { data: market2 } = useReadContract({
        contract,
        method: "function getMarketInfo(uint256 _marketId) view returns (string question, string optionA, string optionB, string imageUrl, uint256 endTime, uint8 outcome, uint256 totalOptionAShares, uint256 totalOptionBShares, bool resolved)",
        params: selectedMarketIds.length > 1 ? [BigInt(selectedMarketIds[1])] : [BigInt(0)]
    });

    const { data: market3 } = useReadContract({
        contract,
        method: "function getMarketInfo(uint256 _marketId) view returns (string question, string optionA, string optionB, string imageUrl, uint256 endTime, uint8 outcome, uint256 totalOptionAShares, uint256 totalOptionBShares, bool resolved)",
        params: selectedMarketIds.length > 2 ? [BigInt(selectedMarketIds[2])] : [BigInt(0)]
    });

    const { data: market4 } = useReadContract({
        contract,
        method: "function getMarketInfo(uint256 _marketId) view returns (string question, string optionA, string optionB, string imageUrl, uint256 endTime, uint8 outcome, uint256 totalOptionAShares, uint256 totalOptionBShares, bool resolved)",
        params: selectedMarketIds.length > 3 ? [BigInt(selectedMarketIds[3])] : [BigInt(0)]
    });

    const { data: market5 } = useReadContract({
        contract,
        method: "function getMarketInfo(uint256 _marketId) view returns (string question, string optionA, string optionB, string imageUrl, uint256 endTime, uint8 outcome, uint256 totalOptionAShares, uint256 totalOptionBShares, bool resolved)",
        params: selectedMarketIds.length > 4 ? [BigInt(selectedMarketIds[4])] : [BigInt(0)]
    });

    // Function to randomly select 5 markets from active markets
    const selectRandomMarkets = (activeIds: bigint[]) => {
        if (activeIds.length === 0) return [];
        
        const shuffled = [...activeIds].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, Math.min(5, shuffled.length));
        return selected.map(id => Number(id));
    };

    // Select random markets when active markets change
    useEffect(() => {
        if (activeMarketIds && activeMarketIds.length > 0) {
            const randomMarkets = selectRandomMarkets(activeMarketIds);
            setSelectedMarketIds(randomMarkets);
            console.log("🎲 Selected random markets for ticker:", randomMarkets);
        }
    }, [activeMarketIds]);

    // Auto-refresh every 24 hours
    useEffect(() => {
        const refreshInterval = setInterval(() => {
            console.log("🔄 Refreshing ticker markets...");
            
            // Refetch active markets
            refetchActiveMarkets();
            
        }, 24 * 60 * 60 * 1000); // 24 hours

        return () => clearInterval(refreshInterval);
    }, [refetchActiveMarkets]);

    // Process market data into ticker items
    useEffect(() => {
        const markets = [market1, market2, market3, market4, market5].filter(Boolean);
        const marketTitles = markets.map(market => `🏎️ ${market![0]}`); // market[0] is the question

        // F1 flair items to fill if we don't have enough markets
        const flairItems = [
            "⚡ Live F1 predictions updating",
            "🏁 New markets added daily", 
            "🔥 Hot driver contract bets",
            "🎯 Championship odds shifting",
            "🏆 Race weekend specials live"
        ];

        // Ensure we have at least 1 item, fill up to 5
        const combinedItems = [...marketTitles];
        while (combinedItems.length < 5) {
            const randomFlair = flairItems[Math.floor(Math.random() * flairItems.length)];
            if (!combinedItems.includes(randomFlair)) {
                combinedItems.push(randomFlair);
            }
        }

        setTickerItems(combinedItems);
    }, [market1, market2, market3, market4, market5]);

    // Fallback content while loading
    const fallbackItems = [
        "🏎️ F1 predictions heating up",
        "🏁 Driver markets going live", 
        "⚡ Championship odds updating",
        "🔥 Hot F1 bets trending",
        "🎯 Race weekend specials"
    ];

    const displayItems = tickerItems.length > 0 ? tickerItems : fallbackItems;

    return (
        <div className="w-full bg-[#171717] border-b border-gray-800 py-2 overflow-hidden">
            <div className="flex items-center h-12">
                {/* Trending label - now same height as the line */}
                <div className="flex items-center justify-center gap-3 px-6 h-full text-[#34f876] font-bold text-lg bg-[#34f876]/20 border-r border-[#34f876]/30">
                    <TrendingUp className="w-6 h-6" />
                    <span className="font-alliance">TRENDING</span>
                </div>

                {/* Scrolling content - truly seamless */}
                <div className="flex-1 relative h-full overflow-hidden">
                    <div className="flex items-center h-full animate-marquee">
                        {/* Duplicate for seamless effect */}
                        {displayItems.concat(displayItems).map((item, index) => (
                            <span 
                                key={index}
                                className="inline-block px-12 text-gray-300 text-lg font-medium whitespace-nowrap"
                            >
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
