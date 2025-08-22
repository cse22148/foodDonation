import { type NextRequest, NextResponse } from "next/server"
import { users } from "@/lib/users-store"
import { donations } from "@/lib/donations-store"

function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)

  // Token format: token_${user.id}_${timestamp}
  if (!token.startsWith("token_")) {
    return null
  }

  const tokenParts = token.split("_")
  if (tokenParts.length !== 3) {
    return null
  }

  const userId = tokenParts[1]
  const user = users.find((u) => u.id === userId)

  if (!user) {
    return null
  }

  return { userId: user.userId, email: user.email, role: user.role, name: user.name }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Donation submission attempt")

    const user = verifyToken(request)
    if (!user) {
      console.log("[v0] Unauthorized - invalid token")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] User verified:", { email: user.email, role: user.role })

    if (user.role !== "donor") {
      console.log("[v0] Forbidden - user is not a donor")
      return NextResponse.json({ message: "Only donors can create donations" }, { status: 403 })
    }

    const { type, peopleFed, quantityKg, location } = await request.json()
    console.log("[v0] Donation data:", { type, peopleFed, quantityKg, location })

    // Validation
    if (!type || !location) {
      console.log("[v0] Validation failed - missing required fields")
      return NextResponse.json({ message: "Type and location are required" }, { status: 400 })
    }

    if (!["packed", "fresh", "organic"].includes(type)) {
      console.log("[v0] Validation failed - invalid type")
      return NextResponse.json({ message: "Invalid donation type" }, { status: 400 })
    }

    // Create donation
    const newDonation = {
      _id: Date.now().toString(),
      donorId: {
        id: user.userId,
        name: user.name || "Anonymous",
        email: user.email,
      },
      type,
      peopleFed: peopleFed || undefined,
      quantityKg: quantityKg || undefined,
      location,
      status: "pending",
      timestamp: new Date().toISOString(),
    }

    donations.push(newDonation)
    console.log("[v0] Donation created successfully:", newDonation._id)

    return NextResponse.json({ message: "Donation created successfully", donation: newDonation }, { status: 201 })
  } catch (error) {
    console.error("[v0] Create donation error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ donations }, { status: 200 })
  } catch (error) {
    console.error("[v0] Get donations error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
