import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { core } from '@banx/api/nft'
import { useTokenType } from '@banx/store/common'
import { isLoanTerminating } from '@banx/utils'

export const useLenderLoans = ({ offerPubkey }: { offerPubkey: string }) => {
  const { publicKey } = useWallet()
  const walletPublicKey = publicKey?.toBase58() || ''

  const { tokenType } = useTokenType()

  const { data, isLoading, refetch } = useQuery(
    ['lenderLoans', walletPublicKey, tokenType, offerPubkey],
    () => core.fetchLenderLoansByCertainOffer({ walletPublicKey, offerPubkey, tokenType }),
    {
      staleTime: 60_000,
      enabled: !!offerPubkey,
      refetchOnWindowFocus: false,
    },
  )

  const lenderLoans = useMemo(() => {
    if (!data) return []

    return data.flatMap(({ loans }) => loans).filter((loan) => !isLoanTerminating(loan))
  }, [data])

  return {
    data: data ?? [],
    lenderLoans,
    isLoading,
    refetch,
  }
}
