"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { walletApi } from "@/lib/api/wallet";

export function useWalletBalance() {
  return useQuery({
    queryKey: ["wallet", "balance"],
    queryFn: walletApi.getBalance,
  });
}

export function useTransactions() {
  return useQuery({
    queryKey: ["wallet", "transactions"],
    queryFn: walletApi.getTransactions,
  });
}

export function usePackages() {
  return useQuery({
    queryKey: ["wallet", "packages"],
    queryFn: walletApi.getPackages,
  });
}

export function usePurchasePackage() {
  return useMutation({
    mutationFn: (packageId: string) => walletApi.purchasePackage(packageId),
  });
}
