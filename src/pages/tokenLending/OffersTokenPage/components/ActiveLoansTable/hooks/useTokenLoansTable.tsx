import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { first, groupBy, map, sumBy } from 'lodash'

import { DisplayValue } from '@banx/components/TableComponents'

import { core } from '@banx/api/tokens'
import {
  calculateLentTokenValueWithInterest,
  isTokenLoanLiquidated,
  isTokenLoanListed,
  isTokenLoanTerminating,
} from '@banx/utils'

import { useFilterLoans, useSortedLoans, useTokenLenderLoans } from './index'

import styles from '../ActiveLoansTable.module.less'

export const useTokenLoansTable = () => {
  const { connected } = useWallet()

  const { loans, loading } = useTokenLenderLoans()

  const {
    filteredLoans,
    isUnderwaterFilterActive,
    onToggleUnderwaterFilter,
    selectedCollections,
    setSelectedCollections,
    filteredAllLoans,
    underwaterLoansCount,
  } = useFilterLoans(loans)

  const { sortedLoans, sortParams } = useSortedLoans(filteredLoans)

  const loansToClaim = useMemo(
    () => sortedLoans.filter((loan) => isTokenLoanTerminating(loan) && isTokenLoanLiquidated(loan)),
    [sortedLoans],
  )

  const loansToTerminate = useMemo(() => {
    return sortedLoans.filter(
      (loan) =>
        !isTokenLoanLiquidated(loan) && !isTokenLoanTerminating(loan) && !isTokenLoanListed(loan),
    )
  }, [sortedLoans])

  const searchSelectParams = createSearchSelectParams({
    loans: filteredAllLoans,
    selectedOptions: selectedCollections,
    onChange: setSelectedCollections,
  })

  const showEmptyList = (!loans.length && !loading) || !connected
  const emptyMessage = connected
    ? 'Your offers is waiting for a borrower'
    : 'Connect wallet to view your active offers'

  return {
    loans: sortedLoans,
    loading,

    loansToClaim,
    loansToTerminate,

    isUnderwaterFilterActive,
    onToggleUnderwaterFilter,
    underwaterLoansCount,

    sortViewParams: { searchSelectParams, sortParams },

    showEmptyList,
    emptyMessage,
  }
}

interface CreateSearchSelectProps {
  loans: core.TokenLoan[]
  selectedOptions: string[]
  onChange: (option: string[]) => void
}

const createSearchSelectParams = ({
  loans,
  selectedOptions,
  onChange,
}: CreateSearchSelectProps) => {
  const loansGroupedByCollection = groupBy(loans, (loan) => loan.collateral.ticker)

  const searchSelectOptions = map(loansGroupedByCollection, (groupedLoans) => {
    const firstLoanInGroup = first(groupedLoans)
    const { ticker = '', logoUrl = '' } = firstLoanInGroup?.collateral || {}
    const claim = sumBy(groupedLoans, (loan) =>
      calculateLentTokenValueWithInterest(loan).toNumber(),
    )

    return { ticker, logoUrl, claim }
  })

  const searchSelectParams = {
    options: searchSelectOptions,
    selectedOptions,
    className: styles.searchSelect,
    labels: ['Collection', 'Claim'],
    optionKeys: {
      labelKey: 'ticker',
      valueKey: 'ticker',
      imageKey: 'logoUrl',
      secondLabel: {
        key: 'claim',
        format: (value: number) => <DisplayValue value={value} />,
      },
    },
    onChange,
  }

  return searchSelectParams
}
