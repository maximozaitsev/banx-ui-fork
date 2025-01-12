import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { activity } from '@banx/api/nft'
import { useTokenType } from '@banx/store/common'

export const useLenderActivityCollectionsList = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { tokenType } = useTokenType()

  const { data, isLoading } = useQuery(
    ['lenderActivityCollectionsList', publicKeyString, tokenType],
    () =>
      activity.fetchActivityCollectionsList({
        walletPubkey: publicKeyString,
        userType: 'lender',
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
