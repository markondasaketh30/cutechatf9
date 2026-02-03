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