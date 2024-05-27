import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { getMockBondOffer } from 'fbonds-core/lib/fbond-protocol/functions/getters'
import {
  lendToBorrowerListing,
  refinancePerpetualLoan,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { core } from '@banx/api/nft'
import { BONDS } from '@banx/constants'
import { isLoanListed } from '@banx/utils'

import { sendTxnPlaceHolder } from '../../helpers'

type CreateLendToBorrowTxnDataParams = {
  loan: core.Loan
  aprRate: number
  walletAndConnection: WalletAndConnection
}

export type CreateLendToBorrowActionOptimisticResult = {
  loan: core.Loan
  oldLoan: core.Loan
}

type CreateLendToBorrowTxnData = (
  params: CreateLendToBorrowTxnDataParams,
) => Promise<CreateTxnData<CreateLendToBorrowActionOptimisticResult>>

export const createLendToBorrowTxnData: CreateLendToBorrowTxnData = async (params) => {
  const { loan } = params

  const { instructions, signers, optimisticResult } = await getIxnsAndSignersByLoanType(params)

  const optimisticLoan = {
    ...loan,
    fraktBond: optimisticResult.fraktBond,
    bondTradeTransaction: optimisticResult.bondTradeTransaction,
  }

  return {
    instructions,
    signers,
    result: { loan: optimisticLoan, oldLoan: loan },
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}

const getIxnsAndSignersByLoanType = async (params: CreateLendToBorrowTxnDataParams) => {
  const { loan, aprRate, walletAndConnection } = params
  const { connection, wallet } = walletAndConnection

  const { bondTradeTransaction, fraktBond } = loan

  if (isLoanListed(loan)) {
    const { instructions, signers, optimisticResults } = await lendToBorrowerListing({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      accounts: {
        hadoMarket: new web3.PublicKey(fraktBond.hadoMarket || ''),
        protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
        borrower: new web3.PublicKey(loan.fraktBond.fbondIssuer),
        userPubkey: wallet.publicKey,
        bondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
        oldBondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
        fraktBond: new web3.PublicKey(fraktBond.publicKey),
        splTokenMint: undefined,
      },
      args: {
        lendingTokenType: bondTradeTransaction.lendingToken,
      },
      optimistic: {
        bondTradeTransaction,
        fraktBond,
      },
      connection,
      sendTxn: sendTxnPlaceHolder,
    })

    const newOptimisticResult = {
      fraktBond: optimisticResults.fraktBond,
      bondTradeTransaction: optimisticResults.bondTradeTransaction,
    }

    return { instructions, signers, optimisticResult: newOptimisticResult }
  }

  const { instructions, signers, optimisticResult } = await refinancePerpetualLoan({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      fbond: new web3.PublicKey(fraktBond.publicKey),
      userPubkey: wallet.publicKey,
      hadoMarket: new web3.PublicKey(fraktBond.hadoMarket || ''),
      protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      previousBondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
      previousLender: new web3.PublicKey(bondTradeTransaction.user),
      oldBondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
    },
    args: {
      lendingTokenType: bondTradeTransaction.lendingToken,
      newApr: aprRate,
    },
    optimistic: {
      fraktBond,
      oldBondOffer: getMockBondOffer(),
      bondTradeTransaction,
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const newOptimisticResult = {
    fraktBond: optimisticResult.fraktBond,
    bondTradeTransaction: optimisticResult.newBondTradeTransaction,
  }

  return { instructions, signers, optimisticResult: newOptimisticResult }
}