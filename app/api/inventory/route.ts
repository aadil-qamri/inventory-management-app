// app/api/inventory/route.ts
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"


export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const client = await clientPromise
    const db = client.db("inventory_db")
    
    const items = await db
      .collection("items")
      .find({ userEmail: session?.user?.email })
      .limit(20)
      .toArray()

      console.log("🚨 DB FETCH RESULT:", {
      user: session?.user?.email})
    return NextResponse.json(items)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 })
  }
}

export async function POST(request : Request) {
  try {
    // 1. UNCOMMENT THIS LINE (and make sure getServerSession and authOptions are imported at the top of the file)
    const session = await getServerSession(authOptions)
    
    const client = await clientPromise
    const db = client.db("inventory_db")

    const body = await request.json();

    if (!body.sku || !body.product) {
      return NextResponse.json(
        { error: "SKU and Product Name are required" },
        { status: 400 }
      );
    }

    // 1. Convert stock to a reliable number
    const stockQuantity = Number(body.stock);

    // 2. The Smart Stock Logic
    let calculatedStatus = "In Stock";
    if (stockQuantity <= 0) {
      calculatedStatus = "Out of Stock";
    } else if (stockQuantity <= 10) { // 10 is our "Low Stock" threshold
      calculatedStatus = "Low Stock";
    }

    const result = await db.collection("items").insertOne({
      ...body,
      stock: stockQuantity, // Ensure it saves as a number, not a string
      status: calculatedStatus, // Inject our smart status here
      
      // 2. ADD THIS LINE: This permanently ties the item to whoever is logged in
      userEmail: session?.user?.email, 
      
      createdAt: new Date(),
    });

    return NextResponse.json({ 
      message: "Item added successfully", 
      id: result.insertedId 
    }, { status: 201 });

  } catch (e) {
    console.error("POST Error:", e);
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}

// Add this below your GET and POST functions
export async function PUT(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("inventory_db");
    
    // 1. Get the updated data and the ID
    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    // 2. Reuse your Smart Stock Logic!
    if (updateData.stock !== undefined) {
      const stockQuantity = Number(updateData.stock);
      updateData.stock = stockQuantity;
      
      if (stockQuantity <= 0) {
        updateData.status = "Out of Stock";
      } else if (stockQuantity <= 10) {
        updateData.status = "Low Stock";
      } else {
        updateData.status = "In Stock";
      }
    }

    // Convert prices back to numbers just in case form sent strings
    if (updateData.cost) updateData.cost = Number(updateData.cost);
    if (updateData.price) updateData.price = Number(updateData.price);

    // 3. Update the specific document in MongoDB
    const result = await db.collection("items").updateOne(
      { _id: new ObjectId(_id) }, // Search by the unique ID
      { $set: updateData }        // Overwrite with new data
    );

    return NextResponse.json({ message: "Item updated successfully" }, { status: 200 });

  } catch (e) {
    console.error("PUT Error:", e);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("inventory_db");
    
    // REUSING the exact pattern from your PUT route!
    const body = await request.json();
    const { _id } = body;

    if (!_id) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    // The only line that changes: deleteOne instead of updateOne
    const result = await db.collection("items").deleteOne({ 
      _id: new ObjectId(_id) 
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Item deleted successfully" }, { status: 200 });

  } catch (e) {
    console.error("DELETE Error:", e);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
