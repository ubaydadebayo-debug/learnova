import {
  GraduationCap,
  BookOpen,
  Bot,
  Compass,
  Sparkles,
  LineChart,
  Award,
  Users,
} from 'lucide-react';

export const BRAND = {
  name: 'Learnova',
  tagline: 'Learn Smarter. Grow Further.',
};

export const COLORS = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  navy: '#0F172A',
  background: '#F8FAFC',
  white: '#FFFFFF',
  secondary: '#3B82F6',
  success: '#16A34A',
  warning: '#F59E0B',
  error: '#DC2626',
  border: '#E2E8F0',
};

export const NAV_LINKS = [
  { label: 'Courses', to: '/courses' },
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'AI Tutor', to: '/ai-tutor' },
  { label: 'About', to: '/about' },
];

export const API_BASE_URL = '/api';

export const FEATURE_HIGHLIGHTS = [
  {
    icon: Compass,
    title: 'Structured Courses',
    description: 'Learn through clear modules and guided lessons designed to build real skills.',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Tutor',
    description: 'Get personalized guidance that adapts to your level whenever you need help.',
  },
  {
    icon: LineChart,
    title: 'Visible Progress',
    description: 'Track your learning journey and see exactly how far you have come.',
  },
  {
    icon: Award,
    title: 'Certificates',
    description: 'Earn shareable certificates when you complete a course.',
  },
  {
    icon: BookOpen,
    title: 'Practice & Quizzes',
    description: 'Reinforce what you learn with quizzes and hands-on assignments.',
  },
  {
    icon: Users,
    title: 'Learn With Community',
    description: 'Join a platform built by educators and trusted by learners.',
  },
];

export { GraduationCap, Bot };