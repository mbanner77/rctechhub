"use client"

import * as React from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartData,
  type ChartOptions,
  RadarController,
  RadialLinearScale,
  ArcElement,
  PieController,
  DoughnutController,
  PolarAreaController,
  ScatterController,
  BubbleController,
} from "chart.js"
import { Chart as ReactChart } from "react-chartjs-2"
import { cn } from "@/lib/utils"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadarController,
  RadialLinearScale,
  ArcElement,
  PieController,
  DoughnutController,
  PolarAreaController,
  ScatterController,
  BubbleController,
)

interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
  options?: ChartOptions
}

const Chart = React.forwardRef<HTMLDivElement, ChartProps>(({ className, children, options, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("", className)} {...props}>
      <ReactChart options={options}>{children}</ReactChart>
    </div>
  )
})
Chart.displayName = "Chart"

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: Record<string, { label: string; color: string }>
}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ className, children, config, ...props }, ref) => {
    const cssVars = React.useMemo(() => {
      const vars: Record<string, string> = {}
      Object.entries(config).forEach(([key, value]) => {
        vars[`--color-${key}`] = value.color
      })
      return vars
    }, [config])

    return (
      <div ref={ref} className={cn("", className)} style={cssVars as React.CSSProperties} {...props}>
        <ChartConfigContext.Provider value={config}>{children}</ChartConfigContext.Provider>
      </div>
    )
  },
)
ChartContainer.displayName = "ChartContainer"

interface ChartLegendProps extends React.HTMLAttributes<HTMLDivElement> {}

const ChartLegend = React.forwardRef<HTMLDivElement, ChartLegendProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("flex items-center justify-center gap-4", className)} {...props}>
      {children}
    </div>
  )
})
ChartLegend.displayName = "ChartLegend"

interface ChartLegendContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const ChartLegendContent = React.forwardRef<HTMLDivElement, ChartLegendContentProps>(({ className, ...props }, ref) => {
  const chart = React.useContext(ChartContext)
  const config = React.useContext(ChartConfigContext)

  if (!chart || !config) {
    return null
  }

  return (
    <div ref={ref} className={cn("flex items-center justify-center gap-4", className)} {...props}>
      {Object.entries(config).map(([key, value]) => (
        <div key={key} className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: value.color }} />
          <span className="text-sm font-medium">{value.label}</span>
        </div>
      ))}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

interface ChartTooltipProps extends React.HTMLAttributes<HTMLDivElement> {}

const ChartTooltip = React.forwardRef<HTMLDivElement, ChartTooltipProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("rounded-lg border bg-background p-2 shadow-md", className)} {...props}>
      {children}
    </div>
  )
})
ChartTooltip.displayName = "ChartTooltip"

interface ChartTooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  ({ className, ...props }, ref) => {
    const chart = React.useContext(ChartContext)
    const config = React.useContext(ChartConfigContext)

    if (!chart || !config) {
      return null
    }

    return (
      <div ref={ref} className={cn("flex flex-col gap-1", className)} {...props}>
        {Object.entries(config).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: value.color }} />
            <span className="text-sm font-medium">{value.label}</span>
          </div>
        ))}
      </div>
    )
  },
)
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartContext = React.createContext<ChartJS | null>(null)
const ChartConfigContext = React.createContext<Record<string, { label: string; color: string }> | null>(null)

interface ChartRadarProps {
  data: any[]
  indexBy: string
  children: React.ReactNode
}

const ChartRadar = ({ data, indexBy, children }: ChartRadarProps) => {
  const config = React.useContext(ChartConfigContext)

  if (!config || !data || data.length === 0) {
    return null
  }

  // Create a safe version of the chart data
  const labels = data.map((item) => item[indexBy] || "")

  const datasets = Object.entries(config).map(([key, value]) => {
    // Make sure we have valid data for each dataset
    const validData = data.map((item) => {
      const val = item[key]
      return typeof val === "number" ? val : 0
    })

    return {
      label: value.label,
      data: validData,
      backgroundColor: `${value.color}33`,
      borderColor: value.color,
      borderWidth: 2,
      pointBackgroundColor: value.color,
      pointBorderColor: "#fff",
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: value.color,
    }
  })

  const chartData: ChartData<"radar"> = {
    labels,
    datasets,
  }

  return (
    <ReactChart
      type="radar"
      data={chartData}
      options={{
        scales: {
          r: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
          },
        },
        maintainAspectRatio: false,
      }}
    />
  )
}

interface ChartRadarPolygonProps {
  dataKey: string
}

const ChartRadarPolygon = ({ dataKey }: ChartRadarPolygonProps) => {
  return null
}

interface ChartRadarLineProps {
  dataKey: string
}

const ChartRadarLine = ({ dataKey }: ChartRadarLineProps) => {
  return null
}

interface ChartRadarPointProps {
  dataKey: string
}

const ChartRadarPoint = ({ dataKey }: ChartRadarPointProps) => {
  return null
}

export {
  Chart,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  ChartRadar,
  ChartRadarPolygon,
  ChartRadarLine,
  ChartRadarPoint,
}
