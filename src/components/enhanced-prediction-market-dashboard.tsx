'use client'

import { useReadContract } from 'thirdweb/react'
import { contract } from '@/constants/contract'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MarketCard } from './marketCard'
import { Navbar } from './navbar'
import { MarketCardSkeleton } from './market-card-skeleton'
import { Footer } from "./footer"
import { TrendingTicker } from "./TrendingTicker"
import { HeroBanner } from "./HeroBanner"

export function EnhancedPredictionMarketDashboard() {
    const { data: marketCount, isLoading: isLoadingMarketCount } = useReadContract({
        contract,
        method: "function marketCount() view returns (uint256)",
        params: []
    }); 

    // Show 6 skeleton cards while loading
    const skeletonCards = Array.from({ length: 6 }, (_, i) => (
        <MarketCardSkeleton key={`skeleton-${i}`} />
    ));

    return (
        <div className="min-h-screen flex flex-col bg-[#000000] dark">
            {/* Trending Ticker */}
            <TrendingTicker />
            
            <div className="flex-grow">
                <div className="container mx-auto p-4">
                    <Navbar />
                </div>
                
                {/* Hero Banner */}
                <HeroBanner />
                
                <div className="container mx-auto p-4">
                    <Tabs defaultValue="active" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-[#171717] border-[#34f876]/20">
                            <TabsTrigger 
                                value="active"
                                className="data-[state=active]:bg-[#34f876] data-[state=active]:text-black text-gray-400"
                            >
                                Active
                            </TabsTrigger>
                            <TabsTrigger 
                                value="pending"
                                className="data-[state=active]:bg-[#34f876] data-[state=active]:text-black text-gray-400"
                            >
                                Pending Resolution
                            </TabsTrigger>
                            <TabsTrigger 
                                value="resolved"
                                className="data-[state=active]:bg-[#34f876] data-[state=active]:text-black text-gray-400"
                            >
                                Resolved
                            </TabsTrigger>
                        </TabsList>
                        
                        {isLoadingMarketCount ? (
                            <TabsContent value="active" className="mt-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {skeletonCards}
                                </div>
                            </TabsContent>
                        ) : (
                            <>
                                <TabsContent value="active">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {Array.from({ length: Number(marketCount) }, (_, index) => (
                                            <MarketCard 
                                                key={index + 1} 
                                                index={index + 1} 
                                                filter="active"
                                            />
                                        ))}
                                    </div>
                                </TabsContent>
                                
                                <TabsContent value="pending">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {Array.from({ length: Number(marketCount) }, (_, index) => (
                                            <MarketCard 
                                                key={index + 1} 
                                                index={index + 1}
                                                filter="pending"
                                            />
                                        ))}
                                    </div>
                                </TabsContent>
                                
                                <TabsContent value="resolved">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {Array.from({ length: Number(marketCount) }, (_, index) => (
                                            <MarketCard 
                                                key={index + 1} 
                                                index={index + 1}
                                                filter="resolved"
                                            />
                                        ))}
                                    </div>
                                </TabsContent>
                            </>
                        )}
                    </Tabs>
                </div>
            </div>
            <Footer />
        </div>
    );
}
