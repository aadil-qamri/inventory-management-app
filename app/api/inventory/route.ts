// app/api/inventory/route.ts
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"


export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("inventory_db");

    const items = await db
      .collection("items")
      .find({
        userEmail: session.user.email,
      })
      .limit(20)
      .toArray();

    return NextResponse.json(items);

  } catch (error) {
    console.error("GET Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 1. Require authentication
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // 2. Only accept fields the client is actually allowed to set
    const {
      product,
      sku,
      category,
      stock,
      cost,
      price,
    } = body;

    // 3. Validate required fields
    if (!product || !sku) {
      return NextResponse.json(
        { error: "Product and SKU are required" },
        { status: 400 }
      );
    }

    // 4. Validate numeric fields
    const stockQuantity = Number(stock);
    const itemCost = Number(cost);
    const itemPrice = Number(price);

    if (
      !Number.isFinite(stockQuantity) ||
      stockQuantity < 0
    ) {
      return NextResponse.json(
        { error: "Invalid stock quantity" },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(itemCost) ||
      itemCost < 0
    ) {
      return NextResponse.json(
        { error: "Invalid cost" },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(itemPrice) ||
      itemPrice < 0
    ) {
      return NextResponse.json(
        { error: "Invalid price" },
        { status: 400 }
      );
    }

    // 5. Calculate status on the server
    let status = "In Stock";

    if (stockQuantity <= 0) {
      status = "Out of Stock";
    } else if (stockQuantity <= 10) {
      status = "Low Stock";
    }

    const client = await clientPromise;
    const db = client.db("inventory_db");

    // 6. Build the document server-side
    const newItem = {
      product,
      sku,
      category: category || "",
      stock: stockQuantity,
      cost: itemCost,
      price: itemPrice,

      // NEVER take this from request.body
      userEmail: session.user.email,

      status,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 7. Insert
    const existingItem = await db.collection("items").findOne({
      sku,
      userEmail: session.user.email,
    });

    if (existingItem) {
      return NextResponse.json(
        { error: "An item with this SKU already exists" },
        { status: 409 }
      );
    }
    const result = await db.collection("items").insertOne(newItem);

    return NextResponse.json(
      {
        message: "Item created successfully",
        item: {
          _id: result.insertedId,
          ...newItem,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("POST Error:", error);

    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}

// Add this below your GET and POST functions
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(_id)) {
      return NextResponse.json(
        { error: "Invalid item ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("inventory_db");

    // Recalculate stock status server-side
    if (updateData.stock !== undefined) {
      const stockQuantity = Number(updateData.stock);

      if (!Number.isFinite(stockQuantity) || stockQuantity < 0) {
        return NextResponse.json(
          { error: "Invalid stock quantity" },
          { status: 400 }
        );
      }

      updateData.stock = stockQuantity;

      if (stockQuantity <= 0) {
        updateData.status = "Out of Stock";
      } else if (stockQuantity <= 10) {
        updateData.status = "Low Stock";
      } else {
        updateData.status = "In Stock";
      }
    }

    if (updateData.cost !== undefined) {
      updateData.cost = Number(updateData.cost);
    }

    if (updateData.price !== undefined) {
      updateData.price = Number(updateData.price);
    }

    const result = await db.collection("items").updateOne(
      {
        _id: new ObjectId(_id),
        userEmail: session.user.email,
      },
      {
        $set: updateData,
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Item updated successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("PUT Error:", error);

    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { _id } = body;

    if (!_id) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(_id)) {
      return NextResponse.json(
        { error: "Invalid item ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("inventory_db");

    const result = await db.collection("items").deleteOne({
      _id: new ObjectId(_id),
      userEmail: session.user.email,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Item deleted successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("DELETE Error:", error);

    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}