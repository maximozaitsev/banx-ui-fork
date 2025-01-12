import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  createPerpetualBondOfferBonding,
  getBondingCurveTypeFromLendingToken,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondFeatures, BondOfferV3, LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from 'solana-transactions-executor'

import { fetchTokenBalance } from '@banx/api/common'
import { core } from '@banx/api/nft'
import { BANX_SOL_ADDRESS, BONDS } from '@banx/constants'
import { banxSol } from '@banx/transactions'
import { ZERO_BN, calculateNewOfferSize, isBanxSolTokenType } from '@banx/utils'

import { accountConverterBNAndPublicKey, parseAccountInfoByPubkey } from '../../functions'
import { sendTxnPlaceHolder } from '../../helpers'

export type CreateMakeBondingOfferTxnDataParams = {
  marketPubkey: string

  loanValue: number //? normal number
  loansAmount: number
  deltaValue: number //? normal number
  collateralsPerToken?: BN
  tokenLendingApr?: number
  escrowBalance: BN | undefined

  bondFeature: BondFeatures
  tokenType: LendingTokenType
}

type CreateMakeBondingOfferTxnData = (
  params: CreateMakeBondingOfferTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateMakeBondingOfferTxnDataParams>>

export const createMakeBondingOfferTxnData: CreateMakeBondingOfferTxnData = async (
  params,
  walletAndConnection,
) => {
  const {
    marketPubkey,
    loanValue,
    loansAmount,
    tokenType,
    collateralsPerToken = ZERO_BN,
    tokenLendingApr = 0,
    escrowBalance = ZERO_BN,
    bondFeature,
    deltaValue,
  } = params

  const bondingCurveType = getBondingCurveTypeFromLendingToken(tokenType)

  const {
    instructions,
    signers,
    accounts: accountsCollection,
  } = await createPerpetualBondOfferBonding({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    connection: walletAndConnection.connection,
    accounts: {
      hadoMarket: new web3.PublicKey(marketPubkey),
      userPubkey: walletAndConnection.wallet.publicKey,
    },
    args: {
      loanValue: new BN(loanValue),
      delta: new BN(deltaValue),
      quantityOfLoans: loansAmount,
      bondingCurveType,
      bondFeature,
      collateralsPerToken,
      tokenLendingApr: new BN(tokenLendingApr),
    },
    sendTxn: sendTxnPlaceHolder,
  })

  const lookupTables = [new web3.PublicKey(LOOKUP_TABLE)]
  const accounts = [accountsCollection['bondOffer']]

  if (isBanxSolTokenType(tokenType)) {
    const banxSolBalance = await fetchTokenBalance({
      tokenAddress: BANX_SOL_ADDRESS,
      publicKey: walletAndConnection.wallet.publicKey,
      connection: walletAndConnection.connection,
    })

    const offerSize = calculateNewOfferSize({
      loanValue: loanValue,
      loansAmount,
      deltaValue,
    })
    const diff = offerSize.sub(banxSolBalance).sub(escrowBalance)

    if (diff.gt(ZERO_BN)) {
      return await banxSol.combineWithBuyBanxSolInstructions(
        {
          params,
          accounts,
          inputAmount: diff,

          instructions,
          signers,
          lookupTables,
        },
        walletAndConnection,
      )
    }
  }

  return {
    params,
    accounts,
    instructions,
    signers,
    lookupTables,
  }
}

export const parseMakeOfferSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const results = parseAccountInfoByPubkey(accountInfoByPubkey)

  return results?.['bondOfferV3']?.[0] as core.Offer
}

export const parseMakeTokenOfferSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const results = parseAccountInfoByPubkey(accountInfoByPubkey, accountConverterBNAndPublicKey)

  return results?.['bondOfferV3']?.[0] as BondOfferV3
}
