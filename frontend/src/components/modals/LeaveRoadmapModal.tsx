import { FormEvent, useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { StoreDispatchType } from '../../redux';
import { roadmapsActions } from '../../redux/roadmaps';
import { LoadingSpinner } from '../LoadingSpinner';
import { Modal, ModalTypes } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import { ReactComponent as AlertIcon } from '../../icons/alert_icon.svg';
import '../../shared.scss';
import { RoleType } from '../../../../shared/types/customTypes';
import { userInfoSelector } from '../../redux/user/selectors';
import { getType } from '../../utils/UserUtils';
import { apiV2, selectById } from '../../api/api';

export const LeaveRoadmapModal: Modal<ModalTypes.LEAVE_ROADMAP_MODAL> = ({
  closeModal,
  roadmapId,
}) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const userInfo = useSelector(userInfoSelector);
  const { data: roadmap } = apiV2.useGetRoadmapsQuery(
    undefined,
    selectById(roadmapId),
  );
  const roadmapName = roadmap?.name;
  const {
    data: roadmapUsers,
    isLoading: isLoadingUsers,
  } = apiV2.useGetRoadmapUsersQuery(roadmapId);
  const role = getType(userInfo, roadmapId);
  const adminsCount =
    roadmapUsers?.filter((u) => u.type === RoleType.Admin).length ?? 0;
  const isLastAdmin = role === RoleType.Admin && adminsCount === 1;
  const isLoadingRoadmapOrUsers = isLoadingUsers;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setErrorMessage('');

    setIsLoading(true);
    const res = await dispatch(roadmapsActions.leaveRoadmap({ roadmapId }));
    setIsLoading(false);
    if (roadmapsActions.leaveRoadmap.rejected.match(res)) {
      if (res.payload?.message) return setErrorMessage(res.payload.message);
      return;
    }
    closeModal();
  };

  return (
    <Form onSubmit={handleSubmit}>
      <ModalHeader closeModal={closeModal}>
        <h3>
          <Trans i18nKey="Leave roadmap" />
        </h3>
      </ModalHeader>
      <ModalContent>
        <div className="modalCancelContent">
          <AlertIcon />
          <div>
            {isLoadingRoadmapOrUsers && <LoadingSpinner />}
            {!isLastAdmin && !isLoadingRoadmapOrUsers && (
              <Trans
                i18nKey="Leave roadmap warning"
                values={{ name: roadmapName }}
              />
            )}
            {isLastAdmin && !isLoadingRoadmapOrUsers && (
              <Trans
                i18nKey="Leave roadmap warning last admin"
                values={{ name: roadmapName }}
              />
            )}
          </div>
        </div>
        <Alert
          show={errorMessage.length > 0}
          variant="danger"
          dismissible
          onClose={() => setErrorMessage('')}
        >
          {errorMessage}
        </Alert>
      </ModalContent>
      <ModalFooter>
        <ModalFooterButtonDiv>
          <button
            className="button-large cancel"
            onClick={() => closeModal()}
            type="button"
          >
            <Trans i18nKey="No, go back" />
          </button>
        </ModalFooterButtonDiv>
        <ModalFooterButtonDiv>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <button
              className="button-large"
              type="submit"
              disabled={isLastAdmin}
            >
              <Trans i18nKey="Yes, leave roadmap" />
            </button>
          )}
        </ModalFooterButtonDiv>
      </ModalFooter>
    </Form>
  );
};
