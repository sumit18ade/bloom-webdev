/**
 * Bloom Recommendations & Centralized Learning Engine
 * 
 * Generates personalized, branch-aware, cross-linked recommendations connecting:
 * PRACTICE ↕ GAMES ↕ MENTOR ↕ LEARN ↕ ROADMAP ↕ PROJECTS ↕ PROGRESS.
 * Calculates progress and weak skills strictly from real user data in Firestore.
 */

import { User, Course, Project, Game, RoadmapNode, UserRoadmap, UserProgress } from '@/types/firestore';
import { ENGINEERING_BRANCHES } from './taxonomy';
import { seedCourses, seedGames, seedProjects } from './seed-data';

export interface PracticeAttemptRecord {
  id?: string;
  userId?: string;
  questionId: string;
  userAnswer?: string | string[];
  correct: boolean;
  concept?: string;
  skill?: string;
  topic?: string;
  difficulty?: string;
  completedAt?: Date;
}

export interface GameSessionRecord {
  id?: string;
  userId?: string;
  gameId: string;
  score: number;
  completed: boolean;
  completedAt?: Date;
}

export interface UnifiedLearningContext {
  branch: string;
  branchShortName: string;
  careerGoal: string;
  activeTechnology: string;
  selectedSubjects: string[];
  selectedTechnologies: string[];
  experienceLevel: string;
  roadmapTitle: string;
  activeNode: RoadmapNode;
  weakSkills: string[];
  strongSkills: string[];
  recentAccuracyPct: number;
  totalPracticeAttempts: number;
  gamesPlayedCount: number;
  bestGameScores: Record<string, number>;
}

export interface UnifiedRecommendations {
  nextPractice: {
    title: string;
    mode: 'QUICK_5' | 'FOCUSED_10' | 'DEEP_PRACTICE' | 'WEAK_AREA' | 'ROADMAP' | 'EXAM' | 'RANDOM';
    skill: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    estimatedMinutes: number;
    reason: string;
  };
  nextGame: {
    gameId: string;
    title: string;
    skill: string;
    difficulty: string;
    reason: string;
  };
  nextLesson: {
    courseId: string;
    lessonTitle: string;
    reason: string;
  };
  mentorFocusPrompt: string;
  mentorFocusReason: string;
}

export interface UserPreferencesInput {
  branch: string;
  careerGoal: string;
  subjects: string[];
  technologies: string[];
  activeTechnology: string;
  level: string;
  learningTime: string;
  learningStyle: string;
}

