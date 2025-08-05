import { cn } from "@/lib/utils";

interface MarketTimeProps {
    endTime: bigint;
    className?: string;
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export function MarketTime({ endTime, className }: MarketTimeProps) {
    const isEnded = new Date(Number(endTime) * 1000) < new Date();
    const formattedDate = formatDate(new Date(Number(endTime) * 1000).toISOString());

    return (
        <div
            className={cn(
                "mb-2 w-fit px-3 py-1 rounded border text-xs font-medium",
                isEnded 
                    ? "bg-[#fe4545]/20 border-[#fe4545]/30 text-[#fe4545]" 
                    : "bg-gray-800 border-gray-600 text-white",
                className
            )}
        >
            {isEnded ? "Ended: " : "Ends: "}{formattedDate}
        </div>
    );
}
