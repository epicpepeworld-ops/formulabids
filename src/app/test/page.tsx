'use client'

import { useReadContract } from 'thirdweb/react'
import { contract } from '@/constants/contract'

export default function TestPage() {
    const { data: marketCount, isLoading, error } = useReadContract({
        contract,
        method: "function marketCount() view returns (uint256)",
        params: []
    });

    return (
        <div className="p-4">
            <h1>Contract Test</h1>
            <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
            <p>Market Count: {marketCount ? marketCount.toString() : 'None'}</p>
            <p>Error: {error ? error.message : 'None'}</p>
        </div>
    );
}
