import { Trans } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import classNames from 'classnames';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals/index';
import { ModalTypes } from '../components/modals/types';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { UserInfo } from '../redux/user/types';
import { RoleType } from '../../../shared/types/customTypes';
import { requireVerifiedEmail } from '../utils/requirelogin';
import { getType } from '../utils/UserUtils';
import { apiV2 } from '../api/api';
import { IntegrationConfig } from '../components/IntegrationConfiguration';

import css from './ConfigurationPage.module.scss';

const classes = classNames.bind(css);

const RoadmapConfigurationPageComponent = ({
  userInfo,
}: {
  userInfo: UserInfo;
}) => {
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const dispatch = useDispatch<StoreDispatchType>();
  const userType = getType(userInfo, roadmapId);

  const { data: integrations } = apiV2.useGetIntegrationsQuery(
    roadmapId ?? skipToken,
  );

  const openDeleteRoadmapModal = (e: any) => {
    e.preventDefault();
    if (!roadmapId) return;
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.DELETE_ROADMAP_MODAL,
        modalProps: { id: roadmapId },
      }),
    );
  };

  if (userType !== RoleType.Admin) return null;

  return (
    <div className={classes(css.configurationPage)}>
      {roadmapId &&
        integrations &&
        Object.keys(integrations).map((name) => (
          <div key={name}>
            <IntegrationConfig roadmapId={roadmapId} name={name} />
          </div>
        ))}
      <div className={classes(css.layoutRow)}>
        <span className={classes(css.columnHeader)}>
          <Trans i18nKey="Delete roadmap" />
          <br />
          <button
            className={classes(css['button-small-filled'], css.deleteButton)}
            type="submit"
            onClick={openDeleteRoadmapModal}
          >
            <Trans i18nKey="Delete roadmap" />
          </button>
        </span>
      </div>
    </div>
  );
};

export const ConfigurationPage = requireVerifiedEmail(
  RoadmapConfigurationPageComponent,
);
