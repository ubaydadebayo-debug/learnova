import { createBrowserRouter, Navigate } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import ProtectedLayout from '../layouts/ProtectedLayout';
import RequireAuth from '../components/common/RequireAuth';
import RequireRole from '../components/common/RequireRole';
import HomePage from '../pages/public/HomePage';
import CoursesPage from '../pages/public/CoursesPage';
import CourseDetailPage from '../pages/public/CourseDetailPage';
import HowItWorksPage from '../pages/public/HowItWorksPage';
import AITutorPage from '../pages/public/AITutorPage';
import AboutPage from '../pages/public/AboutPage';
import ContactPage from '../pages/public/ContactPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import NotFoundPage from '../pages/public/NotFoundPage';
import StudentDashboardPage from '../pages/student/DashboardPage';
import InstructorDashboardPage from '../pages/instructor/DashboardPage';
import AdminDashboardPage from '../pages/admin/DashboardPage';
import InstructorCoursesPage from '../pages/instructor/CoursesPage';
import CourseFormPage from '../pages/instructor/CourseFormPage';
import CourseBuilderPage from '../pages/instructor/CourseBuilderPage';
import AdminCoursesPage from '../pages/admin/CoursesPage';
import AdminCategoriesPage from '../pages/admin/CategoriesPage';
import AdminReportsPage from '../pages/admin/ReportsPage';
import StudentCoursesPage from '../pages/student/CoursesPage';
import StudentLearningPage from '../pages/student/LearningPage';
import StudentQuizPage from '../pages/student/QuizPage';
import StudentAssignmentsPage from '../pages/student/AssignmentsPage';
import StudentAssignmentDetailPage from '../pages/student/AssignmentDetailPage';
import StudentAITutorPage from '../pages/student/AITutorPage';
import StudentCertificatesPage from '../pages/student/CertificatesPage';
import StudentCertificateDetailPage from '../pages/student/CertificateDetailPage';
import CertificateVerifyPage from '../pages/public/CertificateVerifyPage';
import NotificationsPage from '../pages/common/NotificationsPage';
import AdminUsersPage from '../pages/admin/UsersPage';
import AdminEnrollmentsPage from '../pages/admin/EnrollmentsPage';
import AdminCertificatesPage from '../pages/admin/CertificatesPage';
import AdminQuizzesPage from '../pages/admin/QuizzesPage';
import AdminAssignmentsPage from '../pages/admin/AssignmentsPage';
import InstructorAssignmentsPage from '../pages/instructor/AssignmentsPage';
import InstructorAssignmentDetailPage from '../pages/instructor/AssignmentDetailPage';
import InstructorAnalyticsPage from '../pages/instructor/AnalyticsPage';
import InstructorStudentsPage from '../pages/instructor/StudentsPage';
import ProfilePage from '../pages/common/ProfilePage';
import SettingsPage from '../pages/common/SettingsPage';

