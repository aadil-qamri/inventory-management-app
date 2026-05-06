"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Loader2, Trash2 } from "lucide-react"

// Define what an item looks like based on your DB
interface DeleteItemDialogProps {
  item: any; // You can replace 'any' with your InventoryItem type
}

// Notice I capitalized the component name (React standard)
export function DeleteItemDialog({ item }: DeleteItemDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function onDelete() {
    setLoading(true)
    
    // Using your exact reused fetch pattern!
    const res = await fetch("/api/inventory", {
      method: "DELETE",
      body: JSON.stringify({
        _id: item._id // Grab the ID directly from the item passed in
      }),
    })

    if (res.ok) {
      setOpen(false)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* Red trash can button so it looks dangerous */}
        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700  hover:bg-red-500/10">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Product</DialogTitle>
          <DialogDescription>
            Are you absolutely sure you want to delete <strong>{item.product}</strong>? This action cannot be undone and will permanently remove the item from the database.
          </DialogDescription>
        </DialogHeader>
        
        {/* Just two simple buttons instead of a whole form */}
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onDelete} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}