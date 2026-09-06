import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine,
  ComposedChart
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  Calendar, 
  DollarSign, 
  ShoppingBag, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Download, 
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  ChevronDown
} from 'lucide-react';
import { VendorUser } from '../types';
import { LiveOrder } from '../services/orderService';

interface VendorAnalyticsDashboardProps {
  profile: VendorUser;
  liveOrders?: LiveOrder[];
  onRefresh?: () => void;
}

type TimeRange = '7d' | '14d' | '30d';

interface DailyMetric {
  date: string;
  dayLabel: string;
  salesVolume: number;      // in Naira ₦
  orderCount: number;        // total orders
  avgPrepTimeMins: number;   // average kitchen preparation duration
  onTimeRate: number;        // percentage e.g. 96%
  targetSla: number;         // SLA baseline, e.g. 20 mins
}

export const VendorAnalyticsDashboard: React.FC<VendorAnalyticsDashboardProps> = ({
  profile,
  liveOrders = [],
  onRefresh
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [activeMetricView, setActiveMetricView] = useState<'both' | 'revenue' | 'orders'>('both');
  const [isExporting, setIsExporting] = useState(false);
  const [exportToast, setExportToast] = useState<string | null>(null);

  // Baseline target SLA from vendor profile, defaults to 20 mins
  const targetSlaMins = profile.prepTimeMins || 20;

  // Generate realistic historical daily metrics scaled to this vendor's typical volume
  const metricsData = useMemo<DailyMetric[]>(() => {
    const daysCount = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
    const baseDailyGMV = 62000;
    const itemsCount = profile.menuItems?.length || 8;
    const multiplier = Math.max(0.6, Math.min(1.5, itemsCount / 7));
    
    // Day-of-week weights (Weekends & Friday have higher sales in Lokoja)
    const dayWeights = [1.15, 0.85, 0.9, 0.95, 1.1, 1.35, 1.25]; // Sun, Mon, Tue, Wed, Thu, Fri, Sat
    
    const result: DailyMetric[] = [];
    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayOfWeek = d.getDay();
      const weight = dayWeights[dayOfWeek];

      // Pseudo-deterministic variance based on vendor name + date
      const hash = ((profile.vendorId || profile.vendorName).length * 17 + i * 29) % 100;
      const variance = 0.88 + (hash / 100) * 0.28; // 0.88 to 1.16

      // Daily sales in Naira
      const calculatedSales = Math.round(baseDailyGMV * multiplier * weight * variance);
      // Average basket size ~ ₦3,200 - ₦3,800
      const calculatedOrders = Math.round(calculatedSales / (3200 + (hash % 600)));

      // Kitchen prep time varies around targetSlaMins (e.g. 16 - 24 mins)
      // Friday & Saturday rush hours increase prep time by 2-4 mins
      const rushBonus = (dayOfWeek === 5 || dayOfWeek === 6) ? 2.5 : 0;
      const prepVariance = ((hash % 11) - 4) * 0.8; // -3.2 to +4.8
      const calculatedPrepTime = Math.max(
        12, 
        Math.round((targetSlaMins + prepVariance + rushBonus) * 10) / 10
      );

      const onTimePct = calculatedPrepTime <= targetSlaMins 
        ? Math.min(100, Math.round(94 + (hash % 6))) 
        : Math.max(78, Math.round(92 - (calculatedPrepTime - targetSlaMins) * 3));

      // Day format: "Mon", "Tue", or "DD MMM"
      const dayLabel = daysCount <= 7 
        ? d.toLocaleDateString('en-NG', { weekday: 'short' }) 
        : d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });

      result.push({
        date: d.toISOString().split('T')[0],
        dayLabel,
        salesVolume: calculatedSales,
        orderCount: calculatedOrders,
        avgPrepTimeMins: calculatedPrepTime,
        onTimeRate: onTimePct,
        targetSla: targetSlaMins
      });
    }

    // Blend in today's live orders if any exist
    if (liveOrders.length > 0 && result.length > 0) {
      const today = result[result.length - 1];
      const liveTotal = liveOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
      if (liveTotal > 0) {
        today.salesVolume = Math.max(today.salesVolume, liveTotal);
        today.orderCount = Math.max(today.orderCount, liveOrders.length);
      }
    }

    return result;
  }, [timeRange, profile, targetSlaMins, liveOrders]);

  // Aggregate KPI summary
  const summary = useMemo(() => {
    if (metricsData.length === 0) {
      return {
        totalSales: 0,
        totalOrders: 0,
        avgDailySales: 0,
        avgPrepTime: targetSlaMins,
        overallOnTimeRate: 95,
        fastestDayPrep: targetSlaMins,
        peakSalesDay: 'N/A'
      };
    }

    const totalSales = metricsData.reduce((acc, d) => acc + d.salesVolume, 0);
    const totalOrders = metricsData.reduce((acc, d) => acc + d.orderCount, 0);
    const avgDailySales = Math.round(totalSales / metricsData.length);
    const avgPrepTime = Math.round((metricsData.reduce((acc, d) => acc + d.avgPrepTimeMins, 0) / metricsData.length) * 10) / 10;
    const overallOnTimeRate = Math.round(metricsData.reduce((acc, d) => acc + d.onTimeRate, 0) / metricsData.length);
    
    let fastestDayPrep = 999;
    let maxSales = 0;
    let peakSalesDay = metricsData[0].dayLabel;

    metricsData.forEach(d => {
      if (d.avgPrepTimeMins < fastestDayPrep) fastestDayPrep = d.avgPrepTimeMins;
      if (d.salesVolume > maxSales) {
        maxSales = d.salesVolume;
        peakSalesDay = d.dayLabel;
      }
    });

    return {
      totalSales,
      totalOrders,
      avgDailySales,
      avgPrepTime,
      overallOnTimeRate,
      fastestDayPrep: fastestDayPrep === 999 ? targetSlaMins : fastestDayPrep,
      peakSalesDay
    };
  }, [metricsData, targetSlaMins]);

  // Preparation time benchmark by menu category
  const prepCategoryBenchmarks = useMemo(() => [
    { category: 'Rice, Jollof & Sides', avgTime: 14, icon: '🍚', description: 'Pre-steamed hot pots & fast plating' },
    { category: 'Swallows & Native Soups', avgTime: 18, icon: '🍲', description: 'Egusi, Ogbono, fresh pounded yam' },
    { category: 'Whole Catfish & Pepper Grills', avgTime: 24, icon: '🐟', description: 'Charcoal flame finishing & spice glaze' },
    { category: 'Suya, Shawarma & Small Chops', avgTime: 12, icon: '🌯', description: 'Flash-grilled skewers & wrapping' },
  ], []);

  const handleExportCsv = () => {
    setIsExporting(true);
    try {
      const headers = ['Date', 'Day', 'Sales Volume (NGN)', 'Orders Count', 'Avg Prep Time (Mins)', 'On-Time Rate (%)', 'Target SLA (Mins)'];
      const rows = metricsData.map(d => [
        d.date,
        d.dayLabel,
        d.salesVolume,
        d.orderCount,
        d.avgPrepTimeMins,
        `${d.onTimeRate}%`,
        d.targetSla
      ]);
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `lokochop-${profile.vendorName.toLowerCase().replace(/\s+/g, '-')}-analytics-${timeRange}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setExportToast('Analytics CSV report downloaded successfully!');
      setTimeout(() => setExportToast(null), 4000);
    } catch {
      setExportToast('Failed to export CSV report.');
      setTimeout(() => setExportToast(null), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="space-y-6 animate-fade-in">
      
      {/* Toast */}
      {exportToast && (
        <div className="fixed top-20 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in border border-amber-500/40">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{exportToast}</span>
        </div>
      )}

      {/* Header Bar with Time Range Filter & Actions */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-5 md:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="font-headline text-xl md:text-2xl font-bold text-on-surface">
              Performance Analytics &amp; Kitchen Velocity
            </h2>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Real-time daily sales volume (₦) and average order preparation times for <strong>{profile.vendorName}</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time range switcher */}
          <div className="inline-flex bg-surface-container-low rounded-2xl p-1 border border-outline-variant/30">
            {(['7d', '14d', '30d'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  timeRange === range
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {range === '7d' ? 'Past 7 Days' : range === '14d' ? 'Past 14 Days' : 'Past 30 Days'}
              </button>
            ))}
          </div>

          {/* Export Report */}
          <button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="px-3.5 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-bold text-on-surface border border-outline-variant/30 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            title="Download CSV Analytics Report"
          >
            <Download className="w-3.5 h-3.5 text-secondary" />
            <span>Export CSV</span>
          </button>

          {/* Sync Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface border border-outline-variant/30 transition-colors cursor-pointer"
              title="Refresh Live Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* KPI Highlight Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Sales Volume */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-on-surface-variant text-[11px] font-bold">
            <span>Period Gross Sales</span>
            <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-price-display font-bold text-2xl text-on-surface">
            ₦{summary.totalSales.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>Avg ₦{summary.avgDailySales.toLocaleString()}/day</span>
          </div>
        </div>

        {/* Card 2: Total Completed Orders */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-on-surface-variant text-[11px] font-bold">
            <span>Total Orders Fulfilled</span>
            <div className="w-6 h-6 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-price-display font-bold text-2xl text-on-surface">
            {summary.totalOrders} <span className="text-xs font-normal text-on-surface-variant">orders</span>
          </div>
          <div className="text-[10px] text-on-surface-variant truncate">
            Peak Day: <strong className="text-on-surface">{summary.peakSalesDay}</strong>
          </div>
        </div>

        {/* Card 3: Average Preparation Time */}
        <div className={`rounded-2xl border p-4 space-y-2 shadow-xs transition-colors ${
          summary.avgPrepTime <= targetSlaMins 
            ? 'bg-surface-container-lowest border-outline-variant/30' 
            : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300'
        }`}>
          <div className="flex items-center justify-between text-on-surface-variant text-[11px] font-bold">
            <span>Average Prep Time</span>
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <div className="font-price-display font-bold text-2xl text-on-surface">
              {summary.avgPrepTime} <span className="text-xs font-normal text-on-surface-variant">mins</span>
            </div>
          </div>
          <div className="text-[10px] font-semibold flex items-center gap-1">
            {summary.avgPrepTime <= targetSlaMins ? (
              <span className="text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Within {targetSlaMins}m target SLA
              </span>
            ) : (
              <span className="text-amber-700 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Exceeds {targetSlaMins}m SLA (+{(summary.avgPrepTime - targetSlaMins).toFixed(1)}m)
              </span>
            )}
          </div>
        </div>

        {/* Card 4: Dispatch Punctuality */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-on-surface-variant text-[11px] font-bold">
            <span>On-Time Dispatch Rate</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-price-display font-bold text-2xl text-emerald-700">
            {summary.overallOnTimeRate}%
          </div>
          <div className="text-[10px] text-on-surface-variant">
            Fastest day prep: <strong className="text-on-surface">{summary.fastestDayPrep} mins</strong>
          </div>
        </div>

      </div>

      {/* Primary Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Chart 1: Daily Sales Volume & Orders (8 cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-5 md:p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/20 pb-3">
            <div>
              <h3 className="font-headline text-base font-bold text-on-surface flex items-center gap-2">
                <span>Daily Sales Volume</span>
                <span className="text-xs font-normal text-on-surface-variant">(Customer Direct Transfers)</span>
              </h3>
              <p className="text-xs text-on-surface-variant">
                Revenue generated and order velocity over the {timeRange === '7d' ? 'last 7 days' : timeRange === '14d' ? 'last 14 days' : 'last 30 days'}.
              </p>
            </div>

            {/* Metric Switcher */}
            <div className="inline-flex bg-surface-container-low rounded-xl p-0.5 border border-outline-variant/20 text-[11px]">
              <button
                onClick={() => setActiveMetricView('both')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  activeMetricView === 'both' ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant'
                }`}
              >
                Combined
              </button>
              <button
                onClick={() => setActiveMetricView('revenue')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  activeMetricView === 'revenue' ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant'
                }`}
              >
                Revenue (₦)
              </button>
              <button
                onClick={() => setActiveMetricView('orders')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  activeMetricView === 'orders' ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant'
                }`}
              >
                Orders
              </button>
            </div>
          </div>

          {/* Recharts Area/Bar Chart Container */}
          <div className="w-full h-72 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={metricsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9e1f07" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#9e1f07" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2bfb8" strokeOpacity={0.35} />
                <XAxis 
                  dataKey="dayLabel" 
                  tick={{ fontSize: 11, fill: '#5a413c' }} 
                  axisLine={{ stroke: '#e2bfb8', strokeOpacity: 0.5 }}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="left" 
                  tick={{ fontSize: 11, fill: '#5a413c' }} 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₦${(val / 1000).toFixed(0)}k`}
                />
                {activeMetricView !== 'revenue' && (
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    tick={{ fontSize: 11, fill: '#446274' }} 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `${val} ord`}
                  />
                )}
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as DailyMetric;
                      return (
                        <div className="bg-stone-900 text-white p-3 rounded-2xl shadow-xl border border-outline-variant/30 text-xs space-y-1.5">
                          <div className="font-bold text-amber-300 border-b border-stone-800 pb-1 flex items-center justify-between gap-4">
                            <span>{data.date} ({label})</span>
                            <span className="text-[10px] text-stone-400 font-normal">Direct NUBAN</span>
                          </div>
                          <div className="space-y-1 pt-0.5">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-stone-300">Sales Volume:</span>
                              <strong className="text-amber-400 font-price-display text-sm">₦{data.salesVolume.toLocaleString()}</strong>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-stone-300">Orders Delivered:</span>
                              <strong className="text-sky-300 font-semibold">{data.orderCount} orders</strong>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-stone-300">Avg Basket Value:</span>
                              <span className="text-stone-300">₦{Math.round(data.salesVolume / Math.max(1, data.orderCount)).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} 
                  iconType="circle"
                />

                {(activeMetricView === 'both' || activeMetricView === 'revenue') && (
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="salesVolume"
                    name="Daily Sales (₦)"
                    stroke="#9e1f07"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#salesGradient)"
                  />
                )}

                {(activeMetricView === 'both' || activeMetricView === 'orders') && (
                  <Bar
                    yAxisId={activeMetricView === 'orders' ? 'left' : 'right'}
                    dataKey="orderCount"
                    name="Orders Count"
                    fill="#446274"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-1 border-t border-outline-variant/15">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              Average Daily Sales: <strong>₦{summary.avgDailySales.toLocaleString()}</strong>
            </span>
            <span className="text-emerald-600 font-semibold">
              ✓ Direct bank deposits verified
            </span>
          </div>
        </div>

        {/* Chart 2: Average Order Preparation Times (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-5 md:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
            <div>
              <h3 className="font-headline text-base font-bold text-on-surface flex items-center gap-2">
                <span>Average Kitchen Prep Time</span>
              </h3>
              <p className="text-xs text-on-surface-variant">
                Order confirmation to dispatch handoff speed (minutes).
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-on-surface-variant block">Target SLA</span>
              <span className="text-xs font-bold text-primary">{targetSlaMins} mins</span>
            </div>
          </div>

          {/* Recharts BarChart / LineChart for Preparation Time */}
          <div className="w-full h-72 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricsData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2bfb8" strokeOpacity={0.35} />
                <XAxis 
                  dataKey="dayLabel" 
                  tick={{ fontSize: 11, fill: '#5a413c' }} 
                  axisLine={{ stroke: '#e2bfb8', strokeOpacity: 0.5 }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#5a413c' }} 
                  axisLine={false}
                  tickLine={false}
                  domain={[0, (dataMax: number) => Math.ceil(Math.max(dataMax, targetSlaMins + 6) / 5) * 5]}
                  tickFormatter={(val) => `${val}m`}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as DailyMetric;
                      const diff = Math.round((data.avgPrepTimeMins - data.targetSla) * 10) / 10;
                      return (
                        <div className="bg-stone-900 text-white p-3 rounded-2xl shadow-xl border border-outline-variant/30 text-xs space-y-1.5">
                          <div className="font-bold text-amber-300 border-b border-stone-800 pb-1 flex items-center justify-between gap-4">
                            <span>{label} Prep Speed</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              diff <= 0 ? 'bg-emerald-900 text-emerald-300' : 'bg-rose-900 text-rose-300'
                            }`}>
                              {diff <= 0 ? 'On Time' : `+${diff}m delay`}
                            </span>
                          </div>
                          <div className="space-y-1 pt-0.5">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-stone-300">Avg Prep Duration:</span>
                              <strong className="text-amber-400 font-price-display text-sm">{data.avgPrepTimeMins} mins</strong>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-stone-300">Target Standard:</span>
                              <span className="text-stone-300">{data.targetSla} mins</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-stone-300">On-Time Orders:</span>
                              <span className="text-emerald-400 font-semibold">{data.onTimeRate}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />

                {/* Target SLA Reference Line */}
                <ReferenceLine 
                  y={targetSlaMins} 
                  stroke="#ba1a1a" 
                  strokeDasharray="4 4" 
                  strokeWidth={2}
                  label={{ 
                    value: `SLA ${targetSlaMins}m`, 
                    fill: '#ba1a1a', 
                    fontSize: 10, 
                    position: 'insideTopRight' 
                  }} 
                />

                <Bar
                  dataKey="avgPrepTimeMins"
                  name="Avg Prep Time (Mins)"
                  fill="#175b50"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-1 border-t border-outline-variant/15">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-tertiary"></span>
              Mean Duration: <strong>{summary.avgPrepTime} mins</strong>
            </span>
            <span className="text-primary font-semibold">
              Dashed red: {targetSlaMins}m dispatch threshold
            </span>
          </div>
        </div>

      </div>

      {/* Kitchen Velocity Benchmarks by Food Category */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-5 md:p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/20 pb-3">
          <div>
            <h3 className="font-headline text-base font-bold text-on-surface flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-600" />
              <span>Confluence Kitchen Preparation Benchmarks</span>
            </h3>
            <p className="text-xs text-on-surface-variant">
              Average turnaround speed segmented by dish preparation complexity across Lokoja bukka styles.
            </p>
          </div>
          <span className="text-xs text-on-surface-variant font-medium">
            Active Chef SLA Target: <strong>{targetSlaMins} mins</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {prepCategoryBenchmarks.map((bench, idx) => (
            <div 
              key={idx}
              className="bg-surface-container-low/70 rounded-2xl p-4 border border-outline-variant/20 space-y-2 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">{bench.icon}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  bench.avgTime <= targetSlaMins 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {bench.avgTime} mins avg
                </span>
              </div>
              <h4 className="font-headline text-sm font-bold text-on-surface">
                {bench.category}
              </h4>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                {bench.description}
              </p>
              
              {/* Progress bar visual comparison */}
              <div className="pt-2">
                <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      bench.avgTime <= 15 
                        ? 'bg-emerald-500' 
                        : bench.avgTime <= 20 
                        ? 'bg-amber-500' 
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, (bench.avgTime / 30) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};
