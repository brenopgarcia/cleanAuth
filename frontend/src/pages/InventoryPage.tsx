import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  BarElement,
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

type InventoryRow = {
  interval: string
  intervalTone: 'green' | 'lime' | 'yellow' | 'gray'
  isCount: number
  percentage: string
  avgDays: string
  netStockEuro: string
  share: string
  actualRange: string
  targetRange: string
  targetStock: number
  kpi: string
  kpiTone: 'green' | 'lime' | 'yellow' | 'gray'
}

const mockInventoryRows: InventoryRow[] = [
  {
    interval: '0 - 30',
    intervalTone: 'green',
    isCount: 150,
    percentage: '36%',
    avgDays: '16,6',
    netStockEuro: '3.146.589 €',
    share: '34%',
    actualRange: '13,6',
    targetRange: '4,0',
    targetStock: 165,
    kpi: '40%',
    kpiTone: 'green',
  },
  {
    interval: '31 - 60',
    intervalTone: 'lime',
    isCount: 122,
    percentage: '30%',
    avgDays: '45,0',
    netStockEuro: '2.875.805 €',
    share: '31%',
    actualRange: '3,1',
    targetRange: '3,0',
    targetStock: 124,
    kpi: '30%',
    kpiTone: 'lime',
  },
  {
    interval: '61 - 90',
    intervalTone: 'yellow',
    isCount: 89,
    percentage: '22%',
    avgDays: '71,9',
    netStockEuro: '1.936.153 €',
    share: '21%',
    actualRange: '5,2',
    targetRange: '2,0',
    targetStock: 83,
    kpi: '20%',
    kpiTone: 'lime',
  },
  {
    interval: '91 - 120',
    intervalTone: 'gray',
    isCount: 18,
    percentage: '4%',
    avgDays: '108,7',
    netStockEuro: '435.235 €',
    share: '5%',
    actualRange: '1,1',
    targetRange: '1,0',
    targetStock: 41,
    kpi: '10%',
    kpiTone: 'lime',
  },
  {
    interval: '121 - 150',
    intervalTone: 'gray',
    isCount: 19,
    percentage: '5%',
    avgDays: '133,2',
    netStockEuro: '493.272 €',
    share: '5%',
    actualRange: '1,4',
    targetRange: '0',
    targetStock: 0,
    kpi: '0%',
    kpiTone: 'yellow',
  },
  {
    interval: '151 - 180',
    intervalTone: 'gray',
    isCount: 10,
    percentage: '2%',
    avgDays: '159,5',
    netStockEuro: '255.032 €',
    share: '3%',
    actualRange: '1,4',
    targetRange: '0',
    targetStock: 0,
    kpi: '0%',
    kpiTone: 'gray',
  },
  {
    interval: '181 - 360',
    intervalTone: 'gray',
    isCount: 4,
    percentage: '1%',
    avgDays: '209,3',
    netStockEuro: '134.143 €',
    share: '1%',
    actualRange: '1,3',
    targetRange: '0',
    targetStock: 0,
    kpi: '0%',
    kpiTone: 'gray',
  },
  {
    interval: '> 360',
    intervalTone: 'gray',
    isCount: 1,
    percentage: '0%',
    avgDays: '693,0',
    netStockEuro: '25.500 €',
    share: '0%',
    actualRange: '0',
    targetRange: '0',
    targetStock: 0,
    kpi: '0%',
    kpiTone: 'gray',
  },
]

const kpiToneClass: Record<InventoryRow['kpiTone'], string> = {
  green: 'bg-[#00d64f] text-black',
  lime: 'bg-[#c6ff00] text-black',
  yellow: 'bg-[#ffc928] text-black',
  gray: 'bg-[#d9d9d9] text-black',
}

const chartLabels = mockInventoryRows.map((row) => row.interval)
const chartIstValues = mockInventoryRows.map((row) => row.isCount)
const chartTargetValues = mockInventoryRows.map((row) => row.targetStock)

