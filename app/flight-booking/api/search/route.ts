import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { origin, destination, date } = await req.json();

  const apiKey = process.env.AVIATIONSTACK_API_KEY;
  const url = `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&dep_iata=${origin}&arr_iata=${destination}&flight_date=${date}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch flight data' }, { status: 500 });
  }
}
