/**
 * Bloom Practice Question Bank & Seeding Engine
 * 
 * Contains authentic, branch-aware engineering questions across all 7 supported branches:
 * Computer Science, IT, AI/ML, ECE, Electrical, Mechanical, Civil.
 */

export interface PracticeQuestion {
  id: string;
  branch: string | string[];
  careerGoals?: string[];
  subjects?: string[];
  technologies?: string[];
  skills: string[];
  topic: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  type: 
    | 'MCQ' 
    | 'MultipleCorrect' 
    | 'TrueFalse' 
    | 'CodeOutput' 
    | 'Debugging' 
    | 'Ordering' 
    | 'Matching' 
    | 'Scenario' 
    | 'ShortAnswer' 
    | 'Numeric' 
    | 'SQL' 
    | 'CodeCompletion' 
    | 'ConceptID' 
    | 'Diagram' 
    | 'EngineeringProblem';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  hint: string;
  solution?: string;
  code?: string;
  tags: string[];
  commonMistake?: string;
  source?: 'seeded' | 'gemini_generated';
  createdAt?: Date;
  published?: boolean;
}

export const SEEDED_QUESTIONS: PracticeQuestion[] = [
  // ==========================================
  // COMPUTER SCIENCE & IT (C, C++, Java, Python, DSA, DBMS, Networks, Web, Cloud, Security)
  // ==========================================
  {
    id: 'c-q-pointer-deref',
    branch: ['Computer Science', 'Information Technology', 'Electronics / ECE'],
    skills: ['C', 'Pointers', 'Memory Management'],
    topic: 'C Pointer Dereferencing',
    difficulty: 'Beginner',
    type: 'CodeOutput',
    question: 'What is the output of the following C code snippet?\n\n```c\n#include <stdio.h>\nint main() {\n    int a = 10;\n    int *p = &a;\n    *p += 15;\n    printf("%d", a);\n    return 0;\n}\n```',
    options: ['10', '15', '25', 'Compilation Error'],
    correctAnswer: '25',
    explanation: 'The pointer `p` holds the memory address of variable `a`. De-referencing `*p` allows direct modification of the value stored in memory at `a`. Adding 15 to `*p` changes `a` from 10 to 25.',
    hint: 'De-referencing *p directly mutates the memory cell allocated to variable a.',
    tags: ['C', 'pointers', 'memory'],
    commonMistake: 'Confusing pointer address modification (p++) with dereferenced value mutation (*p += 15).'
  },
  {
    id: 'c-q-malloc-calloc',
    branch: ['Computer Science', 'Information Technology', 'Electronics / ECE'],
    skills: ['C', 'Memory Management', 'Heap Allocation'],
    topic: 'Dynamic Memory Allocation in C',
    difficulty: 'Intermediate',
    type: 'MCQ',
    question: 'Which C standard library function allocates dynamic memory on the heap and initializes all bits to zero?',
    options: ['malloc()', 'calloc()', 'realloc()', 'alloc()'],
    correctAnswer: 'calloc()',
    explanation: '`calloc(num_elements, size_per_element)` allocates memory on the heap and explicitly zeroes out every byte, preventing uninitialized memory garbage bugs, whereas `malloc()` leaves existing memory bytes untouched.',
    hint: 'Think of "clean allocation" (clear + allocate).',
    tags: ['C', 'heap', 'malloc', 'calloc'],
    commonMistake: 'Assuming malloc() zero-initializes memory by default.'
  },
  {
    id: 'c-q-double-free',
    branch: ['Computer Science', 'Information Technology'],
    skills: ['C', 'Pointers', 'Systems Programming'],
    topic: 'Heap Corruption & Memory Safety',
    difficulty: 'Advanced',
    type: 'Scenario',
    question: 'What occurs at runtime if a program executes `free(ptr);` twice consecutively on the same dynamically allocated heap pointer without reassigning it?',
    options: [
      'The pointer is assigned NULL automatically.',
      'Undefined Behavior / Heap Corruption Crash',
      'The memory block is allocated again.',
      'No effect, the second call is ignored.'
    ],
    correctAnswer: 'Undefined Behavior / Heap Corruption Crash',
    explanation: 'Calling `free()` twice on the same memory address corrupts the internal metadata bookkeeping structures of the C runtime heap manager (glibc malloc bin tracking), resulting in heap corruption vulnerability or immediate SIGSEGV crash.',
    hint: 'The heap manager relies on internal chunk boundary tags which become corrupted when freed twice.',
    tags: ['C', 'security', 'heap', 'bugs']
  },
  {
    id: 'cpp-q-raii',
    branch: ['Computer Science', 'Information Technology'],
    skills: ['C++', 'OOP', 'RAII', 'Memory Management'],
    topic: 'C++ RAII (Resource Acquisition Is Initialization)',
    difficulty: 'Intermediate',
    type: 'MCQ',
    question: 'What is the core principle of RAII (Resource Acquisition Is Initialization) in modern C++?',
    options: [
      'All variables must be initialized using static factory methods.',
      'Resource management is tied to object lifetime, releasing resources in destructors automatically.',
      'Memory is managed exclusively through a background garbage collector thread.',
      'Objects must be explicitly deleted using free() before leaving function scope.'
    ],
    correctAnswer: 'Resource management is tied to object lifetime, releasing resources in destructors automatically.',
    explanation: 'RAII guarantees that resource ownership (file handles, heap memory, mutex locks) is bound to an object\'s stack lifetime. When the object goes out of scope, its destructor releases the resource automatically, preventing memory leaks even during exception unwinding.',
    hint: 'Destructors run deterministically as scope exits.',
    tags: ['C++', 'RAII', 'memory']
  },
  {
    id: 'java-q-jvm-heap',
    branch: ['Computer Science', 'Information Technology'],
    skills: ['Java', 'JVM', 'Memory Management'],
    topic: 'Java Memory Architecture',
    difficulty: 'Intermediate',
    type: 'MCQ',
    question: 'In the JVM memory model, where are Java class instance objects stored?',
    options: ['Thread Stack', 'Heap Memory', 'Program Counter Register', 'Native Method Stack'],
    correctAnswer: 'Heap Memory',
    explanation: 'In Java, all objects created via the `new` keyword are stored on the shared JVM Heap Memory, whereas local primitive variables and object reference pointers are maintained on individual Thread Stacks.',
    hint: 'The Garbage Collector scans this memory area for unreferenced instances.',
    tags: ['Java', 'JVM', 'heap']
  },
  {
    id: 'py-q-dict-complexity',
    branch: ['Computer Science', 'Information Technology', 'AI / Machine Learning'],
    skills: ['Python', 'Data Structures', 'Hashtables'],
    topic: 'Python Dictionary Time Complexity',
    difficulty: 'Beginner',
    type: 'MCQ',
    question: 'What is the average time complexity for searching or retrieving a key in a standard Python dictionary (`dict`)?',
    options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
    correctAnswer: 'O(1)',
    explanation: 'Python dictionaries are implemented using dynamic hash tables with open addressing, delivering O(1) average time complexity for key insertion, lookup, and deletion operations.',
    hint: 'Hash functions compute bucket indices directly from key byte representations.',
    tags: ['Python', 'hash table', 'time complexity']
  },
  {
    id: 'dsa-q-binary-search-bounds',
    branch: ['Computer Science', 'Information Technology', 'AI / Machine Learning'],
    skills: ['Data Structures', 'Algorithms', 'Binary Search'],
    topic: 'Binary Search Algorithm Prerequisites',
    difficulty: 'Beginner',
    type: 'TrueFalse',
    question: 'True or False: Binary Search can be executed directly with O(log N) efficiency on an un-ordered, non-sorted linked list.',
    options: ['True', 'False'],
    correctAnswer: 'False',
    explanation: 'Binary Search requires both sorted elements AND random-access indexing in O(1) (such as an array). A linked list lacks O(1) random access to middle nodes, making Binary Search O(N) on linked lists.',
    hint: 'Middle element access in a linked list requires traversing pointers from head.',
    tags: ['DSA', 'binary search', 'linked list']
  },
  {
    id: 'dbms-q-sql-join-group',
    branch: ['Computer Science', 'Information Technology'],
    skills: ['SQL', 'Relational Databases', 'DBMS'],
    topic: 'SQL HAVING vs WHERE Clause',
    difficulty: 'Intermediate',
    type: 'SQL',
    question: 'Which SQL clause is specifically used to filter aggregated group results produced by a `GROUP BY` statement?',
    options: ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'],
    correctAnswer: 'HAVING',
    explanation: '`WHERE` filters individual rows prior to grouping, while `HAVING` filters aggregated group records (e.g. `HAVING COUNT(*) > 5`) generated by `GROUP BY`.',
    hint: 'Aggregated values like COUNT() or SUM() cannot be used in a standard WHERE clause.',
    tags: ['SQL', 'DBMS', 'HAVING']
  },
  {
    id: 'net-q-tcp-three-way',
    branch: ['Computer Science', 'Information Technology'],
    skills: ['Computer Networks', 'TCP/IP', 'Networking'],
    topic: 'TCP Connection Handshake',
    difficulty: 'Intermediate',
    type: 'Ordering',
    question: 'What is the correct sequence of control packets transmitted during a standard TCP connection establishment handshake?',
    options: [
      'SYN → SYN-ACK → ACK',
      'ACK → SYN → SYN-ACK',
      'SYN → ACK → FIN',
      'CONNECT → ACCEPT → READY'
    ],
    correctAnswer: 'SYN → SYN-ACK → ACK',
    explanation: 'The TCP 3-way handshake begins with the client sending a SYN (Synchronize sequence number) packet, the server responding with a SYN-ACK packet, and the client confirming with an ACK packet.',
    hint: 'Client synchronizes, server acknowledges and synchronizes, client acknowledges.',
    tags: ['Networking', 'TCP/IP', 'handshake']
  },

  // ==========================================
  // AI & MACHINE LEARNING (Python, Math, Stats, ML, Deep Learning)
  // ==========================================
  {
    id: 'aiml-q-numpy-broadcasting',
    branch: ['AI / Machine Learning', 'Computer Science'],
    skills: ['Python', 'NumPy', 'Linear Algebra'],
    topic: 'NumPy Array Broadcasting',
    difficulty: 'Intermediate',
    type: 'CodeOutput',
    question: 'What is the shape of the array resulting from adding matrix A (shape `(3, 4)`) and vector B (shape `(1, 4)`) in NumPy?',
    options: ['(3, 4)', '(3, 1)', '(4, 4)', 'ValueError'],
    correctAnswer: '(3, 4)',
    explanation: 'NumPy broadcasting stretches dimensions of size 1 to match trailing dimensions. Vector B of shape `(1, 4)` is broadcast across all 3 rows of matrix A, resulting in shape `(3, 4)`.',
    hint: 'Trailing dimensions match (4 == 4), so the dimension of size 1 expands along axis 0.',
    tags: ['Python', 'NumPy', 'AI', 'matrices']
  },
  {
    id: 'aiml-q-precision-recall',
    branch: ['AI / Machine Learning'],
    skills: ['Machine Learning', 'Model Evaluation', 'Statistics'],
    topic: 'Precision vs Recall Metrics',
    difficulty: 'Intermediate',
    type: 'Scenario',
    question: 'When building a medical diagnostic AI system for detecting rare aggressive diseases where missing a positive patient is catastrophic, which metric should be maximized?',
    options: ['Precision', 'Recall (Sensitivity)', 'Specificity', 'Accuracy'],
    correctAnswer: 'Recall (Sensitivity)',
    explanation: 'Recall measures True Positives / (True Positives + False Negatives). High recall minimizes False Negatives (missing diseased patients), ensuring almost all actual cases are identified.',
    hint: 'False Negatives are life-threatening in medical screening.',
    tags: ['ML', 'metrics', 'recall']
  },
  {
    id: 'aiml-q-overfitting-regularization',
    branch: ['AI / Machine Learning'],
    skills: ['Machine Learning', 'Model Tuning', 'Deep Learning'],
    topic: 'Mitigating Model Overfitting',
    difficulty: 'Intermediate',
    type: 'MultipleCorrect',
    question: 'Which of the following techniques effectively reduce model overfitting during training?',
    options: [
      'L2 Weight Regularization (Ridge)',
      'Dropout Layers in Neural Networks',
      'Increasing Model Capacity by adding 10x parameters',
      'Early Stopping based on validation loss'
    ],
    correctAnswer: 'L2 Weight Regularization (Ridge)',
    explanation: 'L2 regularization, Dropout, and Early Stopping restrict model complexity and prevent memorizing noise. Increasing parameters without regularization worsens overfitting.',
    hint: 'Look for constraints that punish large weights or halt over-training.',
    tags: ['ML', 'regularization', 'deep learning']
  },

  // ==========================================
  // ELECTRONICS & COMMUNICATION (ECE / Embedded / Digital Logic)
  // ==========================================
  {
    id: 'ece-q-bitwise-gpio',
    branch: ['Electronics / ECE', 'Computer Science'],
    skills: ['Embedded C', 'Microcontrollers', 'Bit Masking'],
    topic: 'Embedded C Microcontroller Register Manipulation',
    difficulty: 'Intermediate',
    type: 'CodeOutput',
    question: 'In Embedded C, which bitwise operator expression sets Pin 3 HIGH on PORTB without altering any other pin states?',
    options: [
      'PORTB |= (1 << 3);',
      'PORTB &= ~(1 << 3);',
      'PORTB = (1 << 3);',
      'PORTB ^= 3;'
    ],
    correctAnswer: 'PORTB |= (1 << 3);',
    explanation: 'Bitwise OR with `(1 << 3)` creates a mask where bit 3 is 1 and all other bits are 0. `x |= mask` forces bit 3 to 1 while leaving all other bits intact.',
    hint: 'OR sets bits to 1 without overwriting existing 1s.',
    tags: ['ECE', 'embedded', 'C', 'registers']
  },
  {
    id: 'ece-q-nand-universal',
    branch: ['Electronics / ECE', 'Computer Science'],
    skills: ['Digital Logic', 'Logic Gates', 'Boolean Algebra'],
    topic: 'Universal Logic Gates',
    difficulty: 'Beginner',
    type: 'MCQ',
    question: 'Which logic gate is classified as a "Universal Gate" capable of implementing ANY Boolean logic function without other gate types?',
    options: ['AND Gate', 'NAND Gate', 'XOR Gate', 'OR Gate'],
    correctAnswer: 'NAND Gate',
    explanation: 'NAND (and NOR) gates are functionally complete universal gates. Combinations of NAND gates alone can form NOT, AND, OR, XOR, and complex integrated digital circuits.',
    hint: 'Inverting the AND operation yields a functionally complete system.',
    tags: ['ECE', 'digital logic', 'gates']
  },

  // ==========================================
  // ELECTRICAL ENGINEERING (Circuits, Machines, Power)
  // ==========================================
  {
    id: 'ee-q-kvl-kcl',
    branch: ['Electrical', 'Electronics / ECE'],
    skills: ['Circuit Theory', 'KVL/KCL', 'Electrical Analysis'],
    topic: 'Kirchhoff\'s Voltage Law (KVL)',
    difficulty: 'Beginner',
    type: 'MCQ',
    question: 'Kirchhoff\'s Voltage Law (KVL) is a direct consequence of which fundamental law of physics?',
    options: [
      'Conservation of Energy',
      'Conservation of Charge',
      'Faraday\'s Law of Induction',
      'Coulomb\'s Law'
    ],
    correctAnswer: 'Conservation of Energy',
    explanation: 'KVL states that the algebraic sum of electrical potential differences (voltages) around any closed loop in a circuit equals zero, reflecting the Law of Conservation of Energy.',
    hint: 'Electric potential difference represents work done per unit charge around a closed loop.',
    tags: ['EE', 'circuits', 'KVL']
  },

  // ==========================================
  // MECHANICAL ENGINEERING (Statics, Thermo, Fluids, CAD)
  // ==========================================
  {
    id: 'me-q-thermo-first-law',
    branch: ['Mechanical'],
    skills: ['Thermodynamics', 'Heat Transfer', 'Physics'],
    topic: 'First Law of Thermodynamics',
    difficulty: 'Beginner',
    type: 'Numeric',
    question: 'A thermodynamic system absorbs 500 Joules of heat (Q) and performs 200 Joules of work (W) on its surroundings. What is the net change in internal energy (ΔU) in Joules?',
    options: ['300', '700', '-300', '2.5'],
    correctAnswer: '300',
    explanation: 'According to the First Law of Thermodynamics, `ΔU = Q - W`. Substituting values: `ΔU = 500 J - 200 J = 300 J`.',
    hint: 'ΔU = Q - W',
    tags: ['ME', 'thermodynamics', 'energy']
  },

  // ==========================================
  // CIVIL ENGINEERING (Structures, RCC, Surveying)
  // ==========================================
  {
    id: 'ce-q-bending-moment',
    branch: ['Civil'],
    skills: ['Structural Analysis', 'Bending Moments', 'Beams'],
    topic: 'Simply Supported Beam Bending Moment',
    difficulty: 'Intermediate',
    type: 'MCQ',
    question: 'For a simply supported beam of length L carrying a single concentrated point load W at mid-span, what is the maximum bending moment (M_max)?',
    options: ['(W * L) / 4', '(W * L) / 8', '(W * L^2) / 8', '(W * L) / 2'],
    correctAnswer: '(W * L) / 4',
    explanation: 'Support reactions are W/2 each. The maximum bending moment occurs at mid-span (x = L/2): `M_max = (W/2) * (L/2) = (W * L) / 4`.',
    hint: 'Calculate reaction at support then multiply by lever arm L/2.',
    tags: ['CE', 'structures', 'mechanics']
  }
];

