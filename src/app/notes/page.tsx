'use client';

import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';

export default function NotesPage() {

  return (
    <ProtectedRoute>
      <Navigation />
      <main className="min-h-screen bg-surface">
        <div className="max-w-6xl mx-auto px-margin py-space-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-space-xl"
          >
            <h1 className="font-headline-xl text-headline-xl text-on-surface mb-space-sm">
              Smart Notes
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              AI-powered notes, summaries, and study aids
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-surface-container-lowest rounded-lg p-space-xl shadow-md"
          >
            <div className="text-center py-space-xl">
              <div className="w-20 h-20 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center mx-auto mb-space-md">
                <span className="material-symbols-outlined text-[40px]">edit_note</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-on-surface mb-space-sm">
                Coming Soon
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
                Create AI-powered notes, generate summaries, flashcards, and revision plans from your learning content.
              </p>
              <div className="inline-flex items-center gap-space-sm px-space-md py-1.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[16px]">construction</span>
                <span>Under Development</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </ProtectedRoute>
  );
}