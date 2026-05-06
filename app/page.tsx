import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { columns } from "@/app/payments/columns"
import { DataTable } from "@/app/payments/data-table"
import { AddItemDialog } from "@/components/add-item-dialog"
import { getInventory } from "@/lib/queries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, CircleDollarSign, AlertTriangle } from "lucide-react"
import ProfileMenu from "@/components/profile-menu"


export default async function Manager() {
  // 1. Check Authentication on the server securely
  const session = await getServerSession();
  if (!session?.user) redirect("/login");

  // 2. Fetch the data directly from MongoDB (No API route needed!)
  const inventoryData = await getInventory();

  const totalUniqueItems = inventoryData.length;

  const totalInventoryValue = inventoryData.reduce((total, item) => {
    return total + (item.price * item.stock);
  }, 0);

  const lowStockAlerts = inventoryData.filter((item) => item.stock <= 10).length;

  // 3. Render the UI
  return (
    <div className="w-full px-4 md:px-8 mx-auto py-10">
      <ProfileMenu />
      {/* Header Row */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Welcome back. Here is an overview of your current inventory.
          </p>
        </div>
        <AddItemDialog />
      </div>
      {/* 3. The Stats Cards Grid */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">

        {/* Card 1: Total Items */}
        <Card className=" bg-white dark:bg-neutral-900 border border-gray-200 dark:border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUniqueItems}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Individual SKUs in your database
            </p>
          </CardContent>
        </Card>
        {/* Card 2: Total Value */}
        <Card className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Inventory Value
            </CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* Format the number as currency! */}
            <div className="text-2xl font-bold">
              ${totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on retail price
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Low Stock Warning */}
        <Card className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Low Stock Alerts
            </CardTitle>
            {/* If there are alerts, make the icon red/yellow! */}
            <AlertTriangle className={`h-4 w-4 ${lowStockAlerts > 0 ? "text-amber-500" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockAlerts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Items with fewer than 10 in stock
            </p>
          </CardContent>
        </Card>
      </div>
      <DataTable columns={columns} data={inventoryData} />
    </div>
  );
}