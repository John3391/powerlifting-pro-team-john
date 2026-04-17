
"use client";

import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Legend, Bar, BarChart, ComposedChart
} from 'recharts';
import { AthleteData } from '@/lib/types';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface PerformanceChartsProps {
  athleteData: AthleteData;
  type?: 'performance' | 'volume-intensity' | 'fatigue';
}

export function PerformanceCharts({ athleteData, type = 'performance' }: PerformanceChartsProps) {
  const getChartData = () => {
    const { numWeeks, maxes, chartPeriod } = athleteData;
    const data = [];
    const count = chartPeriod === 'week' ? numWeeks : chartPeriod === 'month' ? Math.ceil(numWeeks / 4) : 1;
    const labelPrefix = chartPeriod === 'week' ? 'Sem. ' : chartPeriod === 'month' ? 'Mês ' : 'Ano ';

    for (let i = 0; i < count; i++) {
      const progressFactor = 0.85 + (i / count) * 0.15;
      const fatigueFactor = 7 + Math.sin(i) * 1.5;
      const intensityFactor = 65 + (i * 2);

      const squatVal = Math.round(maxes.squat * progressFactor);
      const benchVal = Math.round(maxes.bench * progressFactor);
      const deadliftVal = Math.round(maxes.deadlift * progressFactor);
      const avgSbd = Math.round((squatVal + benchVal + deadliftVal) / 3);

      data.push({
        name: `${labelPrefix}${i + 1}`,
        squat: squatVal,
        bench: benchVal,
        deadlift: deadliftVal,
        avgSbd: avgSbd,
        volume: Math.round(15000 + i * 1200),
        intensity: Math.min(95, intensityFactor),
        rpe: parseFloat(fatigueFactor.toFixed(1))
      });
    }
    return data;
  };

  const chartData = getChartData();

  if (type === 'volume-intensity') {
    return (
      <div className="w-full h-full min-h-[300px]">
        <ChartContainer
          config={{
            volume: { label: "Volume (Tonelagem)", color: "hsl(var(--chart-4))" },
            intensity: { label: "Intensidade Relativa (%)", color: "hsl(var(--chart-2))" }
          }}
        >
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
            <XAxis dataKey="name" stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis yAxisId="right" orientation="right" stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar yAxisId="left" dataKey="volume" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} opacity={0.6} />
            <Line yAxisId="right" type="monotone" dataKey="intensity" stroke="hsl(var(--chart-2))" strokeWidth={3} dot={{ r: 4 }} />
          </ComposedChart>
        </ChartContainer>
      </div>
    );
  }

  if (type === 'fatigue') {
    return (
      <div className="w-full h-full min-h-[300px]">
        <ChartContainer
          config={{
            rpe: { label: "RPE Médio", color: "hsl(var(--chart-5))" }
          }}
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRpe" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-5))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--chart-5))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
            <XAxis dataKey="name" stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis domain={[5, 10]} stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area type="monotone" dataKey="rpe" stroke="hsl(var(--chart-5))" fillOpacity={1} fill="url(#colorRpe)" strokeWidth={3} />
          </AreaChart>
        </ChartContainer>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[300px]">
      <ChartContainer
        config={{
          squat: { label: "Squat", color: "hsl(var(--chart-1))" },
          bench: { label: "Bench", color: "hsl(var(--chart-2))" },
          deadlift: { label: "Deadlift", color: "hsl(var(--chart-4))" },
          avgSbd: { label: "Média SBD", color: "#ffffff" }
        }}
      >
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorSquat" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorBench" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
          <XAxis dataKey="name" stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend iconType="circle" />
          <Area type="monotone" dataKey="squat" stroke="hsl(var(--chart-1))" fillOpacity={1} fill="url(#colorSquat)" strokeWidth={3} />
          <Area type="monotone" dataKey="bench" stroke="hsl(var(--chart-2))" fillOpacity={1} fill="url(#colorBench)" strokeWidth={3} />
          <Line type="monotone" dataKey="deadlift" stroke="hsl(var(--chart-4))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--chart-4))" }} />
          <Line type="monotone" dataKey="avgSbd" stroke="#ffffff" strokeWidth={2} strokeDasharray="5 5" dot={false} />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
