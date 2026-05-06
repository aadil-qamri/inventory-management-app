"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  SortingState,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"

// REMOVED: The top-level await and getInventory import

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,

    state: {
      columnFilters,
      globalFilter,
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  const handleExportCSV = () => {
    const headers = ["SKU", "Product", "Category", "Stock", "Cost", "Price"];
    
    const csvRows = (data as any[]).map(item => {
      return [
        item.sku,
        `"${item.product || item.name || ""}"`, // Failsafe for product name
        item.category,
        item.stock,
        item.cost,
        item.price
      ].join(",");
    });

    const csvString = [headers.join(","), ...csvRows].join("\n");

    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Search products..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(String(event.target.value))}
          className="max-w-sm bg-white dark:bg-neutral-900 border-gray-300 dark:border-border"
        />
        <button
          onClick={handleExportCSV}
          className="flex items-center px-4 hover:cursor-pointer py-2 text-sm font-medium rounded-md bg-white dark:bg-neutral-900 border border-gray-200 dark:border-border text-neutral-900 dark:text-white transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800"
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-muted/50 border-b-2 border-border">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="bg-white dark:bg-neutral-900 border-gray-300 dark:border-border hover:bg-gray-200 dark:hover:bg-neutral-800"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="bg-white dark:bg-neutral-900 border-gray-300 dark:border-border hover:bg-gray-200 dark:hover:bg-neutral-800"
        >
          Next
        </Button>
      </div>
    </div>
  )
}
// REMOVED: The broken getInventory function at the bottom