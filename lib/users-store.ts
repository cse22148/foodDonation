// Shared in-memory storage for demo purposes
// In production, use a proper database
export const users: any[] = []

users.push(
  {
    id: "1",
    name: "John Donor",
    email: "donor@test.com",
    password: "password123", // Plain text for demo
    role: "donor",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Jane NGO",
    email: "ngo@test.com",
    password: "password123", // Plain text for demo
    role: "ngo",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Bob Biogas",
    email: "biogas@test.com",
    password: "password123", // Plain text for demo
    role: "biogas",
    createdAt: new Date().toISOString(),
  },
)
