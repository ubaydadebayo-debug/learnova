import { Link } from 'react-router-dom';
import BrandMark from './BrandMark';
import { BRAND } from '../../constants';
import { cn } from '../../utils/cn';

export default function Logo({ to = '/', className = '', markClassName = 'h-8 w-8 text-primary' }) {
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        className
      )}
    >
      <BrandMark className={markClassName} />
      <span className="font-heading text-xl font-extrabold tracking-tight text-navy">
        {BRAND.name}
      </span>
    </Link>
  );
}