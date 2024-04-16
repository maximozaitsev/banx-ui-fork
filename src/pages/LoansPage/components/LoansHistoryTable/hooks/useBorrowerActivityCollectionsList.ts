import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { fetchActivityCollectionsList } from '@banx/api/activity'
import { useTokenType } from '@banx/store'

export const useBorrowerActivityCollectionsList = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { tokenType } = useTokenType()

  const { data, isLoading } = useQuery(
    ['borrowerActivityCollectionsList', publicKeyString, tokenType],
    () =>
      fetchActivityCollectionsList({
        walletPubkey: publicKeyString,
        userType: 'borrower',
        tokenType,
      }),
    {
      enabled: !!publicKeyString,
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 1000,
    },
  )

  return {
    data: data ?? [],
    isLoading,
  }
}
