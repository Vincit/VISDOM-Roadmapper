import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AxiosError } from 'axios';
import { StoreDispatchType } from '../redux';
import { roadmapsActions } from '../redux/roadmaps';
import { modalsActions } from '../redux/modals';
import { ModalTypes } from '../components/modals/types';
import { requireLogin } from '../utils/requirelogin';
import { ProjectOverviewComponent } from './ProjectOverviewPage';

const JoinRoadmapComponent = () => {
  const dispatch = useDispatch<StoreDispatchType>();
  const { invitationLink } = useParams<{
    invitationLink: string | undefined;
  }>();

  useEffect(() => {
    if (invitationLink) {
      dispatch(roadmapsActions.getInvitation(invitationLink))
        .unwrap()
        .then((invitation) =>
          dispatch(
            modalsActions.showModal({
              modalType: ModalTypes.JOIN_PROJECT_MODAL,
              modalProps: { invitation },
            }),
          ),
        )
        .catch((err: AxiosError<any>) => {
          if (err.request.status === 403)
            dispatch(
              modalsActions.showModal({
                modalType: ModalTypes.JOIN_LINK_NO_ACCESS_MODAL,
                modalProps: { invitationLink },
              }),
            );
          else
            dispatch(
              modalsActions.showModal({
                modalType: ModalTypes.JOIN_LINK_INVALID_MODAL,
                modalProps: {},
              }),
            );
        });
    }
  }, [dispatch, invitationLink]);

  return <ProjectOverviewComponent />;
};

export const JoinRoadmapPage = requireLogin(JoinRoadmapComponent);
