// lib/queries.ts
import clientPromise from "@/lib/mongodb";
import { InventoryItem } from "@/app/payments/columns";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function getInventory(): Promise<InventoryItem[]> {
  try {
    const session = await getServerSession(authOptions)
    const client = await clientPromise;
    const db = client.db("inventory_db");
    
    const items = await db.collection("items").find({ userEmail: session?.user?.email }).toArray();
    
      return items.map(item => ({
      _id: item._id.toString(),
      sku: item.sku,
      product: item.product,
      category: item.category,
      cost: item.cost,
      price: item.price,
      stock: item.stock,
      status: item.status
    })) as InventoryItem[];
  } catch (error) {
    console.error("Failed to fetch inventory directly:", error);
    return [];
  }
}