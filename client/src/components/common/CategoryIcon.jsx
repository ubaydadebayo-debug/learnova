import {
  BookOpen,
  Code,
  Database,
  Palette,
  Briefcase,
  TrendingUp,
  GraduationCap,
  FlaskConical,
  Languages,
  Music,
  Camera,
  HeartPulse,
} from 'lucide-react';

const ICON_MAP = {
  Code,
  Database,
  Palette,
  Briefcase,
  TrendingUp,
  GraduationCap,
  FlaskConical,
  Languages,
  Music,
  Camera,
  HeartPulse,
};

export default function CategoryIcon({ name, className = 'h-5 w-5' }) {
  const Icon = ICON_MAP[name] || BookOpen;
  return <Icon className={className} aria-hidden="true" />;
}