import { FC } from 'react'

import { Loan } from '@banx/api/core'
import { ColorByPercentHealth, getColorByPercent } from '@banx/utils'

import styles from '../ActiveOffersTable.module.less'

interface APRCellProps {
  loan: Loan
}

export const APRCell: FC<APRCellProps> = ({ loan }) => {
  const { amountOfBonds } = loan.bondTradeTransaction || {}

  const aprPercent = amountOfBonds / 100

  const colorAPR = getColorByPercent(aprPercent, ColorByPercentHealth)

  return (
    <span style={{ color: colorAPR }} className={styles.aprValue}>
      {aprPercent}%
    </span>
  )
}