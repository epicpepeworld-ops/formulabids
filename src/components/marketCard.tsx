import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { contract } from "@/constants/contract";
import { MarketProgress } from "./market-progress";
import { MarketTime } from "./market-time";
import { MarketCardSkeleton } from "./market-card-skeleton";
import { MarketResolved } from "./market-resolved";
import { MarketPending } from "./market-pending";
import { MarketBuyInterface } from "./market-buy-interface";
import { MarketSharesDisplay } from "./market-shares-display";

// Props for the MarketCard component
// index is the market id
// filter is the filter to apply to the market
interface MarketCardProps {
  index: number;
  filter: 'active' | 'pending' | 'resolved';
}

// Interface for the market data - UPDATED for V3
interface Market {
  question: string;
  optionA: string;
  optionB: string;
  imageUrl: string; // NEW: Image URL from contract
  endTime: bigint;
  outcome: number;
  totalOptionAShares: bigint;
  totalOptionBShares: bigint;
  resolved: boolean;
}

// Interface for the shares balance
interface SharesBalance {
  optionAShares: bigint;
  optionBShares: bigint;
}

export function MarketCard({ index, filter }: MarketCardProps) {
    // Get the active account
    const account = useActiveAccount();

    // Get the market data - UPDATED for V3 with imageUrl
    const { data: marketData, isLoading: isLoadingMarketData } = useReadContract({
        contract,
        method: "function getMarketInfo(uint256 _marketId) view returns (string question, string optionA, string optionB, string imageUrl, uint256 endTime, uint8 outcome, uint256 totalOptionAShares, uint256 totalOptionBShares, bool resolved)",
        params: [BigInt(index)]
    });

    // Parse the market data - UPDATED for V3
    const market: Market | undefined = marketData ? {
        question: marketData[0],
        optionA: marketData[1],
        optionB: marketData[2],
        imageUrl: marketData[3], // NEW: Image URL
        endTime: marketData[4],
        outcome: marketData[5],
        totalOptionAShares: marketData[6],
        totalOptionBShares: marketData[7],
        resolved: marketData[8]
    } : undefined;

    // Get the shares balance
    const { data: sharesBalanceData } = useReadContract({
        contract,
        method: "function getSharesBalance(uint256 _marketId, address _user) view returns (uint256 optionAShares, uint256 optionBShares)",
        params: [BigInt(index), account?.address as string]
    });

    // NEW: Check if market is refunded
    const { data: isRefundedData } = useReadContract({
        contract,
        method: "function isMarketRefunded(uint256 _marketId) view returns (bool)",
        params: [BigInt(index)]
    });

    const isRefunded = isRefundedData || false;

    // Parse the shares balance
    const sharesBalance: SharesBalance | undefined = sharesBalanceData ? {
        optionAShares: sharesBalanceData[0],
        optionBShares: sharesBalanceData[1]
    } : undefined;

    // Check if the market is expired
    const isExpired = new Date(Number(market?.endTime) * 1000) < new Date();
    // Check if the market is resolved
    const isResolved = market?.resolved;

    // Check if the market should be shown
    const shouldShow = () => {
        if (!market) return false;
        
        // NEW: Refunded markets always go to resolved section
        if (isRefunded) {
            return filter === 'resolved';
        }
        
        switch (filter) {
            case 'active':
                return !isExpired;
            case 'pending':
                return isExpired && !isResolved;
            case 'resolved':
                return isExpired && isResolved;
            default:
                return true;
        }
    };

    // If the market should not be shown, return null
    if (!shouldShow()) {
        return null;
    }

    return (
        <Card key={index} className="flex flex-col">
            {isLoadingMarketData ? (
                <MarketCardSkeleton />
            ) : (
                <>
                    <CardHeader>
                        {/* Display market image if available */}
                        {market?.imageUrl && (
                            <div className="mb-4 w-full h-48 rounded-lg overflow-hidden">
                                <img 
                                    src={market.imageUrl} 
                                    alt={market.question}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        // Hide image if it fails to load
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                        
                        {market && <MarketTime endTime={market.endTime} />}
                        <CardTitle className="font-alliance">{market?.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {market && (
                            <MarketProgress 
                                optionA={market.optionA}
                                optionB={market.optionB}
                                totalOptionAShares={market.totalOptionAShares}
                                totalOptionBShares={market.totalOptionBShares}
                                isRefunded={isRefunded}
                            />
                        )}
                        {/* NEW: Handle refunded markets */}
                        {isRefunded ? (
                            <div className="p-4 bg-gray-800/50 border-2 border-gray-600 rounded-lg">
                                <div className="text-center">
                                    <div className="text-lg font-bold text-gray-300 mb-2 font-alliance">
                                        Market Refunded
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        Funds have been sent back to your wallet
                                    </div>
                                </div>
                            </div>
                        ) : new Date(Number(market?.endTime) * 1000) < new Date() ? (
                            market?.resolved ? (
                                <MarketResolved 
                                    marketId={index}
                                    outcome={market.outcome}
                                    optionA={market.optionA}
                                    optionB={market.optionB}
                                />
                            ) : (
                                <MarketPending />
                            )
                        ) : (
                            <MarketBuyInterface 
                                marketId={index}
                                market={market!}
                            />
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                        {market && sharesBalance && (
                            <MarketSharesDisplay 
                                market={market}
                                sharesBalance={sharesBalance}
                            />
                        )}
                        
                        {/* Market ID on the right side of footer */}
                        <div className="text-xs text-gray-500">
                            Market #{index}
                        </div>
                    </CardFooter>
                </>
            )}
        </Card>
    )
}
