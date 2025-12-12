interface LoadingProps {
  text?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function Loading({ text = 'Loading...', size = 'md' }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className={`inline-block animate-spin rounded-full border-b-2 border-primary ${sizeClasses[size]} mb-4`}></div>
      <p className="text-gray-600">{text}</p>
    </div>
  )
}

