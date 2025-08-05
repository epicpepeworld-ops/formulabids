
interface MarketProgressProps {
    optionA: string;
    optionB: string;
    totalOptionAShares: bigint;
    totalOptionBShares: bigint;
}

export function MarketProgress({ 
    optionA, 
    optionB, 
    totalOptionAShares, 
    totalOptionBShares 
}: MarketProgressProps) {
    const totalShares = Number(totalOptionAShares) + Number(totalOptionBShares);
    const yesPercentage = totalShares > 0 
        ? (Number(totalOptionAShares) / totalShares) * 100 
        : 50;

    return (
        <div className="mb-4">
            <div className="flex justify-between mb-3">
                <span className="text-[#31f993]">
                    <span className="font-bold text-sm">
                        {optionA}: ${(Number(totalOptionAShares) / 1000000).toFixed(2)}
                    </span>
                    {totalShares > 0 && (
                        <span className="text-xs ml-1"> {Math.floor(yesPercentage)}%</span>
                    )}
                </span>
                <span className="text-[#fe4545]">
                    <span className="font-bold text-sm">
                        {optionB}: ${(Number(totalOptionBShares) / 1000000).toFixed(2)}
                    </span>
                    {totalShares > 0 && (
                        <span className="text-xs ml-1"> {Math.floor(100 - yesPercentage)}%</span>
                    )}
                </span>
            </div>
            
            {/* Single progress bar with your specific colors */}
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div className="h-full flex">
                    <div 
                        className="bg-[#31f993] transition-all duration-300"
                        style={{ width: `${yesPercentage}%` }}
                    />
                    <div 
                        className="bg-[#fe4545] transition-all duration-300"
                        style={{ width: `${100 - yesPercentage}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
