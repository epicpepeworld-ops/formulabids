import { useReadContract } from "thirdweb/react";
import { contract } from "@/constants/contract";
import { useState, useEffect } from "react";
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
    // Get market count
    const { data: marketCount } = useReadContract({
        contract,
        method: "function marketCount() view returns (uint256)",
        params: []
    });

    const [topMarkets, setTopMarkets] = useState<MarketData[]>([]);
    const [currentMarketIndex, setCurrentMarketIndex] = useState(0);

    // Fetch top 3 markets for rotation
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

    // Process markets and sort by volume
    useEffect(() => {
        // Get top 3 for rotation
        const markets = [market1, market2, market3]
            .filter(Boolean)
            .map((market, index) => {
                const totalOptionAShares = Number(market![6]) / 1000000;
                const totalOptionBShares = Number(market![7]) / 1000000;
                const totalVolume = totalOptionAShares + totalOptionBShares;
                const yesPercentage = totalVolume > 0 ? (totalOptionAShares / totalVolume) * 100 : 50;

                return {
                    id: index + 1,
                    question: market![0],
                    optionA: market![1],
                    optionB: market![2],
                    imageUrl: market![3],
                    totalVolume,
                    yesPercentage
                };
            })
            .sort((a, b) => b.totalVolume - a.totalVolume); // Sort by volume descending

        setTopMarkets(markets);
    }, [market1, market2, market3]);

    // Auto-rotate markets every 4 seconds
    useEffect(() => {
        if (topMarkets.length === 0) return;
        
        const interval = setInterval(() => {
            setCurrentMarketIndex((prev) => (prev + 1) % topMarkets.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [topMarkets.length]);

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
                                From driver transfers to race day weather – predict the F1 moments that matter and earn real money when you're right.
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
                    </div>

                    {/* Right side - Rotating market preview */}
                    <div className="relative">
                        {currentMarket && (
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

                        {/* Fallback when no markets */}
                        {topMarkets.length === 0 && (
                            <div className="bg-[#171717] rounded-xl border border-gray-800 p-6 text-center">
                                <div className="text-6xl mb-4">🏎️</div>
                                <h3 className="text-white font-bold text-lg mb-2">Markets Loading...</h3>
                                <p className="text-gray-400">F1 prediction markets will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
