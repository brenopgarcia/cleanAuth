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

function getStandzeitToneClass(label: string) {
  const normalized = label.replace(/\s/g, '')
  if (normalized === '0-30') return 'bg-[#00d64f] text-black'
  if (normalized === '31-60') return 'bg-[#c6ff00] text-black'
  if (normalized === '61-90') return 'bg-[#ffc928] text-black'
  if (normalized === '91-120') return 'bg-[#cfcfcf] text-black'
  if (normalized === '121-150') return 'bg-[#bebebe] text-black'
  if (normalized === '151-180') return 'bg-[#adadad] text-black'
  if (normalized === '181-360') return 'bg-[#9b9b9b] text-black'
  if (normalized === '>360') return 'bg-[#888888] text-white'
  return ''
}

function ReportTable({ title, rows, totals }: { title: string; rows: ReportRow[]; totals: string }) {
  return (
    <div className="rounded-xl border border-border bg-bg p-3 shadow-custom overflow-x-auto">
      <h3 className="m-0 mb-2 text-sm font-semibold text-text-h">{title}</h3>
      <table className="w-full min-w-[700px] text-xs border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-1"> </th>
            <th className="text-right p-1">IST</th>
            <th className="text-right p-1">Ant.</th>
            <th className="text-right p-1">Ø SZ</th>
            <th className="text-right p-1">Erlöse</th>
            <th className="text-right p-1">BGW netto</th>
            <th className="text-right p-1">BGW %</th>
            <th className="text-right p-1">BGW/EH</th>
            <th className="text-right p-1">Abw.</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-border/50">
              <td className={`p-1 ${getStandzeitToneClass(row.label)} ${getStandzeitToneClass(row.label) ? 'text-right font-medium' : ''}`}>{row.label}</td>
              <td className="p-1 text-right">{row.ist}</td>
              <td className="p-1 text-right">{row.ant}</td>
              <td className="p-1 text-right">{row.avgSz}</td>
              <td className="p-1 text-right">{row.erloese}</td>
              <td className={`p-1 text-right ${row.bgwNet.includes('-') ? 'text-red-600' : ''}`}>{row.bgwNet}</td>
              <td className={`p-1 text-right ${row.bgwPct.includes('-') ? 'text-red-600' : ''}`}>{row.bgwPct}</td>
              <td className={`p-1 text-right ${String(row.bgwEh).includes('-') ? 'text-red-600' : ''}`}>{row.bgwEh ?? ''}</td>
              <td className={`p-1 text-right ${String(row.deltaVj).includes('-') ? 'text-red-600' : ''}`}>{row.deltaVj ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="m-0 mt-2 text-xs font-semibold">{totals}</p>
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
          totals="gesamt: 108 | Ø SZ: 81 | Erlöse netto: 2.525.082 € | BGW netto: 116.257 € | BGW in %: 4,6% | BGW je EH: 1.076 €"
        />
        <ReportTable
          title="Entwicklung verkaufter aktueller Monat nach Standzeitgruppen"
          rows={currentMonthRight}
          totals="gesamt: 108 | Ø SZ: 81 | Erlöse netto: 2.525.082 € | BGW netto: 116.257 € | BGW in %: 4,6% | BGW je EH: 1.076 €"
        />
        <ReportTable
          title="Entwicklung verkaufter Bestand WJ 2025/2026 nach Standzeitgruppen"
          rows={currentMonthLeft}
          totals="gesamt: ### | Ø SZ: 90 | Erlöse netto: ########## | BGW netto: 624.885 € | BGW in %: 2,4% | BGW je EH: 554 €"
        />
        <ReportTable
          title="Entwicklung verkaufter Bestand WJ 2025/2026 nach Standzeitgruppen"
          rows={currentMonthRight}
          totals="gesamt: ### | Ø SZ: 90 | Erlöse netto: ########## | BGW netto: 624.885 € | BGW in %: 2,4% | BGW je EH: 554 €"
        />
        <ReportTable
          title="Entwicklung verkaufter Bestand WJ 2024/2025 nach Standzeitgruppen"
          rows={currentMonthLeft}
          totals="gesamt: 946 | Ø SZ: 98 | Erlöse netto: ########## | BGW netto: 982.818 € | BGW in %: 4,7% | BGW je EH: 1.039 €"
        />
        <ReportTable
          title="Entwicklung verkaufter Bestand WJ 2024/2025 nach Standzeitgruppen"
          rows={currentMonthRight}
          totals="gesamt: 946 | Ø SZ: 98 | Erlöse netto: ########## | BGW netto: 982.818 € | BGW in %: 4,7% | BGW je EH: 1.039 €"
        />
      </div>

      <p className="mt-5 text-center text-xs text-text">
        <strong>HINWEIS:</strong> Portfolio und sonstige Boni & Zuschüsse sind in Cross nicht berücksichtigt.
      </p>
    </div>
  )
}

