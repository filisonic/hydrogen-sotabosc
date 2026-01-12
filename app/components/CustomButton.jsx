import {Link} from '@remix-run/react';
import {motion} from 'framer-motion';

export default function CustomButton({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  disabled = false,
}) {
  const baseClasses = 'relative overflow-hidden font-medium transition-all duration-300 rounded-lg inline-flex items-center justify-center';
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  const variantClasses = {
    primary: 'bg-black text-white hover:bg-black/90 font-semibold shadow-lg hover:shadow-xl active:shadow-md',
    secondary: 'bg-transparent text-black border-2 border-black/30 hover:border-black hover:bg-black/5 font-medium active:bg-black/10',
    outline: 'bg-transparent text-black border border-black/30 hover:border-black hover:bg-black/5 active:bg-black/10',
    ghost: 'bg-transparent text-black hover:bg-black/5 active:bg-black/10',
    link: 'bg-transparent text-black hover:text-black/70 underline-offset-4 hover:underline p-0',
  };

  const buttonClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`;

  const motionProps = {
    whileHover: disabled ? {} : { scale: 1.02, y: -1 },
    whileTap: disabled ? {} : { scale: 0.98, y: 0 },
    transition: { duration: 0.2, ease: 'easeOut' },
  };

  if (href) {
    return (
      <Link to={href} className={disabled ? 'pointer-events-none' : ''}>
        <motion.div className={buttonClasses} {...motionProps}>
          {variant === 'primary' && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{children}</span>
        </motion.div>
      </Link>
    );
  }

  return (
    <motion.button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...motionProps}
    >
      {variant === 'primary' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
