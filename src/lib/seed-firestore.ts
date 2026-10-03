/**
 * Firestore Seeding Utility
 * 
 * This function can be called to seed Firestore with initial data.
 * Call this from a development admin page or console.
 */

import { db } from './firebase';
import { writeBatch, getDoc, doc } from 'firebase/firestore';
import { seedCourses, seedModules, seedLessons, seedAchievements, seedGames, seedProjects } from './seed-data';

export async function seedFirestore() {
  console.log('🌱 Starting Firestore seeding...');

  try {
    const batch = writeBatch(db);

    // Check if courses already exist
    const coursesRef = doc(db, 'courses', 'python-programming');
    const coursesDoc = await getDoc(coursesRef);
    
    if (coursesDoc.exists()) {
      console.log('⚠️  Courses already exist. Skipping seeding.');
      return { success: false, message: 'Data already exists' };
    }

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

    // Seed games
    console.log('🎮 Seeding games...');
    for (const game of seedGames) {
      const gameRef = doc(db, 'games', game.id);
      batch.set(gameRef, game);
    }

    // Seed projects
    console.log('🛠️ Seeding projects...');
    for (const project of seedProjects) {
      const projectRef = doc(db, 'projects', project.id);
      batch.set(projectRef, project);
    }

    // Commit the batch
    await batch.commit();
    console.log('✅ Firestore seeding completed successfully!');

    return { 
      success: true, 
      message: `Seeded ${seedCourses.length} courses, ${seedModules.length} modules, ${seedLessons.length} lessons, ${seedGames.length} games, ${seedProjects.length} projects, and ${seedAchievements.length} achievements` 
    };

  } catch (error) {
    console.error('❌ Error seeding Firestore:', error);
    return { success: false, message: 'Error seeding data', error };
  }
}