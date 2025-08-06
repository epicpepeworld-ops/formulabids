interface MarketProgressProps {
    optionA: string;
    optionB: string;
    totalOptionAShares: bigint;
    totalOptionBShares: bigint;
    isRefunded?: boolean; // NEW: Optional refunded flag
}

export function MarketProgress({ 
    optionA, 
    optionB, 
    totalOptionAShares, 
    totalOptionBShares,
    isRefunded = false  // NEW: Default to false
}: MarketProgressProps) {
    // NEW: Use zeros if refunded, otherwise use actual values
    const displayOptionAShares = isRefunded ? 0 : Number(totalOptionAShares) / 1000000;
    const displayOptionBShares = isRefunded ? 0 : Number(totalOptionBShares) / 1000000;
    const totalShares = displayOptionAShares + displayOptionBShares;
    const yesPercentage = totalShares > 0 
        ? (displayOptionAShares / totalShares) * 100 
        : 50;

    return (
        <div className="mb-4">
            <div className="flex justify-between mb-3">
                <span className="text-[#31f993]">
                    <span className="font-bold text-sm">
                        {optionA}: ${displayOptionAShares.toFixed(2)}
                    </span>
                    {totalShares > 0 && !isRefunded && (
                        <span className="text-xs ml-1"> {Math.floor(yesPercentage)}%</span>
                    )}
                    {isRefunded && (
                        <span className="text-xs ml-1 text-gray-500"> (Refunded)</span>
                    )}
                </span>
                <span className="text-[#fe4545]">
                    <span className="font-bold text-sm">
                        {optionB}: ${displayOptionBShares.toFixed(2)}
                    </span>
                    {totalShares > 0 && !isRefunded && (
                        <span className="text-xs ml-1"> {Math.floor(100 - yesPercentage)}%</span>
                    )}
                    {isRefunded && (
                        <span className="text-xs ml-1 text-gray-500"> (Refunded)</span>
                    )}
                </span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div className="h-full flex">
                    <div 
                        className={`transition-all duration-300 ${isRefunded ? 'bg-gray-600' : 'bg-[#31f993]'}`}
                        style={{ width: `${isRefunded ? 50 : yesPercentage}%` }}
                    />
                    <div 
                        className={`transition-all duration-300 ${isRefunded ? 'bg-gray-600' : 'bg-[#fe4545]'}`}
                        style={{ width: `${isRefunded ? 50 : (100 - yesPercentage)}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
