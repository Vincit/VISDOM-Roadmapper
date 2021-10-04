import {
  Redirect,
  Route,
  Switch,
  useRouteMatch,
  useLocation,
} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageNavBar } from '../components/PageNavBar';
import { TaskListPage } from '../pages/TaskListPage';
import { TaskMapPage } from '../pages/TaskMapPage';
import { TaskOverviewPage } from '../pages/TaskOverviewPage';
import { paths } from './paths';
import '../shared.scss';

const routes = [
  {
    path: paths.tasksRelative.taskOverview,
    component: TaskOverviewPage,
  },
  {
    path: paths.tasksRelative.tasklist,
    component: TaskListPage,
    exact: false,
  },
  {
    path: paths.tasksRelative.taskmap,
    component: TaskMapPage,
    exact: false,
  },
  {
    path: '',
    component: () => <Redirect to={paths.notFound} />,
    exact: false,
  },
];

export const TasksPageRouter = () => {
  const { path } = useRouteMatch();
  const location = useLocation();
  const { t } = useTranslation();

  const headers = [
    {
      url: '/tasklist',
      text: t('Task list'),
    },
    {
      url: '/taskmap',
      text: t('Task map'),
    },
  ];

  return (
    <>
      {(location.pathname.includes(headers[0].url) ||
        location.pathname.includes(headers[1].url)) && (
        <PageNavBar headers={headers} />
      )}
      <div className="layoutCol">
        <Switch>
          {routes.map((route) => (
            <Route
              key={path + route.path}
              path={path + route.path}
              component={route.component}
              exact={route.exact}
            />
          ))}
        </Switch>
      </div>
    </>
  );
};
