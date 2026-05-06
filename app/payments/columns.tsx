// app/payments/columns.tsx
"use client"
import { EditItemDialog } from "@/components/edit-item-dialog"
import { DeleteItemDialog } from "@/components/delete-item-dialog"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"

// Paste these near the top of your file
function getStatusBadgeClasses(status: string) {
  const baseClasses = "px-2.5 py-0.5 rounded-full text-xs font-medium border inline-flex items-center";
  switch (status) {
    case "In Stock":
      return `${baseClasses} bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20`;
    case "Low Stock":
      return `${baseClasses} bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20`;
    case "Out of Stock":
      return `${baseClasses} bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20`;
    default:
      return `${baseClasses} bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
  }
}

function getCategoryBadgeClasses(category: string) {
  const baseClasses = "px-2.5 py-0.5 rounded-md text-xs font-medium border inline-flex items-center";
  switch (category) {
    case "Electronics":
      return `${baseClasses} bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20`;
    case "Accessories":
      return `${baseClasses} bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20`;
    case "Furniture":
      return `${baseClasses} bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20`;
    default:
      return `${baseClasses} bg-gray-50 text-gray-600 border-gray-200 dark:bg-neutral-800/50 dark:text-gray-400 dark:border-neutral-700`;
  }
}

export type InventoryItem = {
  _id: string;
  sku: string;
  product: string;
  category: string;
  cost: number;
  price: number;
  stock: number;
  status: string;
}

export const columns: ColumnDef<InventoryItem>[] = [
  {
    accessorKey: "sku",
    header: "SKU",
  },
  {
    accessorKey: "product",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4 hover:bg-neutral-800/50"
        >
          Product
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.getValue("category") as string;
      return (
        <span className={getCategoryBadgeClasses(category)}>
          {category}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <span className={getStatusBadgeClasses(status)}>
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "price",
    header: () => <div className="text-right">Price</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("price"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
      return <div className="text-right font-medium">{formatted}</div>
    },
  },

  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      // row.original contains the full MongoDB document for this specific row!
      const item = row.original;

      return (
        <div className="text-right">
          <EditItemDialog item={item} />
          <DeleteItemDialog item={item} />
        </div>
      )
    },
  },
]