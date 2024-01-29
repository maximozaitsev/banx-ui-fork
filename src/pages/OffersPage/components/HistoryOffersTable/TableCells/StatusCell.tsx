import { FC } from 'react'

import { capitalize } from 'lodash'

import { LenderActivity } from '@banx/api/activity'
import {
  LoanStatus,
  STATUS_LOANS_COLOR_MAP,
  STATUS_LOANS_MAP_WITH_REFINANCED_ACTIVE,
} from '@banx/utils'

import styles from '../HistoryOffersTable.module.less'

interface StatusCellProps {
  loan: LenderActivity
}

export const StatusCell: FC<StatusCellProps> = ({ loan }) => {
  const loanStatus = STATUS_LOANS_MAP_WITH_REFINANCED_ACTIVE[loan.status]
  const statusColor = STATUS_LOANS_COLOR_MAP[loanStatus as LoanStatus]

  return (
    <span style={{ color: statusColor }} className={styles.statusCellTitle}>
      {capitalize(loanStatus)}
    </span>
  )
}
