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

export function profilePathFor(role) {
  const home = ROLE_HOME[role];
  return home ? `${home.split('/').slice(0, -1).join('/')}/profile` : '/';
}

export function roleLabel(role) {
  return role ? `${role.charAt(0).toUpperCase()}${role.slice(1).toLowerCase()}` : '';
}