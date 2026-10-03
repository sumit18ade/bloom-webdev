/**
 * Bloom Engineering Branch Taxonomy & Learning Model Definitions
 * 
 * Provides official branch-specific career goals, subjects, technologies,
 * and skill mapping. Strictly aligns with Bloom prompt requirements.
 */

export interface BranchDefinition {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  careerGoals: string[];
  subjects: string[];
  recommendedTechnologies: string[];
  allTechnologies: string[];
}

export const ENGINEERING_BRANCHES: Record<string, BranchDefinition> = {
  'Computer Science': {
    id: 'Computer Science',
    name: 'Computer Science & Engineering',
    shortName: 'CSE',
    description: 'Software architecture, algorithms, database systems, networking, and core computation.',
    icon: 'code',
    careerGoals: [
      'Software Engineer',
      'Frontend Engineer',
      'Backend Engineer',
      'Full Stack Engineer',
      'AI Engineer',
      'Machine Learning Engineer',
      'Data Scientist',
      'Cybersecurity Engineer',
      'Cloud Engineer',
      'DevOps Engineer',
      'Mobile Developer',
      'System Engineer'
    ],
    subjects: [
      'C Programming',
      'C++',
      'Java',
      'Python',
      'JavaScript',
      'Data Structures',
      'Algorithms',
      'DBMS',
      'Computer Networks',
      'Web Development',
      'Software Engineering',
      'Cloud',
      'Cybersecurity',
      'AI / ML'
    ],
    recommendedTechnologies: ['C', 'C++', 'Java', 'Python', 'JavaScript', 'SQL'],
    allTechnologies: [
      'C', 'C++', 'Java', 'Python', 'JavaScript', 'Go', 'Rust',
      'Node.js', 'Java Spring', 'SQL', 'PostgreSQL', 'MongoDB', 'Redis',
      'React', 'Docker', 'Kubernetes'
    ]
  },
  'Information Technology': {
    id: 'Information Technology',
    name: 'Information Technology',
    shortName: 'IT',
    description: 'Enterprise software systems, web engineering, cloud infrastructure, and network admin.',
    icon: 'devices',
    careerGoals: [
      'IT Engineer',
      'Cloud Engineer',
      'Network Engineer',
      'Cybersecurity Engineer',
      'System Administrator',
      'Database Engineer',
      'IT Consultant',
      'Software Engineer',
      'DevOps Engineer'
    ],
    subjects: [
      'Web Development',
      'Database Systems',
      'Cloud Computing',
      'Computer Networks',
      'DevOps',
      'Cybersecurity',
      'Enterprise Software',
      'IT Systems'
    ],
    recommendedTechnologies: ['JavaScript', 'TypeScript', 'Python', 'SQL', 'Docker', 'AWS'],
    allTechnologies: [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'SQL', 'HTML/CSS',
      'Node.js', 'PostgreSQL', 'MongoDB', 'AWS', 'Azure', 'Docker', 'Linux'
    ]
  },
  'AI / Machine Learning': {
    id: 'AI / Machine Learning',
    name: 'AI & Machine Learning',
    shortName: 'AI/ML',
    description: 'Neural networks, computer vision, natural language processing, statistics, and MLOps.',
    icon: 'psychology',
    careerGoals: [
      'AI Engineer',
      'ML Engineer',
      'Deep Learning Engineer',
      'Data Scientist',
      'NLP Engineer',
      'Computer Vision Engineer',
      'Generative AI Engineer',
      'MLOps Engineer',
      'AI Researcher'
    ],
    subjects: [
      'Python',
      'Mathematics',
      'Statistics',
      'Machine Learning',
      'Deep Learning',
      'NLP',
      'Computer Vision',
      'Generative AI',
      'MLOps'
    ],
    recommendedTechnologies: ['Python', 'PyTorch', 'Scikit-learn', 'NumPy', 'Pandas', 'SQL'],
    allTechnologies: [
      'Python', 'PyTorch', 'TensorFlow', 'Scikit-learn', 'NumPy', 'Pandas',
      'SQL', 'HuggingFace', 'FastAPI', 'Vector DB', 'MLflow'
    ]
  },
  'Electronics / ECE': {
    id: 'Electronics / ECE',
    name: 'Electronics & Communication',
    shortName: 'ECE',
    description: 'Embedded systems, microcontrollers, VLSI circuits, FPGA, digital logic, and IoT.',
    icon: 'memory',
    careerGoals: [
      'Embedded Engineer',
      'VLSI Engineer',
      'FPGA Engineer',
      'IoT Engineer',
      'Robotics Engineer',
      'Electronics Design Engineer',
      'Communication Engineer',
      'Control Systems Engineer'
    ],
    subjects: [
      'Digital Electronics',
      'Analog Electronics',
      'Microcontrollers',
      'Embedded Systems',
      'VLSI',
      'FPGA',
      'Signals & Systems',
      'IoT',
      'Communication Systems',
      'Control Systems'
    ],
    recommendedTechnologies: ['C', 'Embedded C', 'C++', 'Verilog', 'Python'],
    allTechnologies: [
      'C', 'Embedded C', 'C++', 'Verilog', 'VHDL', 'SystemVerilog',
      'Assembly', 'Python', 'MATLAB', 'ARM Architecture'
    ]
  },
  'Electrical': {
    id: 'Electrical',
    name: 'Electrical Engineering',
    shortName: 'EE',
    description: 'Power systems, electrical machines, power electronics, EV powertrains, and control automation.',
    icon: 'bolt',
    careerGoals: [
      'Power Engineer',
      'Control Engineer',
      'Power Electronics Engineer',
      'Electrical Design Engineer',
      'Automation Engineer',
      'EV Engineer',
      'Renewable Energy Engineer',
      'Instrumentation Engineer'
    ],
    subjects: [
      'Circuit Theory',
      'Electrical Machines',
      'Power Systems',
      'Control Systems',
      'Power Electronics',
      'Renewable Energy',
      'EV Systems',
      'Instrumentation',
      'Industrial Automation'
    ],
    recommendedTechnologies: ['MATLAB', 'Simulink', 'C', 'Python', 'PLC Programming'],
    allTechnologies: [
      'MATLAB', 'Simulink', 'C', 'Python', 'PLC Programming',
      'LabVIEW', 'PSCAD', 'ETABS Power'
    ]
  },
  'Mechanical': {
    id: 'Mechanical',
    name: 'Mechanical Engineering',
    shortName: 'ME',
    description: 'CAD/CAM modeling, thermodynamics, mechatronics, fluid mechanics, and robotics.',
    icon: 'settings',
    careerGoals: [
      'Mechanical Design Engineer',
      'CAD Engineer',
      'Automotive Engineer',
      'Robotics Engineer',
      'Mechatronics Engineer',
      'Manufacturing Engineer',
      'Thermal Engineer',
      'Aerospace Engineer',
      'Industrial Engineer'
    ],
    subjects: [
      'Engineering Mechanics',
      'Thermodynamics',
      'CAD',
      'Manufacturing',
      'Materials',
      'Automotive',
      'Robotics',
      'Mechatronics',
      'Fluid Mechanics',
      'Heat Transfer'
    ],
    recommendedTechnologies: ['SolidWorks', 'AutoCAD', 'ANSYS', 'Python', 'MATLAB'],
    allTechnologies: [
      'SolidWorks', 'AutoCAD', 'ANSYS', 'Python', 'MATLAB', 'C++', 'ROS (Robot OS)', 'GD&T'
    ]
  },
  'Civil': {
    id: 'Civil',
    name: 'Civil Engineering',
    shortName: 'CE',
    description: 'Structural analysis, RCC design, BIM modeling, geotechnics, and infrastructure planning.',
    icon: 'engineering',
    careerGoals: [
      'Structural Engineer',
      'Construction Engineer',
      'Site Engineer',
      'Geotechnical Engineer',
      'Transportation Engineer',
      'Environmental Engineer',
      'BIM Engineer',
      'Infrastructure Engineer',
      'Water Resources Engineer'
    ],
    subjects: [
      'Structural Analysis',
      'RCC',
      'Steel Structures',
      'Surveying',
      'Geotechnical Engineering',
      'Transportation',
      'Environmental Engineering',
      'Construction Management',
      'BIM'
    ],
    recommendedTechnologies: ['AutoCAD', 'Revit', 'STAAD Pro', 'ETABS', 'Python'],
    allTechnologies: [
      'AutoCAD', 'Revit', 'STAAD Pro', 'ETABS', 'Python', 'Excel/VBA', 'ArcGIS'
    ]
  }
};
