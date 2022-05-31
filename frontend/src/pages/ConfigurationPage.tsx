import { Trans, useTranslation } from 'react-i18next';
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
import { apiV2, selectById } from '../api/api';
import { IntegrationConfig } from '../components/IntegrationConfiguration';
import { OverviewContent } from '../components/Overview';
import { EditableTextWithButtons } from '../components/EditableText';

import css from './ConfigurationPage.module.scss';

const classes = classNames.bind(css);

const RoadmapConfigurationPageComponent = ({
  userInfo,
}: {
  userInfo: UserInfo;
}) => {
  const { t } = useTranslation();
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const dispatch = useDispatch<StoreDispatchType>();
  const userType = getType(userInfo, roadmapId);
  const [patchRoadmap] = apiV2.usePatchRoadmapMutation();
  const { data: integrations } = apiV2.useGetIntegrationsQuery(
    roadmapId ?? skipToken,
  );
  const { data: roadmap } = apiV2.useGetRoadmapsQuery(undefined, {
    skip: !roadmapId,
    ...selectById(roadmapId),
  });

  const handleEditConfirm = async (newValue: string, fieldId: string) => {
    try {
      await patchRoadmap({
        id: roadmapId!,
        [fieldId]: newValue,
      }).unwrap();
    } catch (err: any) {
      return err.data?.message ?? 'something went wrong';
    }
  };

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
  if (!roadmap) return null;

  const overviewData = [
    [
      {
        label: t('Name'),
        value: roadmap.name,
        format: 'bold',
        EditComponent: (
          <EditableTextWithButtons
            onOk={handleEditConfirm}
            value={roadmap.name}
            fieldId="name"
            format="bold"
          />
        ),
      },
    ],
    [
      {
        label: t('Description'),
        value: roadmap.description,
        format: 'multiline',
        EditComponent: (
          <EditableTextWithButtons
            onOk={handleEditConfirm}
            value={roadmap.description}
            fieldId="description"
            format="multiline"
          />
        ),
      },
    ],
  ];

  const settings = [
    {
      title: t('Project'),
      content: (
        <div className={classes(css.projectInfo)}>
          <OverviewContent data={overviewData} vertical />
          <div>
            <h3 className={classes(css.deleteHeader)}>
              <Trans i18nKey="Delete project" />
            </h3>
            <div className={classes(css.deleteContent)}>
              <Trans i18nKey="Delete project note" />
              <button
                className={classes(
                  css['button-small-filled'],
                  css.deleteButton,
                )}
                type="submit"
                onClick={openDeleteRoadmapModal}
              >
                <Trans i18nKey="Delete project" />
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t('Integrations'),
      content: roadmapId && integrations && (
        <div className={classes(css.integrations)}>
          {Object.keys(integrations).map((name) => (
            <IntegrationConfig roadmapId={roadmapId} name={name} key={name} />
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className={classes(css.settingsPage)}>
      {settings.map(({ title, content }) => (
        <div className={classes(css.setting)} key={title}>
          <h2>{title}</h2>
          {content}
        </div>
      ))}
    </div>
  );
};

export const ConfigurationPage = requireVerifiedEmail(
  RoadmapConfigurationPageComponent,
);
