
'use client';

import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface TradingChartProps {
    data: { time: string; price: number }[];
}

const chartConfig = {
    price: {
        label: "Price",
        color: "hsl(var(--primary))",
    },
};

export function TradingChart({ data }: TradingChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                No chart data available.
            </div>
        );
    }
    
    return (
        <div className="h-[400px]">
            <ChartContainer config={chartConfig} className="w-full h-full">
                <LineChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 10,
                        left: -20,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="time"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => {
                            const date = new Date(value);
                            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        }}
                    />
                     <YAxis 
                        tickLine={false} 
                        axisLine={false} 
                        tickMargin={8}
                        domain={['dataMin - 0.001', 'dataMax + 0.001']}
                        tickFormatter={(value) => `$${Number(value).toFixed(3)}`}
                    />
                    <Tooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="line" />}
                    />
                    <Line
                        dataKey="price"
                        type="monotone"
                        stroke="var(--color-price)"
                        strokeWidth={2}
                        dot={false}
                    />
                </LineChart>
            </ChartContainer>
        </div>
    );
}


    