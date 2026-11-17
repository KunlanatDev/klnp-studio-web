export const routes = {
  home: '/',
  login: '/login',
  register: '/register',

  dashboard: '/dashboard',
  workspaces: '/workspaces',
  projects: '/projects',
  projectDetail: '/projects/:projectId',

  canvas: '/projects/:projectId/pages/:pageId',
} as const;
