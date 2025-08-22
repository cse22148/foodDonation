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

  const parts = token.split("_")
  if (parts.length !== 3) {
    return null
  }

  const userId = parts[1]
  const user = users.find((u) => u.id === userId)

  console.log("[v0] Collect - User verified:", user ? { email: user.email, role: user.role } : null)

  return user
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] Collect donation attempt for ID:", params.id)

    const user = verifyToken(request)
    if (!user) {
      console.log("[v0] Unauthorized - invalid token")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (!["ngo", "biogas"].includes(user.role)) {
      return NextResponse.json({ message: "Only NGO and Biogas agents can collect donations" }, { status: 403 })
    }

    const donationId = params.id
    const donationIndex = donations.findIndex((d) => d._id === donationId)

    if (donationIndex === -1) {
      console.log("[v0] Donation not found:", donationId)
      return NextResponse.json({ message: "Donation not found" }, { status: 404 })
    }

    const donation = donations[donationIndex]

    // Check if the user has permission to collect this type of donation
    if (user.role === "ngo" && !["fresh", "packed"].includes(donation.type)) {
      return NextResponse.json({ message: "NGO agents can only collect fresh and packed food" }, { status: 403 })
    }

    if (user.role === "biogas" && donation.type !== "organic") {
      return NextResponse.json({ message: "Biogas agents can only collect organic waste" }, { status: 403 })
    }

    if (donation.status === "collected") {
      return NextResponse.json({ message: "Donation already collected" }, { status: 400 })
    }

    donations[donationIndex] = {
      ...donation,
      status: "collected",
      collectedBy: {
        id: user.id,
        name: user.name || "Anonymous",
        email: user.email,
        role: user.role,
      },
      collectedAt: new Date().toISOString(),
    }

    console.log("[v0] Donation marked as collected:", donationId)

    return NextResponse.json({
      message: "Donation marked as collected successfully",
      donation: donations[donationIndex],
    })
  } catch (error) {
    console.error("[v0] Collect donation error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
