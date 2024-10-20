import db from '@/db';
import { NextRequest, NextResponse } from 'next/server';

async function getUserCollectionData(userId: string, collectionId: string) {
  return await db.content.findMany({
    where: {
      parentId: parseInt(collectionId, 10),
      courses: {
        some: {
          course: {
            purchasedBy: {
              some: {
                userId: userId,
              },
            },
          },
        },
      },
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { collectionId: string } },
) {
  try {
    const user = JSON.parse(request.headers.get('g') || '');
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 401 });
    }
    const { collectionId } = params;
    const collectionData = await getUserCollectionData(user.id, collectionId);

    if (collectionData.length === 0) {
      return NextResponse.json({ message: 'User does not have access to this collection or collection is empty' }, { status: 403 });
    }
    
    return NextResponse.json({
      message: 'Collection Data fetched successfully',
      data: collectionData,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: 'Error fetching user courses', error },
      { status: 500 },
    );
  }
}