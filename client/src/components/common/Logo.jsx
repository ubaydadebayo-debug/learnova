import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { BRAND } from '../../constants';
import { cn } from '../../utils/cn';

export default function Logo({ className = '' }) {
  return (
    <Link to="/" className={cn('group inline-flex items-center gap-2', className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
        <GraduationCap className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="font-heading text-xl font-extrabold tracking-tight text-navy">
        {BRAND.name}
      </span>
    </Link>
  );
}