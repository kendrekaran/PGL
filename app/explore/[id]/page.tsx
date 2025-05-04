"use client"

import { useState, use, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  MessageSquare,
  Phone,
  Share2,
  Star,
  User,
  Wifi,
  Utensils,
  ShowerHead,
  Wind,
  Tv,
  ParkingMeterIcon as Parking,
  Clock,
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/toast-provider"
import AuthRequiredModal from "@/components/auth-required-modal"
import RazorpayPaymentButton from "@/components/razorpay-payment-button"
import GoogleMapComponent from "@/components/google-map-component"
import { Snowburst_One } from "next/font/google"

// Define the PG detail interface
interface PgDetail {
  _id: string;
  id?: number;
  title: string;
  location: string;
  price: number;
  description: string;
  amenities: string[];
  gender: string;
  roomType: string;
  address: string;
  city: string;
  images: string[];
  rating: number;
  reviews: Array<{
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
  }>;
  ownerId: string;
  ownerName: string;
  ownerContact: string;
  createdAt: string;
  updatedAt: string;
  rules?: string[];
  nearbyPlaces?: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Convert API data to the expected format for the UI
const formatPgDetails = (pgData: PgDetail) => {
  // Map amenities to include icons
  const amenitiesWithIcons = pgData.amenities.map(amenity => {
    let icon;
    switch(amenity) {
      case 'WiFi':
        icon = Wifi;
        break;
      case 'Food':
        icon = Utensils;
        break;
      case 'AC':
        icon = Wind;
        break;
      case 'Attached Bathroom':
      case 'Common Bathroom':
        icon = ShowerHead;
        break;
      case 'TV':
        icon = Tv;
        break;
      case 'Parking':
        icon = Parking;
        break;
      default:
        icon = Wifi; // Default icon
    }
    return { name: amenity, icon };
  });

  // Format reviews
  const formattedReviews = pgData.reviews?.map((review, index) => ({
    id: index + 1,
    user: review.userName,
    rating: review.rating,
    date: new Date(review.createdAt).toLocaleDateString(),
    comment: review.comment
  })) || [];

  // Default rules if not provided
  const defaultRules = [
    "No smoking inside the premises",
    "Guests allowed only in common areas",
    "Quiet hours from 10 PM to 6 AM",
    "No pets allowed",
    "ID proof required for check-in",
  ];

  // Default nearby places if not provided
  const defaultNearbyPlaces = [
    `${pgData.city} Bus Station (2 km)`,
    `${pgData.city} Railway Station (3 km)`,
    `${pgData.city} Market (1 km)`,
    `City Hospital (1.5 km)`,
  ];

  // Ensure images have complete URLs
  const formattedImages = pgData.images.map(img => 
    img.startsWith('http') || img.startsWith('/') ? img : '/placeholder-hostel.jpg'
  );

  return {
    id: pgData._id,
    title: pgData.title,
    location: pgData.location,
    price: pgData.price,
    description: pgData.description,
    amenities: amenitiesWithIcons,
    rules: pgData.rules || defaultRules,
    images: formattedImages.length > 0 ? formattedImages : ['/placeholder-hostel.jpg'],
    rating: pgData.rating || 4.0,
    reviews: formattedReviews,
    owner: {
      name: pgData.ownerName || 'PG Owner',
      phone: pgData.ownerContact || '+91 9876543210',
      responseTime: "Usually responds within 1 hour",
      memberSince: new Date(pgData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    },
    roomTypes: [
      {
        type: pgData.roomType,
        price: pgData.price,
        availability: 2,
      }
    ],
    gender: pgData.gender,
    address: pgData.address,
    coordinates: pgData.coordinates || {
      lat: 15.3647,
      lng: 75.124,
    },
    nearbyPlaces: pgData.nearbyPlaces || defaultNearbyPlaces,
  };
};

// Type for params to be used with React.use()
type PageParams = { id: string };

export default function PGDetailPage({ params }: { params: Promise<PageParams> | PageParams }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [saved, setSaved] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [pgDetails, setPgDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  
  // Fix: Unwrap params using React.use() if it's a promise
  const unwrappedParams = params instanceof Promise ? use(params) : params;
  
  // Get the ID from params
  const id = unwrappedParams.id;

  // Fetch PG details from the API
  useEffect(() => {
    const fetchPgDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/pg/${id}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching PG details: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched PG details:', data);
        
        // Format the data for UI
        const formattedData = formatPgDetails(data);
        setPgDetails(formattedData);
      } catch (err) {
        console.error('Failed to fetch PG details:', err);
        setError('Failed to load PG details. Please try again later.');
        
        // Fall back to static data if in development
        if (process.env.NODE_ENV === 'development') {
          console.warn('Using fallback static data');
          setPgDetails(getPgDetailsById(parseInt(id)));
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPgDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !pgDetails) {
    return (
      <div className="container py-8">
        <div className="mb-6">
          <Link href="/explore" className="flex items-center text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Explore
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <h2 className="text-2xl font-bold mb-4">Error Loading PG Details</h2>
          <p className="text-muted-foreground mb-6">{error || "Failed to load PG details"}</p>
          <Button onClick={() => router.push('/explore')}>Go Back to Explore</Button>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === pgDetails.images.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? pgDetails.images.length - 1 : prev - 1))
  }

  const toggleSave = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }

    setSaved(!saved)
    showToast(saved ? "Removed from favorites" : "Added to favorites", "success")
  }

  const handleBookNow = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }

    // In a real app, this would navigate to a booking page or open a booking modal
    // For now, we'll just show a toast
    showToast("Proceeding to payment...", "info")
  }

  const handleContactOwner = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }

    // In a real app, this would open a chat interface or contact form
    showToast("Message sent to owner", "success")
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link href="/explore" className="flex items-center text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Explore
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <div className="relative rounded-lg overflow-hidden mb-6">
            <div className="relative h-[300px] md:h-[400px]">
              <Image
                src={pgDetails.images[currentImageIndex]}
                alt={pgDetails.title}
                fill
                className="object-cover"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-background/80"
              onClick={prevImage}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-background/80"
              onClick={nextImage}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {pgDetails.images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${index === currentImageIndex ? "bg-primary" : "bg-background/80"}`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto">
            {pgDetails.images.map((image, index) => (
              <div
                key={index}
                className={`relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden cursor-pointer ${
                  index === currentImageIndex ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setCurrentImageIndex(index)}
              >
                <Image src={image} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>

          {/* PG Details */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-3xl font-bold">{pgDetails.title}</h1>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className={saved ? "text-red-500" : ""} onClick={toggleSave}>
                  <Heart className="h-5 w-5" fill={saved ? "currentColor" : "none"} />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="flex items-center text-muted-foreground mb-4">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{pgDetails.location}</span>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                <div className="text-yellow-500 mr-1">★</div>
                <span className="font-medium">{pgDetails.rating}</span>
                <span className="text-muted-foreground ml-1">({pgDetails.reviews.length} reviews)</span>
              </div>
              <Badge>{pgDetails.gender}</Badge>
            </div>
            <p className="text-muted-foreground mb-6">{pgDetails.description}</p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="amenities" className="mb-8">
            <TabsList className="mb-4">
              <TabsTrigger value="amenities">Amenities</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
              <TabsTrigger value="rooms">Room Types</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
            </TabsList>

            <TabsContent value="amenities">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {pgDetails.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <amenity.icon className="h-5 w-5 text-primary" />
                        <span>{amenity.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rules">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">House Rules</h3>
                  <ul className="space-y-2">
                    {pgDetails.rules.map((rule, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                          <ChevronRight className="h-3 w-3 text-primary" />
                        </div>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rooms">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">Room Types & Pricing</h3>
                  <div className="space-y-4">
                    {pgDetails.roomTypes.map((room, index) => (
                      <div key={index} className="flex justify-between items-center pb-4 border-b last:border-0">
                        <div>
                          <h4 className="font-medium">{room.type} Room</h4>
                          <p className="text-sm text-muted-foreground">
                            {room.availability} {room.availability === 1 ? "room" : "rooms"} available
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">₹{room.price}/mo</div>
                          {isAuthenticated ? (
                            <RazorpayPaymentButton amount={room.price} roomType={room.type} pgName={pgDetails.title} />
                          ) : (
                            <Button
                              size="sm"
                              className="mt-2"
                              onClick={() => {
                                setShowBookingForm(true)
                              }}
                            >
                              Book Now
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}

                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="location">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">Location</h3>
                  <p className="mb-4">{pgDetails.address}</p>
                  <div className="relative h-[300px] rounded-lg overflow-hidden mb-4">
                    <GoogleMapComponent
                      lat={pgDetails.coordinates.lat}
                      lng={pgDetails.coordinates.lng}
                      title={pgDetails.title}
                    />
                  </div>
                  <h4 className="font-medium mb-2">Nearby Places</h4>
                  <ul className="space-y-2">
                    {pgDetails.nearbyPlaces.map((place, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-primary" />
                        </div>
                        <span>{place}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Reviews */}
          <div>
            <h3 className="text-xl font-bold mb-4">Reviews</h3>
            <div className="space-y-6 mb-6">
              {pgDetails.reviews.map((review) => (
                <div key={review.id} className="p-4 rounded-lg border">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 mr-3 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{review.user}</h4>
                        <p className="text-xs text-muted-foreground">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-yellow-500 mr-1">★</div>
                      <span>{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </div>

            {/* Write a Review */}
            {isAuthenticated ? (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">Write a Review</h3>
                  <div className="flex items-center mb-4">
                    <span className="mr-2">Rating:</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-5 w-5 text-muted cursor-pointer hover:text-yellow-500" />
                      ))}
                    </div>
                  </div>
                  <Textarea placeholder="Share your experience..." className="mb-4" rows={4} />
                  <Button>Submit Review</Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-medium mb-2">Want to write a review?</h3>
                  <p className="text-muted-foreground mb-4">Please log in or sign up to share your experience</p>
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" onClick={() => router.push("/login")}>
                      Log In
                    </Button>
                    <Button onClick={() => router.push("/signup")}>Sign Up</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="sticky top-20">
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="text-2xl font-bold mb-2">₹{pgDetails.price}/mo</div>
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <div className="text-yellow-500 mr-1">★</div>
                  <span>{pgDetails.rating}</span>
                  <span className="mx-1">•</span>
                  <span>{pgDetails.reviews.length} reviews</span>
                </div>
                <Separator className="mb-4" />
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span>Security Deposit</span>
                    <span className="font-medium">₹{pgDetails.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Rent</span>
                    <span className="font-medium">₹{pgDetails.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maintenance</span>
                    <span className="font-medium">₹1000</span>
                  </div>
                </div>
                {isAuthenticated ? (
                  <>
                    <RazorpayPaymentButton
                      amount={pgDetails.price}
                      roomType="Single"
                      pgName={pgDetails.title}
                      className="w-full mb-2"
                    />
                    <Button variant="outline" className="w-full" onClick={handleContactOwner}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Contact Owner
                    </Button>
                  </>
                ) : (
                  <>
                    <Button className="w-full mb-2" onClick={handleBookNow}>
                      Book Now
                    </Button>
                    <Button variant="outline" className="w-full" onClick={handleContactOwner}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Contact Owner
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Owner Information</h3>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 mr-3 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{pgDetails.owner.name}</h4>
                    <p className="text-xs text-muted-foreground">Member since {pgDetails.owner.memberSince}</p>
                  </div>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm">{pgDetails.owner.responseTime}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm">{pgDetails.owner.phone}</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={handleContactOwner}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Authentication Required Modal */}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        redirectUrl={`/explore/${id}`}
      />
    </div>
  )
}