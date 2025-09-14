import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { colorFor } from '../lib/palette';

// Map platform codes to display names
const PLATFORM_NAMES: Record<string, string> = {
  FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram',
  GOOGLE_SEARCH: 'Google Search',
  GOOGLE_DISPLAY: 'Google Display',
  YOUTUBE: 'YouTube',
  TIKTOK: 'TikTok',
  LINKEDIN: 'LinkedIn',
};

// Format helpers
const fmtInt = (v: number) => Math.round(v).toLocaleString();

const DONUT_HEIGHT = 360;

export function BudgetDonutPro({
  data, centerValue, centerLabel,
}: {
  data: { name: string; value: number; platform: string }[];
  centerValue: string;
  centerLabel: string;
}) {
  if (!data?.length) return <div className="empty">Select platforms to see budget split</div>;

  return (
    <div className="chart-card">
      <div className="apex-wrap">
        <ResponsiveContainer width="100%" height={DONUT_HEIGHT}>
          <PieChart>
            <Pie 
              dataKey="value" 
              data={data} 
              innerRadius={70} 
              outerRadius={110} 
              paddingAngle={2}
              stroke="#1a1a1c" 
              strokeWidth={1} 
              labelLine={false}
              label={(e: any) => {
                const pct = e.percent ? Math.round(e.percent * 100) : 0;
                // Only show % labels for slices >=8% to avoid overlapping, keep inside
                return pct >= 8 ? `${pct}%` : '';
              }}
              style={{ fontSize: '12px', fontWeight: 600 }}
            >
              {data.map((e, i) => <Cell key={i} fill={colorFor(PLATFORM_NAMES[e.platform] || e.name)} />)}
            </Pie>
            <Tooltip 
              formatter={(value: any, name: any) => [
                `${Math.round(value)}%`,
                name
              ]}
            />
            <Legend 
              wrapperStyle={{ 
                color: '#BDBDBD',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '6px 14px',
                alignItems: 'center',
                justifyItems: 'start',
                padding: '12px 6px 0',
                fontSize: '12px'
              }}
              iconType="rect"
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center content positioned over chart */}
        <div style={{ 
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center', 
          pointerEvents: 'none',
          zIndex: 1
        }}>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 800, 
            color: '#FFFFFF',
            textShadow: '0 2px 4px rgba(0,0,0,0.8)'
          }}>
            {centerValue}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#BDBDBD',
            marginTop: '4px',
            textShadow: '0 1px 2px rgba(0,0,0,0.8)'
          }}>
            {centerLabel}
          </div>
        </div>
      </div>
    </div>
  );
}

const BAR_HEIGHT = 380;

export function ImpressionsBarsPro({
  data, title = 'IMPRESSIONS',
}: {
  data: { name: string; value: number; platform: string }[];
  title?: string;
}) {
  if (!data?.length) return <div className="empty">No platforms selected</div>;
  return (
    <div className="chart-card">
      <div className="eyebrow" style={{ marginBottom: '8px', fontSize: '11px', fontWeight: 700, color: '#9E9E9E', textTransform: 'uppercase' }}>
        {title}
      </div>
      <div className="apex-wrap apex-wrap--bar">
        <ResponsiveContainer width="100%" height={BAR_HEIGHT}>
          <BarChart 
            data={data} 
            barCategoryGap={20} 
            margin={{ top: 10, right: 6, left: 6, bottom: 12 }}
          >
            <CartesianGrid stroke="#333333" strokeDasharray="4 4" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#BDBDBD" 
              tickMargin={8}
              style={{ fontSize: '12px' }}
              axisLine={false}
            />
            <YAxis 
              stroke="#BDBDBD" 
              tickMargin={8}
              tickFormatter={(value) => Math.round(value).toLocaleString()}
              style={{ fontSize: '12px' }}
              axisLine={false}
            />
            <Tooltip 
              cursor={false}
              formatter={(value: any, name: any) => [
                `Impressions: ${fmtInt(value)}`,
                name
              ]}
            />
            <Bar 
              dataKey="value" 
              radius={[8, 8, 0, 0]}
            >
              {data.map((e, i) => <Cell key={i} fill={colorFor(PLATFORM_NAMES[e.platform] || e.name)} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
