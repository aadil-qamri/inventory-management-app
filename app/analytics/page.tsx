import { getInventory } from "@/lib/queries" // Adjust path if your fetcher is somewhere else
import ProfitLossChart from "@/components/profit-loss-chart"
import Link from "next/link"
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign } from "lucide-react"

export default async function AnalyticsPage() {
  const inventoryData = await getInventory();

  // Calculate High-Level Stats
  const totalRevenue = inventoryData.reduce((acc, item) => acc + (item.price * item.stock), 0);
  const totalCost = inventoryData.reduce((acc, item) => acc + (item.cost * item.stock), 0);
  const netProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0.0";

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header & Back Button */}
      <div className="flex items-center mb-8">
        <Link 
          href="/" 
          className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors text-gray-500 dark:text-gray-400"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Financial Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Detailed profit and loss breakdown.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-border rounded-xl shadow-sm">
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-2">
            <DollarSign className="h-4 w-4" />
            <h3 className="text-sm font-medium">Total Cost</h3>
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-border rounded-xl shadow-sm">
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <h3 className="text-sm font-medium">Net Profit</h3>
          </div>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            ${netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-border rounded-xl shadow-sm">
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-2">
            <TrendingDown className="h-4 w-4" />
            <h3 className="text-sm font-medium">Avg Profit Margin</h3>
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {profitMargin}%
          </p>
        </div>
      </div>

      {/* The Chart */}
      <ProfitLossChart data={inventoryData} />
    </div>
  )
}