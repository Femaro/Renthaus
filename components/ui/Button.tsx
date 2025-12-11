import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-2xl font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none'
    
    const variants = {
      primary: 'bg-primary text-white hover:bg-primary-dark shadow-lg hover:shadow-xl',
      secondary: 'bg-secondary text-white hover:bg-secondary-light shadow-lg hover:shadow-xl',
      outline: 'glass border-2 border-primary text-primary hover:bg-primary/10',
      ghost: 'hover:bg-black/10 text-secondary dark:text-white',
    }
    
    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    }
    
    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export default Button

