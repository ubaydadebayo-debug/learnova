export default function BrandMark({ className = 'h-8 w-8', alt = 'Learnova logo' }) {
  return (
    <img
      src="/images/logos.png"
      alt={alt}
      className={className}
      aria-hidden="true"
      focusable="false"
    />
  );
}