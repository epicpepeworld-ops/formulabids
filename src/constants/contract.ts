import { client } from "@/app/client";
import { getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";

// Your deployed F1 Prediction Market contract
export const contractAddress = "0x761f5fFf0F56149401D16706a528C46a20C4D6e0"; // Your full address

// USDC contract on Base
export const tokenAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

// Define Base chain manually
const baseChain = defineChain(8453);

export const contract = getContract({
    client: client,
    chain: baseChain, // Using defineChain(8453) instead of base
    address: contractAddress
});

export const tokenContract = getContract({
    client: client,
    chain: baseChain, // Using defineChain(8453) instead of base
    address: tokenAddress
});
