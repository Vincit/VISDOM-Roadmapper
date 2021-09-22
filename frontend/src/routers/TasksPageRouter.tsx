import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageNavBar } from '../components/PageNavBar';
import { TaskListPage } from '../pages/TaskListPage';
import { TaskMapPage } from '../pages/TaskMapPage';
import { paths } from './paths';
import '../shared.scss';

const routes = [
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
      <PageNavBar headers={headers} />
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
