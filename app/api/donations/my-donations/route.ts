import { type NextRequest, NextResponse } from "next/server"
import { users } from "@/lib/users-store"
import { donations } from "@/lib/donations-store"

function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)

  if (!token.startsWith("token_")) {
    return null
  }

  // Extract user ID from token format: token_${user.id}_${timestamp}
  const tokenParts = token.split("_")
  if (tokenParts.length !== 3) {
    return null
  }

  const userId = tokenParts[1]
  const user = users.find((u) => u.id.toString() === userId)

  if (!user) {
    return null
  }

  return { userId: user.id, email: user.email, role: user.role, name: user.name }
}

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Fetching user donations")

    const user = verifyToken(request)
    if (!user) {
      console.log("[v0] Unauthorized - invalid token")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] User verified:", { email: user.email, role: user.role })

    if (user.role !== "donor") {
      console.log("[v0] Forbidden - user is not a donor")
      return NextResponse.json({ message: "Only donors can view their donations" }, { status: 403 })
    }

    // Filter donations by the current user
    const userDonations = donations.filter((donation) => donation.donorId.email === user.email)
    console.log("[v0] Found user donations:", userDonations.length)

    // Sort by timestamp (newest first)
    userDonations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({
      donations: userDonations,
    })
  } catch (error) {
    console.error("[v0] Get my donations error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
