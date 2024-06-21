import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE, SANCTUM_PROGRAMM_ID } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  closeTokenAccountBanxSol,
  swapToBanxSol, // swapToSol,
} from 'fbonds-core/lib/fbond-protocol/functions/banxSol'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'
import { removeDuplicatedPublicKeys } from '@banx/utils'

import { sendTxnPlaceHolder } from '../helpers'

const BANXSOL_ADJUSTMENTS = {
  BUY_RATIO: new BN(999000),
  PRECISION: new BN(1e6),
}

type GetSwapInstuctions = (params: {
  inputAmount: BN
  walletAndConnection: WalletAndConnection
}) => Promise<{ instructions: web3.TransactionInstruction[]; lookupTable: web3.PublicKey }>

const getSwapSolToBanxSolInstructions: GetSwapInstuctions = async ({
  inputAmount,
  walletAndConnection,
}) => {
  const { instructions } = await swapToBanxSol({
    programId: SANCTUM_PROGRAMM_ID,
    connection: walletAndConnection.connection,
    accounts: {
      userPubkey: walletAndConnection.wallet.publicKey,
    },
    args: {
      amount: inputAmount
        .mul(BANXSOL_ADJUSTMENTS.PRECISION)
        .div(BANXSOL_ADJUSTMENTS.BUY_RATIO)
        //? add(1) --> Math.ceil analogue
        .add(new BN(1)),
    },
    sendTxn: sendTxnPlaceHolder,
  })

  return { instructions, lookupTable: new web3.PublicKey(LOOKUP_TABLE) }
}

// const getSwapBanxSolToSolInstructions: GetSwapInstuctions = async ({
//   inputAmount,
//   walletAndConnection,
// }) => {
//   const { instructions } = await swapToSol({
//     programId: SANCTUM_PROGRAMM_ID,
//     connection: walletAndConnection.connection,
//     accounts: {
//       userPubkey: walletAndConnection.wallet.publicKey,
//     },
//     args: {
//       amount: inputAmount,
//     },
//     sendTxn: sendTxnPlaceHolder,
//   })

//   return { instructions, lookupTable: new web3.PublicKey(LOOKUP_TABLE) }
// }

type GetCloseBanxSolATAsInstructions = (params: {
  walletAndConnection: WalletAndConnection
}) => Promise<{ instructions: web3.TransactionInstruction[]; lookupTable: web3.PublicKey }>

export const getCloseBanxSolATAsInstructions: GetCloseBanxSolATAsInstructions = async ({
  walletAndConnection,
}) => {
  const { instructions } = await closeTokenAccountBanxSol({
    connection: walletAndConnection.connection,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      feeReciver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      userPubkey: walletAndConnection.wallet.publicKey,
    },
    sendTxn: sendTxnPlaceHolder,
  })

  return { instructions, lookupTable: new web3.PublicKey(LOOKUP_TABLE) }
}

type CombineWithBanxSolInstructionsParams<TxnResult> = {
  inputAmount: BN
  walletAndConnection: WalletAndConnection
} & CreateTxnData<TxnResult>

export const combineWithBuyBanxSolInstructions = async <TxnResult>({
  inputAmount,
  walletAndConnection,
  ...txnData
}: CombineWithBanxSolInstructionsParams<TxnResult>): Promise<CreateTxnData<TxnResult>> => {
  const { instructions: swapInstructions, lookupTable: swapLookupTable } =
    await getSwapSolToBanxSolInstructions({
      inputAmount,
      walletAndConnection,
    })

  // const { instructions: closeInstructions, lookupTable: closeLookupTable } =
  //   await getCloseBanxSolATAsInstructions({
  //     walletAndConnection,
  //   })

  return {
    instructions: [...swapInstructions, ...txnData.instructions /* ...closeInstructions */],
    signers: txnData.signers,
    result: txnData.result,
    lookupTables: removeDuplicatedPublicKeys([
      swapLookupTable,
      ...(txnData.lookupTables ?? []),
      // closeLookupTable,
    ]),
  }
}

export const combineWithSellBanxSolInstructions = <TxnResult>({
  inputAmount,
  walletAndConnection,
  ...txnData
}: CombineWithBanxSolInstructionsParams<TxnResult>): CreateTxnData<TxnResult> => {
  // const { instructions: swapInstructions, lookupTable: swapLookupTable } =
  //   await getSwapBanxSolToSolInstructions({
  //     inputAmount,
  //     walletAndConnection,
  //   })

  // const { instructions: closeInstructions, lookupTable: closeLookupTable } =
  //   await getCloseBanxSolATAsInstructions({
  //     walletAndConnection,
  //   })

  return {
    instructions: [...txnData.instructions /* ...swapInstructions, ...closeInstructions */],
    signers: txnData.signers,
    result: txnData.result,
    lookupTables: removeDuplicatedPublicKeys([
      ...(txnData.lookupTables ?? []),
      // swapLookupTable,
      // closeLookupTable,
    ]),
  }
}
