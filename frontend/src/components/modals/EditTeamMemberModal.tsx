import { FormEvent, useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans } from 'react-i18next';
import classNames from 'classnames';
import { useDispatch } from 'react-redux';
import BuildSharpIcon from '@material-ui/icons/BuildSharp';
import StarSharpIcon from '@material-ui/icons/StarSharp';
import { BusinessIcon } from '../RoleIcons';
import { StoreDispatchType } from '../../redux';
import { roadmapsActions } from '../../redux/roadmaps';
import { Invitation, RoadmapUser } from '../../redux/roadmaps/types';
import { RoleType } from '../../../../shared/types/customTypes';
import { LoadingSpinner } from '../LoadingSpinner';
import { Modal, ModalTypes } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import { SelectMemberRole } from './modalparts/TeamMemberModalParts';
import css from './EditTeamMemberModal.module.scss';

export const isInvitation = (
  member: Invitation | RoadmapUser,
): member is Invitation => 'updatedAt' in member;

const classes = classNames.bind(css);

export const EditTeamMemberModal: Modal<ModalTypes.EDIT_TEAM_MEMBER_MODAL> = ({
  closeModal,
  member,
}) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState(member.type);

  const editInvitation = async () => {
    const res = await dispatch(
      roadmapsActions.patchInvitation({
        id: member.id as string,
        type: selectedRole,
      }),
    );
    if (roadmapsActions.patchInvitation.rejected.match(res))
      if (res.payload?.message) return res.payload.message;
  };

  const editTeamMember = async () => {
    const res = await dispatch(
      roadmapsActions.patchRoadmapUser({
        id: member.id as number,
        type: selectedRole,
      }),
    );
    if (roadmapsActions.patchRoadmapUser.rejected.match(res))
      if (res.payload?.message) return res.payload.message;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (member.type === selectedRole) {
      closeModal();
      return;
    }

    setIsLoading(true);
    const error = isInvitation(member)
      ? await editInvitation()
      : await editTeamMember();
    setIsLoading(false);

    if (error) setErrorMessage(error);
    else closeModal();
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <ModalHeader closeModal={closeModal}>
          <h3>
            {isInvitation(member) ? (
              <Trans i18nKey="Modify invitation" />
            ) : (
              <Trans i18nKey="Modify team members" />
            )}
          </h3>
        </ModalHeader>
        <ModalContent>
          <div className={classes(css.section, css.memberSection)}>
            {selectedRole === RoleType.Admin && <StarSharpIcon />}
            {selectedRole === RoleType.Developer && <BuildSharpIcon />}
            {selectedRole === RoleType.Business && <BusinessIcon />}
            {member.email}
          </div>
          <div className={classes(css.section)}>
            <SelectMemberRole
              role={selectedRole}
              onChange={(value) => setSelectedRole(value)}
              disableRoleIcons
            />
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
        <ModalFooter closeModal={closeModal}>
          <ModalFooterButtonDiv>
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <button className="button-large" type="submit">
                <Trans i18nKey="Confirm" />
              </button>
            )}
          </ModalFooterButtonDiv>
        </ModalFooter>
      </Form>
    </>
  );
};
