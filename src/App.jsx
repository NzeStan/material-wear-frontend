import { Routes, Route } from 'react-router-dom'
import RootLayout from '@layouts/RootLayout'
import HomePage from '@pages/HomePage'
import NotFoundPage from '@pages/NotFoundPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<HomePage />} />
        {/* Add more routes here */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
