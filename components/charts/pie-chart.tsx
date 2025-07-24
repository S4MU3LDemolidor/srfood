"use client"

import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface PieChartProps {
  data: {
    normal: number
    especial: number
  }
}

const COLORS = {
  normal: "hsl(var(--primary))",
  especial: "hsl(217.2 91.2% 59.8%)",
}

export function PieChart({ data }: PieChartProps) {
  const chartData = [
    {
      name: "Normal",
      value: data.normal,
      color: COLORS.normal,
    },
    {
      name: "Especial",
      value: data.especial,
      color: COLORS.especial,
    },
  ]

  const total = data.normal + data.especial

  if (total === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <p className="text-muted-foreground">Nenhum dado disponível</p>
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
              color: "hsl(var(--card-foreground))",
            }}
          />
          <Legend
            wrapperStyle={{
              color: "hsl(var(--foreground))",
            }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  )
}
