"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Scale, MapPin, Clock, CheckCircle, Recycle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Donation {
  _id: string
  donorId: {
    name: string
    email: string
  }
  type: "organic"
  quantityKg: number
  location: string
  status: "pending" | "collected"
  timestamp: string
}

export default function BiogasDashboard() {
  const [user, setUser] = useState<any>(null)
  const [donations, setDonations] = useState<Donation[]>([])
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "biogas") {
      router.push("/login")
      return
    }

    setUser(parsedUser)
    fetchDonations()
  }, [router])

  const fetchDonations = async () => {
    try {
      const token = localStorage.getItem("token")
      console.log("[v0] Biogas - Token from localStorage:", token ? "exists" : "missing")

      const response = await fetch("/api/donations/pending", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("[v0] Biogas - Pending donations response:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Biogas - Received donations:", data.donations?.length || 0)
        setDonations(data.donations)
      } else {
        const errorData = await response.json()
        console.log("[v0] Biogas - Error response:", errorData)
      }
    } catch (error) {
      console.error("Error fetching donations:", error)
    }
  }

  const handleCollect = async (donationId: string) => {
    setIsLoading(donationId)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/donations/${donationId}/collect`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Organic waste marked as collected!",
        })
        fetchDonations() // Refresh the list
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.message || "Failed to mark as collected",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(null)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/")
  }

  if (!user) return <div>Loading...</div>

  const pendingDonations = donations.filter((d) => d.status === "pending")
  const collectedDonations = donations.filter((d) => d.status === "collected")
  const totalWasteCollected = collectedDonations.reduce((sum, d) => sum + d.quantityKg, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">RefedConnect</h1>
                <p className="text-sm text-green-600">Biogas Agent Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.name}</span>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Collections</p>
                  <p className="text-3xl font-bold text-orange-600">{pendingDonations.length}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Collected Today</p>
                  <p className="text-3xl font-bold text-green-600">{collectedDonations.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Waste (kg)</p>
                  <p className="text-3xl font-bold text-purple-600">{totalWasteCollected.toFixed(1)}</p>
                </div>
                <Recycle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Organic Waste */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Pending Organic Waste Collections</CardTitle>
            <CardDescription>Organic waste donations ready for biogas conversion</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingDonations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No pending organic waste collections at the moment. Check back later!
              </p>
            ) : (
              <div className="space-y-4">
                {pendingDonations.map((donation) => (
                  <div key={donation._id} className="border rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                            Organic Waste
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(donation.timestamp).toLocaleDateString()} at{" "}
                            {new Date(donation.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg">Donor: {donation.donorId.name}</h3>
                        <p className="text-gray-600">{donation.donorId.email}</p>
                      </div>
                      <Button
                        onClick={() => handleCollect(donation._id)}
                        disabled={isLoading === donation._id}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {isLoading === donation._id ? "Collecting..." : "Mark as Collected"}
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Scale className="h-4 w-4" />
                        <span>{donation.quantityKg} kg of organic waste</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{donation.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Collections */}
        {collectedDonations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Collections</CardTitle>
              <CardDescription>Recently collected organic waste for biogas production</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {collectedDonations.slice(0, 5).map((donation) => (
                  <div key={donation._id} className="border rounded-lg p-4 bg-purple-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="default" className="bg-purple-600">
                            Collected
                          </Badge>
                          <Badge variant="outline">Organic Waste</Badge>
                        </div>
                        <p className="font-medium">{donation.donorId.name}</p>
                        <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                          <Scale className="h-3 w-3" />
                          <span>{donation.quantityKg} kg</span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{new Date(donation.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
