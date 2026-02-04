'use client';

import { useState } from 'react';
import { X, Send } from 'lucide-react';

interface Flight {
  flight_date: string;
  flight_status: string;
  departure: {
    airport: string;
    iata: string;
    scheduled: string;
  };
  arrival: {
    airport: string;
    iata: string;
    scheduled: string;
  };
  airline: {
    name: string;
  };
  flight: {
    number: string;
  };
}

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
}

interface BookingData {
  name: string;
  email: string;
  phone: string;
  flightId?: string;
}

const BOT_GREETING = 'Hello! I am your flight booking assistant. Where would you like to fly from? (e.g., SFO)';

export default function FlightBookingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: BOT_GREETING,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [bookingData, setBookingData] = useState<BookingData>({
    name: '',
    email: '',
    phone: '',
  });
  const [confirmationNumber, setConfirmationNumber] = useState<string | null>(null);
  const [showFlightResults, setShowFlightResults] = useState(false);
  const [conversationState, setConversationState] = useState('get_origin');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [flights, setFlights] = useState<Flight[]>([]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
    };

    setMessages((prev) => [...prev, userMessage]);

    let botMessage: ChatMessage;

    switch (conversationState) {
      case 'get_origin':
        setOrigin(inputValue);
        botMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: `Great! And where are you flying to? (e.g., JFK)`,
        };
        setConversationState('get_destination');
        break;
      case 'get_destination':
        setDestination(inputValue);
        botMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: `Got it. When would you like to travel? (e.g., YYYY-MM-DD)`,
        };
        setConversationState('get_date');
        break;
      case 'get_date':
        const date = inputValue;
        try {
          const response = await fetch('/flight-booking/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ origin, destination, date }),
          });
          const data = await response.json();
          if (data.data) {
            setFlights(data.data);
            botMessage = {
              id: (Date.now() + 1).toString(),
              type: 'bot',
              content: "I found available flights for you! Please check the flight options on the right panel.",
            };
            setShowFlightResults(true);
            setConversationState('show_flights');
          } else {
            botMessage = {
              id: (Date.now() + 1).toString(),
              type: 'bot',
              content: "Sorry, I couldn't find any flights for the given details.",
            };
          }
        } catch (error) {
          botMessage = {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            content: "Sorry, something went wrong while searching for flights.",
          };
        }
        break;
      default:
        botMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: "Sorry, I didn't understand that. You can view the available flights on the right.",
        };
        break;
    }
    setMessages((prev) => [...prev, botMessage]);
    setInputValue('');
  };

  const handleSelectFlight = (flight: Flight) => {
    setSelectedFlight(flight);
    const botMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'bot',
      content: `Great! You selected a flight with ${flight.airline.name}. Please fill in your booking details.`,
    };
    setMessages((prev) => [...prev, botMessage]);
  };
  
  // ... rest of the component remains the same
  const handleInputChange = (field: keyof BookingData, value: string) => {
    setBookingData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirmBooking = () => {
    if (!bookingData.name || !bookingData.email || !bookingData.phone || !selectedFlight) {
      return;
    }

    const confirmation = `BK${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    setConfirmationNumber(confirmation);

    const botMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'bot',
      content: `✓ Booking confirmed! Your confirmation number is ${confirmation}.`,
    };
    setMessages((prev) => [...prev, botMessage]);
  };

  const resetBooking = () => {
    setSelectedFlight(null);
    setBookingData({ name: '', email: '', phone: '' });
    setConfirmationNumber(null);
    setShowFlightResults(false);
    setConversationState('get_origin');
    setMessages([
      {
        id: '1',
        type: 'bot',
        content: BOT_GREETING,
      },
    ]);
  };
  
  return (
    <>
      {/* Open Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-600 active:scale-95"
      >
        ✈️ Book a Flight
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          {/* Modal Container */}
          <div className="flex h-[600px] w-full max-w-6xl gap-6 rounded-2xl bg-white shadow-2xl">
            {/* Left Side - Chat */}
            <div className="flex flex-1 flex-col border-r border-gray-200">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h2 className="text-xl font-bold text-gray-800">Flight Booking Assistant</h2>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    resetBooking();
                  }}
                  className="rounded-lg p-1 hover:bg-gray-100"
                >
                  <X size={24} className="text-gray-600" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto space-y-4 px-6 py-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs rounded-lg px-4 py-2 ${
                        msg.type === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 px-6 py-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="rounded-lg bg-blue-500 p-2 text-white transition-all hover:bg-blue-600 active:scale-95"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side - Flights/Booking */}
            <div className="flex w-96 flex-col overflow-hidden bg-gray-50 p-6">
              <h3 className="mb-4 text-lg font-bold text-gray-800">
                {confirmationNumber ? 'Booking Confirmed!' : selectedFlight ? 'Booking Details' : 'Available Flights'}
              </h3>

              {/* Confirmation View */}
              {confirmationNumber && (
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="rounded-full bg-green-100 p-3">
                    <div className="text-3xl">✓</div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Confirmation Number</p>
                    <p className="text-2xl font-bold text-green-600">{confirmationNumber}</p>
                  </div>
                  <div className="mt-4 rounded-lg bg-white p-4 text-sm">
                    <p>
                      <strong>Airline:</strong> {selectedFlight?.airline.name}
                    </p>
                    <p>
                      <strong>Departure:</strong> {selectedFlight?.departure.scheduled}
                    </p>
                    <p>
                      <strong>Arrival:</strong> {selectedFlight?.arrival.scheduled}
                    </p>
                  </div>
                  <button
                    onClick={resetBooking}
                    className="mt-4 w-full rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white transition-all hover:bg-blue-600"
                  >
                    Book Another Flight
                  </button>
                </div>
              )}

              {/* Booking Form */}
              {selectedFlight && !confirmationNumber && (
                <div className="flex flex-1 flex-col gap-4">
                  <div className="rounded-lg bg-white p-4 text-sm">
                    <p className="text-gray-600">
                      <strong>{selectedFlight.airline.name}</strong>
                    </p>
                    <p className="text-gray-600">
                      {selectedFlight.departure.iata} → {selectedFlight.arrival.iata}
                    </p>
                  </div>

                  <div className="flex flex-1 flex-col gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">Name</label>
                      <input
                        type="text"
                        value={bookingData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        placeholder="Full Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">Email</label>
                      <input
                        type="email"
                        value={bookingData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        placeholder="Email Address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">Phone</label>
                      <input
                        type="tel"
                        value={bookingData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        placeholder="Phone Number"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmBooking}
                    disabled={!bookingData.name || !bookingData.email || !bookingData.phone}
                    className="w-full rounded-lg bg-green-500 px-4 py-2 font-semibold text-white transition-all hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Confirm Booking
                  </button>
                </div>
              )}

              {/* Flights List */}
              {!selectedFlight && !confirmationNumber && showFlightResults && (
                <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
                  {flights.map((flight, index) => (
                    <div
                      key={index}
                      className="rounded-lg bg-white p-4 shadow-sm transition-all hover:shadow-md"
                    >
                      <p className="font-semibold text-gray-800">{flight.airline.name}</p>
                      <p className="text-sm text-gray-600">
                        {flight.departure.iata} → {flight.arrival.iata}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-lg font-bold text-blue-600">Check Price</p>
                        <button
                          onClick={() => handleSelectFlight(flight)}
                          className="rounded-lg bg-blue-500 px-4 py-1 text-sm font-semibold text-white transition-all hover:bg-blue-600 active:scale-95"
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!selectedFlight && !confirmationNumber && !showFlightResults && (
                <p className="text-center text-sm text-gray-500">
                  Start a conversation to see available flights
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
