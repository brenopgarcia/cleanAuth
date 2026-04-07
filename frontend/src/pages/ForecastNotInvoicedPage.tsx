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

type ForecastRow = {
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

const rows: ForecastRow[] = [
  { interval: '0 - 30', intervalTone: 'green', ist: 5, share: '13%', avgSalesDays: '16,4', ueNetEuro: '101.048 €', bgwNetEuro: '2.761 €', bgwShare: '2,7%', bgwTone: 'neutral' },
  { interval: '31 - 60', intervalTone: 'lime', ist: 5, share: '13%', avgSalesDays: '48,0', ueNetEuro: '148.962 €', bgwNetEuro: '18.282 €', bgwShare: '12,2%', bgwTone: 'neutral' },
  { interval: '61 - 90', intervalTone: 'yellow', ist: 11, share: '28%', avgSalesDays: '73,3', ueNetEuro: '264.438 €', bgwNetEuro: '17.704 €', bgwShare: '6,7%', bgwTone: 'neutral' },
  { interval: '91-120', intervalTone: 'gray', ist: 4, share: '10%', avgSalesDays: '105,0', ueNetEuro: '113.319 €', bgwNetEuro: '9.901 €', bgwShare: '8,7%', bgwTone: 'neutral' },
  { interval: '121-150', intervalTone: 'gray', ist: 13, share: '33%', avgSalesDays: '133,8', ueNetEuro: '363.134 €', bgwNetEuro: '-9.256 €', bgwShare: '-2,5%', bgwTone: 'negative' },
  { interval: '151-180', intervalTone: 'gray', ist: 1, share: '3%', avgSalesDays: '164,0', ueNetEuro: '32.042 €', bgwNetEuro: '-3.217 €', bgwShare: '-10,0%', bgwTone: 'negative' },
  { interval: '181-360', intervalTone: 'gray', ist: 1, share: '3%', avgSalesDays: '210,0', ueNetEuro: '14.400 €', bgwNetEuro: '-941 €', bgwShare: '-6,4%', bgwTone: 'negative' },
  { interval: '> 360', intervalTone: 'gray', ist: 0, share: '0%', avgSalesDays: '0,0', ueNetEuro: '0 €', bgwNetEuro: '0 €', bgwShare: '0%', bgwTone: 'neutral' },
]

const intervalToneClass: Record<ForecastRow['intervalTone'], string> = {
  green: 'bg-[#00d64f] text-black',
  lime: 'bg-[#c6ff00] text-black',
  yellow: 'bg-[#ffc928] text-black',
  gray: 'bg-[#d9d9d9] text-black',
}

const chartData = {
  labels: rows.map((r) => r.interval),
  datasets: [
    {
      label: 'IST',
      data: rows.map((r) => r.ist),
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
      max: 14,
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

export function ForecastNotInvoicedPage() {
  return (
    <div>
      <div className="rounded-xl border border-border bg-bg shadow-custom p-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm min-w-[930px]">
          <thead>
            <tr>
              <th colSpan={8} className="p-1.5 text-center font-semibold border border-black bg-white text-black">
                FORECAST - Fzg. mit Kaufvertrag, noch nicht fakturiert <span className="text-red-600">aktueller Monat</span>
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
              <td className="p-2">40</td>
              <td className="p-2" />
              <td className="p-2">91,6</td>
              <td className="p-2">1.037.544 €</td>
              <td className="p-2">35.180 €</td>
              <td className="p-2">3,4%</td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-4 rounded-lg border border-border bg-bg px-3 py-2 shadow-custom inline-block font-semibold">
          Risiko in % &gt; 90Tg: <span className="text-red-600">47,5%</span>
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
