export type DashboardColumnKey =
  | 'label'
  | 'ist'
  | 'ant'
  | 'avgSz'
  | 'erloese'
  | 'bgwNet'
  | 'bgwPct'
  | 'bgwEh'
  | 'deltaVj'

export type DashboardTableConfig = {
  columns: DashboardColumnKey[]
  showRiskRow: boolean
}

export const LEFT_TABLE_CONFIG: DashboardTableConfig = {
  columns: ['label', 'ist', 'ant', 'avgSz', 'erloese', 'bgwNet', 'bgwPct', 'bgwEh'],
  showRiskRow: false,
}

export const RIGHT_TABLE_CONFIG: DashboardTableConfig = {
  columns: ['label', 'ist', 'ant', 'avgSz', 'erloese', 'bgwNet', 'bgwPct', 'bgwEh', 'deltaVj'],
  showRiskRow: true,
}
