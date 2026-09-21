// Learnova — development seed
// DEVELOPMENT-ONLY credentials. Never use these accounts in production.
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 12;

const DEV_PASSWORDS = {
  admin: 'Admin@123456',
  instructor: 'Instructor@1234',
  student: 'Student@123456',
};

const CATEGORIES = [
  {
    name: 'Web Development',
    slug: 'web-development',
    description: 'Build modern websites and web applications.',
    icon: 'Code',
  },
  {
    name: 'Data Science',
    slug: 'data-science',
    description: 'Analyze data and build intelligent models.',
    icon: 'Database',
  },
  {
    name: 'Design',
    slug: 'design',
    description: 'Learn UI/UX, visual design and creative tools.',
    icon: 'Palette',
  },
  {
    name: 'Business',
    slug: 'business',
    description: 'Develop business, management and entrepreneurship skills.',
    icon: 'Briefcase',
  },
  {
    name: 'Marketing',
    slug: 'marketing',
    description: 'Grow audiences and run effective campaigns.',
    icon: 'TrendingUp',
  },
];

async function hashPassword(plain) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

async function main() {
  console.log('Cleaning existing development data...');

  // Delete in dependency order (children first).
  await prisma.aIMessage.deleteMany();
  await prisma.aIConversation.deleteMany();
  await prisma.studentAnswer.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.questionOption.deleteMany();
  await prisma.question.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.module.deleteMany();
  await prisma.course.deleteMany();
  await prisma.category.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.userPreference.deleteMany();
  await prisma.user.deleteMany();

  console.log('Creating users...');

  const [adminHash, instructorHash, studentHash] = await Promise.all([
    hashPassword(DEV_PASSWORDS.admin),
    hashPassword(DEV_PASSWORDS.instructor),
    hashPassword(DEV_PASSWORDS.student),
  ]);

  const admin = await prisma.user.create({
    data: {
      firstName: 'Learnova',
      lastName: 'Admin',
      email: 'admin@learnova.local',
      passwordHash: adminHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      title: 'Platform Administrator',
      bio: 'Manages the Learnova platform.',
    },
  });

  const instructor1 = await prisma.user.create({
    data: {
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'instructor@learnova.local',
      passwordHash: instructorHash,
      role: 'INSTRUCTOR',
      status: 'ACTIVE',
      title: 'Senior Web Development Instructor',
      bio: 'Full-stack engineer and passionate teacher.',
    },
  });

  const instructor2 = await prisma.user.create({
    data: {
      firstName: 'Alan',
      lastName: 'Turing',
      email: 'instructor2@learnova.local',
      passwordHash: instructorHash,
      role: 'INSTRUCTOR',
      status: 'ACTIVE',
      title: 'Data Science Instructor',
      bio: 'Data scientist and ML researcher.',
    },
  });

  const student1 = await prisma.user.create({
    data: {
      firstName: 'Grace',
      lastName: 'Hopper',
      email: 'student@learnova.local',
      passwordHash: studentHash,
      role: 'STUDENT',
      status: 'ACTIVE',
      title: 'Student',
      bio: 'Curious learner.',
    },
  });

  const student2 = await prisma.user.create({
    data: {
      firstName: 'Marie',
      lastName: 'Curie',
      email: 'student2@learnova.local',
      passwordHash: studentHash,
      role: 'STUDENT',
      status: 'ACTIVE',
      title: 'Student',
      bio: 'Aspiring data scientist.',
    },
  });

  const student3 = await prisma.user.create({
    data: {
      firstName: 'Katherine',
      lastName: 'Johnson',
      email: 'student3@learnova.local',
      passwordHash: studentHash,
      role: 'STUDENT',
      status: 'ACTIVE',
      title: 'Student',
      bio: 'Beginning web developer.',
    },
  });

  await prisma.userPreference.createMany({
    data: [
      { userId: admin.id },
      { userId: instructor1.id },
      { userId: instructor2.id },
      { userId: student1.id },
      { userId: student2.id },
      { userId: student3.id },
    ],
  });

  console.log('Creating categories...');

  const categoryIds = {};
  for (const cat of CATEGORIES) {
    const created = await prisma.category.create({ data: cat });
    categoryIds[cat.slug] = created.id;
  }

  console.log('Creating courses...');

  // ---- Course 1: Complete Web Development Bootcamp ----
  const course1 = await prisma.course.create({
    data: {
      title: 'Complete Web Development Bootcamp',
      slug: 'complete-web-development-bootcamp',
      shortDescription:
        'From HTML to interactive web apps — a complete beginner-friendly path to modern web development.',
      description:
        'Learn to build beautiful, responsive websites and interactive applications step by step. This course covers HTML, CSS, JavaScript and the tools every web developer needs.',
      outcomes: [
        'Build responsive web pages with HTML and CSS',
        'Write clean, modern JavaScript',
        'Manipulate the DOM to build interactive UIs',
        'Structure projects like a professional developer',
      ],
      level: 'BEGINNER',
      status: 'PUBLISHED',
      durationMinutes: 480,
      instructorId: instructor1.id,
      categoryId: categoryIds['web-development'],
      publishedAt: new Date(),
      modules: {
        create: [
          {
            title: 'HTML & CSS Basics',
            position: 0,
            description: 'The building blocks of every website.',
            lessons: {
              create: [
                {
                  title: 'Getting Started with HTML',
                  content:
                    '# Getting Started with HTML\n\nHTML (HyperText Markup Language) is the skeleton of every webpage. It uses tags like `<h1>`, `<p>` and `<a>` to structure content.\n\n## Your first page\n\n```html\n<!DOCTYPE html>\n<html>\n  <head>\n    <title>My Page</title>\n  </head>\n  <body>\n    <h1>Hello, world!</h1>\n  </body>\n</html>\n```\n\nTags wrap content to describe its meaning. Browsers read these tags and render the page accordingly.',
                  durationMinutes: 25,
                  position: 0,
                },
                {
                  title: 'Styling with CSS',
                  content:
                    '# Styling with CSS\n\nCSS (Cascading Style Sheets) controls how a page looks — colors, fonts, spacing and layout.\n\n```css\nbody {\n  font-family: Inter, sans-serif;\n  color: #0f172a;\n  background: #f8fafc;\n}\n```\n\nSelectors target elements, and declarations style them. Classes and IDs give you precise control.',
                  durationMinutes: 30,
                  position: 1,
                },
              ],
            },
          },
          {
            title: 'JavaScript Fundamentals',
            position: 1,
            description: 'Make your pages interactive.',
            lessons: {
              create: [
                {
                  title: 'JavaScript Basics',
                  content:
                    '# JavaScript Basics\n\nJavaScript brings your page to life. Variables, functions and events are the core ideas.\n\n```js\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("Learnova"));\n```',
                  durationMinutes: 35,
                  position: 0,
                },
                {
                  title: 'DOM Manipulation',
                  content:
                    '# DOM Manipulation\n\nThe Document Object Model (DOM) represents your page as a tree of nodes. JavaScript can read and change it.\n\n```js\ndocument.querySelector("button").addEventListener("click", () => {\n  document.body.style.background = "#2563eb";\n});\n```',
                  durationMinutes: 30,
                  position: 1,
                },
              ],
            },
            quizzes: {
              create: [
                {
                  title: 'JavaScript Fundamentals Quiz',
                  description: 'Check your understanding of JavaScript basics.',
                  passingScore: 70,
                  timeLimitMinutes: 10,
                  position: 2,
                  questions: {
                    create: [
                      {
                        type: 'MULTIPLE_CHOICE',
                        prompt: 'Which keyword declares a block-scoped variable in modern JavaScript?',
                        points: 1,
                        position: 0,
                        explanation: '`let` and `const` are block-scoped; `var` is function-scoped.',
                        options: {
                          create: [
                            { text: 'var', isCorrect: false, position: 0 },
                            { text: 'let', isCorrect: true, position: 1 },
                            { text: 'int', isCorrect: false, position: 2 },
                            { text: 'def', isCorrect: false, position: 3 },
                          ],
                        },
                      },
                      {
                        type: 'TRUE_FALSE',
                        prompt: 'The DOM represents an HTML page as a tree of nodes.',
                        points: 1,
                        position: 1,
                        explanation: 'Yes — elements, attributes and text are all nodes in the DOM tree.',
                        options: {
                          create: [
                            { text: 'True', isCorrect: true, position: 0 },
                            { text: 'False', isCorrect: false, position: 1 },
                          ],
                        },
                      },
                      {
                        type: 'MULTIPLE_CHOICE',
                        prompt: 'Which method selects the first element matching a CSS selector?',
                        points: 1,
                        position: 2,
                        explanation: '`querySelector` returns the first match for a CSS selector.',
                        options: {
                          create: [
                            { text: 'getElementsByTagName', isCorrect: false, position: 0 },
                            { text: 'querySelector', isCorrect: true, position: 1 },
                            { text: 'allElements', isCorrect: false, position: 2 },
                            { text: 'findByCss', isCorrect: false, position: 3 },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
            assignments: {
              create: [
                {
                  title: 'Build a Personal Portfolio Page',
                  instructions:
                    'Create a single-page portfolio using HTML and CSS. Include:\n- A header with your name\n- A section describing your skills\n- A styled contact link\n\nSubmit a ZIP or a text description of your approach.',
                  points: 100,
                  position: 1,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // ---- Course 2: Data Science Essentials ----
  const course2 = await prisma.course.create({
    data: {
      title: 'Data Science Essentials',
      slug: 'data-science-essentials',
      shortDescription:
        'A practical introduction to Python and data analysis for aspiring data scientists.',
      description:
        'Learn Python fundamentals, work with data using Pandas, and create clear visualizations. Every topic is paired with hands-on examples.',
      outcomes: [
        'Write Python programs with confidence',
        'Manipulate tabular data with Pandas',
        'Create informative visualizations',
        'Apply an end-to-end analysis workflow',
      ],
      level: 'BEGINNER',
      status: 'PUBLISHED',
      durationMinutes: 420,
      instructorId: instructor2.id,
      categoryId: categoryIds['data-science'],
      publishedAt: new Date(),
      modules: {
        create: [
          {
            title: 'Python Basics',
            position: 0,
            description: 'The fundamentals of the Python language.',
            lessons: {
              create: [
                {
                  title: 'Introduction to Python',
                  content:
                    '# Introduction to Python\n\nPython is a readable, versatile programming language used across data science, web and automation.\n\n```python\nname = "Learnova"\nprint(f"Welcome, {name}!")  # Welcome, Learnova!\n```',
                  durationMinutes: 30,
                  position: 0,
                },
                {
                  title: 'Data Structures',
                  content:
                    '# Data Structures\n\nPython ships with powerful data structures: lists, tuples, dictionaries and sets.\n\n```python\nscores = {"quiz": 90, "assignment": 85}\nfor key, value in scores.items():\n    print(key, value)\n```',
                  durationMinutes: 35,
                  position: 1,
                },
              ],
            },
            quizzes: {
              create: [
                {
                  title: 'Python Basics Quiz',
                  description: 'Test your Python fundamentals.',
                  passingScore: 70,
                  timeLimitMinutes: 10,
                  position: 2,
                  questions: {
                    create: [
                      {
                        type: 'MULTIPLE_CHOICE',
                        prompt: 'Which of these is a Python data structure for key-value pairs?',
                        points: 1,
                        position: 0,
                        explanation: 'Dictionaries store key-value pairs in Python.',
                        options: {
                          create: [
                            { text: 'List', isCorrect: false, position: 0 },
                            { text: 'Dictionary', isCorrect: true, position: 1 },
                            { text: 'Set', isCorrect: false, position: 2 },
                            { text: 'Tuple', isCorrect: false, position: 3 },
                          ],
                        },
                      },
                      {
                        type: 'TRUE_FALSE',
                        prompt: 'Python is an interpreted language.',
                        points: 1,
                        position: 1,
                        explanation: 'Correct — Python code is executed by an interpreter at runtime.',
                        options: {
                          create: [
                            { text: 'True', isCorrect: true, position: 0 },
                            { text: 'False', isCorrect: false, position: 1 },
                          ],
                        },
                      },
                      {
                        type: 'MULTIPLE_CHOICE',
                        prompt: 'How do you define a function in Python?',
                        points: 1,
                        position: 2,
                        explanation: 'Functions are defined with the `def` keyword.',
                        options: {
                          create: [
                            { text: 'function name()', isCorrect: false, position: 0 },
                            { text: 'def name():', isCorrect: true, position: 1 },
                            { text: 'func name()', isCorrect: false, position: 2 },
                            { text: 'define name()', isCorrect: false, position: 3 },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
            assignments: {
              create: [
                {
                  title: 'Analyze a Sample Dataset',
                  instructions:
                    'Use Python to load a small dataset, calculate basic statistics, and write a short summary of what you find.\n\nInclude your code and findings as a text submission.',
                  points: 100,
                  position: 1,
                },
              ],
            },
          },
          {
            title: 'Data Analysis',
            position: 1,
            description: 'Work with real data using Pandas.',
            lessons: {
              create: [
                {
                  title: 'Pandas Basics',
                  content:
                    '# Pandas Basics\n\nPandas makes tabular data easy to load and explore with the DataFrame.\n\n```python\nimport pandas as pd\n\ndf = pd.read_csv("sales.csv")\nprint(df.head())\nprint(df.describe())\n```',
                  durationMinutes: 40,
                  position: 0,
                },
                {
                  title: 'Data Visualization',
                  content:
                    '# Data Visualization\n\nA good chart makes patterns visible. Libraries like Matplotlib and Seaborn help you plot data.\n\n```python\nimport matplotlib.pyplot as plt\n\nplt.plot([1, 2, 3], [4, 5, 6])\nplt.show()\n```',
                  durationMinutes: 30,
                  position: 1,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // ---- Sample enrollments + progress (development only) ----
  const student1Enrollment = await prisma.enrollment.create({
    data: {
      studentId: student1.id,
      courseId: course1.id,
      status: 'ACTIVE',
    },
  });

  const firstLesson = await prisma.lesson.findFirstOrThrow({
    where: { module: { courseId: course1.id } },
    orderBy: [{ position: 'asc' }],
  });

  await prisma.progress.create({
    data: {
      studentId: student1.id,
      lessonId: firstLesson.id,
      enrollmentId: student1Enrollment.id,
      completed: true,
      completedAt: new Date(),
    },
  });

  console.log('Seeding complete ✅');
  console.log('');
  console.log('Development accounts (DEVELOPMENT-ONLY):');
  console.log('  Admin:       admin@learnova.local / Admin@123456');
  console.log('  Instructor:  instructor@learnova.local / Instructor@1234');
  console.log('  Instructor:  instructor2@learnova.local / Instructor@1234');
  console.log('  Student:     student@learnova.local / Student@123456');
  console.log('  Student:     student2@learnova.local / Student@123456');
  console.log('  Student:     student3@learnova.local / Student@123456');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });