import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import { useParams, useHistory, Redirect } from 'react-router-dom';
import { paths } from '../routers/paths';
import {
  allCustomersSelector,
  chosenRoadmapSelector,
} from '../redux/roadmaps/selectors';
import { Customer, Roadmap } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { getType } from '../utils/UserUtils';
import { RoleType } from '../../../shared/types/customTypes';
import { Overview, ArrowType } from '../components/Overview';
import { BusinessIcon } from '../components/RoleIcons';
import { Dot } from '../components/Dot';
import { unratedTasksAmount, totalCustomerStakes } from '../utils/TaskUtils';
import colors from '../colors.module.scss';

const ClientOverview: FC<{
  clients: Customer[];
  client: Customer;
  clientIdx: number;
}> = ({ clients, client, clientIdx }) => {
  const history = useHistory();
  const { t } = useTranslation();
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  )!;
  const unratedTasks = unratedTasksAmount(client, currentRoadmap);
  const allCustomerStakes = totalCustomerStakes(
    currentRoadmap.tasks,
    currentRoadmap,
  );
  const clientsListPage = `${paths.roadmapHome}/${currentRoadmap.id}${paths.roadmapRelative.clients}`;

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
      value: allCustomerStakes.get(client) || 0,
      children: <BusinessIcon color={colors.black100} />,
    },
    {
      label: t('Tasks rated'),
      value: currentRoadmap.tasks.length - unratedTasks,
    },
    {
      label: t('Unrated tasks'),
      value: unratedTasks,
    },
  ];

  const clientDotName = (
    <>
      <Dot fill={client.color} />
      {client.name}
    </>
  );

  const clientData = [
    [
      {
        label: t('Client'),
        keyName: 'clientDotName',
        value: client.name,
        format: 'clientGap',
        editable: false,
      },
      {
        label: t('Contact'),
        keyName: 'email',
        value: (
          <a className="green" href={`mailto:${client.email}`}>
            {client.email}
          </a>
        ),
        editable: false,
      },
    ],
    [
      {
        label: t('Client value'),
        keyName: 'weight',
        value: client.weight,
        format: 'bold',
        editable: false,
      },
    ],
  ];

  return (
    <div className="overviewContainer">
      <Overview
        backHref={clientsListPage}
        overviewType={t('Client')}
        name={clientDotName}
        previousAndNext={siblingClients}
        onOverviewChange={(id) => history.push(`${clientsListPage}/${id}`)}
        metrics={metrics}
        data={clientData}
      />
    </div>
  );
};

export const ClientOverviewPage = () => {
  const { clientId, roadmapId } = useParams<{
    clientId: string | undefined;
    roadmapId: string | undefined;
  }>();

  const customers = useSelector<RootState, Customer[] | undefined>(
    allCustomersSelector(),
    shallowEqual,
  )!;
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  )!;

  const clients =
    getType(userInfo.roles, Number(roadmapId)) === RoleType.Admin
      ? customers
      : userInfo.representativeFor!;
  const clientIdx = clients.findIndex(({ id }) => Number(clientId) === id);
  const client =
    clientIdx !== undefined && clientIdx >= 0 ? clients[clientIdx] : undefined;

  if (!client) return <Redirect to={paths.notFound} />;
  return (
    <ClientOverview clients={clients} client={client} clientIdx={clientIdx} />
  );
};