const chartData = {
  labels: chartLabels,
  datasets: [
    {
      type: 'bar' as const,
      label: 'IST',
      data: chartIstValues,
      order: 2,
      backgroundColor: '#d3d3d3',
      borderWidth: 0,
      barThickness: 28,
      maxBarThickness: 32,
    },
    {
      type: 'line' as const,
      label: 'Bestand-Ziel',
      data: chartTargetValues,
      order: 1,
      borderColor: '#8bc34a',
      backgroundColor: '#8bc34a',
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 5,
      pointBorderWidth: 1.5,
      pointBorderColor: '#ffffff',
      tension: 0,
    },
  ],
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        boxWidth: 18,
      },
    },
    title: {
      display: true,
      text: 'Entwicklung Bestand',
      color: '#444',
      font: {
        size: 16,
        weight: 'bold' as const,
      },
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
    },
    datalabels: {
      display: (context: { dataset: { type?: string } }) => context.dataset.type === 'line',
      formatter: (value: number) => value,
      color: '#8bc34a',
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
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  scales: {
    y: {
      beginAtZero: false,
      min: -20,
      max: 180,
      ticks: {
        stepSize: 20,
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

export function InventoryPage() {
  return (
    <div>
      <h1 className="text-[28px] -tracking-[0.03em] m-0 mb-2 text-left">GW-Kostenstelle Gesamt</h1>
      <p className="m-0 mb-6 text-sm text-text">Herkunft: CROSS</p>

      <div className="rounded-xl border border-border bg-bg shadow-custom p-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm min-w-[940px]">
          <thead>
            <tr>
              <th
                colSpan={10}
                className="p-1.5 text-center font-semibold border border-black bg-white text-black"
              >
                Entwicklung Bestand - verkaufbarer Bestand (netto)
              </th>
            </tr>
            <tr className="border-b border-border">
              <th className="text-left p-2 w-[96px]" />
              <th className="text-left p-2">IST</th>
              <th className="text-left p-2">Ant.</th>
              <th className="text-left p-2">Ø SZ Best.</th>
              <th className="text-left p-2">Bestand in €</th>
              <th className="text-left p-2">in %</th>
              <th className="text-left p-2">Ist Lager-reichweite</th>
              <th className="text-left p-2">Soll Lager-reichweite</th>
              <th className="text-left p-2">Bestand-Ziel</th>
              <th className="text-left p-2">Ziel-KPI</th>
            </tr>
          </thead>
          <tbody>
            {mockInventoryRows.map((row) => (
              <tr key={row.interval} className="border-b border-border/60">
                <td className={`p-2 text-right font-medium ${getStandzeitToneClass(row.interval)}`}>{row.interval}</td>
                <td className="p-2">{row.isCount}</td>
                <td className="p-2">{row.percentage}</td>
                <td className="p-2">{row.avgDays}</td>
                <td className="p-2">{row.netStockEuro}</td>
                <td className="p-2">{row.share}</td>
                <td className="p-2">{row.actualRange}</td>
                <td className="p-2">{row.targetRange}</td>
                <td className="p-2">{row.targetStock}</td>
                <td className="p-2">
                  <span className={`inline-flex min-w-14 justify-center rounded px-2 py-1 font-semibold ${kpiToneClass[row.kpiTone]}`}>
                    {row.kpi}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold">
              <td className="p-2 text-right">gesamt:</td>
              <td className="p-2">{mockInventoryRows.reduce((acc, row) => acc + row.isCount, 0)}</td>
              <td className="p-2" />
              <td className="p-2">53,2</td>
              <td className="p-2">{mockInventoryRows.reduce((acc, row) => acc + Number(row.netStockEuro), 0).toFixed(0)} €</td>
              <td className="p-2" />
              <td className="p-2" />
              <td className="p-2" />
              <td className="p-2">413</td>
              <td className="p-2" />
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm w-full">
        <div className="rounded-lg border border-border bg-bg px-3 py-2 shadow-custom">
          Bestandsabbau im Risiko: <strong>11</strong>
        </div>
        <div className="rounded-lg border border-border bg-bg px-3 py-2 shadow-custom">
          Ziel SZ: <strong>60</strong>
        </div>
        <div className="rounded-lg border border-border bg-bg px-3 py-2 shadow-custom">
          Fahrzeuge im Vorlauf: <strong>13</strong>
        </div>
        <div className="rounded-lg border border-border bg-bg px-3 py-2 shadow-custom flex items-center">
          Risiko in % &gt; 90 Tg: <span className="text-red-600 font-semibold">&nbsp;12,6%</span>
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
