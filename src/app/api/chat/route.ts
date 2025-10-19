import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, lectureData } = body;

    console.log('Received message:', message);
    console.log('Lecture data available:', !!lectureData);

    // TODO: This is a dummy backend
    // Replace this with actual Gemini Flash 2.5 integration
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    // Dummy AI response
    const response = {
      success: true,
      message: `I received your message: "${message}". This is a placeholder response. 
                When connected to Gemini, I'll provide intelligent responses about your lecture content!`,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

