import { BN } from 'fbonds-core'

import { BorrowOffer } from '@banx/api/tokens'

const calculateOfferFundingRatio = (offer: BorrowOffer, maxOffer: BorrowOffer) => {
  const offerFunds = parseFloat(offer.maxTokenToGet)
  const maxOfferFunds = parseFloat(maxOffer.maxTokenToGet)

  if (!maxOfferFunds) return 0

  return (offerFunds / maxOfferFunds) * 100
}

export const createRowStyle = (offer: BorrowOffer, maxOffer: BorrowOffer | undefined) => {
  if (!maxOffer) return {}

  const ratio = calculateOfferFundingRatio(offer, maxOffer)

  const backgroundColorVariable = 'var(--bg-tertiary)'

  return {
    background: `linear-gradient(to right, ${backgroundColorVariable} ${ratio}%, transparent ${ratio}%)`,
  }
}

export const getUpdatedBorrowOffers = ({
  collateralsAmount,
  offers,
  tokenDecimals,
}: {
  collateralsAmount: BN
  offers: BorrowOffer[]
  tokenDecimals: number
}) => {
  let restInputAmount = collateralsAmount

  const newOffers: BorrowOffer[] = []

  for (let i = 0; i < offers.length; ++i) {
    const offer = offers[i]

    const maxCollateralToReceiveForOffer = new BN(offer.maxCollateralToReceive)

    if (maxCollateralToReceiveForOffer.gte(restInputAmount)) {
      const denominator = new BN(10 ** tokenDecimals)

      const amountToGet = restInputAmount
        .mul(denominator)
        .divRound(new BN(offer.collateralsPerToken))

      newOffers.push({
        ...offer,
        maxCollateralToReceive: restInputAmount.toString(),
        maxTokenToGet: amountToGet.toString(),
      })
      break
    }

    if (maxCollateralToReceiveForOffer.lt(restInputAmount)) {
      newOffers.push({
        ...offer,
        maxCollateralToReceive: maxCollateralToReceiveForOffer.toString(),
        maxTokenToGet: offer.maxTokenToGet,
      })

      restInputAmount = restInputAmount.sub(maxCollateralToReceiveForOffer)
    }
  }

  return newOffers
}
