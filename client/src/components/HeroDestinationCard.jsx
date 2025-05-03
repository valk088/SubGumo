import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { MapPin, CalendarDays, Clock, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

const HeroDestinationCard = () => {
  const [latestTrip, setLatestTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

  useEffect(() => {
    const fetchLatestTrip = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all trips
        const response = await fetch(`${API_URL}/trips`);
        if (!response.ok) {
          throw new Error(`Failed to fetch trips: ${response.statusText}`);
        }
        const data = await response.json();
        
        // Find the most recent upcoming trip based on start_date
        const upcomingTrips = data
          .filter(trip => trip.start_date && new Date(trip.start_date) >= new Date())
          .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
        
        if (upcomingTrips.length > 0) {
          setLatestTrip(upcomingTrips[0]);
        } else {
          // If no upcoming trips, just use the first trip in the list
          setLatestTrip(data[0] || null);
        }
      } catch (err) {
        setError(err.message || 'Failed to load latest trip.');
        console.error('Error fetching latest trip:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestTrip();
  }, []);

  // If loading or error or no trip found, don't render anything
  if (loading || error || !latestTrip) {
    return null;
  }

  // Calculate days remaining
  const calculateDaysRemaining = () => {
    if (!latestTrip.start_date) return null;
    const today = new Date();
    const startDate = new Date(latestTrip.start_date);
    
    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    
    if (isNaN(startDate.getTime()) || startDate < today) {
      return null;
    }
    
    const timeDiff = startDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const daysRemaining = calculateDaysRemaining();

  return (
    <section className="py-8 md:py-12 bg-gradient-to-b from-white to-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl shadow-xl">
          {/* Background Image with Gradient Overlay */}
          <div className="absolute inset-0">
            <img 
              src={latestTrip.info_img || latestTrip.card_img || '/placeholder-image.jpg'} 
              alt={latestTrip.title}
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent"></div>
          </div>
          
          {/* Content */}
          <div className="relative px-6 py-12 sm:px-12 sm:py-16 md:py-20 lg:py-24 flex flex-col items-start max-w-2xl">
            {/* Badge */}
            <div className="mb-4 flex gap-2">
              <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
                Featured Trip
              </span>
              {daysRemaining !== null && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                  {daysRemaining === 0 ? "Starts Today!" : `${daysRemaining} Day${daysRemaining > 1 ? 's' : ''} Left!`}
                </span>
              )}
            </div>
            
            {/* Title */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-sm">
              {latestTrip.title}
            </h2>
            
            {/* Subtitle */}
            <p className="text-lg text-white/90 mb-6 max-w-xl drop-shadow-sm">
              {latestTrip.subtitle || latestTrip.card_subtitle || latestTrip.description?.substring(0, 120) + '...'}
            </p>
            
            {/* Details */}
            <div className="flex flex-wrap gap-4 mb-8">
              {latestTrip.name && (
                <div className="flex items-center text-white/90">
                  <MapPin className="w-5 h-5 mr-1.5 text-amber-300" />
                  <span>{latestTrip.name}</span>
                </div>
              )}
              {latestTrip.duration && (
                <div className="flex items-center text-white/90">
                  <Clock className="w-5 h-5 mr-1.5 text-amber-300" />
                  <span>{latestTrip.duration}</span>
                </div>
              )}
              {latestTrip.cost && (
                <div className="flex items-center text-white/90">
                  <span className="font-semibold text-amber-300 mr-1.5">₹</span>
                  <span>{latestTrip.cost} <span className="text-sm opacity-75">onwards</span></span>
                </div>
              )}
            </div>
            
            {/* CTA Button */}
            <Button 
              asChild
              size="lg" 
              className="bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-full px-8"
            >
              <NavLink to={`/destination/${latestTrip.id}`} className="inline-flex items-center">
                View Trip Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </NavLink>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroDestinationCard;
