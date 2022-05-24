const uuidPattern =
  '[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}';

type Paths<T> = T extends `/${string}`
  ? T extends `/${string}/`
    ? never
    : T
  : T extends { [K: string]: unknown }
  ? { [K in keyof T]: Paths<T[K]> }
  : never;

// Make sure that each specified path segment
// - starts with a '/'
// - does not have a trailing '/' after the last path component
// And provides a literal type for the segments.
const checkPaths = <T>(x: Paths<T>) => x;

export const paths = checkPaths({
  home: '/',
  userInfo: '/user',
  loginPage: '/login',
  logoutPage: '/logout',
  registerPage: '/register',
  getStarted: '/getstarted',
  overview: '/overview',
  joinRoadmap: `/join/:invitationLink(${uuidPattern})`,
  emailVerification: '/emailVerification',
  verifyEmail: `/verifyEmail/:verificationId(${uuidPattern})`,
  roadmapHome: '/roadmap',
  notFound: '/404',
  forgotPassword: '/forgotpassword',
  resetPassword: `/resetPassword/:token(${uuidPattern})`,
  roadmapRouter: '/roadmap/:roadmapId([0-9]+)',
  roadmapRelative: {
    dashboard: '/dashboard',
    clients: '/clients',
    clientOverview: '/clients/:clientId([0-9]+)',
    team: '/team',
    tasks: '/tasks',
    planner: '/planner',
    settings: '/settings',
  },
  plannerRelative: {
    graph: '/graph',
    editor: '/editor',
    timeEstimation: '/timeestimation',
    weights: '/weights',
  },
  tasksRelative: {
    tasklist: '/tasklist',
    taskmap: '/taskmap',
    taskOverview: '/:taskId([0-9]+)',
  },
});
