import { ColumnType } from '@banx/components/Table'
import { DurationCell, HeaderCell } from '@banx/components/TableComponents'

import { activity } from '@banx/api/nft'

import { AprCell, CollateralCell, LentCell, StatusCell } from './cells'

import styles from './ActivityTable.module.less'

export const getTableColumns = () => {
  const columns: ColumnType<activity.LenderActivity>[] = [
    {
      key: 'collateral',
      title: <HeaderCell label="Collateral" align="left" />,
      render: (loan) => <CollateralCell loan={loan} />,
    },
    {
      key: 'lent',
      title: <HeaderCell label="Lent" />,
      render: (loan) => <LentCell loan={loan} />,
    },
    {
      key: 'apr',
      title: <HeaderCell label="Apr" />,
      render: (loan) => <AprCell loan={loan} />,
    },
    {
      key: 'status',
      title: (
        <HeaderCell
          label="Status"
          tooltipText="Current status and duration of the loan that has been passed"
        />
      ),
      render: (loan) => <StatusCell loan={loan} />,
    },
    {
      key: 'timestamp',
      title: <HeaderCell label="When" />,
      render: ({ publicKey, timestamp }) => (
        <DurationCell className={styles.activityTime} publicKey={publicKey} timestamp={timestamp} />
      ),
    },
  ]

  return columns
}
