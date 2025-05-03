import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { MapPin, CalendarDays, DollarSign } from 'lucide-react';
import Destination1 from '../assets/Destination1.png';
import Destination2 from '../assets/Destination2.png';
import Destination3 from '../assets/Destination3.png';
import Destination4 from '../assets/Destination4.png';
import Destination5 from '../assets/Destination5.png';
import Destination6 from '../assets/Destination6.png';

// Helper function to calculate days remaining
function calculateDaysRemaining(startDateString) {
  if (!startDateString) return null;
  const today = new Date();
  const startDate = new Date(startDateString);

  // Set time to 00:00:00 to compare dates only
  today.setHours(0, 0, 0, 0);
  startDate.setHours(0, 0, 0, 0);

  if (isNaN(startDate.getTime()) || startDate < today) {
    return null; // Invalid date or date in the past
  }

  const timeDiff = startDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return daysRemaining;
}

const Destinations = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

  // Fetch trips from the API on component mount
  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/trips?limit=4`); 
        if (!response.ok) {
          throw new Error(`Failed to fetch trips: ${response.statusText}`);
        }
        const data = await response.json();
        setTrips(data || []); // Ensure trips is always an array
      } catch (err) {
        setError(err.message || 'Failed to load destinations.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  // Limit trips for the preview
  const featuredTrips = trips.slice(0, 4);

  return (
    <section id="destinations-preview" className="py-16 md:py-24 bg-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading Section */}
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <h3 className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-2"> 
            Start Your Adventure
          </h3>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-cyan-600 leading-tight inline-block">
            Featured Destinations
          </h2>
        </div>

        {/* Loading and Error States */}
        {loading && <div className="text-center py-10 text-lg font-medium text-cyan-700">Loading destinations...</div>}
        {error && <div className="text-center py-10 text-red-600 bg-red-100 p-4 rounded-lg">Error: {error}</div>}

        {/* Destination Cards Grid */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
              {featuredTrips.length > 0 ? (
                featuredTrips.map((trip) => {
                  // Calculate days remaining for badge
                  const daysLeft = calculateDaysRemaining(trip.start_date);
                  // Calculate savings for pricing display
                  const originalCost = parseFloat(trip.original_cost);
                  const finalCost = parseFloat(trip.cost);
                  let savings = null;
                  let percentage = null;
                  if (!isNaN(originalCost) && !isNaN(finalCost) && originalCost > finalCost) {
                    savings = originalCost - finalCost;
                    percentage = Math.round((savings / originalCost) * 100);
                  }

                  return (
                    // Card Wrapper - includes image and content area
                    <div 
                      key={trip.id} 
                      className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 border border-gray-200 hover:shadow-cyan-100/50 flex flex-col"
                    >
                      {/* Image Area */}
                      <div className="relative">
                        <img 
                          src={trip.card_img || '/placeholder-image.png'}
                          alt={trip.title} 
                          className="w-full h-60 object-cover" // Adjusted image height
                        />
                      </div>

                      {/* Content Area - below the image */}
                      <div className="p-5 flex flex-col flex-grow">
                        {/* Badges Area - Top of content */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {/* Custom Badge */}
                          {trip.badge ? (
                            <span className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-xs font-semibold">
                              {trip.badge}
                            </span>
                          ) : null}
                          {/* Upcoming Tour Badge */}
                          {trip.is_upcoming ? (
                            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold">
                              Coming Soon
                            </span>
                          ) : null}
                          {/* Days Left Badge */}
                          {(daysLeft !== null && daysLeft >= 0 && !trip.is_upcoming) ? (
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                              {daysLeft === 0 ? "Starts Today!" : `${daysLeft} Day${daysLeft > 1 ? 's' : ''} Left!`}
                            </span>
                          ) : null}
                          {/* Limited Seats Badge */}
                          {(trip.total_seats > 0 && trip.remaining_seats !== null && trip.remaining_seats <= 10 && trip.remaining_seats > 0) ? (
                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                              Only {trip.remaining_seats} Spot{trip.remaining_seats > 1 ? 's' : ''} Left!
                            </span>
                          ) : null}
                        </div>

                        {/* Title & Subtitle */}
                        <h4 className="text-lg font-bold mb-1 text-gray-900 line-clamp-2">{trip.title}</h4>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-1">{trip.card_subtitle}</p>
                        
                        {/* Spacer to push content below to bottom */}
                        <div className="flex-grow"></div> 

                        {/* Details Section (Duration, Pricing) */}  
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center mb-4">
                            {/* Duration */}
                            <div className="flex items-center gap-1.5 text-sm text-gray-700">
                              <CalendarDays className="w-4 h-4 text-cyan-600 flex-shrink-0" strokeWidth={2} />
                              <span>{trip.duration}</span>
                            </div>

                            {/* Pricing Block */}
                            <div className="text-right flex-shrink-0 pl-3">
                              {originalCost > 0 && originalCost > finalCost && (
                                <div className="text-xs text-gray-500 line-through">
                                  ₹{originalCost.toLocaleString()}
                                </div>
                              )}
                              <div className="text-lg font-bold text-cyan-700">
                                ₹{finalCost ? finalCost.toLocaleString() : 'N/A'}
                              </div>
                              {savings !== null && percentage !== null && (
                                <div className="text-xs font-medium text-green-600 mt-0.5">
                                  Save ₹{savings.toLocaleString()} ({percentage}%)
                                </div>
                              )}
                            </div>
                          </div>

                          {/* View Details Button */}
                          <NavLink 
                            to={trip.is_upcoming ? "#" : `/destination/${trip.id}`} // Disable link for upcoming
                            className={`block w-full px-5 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 transition-colors text-center ${trip.is_upcoming ? 'opacity-70 cursor-not-allowed' : ''}`}
                            onClick={(e) => trip.is_upcoming && e.preventDefault()} // Prevent navigation for upcoming
                          >
                            {trip.is_upcoming ? 'Details Coming Soon' : 'View Details'}
                          </NavLink>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center col-span-full py-10 text-gray-500 text-lg">No featured destinations available right now.</p>
              )}
            </div>

            {/* --- View All Button --- */}
            {trips.length > 4 && (
              <div className="text-center mt-12 md:mt-16">
                <NavLink 
                  to="/destinations"
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 transition-colors duration-200"
                >
                  View All Destinations
                </NavLink>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Destinations;
