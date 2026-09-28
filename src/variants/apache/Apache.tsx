import { lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

const Htaccess = lazy(() => import('@/routes/htaccess'))
const SSL = lazy(() => import('@/routes/ssl'))

export default function Apache() {
  return (
    <Routes>
      <Route index element={<Navigate to="/apache/htaccess" replace />} />
      <Route path="htaccess" element={<Htaccess />} />
      <Route path="ssl" element={<SSL />} />
    </Routes>
  )
}
