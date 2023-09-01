import { FC, useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'

import { Offer } from '@banx/api/core'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { TxnExecutor } from '@banx/transactions/TxnExecutor'
import { makeRemoveOfferAction } from '@banx/transactions/bonds'
import { enqueueSnackbar } from '@banx/utils'

import { TableUserOfferData } from '../helpers'
import { useUserOffers } from '../hooks'

import styles from '../PendingOffersTable.module.less'

interface ActionsCellProps {
  offer: TableUserOfferData
  isCardView: boolean
}

export const ActionsCell: FC<ActionsCellProps> = ({ offer, isCardView }) => {
  const { removeOffer } = useActionsCell(offer)

  const buttonSize = isCardView ? 'large' : 'small'

  return (
    <div className={styles.actionsButtons}>
      <Button variant="secondary" size={buttonSize}>
        Edit
      </Button>
      <Button
        onClick={removeOffer}
        className={styles.removeButton}
        variant="secondary"
        size={buttonSize}
      >
        Remove
      </Button>
    </div>
  )
}

const useActionsCell = (offer: TableUserOfferData) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { offers, hideOffers } = useUserOffers()

  const offerPubkey = offer.publicKey

  const optimisticOffer = useMemo(() => {
    return offers.find((offer) => offer.publicKey === offerPubkey)
  }, [offers, offerPubkey])

  const removeOffer = () => {
    new TxnExecutor(makeRemoveOfferAction, { wallet, connection })
      .addTxnParam({ offerPubkey: offer.publicKey, optimisticOffer: optimisticOffer as Offer })
      .on('pfSuccessEach', (results) => {
        const { txnHash } = results[0]
        hideOffers(offerPubkey)
        enqueueSnackbar({
          message: 'Transaction Executed',
          solanaExplorerPath: `tx/${txnHash}`,
        })
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error)
      })
      .execute()
  }

  return { removeOffer }
}
