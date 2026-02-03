export type Flight = {
  flightNumber: string;
  airline: string;
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
};

export type Reservation = {
  flightNumber: string;
  passengerName: string;
  price: number;
};

export async function searchFlights(query: string): Promise<Flight[]> {
  // Mock implementation for searching flights
  console.log(`Searching flights for: ${query}`);
  const flights: Flight[] = [
    {
      flightNumber: 'AA123',
      airline: 'American Airlines',
      departure: 'JFK',
      arrival: 'LAX',
      departureTime: '10:00 AM',
      arrivalTime: '01:00 PM',
      price: 350,
    },
    {
      flightNumber: 'UA456',
      airline: 'United Airlines',
      departure: 'LAX',
      arrival: 'JFK',
      departureTime: '02:00 PM',
      arrivalTime: '11:00 PM',
      price: 400,
    },
  ];
  return new Promise(resolve => setTimeout(() => resolve(flights), 1000));
}