import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Users, Recycle } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">RefedConnect</h1>
                <p className="text-sm text-green-600">Sharing food, connecting hearts</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Connect. Share. Impact.</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join our community of donors, NGOs, and biogas agents working together to reduce food waste and help those
            in need. Every donation makes a difference.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>For Donors</CardTitle>
              <CardDescription>Share your excess food with those who need it most</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Submit donations of packed food, fresh produce, or organic waste. Track your impact and see how your
                contributions help the community.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Heart className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>For NGOs</CardTitle>
              <CardDescription>Efficiently manage food distribution to communities</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Access real-time donations of fresh and packed food. Coordinate collection and ensure food reaches those
                in need quickly.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Recycle className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>For Biogas Agents</CardTitle>
              <CardDescription>Convert organic waste into renewable energy</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Collect organic waste donations and transform them into biogas. Support sustainable waste management and
                clean energy production.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to make a difference?</h3>
          <p className="text-gray-600 mb-8">Join thousands of users already making an impact in their communities</p>
          <Link href="/signup">
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              Get Started Today
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
