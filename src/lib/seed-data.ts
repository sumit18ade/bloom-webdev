/**
 * Seed Data for Bloom Application
 * 
 * Contains authentic engineering courses, modules, lessons, games, and projects
 * spanning Computer Science, IT, AI/ML, ECE, EE, Mechanical, and Civil.
 */

import { Course, Module, Lesson, Game, Project, Achievement } from '@/types/firestore';

export const seedCourses: Course[] = [
  // CSE / IT / GENERAL
  {
    id: 'c-programming',
    title: 'C Programming & Systems Fundamentals',
    slug: 'c-programming',
    description: 'Master C programming, pointers, memory allocation, bitwise operations, and low-level system calls.',
    level: 'Beginner',
    category: 'Programming',
    branch: 'Computer Science',
    estimatedHours: 35,
    skills: ['C', 'Pointers', 'Memory Management', 'Bitwise Operations', 'Data Structures in C'],
    prerequisites: [],
    thumbnail: '/courses/c.jpg',
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cpp-programming',
    title: 'C++ Systems & OOP Design',
    slug: 'cpp-programming',
    description: 'Learn modern C++, RAII, object-oriented design, template metaprogramming, and STL algorithms.',
    level: 'Intermediate',
    category: 'Programming',
    branch: 'Computer Science',
    estimatedHours: 40,
    skills: ['C++', 'OOP', 'STL', 'Templates', 'RAII', 'Memory Management'],
    prerequisites: ['c-programming'],
    thumbnail: '/courses/cpp.jpg',
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'java-programming',
    title: 'Java Core & Enterprise Architecture',
    slug: 'java-programming',
    description: 'Master Java OOP, JVM execution model, multithreading, collection frameworks, and Spring boot basics.',
    level: 'Intermediate',
    category: 'Programming',
    branch: 'Computer Science',
    estimatedHours: 45,
    skills: ['Java', 'JVM', 'Multithreading', 'Collections', 'OOP', 'Spring'],
    prerequisites: [],
    thumbnail: '/courses/java.jpg',
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'python-programming',
    title: 'Python Programming',
    slug: 'python-programming',
    description: 'Master Python from fundamentals to advanced concepts including OOP, data structures, and practical applications.',
    level: 'Beginner',
    category: 'Programming',
    branch: 'Computer Science',
    estimatedHours: 40,
    skills: ['Python', 'OOP', 'Data Structures', 'Algorithms', 'Debugging'],
    prerequisites: [],
    thumbnail: '/courses/python.jpg',
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'data-structures-algorithms',
    title: 'Data Structures & Algorithms',
    slug: 'data-structures-algorithms',
    description: 'Deep dive into fundamental data structures and algorithms essential for efficient problem-solving and technical interviews.',
    level: 'Intermediate',
    category: 'Computer Science',
    branch: 'Computer Science',
    estimatedHours: 60,
    skills: ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Sorting', 'Searching'],
    prerequisites: ['c-programming'],
    thumbnail: '/courses/dsa.jpg',
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'database-systems',
    title: 'Database Systems & SQL Optimization',
    slug: 'database-systems',
    description: 'Learn relational database design, SQL, normalization, indexing, and query optimization for building robust data layers.',
    level: 'Intermediate',
    category: 'Data',
    branch: 'Computer Science',
    estimatedHours: 35,
    skills: ['SQL', 'Database Design', 'Normalization', 'Indexing', 'Query Optimization'],
    prerequisites: [],
    thumbnail: '/courses/databases.jpg',
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'computer-networks',
    title: 'Computer Networks & TCP/IP Stack',
    slug: 'computer-networks',
    description: 'Understand networking fundamentals including OSI model, TCP/IP, routing, switching, and network security protocols.',
    level: 'Intermediate',
    category: 'Infrastructure',
    branch: 'Computer Science',
    estimatedHours: 45,
    skills: ['TCP/IP', 'OSI Model', 'Routing', 'Network Security', 'Protocols'],
    prerequisites: [],
    thumbnail: '/courses/networks.jpg',
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'web-development',
    title: 'Web Development & Frontend Architecture',
    slug: 'web-development',
    description: 'Build modern web applications using React, Next.js, and related technologies. Learn frontend architecture and best practices.',
    level: 'Intermediate',
    category: 'Development',
    branch: 'Computer Science',
    estimatedHours: 50,
    skills: ['React', 'Next.js', 'TypeScript', 'CSS', 'REST APIs'],
    prerequisites: [],
    thumbnail: '/courses/webdev.jpg',
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // AI / ML
  {
    id: 'machine-learning',
    title: 'Machine Learning Algorithms & Pipelines',
    slug: 'machine-learning',
    description: 'Introduction to machine learning concepts, algorithms, and practical implementation using Python and scikit-learn.',
    level: 'Advanced',
    category: 'AI/ML',
    branch: 'AI / Machine Learning',
    estimatedHours: 55,
    skills: ['ML Algorithms', 'Scikit-learn', 'Model Training', 'Feature Engineering', 'Evaluation'],
    prerequisites: ['python-programming'],
    thumbnail: '/courses/ml.jpg',
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'ai-foundations',
    title: 'Artificial Intelligence & Neural Networks',
    slug: 'artificial-intelligence-foundations',
    description: 'Explore AI fundamentals including search algorithms, knowledge representation, planning, and neural networks.',
    level: 'Advanced',
    category: 'AI/ML',
    branch: 'AI / Machine Learning',
    estimatedHours: 45,
    skills: ['Search Algorithms', 'Neural Networks', 'PyTorch', 'Planning', 'Knowledge Representation'],
    prerequisites: ['python-programming'],
    thumbnail: '/courses/ai.jpg',
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // ECE
  {
    id: 'digital-electronics',
    title: 'Digital Electronics & Logic Circuit Design',
    slug: 'digital-electronics',
    description: 'Boolean algebra, combinational logic gates, sequential logic, flip-flops, and K-map optimization.',
    level: 'Beginner',
    category: 'Electronics',
    branch: 'Electronics / ECE',
    estimatedHours: 40,
    skills: ['Digital Logic', 'Logic Gates', 'Flip-Flops', 'Boolean Algebra', 'K-Maps'],
    prerequisites: [],
    thumbnail: '/courses/digital.jpg',
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'microcontrollers-embedded',
    title: 'Microcontrollers & Embedded C Architecture',
    slug: 'microcontrollers-embedded',
    description: 'Program ARM Cortex and ESP32 microcontrollers. Interface timers, interrupts, ADC, and serial buses (SPI, I2C, UART).',
    level: 'Intermediate',
    category: 'Embedded Systems',
    branch: 'Electronics / ECE',
    estimatedHours: 50,
    skills: ['Microcontrollers', 'Embedded C', 'GPIO', 'Interrupts', 'I2C/SPI/UART'],
    prerequisites: ['c-programming', 'digital-electronics'],
    thumbnail: '/courses/embedded.jpg',
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // ELECTRICAL
  {
    id: 'circuit-theory',
    title: 'Circuit Theory & AC/DC Network Analysis',
    slug: 'circuit-theory',
    description: 'Kirchhoff laws, Thevenin/Norton equivalents, transient analysis, phasors, and 3-phase AC networks.',
    level: 'Beginner',
    category: 'Electrical',
    branch: 'Electrical',
    estimatedHours: 35,
    skills: ['KVL/KCL', 'Thevenin Theorem', 'AC Phasors', 'Transients', '3-Phase Power'],
    prerequisites: [],
    thumbnail: '/courses/circuits.jpg',
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'power-systems',
    title: 'Power Systems & Electrical Grid Engineering',
    slug: 'power-systems',
    description: 'Generation, transmission lines, load flow analysis, fault analysis, and smart grid automation.',
    level: 'Intermediate',
    category: 'Electrical',
    branch: 'Electrical',
    estimatedHours: 45,
    skills: ['Power Transmission', 'Load Flow', 'Fault Analysis', 'Grid Protection', 'Transformers'],
    prerequisites: ['circuit-theory'],
    thumbnail: '/courses/powersystems.jpg',
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // MECHANICAL
  {
    id: 'engineering-mechanics',
    title: 'Engineering Mechanics & Statics',
    slug: 'engineering-mechanics',
    description: 'Equilibrium of rigid bodies, force vectors, moment analysis, trusses, friction, and centroid calculations.',
    level: 'Beginner',
    category: 'Mechanical',
    branch: 'Mechanical',
    estimatedHours: 40,
    skills: ['Statics', 'Free Body Diagrams', 'Trusses', 'Moments of Inertia', 'Friction'],
    prerequisites: [],
    thumbnail: '/courses/mechanics.jpg',
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'thermodynamics-fluids',
    title: 'Thermodynamics & Heat Transfer',
    slug: 'thermodynamics-fluids',
    description: 'First & Second laws of thermodynamics, Carnot cycles, heat exchangers, fluid statics, and Bernoulli principle.',
    level: 'Intermediate',
    category: 'Mechanical',
    branch: 'Mechanical',
    estimatedHours: 45,
    skills: ['Thermodynamics', 'Enthalpy', 'Entropy', 'Fluid Flow', 'Heat Transfer'],
    prerequisites: ['engineering-mechanics'],
    thumbnail: '/courses/thermo.jpg',
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // CIVIL
  {
    id: 'structural-analysis',
    title: 'Structural Analysis & RCC Design',
    slug: 'structural-analysis',
    description: 'Shear force & bending moment diagrams, indeterminate structures, reinforced concrete (RCC) beam design, and BIM modeling.',
    level: 'Intermediate',
    category: 'Civil',
    branch: 'Civil',
    estimatedHours: 50,
    skills: ['Structural Analysis', 'Bending Moments', 'RCC Design', 'BIM', 'Stress Analysis'],
    prerequisites: [],
    thumbnail: '/courses/structures.jpg',
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

export const seedModules: Module[] = [
  // C Programming Modules
  {
    id: 'c-mod-1',
    courseId: 'c-programming',
    title: 'C Fundamentals & Syntax',
    description: 'Variables, data types, control flow, functions, and compilation toolchains.',
    order: 1,
    estimatedMinutes: 120,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'c-mod-2',
    courseId: 'c-programming',
    title: 'Pointers & Dynamic Memory',
    description: 'Address arithmetic, pointers, malloc/free, memory leaks, and stack vs heap.',
    order: 2,
    estimatedMinutes: 150,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Python Modules
  {
    id: 'python-basics',
    courseId: 'python-programming',
    title: 'Python Basics & Control Flow',
    description: 'Introduction to Python syntax, variables, conditionals, and loops.',
    order: 1,
    estimatedMinutes: 120,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'python-oop',
    courseId: 'python-programming',
    title: 'Functions & Object-Oriented Design',
    description: 'Creating reusable functions, classes, inheritance, and modules.',
    order: 2,
    estimatedMinutes: 140,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // DSA Modules
  {
    id: 'dsa-mod-1',
    courseId: 'data-structures-algorithms',
    title: 'Arrays, Lists & Asymptotic Analysis',
    description: 'Contiguous memory layout, linked list pointers, Big-O notation.',
    order: 1,
    estimatedMinutes: 160,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // DBMS Modules
  {
    id: 'dbms-mod-1',
    courseId: 'database-systems',
    title: 'Relational Model & SQL Fundamentals',
    description: 'Schema design, SELECT queries, JOIN operations, and indexing.',
    order: 1,
    estimatedMinutes: 130,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Digital Electronics Modules
  {
    id: 'de-mod-1',
    courseId: 'digital-electronics',
    title: 'Logic Gates & Boolean Algebra',
    description: 'AND/OR/NOT gates, truth tables, and K-map simplification.',
    order: 1,
    estimatedMinutes: 120,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Microcontrollers Modules
  {
    id: 'mc-mod-1',
    courseId: 'microcontrollers-embedded',
    title: 'ARM & Microcontroller Hardware Peripherals',
    description: 'Registers, GPIO pins, UART communication, and hardware timers.',
    order: 1,
    estimatedMinutes: 150,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Circuit Theory Modules
  {
    id: 'ct-mod-1',
    courseId: 'circuit-theory',
    title: 'DC Network Theorems & AC Analysis',
    description: 'KVL/KCL equations, Thevenin equivalent circuits, and phasors.',
    order: 1,
    estimatedMinutes: 110,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Mechanics Modules
  {
    id: 'em-mod-1',
    courseId: 'engineering-mechanics',
    title: 'Statics of Particles & Rigid Bodies',
    description: 'Free body diagrams, vector forces, moments, and static equilibrium.',
    order: 1,
    estimatedMinutes: 130,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Structural Analysis Modules
  {
    id: 'sa-mod-1',
    courseId: 'structural-analysis',
    title: 'Beams, Trusses & Bending Moments',
    description: 'Shear force diagrams, bending moments, and structural load distribution.',
    order: 1,
    estimatedMinutes: 140,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

export const seedLessons: Lesson[] = [
  // C Lessons
  {
    id: 'c-intro',
    moduleId: 'c-mod-1',
    title: 'Introduction to C Programming',
    slug: 'introduction-to-c',
    description: 'Learn C compilation process, variables, data types, and standard IO.',
    content: `# Introduction to C Programming

C is a procedural programming language created by Dennis Ritchie at Bell Labs in 1972. It provides low-level memory access and clean machine compilation.

## C Execution Model

1. **Preprocessing**: Expands \`#include\` headers and macros.
2. **Compilation**: Translates C code into assembly instructions.
3. **Assembly**: Generates object code binary (\`.o\` / \`.obj\`).
4. **Linking**: Combines object code with system libraries into an executable.

\`\`\`c
#include <stdio.stdio.h>

int main() {
    printf("Hello, Bloom Engineer!\\n");
    return 0;
}
\`\`\``,
    learningObjectives: [
      'Understand the 4-stage C compilation pipeline',
      'Declare primitive integer, float, and char variables',
      'Write and compile your first C binary'
    ],
    estimatedMinutes: 20,
    resources: [],
    videoResources: [],
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'c-pointers',
    moduleId: 'c-mod-2',
    title: 'Pointers & Memory Addresses',
    slug: 'pointers-and-memory',
    description: 'Master memory addresses (&), pointer dereferencing (*), and stack allocation.',
    content: `# Pointers and Memory Addresses in C

A pointer is a variable whose value is the memory address of another variable.

## Dereferencing and Address Operators

\`\`\`c
int val = 42;
int *ptr = &val; // ptr holds address of val

printf("Value: %d\\n", *ptr);   // Prints 42
printf("Address: %p\\n", ptr);  // Prints memory address
\`\`\``,
    learningObjectives: [
      'Use address-of (&) and dereference (*) operators',
      'Understand stack frame allocation during function calls',
      'Prevent dangling pointer bugs and memory faults'
    ],
    estimatedMinutes: 25,
    resources: [],
    videoResources: [],
    order: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Python Lessons
  {
    id: 'python-intro',
    moduleId: 'python-basics',
    title: 'Introduction to Python',
    slug: 'introduction-to-python',
    description: 'Learn Python syntax, dynamic typing, and standard libraries.',
    content: `# Introduction to Python

Python is a high-level interpreted language prized for clarity, data processing, and AI ecosystem support.

\`\`\`python
def calculate_growth(initial, rate, steps):
    return [initial * ((1 + rate) ** i) for i in range(steps)]

print(calculate_growth(100, 0.05, 5))
\`\`\``,
    learningObjectives: [
      'Understand Python dynamic typing and scope',
      'Use list comprehensions and functions',
      'Run Python scripts in standard shell environment'
    ],
    estimatedMinutes: 15,
    resources: [],
    videoResources: [],
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Digital Electronics Lessons
  {
    id: 'de-logic-gates',
    moduleId: 'de-mod-1',
    title: 'Logic Gates & Truth Tables',
    slug: 'logic-gates-and-truth-tables',
    description: 'Understand AND, OR, NOT, NAND, NOR, and XOR logic gates and truth table derivations.',
    content: `# Digital Logic Gates & Truth Tables

Digital electronics relies on binary voltage states (0 = Ground, 1 = VCC).

## Fundamental Logic Gates

- **AND Gate**: Output is 1 only if all inputs are 1.
- **OR Gate**: Output is 1 if any input is 1.
- **NAND Gate**: Universal gate producing inverted AND output.

\`\`\`
A B | AND | OR | NAND
0 0 |  0  | 0  |  1
0 1 |  0  | 1  |  1
1 0 |  0  | 1  |  1
1 1 |  1  | 1  |  0
\`\`\``,
    learningObjectives: [
      'Construct truth tables for combinational logic circuits',
      'Apply De Morgan theorems to simplify boolean expressions',
      'Design basic logic circuits using universal NAND gates'
    ],
    estimatedMinutes: 20,
    resources: [],
    videoResources: [],
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Civil Engineering & Structural Analysis
  {
    id: 'sa-beams-bending',
    moduleId: 'sa-mod-1',
    title: 'Shear Force & Bending Moment Diagrams',
    slug: 'shear-force-and-bending-moment-diagrams',
    description: 'Calculate shear forces, bending moments, and point load distributions on simply supported beams.',
    content: `# Shear Force & Bending Moment Diagrams in Structural Engineering

Shear Force (V) and Bending Moment (M) equations govern structural integrity and beam sizing in civil engineering.

## Equilibrium Equations for Beams

$$\\sum F_y = 0 \\quad \\implies \\quad R_A + R_B = P$$
$$\\sum M_A = 0 \\quad \\implies \\quad R_B \\cdot L = P \\cdot a$$

## Shear Force Diagram (SFD) & Bending Moment Diagram (BMD)

1. **Point Load**: SFD is a step function; BMD is a linear slope.
2. **Uniformly Distributed Load (UDL)**: SFD is linear; BMD is parabolic ($M_{max} = \\frac{w L^2}{8}$).`,
    learningObjectives: [
      'Derive support reactions RA and RB using static equilibrium equations',
      'Construct Shear Force Diagrams (SFD) for point and UDL loads',
      'Calculate maximum bending moment (BMD) for structural beam safety'
    ],
    estimatedMinutes: 30,
    resources: [],
    videoResources: [],
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Mechanical Engineering & Statics
  {
    id: 'em-statics-vectors',
    moduleId: 'em-mod-1',
    title: 'Statics of Rigid Bodies & Free Body Diagrams',
    slug: 'statics-free-body-diagrams',
    description: 'Construct free body diagrams, resolve coplanar force vectors, and solve static equilibrium equations.',
    content: `# Statics of Rigid Bodies & Free Body Diagrams

Statics analyzes structures in mechanical equilibrium where acceleration is zero.

## Vector Force Components

$$F_x = F \\cos(\\theta), \\quad F_y = F \\sin(\\theta)$$
$$\\sum F_x = 0, \\quad \\sum F_y = 0, \\quad \\sum M_O = 0$$`,
    learningObjectives: [
      'Isolate mechanical components into accurate Free Body Diagrams (FBD)',
      'Resolve 2D and 3D force vectors into orthogonal components',
      'Solve moment equilibrium around arbitrary pivot points'
    ],
    estimatedMinutes: 25,
    resources: [],
    videoResources: [],
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Electrical Engineering & Circuit Theory
  {
    id: 'ct-circuit-theorems',
    moduleId: 'ct-mod-1',
    title: "Kirchhoff's Laws & Network Analysis",
    slug: 'kirchhoffs-laws-network-analysis',
    description: "Apply Kirchhoff Current Law (KCL), Kirchhoff Voltage Law (KVL), and Thevenin equivalent circuits.",
    content: `# Kirchhoff's Laws & Network Theorems

Circuit analysis forms the foundation of electrical engineering networks.

## KCL & KVL Equations

- **KCL (Nodal)**: $\\sum I_{in} = \\sum I_{out}$ at any circuit node.
- **KVL (Mesh)**: $\\sum V = 0$ around a closed loop.`,
    learningObjectives: [
      'Apply KCL to derive nodal voltage equations',
      'Use KVL to set up mesh loop equations',
      'Compute Thevenin equivalent voltage (Vth) and resistance (Rth)'
    ],
    estimatedMinutes: 25,
    resources: [],
    videoResources: [],
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Data Structures & Algorithms
  {
    id: 'dsa-asymptotic-analysis',
    moduleId: 'dsa-mod-1',
    title: 'Arrays, Linked Lists & Big-O Notation',
    slug: 'arrays-linked-lists-big-o',
    description: 'Analyze memory layouts of arrays vs pointers, and compute Big-O time and space complexity.',
    content: `# Data Structures & Asymptotic Analysis

Algorithm efficiency is quantified using Big-O notation.

## Time Complexity Benchmarks

- **Array Lookup**: $O(1)$ constant time.
- **Linked List Traversal**: $O(N)$ linear time.
- **Binary Search**: $O(\\log N)$ logarithmic time.
- **Merge Sort**: $O(N \\log N)$ linearithmic time.`,
    learningObjectives: [
      'Compare contiguous array allocation vs linked list pointer nodes',
      'Derive worst-case Big-O time complexity for loops and recursion',
      'Optimize algorithm runtime from $O(N^2)$ to $O(N \\log N)$'
    ],
    estimatedMinutes: 30,
    resources: [],
    videoResources: [],
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // DBMS
  {
    id: 'dbms-relational-sql',
    moduleId: 'dbms-mod-1',
    title: 'Relational Schema Design & SQL Queries',
    slug: 'relational-schema-sql-queries',
    description: 'Master relational schema design, primary/foreign keys, SELECT queries, and INNER/LEFT JOINs.',
    content: `# Database Systems & SQL Optimization

Relational databases structure application data using tables, keys, and ACID transactions.

\`\`\`sql
SELECT u.name, COUNT(p.id) AS total_projects
FROM users u
INNER JOIN projects p ON u.id = p.user_id
WHERE u.status = 'active'
GROUP BY u.id
HAVING COUNT(p.id) > 2;
\`\`\``,
    learningObjectives: [
      'Design normalized 3NF database schemas with primary/foreign keys',
      'Write complex multi-table SQL JOIN queries',
      'Optimize query execution paths using B-Tree indexes'
    ],
    estimatedMinutes: 30,
    resources: [],
    videoResources: [],
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

export const seedGames: Game[] = [
  {
    id: 'c-debug-duel',
    title: 'C Debug Duel: Pointer & Memory Challenge',
    description: 'Find memory leaks, dangling pointers, and stack buffer overflows in C code snippets.',
    type: 'AlgorithmRace' as const,
    difficulty: 'Intermediate' as const,
    instructions: 'Inspect the C code snippet, spot memory bugs, and select the correct pointer fixes.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'sql-detective',
    title: 'SQL Detective: The Missing Database Case',
    description: 'Solve real cyber-investigation cases by executing real SQL queries against an in-browser SQLite database.',
    type: 'SQLDetective' as const,
    difficulty: 'Intermediate' as const,
    instructions: 'Write SQL SELECT statements with WHERE, JOIN, and GROUP BY to extract evidence.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'packet-runner',
    title: 'Packet Runner: Network Subnetting & OSI Layer',
    description: 'Route IP data packets through router interfaces, calculate CIDR subnet masks, and debug delivery.',
    type: 'PacketRunner' as const,
    difficulty: 'Intermediate' as const,
    instructions: 'Select the correct destination port, interface IP, and subnet boundary.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'algorithm-race',
    title: 'Algorithm Race: Asymptotic Speed Challenge',
    description: 'Compare algorithm execution speeds in real time and predict time complexities (O(1), O(N), O(N log N)).',
    type: 'AlgorithmRace' as const,
    difficulty: 'Beginner' as const,
    instructions: 'Inspect array input size and pseudocode, then select optimal search or sort approach.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'model-trainer',
    title: 'Loss Curve Challenge: AI Hyperparameters',
    description: 'Adjust learning rates, batch sizes, and optimizer momentum to train a neural network without overfitting.',
    type: 'ModelTrainer' as const,
    difficulty: 'Advanced' as const,
    instructions: 'Tune parameters live to minimize validation loss and reach accuracy > 92%.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'logic-gate-simulator',
    title: 'Logic Gate Challenge: Circuit Synthesizer',
    description: 'Combine AND, OR, and XOR gates to satisfy complex binary truth table requirements.',
    type: 'MemoryMaze' as const,
    difficulty: 'Beginner' as const,
    instructions: 'Connect input pins to logic gates and verify output binary states.',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

export const seedProjects: Project[] = [
  {
    id: 'c-cli-tool',
    title: 'C High-Performance Memory Manager & CLI',
    description: 'Build a low-level custom memory pool allocator and command-line shell parser in standard C.',
    overview: 'In this project you will implement a custom fixed-size memory pool allocator using pointers and bitmasks.',
    skills: ['C', 'Pointers', 'Memory Allocation', 'CLI Parsing', 'Systems Programming'],
    difficulty: 'Intermediate' as const,
    estimatedTime: 10,
    requirements: ['Understand pointers in C', 'Stack vs heap knowledge', 'File IO'],
    milestones: [
      { id: 'm1', title: 'Memory Pool Allocation Block', description: 'Allocate contiguous chunk with byte alignment.', order: 1, completed: false },
      { id: 'm2', title: 'Free List Management', description: 'Maintain free block headers for allocation and deallocation.', order: 2, completed: false },
      { id: 'm3', title: 'Interactive CLI Parser', description: 'Parse commands and parameters from standard stdin.', order: 3, completed: false },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'rest-api-engine',
    title: 'Scalable REST API & Auth Engine',
    description: 'Build a production-ready REST API with JWT authentication, rate limiting, and database queries.',
    overview: 'Architect a secure backend service handling user registration, token validation, and relational schema.',
    skills: ['C++', 'Node.js', 'SQL', 'JWT Auth', 'REST API', 'System Architecture'],
    difficulty: 'Intermediate' as const,
    estimatedTime: 12,
    requirements: ['Understand HTTP status codes', 'Basic SQL queries', 'JSON web tokens'],
    milestones: [
      { id: 'm1', title: 'Database Schema & Tables', description: 'Design users, sessions, and roles schema.', order: 1, completed: false },
      { id: 'm2', title: 'Authentication Endpoints', description: 'Implement /login, /register, and JWT middleware.', order: 2, completed: false },
      { id: 'm3', title: 'Resource CRUD API', description: 'Build protected routes for data management.', order: 3, completed: false },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'rag-ai-system',
    title: 'RAG Knowledge Base Assistant',
    description: 'Construct a Retrieval-Augmented Generation pipeline using vector embeddings and LLMs to query PDFs.',
    overview: 'Ingest engineering manuals, embed text chunks into a vector store, and construct grounded responses.',
    skills: ['Python', 'Vector DB', 'LangChain', 'OpenAI/Gemini API', 'RAG'],
    difficulty: 'Advanced' as const,
    estimatedTime: 15,
    requirements: ['Python fundamentals', 'API integration', 'Basic linear algebra'],
    milestones: [
      { id: 'm1', title: 'PDF Extraction & Chunking', description: 'Extract clean markdown and build overlapping chunks.', order: 1, completed: false },
      { id: 'm2', title: 'Vector Store Indexing', description: 'Generate vector embeddings and store in memory DB.', order: 2, completed: false },
      { id: 'm3', title: 'Streamed Answer Synthesis', description: 'Pass context to Gemini model and stream answer with citations.', order: 3, completed: false },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'smart-iot-monitor',
    title: 'Smart Embedded Hardware Sensor Node',
    description: 'Program an ARM Cortex microcontroller to read sensor data over I2C and transmit telemetry over MQTT.',
    overview: 'Real-world ECE project interfacing analog/digital hardware sensors with low-power Wi-Fi data telemetry.',
    skills: ['Embedded C', 'Microcontrollers', 'I2C/SPI', 'MQTT', 'IoT'],
    difficulty: 'Intermediate' as const,
    estimatedTime: 10,
    requirements: ['C programming', 'GPIO basics', 'Serial communication'],
    milestones: [
      { id: 'm1', title: 'Hardware Peripheral Setup', description: 'Configure GPIO, ADC, and I2C registers in C.', order: 1, completed: false },
      { id: 'm2', title: 'Sensor Reading Pipeline', description: 'Read temperature/humidity sensor data over I2C bus.', order: 2, completed: false },
      { id: 'm3', title: 'Telemetry Gateway', description: 'Publish payload to MQTT broker.', order: 3, completed: false },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

export const seedAchievements: Achievement[] = [
  {
    id: 'first-lesson',
    title: 'First Lesson',
    description: 'Complete your first lesson on Bloom',
    icon: 'school',
    type: 'Lesson',
    requirement: { type: 'lessons_completed', value: 1 },
    xpReward: 50,
    createdAt: new Date(),
  },
  {
    id: 'streak-7',
    title: '7 Day Streak',
    description: 'Maintain a 7-day learning streak',
    icon: 'local_fire_department',
    type: 'Streak',
    requirement: { type: 'streak_days', value: 7 },
    xpReward: 100,
    createdAt: new Date(),
  },
  {
    id: 'first-project',
    title: 'First Project',
    description: 'Complete your first capstone project',
    icon: 'construction',
    type: 'Project',
    requirement: { type: 'projects_completed', value: 1 },
    xpReward: 200,
    createdAt: new Date(),
  }
];