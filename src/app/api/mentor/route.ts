import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, context, action } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured on server.' }, { status: 500 });
    }

    const {
      branch = 'Computer Science',
      careerGoal = 'Software Engineer',
      activeTechnology = 'C',
      activeNodeTitle = 'Fundamentals',
      weakSkills = [],
      recentAccuracyPct = 0
    } = context || {};

    const promptText = `You are Bloom Mentor, an expert AI engineering tutor.

STUDENT CONTEXT:
- Engineering Branch: ${branch}
- Target Career Goal: ${careerGoal}
- Active Technology: ${activeTechnology}
- Current Roadmap Node: ${activeNodeTitle}
- Identified Weak Skills: ${weakSkills.join(', ') || 'None'}
- Recent Quiz/Practice Accuracy: ${recentAccuracyPct}%

ACTION / MODE: ${action || 'General Guidance'}
USER MESSAGE: "${message}"

INSTRUCTIONS:
1. Ground your response directly in the student's branch (${branch}) and active technology (${activeTechnology}).
2. Provide a clear, encouraging, technically rigorous explanation.
3. Use markdown with code blocks (where relevant) and bold key terminology.
4. If requested to "Give Hint", give a Socratic hint without revealing the final answer directly.
5. Keep explanations concise, practical, and editorial. Never dump unnecessary fluff.`;

    const fetchUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    let response = await fetch(fetchUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      // Fallback to gemini-1.5-flash if gemini-2.5-flash endpoint is not enabled
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      response = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error status ${response.status}`);
      }
    }

    const data = await response.json();
    const assistantContent = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Bloom Mentor response generation was completed.';

    return NextResponse.json({
      reply: assistantContent,
      suggestedActions: ['Explain Simply', 'Give Hint', 'Show Example', 'Quiz Me', 'Practice This Topic']
    });
  } catch (err: unknown) {
    console.error('Bloom Mentor route error:', err);
    return NextResponse.json(
      { error: 'Bloom Mentor is temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}
