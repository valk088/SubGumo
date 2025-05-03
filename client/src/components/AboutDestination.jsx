import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, Star, Heart, Calendar, Check, Info, Sparkles, Trees, Utensils, Car, Wifi, Image as ImageIcon, ArrowLeft, Share2, Copy, Twitter, Facebook, Download } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import { ItineraryTimeline } from "./ItineraryTimeline";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "./ui/badge";

// Trip Details Card Component - TODO: Ensure it uses props correctly
const TripDetailsCard = ({ destination }) => { 
  // Use maps_iframe if available
  return (
    <Card>
      <CardHeader><CardTitle>Trip Details</CardTitle></CardHeader>
      <CardContent>
        <div className="flex justify-between items-center border-b pb-3">
          <span className="text-gray-600 text-sm">Starts from</span>
          <span className="text-xl font-bold text-gray-900">
            ₹{destination.cost}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm border-b py-3">
          <span className="text-gray-600 flex items-center gap-1.5">
            <Calendar className="w-4 h-4" /> Duration
          </span>
          <span className="font-medium text-gray-800">
            {destination.duration}
          </span>
        </div>
        <p className="text-sm text-gray-500 pt-2">
          Ready to plan your adventure? Send us an enquiry for more details.
        </p>
        <Button className="w-full h-10 mt-2 hidden lg:flex" variant="default" asChild>
          <Link to="/IForm">Contact Us</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

// Location Card Component
const LocationCard = ({ destination }) => { 
  // Use maps_iframe if available
  return (
    <Card>
      <CardHeader><CardTitle>Location</CardTitle></CardHeader>
      <CardContent>
        <p className="mb-2">{destination?.location_name || 'Location details unavailable.'}</p>
        {destination?.maps_iframe ? (
          <div className="aspect-video overflow-hidden rounded-md">
            <iframe 
              src={destination.maps_iframe} 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade">
            </iframe>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Map preview unavailable.</p>
        )}
      </CardContent>
    </Card>
  );
};

// Main Component
export default function AboutDestination() {
  // --- ALL HOOKS MUST BE AT THE TOP ---
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'; // Use environment variable or fallback

  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("about");
  const [showShareToast, setShowShareToast] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [showShareDialog, setShowShareDialog] = useState(false);

  const aboutRef = useRef(null);
  const featuresRef = useRef(null); 
  const timelineRef = useRef(null); 

  // --- EFFECTS (AFTER HOOKS) ---
  useEffect(() => {
    const fetchTripDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/trips/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Trip not found.");
          } else {
            throw new Error("Failed to fetch trip details");
          }
        }
        const data = await response.json();
        // Parse itinerary_data if it's a string
        const parsedTrip = {
          ...data,
          itinerary_data: typeof data.itinerary_data === 'string'
                          ? JSON.parse(data.itinerary_data)
                          : (data.itinerary_data || []) // Ensure it's an array
        };
        setTrip(parsedTrip);
      } catch (err) {
        console.error("Fetch trip details error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTripDetails();
    }
  }, [id]); // Re-fetch if ID changes

  useEffect(() => {
    const handleScroll = () => {
      if (!aboutRef.current || !featuresRef.current || !timelineRef.current) return;

      const aboutTop = aboutRef.current.getBoundingClientRect().top;
      const featuresTop = featuresRef.current.getBoundingClientRect().top; 
      const timelineTop = timelineRef.current.getBoundingClientRect().top;
      
      // Buffer zone for determining active section
      const buffer = 150;

      if (timelineTop <= buffer) {
        setActiveTab("timeline");
      } else if (featuresTop <= buffer) {
        setActiveTab("features");
      } else {
        setActiveTab("about");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- CONDITIONAL RETURNS (AFTER ALL HOOKS & EFFECTS) ---
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading trip details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-red-500">
        <p>Error: {error}</p>
        <Link to="/destinations" className="mt-4 text-blue-500 hover:underline">
          Back to Destinations
        </Link>
      </div>
    );
  }

  if (!trip) {
    return (
       <div className="flex flex-col justify-center items-center min-h-screen">
        <p>Sorry, the requested trip could not be found.</p>
        <Link to="/destinations" className="mt-4 text-blue-500 hover:underline">
          Back to Destinations
        </Link>
      </div>
    );
  }

  // Image Carousel images from gallery_images or fallbacks
  const carouselImages = 
    trip && trip.gallery_images && trip.gallery_images.length > 0
      ? trip.gallery_images
      : trip
      ? [trip.info_img, trip.card_img].filter(Boolean) // Use info/card img if gallery missing
      : [];

  // Ensure there's at least one image for the carousel, even if it's a placeholder
  if (carouselImages.length === 0) {
    carouselImages.push("/placeholder.jpg");
  }

  // Function to handle sharing
  const handleShare = async () => {
    if (!trip) return;

    const shareData = {
      title: trip.title,
      text: `Check out ${trip.title} on SabGumo Travel!`,
      url: window.location.href,
    };

    // On mobile devices with Web Share API, use that directly
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        setShareMessage("Shared successfully!");
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 3000);
      } catch (error) {
        console.error("Error sharing:", error);
        setShareMessage("Could not share. Try again later.");
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 3000);
      }
    } else {
      // On desktop, show the share dialog
      setShowShareDialog(true);
    }
  };

  // Function to copy link to clipboard
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareMessage("Link copied to clipboard!");
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
      setShowShareDialog(false);
    } catch (error) {
      console.error("Error copying:", error);
      setShareMessage("Could not copy link. Try again later.");
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    }
  };

  // Prepare sharing URLs
  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(trip ? trip.title : "Check out this destination");
  const shareText = encodeURIComponent(`Check out ${trip ? trip.title : "this destination"} on SabGumo Travel!`);

  // URLs for different social platforms
  const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
  const whatsappUrl = `https://wa.me/?text=${shareText}%20${shareUrl}`;

  // Function to scroll to a section
  const scrollToSection = (sectionId) => {
    const sectionRef = 
      sectionId === "about" ? aboutRef :
      sectionId === "features" ? featuresRef : 
      sectionId === "timeline" ? timelineRef : null;
    
    if (sectionRef && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveTab(sectionId);
    }
  };

  return (
    <div className="bg-white min-h-screen pb-16 md:pb-0">
      <div className="container mx-auto px-4 pt-20 md:pt-24 pb-12">

        {/* Back Button (making it more prominent and ensuring it's not hidden) */}
        <div className="mb-6 flex items-center justify-between relative z-30">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="text-gray-700 hover:text-gray-900 bg-white border-gray-200 shadow-md rounded-full h-10 w-10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="sr-only">Back</span>
          </Button>
          
          {/* Share button */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="text-gray-700 hover:text-gray-900 bg-white border-gray-200 shadow-sm rounded-full h-10 w-10 flex items-center justify-center"
              onClick={handleShare}
              aria-label="Share"
            >
              <Share2 className="w-5 h-5" />
              <span className="sr-only">Share</span>
            </Button>
          </div>
        </div>

        {/* Share Dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Share this destination</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col space-y-3">
                <div className="flex justify-center space-x-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300"
                    asChild
                  >
                    <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
                      <Facebook className="h-5 w-5 text-blue-600" />
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-sky-50 border-sky-200 hover:bg-sky-100 hover:border-sky-300"
                    asChild
                  >
                    <a href={twitterUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on Twitter">
                      <Twitter className="h-5 w-5 text-sky-500" />
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300"
                    asChild
                  >
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">
                      <FaWhatsapp className="h-5 w-5 text-green-600" />
                    </a>
                  </Button>
                </div>
                
                <div className="relative mt-4">
                  <div className="flex items-center border rounded-md overflow-hidden bg-gray-50">
                    <input
                      className="w-full py-2 px-3 text-sm bg-transparent border-none outline-none text-gray-700"
                      value={window.location.href}
                      readOnly
                    />
                    <Button
                      type="button"
                      variant="ghost" 
                      className="p-2 h-full border-l"
                      onClick={copyLink}
                    >
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copy</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Share Toast Notification */}
        {showShareToast && (
          <div className="fixed top-20 right-4 bg-black/80 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-in fade-in duration-300">
            {shareMessage}
          </div>
        )}

        {/* Image Grid Section */} 
        <div className="mb-6 overflow-hidden">
          <div className="relative h-[60vh] overflow-hidden rounded-lg">
            <div 
              className="flex transition-transform duration-300 ease-out h-full"
            >
              {carouselImages.map((img, index) => (
                <div key={index} className="min-w-full h-full flex-shrink-0 relative">
                  <img 
                    src={img} 
                    alt={`Destination view ${index + 1}`} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Title Section (moved below images) */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4 mt-6">
          {trip.title}
        </h1>

        {/* Header Section (Rating, Reviews, Actions) */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-y-3">
          <div className="flex items-center gap-6 flex-wrap">
            {/* Rating */}
            <div className="flex items-center">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={`${
                      i < 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">
                {trip.rating ? trip.rating.toFixed(1) : 'N/A'} ({trip.reviews_count || 0} reviews)
              </span>
            </div>
            
            {/* Location */}
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="w-4 h-4 mr-1 text-blue-600" />
              <span>{trip.location_name}</span>
            </div>
          </div>

          {/* Download PDF Button */}
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 text-gray-700 border-gray-200"
            asChild={!!trip.pdfUrl}
            disabled={!trip.pdfUrl}
          >
            {trip.pdfUrl ? (
              <a
                href={trip.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </a>
            ) : (
              <span className="flex items-center gap-1.5">
                <Download className="w-4 h-4" />
                <span>PDF Unavailable</span>
              </span>
            )}
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column with Scrolling Tabs */} 
          <div className="lg:col-span-2">
            {/* Tabs Navigation */}
            <div className="mb-6 sticky top-16 z-20 pt-2 pb-3 bg-gray-50">
              <div className="grid w-full grid-cols-3 bg-gray-100 rounded-md h-11">
                <button 
                  onClick={() => scrollToSection("about")}
                  className={`flex items-center justify-center rounded-sm h-full text-sm font-medium ${
                    activeTab === "about" 
                      ? "bg-white text-blue-600 shadow-sm" 
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  About
                </button>
                <button 
                  onClick={() => scrollToSection("features")}
                  className={`flex items-center justify-center rounded-sm h-full text-sm font-medium ${
                    activeTab === "features" 
                      ? "bg-white text-blue-600 shadow-sm" 
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Features
                </button>
                <button 
                  onClick={() => scrollToSection("timeline")}
                  className={`flex items-center justify-center rounded-sm h-full text-sm font-medium ${
                    activeTab === "timeline" 
                      ? "bg-white text-blue-600 shadow-sm" 
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Itinerary
                </button>
              </div>
            </div>
            
            {/* Trip details cards for mobile view only */}
            <div className="lg:hidden space-y-8 mb-12">
              <TripDetailsCard destination={trip} />
              <LocationCard destination={trip} />
            </div>
            
            {/* Sections Content - All rendered directly */}
            <div className="space-y-12">
              {/* About Section */}
              <section ref={aboutRef} id="about" className="scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4">About this Destination</h2>
                <p className="text-gray-700 leading-relaxed">
                  {trip.description || trip.subtitle || "No description available."}
                </p>
              </section>
              
              {/* Features Section - Moved up */}
              <section ref={featuresRef} id="features" className="scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-gray-800">
                  {trip.features && trip.features.length > 0 ? (
                    trip.features.map((feature, index) => {
                      // Handle both string format and object format
                      const featureText = typeof feature === 'string' ? feature : feature.text;
                      return (
                        <div key={index} className="flex items-center text-sm">
                          <Check className="w-5 h-5 text-blue-600 mr-2" />
                          <span>{featureText}</span>
                        </div>
                      );
                    })
                  ) : (
                    <span className="text-sm text-gray-500 col-span-full">No specific highlights listed.</span>
                  )}
                </div>
              </section>
              
              {/* Itinerary Section - Moved down */}
              <section ref={timelineRef} id="timeline" className="scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4">Daily Itinerary</h2>
                <ItineraryTimeline itineraryData={trip.itinerary_data} />
              </section>
            </div>
          </div>

          {/* Sidebar Column - Desktop Only */} 
          <div className="hidden lg:block lg:col-span-1">
             <div className="sticky top-28 space-y-8" style={{ willChange: 'transform' }}>
               <TripDetailsCard destination={trip} />
               <LocationCard destination={trip} />
             </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Price Bar - Mobile Only */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-3 flex justify-between items-center z-50 lg:hidden">
        <div className="flex flex-col">
          <span className="text-gray-500 text-xs">Price starts from</span>
          <span className="text-2xl font-bold text-gray-900">₹{trip.cost}</span>
          {trip.original_cost && (
            <span className="text-xs text-gray-500 line-through">
              ₹{trip.original_cost}
            </span>
          )}
        </div>
        <Button size="lg" className="px-8" asChild>
          <Link to="/IForm">Enquire Now</Link>
        </Button>
      </div>
    </div>
  );
}
