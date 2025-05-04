"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Filter,
  Heart,
  MapPin,
  Search,
  Wifi,
  Utensils,
  ShowerHead,
  Wind,
  X
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/toast-provider"
import AuthRequiredModal from "@/components/auth-required-modal"

// Define specific types for your state objects
type RoomType = "single" | "double" | "triple";
type Amenity = "wifi" | "food" | "ac" | "attachedBathroom";
type Rating = "rating4plus" | "rating3plus";

export default function ExplorePage() {
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState([2000, 8000])
  const [viewType, setViewType] = useState("grid")
  const [city, setCity] = useState("all")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState("")
  const { showToast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [userAddedListings, setUserAddedListings] = useState([])

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [gender, setGender] = useState("all")
  const [sortBy, setSortBy] = useState("recommended")
  const [selectedRoomTypes, setSelectedRoomTypes] = useState({
    single: false,
    double: false,
    triple: false,
  })
  const [selectedAmenities, setSelectedAmenities] = useState({
    wifi: false,
    food: false,
    ac: false,
    attachedBathroom: false,
  })
  const [selectedRatings, setSelectedRatings] = useState({
    rating4plus: false,
    rating3plus: false,
  })

  // Mock PG listings data - focused on Hubli and Dharwad
  const staticPgListings = [
    {
      id: 1,
      title: "EXCLUSIVE LADIES PG",
      location: "Vidyanagar, Hubli",
      price: 7500,
      image: "\placeholder-id1.jpg?height=200&width=300",
      amenities: ["WiFi", "Food", "AC","Common Bathroom"],
      rating: 4.8,
      reviews: 24,
      type: "Single",
      gender: "Female",
      saved: false,
      city: "hubli",
    },
    {
      id: 2,
      title: "VISHWANATH PG",
      location: "Vidyanagar, Hubli",
      price: 6500,
      image: "/\placeholder-id2.jpg?height=200&width=300",
      amenities: ["WiFi", "Food", "Attached Bathroom", "AC"],
      rating: 4.9,
      reviews: 36,
      type: "Double",
      gender: "Female",
      saved: false,
      city: "hubli",
    },
    {
      id: 3,
      title: "VIDTARTHI NILAYA BOYS PG",
      location: "Vidya nagar, Hubli",
      price: 3500,
      image: "\placeholder-id3.jpg?height=200&width=300",
      amenities: ["WiFi", "Food","Common Bathroom"],
      rating: 4.5,
      reviews: 18,
      type: "Double",
      gender: "Male",
      saved: false,
      city: "hubli",
    },
    {
      id: 4,
      title: "SLN PG",
      location: "Vidya Nagar, HUbli",
      price: 3500,
      image: "/\placeholder-id4.jpg?height=200&width=300",
      amenities: [ "Attached Bathroom", "AC"],
      rating: 4.7,
      reviews: 42,
      type: "Single",
      gender: "Male",
      saved: false,
      city: "hubli",
    },
    {
      id: 5,
      title: "SHREE LAXMI NARAYANA KRUPA KALBURGI",
      location: "New hubli, Hubli",
      price: 8000,
      image: "\placeholder-id5.jpg?height=200&width=300",
      amenities: ["Food", "Attached Bathroom", "AC", "TV"],
      rating: 4.9,
      reviews: 31,
      type: "Double",
      gender: "Unisex",
      saved: false,
      city: "hubli",
    },
    {
      id: 6,
      title: "SAPNAJIT PAYING GUEST",
      location: "Akshay Colony, Hubli",
      price: 7000,
      image: "\placeholder-id6.jpg?height=200&width=300",
      amenities: [ "Food", "Attached Bathroom"],
      rating: 4.6,
      reviews: 27,
      type: "Double",
      gender: "Unisex",
      saved: false,
      city: "hubli",
    },
    {
      id: 7,
      title: "HOGWARTS PAYING GUEST",
      location: "Narayanpura, Dharwad",
      price: 3000,
      image: "\placeholder-id7.jpg?height=200&width=300",
      amenities: [ "Wifi","Food", "Common Bathroom"],
      rating: 4.6,
      reviews: 30,
      type: "Double",
      gender: "Female",
      saved: false,
      city: "dharwad",
    },
    {
      id: 8,
      title: "SHRI SHARADA PG",
      location: "Yalakki Shettar Colony, Dharwad",
      price: 5000,
      image: "\placeholder-id8.jpg?height=200&width=300",
      amenities: [ "Wifi","Food", "Attached Bathroom"],
      rating: 4.6,
      reviews: 30,
      type: "Double",
      gender: "Female",
      saved: false,
      city: "dharwad",
    },
    {
      id: 9,
      title: "AGRI PG",
      location: "PB Road, Dharwad",
      price: 2500,
      image: "\placeholder-id9.jpg?height=200&width=300",
      amenities: [ "AC", "Common Bathroom"],
      rating: 4.6,
      reviews: 30,
      type: "Double",
      gender: "Male",
      saved: false,
      city: "dharwad",
    },
    {
      id: 10,
      title: "TRIVENI PAYING GUEST",
      location: "Saptapur, Dharwad",
      price: 3000,
      image: "\placeholder-id10.jpg?height=200&width=300",
      amenities: [ "AC", "Common Bathroom"],
      rating: 4.6,
      reviews: 30,
      type: "Double",
      gender: "Male",
      saved: false,
      city: "dharwad",
    },
    {
      id: 11,
      title: "BED IN A 2 BHK APARTMENT",
      location: "Kalyan Nagar, Dharwad",
      price: 2000,
      image: "\placeholder-id11.jpg?height=200&width=300",
      amenities: [ "Common Bathroom",],
      rating: 4.6,
      reviews: 30,
      type: "Double",
      gender: "Unisex",
      saved: false,
      city: "dharwad",
    },
    {
      id: 12,
      title: "BED IN A 1 BHK APARTMENT",
      location: "Shivagiri, Dharwad",
      price: 5000,
      image: "\placeholder-id12.jpg?height=200&width=300",
      amenities: [ "Wifi", "Attached Bathroom",],
      rating: 4.6,
      reviews: 30,
      type: "Double",
      gender: "Unisex",
      saved: false,
      city: "dharwad",
    },
  ]

  // Function to fetch user-added PG listings from the API
  const fetchUserAddedListings = async () => {
    try {
      setIsLoading(true);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort(new DOMException('Timeout', 'TimeoutError'));
      }, 10000); // 10 second timeout
      
      try {
        const response = await fetch('/api/pg', {
          signal: controller.signal,
          cache: 'no-store'
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched PG listings:', data);
        
        // Format the data to match our listing structure
        const formattedListings = data.map((item: any) => ({
          id: item._id || item.id,
          title: item.title,
          location: item.location,
          price: item.price,
          image: item.images && item.images.length > 0 ? item.images[0] : '/placeholder-hostel.jpg',
          amenities: item.amenities || [],
          rating: item.rating || 4.0,
          reviews: item.reviews?.length || 0,
          type: item.roomType,
          gender: item.gender,
          saved: false,
          city: item.city.toLowerCase(),
          _id: item._id, // Ensure the MongoDB ID is preserved
        }));
        
        setUserAddedListings(formattedListings);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'TimeoutError') {
          console.error('API request timed out');
          showToast('Could not load listings - request timed out', 'error');
        } else {
          console.error('Error fetching PG listings:', error);
          // We'll still show static data, so only show error if debugging
          if (process.env.NODE_ENV === 'development') {
            showToast('Error loading PG listings, showing static data instead', 'warning');
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchUserAddedListings();
  }, []);

  // Combine static and user-added listings
  const allPgListings = [...staticPgListings, ...userAddedListings]

  // Apply filters and return the filtered PG listings
  const getFilteredPgListings = () => {
    // Combine both static and dynamic listings
    const allListings = [...staticPgListings, ...userAddedListings];
    
    // Apply filters
    return allListings.filter(pg => {
      // Filter by price
      if (pg.price < priceRange[0] || pg.price > priceRange[1]) return false;
      
      // Filter by city
      if (city !== 'all' && pg.city.toLowerCase() !== city.toLowerCase()) return false;
      
      // Filter by gender
      if (gender !== 'all' && pg.gender !== gender) return false;
      
      // Filter by room type
      const hasSelectedRoomType = Object.entries(selectedRoomTypes).some(
        ([type, isSelected]) => isSelected && pg.type.toLowerCase() === type.toLowerCase()
      );
      if (Object.values(selectedRoomTypes).some(value => value) && !hasSelectedRoomType) return false;
      
      // Filter by amenities
      const selectedAmenitiesArray = Object.entries(selectedAmenities)
        .filter(([_, isSelected]) => isSelected)
        .map(([amenity]) => {
          switch(amenity) {
            case 'wifi': return 'WiFi';
            case 'attachedBathroom': return 'Attached Bathroom';
            case 'ac': return 'AC';
            case 'food': return 'Food';
            default: return amenity;
          }
        });
      
      if (selectedAmenitiesArray.length > 0) {
        const hasAllSelectedAmenities = selectedAmenitiesArray.every(
          amenity => pg.amenities.includes(amenity)
        );
        if (!hasAllSelectedAmenities) return false;
      }
      
      // Filter by rating
      if (selectedRatings.rating4plus && pg.rating < 4) return false;
      if (selectedRatings.rating3plus && pg.rating < 3) return false;
      
      // Filter by search term
      if (searchTerm) {
        const lowercaseSearchTerm = searchTerm.toLowerCase();
        const matchesSearch = 
          pg.title.toLowerCase().includes(lowercaseSearchTerm) ||
          pg.location.toLowerCase().includes(lowercaseSearchTerm) ||
          pg.city.toLowerCase().includes(lowercaseSearchTerm);
        if (!matchesSearch) return false;
      }
      
      return true;
    }).sort((a, b) => {
      // Apply sorting
      switch (sortBy) {
        case 'price_low_high':
          return a.price - b.price;
        case 'price_high_low':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'recommended':
        default:
          // Default sort by rating first, then by price
          if (b.rating !== a.rating) {
            return b.rating - a.rating;
          }
          return a.price - b.price;
      }
    });
  }

  const filteredPgListings = getFilteredPgListings()

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  const handleLikeClick = (id: number) => {
    

    // In a real app, this would call an API to save the PG
    showToast("PG added to favorites!", "success")
  }

  const handlePGClick = (id: any) => {
    // Use MongoDB _id when available, otherwise use the numeric id
    router.push(`/explore/${id}`)
  }

  // Handle checkbox changes for room types
  const handleRoomTypeChange = (type: RoomType) => {
    setSelectedRoomTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  // Handle checkbox changes for amenities
  const handleAmenityChange = (amenity: Amenity) => {
    setSelectedAmenities(prev => ({
      ...prev,
      [amenity]: !prev[amenity]
    }))
  }

  // Handle checkbox changes for ratings
  const handleRatingChange = (rating: Rating) => {
    setSelectedRatings(prev => ({
      ...prev,
      [rating]: !prev[rating]
    }))
  }

  const handleSearch = () => {
    // The search functionality is already handled by the useEffect above
    // This function is just for the search button click event
    // You could add additional feedback here if needed
  }

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("")
    setCity("all")
    setGender("all")
    setPriceRange([2000, 8000])
    setSelectedRoomTypes({
      single: false,
      double: false,
      triple: false,
    })
    setSelectedAmenities({
      wifi: false,
      food: false,
      ac: false,
      attachedBathroom: false,
    })
    setSelectedRatings({
      rating4plus: false,
      rating3plus: false,
    })
    setSortBy("recommended")
  }

  // Add a button for admins to add new PG listing
  const AddPgButton = () => {
    const { user, isAuthenticated } = useAuth();
    
    // Only show for authenticated admin users
    if (!isAuthenticated || user?.userType !== 'admin') {
      return null;
    }
    
    return (
      <a href="/dashboard/add-pg" 
        className="fixed bottom-5 right-5 z-10 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md shadow-lg"
      >
        Add Your PG
      </a>
    );
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Explore PG Accommodations in Hubli-Dharwad</h1>

      {/* Search and Filter Bar */}
      <div className="bg-card rounded-lg shadow-sm p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Search by location, name, etc." 
              className="pl-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger>
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                <SelectItem value="hubli">Hubli</SelectItem>
                <SelectItem value="dharwad">Dharwad</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-48">
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger>
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="unisex">Unisex</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={toggleFilters} variant="outline" className="md:w-auto">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button className="md:w-auto" onClick={handleSearch}>
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Advanced Filters</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Reset All
                </Button>
                <Button variant="ghost" size="sm" onClick={toggleFilters}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Price Range (₹/month)</h4>
                <div className="px-2">
                  <Slider
                    min={1000}
                    max={10000}
                    step={500}
                    value={priceRange}
                    onValueChange={setPriceRange}
                  />
                  <div className="flex justify-between mt-2 text-sm">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Room Type</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="single" 
                      checked={selectedRoomTypes.single}
                      onCheckedChange={() => handleRoomTypeChange("single")}
                    />
                    <Label htmlFor="single">Single</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="double" 
                      checked={selectedRoomTypes.double}
                      onCheckedChange={() => handleRoomTypeChange("double")}
                    />
                    <Label htmlFor="double">Double</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="triple" 
                      checked={selectedRoomTypes.triple}
                      onCheckedChange={() => handleRoomTypeChange("triple")}
                    />
                    <Label htmlFor="triple">Triple</Label>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Amenities</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="wifi" 
                      checked={selectedAmenities.wifi}
                      onCheckedChange={() => handleAmenityChange("wifi")}
                    />
                    <Label htmlFor="wifi">WiFi</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="food" 
                      checked={selectedAmenities.food}
                      onCheckedChange={() => handleAmenityChange("food")}
                    />
                    <Label htmlFor="food">Food</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="ac" 
                      checked={selectedAmenities.ac}
                      onCheckedChange={() => handleAmenityChange("ac")}
                    />
                    <Label htmlFor="ac">AC</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="attached-bathroom" 
                      checked={selectedAmenities.attachedBathroom}
                      onCheckedChange={() => handleAmenityChange("attachedBathroom")}
                    />
                    <Label htmlFor="attached-bathroom">Attached Bathroom</Label>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Rating</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="rating-4plus" 
                      checked={selectedRatings.rating4plus}
                      onCheckedChange={() => handleRatingChange("rating4plus")}
                    />
                    <Label htmlFor="rating-4plus">4+ Stars</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="rating-3plus" 
                      checked={selectedRatings.rating3plus}
                      onCheckedChange={() => handleRatingChange("rating3plus")}
                    />
                    <Label htmlFor="rating-3plus">3+ Stars</Label>
                  </div>
                </div>
                <Button className="mt-4 w-full" size="sm" onClick={toggleFilters}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-medium">{filteredPgListings.length} PG Accommodations Found</h2>
          <p className="text-sm text-muted-foreground">
            {city === "all"
              ? "Showing all available PGs in Hubli-Dharwad"
              : `Showing PGs in ${city.charAt(0).toUpperCase() + city.slice(1)}`}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">Recommended</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>
          <Tabs value={viewType} onValueChange={setViewType} className="hidden md:block">
            <TabsList>
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* PG Listings */}
      {filteredPgListings.length > 0 ? (
        viewType === "grid" ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPgListings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden">
                <div className="relative">
                  <div className="relative h-48 cursor-pointer" onClick={() => handlePGClick(listing._id || listing.id)}>
                    <Image src={listing.image || "/placeholder.svg"} alt={listing.title} fill className="object-cover" />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`absolute top-2 right-2 rounded-full bg-background/80 ${
                      listing.saved ? "text-red-500" : "text-muted-foreground"
                    }`}
                    onClick={() => handleLikeClick(listing.id)}
                  >
                    <Heart className="h-5 w-5" fill={listing.saved ? "currentColor" : "none"} />
                  </Button>
                  <Badge className="absolute top-2 left-2">{listing.gender}</Badge>
                </div>
                <CardContent className="p-6 cursor-pointer" onClick={() => handlePGClick(listing._id || listing.id)}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold">{listing.title}</h3>
                    <Badge variant="outline" className="text-primary">
                      ₹{listing.price}/mo
                    </Badge>
                  </div>
                  <div className="flex items-center text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{listing.location}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {listing.amenities.includes("WiFi") && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Wifi className="h-3 w-3" />
                        WiFi
                      </Badge>
                    )}
                    {listing.amenities.includes("Food") && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Utensils className="h-3 w-3" />
                        Food
                      </Badge>
                    )}
                    {listing.amenities.includes("Attached Bathroom") && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <ShowerHead className="h-3 w-3" />
                        Bathroom
                      </Badge>
                    )}
                    {listing.amenities.includes("AC") && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Wind className="h-3 w-3" />
                        AC
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="text-yellow-500 mr-1">★</div>
                      <span className="font-medium">{listing.rating}</span>
                      <span className="text-muted-foreground text-sm ml-1">({listing.reviews} reviews)</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handlePGClick(listing._id || listing.id)}>
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPgListings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="relative md:w-1/3">
                    <div className="relative h-48 md:h-full cursor-pointer" onClick={() => handlePGClick(listing._id || listing.id)}>
                      <Image
                        src={listing.image || "/placeholder.svg"}
                        alt={listing.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`absolute top-2 right-2 rounded-full bg-background/80 ${
                        listing.saved ? "text-red-500" : "text-muted-foreground"
                      }`}
                      onClick={() => handleLikeClick(listing.id)}
                    >
                      <Heart className="h-5 w-5" fill={listing.saved ? "currentColor" : "none"} />
                    </Button>
                    <Badge className="absolute top-2 left-2">{listing.gender}</Badge>
                  </div>
                  <CardContent className="p-6 md:w-2/3 cursor-pointer" onClick={() => handlePGClick(listing._id || listing.id)}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold">{listing.title}</h3>
                      <Badge variant="outline" className="text-primary">
                        ₹{listing.price}/mo
                      </Badge>
                    </div>
                    <div className="flex items-center text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{listing.location}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {listing.amenities.includes("WiFi") && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Wifi className="h-3 w-3" />
                          WiFi
                        </Badge>
                      )}
                      {listing.amenities.includes("Food") && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Utensils className="h-3 w-3" />
                          Food
                        </Badge>
                      )}
                      {listing.amenities.includes("Attached Bathroom") && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <ShowerHead className="h-3 w-3" />
                          Bathroom
                        </Badge>
                      )}
                      {listing.amenities.includes("AC") && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Wind className="h-3 w-3" />
                          AC
                        </Badge>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="text-yellow-500 mr-1">★</div>
                        <span className="font-medium">{listing.rating}</span>
                        <span className="text-muted-foreground text-sm ml-1">({listing.reviews} reviews)</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Contact
                        </Button>
                        <Button size="sm" onClick={() => handlePGClick(listing._id || listing.id)}>View Details</Button>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-16">
          <h3 className="text-xl font-medium mb-2">No PG Accommodations Found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your filters or search criteria</p>
          <Button onClick={resetFilters}>Reset All Filters</Button>
        </div>
      )}

      {/* Conditionally show a loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Authentication Required Modal */}
      <AuthRequiredModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} redirectUrl={redirectUrl} />

      {/* Add the button */}
      <AddPgButton />
    </div>
  )
}