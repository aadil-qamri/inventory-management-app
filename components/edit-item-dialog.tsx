"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Pencil } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

// Define what an item looks like based on your DB
interface EditItemDialogProps {
  item: any; // You can replace 'any' with your InventoryItem type
}

export function EditItemDialog({ item }: EditItemDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const values = Object.fromEntries(formData.entries())

    const res = await fetch("/api/inventory", {
      method: "PUT",
      body: JSON.stringify({
        _id: item._id, // WE MUST SEND THE ID BACK!
        ...values,
      }),
    })

    if (res.ok) {
      setOpen(false)
      router.refresh() // Instantly updates the table!
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* Ghost button so it looks clean in the table row */}
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Product: {item.product}</DialogTitle>
          <DialogDescription>Update the inventory details below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" name="sku" defaultValue={item.sku} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product">Product Name</Label>
              <Input id="product" name="product" defaultValue={item.product} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category Tag</Label>
            <Select name="category" defaultValue={item.category}>
              <SelectTrigger id="category" className="w-full">
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
              {/* Pre-fill with defaultValue */}
              <Input id="stock" name="stock" type="number" defaultValue={item.stock} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Cost</Label>
              <Input id="cost" name="cost" type="number" step="0.01" defaultValue={item.cost} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input id="price" name="price" type="number" step="0.01" defaultValue={item.price} required />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}