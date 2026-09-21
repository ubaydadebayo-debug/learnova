export const ROLE_HOME = {
  STUDENT: '/student/dashboard',
  INSTRUCTOR: '/instructor/dashboard',
  ADMIN: '/admin/dashboard',
};

export function roleHome(role) {
  return ROLE_HOME[role] || '/';
}

export function dashboardPathFor(role) {
  return ROLE_HOME[role] || '/';
}