import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Chart } from 'react-chartjs-2'
import { getStandzeitToneClass } from '../lib/standzeit-tone'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
)

type BillingStockRow = {
  interval: string
  intervalTone: 'green' | 'lime' | 'yellow' | 'gray'
  ist: number
  share: string
  avgSalesDays: string
  ueNetEuro: string
  bgwNetEuro: string
  bgwNetTone: 'neutral' | 'negative'
  bgwShare: string
  bgwShareTone: 'neutral' | 'negative'
  stockTurn: string
  targetSales: number
  missingToTarget: number
}

const rows: BillingStockRow[] = [
  {
    interval: '0 - 30',
    intervalTone: 'green',
    ist: 11,
    share: '10%',
    avgSalesDays: '14,3',
    ueNetEuro: '149.799 €',
    bgwNetEuro: '18.525 €',
    bgwNetTone: 'neutral',
    bgwShare: '12,4%',
    bgwShareTone: 'neutral',
    stockTurn: '3,0',
    targetSales: 83,
    missingToTarget: 67,
  },
  {
    interval: '31 - 60',
    intervalTone: 'lime',
    ist: 39,
    share: '36%',
    avgSalesDays: '46,4',
    ueNetEuro: '914.280 €',
    bgwNetEuro: '77.371 €',
    bgwNetTone: 'neutral',
    bgwShare: '8,5%',
    bgwShareTone: 'neutral',
    stockTurn: '4,0',
    targetSales: 62,
    missingToTarget: 18,
  },
  {
    interval: '61 - 90',
    intervalTone: 'yellow',
    ist: 17,
    share: '16%',
    avgSalesDays: '76,4',
    ueNetEuro: '378.775 €',
    bgwNetEuro: '20.839 €',
    bgwNetTone: 'neutral',
    bgwShare: '5,5%',
    bgwShareTone: 'neutral',
    stockTurn: '6,0',
    targetSales: 41,
    missingToTarget: 13,
  },
  {
    interval: '91-120',
    intervalTone: 'gray',
    ist: 17,
    share: '16%',
    avgSalesDays: '108,5',
    ueNetEuro: '451.452 €',
    bgwNetEuro: '9.898 €',
    bgwNetTone: 'neutral',
    bgwShare: '2,2%',
    bgwShareTone: 'neutral',
    stockTurn: '12,0',
    targetSales: 21,
    missingToTarget: 0,
  },
  {
    interval: '121-150',
    intervalTone: 'gray',
    ist: 14,
    share: '13%',
    avgSalesDays: '132,1',
    ueNetEuro: '380.285 €',
    bgwNetEuro: '-15.602 €',
    bgwNetTone: 'negative',
    bgwShare: '-4,1%',
    bgwShareTone: 'negative',
    stockTurn: '0',
    targetSales: 10,
    missingToTarget: -18,
  },
  {
    interval: '151-180',
    intervalTone: 'gray',
    ist: 7,
    share: '6%',
    avgSalesDays: '163,7',
    ueNetEuro: '189.113 €',
    bgwNetEuro: '11.763 €',
    bgwNetTone: 'negative',
    bgwShare: '6,2%',
    bgwShareTone: 'negative',
    stockTurn: '0',
    targetSales: 5,
    missingToTarget: -3,
  },
  {
    interval: '181-360',
    intervalTone: 'gray',
    ist: 3,
    share: '3%',
    avgSalesDays: '230,0',
    ueNetEuro: '61.378 €',
    bgwNetEuro: '-6.536 €',
    bgwNetTone: 'negative',
    bgwShare: '-10,6%',
    bgwShareTone: 'negative',
    stockTurn: '0',
    targetSales: 2,
    missingToTarget: -2,
  },
  {
    interval: '> 360',
    intervalTone: 'gray',
    ist: 0,
    share: '0%',
    avgSalesDays: '0,0',
    ueNetEuro: '0 €',
    bgwNetEuro: '0 €',
    bgwNetTone: 'neutral',
    bgwShare: '0%',
    bgwShareTone: 'neutral',
    stockTurn: '0',
    targetSales: 1,
    missingToTarget: 1,
  },
]

const labels = rows.map((row) => row.interval)
const istSeries = rows.map((row) => row.ist)
const targetSeries = rows.map((row) => row.targetSales)
const hrSeries = [16, 44, 28, 21, 27, 8, 4, 0]

