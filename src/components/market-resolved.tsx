import { Button } from "./ui/button";
import { useState } from "react";
import { useActiveAccount, useSendAndConfirmTransaction, useReadContract } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { contract } from "@/constants/contract";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface MarketResolvedProps {
    marketId: number;
    outcome: number; // 1 = OptionA won, 2 = OptionB won
    optionA: string;
    optionB: string;
}

export function MarketResolved({ marketId, outcome, optionA, optionB }: MarketResolvedProps) {
    const [isClaiming, setIsClaiming] = useState(false);
    const account = useActiveAccount();
    const { mutateAsync: mutateTransaction } = useSendAndConfirmTransaction();
    const { toast } = useToast();

    // Get user's shares in this market
    const { data: sharesBalanceData } = useReadContract({
        contract,
        method: "function getSharesBalance(uint256 _marketId, address _user) view returns (uint256 optionAShares, uint256 optionBShares)",
        params: account?.address ? [BigInt(marketId), account.address] : undefined
    });

    // NEW: Check if user has already claimed using V3 function
    const { data: hasClaimedData } = useReadContract({
        contract,
        method: "function hasUserClaimed(uint256 _marketId, address _user) view returns (bool)",
        params: account?.address ? [BigInt(marketId), account.address] : undefined
    });

    // Get market info to calculate total winnings
    const { data: marketInfoData } = useReadContract({
        contract,
        method: "function getMarketInfo(uint256 _marketId) view returns (string question, string optionA, string optionB, string imageUrl, uint256 endTime, uint8 outcome, uint256 totalOptionAShares, uint256 totalOptionBShares, bool resolved)",
        params: [BigInt(marketId)]
    });

    const userOptionAShares = sharesBalanceData ? Number(sharesBalanceData[0]) / 1000000 : 0;
    const userOptionBShares = sharesBalanceData ? Number(sharesBalanceData[1]) / 1000000 : 0;
    const hasClaimed = hasClaimedData || false; // NEW: Use the contract function result
    
    // Check if user has any shares at all
    const hasAnyShares = userOptionAShares > 0 || userOptionBShares > 0;
    
    // Check if user has winning shares
    const hasWinningShares = (outcome === 1 && userOptionAShares > 0) || (outcome === 2 && userOptionBShares > 0);
    
    const winningOption = outcome === 1 ? optionA : optionB;
    const userWinningShares = outcome === 1 ? userOptionAShares : userOptionBShares;

    // Calculate total winnings
    const calculateTotalWinnings = (): number => {
        if (!marketInfoData || !hasWinningShares) return 0;
        
        const totalWinningShares = outcome === 1 ? 
            Number(marketInfoData[6]) / 1000000 : // totalOptionAShares
            Number(marketInfoData[7]) / 1000000;   // totalOptionBShares
            
        const totalLosingShares = outcome === 1 ? 
            Number(marketInfoData[7]) / 1000000 : // totalOptionBShares  
            Number(marketInfoData[6]) / 1000000;   // totalOptionAShares
        
        // User's winnings = their shares + proportional share of losing pool
        let totalWinnings = userWinningShares;
        if (totalWinningShares > 0 && totalLosingShares > 0) {
            const shareOfLosingPool = (userWinningShares / totalWinningShares) * totalLosingShares;
            totalWinnings += shareOfLosingPool;
        }
        
        return totalWinnings;
    };

    const totalWinnings = calculateTotalWinnings();

    const handleClaim = async () => {
        if (!hasWinningShares || hasClaimed) return;
        
        setIsClaiming(true);
        try {
            const tx = await prepareContractCall({
                contract,
                method: "function claimWinnings(uint256 _marketId)",
                params: [BigInt(marketId)]
            });
            
            await mutateTransaction(tx);
            
            toast({
                title: "Rewards Claimed!",
                description: `You successfully claimed $${totalWinnings.toFixed(2)}!`,
                duration: 5000,
            });
            
        } catch (error: any) {
            console.error("Claim error:", error);
            
            // Check if error is because user already claimed
            if (error?.message?.includes("Already claimed") || error?.message?.includes("already claimed")) {
                toast({
                    title: "Already Claimed",
                    description: "You have already claimed your rewards for this market.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Claim Failed",
                    description: "There was an error claiming your rewards. Please try again.",
                    variant: "destructive",
                });
            }
        } finally {
            setIsClaiming(false);
        }
    };

    const renderClaimButton = () => {
        if (!account) {
            return (
                <Button disabled className="w-full bg-gray-700 text-gray-400">
                    Connect Wallet to Claim
                </Button>
            );
        }

        if (!hasAnyShares) {
            return (
                <div className="text-center text-gray-400 py-3">
                    You didn't participate in this market
                </div>
            );
        }

        if (!hasWinningShares) {
            return (
                <div className="text-center text-gray-400 py-3">
                    You bet on the losing side
                </div>
            );
        }

        // NEW: Show different states based on claimed status
        if (hasClaimed) {
            return (
                <div className="text-center py-3">
                    <div className="text-[#34f876] font-medium">✅ Rewards Claimed!</div>
                    <div className="text-gray-400 text-sm">You claimed ${totalWinnings.toFixed(2)}</div>
                </div>
            );
        }

        return (
            <Button 
                onClick={handleClaim} 
                disabled={isClaiming}
                className="w-full bg-[#34f876] text-black hover:bg-[#2ed968] font-medium"
            >
                {isClaiming ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Claiming...
                    </>
                ) : (
                    `You Won! Claim Your $${totalWinnings.toFixed(2)} Now!`
                )}
            </Button>
        );
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="p-4 bg-[#34f876]/10 border-2 border-[#34f876]/30 rounded-lg">
                <div className="text-center">
                    <div className="text-lg font-bold text-[#34f876] mb-2 font-alliance">
                        Resolved: {winningOption}
                    </div>
                    <div className="text-sm text-gray-300">
                        Market has been resolved. Winners can claim their rewards.
                    </div>
                </div>
            </div>
            
            {renderClaimButton()}
        </div>
    );
}
