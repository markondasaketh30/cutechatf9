```typescript
// flights.ts
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

// tools.ts
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


// types.ts
export type LayoutProps = {
  children: React.ReactNode;
};

// workflow.ts
import { Workflow, WorkflowStep } from '@vercel/ai-sdk/workflows';

export async function runWorkflow(
  workflow: Workflow,
  initialInput: any,
): Promise<any> {
  // Mock implementation for running a workflow
  console.log(`Running workflow: ${workflow.id} with input: ${initialInput}`);
  return { status: 'success', output: 'Mock workflow output' };
}

export async function getRun(id: string): Promise<any> {
  // Mock implementation for getting a workflow run
  console.log(`Getting run for id: ${id}`);
  return {
    stream: async (startIndex: number) => {
      return {
        getReader: () => ({
          read: async () => {
            if (startIndex === 0) {
              startIndex++;
              return { value: 'Mock stream data', done: false };
            }
            return { value: undefined, done: true };
          },
        }),
      };
    },
  };
}

// workflows.ts
import { Workflow, WorkflowStep } from '@vercel/ai-sdk/workflows';

export const flightBookingWorkflow = Workflow({
  id: 'flightBooking',
  initialStep: 'searchFlights',
  steps: {
    searchFlights: {
      tool: 'getFlights',
      onComplete: 'displayFlights',
    },
    displayFlights: {
      render: async ({ flights }) => {
        return {
          messages: [
            {
              role: 'assistant',
              content: `I found these flights: ${flights
                .map((f: any) => f.flightNumber)
                .join(', ')}`,
            },
          ],
        };
      },
      onComplete: 'askForBookingConfirmation',
    },
    askForBookingConfirmation: {
      render: async () => {
        return {
          messages: [
            {
              role: 'assistant',
              content: 'Do you want to book any of these flights?',
            },
          ],
        };
      },
      transition: 'bookFlight',
    },
    bookFlight: {
      tool: 'bookFlight',
      onComplete: 'displayBookingConfirmation',
    },
    displayBookingConfirmation: {
      render: async ({ reservation }) => {
        return {
          messages: [
            {
              role: 'assistant',
              content: `Your flight ${reservation.flightNumber} has been booked for ${reservation.passengerName}.`,
            },
          ],
        };
      },
    },
  },
});

export async function getWorkflow(id: string): Promise<any> {
  // Mock implementation
  if (id === 'flightBooking') {
    return flightBookingWorkflow;
  }
  return null;
}
```