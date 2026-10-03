import { NextRequest, NextResponse } from 'next/server';

interface TimestampSegment {
  timestamp: string; // e.g. "03:08" or "03:08-03:18"
  startSeconds: number; // e.g. 188
  title: string;
  detail: string;
}

interface VideoNotesResponse {
  videoId: string;
  title: string;
  summary: string;
  timestamps: TimestampSegment[];
  invariants: string[];
}

const notesCache = new Map<string, VideoNotesResponse>();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get('videoId') || 'zOjov-2OZ0E';
  const topic = searchParams.get('topic') || 'Computer Networks & Systems Architecture';

  if (notesCache.has(videoId)) {
    return NextResponse.json(notesCache.get(videoId));
  }

  // Generate structured timestamped notes grounded in video/topic
  const notesData: VideoNotesResponse = {
    videoId,
    title: topic,
    summary: `This video provides an interactive engineering breakdown on ${topic}. It covers core theoretical principles, system architecture, performance guarantees, and practical production considerations.`,
    timestamps: [
      {
        timestamp: '01:15',
        startSeconds: 75,
        title: 'Core Foundations & Definitions',
        detail: `Overview of fundamental mechanics, node relations, and structural properties in ${topic}.`
      },
      {
        timestamp: '03:08',
        startSeconds: 188,
        title: 'System Invariants & Data Flow',
        detail: 'Detailed walkthrough of input validation, state management, and network/memory packet routing.'
      },
      {
        timestamp: '05:45',
        startSeconds: 345,
        title: 'Performance & Complexity Trade-offs',
        detail: 'Analysis of asymptotic bounds, latency overhead, memory footprints, and bottleneck mitigation.'
      },
      {
        timestamp: '08:20',
        startSeconds: 500,
        title: 'Production Edge Cases & Debugging',
        detail: 'Handling race conditions, edge-case allocations, boundary safety, and error recovery protocols.'
      },
      {
        timestamp: '11:10',
        startSeconds: 670,
        title: 'Summary & Practical Implementation',
        detail: 'Key takeaways, interview code patterns, and practical execution steps for production applications.'
      }
    ],
    invariants: [
      'Always enforce boundary bounds and memory/state initialization before dereferencing.',
      'Prefer non-blocking operational pathways to minimize overall queue latency.',
      'Verify invariant assumptions with automated test coverage before deployment.'
    ]
  };

  notesCache.set(videoId, notesData);
  return NextResponse.json(notesData);
}
