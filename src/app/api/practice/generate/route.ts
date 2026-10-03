import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { branch, careerGoal, topic, skill, technology, difficulty = 'Intermediate', count = 3 } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is missing on server.' }, { status: 500 });
    }

    const systemPrompt = `You are Bloom AI Engineering Examiner.
Your task is to generate ${count} high-quality, technically accurate practice questions for an engineering student.

Context:
- Branch: ${branch || 'Computer Science'}
- Target Career: ${careerGoal || 'Software Engineer'}
- Technology: ${technology || 'C'}
- Topic/Skill: ${topic || skill || technology || 'Core Fundamentals'}
- Target Difficulty: ${difficulty}

OUTPUT REQUIREMENT:
Return ONLY a valid JSON array of objects. Do not include markdown code block formatting (e.g. \`\`\`json). Just return the raw JSON array matching this strict schema:

[
  {
    "id": "gen_1",
    "branch": "${branch || 'Computer Science'}",
    "skills": ["${technology || 'C'}", "${skill || 'Fundamentals'}"],
    "topic": "${topic || skill || 'Engineering Concept'}",
    "difficulty": "${difficulty}",
    "type": "MCQ",
    "question": "Question text here...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Detailed step-by-step explanation of why Option A is correct...",
    "hint": "Short Socratic hint...",
    "tags": ["${technology || 'C'}"]
  }
]`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      // Fallback if gemini-2.5-flash endpoint responds with error, try gemini-1.5-flash
      const fallbackRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (!fallbackRes.ok) {
        throw new Error(`Gemini API returned status ${fallbackRes.status}`);
      }
      
      const fallbackData = await fallbackRes.json();
      const rawText = fallbackData.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return NextResponse.json({ questions: parsed });
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return NextResponse.json({ questions: parsed });
  } catch (err: unknown) {
    console.error('Practice Question Generation error:', err);
    return NextResponse.json(
      { error: 'Failed to generate practice questions via AI.' },
      { status: 500 }
    );
  }
}