export function buildDynamicUserRoadmap(
  userId: string,
  input: UserPreferencesInput,
  existingProgress: Record<string, UserProgress> = {}
): UserRoadmap {
  const branchInfo = ENGINEERING_BRANCHES[input.branch] || ENGINEERING_BRANCHES['Computer Science'];
  const activeTech = input.activeTechnology || input.technologies[0] || 'C';
  const goal = input.careerGoal || branchInfo.careerGoals[0];

  let nodes: RoadmapNode[] = [];

  if (activeTech === 'C' || activeTech === 'Embedded C') {
    nodes = [
      {
        id: 'node-c-1',
        title: 'C Programming Fundamentals',
        category: 'Foundation',
        description: 'Variables, data types, control flow, functions, and C compilation pipeline.',
        skills: ['C', 'Variables', 'Control Flow', 'Compilation'],
        prerequisites: [],
        estimatedHours: 15,
        courseId: 'c-programming',
        lessonIds: ['c-intro'],
        practiceIds: ['c-q-pointer-deref'],
        gameIds: ['c-debug-duel'],
        status: 'available',
        whyItMatters: 'Mastering low-level memory and C syntax is the cornerstone of systems engineering.',
        order: 1
      },
      {
        id: 'node-c-2',
        title: 'Memory Addresses & Pointers',
        category: 'Language',
        description: 'Address arithmetic, pointer dereferencing, stack allocations, and dynamic memory.',
        skills: ['Pointers', 'Memory Management', 'Malloc', 'Stack & Heap'],
        prerequisites: ['node-c-1'],
        estimatedHours: 20,
        courseId: 'c-programming',
        lessonIds: ['c-pointers'],
        practiceIds: ['c-q-malloc-calloc', 'c-q-double-free'],
        gameIds: ['c-debug-duel'],
        status: 'locked',
        whyItMatters: 'Pointers allow direct hardware and memory manipulation without overhead.',
        order: 2
      },
      {
        id: 'node-c-3',
        title: 'Data Structures & Algorithmic Efficiency',
        category: 'Core Skills',
        description: 'Arrays, linked lists, stacks, queues, trees, graphs, and Big-O asymptotic analysis.',
        skills: ['Data Structures', 'Algorithms', 'Linked Lists', 'Big-O'],
        prerequisites: ['node-c-2'],
        estimatedHours: 35,
        courseId: 'data-structures-algorithms',
        lessonIds: ['dsa-intro'],
        practiceIds: ['dsa-q-binary-search-bounds'],
        gameIds: ['algorithm-race'],
        status: 'locked',
        whyItMatters: 'Efficient data structures minimize memory footprint and execution latency.',
        order: 3
      },
      {
        id: 'node-c-4',
        title: 'Database Systems & SQL Queries',
        category: 'Core Skills',
        description: 'Relational data modeling, SQL queries, index structures, and ACID transactions.',
        skills: ['SQL', 'Relational Databases', 'Indexing', 'Schema Design'],
        prerequisites: ['node-c-3'],
        estimatedHours: 25,
        courseId: 'database-systems',
        lessonIds: ['dbms-intro'],
        practiceIds: ['dbms-q-sql-join-group'],
        gameIds: ['sql-detective'],
        status: 'locked',
        whyItMatters: 'Persistent databases store structured application state securely.',
        order: 4
      },
      {
        id: 'node-c-5',
        title: 'Computer Networks & Socket Architecture',
        category: 'Specialization',
        description: 'OSI 7-layer stack, TCP/IP handshake, HTTP/S, sockets, and subnetting.',
        skills: ['TCP/IP', 'OSI Model', 'Sockets', 'Subnetting'],
        prerequisites: ['node-c-4'],
        estimatedHours: 30,
        courseId: 'computer-networks',
        lessonIds: ['net-intro'],
        practiceIds: ['net-q-tcp-three-way'],
        gameIds: ['packet-runner'],
        status: 'locked',
        whyItMatters: 'Network socket programming connects low-level binaries across distributed servers.',
        order: 5
      },
      {
        id: 'node-c-6',
        title: 'System Design & CLI Capstone Project',
        category: 'Build',
        description: 'Build a production C CLI memory manager or backend service.',
        skills: ['Systems Engineering', 'C', 'Memory Allocator', 'CLI Project'],
        prerequisites: ['node-c-5'],
        estimatedHours: 40,
        courseId: 'c-programming',
        lessonIds: ['c-capstone-lesson'],
        projectIds: ['c-cli-tool'],
        status: 'locked',
        whyItMatters: 'Demonstrates real production engineering competence to recruiters.',
        order: 6
      }
    ];
  } else if (activeTech === 'C++') {
    nodes = [
      {
        id: 'node-cpp-1',
        title: 'C++ Foundations & Memory Safety',
        category: 'Foundation',
        description: 'Pointers, references, memory stack/heap, and initial compilation.',
        skills: ['C++', 'Pointers', 'References', 'Compilation'],
        prerequisites: [],
        estimatedHours: 20,
        courseId: 'cpp-programming',
        lessonIds: ['cpp-intro'],
        practiceIds: ['cpp-q-ref-vs-ptr'],
        gameIds: ['c-debug-duel'],
        status: 'available',
        whyItMatters: 'C++ powers high-performance game engines, operating systems, and browsers.',
        order: 1
      },
      {
        id: 'node-cpp-2',
        title: 'OOP, RAII & Smart Pointers',
        category: 'Language',
        description: 'Classes, destructors, unique_ptr, shared_ptr, and RAII resource management.',
        skills: ['OOP', 'Smart Pointers', 'RAII', 'Destructors'],
        prerequisites: ['node-cpp-1'],
        estimatedHours: 25,
        courseId: 'cpp-programming',
        lessonIds: ['cpp-oop'],
        practiceIds: ['cpp-q-smart-ptrs'],
        gameIds: ['c-debug-duel'],
        status: 'locked',
        whyItMatters: 'RAII guarantees zero resource leaks in production C++ code.',
        order: 2
      },
      {
        id: 'node-cpp-3',
        title: 'STL Containers & Algorithmic Complexity',
        category: 'Core Skills',
        description: 'std::vector, std::unordered_map, iterators, and asymptotic Big-O bounds.',
        skills: ['STL', 'Iterators', 'Algorithms', 'Big-O'],
        prerequisites: ['node-cpp-2'],
        estimatedHours: 30,
        courseId: 'data-structures-algorithms',
        lessonIds: ['cpp-stl'],
        gameIds: ['algorithm-race'],
        status: 'locked',
        whyItMatters: 'STL provides production-tested data structures with optimal time bounds.',
        order: 3
      },
      {
        id: 'node-cpp-4',
        title: 'Templates & Generic Metaprogramming',
        category: 'Specialization',
        description: 'Function templates, class templates, type traits, and compile-time evaluation.',
        skills: ['Templates', 'Generic Programming', 'Metaprogramming'],
        prerequisites: ['node-cpp-3'],
        estimatedHours: 35,
        courseId: 'cpp-programming',
        lessonIds: ['cpp-templates'],
        status: 'locked',
        whyItMatters: 'Templates enable zero-cost abstractions across large software systems.',
        order: 4
      },
      {
        id: 'node-cpp-5',
        title: 'C++ Systems Capstone',
        category: 'Build',
        description: 'Design a high-throughput multi-threaded data processing engine in modern C++.',
        skills: ['C++', 'Concurrency', 'Systems Design'],
        prerequisites: ['node-cpp-4'],
        estimatedHours: 40,
        courseId: 'cpp-programming',
        lessonIds: ['cpp-capstone'],
        status: 'locked',
        whyItMatters: 'Demonstrates enterprise-grade C++ execution capability.',
        order: 5
      }
    ];
  } else if (activeTech === 'Java' || activeTech === 'Java Spring') {
    nodes = [
      {
        id: 'node-java-1',
        title: 'Java Core & JVM Runtime',
        category: 'Foundation',
        description: 'Java syntax, bytecode compilation, classloaders, and JVM execution model.',
        skills: ['Java', 'JVM', 'Bytecode', 'OOP'],
        prerequisites: [],
        estimatedHours: 20,
        courseId: 'java-programming',
        lessonIds: ['java-intro'],
        gameIds: ['c-debug-duel'],
        status: 'available',
        whyItMatters: 'Java powers backend enterprise architecture and Android development worldwide.',
        order: 1
      },
      {
        id: 'node-java-2',
        title: 'Collections Framework & Multithreading',
        category: 'Language',
        description: 'ArrayList, HashMap, Concurrency, Threads, and Synchronization.',
        skills: ['Collections', 'Threads', 'Concurrency', 'HashMap'],
        prerequisites: ['node-java-1'],
        estimatedHours: 25,
        courseId: 'java-programming',
        lessonIds: ['java-collections'],
        status: 'locked',
        whyItMatters: 'Concurrent collections ensure high availability in backend servers.',
        order: 2
      },
      {
        id: 'node-java-3',
        title: 'Spring Boot REST Microservices',
        category: 'Core Skills',
        description: 'Dependency injection, Spring MVC, REST controllers, and Spring Data JPA.',
        skills: ['Spring Boot', 'REST APIs', 'Spring Data', 'Microservices'],
        prerequisites: ['node-java-2'],
        estimatedHours: 35,
        courseId: 'java-programming',
        lessonIds: ['spring-intro'],
        gameIds: ['sql-detective'],
        status: 'locked',
        whyItMatters: 'Spring Boot is the standard framework for cloud microservice deployment.',
        order: 3
      },
      {
        id: 'node-java-4',
        title: 'Enterprise Distributed Systems Capstone',
        category: 'Build',
        description: 'Build a Spring Boot microservices backend with Docker and PostgreSQL.',
        skills: ['Java Spring', 'PostgreSQL', 'Docker', 'Microservices'],
        prerequisites: ['node-java-3'],
        estimatedHours: 40,
        courseId: 'java-programming',
        lessonIds: ['java-capstone'],
        status: 'locked',
        whyItMatters: 'Prepares you directly for senior enterprise software roles.',
        order: 4
      }
    ];
  } else if (activeTech === 'JavaScript' || activeTech === 'TypeScript' || activeTech === 'Node.js' || activeTech === 'React') {
    nodes = [
      {
        id: 'node-js-1',
        title: 'Modern JavaScript & Async Control Flow',
        category: 'Foundation',
        description: 'ES6+, closures, prototype chain, Event Loop, Promises, and async/await.',
        skills: ['JavaScript', 'ES6+', 'Event Loop', 'Promises'],
        prerequisites: [],
        estimatedHours: 20,
        courseId: 'web-development',
        lessonIds: ['js-intro'],
        status: 'available',
        whyItMatters: 'JavaScript is the fundamental runtime of the web browser and modern microservices.',
        order: 1
      },
      {
        id: 'node-js-2',
        title: 'Node.js Backend & REST APIs',
        category: 'Language',
        description: 'HTTP modules, Express/Fastify server architecture, middleware, and authentication.',
        skills: ['Node.js', 'Express', 'REST APIs', 'JWT'],
        prerequisites: ['node-js-1'],
        estimatedHours: 25,
        courseId: 'web-development',
        lessonIds: ['node-intro'],
        status: 'locked',
        whyItMatters: 'Node.js enables fast, asynchronous server-side network applications.',
        order: 2
      },
      {
        id: 'node-js-3',
        title: 'React Architecture & State Management',
        category: 'Core Skills',
        description: 'Virtual DOM, component lifecycle, custom hooks, context, and state optimization.',
        skills: ['React', 'JSX', 'Hooks', 'State Management'],
        prerequisites: ['node-js-2'],
        estimatedHours: 30,
        courseId: 'web-development',
        lessonIds: ['react-intro'],
        status: 'locked',
        whyItMatters: 'React powers reactive user interfaces at production scale.',
        order: 3
      },
      {
        id: 'node-js-4',
        title: 'TypeScript & Next.js Full-Stack Capstone',
        category: 'Build',
        description: 'Deploy a full-stack Next.js App Router application with database integration.',
        skills: ['TypeScript', 'Next.js', 'PostgreSQL', 'Full Stack Capstone'],
        prerequisites: ['node-js-3'],
        estimatedHours: 40,
        courseId: 'web-development',
        lessonIds: ['nextjs-intro'],
        projectIds: ['rest-api-engine'],
        status: 'locked',
        whyItMatters: 'Full-stack Next.js skills are in highest demand across web startups.',
        order: 4
      }
    ];
  } else if (activeTech === 'Go') {
    nodes = [
      {
        id: 'node-go-1',
        title: 'Go Language Fundamentals',
        category: 'Foundation',
        description: 'Types, structs, interfaces, error handling idioms, and garbage collection in Go.',
        skills: ['Go', 'Structs', 'Interfaces', 'Error Handling'],
        prerequisites: [],
        estimatedHours: 20,
        courseId: 'c-programming',
        lessonIds: ['go-intro'],
        status: 'available',
        whyItMatters: 'Go powers cloud-native infrastructure including Kubernetes and Docker.',
        order: 1
      },
      {
        id: 'node-go-2',
        title: 'Goroutines & Channel Concurrency',
        category: 'Language',
        description: 'CSP concurrency model, goroutines, channels, select statements, and mutexes.',
        skills: ['Goroutines', 'Channels', 'Concurrency', 'Mutex'],
        prerequisites: ['node-go-1'],
        estimatedHours: 25,
        courseId: 'computer-networks',
        lessonIds: ['go-concurrency'],
        status: 'locked',
        whyItMatters: 'Goroutines allow millions of concurrent concurrent requests with low memory footprint.',
        order: 2
      },
      {
        id: 'node-go-3',
        title: 'Go Cloud Microservices Capstone',
        category: 'Build',
        description: 'Build a high-performance gRPC/HTTP microservice in Go.',
        skills: ['Go', 'gRPC', 'Microservices', 'Cloud Native Capstone'],
        prerequisites: ['node-go-2'],
        estimatedHours: 35,
        courseId: 'computer-networks',
        lessonIds: ['go-capstone'],
        status: 'locked',
        whyItMatters: 'Validates production backend performance engineering capability.',
        order: 3
      }
    ];
  } else if (activeTech === 'Rust') {
    nodes = [
      {
        id: 'node-rust-1',
        title: 'Rust Ownership & Borrowing',
        category: 'Foundation',
        description: 'Ownership rules, move semantics, mutable references, and compile-time lifetimes.',
        skills: ['Rust', 'Ownership', 'Borrow Checker', 'Lifetimes'],
        prerequisites: [],
        estimatedHours: 25,
        courseId: 'c-programming',
        lessonIds: ['rust-intro'],
        status: 'available',
        whyItMatters: 'Rust delivers C-level speed with compile-time memory safety guarantees.',
        order: 1
      },
      {
        id: 'node-rust-2',
        title: 'Fearless Concurrency & Zero-Cost Abstractions',
        category: 'Language',
        description: 'Traits, generics, pattern matching, Tokio async runtime, and thread safety.',
        skills: ['Traits', 'Tokio', 'Async Rust', 'Concurrency'],
        prerequisites: ['node-rust-1'],
        estimatedHours: 30,
        courseId: 'c-programming',
        lessonIds: ['rust-concurrency'],
        status: 'locked',
        whyItMatters: 'Rust guarantees no data races at compile time.',
        order: 2
      },
      {
        id: 'node-rust-3',
        title: 'Rust Systems Capstone Project',
        category: 'Build',
        description: 'Build a memory-safe custom database engine or CLI parser in Rust.',
        skills: ['Rust', 'Systems', 'Parser', 'Systems Capstone'],
        prerequisites: ['node-rust-2'],
        estimatedHours: 40,
        courseId: 'c-programming',
        lessonIds: ['rust-capstone'],
        status: 'locked',
        whyItMatters: 'Demonstrates elite modern systems engineering competence.',
        order: 3
      }
    ];
  } else if (['SQL', 'PostgreSQL', 'MongoDB', 'Redis'].includes(activeTech)) {
    nodes = [
      {
        id: 'node-db-1',
        title: 'Relational Schema Design & SQL Queries',
        category: 'Foundation',
        description: 'DDL/DML statements, normalization forms, primary/foreign keys, and standard SELECT syntax.',
        skills: ['SQL', 'Database Design', 'Normalization', 'Keys'],
        prerequisites: [],
        estimatedHours: 15,
        courseId: 'database-systems',
        lessonIds: ['sql-intro'],
        gameIds: ['sql-detective'],
        status: 'available',
        whyItMatters: 'SQL is the universal language for querying and structuring application data.',
        order: 1
      },
      {
        id: 'node-db-2',
        title: 'Complex Joins, Aggregations & Window Functions',
        category: 'Language',
        description: 'INNER/OUTER JOINs, GROUP BY, HAVING, subqueries, and window functions.',
        skills: ['SQL Joins', 'Aggregations', 'Subqueries', 'Window Functions'],
        prerequisites: ['node-db-1'],
        estimatedHours: 25,
        courseId: 'database-systems',
        lessonIds: ['dbms-intro'],
        gameIds: ['sql-detective'],
        status: 'locked',
        whyItMatters: 'Advanced queries aggregate analytics across enterprise database tables.',
        order: 2
      },
      {
        id: 'node-db-3',
        title: 'Indexing, Query Execution Plans & NoSQL/Redis',
        category: 'Core Skills',
        description: 'B-Tree indexes, EXPLAIN execution plans, Redis caching, and MongoDB documents.',
        skills: ['Indexing', 'Execution Plans', 'NoSQL', 'Redis'],
        prerequisites: ['node-db-2'],
        estimatedHours: 30,
        courseId: 'database-systems',
        lessonIds: ['db-indexing'],
        gameIds: ['sql-detective'],
        status: 'locked',
        whyItMatters: 'Proper indexing reduces query execution times from seconds to milliseconds.',
        order: 3
      },
      {
        id: 'node-db-4',
        title: 'Database Architecture & Transactions Capstone',
        category: 'Build',
        description: 'Design a scalable database schema with ACID transaction safety and Redis caching layer.',
        skills: ['SQL', 'ACID', 'Transactions', 'Database Capstone'],
        prerequisites: ['node-db-3'],
        estimatedHours: 35,
        courseId: 'database-systems',
        lessonIds: ['db-capstone'],
        status: 'locked',
        whyItMatters: 'Ensures zero data loss under concurrent production traffic.',
        order: 4
      }
    ];
  } else if (['Docker', 'Kubernetes', 'DevOps'].includes(activeTech)) {
    nodes = [
      {
        id: 'node-ops-1',
        title: 'Docker Containerization Fundamentals',
        category: 'Foundation',
        description: 'Containers vs Virtual Machines, Dockerfile instructions, images, and container lifecycles.',
        skills: ['Docker', 'Containers', 'Dockerfile', 'Images'],
        prerequisites: [],
        estimatedHours: 15,
        courseId: 'computer-networks',
        lessonIds: ['docker-intro'],
        status: 'available',
        whyItMatters: 'Docker standardizes environment dependencies across local and cloud environments.',
        order: 1
      },
      {
        id: 'node-ops-2',
        title: 'Multi-Container Services & Docker Compose',
        category: 'Core Skills',
        description: 'Networking bridges, persistent volumes, environment secrets, and docker-compose.yml.',
        skills: ['Docker Compose', 'Container Networking', 'Volumes'],
        prerequisites: ['node-ops-1'],
        estimatedHours: 20,
        courseId: 'computer-networks',
        lessonIds: ['docker-compose'],
        status: 'locked',
        whyItMatters: 'Docker Compose orchestrates full application stacks with databases locally.',
        order: 2
      },
      {
        id: 'node-ops-3',
        title: 'Kubernetes Pods, Services & Deployment Pipelines',
        category: 'Specialization',
        description: 'Kubernetes architecture, Pods, Deployments, Services, Ingress, and CI/CD automation.',
        skills: ['Kubernetes', 'Pods', 'Deployments', 'CI/CD'],
        prerequisites: ['node-ops-2'],
        estimatedHours: 35,
        courseId: 'computer-networks',
        lessonIds: ['k8s-intro'],
        status: 'locked',
        whyItMatters: 'Kubernetes automates scaling, self-healing, and deployments in modern cloud computing.',
        order: 3
      }
    ];
  } else if (activeTech === 'Python' || input.branch === 'AI / Machine Learning') {
    nodes = [
      {
        id: 'node-py-1',
        title: 'Python for Systems & Data Science',
        category: 'Foundation',
        description: 'Master Python syntax, functions, modules, and basic data structures.',
        skills: ['Python', 'Functions', 'Modules', 'Data Structures'],
        prerequisites: [],
        estimatedHours: 20,
        courseId: 'python-programming',
        lessonIds: ['python-intro'],
        practiceIds: ['py-q-dict-complexity'],
        gameIds: ['algorithm-race'],
        status: 'available',
        whyItMatters: 'Python is the industry standard language for rapid development and AI.',
        order: 1
      },
      {
        id: 'node-py-2',
        title: 'Mathematics, Vector Math & NumPy',
        category: 'Language',
        description: 'Linear algebra, vector operations, matrices, and NumPy array acceleration.',
        skills: ['NumPy', 'Linear Algebra', 'Vectorization', 'Mathematics'],
        prerequisites: ['node-py-1'],
        estimatedHours: 25,
        courseId: 'python-programming',
        lessonIds: ['py-numpy'],
        practiceIds: ['aiml-q-numpy-broadcasting'],
        gameIds: ['loss-curve-challenge'],
        status: 'locked',
        whyItMatters: 'High-performance AI models rely on vectorized tensor computations.',
        order: 2
      },
      {
        id: 'node-py-3',
        title: 'Statistical Modeling & Data Cleaning',
        category: 'Core Skills',
        description: 'Probability distributions, hypothesis testing, and Pandas dataframes.',
        skills: ['Statistics', 'Pandas', 'Data Analysis', 'Precision & Recall'],
        prerequisites: ['node-py-2'],
        estimatedHours: 30,
        courseId: 'machine-learning',
        lessonIds: ['py-pandas'],
        practiceIds: ['aiml-q-precision-recall'],
        gameIds: ['model-trainer'],
        status: 'locked',
        whyItMatters: 'Clean statistical datasets drive accurate model training.',
        order: 3
      },
      {
        id: 'node-py-4',
        title: 'Supervised & Unsupervised Machine Learning',
        category: 'Core Skills',
        description: 'Regression, classification, decision trees, random forests, and k-means clustering.',
        skills: ['Scikit-learn', 'Regression', 'Classification', 'Model Tuning'],
        prerequisites: ['node-py-3'],
        estimatedHours: 40,
        courseId: 'machine-learning',
        lessonIds: ['ml-algorithms'],
        practiceIds: ['aiml-q-overfitting-regularization'],
        gameIds: ['loss-curve-challenge'],
        status: 'locked',
        whyItMatters: 'Core machine learning algorithms power predictive analytics across industries.',
        order: 4
      },
      {
        id: 'node-py-5',
        title: 'Deep Neural Networks & Architectures',
        category: 'Specialization',
        description: 'Multi-layer perceptrons, backpropagation, PyTorch tensors, and CNNs.',
        skills: ['PyTorch', 'Neural Networks', 'Deep Learning', 'Transformers'],
        prerequisites: ['node-py-4'],
        estimatedHours: 45,
        courseId: 'ai-foundations',
        lessonIds: ['dl-pytorch'],
        gameIds: ['model-trainer'],
        status: 'locked',
        whyItMatters: 'Deep learning enables modern generative AI and computer vision.',
        order: 5
      },
      {
        id: 'node-py-6',
        title: 'Production RAG & AI Capstone System',
        category: 'Build',
        description: 'Deploy a vector database RAG system powered by Gemini/PyTorch.',
        skills: ['Vector DB', 'RAG', 'LLM', 'FastAPI', 'AI Capstone'],
        prerequisites: ['node-py-5'],
        estimatedHours: 40,
        courseId: 'ai-foundations',
        lessonIds: ['ai-capstone'],
        projectIds: ['rag-ai-system'],
        status: 'locked',
        whyItMatters: 'Bridges experimental AI notebooks with enterprise product software.',
        order: 6
      }
    ];
  } else if (input.branch === 'Electronics / ECE') {
    nodes = [
      {
        id: 'node-ece-1',
        title: 'C Programming & Bitwise Logic',
        category: 'Foundation',
        description: 'Variables, pointers, bit masking, and register manipulation in C.',
        skills: ['C', 'Pointers', 'Bit Masking', 'Registers'],
        prerequisites: [],
        estimatedHours: 20,
        courseId: 'c-programming',
        lessonIds: ['c-intro'],
        practiceIds: ['ece-q-bitwise-gpio'],
        gameIds: ['c-debug-duel'],
        status: 'available',
        whyItMatters: 'Microcontrollers run bare-metal C code directly on hardware registers.',
        order: 1
      },
      {
        id: 'node-ece-2',
        title: 'Digital Electronics & Logic Circuits',
        category: 'Core Skills',
        description: 'Combinational logic gates, Boolean algebra, flip-flops, and K-maps.',
        skills: ['Digital Logic', 'Logic Gates', 'Flip-Flops', 'Boolean Algebra'],
        prerequisites: ['node-ece-1'],
        estimatedHours: 25,
        courseId: 'digital-electronics',
        lessonIds: ['de-logic-gates'],
        practiceIds: ['ece-q-nand-universal'],
        gameIds: ['logic-gate-simulator'],
        status: 'locked',
        whyItMatters: 'Forms the physical hardware basis of integrated microprocessors.',
        order: 2
      },
      {
        id: 'node-ece-3',
        title: 'Microcontroller Architecture & GPIO Peripherals',
        category: 'Core Skills',
        description: 'Timers, interrupts, ADC, and serial buses (SPI, I2C, UART).',
        skills: ['Microcontrollers', 'Embedded C', 'GPIO', 'I2C/SPI/UART'],
        prerequisites: ['node-ece-2'],
        estimatedHours: 35,
        courseId: 'microcontrollers-embedded',
        lessonIds: ['mc-gpio'],
        gameIds: ['c-debug-duel'],
        status: 'locked',
        whyItMatters: 'Interfaces software code with physical sensors and hardware actuators.',
        order: 3
      },
      {
        id: 'node-ece-4',
        title: 'Smart Embedded Hardware Sensor Project',
        category: 'Build',
        description: 'Program ARM Cortex hardware telemetry system with MQTT cloud transport.',
        skills: ['Embedded C', 'Microcontrollers', 'IoT', 'MQTT Capstone'],
        prerequisites: ['node-ece-3'],
        estimatedHours: 35,
        courseId: 'microcontrollers-embedded',
        lessonIds: ['ece-capstone'],
        projectIds: ['smart-iot-monitor'],
        status: 'locked',
        whyItMatters: 'Demonstrates full-stack hardware and firmware engineering capability.',
        order: 4
      }
    ];
  } else {
    // General engineering roadmap for EE, ME, CE, or custom selection
    nodes = [
      {
        id: 'node-gen-1',
        title: `${input.branch} Foundations & Mechanics`,
        category: 'Foundation',
        description: `Core theoretical principles, mathematics, and fundamental analysis for ${input.branch}.`,
        skills: [input.branch, 'Core Fundamentals', 'Problem Solving'],
        prerequisites: [],
        estimatedHours: 25,
        courseId: input.branch === 'Electrical' ? 'circuit-theory' : input.branch === 'Mechanical' ? 'engineering-mechanics' : 'structural-analysis',
        lessonIds: ['gen-intro'],
        practiceIds: input.branch === 'Electrical' ? ['ee-q-kvl-kcl'] : input.branch === 'Mechanical' ? ['me-q-thermo-first-law'] : ['ce-q-bending-moment'],
        status: 'available',
        whyItMatters: `Establishes fundamental physical principles required for ${goal}.`,
        order: 1
      },
      {
        id: 'node-gen-2',
        title: `${activeTech} & CAD Systems Modeling`,
        category: 'Core Skills',
        description: `Computer-aided engineering design and computational simulation using ${activeTech}.`,
        skills: [activeTech, 'CAD Modeling', 'Simulation'],
        prerequisites: ['node-gen-1'],
        estimatedHours: 30,
        courseId: input.branch === 'Electrical' ? 'power-systems' : input.branch === 'Mechanical' ? 'thermodynamics-fluids' : 'structural-analysis',
        lessonIds: ['gen-cad-intro'],
        status: 'locked',
        whyItMatters: 'Transforms theoretical equations into verified computer simulations.',
        order: 2
      },
      {
        id: 'node-gen-3',
        title: `Advanced ${goal} Architecture`,
        category: 'Specialization',
        description: `Industrial application, automation, and real-world system engineering for ${goal}.`,
        skills: [goal, 'System Architecture', 'Optimization'],
        prerequisites: ['node-gen-2'],
        estimatedHours: 35,
        courseId: input.branch === 'Electrical' ? 'power-systems' : 'engineering-mechanics',
        lessonIds: ['gen-capstone'],
        status: 'locked',
        whyItMatters: 'Prepares you for professional engineering licensure and industry deployment.',
        order: 3
      }
    ];
  }

  // Update node statuses based on real userProgress
  let previousCompleted = true;
  nodes = nodes.map(node => {
    const nodeLessons = node.lessonIds || [];
    const isCompleted = nodeLessons.length > 0 && nodeLessons.every(lid => existingProgress[lid]?.completed);
    let status: 'locked' | 'available' | 'in_progress' | 'completed' = 'locked';

    if (isCompleted) {
      status = 'completed';
      previousCompleted = true;
    } else if (previousCompleted) {
      status = 'in_progress';
      previousCompleted = false;
    } else {
      status = 'locked';
    }

    return { ...node, status };
  });

  return {
    id: `user-roadmap-${userId}-${activeTech.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    userId,
    title: `${input.branch} — ${goal} (${activeTech})`,
    branch: input.branch,
    careerGoal: goal,
    subjects: input.subjects,
    technologies: input.technologies,
    activeTechnology: activeTech,
    level: input.level,
    learningTime: input.learningTime,
    learningStyle: input.learningStyle,
    estimatedWeeks: Math.ceil(nodes.reduce((acc, n) => acc + n.estimatedHours, 0) / 5),
    nodes,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

export function assembleUnifiedLearningContext(
  user: User | null,
  attempts: PracticeAttemptRecord[] = [],
  sessions: GameSessionRecord[] = []
): UnifiedLearningContext {
  const branch = user?.engineeringBranch || user?.engineeringField || 'Computer Science';
  const branchInfo = ENGINEERING_BRANCHES[branch] || ENGINEERING_BRANCHES['Computer Science'];
  const careerGoal = user?.careerGoal || branchInfo.careerGoals[0];
  const activeTechnology = user?.activeTechnology || branchInfo.recommendedTechnologies[0] || 'C';

  const roadmap = buildDynamicUserRoadmap(user?.uid || 'guest', {
    branch,
    careerGoal,
    subjects: user?.selectedSubjects || branchInfo.subjects.slice(0, 5),
    technologies: user?.selectedTechnologies || branchInfo.recommendedTechnologies,
    activeTechnology,
    level: user?.experienceLevel || 'Beginner',
    learningTime: user?.dailyLearningTime || '1 hr/day',
    learningStyle: user?.preferredLearningStyle || 'Comprehensive'
  });

  const activeNode = roadmap.nodes.find(n => n.status === 'in_progress' || n.status === 'available') || roadmap.nodes[0];

  // Analyze weak & strong skills from actual practice attempts
  const conceptStats: Record<string, { total: number; correct: number }> = {};
  attempts.forEach(att => {
    const key = att.concept || att.skill || att.topic || 'General Fundamentals';
    if (!conceptStats[key]) conceptStats[key] = { total: 0, correct: 0 };
    conceptStats[key].total += 1;
    if (att.correct) conceptStats[key].correct += 1;
  });

  const weakSkills: string[] = [];
  const strongSkills: string[] = [];

  Object.entries(conceptStats).forEach(([concept, stats]) => {
    const accuracy = stats.correct / stats.total;
    if (accuracy < 0.65 || (stats.total >= 2 && stats.correct === 0)) {
      weakSkills.push(concept);
    } else if (accuracy >= 0.85) {
      strongSkills.push(concept);
    }
  });

  const correctCount = attempts.filter(a => a.correct).length;
  const recentAccuracyPct = attempts.length > 0 ? Math.round((correctCount / attempts.length) * 100) : 0;

  const bestGameScores: Record<string, number> = {};
  sessions.forEach(s => {
    bestGameScores[s.gameId] = Math.max(bestGameScores[s.gameId] || 0, s.score || 0);
  });

  return {
    branch,
    branchShortName: branchInfo.shortName,
    careerGoal,
    activeTechnology,
    selectedSubjects: user?.selectedSubjects || branchInfo.subjects.slice(0, 5),
    selectedTechnologies: user?.selectedTechnologies || branchInfo.recommendedTechnologies,
    experienceLevel: user?.experienceLevel || 'Beginner',
    roadmapTitle: roadmap.title,
    activeNode,
    weakSkills,
    strongSkills,
    recentAccuracyPct,
    totalPracticeAttempts: attempts.length,
    gamesPlayedCount: sessions.length,
    bestGameScores
  };
}

export function getUnifiedRecommendations(ctx: UnifiedLearningContext): UnifiedRecommendations {
  // Practice recommendation
  let practiceMode: UnifiedRecommendations['nextPractice']['mode'] = 'ROADMAP';
  let practiceSkill = ctx.activeNode.skills[0] || ctx.activeTechnology;
  let practiceReason = `Reinforce core concepts from your active node: ${ctx.activeNode.title}.`;

  if (ctx.weakSkills.length > 0) {
    practiceMode = 'WEAK_AREA';
    practiceSkill = ctx.weakSkills[0];
    practiceReason = `Targeted practice session on "${ctx.weakSkills[0]}" identified as a weak area in recent attempts.`;
  } else if (ctx.totalPracticeAttempts === 0) {
    practiceMode = 'QUICK_5';
    practiceReason = `Start your first 5-question quick warm up in ${ctx.activeTechnology}.`;
  }

  // Game recommendation
  let nextGameId = 'algorithm-race';
  let nextGameTitle = 'Algorithm Race: Asymptotic Speed Challenge';
  let nextGameSkill = 'Algorithms & Big-O';
  let nextGameReason = 'Master algorithmic efficiency and time complexities visually.';

  if (ctx.branch === 'Electronics / ECE') {
    nextGameId = 'logic-gate-simulator';
    nextGameTitle = 'Logic Gate Challenge: Circuit Synthesizer';
    nextGameSkill = 'Digital Logic & Gates';
    nextGameReason = 'Synthesize combinational logic gates for hardware registers.';
  } else if (ctx.branch === 'AI / Machine Learning' || ctx.activeTechnology === 'Python') {
    nextGameId = 'model-trainer';
    nextGameTitle = 'Loss Curve Challenge: AI Hyperparameters';
    nextGameSkill = 'Neural Networks & Loss Optimization';
    nextGameReason = 'Tune learning rates and batch sizes to prevent overfitting.';
  } else if (ctx.weakSkills.some(s => s.toLowerCase().includes('sql') || s.toLowerCase().includes('database'))) {
    nextGameId = 'sql-detective';
    nextGameTitle = 'SQL Detective: The Missing Database Case';
    nextGameSkill = 'SQL & Relational Databases';
    nextGameReason = 'Practice interactive SQL queries to solve a missing data case.';
  } else if (ctx.activeTechnology === 'C' || ctx.activeTechnology === 'Embedded C') {
    nextGameId = 'c-debug-duel';
    nextGameTitle = 'C Debug Duel: Pointer & Memory Challenge';
    nextGameSkill = 'C Pointers & Memory Dereferencing';
    nextGameReason = 'Find pointer leaks and buffer overflow bugs interactively.';
  }

  // Mentor Focus
  let mentorPrompt = `Explain ${ctx.activeNode.title} in ${ctx.activeTechnology} with a practical code example.`;
  let mentorReason = `Aligned with your target role as a ${ctx.careerGoal}.`;

  if (ctx.weakSkills.length > 0) {
    mentorPrompt = `I'm struggling with ${ctx.weakSkills[0]}. Can you give me a simple analogy and a step-by-step hint?`;
    mentorReason = `Directly addresses your current weak skill: ${ctx.weakSkills[0]}.`;
  }

  return {
    nextPractice: {
      title: `${practiceSkill} Practice`,
      mode: practiceMode,
      skill: practiceSkill,
      difficulty: (ctx.recentAccuracyPct > 80 ? 'Advanced' : ctx.recentAccuracyPct < 50 ? 'Beginner' : 'Intermediate') as 'Beginner' | 'Intermediate' | 'Advanced',
      estimatedMinutes: practiceMode === 'QUICK_5' ? 5 : 10,
      reason: practiceReason
    },
    nextGame: {
      gameId: nextGameId,
      title: nextGameTitle,
      skill: nextGameSkill,
      difficulty: 'Intermediate',
      reason: nextGameReason
    },
    nextLesson: {
      courseId: ctx.activeNode.courseId || 'c-programming',
      lessonTitle: ctx.activeNode.title,
      reason: `Continue active path toward ${ctx.careerGoal}.`
    },
    mentorFocusPrompt: mentorPrompt,
    mentorFocusReason: mentorReason
  };
}

