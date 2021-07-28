import React, { useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans } from 'react-i18next';
import classNames from 'classnames';
import { useDispatch } from 'react-redux';
import BuildSharpIcon from '@material-ui/icons/BuildSharp';
import StarSharpIcon from '@material-ui/icons/StarSharp';
import { BusinessValueFilled } from '../RatingIcons';
import { RadioButton } from '../forms/RadioButton';
import { StoreDispatchType } from '../../redux';
import { roadmapsActions } from '../../redux/roadmaps';
import { RoleType } from '../../../../shared/types/customTypes';
import { LoadingSpinner } from '../LoadingSpinner';
import { Modal, ModalTypes } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import css from './EditTeamMemberModal.module.scss';

const classes = classNames.bind(css);

export const EditTeamMemberModal: Modal<ModalTypes.EDIT_TEAM_MEMBER_MODAL> = ({
  closeModal,
  member,
}) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState(RoleType[member.type]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (RoleType[member.type] === selectedRole) {
      closeModal();
      return;
    }
    setIsLoading(true);

    let type = RoleType.Admin;
    if (selectedRole === 'Developer') type = RoleType.Developer;
    if (selectedRole === 'Business') type = RoleType.Business;
    const res = await dispatch(
      roadmapsActions.patchRoadmapUser({
        id: member.id,
        type,
      }),
    );

    setIsLoading(false);
    if (roadmapsActions.patchRoadmapUser.rejected.match(res)) {
      if (res.payload?.message) setErrorMessage(res.payload.message);
      return;
    }
    closeModal();
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <ModalHeader closeModal={closeModal}>
          <h3>
            <Trans i18nKey="Modify team members" />
          </h3>
        </ModalHeader>
        <ModalContent>
          <div className={classes(css.section, css.memberSection)}>
            {selectedRole === 'Admin' && <StarSharpIcon />}
            {selectedRole === 'Developer' && <BuildSharpIcon />}
            {selectedRole === 'Business' && (
              <BusinessValueFilled className={classes(css.business)} />
            )}
            {member.username}
          </div>
          <div className={classes(css.section)}>
            <label htmlFor="role">
              <Trans i18nKey="Member role" />
            </label>
            <div id="role" className={classes(css.roleSection)}>
              <RadioButton
                label="Developer"
                value="Developer"
                checked={selectedRole === 'Developer'}
                onChange={(value: string) => setSelectedRole(value)}
              />
              <RadioButton
                label="Businessperson"
                value="Business"
                checked={selectedRole === 'Business'}
                onChange={(value: string) => setSelectedRole(value)}
              />
              <RadioButton
                label="Admin"
                value="Admin"
                checked={selectedRole === 'Admin'}
                onChange={(value: string) => setSelectedRole(value)}
              />
              {selectedRole === 'Admin' && (
                <div className={classes(css.warning)}>
                  <b>Caution:</b> giving Admin role to this member let’s them
                  manage the project however they like.
                </div>
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
