/**
 * Firestore Seeding Script
 * 
 * Run this script to populate your Firestore database with initial course data.
 * Usage: npx tsx scripts/seed-firestore.ts
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, writeBatch, doc } from 'firebase/firestore';
import { seedCourses, seedModules, seedLessons, seedAchievements } from '../src/lib/seed-data';

// Firebase configuration - replace with your actual config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function seedFirestore() {
  console.log('🌱 Starting Firestore seeding...');

  try {
    // Initialize Firebase
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const db = getFirestore(app);

    // Use batch writes for efficiency
    const batch = writeBatch(db);

    // Seed courses
    console.log('📚 Seeding courses...');
    for (const course of seedCourses) {
      const courseRef = doc(db, 'courses', course.id);
      batch.set(courseRef, course);
    }

    // Seed modules
    console.log('📖 Seeding modules...');
    for (const moduleData of seedModules) {
      const moduleRef = doc(db, 'modules', moduleData.id);
      batch.set(moduleRef, moduleData);
    }

    // Seed lessons
    console.log('📝 Seeding lessons...');
    for (const lessonData of seedLessons) {
      const lessonRef = doc(db, 'lessons', lessonData.id);
      batch.set(lessonRef, lessonData);
    }

    // Seed achievements
    console.log('🏆 Seeding achievements...');
    for (const achievement of seedAchievements) {
      const achievementRef = doc(db, 'achievements', achievement.id);
      batch.set(achievementRef, achievement);
    }

    // Commit the batch
    await batch.commit();
    console.log('✅ Firestore seeding completed successfully!');
    console.log(`   - ${seedCourses.length} courses`);
    console.log(`   - ${seedModules.length} modules`);
    console.log(`   - ${seedLessons.length} lessons`);
    console.log(`   - ${seedAchievements.length} achievements`);

  } catch (error) {
    console.error('❌ Error seeding Firestore:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedFirestore();