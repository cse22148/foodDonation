"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Heart, Plus, MapPin, Users, Scale } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Donation {
  _id: string
  type: "packed" | "fresh" | "organic"
  peopleFed?: number
  quantityKg?: number
  location: string
  status: "pending" | "collected"
  timestamp: string
}

export default function DonorDashboard() {
  const [user, setUser] = useState<any>(null)
  const [donations, setDonations] = useState<Donation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  // Form states
  const [foodType, setFoodType] = useState("")
  const [peopleFed, setPeopleFed] = useState("")
  const [quantityKg, setQuantityKg] = useState("")
  const [location, setLocation] = useState("")

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
    if (parsedUser.role !== "donor") {
      router.push("/login")
      return
    }

    setUser(parsedUser)
    fetchDonations()
  }, [router])

  const fetchDonations = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/donations/my-donations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setDonations(data.donations)
      }
    } catch (error) {
      console.error("Error fetching donations:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!foodType || !location) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if ((foodType === "packed" || foodType === "fresh") && !peopleFed) {
      toast({
        title: "Error",
        description: "Please specify how many people this can feed",
        variant: "destructive",
      })
      return
    }

    if ((foodType === "fresh" || foodType === "organic") && !quantityKg) {
      toast({
        title: "Error",
        description: "Please specify the quantity in kg",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: foodType,
          peopleFed: peopleFed ? Number.parseInt(peopleFed) : undefined,
          quantityKg: quantityKg ? Number.parseFloat(quantityKg) : undefined,
          location,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Donation submitted successfully!",
        })

        // Reset form
        setFoodType("")
        setPeopleFed("")
        setQuantityKg("")
        setLocation("")
        setShowForm(false)

        // Refresh donations
        fetchDonations()
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.message || "Failed to submit donation",
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
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/")
  }

  if (!user) return <div>Loading...</div>

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
                <p className="text-sm text-green-600">Donor Dashboard</p>
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
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Submit Donation Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Submit Donation</span>
                </CardTitle>
                <CardDescription>Share your excess food or organic waste with the community</CardDescription>
              </CardHeader>
              <CardContent>
                {!showForm ? (
                  <Button onClick={() => setShowForm(true)} className="w-full bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    New Donation
                  </Button>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label className="text-base font-medium">Food Type</Label>
                      <RadioGroup value={foodType} onValueChange={setFoodType} className="mt-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="packed" id="packed" />
                          <Label htmlFor="packed">Packed Food</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="fresh" id="fresh" />
                          <Label htmlFor="fresh">Fresh Food</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="organic" id="organic" />
                          <Label htmlFor="organic">Organic Waste</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {(foodType === "packed" || foodType === "fresh") && (
                      <div>
                        <Label htmlFor="peopleFed">Number of People it can Feed</Label>
                        <Input
                          id="peopleFed"
                          type="number"
                          min="1"
                          value={peopleFed}
                          onChange={(e) => setPeopleFed(e.target.value)}
                          placeholder="e.g., 10"
                        />
                      </div>
                    )}

                    {(foodType === "fresh" || foodType === "organic") && (
                      <div>
                        <Label htmlFor="quantityKg">Quantity (kg)</Label>
                        <Input
                          id="quantityKg"
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={quantityKg}
                          onChange={(e) => setQuantityKg(e.target.value)}
                          placeholder="e.g., 5.5"
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Textarea
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Enter pickup location address"
                        rows={3}
                      />
                    </div>

                    <div className="flex space-x-3">
                      <Button type="submit" disabled={isLoading} className="flex-1 bg-green-600 hover:bg-green-700">
                        {isLoading ? "Submitting..." : "Submit Donation"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* My Donations Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>My Donations</CardTitle>
                <CardDescription>Track the status of your submitted donations</CardDescription>
              </CardHeader>
              <CardContent>
                {donations.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No donations yet. Submit your first donation to get started!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {donations.map((donation) => (
                      <div key={donation._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant={donation.type === "organic" ? "secondary" : "default"}>
                              {donation.type.charAt(0).toUpperCase() + donation.type.slice(1)}
                            </Badge>
                            <Badge variant={donation.status === "collected" ? "default" : "secondary"}>
                              {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(donation.timestamp).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="space-y-1 text-sm">
                          {donation.peopleFed && (
                            <div className="flex items-center space-x-1 text-gray-600">
                              <Users className="h-4 w-4" />
                              <span>Feeds {donation.peopleFed} people</span>
                            </div>
                          )}
                          {donation.quantityKg && (
                            <div className="flex items-center space-x-1 text-gray-600">
                              <Scale className="h-4 w-4" />
                              <span>{donation.quantityKg} kg</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1 text-gray-600">
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
          </div>
        </div>
      </main>
    </div>
  )
}
