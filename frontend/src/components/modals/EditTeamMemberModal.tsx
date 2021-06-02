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
import { RoadmapUser } from '../../redux/roadmaps/types';
import { RoleType } from '../../../../shared/types/customTypes';
import { LoadingSpinner } from '../LoadingSpinner';
import { ModalProps } from '../types';
import { ModalCloseButton } from './modalparts/ModalCloseButton';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import css from './EditTeamMemberModal.module.scss';

const classes = classNames.bind(css);

export interface EditTeamMemberModalProps extends ModalProps {
  member: RoadmapUser;
}

export const EditTeamMemberModal: React.FC<EditTeamMemberModalProps> = ({
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
      roadmapsActions.patchTeamMember({
        id: member.id,
        type,
      }),
    );

    setIsLoading(false);
    if (roadmapsActions.patchTeamMember.rejected.match(res)) {
      if (res.payload?.message) setErrorMessage(res.payload.message);
      return;
    }
    closeModal();
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <ModalHeader>
          <h3>
            <Trans i18nKey="Modify team members" />
          </h3>
          <ModalCloseButton onClick={closeModal} />
        </ModalHeader>
        <ModalContent>
          <div className={classes(css.section, css.memberSection)}>
            {selectedRole === 'Admin' && <StarSharpIcon />}
            {selectedRole === 'Developer' && <BuildSharpIcon />}
            {selectedRole === 'Business' && (
              <BusinessValueFilled className={classes(css.business)} />
            )}
            <div className={classes(css.memberName)}>{member.username}</div>
          </div>
          <div className={classes(css.section)}>
            <label htmlFor="role">
              <Trans i18nKey="Member role" />
            </label>
            <div id="role" className={classes(css.roleSection)}>
              <div className={classes(css.radioButton)}>
                <div
                  id="developer"
                  onClick={() => setSelectedRole('Developer')}
                  onKeyPress={() => setSelectedRole('Developer')}
                  tabIndex={0}
                  role="radio"
                  aria-checked={selectedRole === 'Developer'}
                >
                  <RadioButton checked={selectedRole === 'Developer'} />
                </div>
                <label
                  className={classes(css.radioLabel, {
                    [css.active]: selectedRole === 'Developer',
                  })}
                  htmlFor="developer"
                >
                  <Trans i18nKey="Developer" />
                </label>
              </div>
              <div className={classes(css.radioButton)}>
                <div
                  id="business"
                  onClick={() => setSelectedRole('Business')}
                  onKeyPress={() => setSelectedRole('Business')}
                  tabIndex={0}
                  role="radio"
                  aria-checked={selectedRole === 'Business'}
                >
                  <RadioButton checked={selectedRole === 'Business'} />
                </div>
                <label
                  className={classes(css.radioLabel, {
                    [css.active]: selectedRole === 'Business',
                  })}
                  htmlFor="business"
                >
                  <Trans i18nKey="Businessperson" />
                </label>
              </div>
              <div className={classes(css.radioButton)}>
                <div
                  id="admin"
                  onClick={() => setSelectedRole('Admin')}
                  onKeyPress={() => setSelectedRole('Admin')}
                  tabIndex={0}
                  role="radio"
                  aria-checked={selectedRole === 'Admin'}
                >
                  <RadioButton checked={selectedRole === 'Admin'} />
                </div>
                <label
                  className={classes(css.radioLabel, {
                    [css.active]: selectedRole === 'Admin',
                  })}
                  htmlFor="admin"
                >
                  <Trans i18nKey="Admin" />
                </label>
              </div>
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
        <ModalFooter>
          <ModalFooterButtonDiv>
            <button
              className="button-large cancel"
              onClick={closeModal}
              type="button"
            >
              <Trans i18nKey="Cancel" />
            </button>
          </ModalFooterButtonDiv>
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
