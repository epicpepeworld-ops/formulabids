interface MarketSharesDisplayProps {
    market: {
        optionA: string;
        optionB: string;
        totalOptionAShares: bigint;
        totalOptionBShares: bigint;
    };
    sharesBalance: {
        optionAShares: bigint;
        optionBShares: bigint;
    };
}

export function MarketSharesDisplay({
    market,
    sharesBalance,
}: MarketSharesDisplayProps) {
    // Convert from USDC decimals (6) to dollar amounts with 2 decimal places
    const userOptionA = (Number(sharesBalance?.optionAShares || 0n) / 1000000).toFixed(2);
    const userOptionB = (Number(sharesBalance?.optionBShares || 0n) / 1000000).toFixed(2);

    return (
        <div className="w-full text-sm text-muted-foreground">
            Your bets: {market.optionA} - ${userOptionA}, {market.optionB} - ${userOptionB}
        </div>
    );
}
