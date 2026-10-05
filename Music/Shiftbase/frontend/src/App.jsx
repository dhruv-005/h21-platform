import React from 'react'
import { Routes, Route } from 'react-router-dom'

import AppShell from './components/layout/AppShell'
import HomePage from './pages/HomePage'
import SetupPage from './pages/SetupPage'
import PlanReviewPage from './pages/PlanReviewPage'
import ExecutionPage from './pages/ExecutionPage'
import AuditPage from './pages/AuditPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

export default function App() {
  return (
    <Routes>
      {/* Auth pages (no sidebar/shell) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* App pages (with sidebar/shell) */}
      <Route path="/*" element={
        <AppShell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/setup" element={<SetupPage />} />
            <Route path="/plan/:planId" element={<PlanReviewPage />} />
            <Route path="/execution/:planId" element={<ExecutionPage />} />
            <Route path="/audit" element={<AuditPage />} />
            <Route path="/audit/:planId" element={<AuditPage />} />
          </Routes>
        </AppShell>
      } />
    </Routes>
  )
}