export function calculateCentralizedProgress(
  roadmap: UserRoadmap | null,
  userProgressList: UserProgress[]
): {
  overallPercentage: number;
  completedNodes: number;
  totalNodes: number;
  completedLessons: number;
  totalLessons: number;
} {
  if (!roadmap || !roadmap.nodes || roadmap.nodes.length === 0) {
    return {
      overallPercentage: 0,
      completedNodes: 0,
      totalNodes: 0,
      completedLessons: 0,
      totalLessons: 0
    };
  }

  const completedLessonsSet = new Set(
    userProgressList.filter(p => p.completed).map(p => p.lessonId)
  );

  const roadmapLessonIds = new Set<string>();
  roadmap.nodes.forEach(node => {
    (node.lessonIds || []).forEach(lid => roadmapLessonIds.add(lid));
  });

  let completedNodes = 0;
  roadmap.nodes.forEach(node => {
    if (node.status === 'completed') {
      completedNodes++;
    } else if (node.lessonIds && node.lessonIds.length > 0) {
      if (node.lessonIds.every(lid => completedLessonsSet.has(lid))) {
        completedNodes++;
      }
    }
  });

  const overallPercentage = Math.round((completedNodes / roadmap.nodes.length) * 100);

  let roadmapCompletedLessonsCount = 0;
  roadmapLessonIds.forEach(lid => {
    if (completedLessonsSet.has(lid)) roadmapCompletedLessonsCount++;
  });

  return {
    overallPercentage: Math.min(overallPercentage, 100),
    completedNodes,
    totalNodes: roadmap.nodes.length,
    completedLessons: roadmapCompletedLessonsCount,
    totalLessons: Math.max(roadmapLessonIds.size, roadmap.nodes.length)
  };
}

