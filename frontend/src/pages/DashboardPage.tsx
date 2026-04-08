import { getStandzeitToneClass } from '../lib/standzeit-tone'
import {
  LEFT_TABLE_CONFIG,
  RIGHT_TABLE_CONFIG,
  type DashboardColumnKey,
  type DashboardTableConfig,
} from './dashboard-table-config'

type ReportRow = {
  label: string
  ist: string
  ant: string
  avgSz: string
  erloese: string
  bgwNet: string
  bgwPct: string
  bgwEh?: string
  deltaVj?: string
}

const COLUMN_HEADER_LABELS: Record<DashboardColumnKey, string> = {
  label: ' ',
  ist: 'IST',
  ant: 'Ant.',
  avgSz: 'Ø SZ',
  erloese: 'Erlöse',
  bgwNet: 'BGW netto',
  bgwPct: 'BGW %',
  bgwEh: 'BGW/EH',
  deltaVj: 'Abw.',
}

type ReportTotals = {
  count: number
  avgSz: number
  erloese: number
  bgwNet: number
  bgwPct: number
  bgwEh: number
  abw: number
  riskOver90Pct: number
  riskOver90Euro: number
}

function parseEuro(value: string): number {
  const normalized = value.replace(/[^\d,-]/g, '').replace(/\./g, '').replace(',', '.')
  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function parseNumber(value: string): number {
  const normalized = value.replace(/[^\d,-]/g, '').replace(',', '.')
  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function parseDelta(value: string): number {
  const numeric = parseNumber(value)
  if (!numeric) return 0
  if (value.includes('↓')) return -Math.abs(numeric)
  if (value.includes('↑')) return Math.abs(numeric)
  return numeric
}

function normalizeStandzeitLabel(label: string): string {
  return label.replace(/\s/g, '')
}

function isOver90Standzeit(label: string): boolean {
  const normalized = normalizeStandzeitLabel(label)
  if (normalized.startsWith('>')) return true
  const [startRaw] = normalized.split('-')
  const start = Number.parseInt(startRaw, 10)
  return Number.isFinite(start) && start >= 91
}

function formatInteger(value: number): string {
  return Math.round(value).toLocaleString('de-DE')
}

function formatDecimal(value: number): string {
  return value.toLocaleString('de-DE', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
}

function formatPercent(value: number): string {
  return `${formatDecimal(value)}%`
}

function formatEuro(value: number): string {
  return `${value.toLocaleString('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} €`
}

function calculateTotals(rows: ReportRow[]): ReportTotals {
  const count = rows.reduce((acc, row) => acc + parseNumber(row.ist), 0)
  const weightedAvgSum = rows.reduce((acc, row) => acc + parseNumber(row.ist) * parseNumber(row.avgSz), 0)
  const erloese = rows.reduce((acc, row) => acc + parseEuro(row.erloese), 0)
  const bgwNet = rows.reduce((acc, row) => acc + parseEuro(row.bgwNet), 0)
  const abw = rows.reduce((acc, row) => acc + parseDelta(row.deltaVj ?? ''), 0)
  const riskRows = rows.filter((row) => isOver90Standzeit(row.label))
  const riskCount = riskRows.reduce((acc, row) => acc + parseNumber(row.ist), 0)
  const riskOver90Euro = riskRows.reduce((acc, row) => {
    const value = parseEuro(row.bgwNet)
    return value > 0 ? acc + value : acc
  }, 0)
  const avgSz = count > 0 ? weightedAvgSum / count : 0
  const bgwPct = erloese !== 0 ? (bgwNet / erloese) * 100 : 0
  const bgwEh = count > 0 ? bgwNet / count : 0
  const riskOver90Pct = count > 0 ? (riskCount / count) * 100 : 0

  return { count, avgSz, erloese, bgwNet, bgwPct, bgwEh, abw, riskOver90Pct, riskOver90Euro }
}

const currentMonthLeft: ReportRow[] = [
  { label: 'Inzahlungsnahme auf l', ist: '16', ant: '15%', avgSz: '47', erloese: '136.086 €', bgwNet: '24.461 €', bgwPct: '18,0%', bgwEh: '1.529 €' },
  { label: 'Inzahlungsnahme NW', ist: '3', ant: '3%', avgSz: '84', erloese: '55.207 €', bgwNet: '3.893 €', bgwPct: '7,1%', bgwEh: '1.298 €' },
  { label: 'Leasingrückläufer', ist: '11', ant: '10%', avgSz: '109', erloese: '276.029 €', bgwNet: '28.090 €', bgwPct: '10,2%', bgwEh: '2.554 €' },
  { label: 'Autokreditrückläufer', ist: '0', ant: '0%', avgSz: '0', erloese: '0 €', bgwNet: '0 €', bgwPct: '0%', bgwEh: '0 €' },
  { label: 'Keine', ist: '0', ant: '0%', avgSz: '0', erloese: '0 €', bgwNet: '0 €', bgwPct: '0%', bgwEh: '0 €' },
  { label: 'VFV ab', ist: '1', ant: '1%', avgSz: '12', erloese: '33.101 €', bgwNet: '-2.275 €', bgwPct: '-6,9%', bgwEh: '-2.275 €' },
  { label: 'Zukauf frei', ist: '1', ant: '1%', avgSz: '24', erloese: '2.018 €', bgwNet: '1.181 €', bgwPct: '58,5%', bgwEh: '1.181 €' },
  { label: 'Zukauf VTI', ist: '25', ant: '23%', avgSz: '95', erloese: '567.498 €', bgwNet: '12.034 €', bgwPct: '2,1%', bgwEh: '481 €' },
  { label: 'Zukauf Aktion VVJ', ist: '8', ant: '7%', avgSz: '95', erloese: '183.004 €', bgwNet: '1.723 €', bgwPct: '0,9%', bgwEh: '215 €' },
  { label: 'Zukauf VVJ', ist: '43', ant: '40%', avgSz: '80', erloese: '1.272.137 €', bgwNet: '47.150 €', bgwPct: '3,7%', bgwEh: '1.097 €' },
  { label: 'Zukauf Vandoo', ist: '0', ant: '0%', avgSz: '0', erloese: '0,00 €', bgwNet: '0,00 €', bgwPct: '0%', bgwEh: '0,00 €' },
]

const currentMonthRight: ReportRow[] = [
  { label: '0-30', ist: '11', ant: '10%', avgSz: '14', erloese: '149.799 €', bgwNet: '18.525 €', bgwPct: '12,4%', bgwEh: '1.684 €', deltaVj: '793↑' },
  { label: '31-60', ist: '39', ant: '36%', avgSz: '46', erloese: '914.280 €', bgwNet: '77.371 €', bgwPct: '8,5%', bgwEh: '1.984 €', deltaVj: '572↑' },
  { label: '61-90', ist: '17', ant: '16%', avgSz: '76', erloese: '378.775 €', bgwNet: '20.839 €', bgwPct: '5,5%', bgwEh: '1.226 €', deltaVj: '169↑' },
  { label: '91-120', ist: '17', ant: '16%', avgSz: '108', erloese: '451.452 €', bgwNet: '9.898 €', bgwPct: '2,2%', bgwEh: '582 €', deltaVj: '172↓' },
  { label: '121-150', ist: '14', ant: '13%', avgSz: '132', erloese: '380.285 €', bgwNet: '-15.602 €', bgwPct: '-4,1%', bgwEh: '-1.114 €', deltaVj: '-363↓' },
  { label: '151-180', ist: '7', ant: '6%', avgSz: '164', erloese: '189.113 €', bgwNet: '11.763 €', bgwPct: '6,2%', bgwEh: '1.680 €', deltaVj: '2.211|' },
  { label: '181-360', ist: '3', ant: '3%', avgSz: '230', erloese: '61.378 €', bgwNet: '-6.536 €', bgwPct: '-10,6%', bgwEh: '-2.179 €', deltaVj: '-323↓' },
  { label: '> 360', ist: '0', ant: '0%', avgSz: '0', erloese: '0 €', bgwNet: '0 €', bgwPct: '0%', bgwEh: '0 €', deltaVj: '' },
]

function cellClass(column: DashboardColumnKey, value: string) {
  if ((column === 'bgwNet' || column === 'bgwPct' || column === 'bgwEh' || column === 'deltaVj') && value.includes('-')) {
    return 'text-red-600'
  }
  return ''
}

function getRowCellValue(row: ReportRow, column: DashboardColumnKey): string {
  if (column === 'label') return row.label
  if (column === 'ist') return row.ist
  if (column === 'ant') return row.ant
  if (column === 'avgSz') return row.avgSz
  if (column === 'erloese') return row.erloese
  if (column === 'bgwNet') return row.bgwNet
  if (column === 'bgwPct') return row.bgwPct
  if (column === 'bgwEh') return row.bgwEh ?? ''
  return row.deltaVj ?? ''
}

function getTotalCellValue(totals: ReportTotals, column: DashboardColumnKey): string {
  if (column === 'label') return 'gesamt:'
  if (column === 'ist') return formatInteger(totals.count)
  if (column === 'ant') return ''
  if (column === 'avgSz') return formatDecimal(totals.avgSz)
  if (column === 'erloese') return formatEuro(totals.erloese)
  if (column === 'bgwNet') return formatEuro(totals.bgwNet)
  if (column === 'bgwPct') return formatPercent(totals.bgwPct)
  if (column === 'bgwEh') return formatEuro(totals.bgwEh)
  return formatEuro(totals.abw)
}

function getRiskCellValue(totals: ReportTotals, column: DashboardColumnKey): string {
  if (column === 'label') return 'verk. Risiko > 90 Tg.:'
  if (column === 'ist') return formatPercent(totals.riskOver90Pct)
  if (column === 'bgwNet') return formatEuro(totals.riskOver90Euro)
  return ''
}

function ReportTable({ title, rows, config }: { title: string; rows: ReportRow[]; config: DashboardTableConfig }) {
  const totals = calculateTotals(rows)

  return (
    <div className="rounded-xl border border-border bg-bg p-3 shadow-custom overflow-x-auto">
      <h3 className="m-0 mb-2 text-sm font-semibold text-text-h">{title}</h3>
      <table className="w-full min-w-[700px] text-xs border-collapse">
        <thead>
          <tr className="border-b border-border">
            {config.columns.map((column) => (
              <th key={column} className={`${column === 'label' ? 'text-left' : 'text-right'} p-1`}>
                {COLUMN_HEADER_LABELS[column]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-border/50">
              {config.columns.map((column) => {
                const value = getRowCellValue(row, column)
                if (column === 'label') {
                  return (
                    <td key={column} className={`p-1 ${getStandzeitToneClass(row.label)} ${getStandzeitToneClass(row.label) ? 'text-right font-medium' : ''}`}>
                      {value}
                    </td>
                  )
                }

                return (
                  <td key={column} className={`p-1 text-right ${cellClass(column, value)}`}>
                    {value}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-border font-semibold">
            {config.columns.map((column) => {
              const value = getTotalCellValue(totals, column)
              return (
                <td key={column} className={`p-1 ${column === 'label' ? 'text-left' : 'text-right'} ${column === 'deltaVj' && totals.abw < 0 ? 'text-red-600' : ''}`}>
                  {value}
                </td>
              )
            })}
          </tr>
          {config.showRiskRow && (
            <>
              <tr><td className="p-3" /></tr>
              <tr className="font-semibold">
                {config.columns.map((column) => {
                  const value = getRiskCellValue(totals, column)
                  return (
                    <td key={column} className={`p-1 ${column === 'label' || column === 'ist' ? 'text-left border border-black' : 'text-right'}`}>
                      {value}
                    </td>
                  )
                })}
              </tr></>
          )}
        </tfoot>
      </table>
    </div>
  )
}

export function DashboardPage() {
  return (
    <div>


      <div className="rounded-xl border border-border bg-bg shadow-custom p-4 mb-5">
        <p className="m-0 text-sm"><strong>Fahrzeugart:</strong> Gebrauchtwagen (ohne VFV, TZ, Wandlungen)</p>
        <p className="m-0 text-sm"><strong>Herkunft:</strong> CROSS</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ReportTable
          title="Entwicklung verkaufter aktueller Monat nach Standzeitgruppen"
          rows={currentMonthLeft}
          config={LEFT_TABLE_CONFIG}
        />
        <ReportTable
          title="Entwicklung verkaufter aktueller Monat nach Standzeitgruppen"
          rows={currentMonthRight}
          config={RIGHT_TABLE_CONFIG}
        />
        <ReportTable
          title="Entwicklung verkaufter Bestand WJ 2025/2026 nach Standzeitgruppen"
          rows={currentMonthLeft}
          config={LEFT_TABLE_CONFIG}
        />
        <ReportTable
          title="Entwicklung verkaufter Bestand WJ 2025/2026 nach Standzeitgruppen"
          rows={currentMonthRight}
          config={RIGHT_TABLE_CONFIG}
        />
        <ReportTable
          title="Entwicklung verkaufter Bestand WJ 2024/2025 nach Standzeitgruppen"
          rows={currentMonthLeft}
          config={LEFT_TABLE_CONFIG}
        />
        <ReportTable
          title="Entwicklung verkaufter Bestand WJ 2024/2025 nach Standzeitgruppen"
          rows={currentMonthRight}
          config={RIGHT_TABLE_CONFIG}
        />
      </div>

      <p className="mt-5 text-center text-xs text-text">
        <strong>HINWEIS:</strong> Portfolio und sonstige Boni & Zuschüsse sind in Cross nicht berücksichtigt.
      </p>
    </div>
  )
}

