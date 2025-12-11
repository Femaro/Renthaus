'use client'

import { useState } from 'react'
import { Search, Calendar, MapPin, Star, Shield, TrendingUp } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import Link from 'next/link'

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
    <div className="min-h-screen bg-gradient-to-br from-black via-secondary to-black">
        {/* Navigation */}
        <nav className="glass border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-2xl font-bold text-white">
                Rent<span className="text-primary">Haus</span>
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
        <section className="relative overflow-hidden pt-20 pb-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Rent anything
              <br />
              <span className="text-primary">from anyone</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Just about anything you'd ever want for your event is already in your community. 
              Now you can access it.
            </p>

            {/* Search Bar */}
            <Card variant="glass" className="max-w-4xl mx-auto p-8">
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
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-white mb-16">
              The marketplace to rent stuff
              <br />
              <span className="text-primary">to and from your neighbors</span>
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Shield,
                  title: 'Live Green',
                  description: 'Household goods account for 60% of greenhouse gas emissions. Consume less and be a better steward of your planet.',
                  color: 'text-green-400',
                },
                {
                  icon: TrendingUp,
                  title: 'Save Money',
                  description: 'Americans spend an average of $18,000 per year on nonessential items. Cut your expenses without cutting the fun.',
                  color: 'text-blue-400',
                },
                {
                  icon: Star,
                  title: 'Earn Money',
                  description: 'The sharing economy has created new opportunities for passive income. Put your stuff to work.',
                  color: 'text-yellow-400',
                },
              ].map((benefit, index) => (
                <Card key={index} variant="glass" hover className="text-center">
                  <benefit.icon className={`${benefit.color} mx-auto mb-4`} size={48} />
                  <h3 className="text-2xl font-bold text-white mb-3">{benefit.title}</h3>
                  <p className="text-gray-300">{benefit.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/30">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-white mb-16">
              How it works
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
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
                <Card key={index} variant="glass-red" className="text-center">
                  <div className="text-6xl font-bold text-primary mb-4">{item.step}</div>
                  <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-300">{item.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-white mb-16">
              We&apos;ve got your back
            </h2>
            <p className="text-xl text-center text-gray-300 mb-12">
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
                <Card key={index} variant="glass" hover>
                  <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-300">{item.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Card variant="glass-red" className="p-12">
              <h2 className="text-4xl font-bold text-white mb-6">
                Get started today
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join the community and start renting or listing your event equipment
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/register?role=customer">
                  <Button size="lg" variant="primary">
                    Start Renting
                  </Button>
                </Link>
                <Link href="/register?role=vendor">
                  <Button size="lg" variant="outline">
                    List Your Items
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="glass border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center text-gray-400">
            <p>&copy; 2024 RentHaus. All rights reserved.</p>
          </div>
        </footer>
      </div>
  )
}