// Public routes, role-protected shells, course management, and the first student learning flow.
export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/courses', element: <CoursesPage /> },
      { path: '/course/:id', element: <CourseDetailPage /> },
      { path: '/how-it-works', element: <HowItWorksPage /> },
      { path: '/ai-tutor', element: <AITutorPage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/contact', element: <ContactPage /> },
      { path: '/certificates/verify/:verificationCode', element: <CertificateVerifyPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/admin/login', element: <Navigate to="/login" replace /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    element: (
      <RequireAuth>
        <ProtectedLayout />
      </RequireAuth>
    ),
    children: [
      {
        path: '/student/dashboard',
        element: (
          <RequireRole role="STUDENT">
            <StudentDashboardPage />
          </RequireRole>
        ),
      },
      {
        path: '/student/courses',
        element: (
          <RequireRole role="STUDENT">
            <StudentCoursesPage />
          </RequireRole>
        ),
      },
      {
        path: '/student/courses/:courseId',
        element: (
          <RequireRole role="STUDENT">
            <StudentLearningPage />
          </RequireRole>
        ),
      },
      {
        path: '/student/learn/:courseId/:lessonId',
        element: (
          <RequireRole role="STUDENT">
            <StudentLearningPage />
          </RequireRole>
        ),
      },
      {
        path: '/student/quizzes/:courseId/:quizId',
        element: (
          <RequireRole role="STUDENT">
            <StudentQuizPage />
          </RequireRole>
        ),
      },
      {
        path: '/student/assignments',
        element: (
          <RequireRole role="STUDENT">
            <StudentAssignmentsPage />
          </RequireRole>
        ),
      },
      {
        path: '/student/assignments/:assignmentId',
        element: (
          <RequireRole role="STUDENT">
            <StudentAssignmentDetailPage />
          </RequireRole>
        ),
      },
      {
        path: '/student/ai-tutor',
        element: (
          <RequireRole role="STUDENT">
            <StudentAITutorPage />
          </RequireRole>
        ),
      },
      {
        path: '/student/ai-tutor/:conversationId',
        element: (
          <RequireRole role="STUDENT">
            <StudentAITutorPage />
          </RequireRole>
        ),
      },
      {        path: '/student/certificates',
        element: (
          <RequireRole role="STUDENT">
            <StudentCertificatesPage />
          </RequireRole>
        ),
      },
      {
        path: '/student/certificates/:certificateId',
        element: (
          <RequireRole role="STUDENT">
            <StudentCertificateDetailPage />
          </RequireRole>
        ),
      },
      {
        path: '/student/notifications',
        element: (
          <RequireRole role="STUDENT">
            <NotificationsPage />
          </RequireRole>
        ),
      },
      {
        path: '/student/profile',
        element: (
          <RequireRole role="STUDENT">
            <ProfilePage />
          </RequireRole>
        ),
      },
      {
        path: '/student/settings',
        element: (
          <RequireRole role="STUDENT">
            <SettingsPage />
          </RequireRole>
        ),
      },
      {
        path: '/instructor/dashboard',
        element: (
          <RequireRole role="INSTRUCTOR">
            <InstructorDashboardPage />
          </RequireRole>
        ),
      },
      {
        path: '/instructor/courses',
        element: (
          <RequireRole role="INSTRUCTOR">
            <InstructorCoursesPage />
          </RequireRole>
        ),
      },
      {
        path: '/instructor/courses/create',
        element: (
          <RequireRole role="INSTRUCTOR">
            <CourseFormPage />
          </RequireRole>
        ),
      },
      {
        path: '/instructor/courses/:id/edit',
        element: (
          <RequireRole role="INSTRUCTOR">
            <CourseFormPage />
          </RequireRole>
        ),
      },
      {
        path: '/instructor/courses/:id/builder',
        element: (
          <RequireRole role="INSTRUCTOR">
            <CourseBuilderPage />
          </RequireRole>
        ),
      },
      {
        path: '/instructor/assignments',
        element: (
          <RequireRole role="INSTRUCTOR">
            <InstructorAssignmentsPage />
          </RequireRole>
        ),
      },
      {
        path: '/instructor/assignments/:assignmentId',
        element: (
          <RequireRole role="INSTRUCTOR">
            <InstructorAssignmentDetailPage />
          </RequireRole>
        ),
      },
      {
        path: '/instructor/analytics',
        element: (
          <RequireRole role="INSTRUCTOR">
            <InstructorAnalyticsPage />
          </RequireRole>
        ),
      },
      {
        path: '/instructor/students',
        element: (
          <RequireRole role="INSTRUCTOR">
            <InstructorStudentsPage />
          </RequireRole>
        ),
      },
      {
        path: '/instructor/notifications',
        element: (
          <RequireRole role="INSTRUCTOR">
            <NotificationsPage />
          </RequireRole>
        ),
      },
      {
        path: '/instructor/profile',
        element: (
          <RequireRole role="INSTRUCTOR">
            <ProfilePage />
          </RequireRole>
        ),
      },
      {
        path: '/instructor/settings',
        element: (
          <RequireRole role="INSTRUCTOR">
            <SettingsPage />
          </RequireRole>
        ),
      },
      {
        path: '/admin/dashboard',
        element: (
          <RequireRole role="ADMIN">
            <AdminDashboardPage />
          </RequireRole>
        ),
      },
      {
        path: '/admin/users',
        element: (
          <RequireRole role="ADMIN">
            <AdminUsersPage />
          </RequireRole>
        ),
      },
      {
        path: '/admin/students',
        element: (
          <RequireRole role="ADMIN">
            <AdminUsersPage lockedRole="STUDENT" />
          </RequireRole>
        ),
      },
      {
        path: '/admin/instructors',
        element: (
          <RequireRole role="ADMIN">
            <AdminUsersPage lockedRole="INSTRUCTOR" />
          </RequireRole>
        ),
      },
      {
        path: '/admin/enrollments',
        element: (
          <RequireRole role="ADMIN">
            <AdminEnrollmentsPage />
          </RequireRole>
        ),
      },
      {
        path: '/admin/certificates',
        element: (
          <RequireRole role="ADMIN">
            <AdminCertificatesPage />
          </RequireRole>
        ),
      },
      {
        path: '/admin/courses',
        element: (
          <RequireRole role="ADMIN">
            <AdminCoursesPage />
          </RequireRole>
        ),
      },
      {
        path: '/admin/categories',
        element: (
          <RequireRole role="ADMIN">
            <AdminCategoriesPage />
          </RequireRole>
        ),
      },
      {
        path: '/admin/quizzes',
        element: (
          <RequireRole role="ADMIN">
            <AdminQuizzesPage />
          </RequireRole>
        ),
      },
      {
        path: '/admin/assignments',
        element: (
          <RequireRole role="ADMIN">
            <AdminAssignmentsPage />
          </RequireRole>
        ),
      },
      {
        path: '/admin/reports',
        element: (
          <RequireRole role="ADMIN">
            <AdminReportsPage />
          </RequireRole>
        ),
      },
      {
        path: '/admin/profile',
        element: (
          <RequireRole role="ADMIN">
            <ProfilePage />
          </RequireRole>
        ),
      },
      {
        path: '/admin/settings',
        element: (
          <RequireRole role="ADMIN">
            <SettingsPage />
          </RequireRole>
        ),
      },
    ],
  },
]);