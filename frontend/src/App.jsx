import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/auth/LoginPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentManagement from './pages/admin/StudentManagement';
import TeacherManagement from './pages/admin/TeacherManagement';
import ClassManagement from './pages/admin/ClassManagement';
import AnnouncementsPage from './pages/admin/AnnouncementsPage';
import FeeManagement from './pages/admin/FeeManagement';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import AttendanceMarker from './pages/teacher/AttendanceMarker';
import GradeEntry from './pages/teacher/GradeEntry';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentReportCard from './pages/student/StudentReportCard';

// Parent Pages
import ParentDashboard from './pages/parent/ParentDashboard';

function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'teacher') return <Navigate to="/teacher" replace />;
  if (user.role === 'student') return <Navigate to="/student" replace />;
  if (user.role === 'parent') return <Navigate to="/parent" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<AppLayout />}>
        <Route path="/" element={<HomeRedirect />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<StudentManagement />} />
        <Route path="/admin/teachers" element={<TeacherManagement />} />
        <Route path="/admin/classes" element={<ClassManagement />} />
        <Route path="/admin/attendance" element={<AttendanceMarker />} />
        <Route path="/admin/grades" element={<GradeEntry />} />
        <Route path="/admin/announcements" element={<AnnouncementsPage />} />
        <Route path="/admin/fees" element={<FeeManagement />} />

        {/* Teacher Routes */}
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/attendance" element={<AttendanceMarker />} />
        <Route path="/teacher/grades" element={<GradeEntry />} />
        <Route path="/teacher/classes" element={<ClassManagement />} />
        <Route path="/teacher/announcements" element={<AnnouncementsPage />} />

        {/* Student Routes */}
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/attendance" element={<StudentAttendance />} />
        <Route path="/student/grades" element={<StudentReportCard />} />
        <Route path="/student/fees" element={<FeeManagement />} />
        <Route path="/student/announcements" element={<AnnouncementsPage />} />

        {/* Parent Routes */}
        <Route path="/parent" element={<ParentDashboard />} />
        <Route path="/parent/attendance" element={<StudentAttendance />} />
        <Route path="/parent/grades" element={<StudentReportCard />} />
        <Route path="/parent/fees" element={<FeeManagement />} />
        <Route path="/parent/announcements" element={<AnnouncementsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
