import { Tool } from '@vercel/ai-sdk/workflows';
import { z } from 'zod';

export const getFlights = Tool({
  description: 'Get flights for a given query',
  parameters: z.object({
    query: z.string().describe('The query to search for flights'),
  }),
  execute: async ({ query }) => {
    return [
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
  },
});

export const bookFlight = Tool({
  description: 'Book a flight',
  parameters: z.object({
    flightNumber: z.string().describe('The flight number to book'),
    passengerName: z.string().describe('The name of the passenger'),
  }),
  execute: async ({ flightNumber, passengerName }) => {
    return {
      flightNumber,
      passengerName,
      price: 350, // Mock price
    };
  },
});

export function getTools() {
  return [getFlights, bookFlight];
}