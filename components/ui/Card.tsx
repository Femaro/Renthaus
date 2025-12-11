import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'glass-dark' | 'glass-red'
  hover?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, ...props }, ref) => {
    const variants = {
      default: 'bg-white dark:bg-black',
      glass: 'glass shadow-glass',
      'glass-dark': 'glass-dark shadow-glass',
      'glass-red': 'glass-red shadow-glass',
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-3xl p-6 transition-all duration-300',
          variants[variant],
          hover && 'hover:scale-[1.02] hover:shadow-2xl cursor-pointer',
          className
        )}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'

export default Card

