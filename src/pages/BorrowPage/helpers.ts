import { calculateNextSpotPrice } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondingCurveType } from 'fbonds-core/lib/fbond-protocol/types'
import { chain, uniqueId } from 'lodash'

import { Offer } from '@banx/api/core'

import { SimpleOffer } from './types'

const spreadToSimpleOffers = (offer: Offer): SimpleOffer[] => {
  const {
    baseSpotPrice,
    mathCounter,
    buyOrdersQuantity,
    bondingCurve,
    bidSettlement: reserve,
    validation,
  } = offer

  const simpleOffers = Array(buyOrdersQuantity)
    .fill(0)
    .reduce(
      (acc: { reserve: number; simpleOffers: SimpleOffer[] }, _, idx) => {
        const baseMathCounter = mathCounter + 1 - idx

        const prevSpotPrice = calculateNextSpotPrice({
          bondingCurveType: bondingCurve.bondingType as BondingCurveType,
          delta: bondingCurve.delta,
          spotPrice: baseSpotPrice,
          counter: baseMathCounter + 1,
        })

        const nextSpotPrice = calculateNextSpotPrice({
          bondingCurveType: bondingCurve.bondingType as BondingCurveType,
          delta: bondingCurve.delta,
          spotPrice: baseSpotPrice,
          counter: baseMathCounter,
        })

        const loanValue = Math.min(
          validation.loanToValueFilter,
          nextSpotPrice + acc.reserve,
          prevSpotPrice,
        )

        const nextReserve = acc.reserve - Math.max(loanValue - nextSpotPrice, 0)

        const simpleOffer = {
          id: uniqueId(),
          loanValue,
          hadoMarket: offer.hadoMarket,
          publicKey: offer.publicKey,
        }

        return {
          reserve: nextReserve,
          simpleOffers: [...acc.simpleOffers, simpleOffer],
        }
      },
      { reserve, simpleOffers: [] },
    ).simpleOffers

  return simpleOffers
}

type ConvertOffersToSimple = (offers: Offer[], sort?: 'desc' | 'asc') => SimpleOffer[]
export const convertOffersToSimple: ConvertOffersToSimple = (offers, sort = 'desc') => {
  return chain(offers)
    .map(spreadToSimpleOffers)
    .flatten()
    .sort((a, b) => {
      if (sort === 'desc') {
        return b.loanValue - a.loanValue
      }
      return a.loanValue - b.loanValue
    })
    .value()
}