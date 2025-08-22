import { type NextRequest, NextResponse } from "next/server"
import { users } from "@/lib/users-store"
import { donations } from "@/lib/donations-store"

function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  console.log("[v0] Auth header:", authHeader ? "Bearer ***" : "missing")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("[v0] No valid auth header")
    return null
  }

  const token = authHeader.substring(7)
  console.log("[v0] Token format:", token.startsWith("token_") ? "valid format" : "invalid format")

  if (!token.startsWith("token_")) {
    return null
  }

  const parts = token.split("_")
  if (parts.length !== 3) {
    console.log("[v0] Token parts invalid:", parts.length)
    return null
  }

  const userId = parts[1] // Keep as string instead of parsing to number
  const user = users.find((u) => u.id === userId)

  console.log("[v0] Pending donations - User verified:", user ? { email: user.email, role: user.role } : null)

  return user
}

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Fetching pending donations")

    const user = verifyToken(request)
    if (!user) {
      console.log("[v0] Unauthorized - invalid token")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    let filteredDonations = []

    if (user.role === "ngo") {
      // NGOs can see fresh and packed food donations
      filteredDonations = donations.filter((donation) => ["fresh", "packed"].includes(donation.type))
      console.log("[v0] NGO - Found donations:", filteredDonations.length)
    } else if (user.role === "biogas") {
      // Biogas agents can see organic waste donations
      filteredDonations = donations.filter((donation) => donation.type === "organic")
      console.log("[v0] Biogas - Found donations:", filteredDonations.length)
    } else {
      return NextResponse.json({ message: "Access denied" }, { status: 403 })
    }

    // Sort by timestamp (newest first)
    filteredDonations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({
      donations: filteredDonations,
    })
  } catch (error) {
    console.error("[v0] Get pending donations error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
