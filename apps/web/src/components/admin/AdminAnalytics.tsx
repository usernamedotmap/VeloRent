import { Bike } from "@/types/bike.types";
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    LabelList
} from 'recharts';
import { BikeIcon, Calendar, Clock, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { formatPeso } from "@/lib/utils";
import { useAdminAnalytics } from "@/hooks/useAdmin";



const COLORS = ['#1D9E75', '#378ADD', '#7F77DD', '#F59E0B'];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pending', color: '#F59E0B' },
    confirmed: { label: 'Confirmed', color: '#378ADD' },
    active: { label: 'Active', color: '#1D9E75' },
    overdue: { label: 'Overdue', color: '#EF4444' },
    completed: { label: 'Completed', color: '#7F77DD' },
    cancelled: { label: 'Cancelled', color: '#9CA3AF' },
}

const formatDateLabel = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric'
    });

export const AdminAnalytics = () => {
    const [range, setRange] = useState<7 | 30>(30);
    const { data, isLoading } = useAdminAnalytics(range);
    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-12 bg-[hsl(var(--muted))] rounded-2xl animate-pulse" />
                <div className="grid lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-72 bg-[hsl(var(--muted))] rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!data) return null;

    const { dailyTrend, slotDistribution, channelBreakdown, topBikes, peakHours, rideStatusSummary } = data;

    const trendChartData = dailyTrend.map((d) => ({
        date: formatDateLabel(d.date),
        Revenue: d.revenue,
        Bookings: d.bookings
    }));

    const slotChartData = slotDistribution.map((s) => ({
        name: `${s.slotHours}hr`,
        value: s.percentage,
    }));

    const channelChartData = channelBreakdown.map((c) => ({
        period: `Week ${c.week}`,
        Online: c.online,
        'Walk-in': c.walkIn,
    }));

    const peakHoursData = peakHours.map((p) => ({
        hour: p.hour === 0 ? '12AM' : p.hour < 12 ? `${p.hour}AM` : p.hour === 12 ? '12PM' : `${p.hour - 12}PM`,
        count: p.count,
    }));

    const busiestHour = peakHours.reduce((max, p) => p.count > max.count ? p : max, peakHours[0]);
    const totalRevenue = dailyTrend.reduce((sum, d) => sum + d.revenue, 0);
    const totalBookings = dailyTrend.reduce((sum, d) => sum + d.bookings, 0);
    const topBike = topBikes[0];



    return (
        <div className="space-y-6">

            {/* range selector */}
            <div className="flex items-center justify-between bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-4">
                <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                    <Calendar size={16} />
                    <span className="font-medium">Analytics Period</span>
                </div>
                <div className="flex gap-1 bg-[hsl(var(--muted))] p-1 rounded-xl">
                    <button
                        onClick={() => setRange(7)}
                        className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${range === 7 ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm'
                            : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                            }`}>
                        Last 7 days
                    </button>
                    <button
                        onClick={() => setRange(30)}
                        className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${range === 30
                            ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm'
                            : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                            }`}>
                        Last 30 days
                    </button>
                </div>
            </div>

            {/* highigh cards ntin */}
            <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-5">
                    <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))] text-xs font-semibold mb-2">
                        <TrendingUp size={14} className="text-[hsl(var(--primary))]" />
                        Total revenue ({range}d)
                    </div>
                    <p className="text-2xl font-extrabold text-[hsl(var(--foreground))]">
                        {formatPeso(totalRevenue)}
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                        {totalBookings} bookings
                    </p>
                </div>

                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-5">
                    <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))] text-xs font-semibold mb-2">
                        <BikeIcon size={14} className="text-[hsl(var(--primary))]" />
                        Most render bike
                    </div>
                    {topBike ? (
                        <>
                            <p className="text-lg font-extrabold text-[hsl(var(--foreground))] truncate">
                                {topBike.name}
                            </p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                                #{topBike.serialNumber} · {topBike.trips} trips
                            </p>
                        </>
                    ) : (
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">No data yet</p>
                    )}
                </div>

                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-5">
                    <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))] text-xs font-semibold mb-2">
                        <Clock size={14} className="text-[hsl(var(--primary))]" />
                        Peak rental hour
                    </div>
                    <p className="text-2xl font-extrabold text-[hsl(var(--foreground))]">
                        {busiestHour && busiestHour.count > 0
                            ? (busiestHour.hour === 0 ? '12AM' : busiestHour.hour < 12 ? `${busiestHour.hour}AM` : busiestHour.hour === 12 ? '12PM' : `${busiestHour.hour - 12}PM`) : '—'}
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                        {busiestHour?.count ?? 0} bookings start this hour
                    </p>
                </div>
            </div>

            {/* charts grid */}
            <div className="grid lg:grid-cols-3 gap-6">

                {/* revneu card */}
                <div className="lg:col-span-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6">
                    <div className="mb-4">
                        <h4 className="font-extrabold text-[hsl(var(--foreground))] text-base">Daily revenue</h4>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">Revenue per day, last {range} days</p>
                    </div>

                    <div className="h-72 w-full">
                        {trendChartData.length === 0 ? (
                            <EmptyState text="No bookings in this period yet" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="revenueGradient" x1="0" y="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1D9E75" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#1D9E75" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} tickFormatter={(v) => formatPeso(v)} />
                                    <Tooltip
                                        formatter={(value: any) => [formatPeso(value), 'Revenue']}
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px' }}
                                    />
                                    <Area type="monotone" dataKey="Revenue" stroke="#1D9E75" strokeWidth={2} fillOpacity={1} fill="url(#revenueGradient)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* ride status summary */}
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6">
                    <div className="mb-6">
                        <h4 className="font-extrabold text-[hsl(var(--foreground))] text-base">Active vs completed</h4>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">Reservation status breakdown</p>
                    </div>
                    <div className="space-y-3">
                        {Object.entries(rideStatusSummary).map(([status, count]) => {
                            const total = Object.values(rideStatusSummary).reduce((a, b) => a + b, 0) || 1;
                            const pct = Math.round((count / total) * 100);
                            const config = STATUS_LABELS[status];
                            return (
                                <div key={status}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-[hsl(var(--muted-foreground))] font-medium">{config.label}</span>
                                        <span className="font-bold text-[hsl(var(--foreground))]">{count}</span>
                                    </div>
                                    <div className="h-2 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: config.color }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* bookings */}
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6">
                    <div className="mb-4">
                        <h4 className="font-extrabold text-[hsl(var(--foreground))] text-base">Daily bookings</h4>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">Number of reservations per day</p>
                    </div>
                    <div className="h-64 w-full">
                        {trendChartData.length === 0 ? (
                            <EmptyState text="No boookings yet" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} allowDecimals={false} />
                                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px' }} />
                                    <Bar dataKey="Bookings" fill="#378ADD" radius={[6, 6, 0, 0]} maxBarSize={36} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* slot prefrences */}
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6">
                    <div className="mb-4">
                        <h4 className="font-extrabold text-[hsl(var(--foreground))] text-base">Slot preference</h4>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">Booking duration popularity</p>
                    </div>
                    <div className="h-64 flex flex-col justify-between items-center">
                        {slotChartData.length === 0 ? (
                            <EmptyState text="No bookings yet" />
                        ) : (
                            <>
                                <div className="h-48 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={slotChartData} innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                                                {slotChartData.map((_, idx) => (
                                                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: any) => `${value}%`} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex gap-4 justify-center text-xs flex-wrap">
                                    {slotChartData.map((item, idx) => (
                                        <div key={item.name} className="flex items-center gap-1.5">
                                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                            <span className="text-[hsl(var(--muted-foreground))] font-medium">{item.name} ({item.value}%)</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Most rented bikes */}
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6">
                    <div className="mb-4">
                        <h4 className="font-extrabold text-[hsl(var(--foreground))] text-base">Most rented bikes</h4>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">Top 5 bikes by trip count</p>
                    </div>
                    {topBikes.length === 0 ? (
                        <EmptyState text="No completed trips yet" />
                    ) : (
                        <div className="space-y-3">
                            {topBikes.map((bike, idx) => {
                                const maxTrips = topBikes[0].trips || 1;
                                const pct = Math.round((bike.trips / maxTrips) * 100);
                                return (
                                    <div key={bike.bikeId}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-medium text-[hsl(var(--foreground))] truncate">
                                                {idx + 1}. {bike.name} <span className="text-[hsl(var(--muted-foreground))]">#{bike.serialNumber}</span>
                                            </span>
                                            <span className="font-bold text-[hsl(var(--foreground))] shrink-0 ml-2">{bike.trips} trips</span>
                                        </div>
                                        <div className="h-2 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-[hsl(var(--primary))] transition-all"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Peak hours */}
                <div className="lg:col-span-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6">
                    <div className="mb-4">
                        <h4 className="font-extrabold text-[hsl(var(--foreground))] text-base">Peak rental hours</h4>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">When customers schedule their rides (by hour of day)</p>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={peakHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} interval={1} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} allowDecimals={false} />
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px' }} />
                                <Bar dataKey="count" name="Bookings" fill="#7F77DD" radius={[4, 4, 0, 0]} maxBarSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Channel breakdown */}
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6">
                    <div className="mb-4">
                        <h4 className="font-extrabold text-[hsl(var(--foreground))] text-base">Online vs walk-in</h4>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">Bookings per week by channel</p>
                    </div>
                    <div className="h-64 w-full">
                        {channelChartData.length === 0 ? (
                            <EmptyState text="No bookings yet" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={channelChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} allowDecimals={false} />
                                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px' }} />
                                    <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                                    <Bar dataKey="Online" stackId="channel" fill="#1D9E75" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Walk-in" stackId="channel" fill="#B4B2A9" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>


            </div>
        </div>
    )
}

const EmptyState = ({ text }: { text: string }) => (
    <div className="h-full flex flex-col items-center justiyf-center text-center">
        <div className="text-3xl mb-2">📊</div>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{text}</p>
    </div>
)

