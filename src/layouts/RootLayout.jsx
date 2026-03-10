import { Outlet } from 'react-router-dom'

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container-page h-16 flex items-center justify-between">
          <span className="font-semibold text-lg text-primary-600">MyApp</span>
          <nav className="flex gap-4 text-sm text-gray-600">
            <a href="/">Home</a>
          </nav>
        </div>
      </header>
      <main className="flex-1 container-page py-8">
        <Outlet />
      </main>
      <footer className="border-t border-gray-100 py-6 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} MyApp
      </footer>
    </div>
  )
}
