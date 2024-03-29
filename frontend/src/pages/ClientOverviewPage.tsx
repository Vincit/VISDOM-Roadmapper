import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { useParams, useHistory, Redirect } from 'react-router-dom';
import classNames from 'classnames';
import { paths } from '../routers/paths';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { Customer } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import {
  userInfoCustomersSelector,
  userRoleSelector,
} from '../redux/user/selectors';
import { RoleType } from '../../../shared/types/customTypes';
import { Overview, ArrowType } from '../components/Overview';
import { BusinessIcon } from '../components/RoleIcons';
import { Dot } from '../components/Dot';
import { unratedTasksAmount, milestoneRatingSummary } from '../utils/TaskUtils';
import { RepresentativeTable } from '../components/RepresentativeTable';
import { LoadingSpinner } from '../components/LoadingSpinner';
import colors from '../colors.module.scss';
import css from './ClientOverviewPage.module.scss';
import { apiV2 } from '../api/api';

const classes = classNames.bind(css);

const ClientOverview: FC<{
  clients: Customer[];
  client: Customer;
  clientIdx: number;
}> = ({ clients, client, clientIdx }) => {
  const history = useHistory();
  const { t } = useTranslation();
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  // select users as client's representatives does not include type
  const representativeIds = client.representatives?.map(({ id }) => id);
  const { data: users } = apiV2.useGetRoadmapUsersQuery(roadmapId ?? skipToken);
  const representatives =
    users?.filter(({ id }) => representativeIds?.includes(id)) ?? [];
  const { tasks } = apiV2.useGetTasksQuery(roadmapId ?? skipToken, {
    selectFromResult: ({ data }) => ({ tasks: data ?? [] }),
  });

  if (!roadmapId) return null;
  const unratedTasks = unratedTasksAmount(
    client,
    roadmapId,
    tasks,
    users,
    clients,
  );
  const customerStakes = milestoneRatingSummary(tasks).valueForCustomer(
    client.id,
  );
  const clientsListPage = `${paths.roadmapHome}/${roadmapId}${paths.roadmapRelative.clients}`;

  const siblingClients = [
    {
      id: clientIdx > 0 ? clients[clientIdx - 1].id : undefined,
      type: ArrowType.Previous,
    },
    {
      id:
        clientIdx + 1 < clients.length ? clients[clientIdx + 1].id : undefined,
      type: ArrowType.Next,
    },
  ];

  const metrics = [
    {
      label: t('Total Value'),
      value: customerStakes?.total || 0,
      children: <BusinessIcon color={colors.black100} />,
    },
    {
      label: t('Tasks rated'),
      value: tasks.length - unratedTasks,
    },
    {
      label: t('Unrated tasks'),
      value: unratedTasks,
    },
  ];

  const clientDotName = (
    <div className={classes(css.clientName)}>
      <Dot fill={client.color} />
      {client.name}
    </div>
  );

  const clientData = [
    [
      {
        label: t('Client'),
        value: client.name,
        format: 'clientGap',
      },
      {
        label: t('Contact'),
        value: (
          <a className={classes(css.green)} href={`mailto:${client.email}`}>
            {client.email}
          </a>
        ),
      },
    ],
    [
      {
        label: t('Client value'),
        value: client.weight,
        format: 'bold',
      },
    ],
  ];

  return (
    <div className={classes(css.overviewContainer)}>
      <Overview
        backHref={clientsListPage}
        overviewType={t('Client')}
        name={clientDotName}
        previousAndNext={siblingClients}
        onOverviewChange={(id) => history.push(`${clientsListPage}/${id}`)}
        metrics={metrics}
        data={clientData}
      />
      {representatives.length > 0 && (
        <div className={classes(css.representatives)}>
          <RepresentativeTable items={representatives} />
        </div>
      )}
    </div>
  );
};

export const ClientOverviewPage = () => {
  const { clientId } = useParams<{ clientId: string | undefined }>();
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const { data: customers, isLoading } = apiV2.useGetCustomersQuery(
    roadmapId ?? skipToken,
  );
  const userInfoCustomers = useSelector<RootState, Customer[]>(
    userInfoCustomersSelector,
    shallowEqual,
  );
  const role = useSelector(userRoleSelector, shallowEqual);

  const clients = role === RoleType.Admin ? customers ?? [] : userInfoCustomers;
  const clientIdx = clients.findIndex(({ id }) => Number(clientId) === id);
  const client =
    clientIdx !== undefined && clientIdx >= 0 ? clients[clientIdx] : undefined;

  if (!roadmapId || isLoading) return <LoadingSpinner />;
  if (!client) return <Redirect to={paths.notFound} />;
  return (
    <ClientOverview clients={clients} client={client} clientIdx={clientIdx} />
  );
};
