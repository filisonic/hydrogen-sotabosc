export default function CustomImage({
  src,
  alt,
  className = '',
  aspectRatio = '16/9',
  placeholder = true,
}) {
  if (placeholder || !src) {
    return (
      <div 
        className={`bg-gradient-to-br from-black/5 via-black/10 to-black/5 rounded-xl flex items-center justify-center ${className}`}
        style={{ aspectRatio }}
      >
        <div className="text-black/30 text-sm font-medium">
          {alt || 'Image'}
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover rounded-xl ${className}`}
      style={{ aspectRatio }}
    />
  );
}
