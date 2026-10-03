# Bloom — Interactive Engineering Learning Platform

Bloom turns engineering learning into an interactive journey combining personalized roadmaps, lessons, real learning resources, YouTube learning, AI notes, interactive labs, quizzes, engineering games, projects, AI mentor, progress, achievements, and learning analytics.

## 🌟 Features

- **Personalized Roadmaps**: AI-generated learning paths tailored to your goals
- **Interactive Lessons**: Rich content with progress tracking and XP rewards
- **Real Course Catalog**: Authentic engineering subjects (Python, DSA, ML, Security, etc.)
- **Engineering Games**: Gamified learning challenges
- **AI Mentor**: Context-aware learning assistance (coming soon)
- **Smart Notes**: AI-powered study aids (coming soon)
- **Progress Tracking**: Detailed analytics and achievements
- **XP & Streak System**: Gamified learning experience

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase account
- Google account (for Google Sign-In)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bloom
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure Firebase (see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md))

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
bloom/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── (auth)/            # Authentication pages
│   │   ├── home/              # Home page
│   │   ├── explore/           # Course catalog
│   │   ├── courses/           # Course pages
│   │   ├── lessons/           # Lesson pages
│   │   ├── roadmap/           # Learning roadmap
│   │   ├── games/             # Engineering games
│   │   ├── mentor/            # AI mentor
│   │   ├── notes/             # Smart notes
│   │   ├── projects/          # Project learning
│   │   ├── progress/          # Progress analytics
│   │   ├── profile/           # User profile
│   │   └── settings/          # Settings
│   ├── components/            # Reusable components
│   │   ├── Navigation.tsx
│   │   └── ProtectedRoute.tsx
│   ├── contexts/              # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/                   # Utilities and services
│   │   ├── design-system.ts   # Bloom design tokens
│   │   ├── firebase.ts        # Firebase configuration
│   │   ├── seed-data.ts      # Initial course data
│   │   └── seed-firestore.ts # Firestore seeding
│   └── types/                 # TypeScript types
│       └── firestore.ts      # Firestore schema types
├── public/                    # Static assets
├── firestore.rules           # Firestore security rules
├── firestore.indexes.json     # Firestore indexes
├── FIREBASE_SETUP.md         # Firebase setup guide
└── README.md                 # This file
```

## 🎨 Design System

Bloom uses a warm, premium design system inspired by consumer learning apps:

- **Colors**: Warm ivory background, electric blue primary, indigo secondary, mint tertiary
- **Typography**: Sora (headlines), Space Grotesk (display), Inter (body), JetBrains Mono (code)
- **Shapes**: Generous rounded corners (1rem-2rem), pill-shaped buttons
- **Spacing**: Generous whitespace with consistent rhythm
- **Shadows**: Soft ambient shadows with blue-gray undertones

See `src/lib/design-system.ts` for complete design tokens.

## 🔧 Firebase Configuration

### Required Firebase Services

1. **Authentication**: Email/Password and Google Sign-In
2. **Firestore Database**: User data, courses, progress
3. **Storage**: Profile photos, project assets
4. **Cloud Functions**: Secure API endpoints (optional)

### Security Rules

Firestore security rules are defined in `firestore.rules`. These ensure:
- Public read access to course content
- User-specific write access to personal data
- Admin-only content management

### Indexes

Composite indexes are defined in `firestore.indexes.json`. Deploy using:
```bash
firebase deploy --only firestore:indexes
```

## 📊 Data Model

### Key Collections

- `users`: User profiles and preferences
- `courses`: Course catalog
- `modules`: Course modules
- `lessons`: Individual lessons
- `userProgress`: Lesson completion tracking
- `achievements`: Achievement definitions
- `userAchievements`: Unlocked achievements
- `gameSessions`: Game play history

See `src/types/firestore.ts` for complete schema.

## 🌱 Seeding Data

Initial course data can be seeded using the built-in seeding utility:

1. Navigate to `/explore` in the app
2. Click "Seed Course Data" if no courses exist
3. Or call `seedFirestore()` programmatically

This populates:
- 15 authentic engineering courses
- 5 Python programming modules
- 2 sample lessons
- 8 achievement definitions

## 🔐 Authentication

Bloom supports:
- Email + Password authentication
- Google Sign-In
- Session persistence
- Password reset

Protected routes use the `ProtectedRoute` component to ensure authentication.

## 🎯 Core Features

### Onboarding
5-question flow to personalize learning:
1. Engineering field
2. Experience level
3. Career goals
4. Time commitment
5. Learning style

### Roadmap
Personalized learning path with:
- Foundation → Core Skills → Advanced → Specialization
- Dynamic locking based on progress
- Visual progress tracking

### Courses
- Real engineering subjects
- Module-based structure
- Lesson-level progress
- XP rewards on completion

### Games
Engineering-focused mini-games:
- Algorithm Race
- Packet Runner
- SQL Detective
- Memory Maze
- Model Trainer
- Security Hunt

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "feat: initial commit"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will automatically detect Next.js
   - Add environment variables in the project settings:
     - `NEXT_PUBLIC_FIREBASE_API_KEY`
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
     - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
     - `NEXT_PUBLIC_FIREBASE_APP_ID`
     - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
     - `GEMINI_API_KEY`
     - `YOUTUBE_API_KEY`
   - Click "Deploy"

3. **Custom Domain** (optional)
   - Add your custom domain in Vercel project settings
   - Configure DNS records as instructed

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables

Ensure these are set in your production environment:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `GEMINI_API_KEY` (for AI features)
- `YOUTUBE_API_KEY` (for video search)

## 📝 Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow existing component patterns
- Use Bloom design system tokens
- Implement proper error handling
- Add loading states for async operations

### Git Workflow
1. Create feature branches
2. Write descriptive commit messages
3. Test thoroughly before merging
4. Update documentation as needed

### Testing
- Test authentication flows
- Verify Firestore operations
- Check responsive design
- Test on multiple browsers

## 🐛 Troubleshooting

### Firebase Issues
- Verify API keys in `.env.local`
- Check Firebase console for service status
- Ensure security rules are deployed
- Verify index creation

### Build Errors
- Clear `.next` cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check for TypeScript errors
- Verify environment variables

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Support

For support and documentation, visit the project repository or contact the development team.

---

**Bloom — Learn. Explore. Build. Bloom.**