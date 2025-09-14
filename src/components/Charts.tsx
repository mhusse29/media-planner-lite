import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import type { PlatformResult } from '../lib/math'
import { PLATFORM_LABELS } from '../lib/utils'

const PLATFORM_COLORS: Record<string, string> = {
  FACEBOOK: '#1877F2',
  INSTAGRAM: '#E1306C',
  GOOGLE_SEARCH: '#4285F4',
  GOOGLE_DISPLAY: '#34A853',
  YOUTUBE: '#FF0000',
  TIKTOK: '#69C9D0',
  LINKEDIN: '#0A66C2'
}

interface ChartsProps {
  results: PlatformResult[]
}

export function BudgetDonut({ results }: ChartsProps) {
  const data = results.map(r => ({
    name: PLATFORM_LABELS[r.platform],
    value: Math.round(r.weight * 100),
    platform: r.platform
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#1d1d1f', border: '1px solid #2b2b2e', color: '#fff' }} className="rounded-lg px-3 py-2 shadow-lg">
          <p className="text-sm font-medium">{payload[0].name}</p>
          <p className="text-xs opacity-70">{payload[0].value}% of budget</p>
        </div>
      )
    }
    return null
  }

  const renderLabel = ({ percent }: any) => {
    return `${Math.round(percent * 100)}%`
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={104}
          innerRadius={72}
          fill="#8884d8"
          dataKey="value"
          animationBegin={0}
          animationDuration={250}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={PLATFORM_COLORS[entry.platform]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function ImpressionsBars({ results }: ChartsProps) {
  const data = results.map(r => ({
    name: PLATFORM_LABELS[r.platform].split(' ')[0],
    fullName: PLATFORM_LABELS[r.platform],
    impressions: Math.round(r.impressions),
    platform: r.platform
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#1d1d1f', border: '1px solid #2b2b2e', color: '#fff' }} className="rounded-lg px-3 py-2 shadow-lg">
          <p className="text-sm font-medium">{payload[0].payload.fullName}</p>
          <p className="text-xs opacity-70 tabular-nums">{payload[0].value.toLocaleString()} impressions</p>
        </div>
      )
    }
    return null
  }

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
    return value.toString()
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="0" stroke="#333333" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: '#BDBDBD', fontSize: 12 }}
          axisLine={{ stroke: '#333333' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#BDBDBD', fontSize: 12 }}
          axisLine={{ stroke: '#333333' }}
          tickLine={false}
          tickFormatter={formatYAxis}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
        <Bar
          dataKey="impressions"
          radius={[10, 10, 0, 0]}
          animationBegin={0}
          animationDuration={250}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={PLATFORM_COLORS[entry.platform]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}