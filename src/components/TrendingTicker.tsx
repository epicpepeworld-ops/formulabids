import { useReadContract } from "thirdweb/react";
import { contract } from "@/constants/contract";
import { TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export function TrendingTicker() {
    // Get market count
    const { data: marketCount } = useReadContract({
        contract,
        method: "function marketCount() view returns (uint256)",
        params: []
    });

    const [tickerItems, setTickerItems] = useState<string[]>([]);

    // Get the latest 5 markets (or fewer if not available)
    const getLatestMarketIds = (totalMarkets: number) => {
        const latest = [];
        const start = Math.max(1, totalMarkets - 4); // Get last 5, or start from 1
        for (let i = start; i <= totalMarkets; i++) {
            latest.push(i);
        }
        return latest;
    };

    // Fetch market questions using useReadContract for each market
    const { data: market1 } = useReadContract({
        contract,
        method: "function getMarketInfo(uint256 _marketId) view returns (string question, string optionA, string optionB, string imageUrl, uint256 endTime, uint8 outcome, uint256 totalOptionAShares, uint256 totalOptionBShares, bool resolved)",
        params: marketCount && Number(marketCount) >= 1 ? [BigInt(1)] : undefined
    });

    const { data: market2 } = useReadContract({
        contract,
        method: "function getMarketInfo(uint256 _marketId) view returns (string question, string optionA, string optionB, string imageUrl, uint256 endTime, uint8 outcome, uint256 totalOptionAShares, uint256 totalOptionBShares, bool resolved)",
        params: marketCount && Number(marketCount) >= 2 ? [BigInt(2)] : undefined
    });

    const { data: market3 } = useReadContract({
        contract,
        method: "function getMarketInfo(uint256 _marketId) view returns (string question, string optionA, string optionB, string imageUrl, uint256 endTime, uint8 outcome, uint256 totalOptionAShares, uint256 totalOptionBShares, bool resolved)",
        params: marketCount && Number(marketCount) >= 3 ? [BigInt(3)] : undefined
    });

    const { data: market4 } = useReadContract({
        contract,
        method: "function getMarketInfo(uint256 _marketId) view returns (string question, string optionA, string optionB, string imageUrl, uint256 endTime, uint8 outcome, uint256 totalOptionAShares, uint256 totalOptionBShares, bool resolved)",
        params: marketCount && Number(marketCount) >= 4 ? [BigInt(4)] : undefined
    });

    const { data: market5 } = useReadContract({
        contract,
        method: "function getMarketInfo(uint256 _marketId) view returns (string question, string optionA, string optionB, string imageUrl, uint256 endTime, uint8 outcome, uint256 totalOptionAShares, uint256 totalOptionBShares, bool resolved)",
        params: marketCount && Number(marketCount) >= 5 ? [BigInt(5)] : undefined
    });

    useEffect(() => {
        if (!marketCount) return;

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
        let combinedItems = [...marketTitles];
        while (combinedItems.length < 5) {
            const randomFlair = flairItems[Math.floor(Math.random() * flairItems.length)];
            if (!combinedItems.includes(randomFlair)) {
                combinedItems.push(randomFlair);
            }
        }

        setTickerItems(combinedItems);
    }, [marketCount, market1, market2, market3, market4, market5]);

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
