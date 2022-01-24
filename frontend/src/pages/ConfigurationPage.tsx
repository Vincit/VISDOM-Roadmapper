import { useState, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals/index';
import { ModalTypes } from '../components/modals/types';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';
import { Roadmap } from '../redux/roadmaps/types';
import { RootState, Integrations } from '../redux/types';
import { UserInfo } from '../redux/user/types';
import { RoleType } from '../../../shared/types/customTypes';
import { requireVerifiedEmail } from '../utils/requirelogin';
import { titleCase } from '../utils/string';
import { getType } from '../utils/UserUtils';
import { api } from '../api/api';
import { InfoTooltip } from '../components/InfoTooltip';

import css from './ConfigurationPage.module.scss';

const classes = classNames.bind(css);

const RoadmapConfigurationPageComponent = ({
  userInfo,
}: {
  userInfo: UserInfo;
}) => {
  const { t } = useTranslation();
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  )!;
  const dispatch = useDispatch<StoreDispatchType>();
  const userType = getType(userInfo, currentRoadmap?.id);

  const onConfigurationClick = (target: string, fields: any[]) => (e: any) => {
    e.preventDefault();

    const configuration = currentRoadmap.integrations.find(
      ({ name }) => name === target,
    );
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.INTEGRATION_CONFIGURATION_MODAL,
        modalProps: {
          name: target,
          roadmapId: currentRoadmap.id,
          roadmapName: currentRoadmap.name,
          configuration,
          fields,
        },
      }),
    );
  };

  const onOAuthClick = (target: string) => (e: any) => {
    e.preventDefault();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.SETUP_OAUTH_MODAL,
        modalProps: { name: target, roadmapId: currentRoadmap.id },
      }),
    );
  };

  const openTokenModal = (e: any) => {
    e.preventDefault();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.USER_AUTH_TOKEN_MODAL,
        modalProps: {},
      }),
    );
  };
  const openDeleteRoadmapModal = (e: any) => {
    e.preventDefault();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.DELETE_ROADMAP_MODAL,
        modalProps: {
          id: currentRoadmap.id,
        },
      }),
    );
  };

  const [integrations, setIntegrations] = useState<Integrations>({});

  useEffect(() => {
    if (currentRoadmap)
      api.getIntegrations(currentRoadmap.id).then(setIntegrations);
  }, [currentRoadmap]);

  return (
    <div className={classes(css.configurationPage)}>
      {userType === RoleType.Admin && (
        <>
          {Object.entries(integrations).flatMap(([name, fields]) => [
            <div key={`config-${name}`} className={classes(css.layoutRow)}>
              <span className={classes(css.columnHeader)}>
                {currentRoadmap.name} {titleCase(name)}{' '}
                <Trans i18nKey="configuration" />
                <InfoTooltip title={t(`config-${name}-tooltip`)}>
                  <InfoIcon
                    className={classes(css.tooltipGray, css.infoIcon)}
                  />
                </InfoTooltip>
                <br />
                <button
                  className={classes(css['button-small-filled'])}
                  type="submit"
                  onClick={onConfigurationClick(name, fields)}
                >
                  + <Trans i18nKey="Configure" /> {titleCase(name)}
                </button>
              </span>
            </div>,
            <div key={`oauth-${name}`} className={classes(css.layoutRow)}>
              <span className={classes(css.columnHeader)}>
                {currentRoadmap.name} {titleCase(name)}{' '}
                <Trans i18nKey="authentication" />
                <InfoTooltip title={t(`oauth-${name}-tooltip`)}>
                  <InfoIcon
                    className={classes(css.tooltipGray, css.infoIcon)}
                  />
                </InfoTooltip>
                <br />
                <button
                  className={classes(css['button-small-filled'])}
                  type="submit"
                  onClick={onOAuthClick(name)}
                >
                  + <Trans i18nKey="OAuth" />
                </button>
              </span>
            </div>,
          ])}
        </>
      )}
      <div className={classes(css.layoutRow)}>
        <span className={classes(css.columnHeader)}>
          <Trans i18nKey="Personal auth token" />
          <InfoTooltip title={t('Personal auth token tooltip')}>
            <InfoIcon className={classes(css.tooltipGray, css.infoIcon)} />
          </InfoTooltip>
          <br />
          <button
            className="button-small-filled"
            type="submit"
            onClick={openTokenModal}
          >
            + <Trans i18nKey="Manage" />
          </button>
        </span>
      </div>
      {userType === RoleType.Admin && (
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
      )}
    </div>
  );
};

export const ConfigurationPage = requireVerifiedEmail(
  RoadmapConfigurationPageComponent,
);
