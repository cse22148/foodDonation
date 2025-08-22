"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Users, Scale, MapPin, Clock, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Donation {
  _id: string
  donorId: {
    name: string
    email: string
  }
  type: "packed" | "fresh"
  peopleFed?: number
  quantityKg?: number
  location: string
  status: "pending" | "collected"
  timestamp: string
}

export default function NGODashboard() {
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
    if (parsedUser.role !== "ngo") {
      router.push("/login")
      return
    }

    setUser(parsedUser)
    fetchDonations()
  }, [router])

  const fetchDonations = async () => {
    try {
      const token = localStorage.getItem("token")
      console.log("[v0] NGO - Token from localStorage:", token ? "exists" : "missing")

      const response = await fetch("/api/donations/pending", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("[v0] NGO - Pending donations response:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] NGO - Received donations:", data.donations?.length || 0)
        setDonations(data.donations)
      } else {
        const errorData = await response.json()
        console.log("[v0] NGO - Error response:", errorData)
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
          description: "Donation marked as collected!",
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
                <p className="text-sm text-green-600">NGO Dashboard</p>
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
                  <p className="text-sm font-medium text-gray-600">Pending Donations</p>
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
                  <p className="text-sm font-medium text-gray-600">People Fed</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {donations.reduce((sum, d) => sum + (d.peopleFed || 0), 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Donations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Pending Food Donations</CardTitle>
            <CardDescription>Fresh and packed food donations waiting for collection</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingDonations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No pending donations at the moment. Check back later!</p>
            ) : (
              <div className="space-y-4">
                {pendingDonations.map((donation) => (
                  <div key={donation._id} className="border rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant={donation.type === "fresh" ? "default" : "secondary"}>
                            {donation.type.charAt(0).toUpperCase() + donation.type.slice(1)} Food
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
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isLoading === donation._id ? "Collecting..." : "Mark as Collected"}
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      {donation.peopleFed && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>Feeds {donation.peopleFed} people</span>
                        </div>
                      )}
                      {donation.quantityKg && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Scale className="h-4 w-4" />
                          <span>{donation.quantityKg} kg</span>
                        </div>
                      )}
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
              <CardDescription>Recently collected donations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {collectedDonations.slice(0, 5).map((donation) => (
                  <div key={donation._id} className="border rounded-lg p-4 bg-green-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="default" className="bg-green-600">
                            Collected
                          </Badge>
                          <Badge variant="outline">
                            {donation.type.charAt(0).toUpperCase() + donation.type.slice(1)}
                          </Badge>
                        </div>
                        <p className="font-medium">{donation.donorId.name}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          {donation.peopleFed && (
                            <span className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>{donation.peopleFed} people</span>
                            </span>
                          )}
                          {donation.quantityKg && (
                            <span className="flex items-center space-x-1">
                              <Scale className="h-3 w-3" />
                              <span>{donation.quantityKg} kg</span>
                            </span>
                          )}
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
