'use client'

import { useState } from 'react'
import { Search, Calendar, MapPin, Star, Shield, TrendingUp, ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  const [searchLocation, setSearchLocation] = useState('')
  const [eventDate, setEventDate] = useState('')

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchLocation) params.set('location', searchLocation)
    if (eventDate) params.set('date', eventDate)
    window.location.href = `/search?${params.toString()}`
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo.png" 
                alt="Renthaus Logo" 
                width={180} 
                height={60}
                className="h-16 w-auto"
                priority
              />
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-semibold text-gray-900 mb-6 leading-tight tracking-tight">
            Rent anything
            <br />
            <span className="text-primary">from anyone</span>
          </h1>
          <p className="text-2xl md:text-3xl text-gray-600 mb-16 max-w-3xl mx-auto font-light">
            Just about anything you'd ever want for your event is already in your community. 
            <br className="hidden md:block" />
            Now you can access it.
          </p>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <Card variant="default" className="p-8 shadow-modern-lg">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                      placeholder="Enter location (City, State)"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      className="pl-12"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="pl-12"
                      required
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleSearch}
                  size="lg"
                  className="md:w-auto"
                >
                  <Search className="mr-2" size={20} />
                  Search
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-semibold text-center text-gray-900 mb-6 tracking-tight">
            The marketplace to rent stuff
            <br />
            <span className="text-primary">to and from your neighbors</span>
          </h2>
          <p className="text-xl text-center text-gray-600 mb-20 max-w-2xl mx-auto font-light">
            A modern way to share resources and build community
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Live Green',
                description: 'Household goods account for 60% of greenhouse gas emissions. Consume less and be a better steward of your planet.',
                color: 'text-green-600',
                bgColor: 'bg-green-50',
              },
              {
                icon: TrendingUp,
                title: 'Save Money',
                description: 'Americans spend an average of $18,000 per year on nonessential items. Cut your expenses without cutting the fun.',
                color: 'text-blue-600',
                bgColor: 'bg-blue-50',
              },
              {
                icon: Star,
                title: 'Earn Money',
                description: 'The sharing economy has created new opportunities for passive income. Put your stuff to work.',
                color: 'text-yellow-600',
                bgColor: 'bg-yellow-50',
              },
            ].map((benefit, index) => (
              <Card key={index} variant="default" hover className="text-center">
                <div className={`${benefit.bgColor} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <benefit.icon className={benefit.color} size={32} />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-semibold text-center text-gray-900 mb-20 tracking-tight">
            How it works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: '1',
                title: 'Explore items',
                description: 'Search great listings from people in your community.',
              },
              {
                step: '2',
                title: 'Book your rental',
                description: 'Select dates and message owners for pickup.',
              },
              {
                step: '3',
                title: 'Experience more',
                description: "Enjoy your rental! Simply return it when you're done.",
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-7xl font-bold text-primary/20 mb-6">{item.step}</div>
                <h3 className="text-3xl font-semibold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-lg text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-semibold text-center text-gray-900 mb-6 tracking-tight">
            We've got your back
          </h2>
          <p className="text-xl text-center text-gray-600 mb-20 max-w-2xl mx-auto font-light">
            Everything you need to rent your stuff with confidence
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Item coverage',
                description: 'Each of your listings are covered up to ₦2,000,000 at no additional cost.',
              },
              {
                title: 'Fast payouts',
                description: 'All payments are easy, secure, and automatically deposited into your account.',
              },
              {
                title: 'Verified vendors',
                description: 'Our comprehensive process verifies multiple factors, like government ID, to confirm identity.',
              },
            ].map((item, index) => (
              <Card key={index} variant="default" hover>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-6 tracking-tight">
            Get started today
          </h2>
          <p className="text-xl text-gray-600 mb-12 font-light">
            Join the community and start renting or listing your event equipment
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?role=customer">
              <Button size="lg" variant="primary" className="w-full sm:w-auto">
                Start Renting
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <Link href="/register?role=vendor">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                List Your Items
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-gray-500">
          <p>&copy; 2024 RentHaus. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
