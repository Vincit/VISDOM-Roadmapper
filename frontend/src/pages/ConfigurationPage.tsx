import { Trans, useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals/index';
import { ModalTypes } from '../components/modals/types';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { UserInfo } from '../redux/user/types';
import { RoleType } from '../../../shared/types/customTypes';
import { requireVerifiedEmail } from '../utils/requirelogin';
import { titleCase } from '../utils/string';
import { getType } from '../utils/UserUtils';
import { apiV2 } from '../api/api';
import { InfoTooltip } from '../components/InfoTooltip';

import css from './ConfigurationPage.module.scss';

const classes = classNames.bind(css);

const RoadmapConfigurationPageComponent = ({
  userInfo,
}: {
  userInfo: UserInfo;
}) => {
  const { t } = useTranslation();
  const roadmapId = useSelector(chosenRoadmapIdSelector)!;
  const dispatch = useDispatch<StoreDispatchType>();
  const userType = getType(userInfo, roadmapId);
  const { data } = apiV2.useGetRoadmapsQuery();
  const roadmap = data?.find(({ id }) => id === roadmapId);

  const { data: integrations } = apiV2.useGetIntegrationsQuery(roadmapId);

  const onConfigurationClick = (target: string, fields: any[]) => (e: any) => {
    e.preventDefault();

    if (!roadmap) return;
    const configuration = roadmap.integrations.find(
      ({ name }) => name === target,
    );
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.INTEGRATION_CONFIGURATION_MODAL,
        modalProps: {
          name: target,
          roadmapId,
          roadmapName: roadmap.name,
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
        modalProps: { name: target, roadmapId },
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
        modalProps: { id: roadmapId },
      }),
    );
  };

  return (
    <div className={classes(css.configurationPage)}>
      {userType === RoleType.Admin && (
        <>
          {Object.entries(integrations ?? {}).flatMap(([name, fields]) => [
            <div key={`config-${name}`} className={classes(css.layoutRow)}>
              <span className={classes(css.columnHeader)}>
                {roadmap!.name} {titleCase(name)}{' '}
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
                {roadmap!.name} {titleCase(name)}{' '}
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
