'use client'

import { useState, useEffect } from 'react'
import { Search, Calendar, MapPin, Star, Shield, TrendingUp, ArrowRight, Package, ChevronLeft, ChevronRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import Link from 'next/link'
import Image from 'next/image'
import { collection, query, where, getDocs, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Product } from '@/lib/firebase/types'
import { formatCurrency } from '@/lib/utils'

// Hero Carousel Component
function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2070&auto=format&fit=crop',
      title: 'Furniture & Decor',
      subtitle: 'Tables, chairs, and elegant decorations',
    },
    {
      image: 'https://images.unsplash.com/photo-1478147427282-58a87a120781?q=80&w=2070&auto=format&fit=crop',
      title: 'Audio & Visual',
      subtitle: 'Sound systems, projectors, and lighting',
    },
    {
      image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=2069&auto=format&fit=crop',
      title: 'Event Essentials',
      subtitle: 'Everything you need for a perfect event',
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  return (
    <div className="relative h-[500px] md:h-[600px] rounded-3xl overflow-hidden shadow-2xl mb-12">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            className="object-cover"
            priority={index === 0}
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h2 className="text-4xl md:text-6xl font-semibold mb-3">{slide.title}</h2>
              <p className="text-xl md:text-2xl text-white/90">{slide.subtitle}</p>
            </div>
          </div>
        </div>
      ))}
      
      {/* Navigation Dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all z-30"
        aria-label="Previous slide"
      >
        <ChevronLeft className="text-white" size={24} />
      </button>
      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all z-30"
        aria-label="Next slide"
      >
        <ChevronRight className="text-white" size={24} />
      </button>
    </div>
  )
}

export default function HomePage() {
  const [searchLocation, setSearchLocation] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [products, setProducts] = useState<(Product & { id: string })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    if (!db) {
      setLoading(false)
      return
    }
    try {
      const q = query(
        collection(db, 'products'),
        where('available', '==', true),
        limit(12)
      )
      const snapshot = await getDocs(q)
      setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product & { id: string })))
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

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

      {/* Hero Section with Slides */}
      <section className="relative overflow-hidden pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <HeroCarousel />
          
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-semibold text-gray-900 mb-4 leading-tight tracking-tight">
              Rent Event Equipment
              <br />
              <span className="text-primary">for Your Next Event</span>
            </h1>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <Card variant="default" className="p-8 shadow-modern-lg bg-white/95 backdrop-blur-sm">
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

      {/* Featured Products Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-4 tracking-tight">
                Featured Equipment
              </h2>
              <p className="text-xl text-gray-600 font-light">
                Discover popular items available for rent
              </p>
            </div>
            <Link href="/search">
              <Button variant="outline" size="lg">
                View All
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} variant="default" className="animate-pulse">
                  <div className="aspect-video bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </Card>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <Package className="mx-auto text-gray-300 mb-4" size={64} />
              <p className="text-xl text-gray-600">No products available at the moment</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <Card variant="default" hover className="h-full flex flex-col">
                    <div className="aspect-video bg-gray-100 rounded-xl mb-4 overflow-hidden relative">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="text-gray-300" size={48} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{product.title}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">{product.description}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin size={14} className="text-gray-400" />
                        <span className="text-xs text-gray-500">{product.city}, {product.state}</span>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                          <p className="text-xl font-semibold text-gray-900">{formatCurrency(product.dailyPrice)}</p>
                          <p className="text-xs text-gray-500">per day</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="text-yellow-400" size={14} fill="currentColor" />
                          <span className="text-sm text-gray-600">4.5</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-semibold text-center text-gray-900 mb-6 tracking-tight">
            The marketplace for event equipment
            <br />
            <span className="text-primary">rental in Nigeria</span>
          </h2>
          <p className="text-xl text-center text-gray-600 mb-20 max-w-2xl mx-auto font-light">
            Connect equipment owners with renters for seamless event planning
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Trusted Equipment',
                description: 'All equipment is verified and covered. Rent with confidence knowing your event equipment is protected.',
                color: 'text-green-600',
                bgColor: 'bg-green-50',
                image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=2070&auto=format&fit=crop',
              },
              {
                icon: TrendingUp,
                title: 'Save on Events',
                description: 'Rent high-quality event equipment at a fraction of the cost. Perfect for weddings, corporate events, and parties.',
                color: 'text-blue-600',
                bgColor: 'bg-blue-50',
                image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2011&auto=format&fit=crop',
              },
              {
                icon: Star,
                title: 'Earn from Equipment',
                description: 'Equipment owners can monetize their inventory. List your event equipment and earn passive income.',
                color: 'text-yellow-600',
                bgColor: 'bg-yellow-50',
                image: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=2070&auto=format&fit=crop',
              },
            ].map((benefit, index) => (
              <Card key={index} variant="default" hover className="text-center overflow-hidden p-0">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={benefit.image}
                    alt={benefit.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className={`${benefit.bgColor} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <benefit.icon className={benefit.color} size={32} />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                </div>
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
                title: 'Browse Equipment',
                description: 'Search through verified event equipment listings from trusted equipment owners.',
                image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2069&auto=format&fit=crop',
              },
              {
                step: '2',
                title: 'Book & Pay',
                description: 'Select your event dates, add delivery details, and complete secure payment.',
                image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070&auto=format&fit=crop',
              },
              {
                step: '3',
                title: 'Enjoy Your Event',
                description: 'Receive your equipment, host your event, and return when done. It\'s that simple!',
                image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=2069&auto=format&fit=crop',
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="relative h-64 rounded-2xl overflow-hidden mb-6 shadow-modern">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="absolute top-4 left-4 w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">{item.step}</span>
                  </div>
                </div>
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
                image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070&auto=format&fit=crop',
              },
              {
                title: 'Fast payouts',
                description: 'All payments are easy, secure, and automatically deposited into your account.',
                image: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=2070&auto=format&fit=crop',
              },
              {
                title: 'Verified Equipment Owners',
                description: 'All equipment owners are verified through our comprehensive process to ensure trust and reliability.',
                image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2032&auto=format&fit=crop',
              },
            ].map((item, index) => (
              <Card key={index} variant="default" hover className="overflow-hidden p-0">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-gray-50/95 to-white z-10"></div>
          <Image
            src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2070&auto=format&fit=crop"
            alt="Join the community"
            fill
            className="object-cover"
            quality={90}
          />
        </div>
        
        <div className="relative z-20 max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-6 tracking-tight">
            Get started today
          </h2>
          <p className="text-xl text-gray-600 mb-12 font-light">
            Join the community and start renting or listing your event equipment
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?role=customer">
              <Button size="lg" variant="primary" className="w-full sm:w-auto">
                Rent Equipment
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <Link href="/register?role=vendor">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                List Equipment
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
