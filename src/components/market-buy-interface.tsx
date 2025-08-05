import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState, useRef, useEffect } from "react";
import { useActiveAccount, useSendAndConfirmTransaction, useReadContract } from "thirdweb/react";
import { prepareContractCall, readContract } from "thirdweb";
import { contract, tokenContract } from "@/constants/contract";
import { approve } from "thirdweb/extensions/erc20";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast"

// Types for the component props
interface MarketBuyInterfaceProps {
    marketId: number;
    market: {
        optionA: string;
        optionB: string;
        question: string;
        totalOptionAShares: bigint;
        totalOptionBShares: bigint;
    };
}

export function MarketBuyInterface({ marketId, market }: MarketBuyInterfaceProps) {
    const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(null);
    const [amount, setAmount] = useState<number>(0);
    const [isBuying, setIsBuying] = useState(false);
    const [buyingStep, setBuyingStep] = useState<'initial' | 'allowance' | 'confirm'>('initial');
    const [isApproving, setIsApproving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(true);

    const account = useActiveAccount();
    const { mutateAsync: mutateTransaction } = useSendAndConfirmTransaction();
    const { toast } = useToast();

    const amountInputRef = useRef<HTMLInputElement>(null);

    // Get dynamic fee from contract
    const { data: dynamicFeeData } = useReadContract({
        contract,
        method: "function calculateDynamicFee(uint256 _totalAmount, uint256 _currentOwnSide, uint256 _currentOppositeSide) view returns (uint256)",
        params: amount > 0 && selectedOption ? [
            BigInt(Math.floor(amount * 1000000)), // Convert to USDC decimals
            selectedOption === 'A' ? market.totalOptionAShares : market.totalOptionBShares,
            selectedOption === 'A' ? market.totalOptionBShares : market.totalOptionAShares
        ] : [BigInt(0), BigInt(0), BigInt(0)]
    });

    useEffect(() => {
        setSelectedOption(null);
        setAmount(0);
        setBuyingStep('initial');
        setError(null);
        setIsVisible(true);
    }, [marketId]);

    const handleSelectOption = (option: 'A' | 'B') => {
        // Just trigger the existing ConnectButton if not connected
        if (!account) {
            // Find the ConnectButton - it's likely the only button in the navbar area
            const connectButton = document.querySelector('button[style*="backgroundColor: rgb(35, 67, 43)"]') ||
                                 document.querySelector('button[style*="#23432b"]') ||
                                 Array.from(document.querySelectorAll('button')).find(btn => 
                                     btn.textContent?.includes('Log In') || 
                                     btn.textContent?.includes('Connect')
                                 );
            
            if (connectButton) {
                (connectButton as HTMLButtonElement).click();
            } else {
                // Fallback message
                toast({
                    title: "Please Log In",
                    description: "Click the 'Log In' button in the top right to continue.",
                    duration: 5000,
                });
            }
            return;
        }
        
        setSelectedOption(option);
        setError(null);
        
        setTimeout(() => {
            if (amountInputRef.current) {
                amountInputRef.current.focus();
            }
        }, 100);
    };

    const handleCancel = () => {
        setIsVisible(false);
        
        setTimeout(() => {
            setIsBuying(false);
            setBuyingStep('initial');
            setSelectedOption(null);
            setAmount(0);
            setError(null);
            setIsVisible(true);
        }, 200);
    };

    // Quick bet button handler
    const handleQuickBet = (quickAmount: number) => {
        setAmount(quickAmount);
        setError(null);
    };

    // Calculate potential winnings using contract's dynamic fee
    const calculateWinnings = (betAmount: number): number => {
        if (betAmount <= 0 || !selectedOption) return betAmount;
        
        const currentOwnSide = selectedOption === 'A' ? Number(market.totalOptionAShares) / 1000000 : Number(market.totalOptionBShares) / 1000000;
        const currentOppositeSide = selectedOption === 'A' ? Number(market.totalOptionBShares) / 1000000 : Number(market.totalOptionAShares) / 1000000;
        
        // Use the actual platform fee from the contract (could be 0 or 10%)
        const platformFee = dynamicFeeData ? Number(dynamicFeeData) / 1000000 : 0;
        const actualBetAmount = betAmount - platformFee;
        const newOwnSide = currentOwnSide + actualBetAmount;
        
        if (currentOppositeSide === 0) {
            // No opposite side, get back what you actually bet (after fees)
            return actualBetAmount;
        }
        
        // Calculate total winnings: bet + proportional share of opposite side
        const shareOfOpposite = (actualBetAmount / newOwnSide) * currentOppositeSide;
        return actualBetAmount + shareOfOpposite;
    };

    // Check if user needs to approve token spending
    const checkApproval = async () => {
        if (amount <= 0) {
            setError("Amount must be greater than 0");
            return;
        }
        setError(null);

        try {
            const userAllowance = await readContract({
                contract: tokenContract,
                method: "function allowance(address owner, address spender) view returns (uint256)",
                params: [account?.address as string, contract.address]
            });

            // Convert amount to USDC decimals (6 decimals)
            const requiredAmount = BigInt(Math.floor(amount * 1000000)); // amount * 10^6
            setBuyingStep(userAllowance < requiredAmount ? 'allowance' : 'confirm');
        } catch (error) {
            console.error(error);
        }
    };

    // Handle token approval transaction
    const handleSetApproval = async () => {
        setIsApproving(true);
        try {
            const tx = await approve({
                contract: tokenContract,
                spender: contract.address,
                amount: 1000n * 10n ** 6n  // 1000 USDC with 6 decimals
            });
            await mutateTransaction(tx);
            setBuyingStep('confirm');
        } catch (error) {
            console.error(error);
        } finally {
            setIsApproving(false);
        }
    };

    const handlePurchase = async () => {
        setIsBuying(true);
        try {
            const tx = await prepareContractCall({
                contract,
                method: "function buyShares(uint256 _marketId, bool _optionA, uint256 _amount)",
                params: [BigInt(marketId), selectedOption === 'A', BigInt(Math.floor(amount * 1000000))] // USDC decimals
            });
            await mutateTransaction(tx);
          
            // Show success toast
            toast({
                title: "Bet Successful!",
                description: `You bet $${amount} on ${selectedOption === 'A' ? market.optionA : market.optionB}!`,
                duration: 5000,
            })
                
            handleCancel();
        } catch (error) {
            console.error(error);
            toast({
                title: "Bet Failed",
                description: "There was an error processing your bet",
                variant: "destructive",
            })
        } finally {
            setIsBuying(false);
        }
    };

    const potentialWinnings = calculateWinnings(amount);
    const platformFee = dynamicFeeData ? Number(dynamicFeeData) / 1000000 : 0;
    const actualBetAmount = amount - platformFee;
    const feePercentage = amount > 0 ? (platformFee / amount) * 100 : 0;

    return (
        <div className={cn(
            "transition-all duration-200",
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}>
            {selectedOption === null ? (
                <div className="flex flex-col gap-3">
                    <div className="text-sm font-medium text-gray-400">Choose your prediction:</div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => handleSelectOption('A')} 
                            className="flex-1 h-12 text-sm rounded-lg font-medium transition-all bg-[#295537] text-[#30d57e] border border-[#30d57e]/30 hover:bg-[#295537]/80"
                            aria-label={`Bet on ${market.optionA} for "${market.question}"`}
                        >
                            {market.optionA}
                        </button>
                        <button 
                            onClick={() => handleSelectOption('B')} 
                            className="flex-1 h-12 text-sm rounded-lg font-medium transition-all bg-[#4f2527] text-[#c21e28] border border-[#c21e28]/30 hover:bg-[#4f2527]/80"
                            aria-label={`Bet on ${market.optionB} for "${market.question}"`}
                        >
                            {market.optionB}
                        </button>
                    </div>
                </div>
            ) : (
                // Buy interface with different steps
                <div className="flex flex-col mb-4">
                    {buyingStep === 'allowance' ? (
                        // Approval step
                        <div className="flex flex-col border-2 border-[#34f876]/20 bg-[#171717] rounded-lg p-4">
                            <h2 className="text-lg font-bold mb-4 text-white">USDC Approval Needed</h2>
                            <p className="mb-4 text-gray-300">You need to approve USDC spending before proceeding.</p>
                            <div className="flex justify-end gap-2">
                                <Button 
                                    onClick={handleSetApproval} 
                                    disabled={isApproving}
                                    className="bg-[#34f876] text-black hover:bg-[#2ed968]"
                                >
                                    {isApproving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Approving...
                                        </>
                                    ) : (
                                        'Approve USDC'
                                    )}
                                </Button>
                                <Button 
                                    onClick={handleCancel} 
                                    className="bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600"
                                    disabled={isApproving}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : buyingStep === 'confirm' ? (
                        <div className="flex flex-col border-2 border-[#34f876]/30 bg-[#171717] rounded-lg p-4">
                            <h2 className="text-lg font-bold mb-4 text-white">Confirm Bet</h2>
                            <div className="mb-4 space-y-2 text-gray-300">
                                <p><strong className="text-white">Betting on:</strong> {selectedOption === 'A' ? market.optionA : market.optionB}</p>
                                <p><strong className="text-white">Amount:</strong> ${amount}</p>
                                {platformFee > 0 ? (
                                    <>
                                        <p><strong className="text-white">Platform fee ({feePercentage.toFixed(1)}%):</strong> ${platformFee.toFixed(2)}</p>
                                        <p><strong className="text-white">Actual bet amount:</strong> ${actualBetAmount.toFixed(2)}</p>
                                    </>
                                ) : (
                                    <p><strong className="text-[#34f876]">Platform fee:</strong> $0.00 (Commission-free!)</p>
                                )}
                                <p><strong className="text-white">Potential winnings:</strong> <span className="text-[#34f876]">${potentialWinnings.toFixed(2)}</span></p>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button 
                                    onClick={handlePurchase} 
                                    disabled={isBuying}
                                    className="bg-[#34f876] text-black hover:bg-[#2ed968]"
                                >
                                    {isBuying ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        'Confirm Bet'
                                    )}
                                </Button>
                                <Button 
                                    onClick={handleCancel} 
                                    className="bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600"
                                    disabled={isBuying}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col border-2 border-[#34f876]/20 bg-[#000000] rounded-lg p-4">
                            <h2 className="text-lg font-bold mb-4 text-white">
                                Bet on {selectedOption === 'A' ? market.optionA : market.optionB}
                            </h2>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <Input
                                        ref={amountInputRef}
                                        type="number"
                                        value={amount || ''}
                                        onChange={(e) => {
                                            const value = parseFloat(e.target.value) || 0;
                                            setAmount(value);
                                            setError(null);
                                        }}
                                        placeholder="Enter amount in USDC"
                                        min="0"
                                        step="0.01"
                                        className="text-lg p-3 bg-[#171717] border-gray-600 text-white placeholder:text-gray-400 focus:border-[#34f876]"
                                    />
                                </div>

                                {/* Quick bet buttons */}
                                <div className="flex gap-2">
                                    <Button 
                                        onClick={() => handleQuickBet(5)}
                                        className="flex-1 bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600"
                                    >
                                        $5
                                    </Button>
                                    <Button 
                                        onClick={() => handleQuickBet(10)}
                                        className="flex-1 bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600"
                                    >
                                        $10
                                    </Button>
                                    <Button 
                                        onClick={() => handleQuickBet(20)}
                                        className="flex-1 bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600"
                                    >
                                        $20
                                    </Button>
                                </div>

                                {/* Win calculation display */}
                                {amount > 0 && (
                                    <div className="p-3 bg-[#171717] border border-[#34f876]/30 rounded-lg">
                                        <div className="text-sm text-[#34f876]">
                                            <strong>Bet ${amount} to win ${potentialWinnings.toFixed(2)}</strong>
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            {platformFee > 0 ? (
                                                `Platform fee: ${feePercentage.toFixed(1)}% • Winners split the loser's pool`
                                            ) : (
                                                "Commission-free! • Winners split the loser's pool"
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="min-h-[20px]">
                                    {error && (
                                        <span className="text-sm text-[#fe4545]">
                                            {error}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-between gap-4">
                                <Button 
                                    onClick={checkApproval} 
                                    className="flex-1 bg-[#34f876] text-black hover:bg-[#2ed968]"
                                >
                                    Next
                                </Button>
                                <Button 
                                    onClick={handleCancel} 
                                    className="flex-1 bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
