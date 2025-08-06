import { ConnectButton, darkTheme } from "thirdweb/react";
import { client } from "@/app/client";
import { defineChain } from "thirdweb/chains";
import { inAppWallet } from "thirdweb/wallets";
import { TrendingUp } from "lucide-react";

// Define Base Mainnet
const baseMainnet = defineChain(8453);

export function Navbar() {
    return (
        <div className="flex justify-between items-center mb-6 p-4 bg-[#171717] rounded-lg border border-gray-800">
            <div className="flex items-center gap-3">
                {/* Logo */}
                <div className="w-8 h-8 bg-[#34f876] rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-black" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#34f876] font-alliance">FormulaBids</h1>
            </div>
            
            <div className="items-center flex gap-3">
                <ConnectButton 
                    client={client} 
                    theme={darkTheme()}
                    chain={baseMainnet}
                    connectButton={{
                        style: {
                            fontSize: '0.75rem !important', // Smaller on mobile
                            height: '2.25rem !important', // Slightly shorter
                            minWidth: '70px !important', // Minimum width
                            maxWidth: '90px !important', // Maximum width for mobile
                            backgroundColor: '#23432b',
                            color: '#36f776',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontWeight: '600',
                            padding: '0 12px !important' // Better padding
                        },
                        label: 'Log In',
                    }}
                    detailsButton={{
                        displayBalanceToken: {
                            [baseMainnet.id]: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
                        },
                        style: {
                            fontSize: '0.75rem !important',
                            height: '2.25rem !important',
                            backgroundColor: '#23432b',
                            color: '#36f776',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontWeight: '600',
                            padding: '0 8px !important'
                        }
                    }}
                    wallets={[
                        inAppWallet(),
                    ]}
                    accountAbstraction={{
                        chain: baseMainnet,
                        sponsorGas: true,
                    }}
                />
            </div>
        </div>
    );
}
