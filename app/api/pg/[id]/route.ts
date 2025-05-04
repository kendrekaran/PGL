import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import PgListing from '../model';
import mongoose from 'mongoose';

// GET /api/pg/[id] - Get a single PG listing by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to MongoDB
    try {
      await connectToDatabase();
    } catch (error) {
      console.error('MongoDB connection failed:', error);
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { 
          status: 500,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );
    }
    
    const id = params.id;
    
    // Validate if ID is a valid MongoDB ObjectID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid PG ID format' },
        { status: 400 }
      );
    }
    
    // Find the PG listing by ID
    const pgListing = await PgListing.findById(id).lean();
    
    if (!pgListing) {
      return NextResponse.json(
        { error: 'PG listing not found' },
        { status: 404 }
      );
    }
    
    // Log success for debugging
    console.log(`Found PG listing with ID: ${id}`);
    
    return NextResponse.json(pgListing, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error('Error fetching PG listing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch PG listing. Please try again later.' },
      { status: 500 }
    );
  }
} 