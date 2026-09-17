"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Plus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AddItemDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const values = Object.fromEntries(formData.entries())

    const res = await fetch("/api/inventory", {
      method: "POST",
      body: JSON.stringify({
        ...values,
        cost: Number(values.cost),
        price: Number(values.price),
        stock: Number(values.stock),
      }),
    })

    if (res.ok) {
      setOpen(false)
      router.refresh() // This triggers the server component to re-fetch the table data!
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"><Plus className="h-4 w-4" /> Add Item</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Inventory Item</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new product to your inventory database.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" name="sku" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product">Product Name</Label>
              <Input id="product" name="product" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category Tag</Label>
            <Select name="category" defaultValue="Electronics">
              <SelectTrigger id="category" className="w-full hcp">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Furniture">Furniture</SelectItem>
                <SelectItem value="Apparel">Apparel</SelectItem>
                <SelectItem value="Software">Software</SelectItem>
                <SelectItem value="Accessories">Accessories</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input id="stock" name="stock" type="number" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Cost</Label>
              <Input id="cost" name="cost" type="number" step="0.1" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input id="price" name="price" type="number" step="0.1" required />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Product
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}