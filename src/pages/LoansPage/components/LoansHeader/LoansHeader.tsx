import { FC } from 'react'

import { sumBy } from 'lodash'

import {
  AdditionalStat,
  MainStat,
  PageHeaderBackdrop,
  SeparateStatsLine,
} from '@banx/components/PageHeader'
import { VALUES_TYPES } from '@banx/components/StatInfo'

import { useWalletLoans } from '../../hooks'

const LoansHeader: FC = () => {
  const { loans } = useWalletLoans()

  const numberOfLoans = loans.length
  const totalBorrowed = sumBy(loans, ({ fraktBond }) => fraktBond.borrowedAmount)

  return (
    <PageHeaderBackdrop title="Loans">
      <AdditionalStat label="Loans" value={numberOfLoans} valueType={VALUES_TYPES.STRING} />
      <AdditionalStat label="Total borrowed" value={totalBorrowed} divider={1e9} />
      <SeparateStatsLine />
      <MainStat label="Total debt" value="120" />
    </PageHeaderBackdrop>
  )
}

export default LoansHeader