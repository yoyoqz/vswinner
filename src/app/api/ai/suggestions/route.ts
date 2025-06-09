import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getCurrentUser } from '@/lib/auth';
import { checkAIUsageLimit, incrementAIUsage } from '@/lib/aiSuggestions';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request: Request) {
  try {
    // Check user authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check AI usage limit
    const usageLimit = await checkAIUsageLimit(currentUser.id);
    if (!usageLimit.canUse) {
      return NextResponse.json(
        { 
          error: 'AI suggestions limit exceeded',
          used: usageLimit.used,
          limit: usageLimit.limit,
          membershipType: usageLimit.membershipType
        },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');
    
    if (!topic) {
      return NextResponse.json(
        { error: 'Topic parameter is required' },
        { status: 400 }
      );
    }

    // Define prompts based on topic
    const prompts: Record<string, string> = {
      'f-visa': 'Generate 5 common questions about F-1 student visas that international students might have.',
      'b-visa': 'Generate 5 common questions about B-1/B-2 business and tourist visas that applicants might have.',
      'default': 'Generate 5 common questions about US visa application process that applicants might have.'
    };

    const prompt = prompts[topic] || prompts.default;

    // Use OpenAI for suggestions
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that generates relevant questions about US visas. Provide only the questions without any additional text or numbering."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200,
      });

      const content = response.choices[0].message.content || '';
      // Parse the response into individual questions
      const suggestions = content
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').trim()) // Remove numbering if present
        .slice(0, 5); // Limit to 5 questions

      // Increment usage count after successful generation
      await incrementAIUsage(currentUser.id);

      return NextResponse.json({ 
        suggestions,
        usage: {
          used: usageLimit.used + 1,
          limit: usageLimit.limit,
          remaining: usageLimit.limit - usageLimit.used - 1
        }
      });
    } catch (error) {
      console.error('OpenAI API error:', error);
      
      // Fallback to predefined suggestions if OpenAI API fails
      const fallbackSuggestions = [
        "What documents do I need for an F-1 visa interview?",
        "How can I prove non-immigrant intent for my F-1 visa?",
        "Can I work off-campus with an F-1 visa?",
        "What is the process for F-1 visa renewal?",
        "How early should I apply for an F-1 visa before my program starts?"
      ];
      
      // Increment usage count even for fallback suggestions
      await incrementAIUsage(currentUser.id);
      
      return NextResponse.json({ 
        suggestions: fallbackSuggestions,
        usage: {
          used: usageLimit.used + 1,
          limit: usageLimit.limit,
          remaining: usageLimit.limit - usageLimit.used - 1
        }
      });
    }
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
} 