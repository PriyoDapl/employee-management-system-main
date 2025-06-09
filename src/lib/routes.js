/**
 * Route configuration and navigation utilities
 */

// Route configurations
export const routes = {
  employee: '/employee',
  management: '/management',
  admin: '/admin',
  home: '/'
};

// API endpoints
export const apiRoutes = {
  auth: {
    login: '/api/auth/login',
    signup: '/api/auth/signup'
  },
  employee: {
    profile: '/api/employee/profile'
  },
  management: {
    users: '/api/management/users'
  }
};

// Get route based on user role
export function getRouteForRole(role) {
  switch (role) {
    case 'employee':
      return routes.employee;
    case 'management':
      return routes.management;
    case 'admin':
      return routes.admin;
    default:
      return routes.home;
  }
}

// Navigate to appropriate route based on role
export function navigateToRole(role, router) {
  const route = getRouteForRole(role);
  router.push(route);
}