export function getRecommendedCoursesForUser(user: Partial<User> | null): Course[] {
  const branchKey = user?.engineeringBranch || user?.engineeringField || 'Computer Science';
  const activeTech = user?.activeTechnology || '';

  // Priority 1: exact tech match
  const techMatch = (c: Course): boolean => {
    const id = c.id.toLowerCase();
    const t = activeTech.toLowerCase();
    if (t.includes('postgres') || t.includes('sql') || t.includes('mysql') || t === 'mongodb' || t === 'redis') {
      return id.includes('database') || id.includes('sql');
    }
    if (t === 'python') return id.includes('python') || id.includes('machine-learning') || id.includes('ai');
    if (t === 'c' || t === 'embedded c') return id.includes('c-programming');
    if (t === 'c++') return id.includes('cpp');
    if (t === 'java' || t.includes('spring')) return id.includes('java');
    if (t.includes('javascript') || t.includes('typescript') || t === 'node.js' || t === 'react') {
      return id.includes('web') || id.includes('javascript');
    }
    if (t === 'go') return id.includes('computer-networks') || id.includes('c-programming');
    if (t === 'rust') return id.includes('c-programming');
    if (t === 'docker' || t === 'kubernetes' || t === 'devops') {
      return id.includes('computer-networks') || id.includes('database');
    }
    if (t === 'machine learning' || t === 'ai') {
      return id.includes('machine-learning') || id.includes('ai') || id.includes('python');
    }
    return false;
  };

  // Priority 2: branch match
  const branchMatch = (c: Course): boolean => {
    if (c.branch && c.branch === branchKey) return true;
    if (branchKey === 'Electronics / ECE') {
      return c.id === 'digital-electronics' || c.id === 'microcontrollers-embedded' || c.id === 'c-programming';
    }
    if (branchKey === 'Electrical') {
      return c.id === 'circuit-theory' || c.id === 'power-systems';
    }
    if (branchKey === 'Mechanical') {
      return c.id === 'engineering-mechanics' || c.id === 'thermodynamics-fluids';
    }
    if (branchKey === 'Civil') {
      return c.id === 'structural-analysis';
    }
    if (branchKey === 'AI / Machine Learning') {
      return c.id === 'machine-learning' || c.id === 'ai-foundations' || c.id === 'python-programming';
    }
    // Computer Science / IT
    return ['c-programming', 'python-programming', 'data-structures-algorithms', 'database-systems', 'java-programming'].includes(c.id);
  };

  const techMatches = seedCourses.filter(techMatch);
  if (techMatches.length >= 2) return techMatches.slice(0, 6);

  return seedCourses.filter(branchMatch).slice(0, 6);
}