const chartData = {
  labels,
  datasets: [
    {
      type: 'bar' as const,
      label: 'IST',
      data: istSeries,
      order: 3,
      backgroundColor: '#d9d9d9',
      borderWidth: 0,
      barThickness: 28,
      maxBarThickness: 32,
    },
    {
      type: 'line' as const,
      label: 'Soll Absatz',
      data: targetSeries,
      order: 1,
      borderColor: '#8bc34a',
      backgroundColor: '#8bc34a',
      borderWidth: 3,
      pointRadius: 4,
      pointHoverRadius: 5,
      pointBorderWidth: 1.5,
      pointBorderColor: '#ffffff',
      tension: 0,
    },
    {
      type: 'line' as const,
      label: 'HR',
      data: hrSeries,
      order: 2,
      borderColor: '#1e3a6a',
      backgroundColor: '#1e3a6a',
      borderWidth: 2,
      borderDash: [7, 4],
      pointRadius: 4,
      pointHoverRadius: 5,
      pointBorderWidth: 1.5,
      pointBorderColor: '#ffffff',
      tension: 0.22,
    },
  ],
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
    title: {
      display: true,
      text: 'fakturierter Bestand',
      color: '#444',
      font: {
        size: 16,
        weight: 'bold' as const,
      },
    },
    datalabels: {
      display: (context: { dataset: { type?: string } }) => context.dataset.type === 'line',
      formatter: (value: number) => value,
      color: (context: { dataset: { label?: string } }) => (context.dataset.label === 'HR' ? '#1e3a6a' : '#8bc34a'),
      font: {
        weight: 'bold' as const,
        size: 11,
      },
      anchor: 'end' as const,
      align: 'top' as const,
      offset: 4,
      clamp: true,
    },
  },
  scales: {
    y: {
      min: 0,
      max: 90,
      ticks: {
        stepSize: 10,
        color: '#666',
      },
      grid: {
        color: 'rgba(0,0,0,0.12)',
      },
      border: {
        color: 'rgba(0,0,0,0.15)',
      },
    },
    x: {
      ticks: {
        color: '#666',
      },
      grid: {
        display: false,
      },
      border: {
        color: 'rgba(0,0,0,0.15)',
      },
    },
  },
}

export function BillingStockPage() {
  return (
    <div>
      <div className="rounded-xl border border-border bg-bg shadow-custom p-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm min-w-[1100px]">
          <thead>
            <tr>
              <th
                colSpan={11}
                className="p-1.5 text-center font-semibold border border-black bg-white text-black"
              >
                fakturierter Bestand aktueller Monat
              </th>
            </tr>
            <tr className="border-b border-border">
              <th className="text-left p-2 w-[96px]" />
              <th className="text-left p-2">IST</th>
              <th className="text-left p-2">Ant.</th>
              <th className="text-left p-2">Ø verk. SZ</th>
              <th className="text-left p-2">UE in € netto</th>
              <th className="text-left p-2">BGW netto</th>
              <th className="text-left p-2">BGW in %</th>
              <th className="text-left p-2">Lager-drehung</th>
              <th className="text-left p-2">Soll Absatz</th>
              <th className="text-left p-2">Fehlmenge zum Ziel</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.interval} className="border-b border-border/60">
                <td className={`p-2 text-right font-medium ${getStandzeitToneClass(row.interval)}`}>{row.interval}</td>
                <td className="p-2">{row.ist}</td>
                <td className="p-2">{row.share}</td>
                <td className="p-2">{row.avgSalesDays}</td>
                <td className="p-2">{row.ueNetEuro}</td>
                <td className={`p-2 ${row.bgwNetTone === 'negative' ? 'text-red-600' : ''}`}>{row.bgwNetEuro}</td>
                <td className={`p-2 ${row.bgwShareTone === 'negative' ? 'text-red-600' : ''}`}>{row.bgwShare}</td>
                <td className="p-2">{row.stockTurn}</td>
                <td className="p-2">{row.targetSales}</td>
                <td className="p-2 font-semibold">{row.missingToTarget}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold border-t border-border">
              <td className="p-2 text-right">gesamt:</td>
              <td className="p-2">108</td>
              <td className="p-2" />
              <td className="p-2">81,4</td>
              <td className="p-2">2.525.082 €</td>
              <td className="p-2">#####</td>
              <td className="p-2">4,6%</td>
              <td className="p-2" />
              <td className="p-2">224</td>
              <td className="p-2" />
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm w-full">
        <div className="rounded-lg border border-border bg-bg px-3 py-2 shadow-custom">
          Risiko in % &gt; 90Tg: <span className="text-red-600 font-semibold">&nbsp;38%</span>
        </div>
        <div className="rounded-lg border border-border bg-bg px-3 py-2 shadow-custom">
          <div className="text-xs">davon</div>
          <div className="text-xs">Bestands-bereinigung: <span className="text-red-600 font-semibold">17</span></div>
        </div>
        <div className="rounded-lg border border-border bg-bg px-3 py-2 shadow-custom">
          Monatslager: <strong>IST 2,5</strong> | <strong>Soll 2,0</strong>
        </div>
        <div className="rounded-lg border border-border bg-bg px-3 py-2 shadow-custom flex items-center">
          Lagerumschlag: <strong>IST 4,8</strong> | <strong>Soll 6,0</strong>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-border bg-bg shadow-custom p-4">
        <div className="h-[360px]">
          <Chart type="bar" data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  )
}
