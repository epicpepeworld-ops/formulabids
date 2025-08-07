import { useReadContract } from "thirdweb/react";
import { contract } from "@/constants/contract";
import { useState, useEffect, useMemo } from "react";
import { ChevronRight, TrendingUp } from "lucide-react";

interface MarketData {
    id: number;
    question: string;
    optionA: string;
    optionB: string;
    imageUrl: string;
    totalVolume: number;
    yesPercentage: number;
}

export function HeroBanner() {
    console.log("🏎️ HeroBanner component loaded");
    
    const [topMarkets, setTopMarkets] = useState<MarketData[]>([]);
    const [currentMarketIndex, setCurrentMarketIndex] = useState(0);

    // Get more markets by volume to ensure we have enough active ones
    const { data: topMarketIds, refetch: refetchTopMarkets } = useReadContract({
        contract,
        method: "function getMarketsByVolume(uint256 _limit) view returns (uint256[])",
        params: [BigInt(10)] // Get top 10 by volume to ensure we can find 3 active ones
    });

    // Get active markets to filter out expired/resolved ones
    const { data: activeMarketIds, refetch: refetchActiveMarkets } = useReadContract({
        contract,
        method: "function getActiveMarkets() view returns (uint256[])",
        params: []
    });

    console.log("📊 Debug - topMarketIds:", topMarketIds);
    console.log("📊 Debug - activeMarketIds:", activeMarketIds);

    // Filter topMarketIds to only include active markets and get first 3
    const activeTopMarketIds = useMemo(() => {
        if (!topMarketIds || !activeMarketIds) return [];
        
        console.log("🔍 All topMarketIds:", topMarketIds.map(id => Number(id)));
        console.log("🔍 All activeMarketIds:", activeMarketIds.map(id => Number(id)));
        
        const filtered = topMarketIds.filter(id => activeMarketIds.includes(id)).slice(0, 3);
        
        console.log("🔍 Filtered activeTopMarketIds:", filtered.map(id => Number(id)));
        console.log("🔍 Final count for hero banner:", filtered.length);
        
        return filtered;
    }, [topMarketIds, activeMarketIds]);

    // Get market info for the first top market
    const { data: market1 } = useReadContract({
        contract,
        method: "function getMarketInfo(uint256 _marketId) view returns (string question, string optionA, string optionB, string imageUrl, uint256 endTime, uint8 outcome, uint256 totalOptionAShares, uint256 totalOptionBShares, bool resolved)",
        params: activeTopMarketIds.length > 0 ? [activeTopMarketIds[0]] : [BigInt(0)]
    });

    // Get market info for the second top market
    const { data: market2 } = useReadContract({
        contract,
        method: "function getMarketInfo(uint256 _marketId) view returns (string question, string optionA, string optionB, string imageUrl, uint256 endTime, uint8 outcome, uint256 totalOptionAShares, uint256 totalOptionBShares, bool resolved)",
        params: activeTopMarketIds.length > 1 ? [activeTopMarketIds[1]] : [BigInt(0)]
    });

    // Get market info for the third top market
    const { data: market3 } = useReadContract({
        contract,
        method: "function getMarketInfo(uint256 _marketId) view returns (string question, string optionA, string optionB, string imageUrl, uint256 endTime, uint8 outcome, uint256 totalOptionAShares, uint256 totalOptionBShares, bool resolved)",
        params: activeTopMarketIds.length > 2 ? [activeTopMarketIds[2]] : [BigInt(0)]
    });

    // Process markets and create display data - FIXED DEPENDENCIES
    useEffect(() => {
        if (activeTopMarketIds.length === 0) {
            console.log("⚠️ No activeTopMarketIds available");
            return;
        }

        const markets: MarketData[] = [];
        const marketDataArray = [
            { data: market1, id: activeTopMarketIds[0] },
            { data: market2, id: activeTopMarketIds[1] },
            { data: market3, id: activeTopMarketIds[2] }
        ];

        let hasNewMarkets = false;

        marketDataArray.forEach(({ data, id }, index) => {
            if (data && id) {
                const totalOptionAShares = Number(data[6]) / 1000000;
                const totalOptionBShares = Number(data[7]) / 1000000;
                const totalVolume = totalOptionAShares + totalOptionBShares;
                const yesPercentage = totalVolume > 0 ? (totalOptionAShares / totalVolume) * 100 : 50;

                markets.push({
                    id: Number(id),
                    question: data[0],
                    optionA: data[1],
                    optionB: data[2],
                    imageUrl: data[3],
                    totalVolume,
                    yesPercentage
                });
                
                hasNewMarkets = true;
                console.log(`🔥 Hero market ${index + 1}:`, data[0], `Volume: $${totalVolume.toFixed(2)}`);
            }
        });

        if (hasNewMarkets) {
            setTopMarkets(markets);
            console.log("📊 Total hero markets loaded:", markets.length);
        }
    }, [
        activeTopMarketIds.length, 
        market1?.[0], 
        market2?.[0], 
        market3?.[0]
    ]); // FIXED: Only depend on stable values

    // Auto-rotate markets every 4 seconds
    useEffect(() => {
        if (topMarkets.length === 0) return;
        
        const interval = setInterval(() => {
            setCurrentMarketIndex((prev) => (prev + 1) % topMarkets.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [topMarkets.length]);

    // Auto-refresh every 24 hours
    useEffect(() => {
        const refreshInterval = setInterval(() => {
            console.log("🔄 Refreshing hero banner markets...");
            refetchTopMarkets();
            refetchActiveMarkets();
        }, 24 * 60 * 60 * 1000);

        return () => clearInterval(refreshInterval);
    }, [refetchTopMarkets, refetchActiveMarkets]);

    // Smooth scroll to tabs function
    const scrollToTabs = () => {
        const tabsElement = document.querySelector('[role="tablist"]');
        if (tabsElement) {
            tabsElement.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    const currentMarket = topMarkets[currentMarketIndex];

    return (
        <div className="w-full bg-gradient-to-br from-[#000000] via-[#0a0a0a] to-[#171717] py-16">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left side - Text content */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-5xl lg:text-6xl font-bold text-white font-alliance leading-tight">
                                The Ultimate{" "}
                                <span className="text-[#34f876]">F1</span>{" "}
                                Prediction Market
                            </h1>
                            <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                                From driver transfers to race day weather – predict the F1 moments that matter and earn real money when you&apos;re right.
                            </p>
                        </div>

                        {/* CTA Buttons with smooth scroll */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                                onClick={scrollToTabs}
                                className="bg-[#34f876] text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#2ed968] transition-colors flex items-center gap-2 justify-center"
                            >
                                Start Predicting
                                <ChevronRight className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={scrollToTabs}
                                className="border border-[#34f876] text-[#34f876] px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#34f876]/10 transition-colors"
                            >
                                View All Markets
                            </button>
                        </div>

                        {/* Powered by text - aligned with buttons */}
                        <div className="text-sm text-gray-400">
                            Powered by <span className="text-[#34f876]">USDC</span> on <span className="text-blue-400">Base Network</span>
                        </div>
                    </div>

                    {/* Right side - Rotating market preview */}
                    <div className="relative">
                        {currentMarket ? (
                            <div className="relative bg-[#171717] rounded-xl border border-gray-800 p-6 shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-300">
                                {/* Market image */}
                                <div className="w-full h-48 rounded-lg overflow-hidden mb-4">
                                    <img 
                                        src={currentMarket.imageUrl} 
                                        alt={currentMarket.question}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>

                                {/* Market question */}
                                <h3 className="text-white font-bold text-lg mb-4 font-alliance">
                                    {currentMarket.question}
                                </h3>

                                {/* Progress bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-[#31f993] text-sm font-medium">
                                            {currentMarket.optionA}: {Math.floor(currentMarket.yesPercentage)}%
                                        </span>
                                        <span className="text-[#fe4545] text-sm font-medium">
                                            {currentMarket.optionB}: {Math.floor(100 - currentMarket.yesPercentage)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                                        <div className="h-full flex">
                                            <div 
                                                className="bg-[#31f993] transition-all duration-300"
                                                style={{ width: `${currentMarket.yesPercentage}%` }}
                                            />
                                            <div 
                                                className="bg-[#fe4545] transition-all duration-300"
                                                style={{ width: `${100 - currentMarket.yesPercentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Volume indicator */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                                        <TrendingUp className="w-4 h-4" />
                                        Volume: ${currentMarket.totalVolume.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Market #{currentMarket.id}
                                    </div>
                                </div>

                                {/* "Hot" badge for top volume */}
                                {currentMarketIndex === 0 && (
                                    <div className="absolute -top-2 -right-2 bg-[#34f876] text-black px-3 py-1 rounded-full text-xs font-bold">
                                        🔥 HOT
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Fallback when no active markets */
                            <div className="bg-[#171717] rounded-xl border border-gray-800 p-6 text-center">
                                <div className="text-6xl mb-4">🏎️</div>
                                <h3 className="text-white font-bold text-lg mb-2">No Active Markets</h3>
                                <p className="text-gray-400">New F1 prediction markets coming soon!</p>
                            </div>
                        )}

                        {/* Rotation indicators */}
                        {topMarkets.length > 1 && (
                            <div className="flex justify-center gap-2 mt-6">
                                {topMarkets.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentMarketIndex(index)}
                                        className={`w-3 h-3 rounded-full transition-colors ${
                                            index === currentMarketIndex 
                                                ? 'bg-[#34f876]' 
                                                : 'bg-gray-600 hover:bg-gray-500'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