export function getRecommendedGamesForUser(user: Partial<User> | null): Game[] {
  const activeTech = user?.activeTechnology || 'C';
  const branchKey = user?.engineeringBranch || 'Computer Science';

  if (activeTech === 'C' || activeTech === 'Embedded C') {
    return seedGames.filter(g => g.id === 'c-debug-duel' || g.id === 'algorithm-race' || g.id === 'packet-runner' || g.id === 'sql-detective');
  }
  if (branchKey === 'AI / Machine Learning' || activeTech === 'Python') {
    return seedGames.filter(g => g.id === 'model-trainer' || g.id === 'sql-detective' || g.id === 'algorithm-race');
  }
  if (branchKey === 'Electronics / ECE') {
    return seedGames.filter(g => g.id === 'logic-gate-simulator' || g.id === 'c-debug-duel' || g.id === 'packet-runner');
  }
  return seedGames;
}

export function getRecommendedGames(user: Partial<User> | null): Game[] {
  return getRecommendedGamesForUser(user);
}

export function getRecommendedProjectsForUser(user: Partial<User> | null): Project[] {
  const activeTech = user?.activeTechnology || 'C';
  const branchKey = user?.engineeringBranch || 'Computer Science';

  if (activeTech === 'C' || activeTech === 'Embedded C') {
    return seedProjects.filter(p => p.id === 'c-cli-tool' || p.id === 'smart-iot-monitor' || p.id === 'rest-api-engine');
  }
  if (branchKey === 'AI / Machine Learning' || activeTech === 'Python') {
    return seedProjects.filter(p => p.id === 'rag-ai-system' || p.id === 'rest-api-engine');
  }
  if (branchKey === 'Electronics / ECE') {
    return seedProjects.filter(p => p.id === 'smart-iot-monitor' || p.id === 'c-cli-tool');
  }
  return seedProjects;
}
