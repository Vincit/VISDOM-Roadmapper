import { Trans, useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { StoreDispatchType } from '../../redux';
import { userActions } from '../../redux/user';
import { RootState } from '../../redux/types';
import { Modal, ModalTypes } from './types';
import { StepForm } from '../forms/StepForm';
import { userInfoSelector } from '../../redux/user/selectors';
import { UserInfo } from '../../redux/user/types';
import { paths } from '../../routers/paths';
import { ReactComponent as MailIcon } from '../../icons/mail_icon.svg';
import { apiV2 } from '../../api/api';
import { RoleType } from '../../../../shared/types/customTypes';
import '../../shared.scss';

export const JoinProjectModal: Modal<ModalTypes.JOIN_PROJECT_MODAL> = ({
  closeModal,
  invitation,
}) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const { t } = useTranslation();
  const history = useHistory();
  const [refetchRoadmaps] = apiV2.useRefetchRoadmapsMutation();
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  )!;

  const closeAndRedirectToOverview = () => {
    closeModal();
    history.push(`${paths.overview}`);
  };

  const handleSubmit = async () => {
    const res = await dispatch(
      userActions.joinRoadmap({
        user: userInfo,
        invitationLink: invitation.id,
      }),
    );
    if (userActions.joinRoadmap.rejected.match(res))
      return { message: res.payload?.message ?? '' };
    await dispatch(userActions.getUserInfo());
    refetchRoadmaps();
  };

  const steps = [
    {
      component: () => (
        <div className="modalCancelContent">
          <MailIcon />
          <div>
            <Trans
              i18nKey="Join project info 1/2"
              values={{
                name: invitation.roadmap!.name,
                type: t(RoleType[invitation.type]).toLocaleLowerCase(),
              }}
            />
          </div>
          <Trans i18nKey="Join project info 2/2" />
        </div>
      ),
    },
  ];

  return (
    <StepForm
      header={t('Join project')}
      finishHeader={t('New project added')}
      finishMessage={
        <Trans
          i18nKey="New project added description"
          values={{
            name: invitation.roadmap!.name,
          }}
        />
      }
      cancelHeader={t('Cancel joining project')}
      cancelMessage={t('Cancel join project warning')}
      submit={handleSubmit}
      closeModal={closeAndRedirectToOverview}
      steps={steps}
    />
  );
};
