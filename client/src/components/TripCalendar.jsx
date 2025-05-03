import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { NavLink } from 'react-router-dom';
import 'react-calendar/dist/Calendar.css';
import './TripCalendar.css'; // Import custom styles
import { CalendarDays, MapPin, X } from 'lucide-react'; // Import icons, Add X for close

// Helper to format date to YYYY-MM-DD for comparison
const formatDate = (date) => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const TripCalendar = () => { 
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [allTrips, setAllTrips] = useState([]);
    const [tripsForSelectedDate, setTripsForSelectedDate] = useState([]);
    const [tripDates, setTripDates] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // --- Modal State --- 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItinerary, setSelectedItinerary] = useState(null);
    const [selectedTripTitle, setSelectedTripTitle] = useState(''); // To show in modal title

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

    // --- Fetching Logic --- 
    useEffect(() => {
      const fetchAllTrips = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`${API_URL}/trips`);
          if (!response.ok) {
            throw new Error('Failed to fetch trips');
          }
          const data = await response.json();
          // Ensure itinerary_data is parsed if it's a string
          const parsedTrips = (data || []).map(trip => ({
            ...trip,
            itinerary_data: typeof trip.itinerary_data === 'string' 
                              ? JSON.parse(trip.itinerary_data) 
                              : trip.itinerary_data || [], // Default to empty array if null/undefined
          }));
          setAllTrips(parsedTrips);

          const datesWithTrips = new Set();
          parsedTrips.forEach(trip => {
            if (trip.start_date) { datesWithTrips.add(trip.start_date); }
          });
          setTripDates(datesWithTrips);

        } catch (err) {
          console.error("Fetch trips error:", err);
          // Handle potential JSON parsing errors during fetch
          if (err instanceof SyntaxError) {
              setError('Failed to parse trip data (invalid format).');
          } else {
              setError(err.message);
          }
        } finally {
          setLoading(false);
        }
      };
      fetchAllTrips();
    }, []);

    // --- Filtering Logic --- 
    useEffect(() => {
      const formattedDate = formatDate(selectedDate);
      if (formattedDate && allTrips.length > 0) {
        const filtered = allTrips.filter(trip => trip.start_date === formattedDate);
        setTripsForSelectedDate(filtered);
      } else {
        setTripsForSelectedDate([]);
      }
    }, [selectedDate, allTrips]);

    // --- Tile Highlighting Logic (identical to previous) ---
    const tileClassName = ({ date, view }) => {
      if (view === 'month') {
        const formattedDate = formatDate(date);
        if (tripDates.has(formattedDate)) {
          return 'highlight-trip-date';
        }
      }
      return null;
    };

    // --- Modal Handlers ---
    const handleViewItinerary = (itinerary, title) => {
        // Double check if itinerary needs parsing (should be done at fetch now)
        let parsedItinerary = itinerary;
        if (typeof itinerary === 'string') {
            try {
                parsedItinerary = JSON.parse(itinerary);
            } catch (parseError) {
                console.error("Error parsing itinerary on click:", parseError);
                // Optionally show an error to the user
                parsedItinerary = [{ day: 1, title: 'Error loading itinerary', activities: [] }];
            }
        }
        setSelectedItinerary(parsedItinerary || []); // Ensure it's an array
        setSelectedTripTitle(title || 'Trip');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItinerary(null);
        setSelectedTripTitle('');
    };

    return (
        <section id="trip-calendar" className="py-16 md:py-24 bg-amber-50 relative"> {/* Changed BG to solid amber-50 */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"> 
                {/* Heading Section - Updated Style */}
                <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
                    <h3 className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-2">
                        Plan Your Adventure
                    </h3>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 leading-tight inline-block">
                        Trip Departure Calendar
                    </h2>
                </div>

                {/* Calendar & Trip List Layout */} 
                <div className="flex flex-col lg:flex-row gap-8 md:gap-12 items-start">
                    {/* Calendar Container - Enhanced Styling */}
                    <div className="w-full lg:w-7/12 bg-white p-4 sm:p-6 rounded-2xl shadow-xl flex-shrink-0 border border-gray-100"> 
                        <Calendar
                            onChange={setSelectedDate}
                            value={selectedDate}
                            tileClassName={tileClassName}
                            className="react-calendar-custom w-full border-0" 
                        />
                    </div>

                    {/* Trip List Container - Enhanced Styling */}
                    <div className="w-full lg:w-5/12 mt-6 lg:mt-0 bg-white/70 backdrop-blur-sm p-5 sm:p-6 rounded-2xl shadow-lg border border-gray-100"> 
                        <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-5 border-b pb-3 border-gray-200">
                            Departures on <span className='text-amber-700'>{selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </h3>
                        {loading && <div className="text-center py-4 text-gray-500">Loading trips...</div>}
                        {error && <div className="text-center py-4 text-red-500">Error: {error}</div>}
                        {!loading && !error && (
                            <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar"> 
                                {tripsForSelectedDate.length > 0 ? (
                                    <ul className="space-y-4">
                                        {tripsForSelectedDate.map(trip => (
                                            <li key={trip.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-amber-200 hover:shadow-md transition-all duration-200 flex flex-col">
                                                <NavLink
                                                    to={`/destination/${trip.id}`}
                                                    className="block group mb-2"
                                                >
                                                    <h4 className="font-semibold text-gray-800 group-hover:text-amber-700 transition-colors duration-200 mb-1 truncate">
                                                        {trip.title || 'Unnamed Trip'}
                                                    </h4>
                                                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                                                        <span className="flex items-center">
                                                            <CalendarDays className="w-3.5 h-3.5 mr-1 text-gray-400" />
                                                            {trip.duration || 'N/A'}
                                                        </span>
                                                        <span className="flex items-center">
                                                            <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                                                            {trip.location_name || trip.name || 'N/A'}
                                                        </span>
                                                    </div>
                                                </NavLink>
                                                
                                                <div className="mt-auto pt-2 border-t border-gray-100">
                                                    <button
                                                        onClick={() => handleViewItinerary(trip.itinerary_data, trip.title)}
                                                        className="w-full text-center text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold py-1.5 px-3 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        disabled={!trip.itinerary_data || trip.itinerary_data.length === 0}
                                                        title={(!trip.itinerary_data || trip.itinerary_data.length === 0) ? "Itinerary not available" : "View Itinerary"}
                                                    >
                                                        View Itinerary
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-center py-4 text-gray-500 italic">
                                        No trips found starting on this date.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- Itinerary Modal --- */} 
            {isModalOpen && selectedItinerary && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in-fast"> 
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col"> 
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-4 border-b border-gray-200">
                            <h4 className="text-lg font-semibold text-gray-800">Itinerary for {selectedTripTitle}</h4>
                            <button 
                                onClick={handleCloseModal} 
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors duration-200"
                                aria-label="Close itinerary modal"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        {/* Modal Body - Scrollable */} 
                        <div className="p-5 overflow-y-auto flex-grow custom-scrollbar"> 
                            {selectedItinerary.length > 0 ? (
                                <div className="space-y-5"> 
                                    {selectedItinerary.map((day, dayIndex) => (
                                        <div key={dayIndex} className="border border-gray-100 rounded-md p-4 bg-gray-50/50">
                                            <h5 className="font-semibold text-amber-700 mb-2 text-md">Day {day.day}: {day.title || 'Activities'}</h5>
                                            {day.activities && day.activities.length > 0 ? (
                                                <ul className="space-y-2 list-disc list-inside pl-2 text-sm text-gray-700"> 
                                                    {day.activities.map((activity, activityIndex) => (
                                                        <li key={activityIndex}>
                                                            <span className="font-medium text-gray-800">{activity.time ? `${activity.time}: ` : ''}{activity.title || 'Activity'}</span>
                                                            {activity.description && <p className="text-xs text-gray-600 pl-3 mt-0.5">{activity.description}</p>}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-gray-500 italic">No activities listed for this day.</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-4">No itinerary details available for this trip.</p>
                            )}
                        </div>
                        
                        {/* Modal Footer (Optional) */} 
                        <div className="p-3 border-t border-gray-200 text-right"> 
                            <button 
                                onClick={handleCloseModal}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1.5 px-4 rounded text-sm transition-colors duration-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default TripCalendar; 
