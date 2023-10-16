import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'

import { Summary } from './Summary'
import { getTableColumns } from './columns'
import { useHistoryOffersTable } from './hooks'

import styles from './HistoryOffersTable.module.less'

export const HistoryOffersTable = () => {
  const {
    loans,
    sortViewParams,
    loading,
    showEmptyList,
    emptyListParams,
    showSummary,
    fetchMoreTrigger,
  } = useHistoryOffersTable()

  const columns = getTableColumns()

  if (showEmptyList) return <EmptyList {...emptyListParams} />

  return (
    <div className={styles.tableRoot}>
      <Table
        data={loans}
        columns={columns}
        sortViewParams={sortViewParams}
        className={styles.rootTable}
        rowKeyField="id"
        fetchMoreTrigger={fetchMoreTrigger}
        loading={loading}
        showCard
      />
      {showSummary && <Summary />}
    </div>
  )
}
