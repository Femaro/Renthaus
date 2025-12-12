import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'glass-dark' | 'glass-red'
  hover?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, ...props }, ref) => {
    const variants = {
      default: 'bg-white shadow-modern',
      glass: 'bg-white/80 backdrop-blur-xl shadow-modern border border-gray-100',
      'glass-dark': 'bg-gray-50 shadow-modern border border-gray-200',
      'glass-red': 'bg-red-50/50 border border-red-100 shadow-modern',
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl p-6 transition-all duration-300',
          variants[variant],
          hover && 'hover:scale-[1.01] hover:shadow-modern-lg cursor-pointer',
          className
        )}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'

export default Card

