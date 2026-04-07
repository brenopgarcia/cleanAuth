import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

type ForecastNextRow = {
  interval: string
  intervalTone: 'green' | 'lime' | 'yellow' | 'gray'
  ist: number
  share: string
  avgSalesDays: string
  ueNetEuro: string
  bgwNetEuro: string
  bgwShare: string
  bgwTone: 'neutral' | 'negative'
}

const rows: ForecastNextRow[] = [
  { interval: '0 - 30', intervalTone: 'green', ist: 4, share: '10%', avgSalesDays: '14,0', ueNetEuro: '111.294 €', bgwNetEuro: '10.069 €', bgwShare: '9,0%', bgwTone: 'neutral' },
  { interval: '31 - 60', intervalTone: 'lime', ist: 10, share: '24%', avgSalesDays: '43,5', ueNetEuro: '266.297 €', bgwNetEuro: '27.039 €', bgwShare: '10,2%', bgwTone: 'neutral' },
  { interval: '61 - 90', intervalTone: 'yellow', ist: 12, share: '29%', avgSalesDays: '72,2', ueNetEuro: '281.479 €', bgwNetEuro: '25.241 €', bgwShare: '9,0%', bgwTone: 'neutral' },
  { interval: '91-120', intervalTone: 'gray', ist: 4, share: '10%', avgSalesDays: '105,0', ueNetEuro: '120.780 €', bgwNetEuro: '538 €', bgwShare: '0,4%', bgwTone: 'neutral' },
  { interval: '121-150', intervalTone: 'gray', ist: 6, share: '14%', avgSalesDays: '134,8', ueNetEuro: '154.362 €', bgwNetEuro: '613 €', bgwShare: '0,4%', bgwTone: 'neutral' },
  { interval: '151-180', intervalTone: 'gray', ist: 4, share: '10%', avgSalesDays: '164,3', ueNetEuro: '97.311 €', bgwNetEuro: '-2.872 €', bgwShare: '-3,0%', bgwTone: 'negative' },
  { interval: '181-360', intervalTone: 'gray', ist: 2, share: '5%', avgSalesDays: '199,5', ueNetEuro: '79.655 €', bgwNetEuro: '-6.664 €', bgwShare: '-8,4%', bgwTone: 'negative' },
  { interval: '> 360', intervalTone: 'gray', ist: 0, share: '0%', avgSalesDays: '0,0', ueNetEuro: '0 €', bgwNetEuro: '0 €', bgwShare: '0%', bgwTone: 'neutral' },
]

const intervalToneClass: Record<ForecastNextRow['intervalTone'], string> = {
  green: 'bg-[#00d64f] text-black',
  lime: 'bg-[#c6ff00] text-black',
  yellow: 'bg-[#ffc928] text-black',
  gray: 'bg-[#d9d9d9] text-black',
}

const chartData = {
  labels: ['0 - 30', '31 - 60', '91-120', '121-150', '151-180', '181-360', '> 360'],
  datasets: [
    {
      label: 'IST',
      data: [4, 10, 4, 6, 4, 2, 0],
      backgroundColor: '#d3d3d3',
      borderWidth: 0,
      barThickness: 28,
      maxBarThickness: 32,
    },
  ],
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: true,
      text: 'noch nicht fakturierte Fzg.',
      color: '#444',
      font: { size: 16, weight: 'bold' as const },
    },
    legend: { display: true, position: 'bottom' as const },
  },
  scales: {
    y: {
      min: 0,
      max: 12,
      ticks: { stepSize: 2, color: '#666' },
      grid: { color: 'rgba(0,0,0,0.12)' },
      border: { color: 'rgba(0,0,0,0.15)' },
    },
    x: {
      ticks: { color: '#666' },
      grid: { display: false },
      border: { color: 'rgba(0,0,0,0.15)' },
    },
  },
}

export function ForecastNotInvoicedNextMonthPage() {
  return (
    <div>
      <div className="rounded-xl border border-border bg-bg shadow-custom p-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm min-w-[930px]">
          <thead>
            <tr>
              <th colSpan={8} className="p-1.5 text-center font-semibold border border-black bg-white text-black">
                FORECAST - Fzg. mit Kaufvertrag, noch nicht fakturiert <span className="text-red-600">nächster Monat</span>
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
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.interval} className="border-b border-border/60">
                <td className={`p-2 text-right font-medium ${intervalToneClass[row.intervalTone]}`}>{row.interval}</td>
                <td className="p-2">{row.ist}</td>
                <td className="p-2">{row.share}</td>
                <td className="p-2">{row.avgSalesDays}</td>
                <td className="p-2">{row.ueNetEuro}</td>
                <td className={`p-2 ${row.bgwTone === 'negative' ? 'text-red-600' : ''}`}>{row.bgwNetEuro}</td>
                <td className={`p-2 ${row.bgwTone === 'negative' ? 'text-red-600' : ''}`}>{row.bgwShare}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold border-t border-border">
              <td className="p-2 text-right">gesamt:</td>
              <td className="p-2">42</td>
              <td className="p-2" />
              <td className="p-2">86,7</td>
              <td className="p-2">1.111.179 €</td>
              <td className="p-2">53.964 €</td>
              <td className="p-2">4,9%</td>
            </tr>
          </tfoot>
        </table>
        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <div className="rounded-lg border border-border bg-bg px-3 py-2 shadow-custom flex items-center">
            Risiko in % &gt; 90Tg: <span className="text-red-600 font-semibold">&nbsp;38,1%</span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-bg shadow-custom p-4">
        <div className="h-[360px]">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  )
}
