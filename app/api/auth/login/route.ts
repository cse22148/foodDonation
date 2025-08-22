import { type NextRequest, NextResponse } from "next/server"
import { users } from "@/lib/users-store"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json()

    console.log("[v0] Login attempt:", { email, role, usersCount: users.length })
    console.log(
      "[v0] Available users:",
      users.map((u) => ({ email: u.email, role: u.role })),
    )

    // Validation
    if (!email || !password || !role) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    // Find user
    const user = users.find((u) => u.email === email && u.role === role)
    console.log("[v0] User found:", !!user)

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials or role" }, { status: 401 })
    }

    console.log("[v0] Input password:", JSON.stringify(password))
    console.log("[v0] Stored password:", JSON.stringify(user.password))
    console.log("[v0] Password types:", typeof password, "vs", typeof user.password)
    const isPasswordValid = password === user.password
    console.log("[v0] Password valid:", isPasswordValid)

    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    const token = `token_${user.id}_${Date.now()}`

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: "Login successful",
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
