/**
 * Firestore Schema Types for Bloom
 * 
 * This file defines the TypeScript interfaces for all Firestore collections
 * in the Bloom application.
 */

// User Collection
export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  engineeringField: string;
  engineeringBranch?: string;
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Exam Sprint';
  careerGoal?: string;
  dailyLearningTime?: string;
  preferredLearningStyle?: string;
  learningGoals: string[];
  selectedSubjects?: string[];
  preferredLanguages?: string[];
  selectedTechnologies?: string[];
  activeTechnology?: string;
  preferredTopics?: string[];
  dailyGoal: number; // minutes
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  activeRoadmapId?: string;
  activeCourseIds?: string[];
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Course Collection
export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  branch?: string;
  estimatedHours: number;
  skills: string[];
  prerequisites: string[];
  thumbnail: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Module Collection
export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  estimatedMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

// Lesson Collection
export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  learningObjectives: string[];
  estimatedMinutes: number;
  resources: Resource[];
  videoResources: VideoResource[];
  interactiveActivity?: string;
  quizId?: string;
  projectId?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Resource Collection
export interface Resource {
  id: string;
  title: string;
  url: string;
  type: 'documentation' | 'tutorial' | 'article' | 'reference';
  publisher: string;
  createdAt: Date;
}

// Video Resource Collection
export interface VideoResource {
  id: string;
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  description: string;
  publishedAt: Date;
  duration: string;
  createdAt: Date;
}

// Skill Collection
export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  relatedCourses: string[];
  createdAt: Date;
}

// User Roadmap Collection
export interface UserRoadmap {
  id: string;
  userId: string;
  title: string;
  branch: string;
  careerGoal: string;
  subjects: string[];
  technologies: string[];
  activeTechnology: string;
  level: string;
  learningTime: string;
  learningStyle: string;
  estimatedWeeks: number;
  nodes: RoadmapNode[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Roadmap Node Collection
export interface RoadmapNode {
  id: string;
  roadmapId?: string;
  title: string;
  category: 'Foundation' | 'Language' | 'Core Skills' | 'Specialization' | 'Build';
  description: string;
  skills: string[];
  prerequisites: string[];
  estimatedHours: number;
  courseId?: string;
  lessonIds?: string[];
  practiceIds?: string[];
  gameIds?: string[];
  projectIds?: string[];
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  whyItMatters: string;
  order: number;
}

// Note Collection
export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  sourceType?: 'lesson' | 'video' | 'manual';
  sourceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Quiz Collection
export interface Quiz {
  id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questions: QuizQuestion[];
  estimatedMinutes: number;
  lessonId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Quiz Question
export interface QuizQuestion {
  id: string;
  question: string;
  type: 'MCQ' | 'TrueFalse' | 'Ordering' | 'CodeOutput' | 'Scenario' | 'ConceptMatching';
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  concept: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

// Quiz Attempt Collection
export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  answers: Record<string, string | string[]>;
  score: number;
  accuracy: number;
  time: number; // seconds
  concepts: string[];
  completedAt: Date;
  createdAt: Date;
}

// Game Collection
export interface Game {
  id: string;
  title: string;
  description: string;
  type: 'AlgorithmRace' | 'PacketRunner' | 'SQLDetective' | 'MemoryMaze' | 'ModelTrainer' | 'SecurityHunt';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  instructions: string;
  createdAt: Date;
  updatedAt: Date;
}

// Game Session Collection
export interface GameSession {
  id: string;
  userId: string;
  gameId: string;
  score: number;
  accuracy: number;
  time: number; // seconds
  completed: boolean;
  bestScore: number;
  createdAt: Date;
  completedAt?: Date;
}

// Project Collection
export interface Project {
  id: string;
  title: string;
  description: string;
  overview: string;
  skills: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: number; // hours
  requirements: string[];
  milestones: ProjectMilestone[];
  createdAt: Date;
  updatedAt: Date;
}

// Project Milestone
export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  order: number;
  completed: boolean;
}

// Project Progress Collection
export interface ProjectProgress {
  id: string;
  userId: string;
  projectId: string;
  currentStage: 'Understand' | 'Plan' | 'Build' | 'Test' | 'Reflect' | 'Complete';
  completedMilestones: string[];
  startedAt: Date;
  completedAt?: Date;
  updatedAt: Date;
}

// User Progress Collection
export interface UserProgress {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  progress: number; // 0-100
  timeSpent: number; // minutes
  lastAccessedAt: Date;
  completedAt?: Date;
}

// Achievement Collection
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'Lesson' | 'Quiz' | 'Streak' | 'XP' | 'Game' | 'Project' | 'Roadmap';
  requirement: {
    type: string;
    value: number;
  };
  xpReward: number;
  createdAt: Date;
}

// User Achievement Collection
export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: Date;
}

// Streak Collection
export interface Streak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  streakHistory: Date[];
  createdAt: Date;
  updatedAt: Date;
}

// Activity Collection
export interface Activity {
  id: string;
  userId: string;
  type: 'lesson_completed' | 'quiz_completed' | 'game_played' | 'project_milestone' | 'achievement_unlocked';
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// Mentor Session Collection
export interface MentorSession {
  id: string;
  userId: string;
  context: {
    currentCourse?: string;
    currentLesson?: string;
    currentTopic?: string;
  };
  messages: MentorMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// Mentor Message
export interface MentorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Generic metadata type for dynamic Firestore data
export interface FirestoreMetadata {
  createdAt: Date;
  updatedAt: Date;
}

// Saved Item Collection
export interface SavedItem {
  id: string;
  userId: string;
  itemType: 'lesson' | 'video' | 'note' | 'resource';
  itemId: string;
  createdAt: Date;
}

// Notification Collection
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'lesson' | 'achievement' | 'streak' | 'project' | 'recommendation';
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}