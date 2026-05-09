import { NextResponse } from 'next/server';

const data = {
  views: 2420,
  views_per: 20,
  registrations_referrals: 3000,
  registrations_utm: 200,
  registrations_per: 3,
  disk_usage: 2.42,
  disk_usage_per: -40,
  cost: 2.42,
  cost_per: -40,
  period: 'week',
};


export async function GET() {
  return NextResponse.json(data);
}
