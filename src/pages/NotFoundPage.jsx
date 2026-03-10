import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-7xl font-bold text-gray-200 mb-4">404</h1>
      <p className="text-xl font-semibold text-gray-700 mb-2">Page not found</p>
      <p className="text-gray-400 mb-6">The page you are looking for does not exist.</p>
      <Link to="/" className="btn-primary">Back to Home</Link>
    </div>
  )
}
