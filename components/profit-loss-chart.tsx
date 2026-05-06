"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts'
import { BarChart3, PieChart as PieChartIcon } from "lucide-react"

interface ChartProps {
    data: any[];
}

// A palette of premium, UI-friendly colors for the pie slices
const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#f97316', '#10b981', '#f43f5e', '#06b6d4'];

export default function InventoryChart({ data }: ChartProps) {
    const { theme } = useTheme();
    // State to track which chart is active
    const [activeChart, setActiveChart] = useState<'bar' | 'pie'>('bar');

    // 1. Process data into Category Totals


    const chartData = data.reduce((acc: any[], item) => {
        const existingCategory = acc.find(c => c.name === item.category);
        const itemValue = item.price * item.stock;

        if (existingCategory) {
            existingCategory.value += itemValue;
        } else {
            acc.push({ name: item.category || "Uncategorized", value: itemValue });
        }
        return acc;
    }, []);
    const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);

    // 2. Theme-aware colors
    const gridColor = theme === 'dark' ? '#333333' : '#e5e7eb';
    const textColor = theme === 'dark' ? '#9ca3af' : '#6b7280';
    const barColor = theme === 'dark' ? '#ffffff' : '#171717';

    // Shared Tooltip styling
    const tooltipStyle = {
        backgroundColor: theme === 'dark' ? '#171717' : '#ffffff',
        borderColor: theme === 'dark' ? '#333333' : '#e5e7eb',
        color: theme === 'dark' ? '#ffffff' : '#000000',
        borderRadius: '8px'
    };

    return (
        <div className="w-full h-[350px] mt-8 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-border rounded-xl p-6 shadow-sm flex flex-col">

            {/* Header with Toggle Buttons */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    Value by Category
                </h3>

                <div className="flex bg-gray-100 dark:bg-neutral-800 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveChart('bar')}
                        className={`p-1.5 rounded-md flex hover:cursor-pointer items-center transition-all ${activeChart === 'bar'
                            ? 'bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-white'
                            : 'text-gray-500 hover:text-neutral-900 dark:hover:text-white'
                            }`}
                    >
                        <BarChart3 className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setActiveChart('pie')}
                        className={`p-1.5 rounded-md hover:cursor-pointer flex items-center transition-all ${activeChart === 'pie'
                            ? 'bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-white'
                            : 'text-gray-500 hover:text-neutral-900 dark:hover:text-white'
                            }`}
                    >
                        <PieChartIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Chart Area */}
            <div className="flex-1 min-h-0">
                <ResponsiveContainer className={"w-full h-full"}>
                    {activeChart === 'bar' ? (
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                            <XAxis dataKey="name" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis
                                stroke={textColor}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                cursor={{ fill: theme === 'dark' ? '#262626' : '#f3f4f6' }}
                                contentStyle={tooltipStyle}
                                formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Total Value']}
                            />
                            <Bar dataKey="value" fill={barColor} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    ) : (
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                dataKey="value"
                                stroke="none"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={tooltipStyle}
                                formatter={(value: any) => {
                                    const numValue = Number(value);
                                    // Calculate the percentage
                                    const percent = ((numValue / totalValue) * 100).toFixed(1);
                                    // Return the formatted string: "$150.00 (25.5%)"
                                    return [` ${percent}%`, 'Contribution'];
                                }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="square"
                                wrapperStyle={{ paddingTop: "20px" }} // 👈 Add this line!
                            />
                        </PieChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
}