export function getQuestionsForContext(params: {
  branch: string;
  activeTechnology?: string;
  skill?: string;
  topic?: string;
  difficulty?: string;
  mode?: string;
  weakSkills?: string[];
  limit?: number;
}): PracticeQuestion[] {
  const { branch, activeTechnology, skill, topic, difficulty, mode, weakSkills, limit = 10 } = params;

  let filtered = SEEDED_QUESTIONS.filter(q => {
    // Match branch or universal engineering questions
    const branchMatch = Array.isArray(q.branch) 
      ? q.branch.includes(branch) || q.branch.includes('Computer Science')
      : q.branch === branch || q.branch === 'Computer Science';
    
    if (!branchMatch) return false;

    // Filter by active tech if available
    if (activeTechnology) {
      const techMatch = q.skills.some(s => s.toLowerCase().includes(activeTechnology.toLowerCase())) ||
        q.tags.some(t => t.toLowerCase().includes(activeTechnology.toLowerCase()));
      if (techMatch) return true;
    }

    return true;
  });

  if (skill) {
    const skillFiltered = filtered.filter(q => q.skills.some(s => s.toLowerCase() === skill.toLowerCase()));
    if (skillFiltered.length > 0) filtered = skillFiltered;
  }

  if (topic) {
    const topicFiltered = filtered.filter(q => q.topic.toLowerCase().includes(topic.toLowerCase()));
    if (topicFiltered.length > 0) filtered = topicFiltered;
  }

  if (mode === 'WEAK_AREA' && weakSkills && weakSkills.length > 0) {
    const weakFiltered = filtered.filter(q => q.skills.some(s => weakSkills.includes(s)));
    if (weakFiltered.length > 0) filtered = weakFiltered;
  }

  if (difficulty) {
    const diffFiltered = filtered.filter(q => q.difficulty === difficulty);
    if (diffFiltered.length > 0) filtered = diffFiltered;
  }

  // Shuffle slightly for session freshness
  return filtered.slice(0, limit);
}
