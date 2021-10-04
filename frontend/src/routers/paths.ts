const uuidPattern =
  '[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}';

export const paths = {
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
  roadmapRouter: '/roadmap/:roadmapId([0-9]+)',
  roadmapRelative: {
    dashboard: '/dashboard',
    clients: '/clients',
    clientOverview: '/clients/:clientId([0-9]+)',
    team: '/team',
    taskList: '/tasks',
    tasks: '/tasks',
    planner: '/planner',
    configure: '/configure',
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
    taskOverview: '/task/:taskId([0-9]+)',
  },
};
