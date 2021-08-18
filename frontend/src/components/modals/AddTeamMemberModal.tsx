import { FormEvent, useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { StoreDispatchType } from '../../redux';
import { roadmapsActions } from '../../redux/roadmaps';
import { RoleType } from '../../../../shared/types/customTypes';
import { chosenRoadmapIdSelector } from '../../redux/roadmaps/selectors';
import { RootState } from '../../redux/types';
import { ModalTypes, Modal } from './types';
import { LoadingSpinner } from '../LoadingSpinner';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import { SelectMemberRole } from './modalparts/TeamMemberModalParts';
import { Input } from '../forms/FormField';
import css from './AddTeamMemberModal.module.scss';

const classes = classNames.bind(css);

export const AddTeamMemberModal: Modal<ModalTypes.ADD_TEAM_MEMBER_MODAL> = ({
  closeModal,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<StoreDispatchType>();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [openInfo, setOpenInfo] = useState(true);
  const [formValues, setFormValues] = useState({
    type: RoleType.Developer,
    email: '',
  });
  const chosenRoadmapId = useSelector<RootState, number | undefined>(
    chosenRoadmapIdSelector,
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    setIsLoading(true);
    const res = await dispatch(
      roadmapsActions.addInvitation({
        email: formValues.email,
        type: formValues.type,
        roadmapId: chosenRoadmapId!,
      }),
    );
    setIsLoading(false);
    if (roadmapsActions.addInvitation.rejected.match(res)) {
      if (res.payload?.message) setErrorMessage(res.payload.message);
      return;
    }
    closeModal();
  };

  return (
    <Form onSubmit={handleSubmit}>
      <ModalHeader closeModal={closeModal}>
        <h3>
          <Trans i18nKey="Add a team member" />
        </h3>
      </ModalHeader>
      <ModalContent>
        <div className={classes(css.addMemberContent)}>
          <div className={classes(css.instructions)}>
            {openInfo ? (
              <>
                <b>
                  <Trans i18nKey="Here’s how to add a team member" />
                </b>{' '}
                <Trans i18nKey="Team member addition instructions" />{' '}
                <button
                  className={classes(css.linkButton, css.blue)}
                  tabIndex={0}
                  type="button"
                  onClick={() => setOpenInfo(false)}
                >
                  <Trans i18nKey="Hide info" />
                </button>
              </>
            ) : (
              <button
                className={classes(css.linkButton, css.blue)}
                tabIndex={0}
                type="button"
                onClick={() => setOpenInfo(true)}
              >
                <Trans i18nKey="Show info" />
              </button>
            )}
          </div>
          <div>
            <SelectMemberRole
              role={formValues.type}
              onChange={(role) => setFormValues({ ...formValues, type: role })}
            />
          </div>
          <div className={classes(css.sendEmailContent)}>
            <div className={classes(css.inputContainer)}>
              <Input
                label={t('Member email the link will be sent to')}
                placeholder={t('Example email', { localPart: 'teammember' })}
                name="send link"
                type="email"
                value={formValues.email}
                onChange={(e) =>
                  setFormValues({ ...formValues, email: e.currentTarget.value })
                }
              />
            </div>
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
            <button
              className="button-large"
              type="submit"
              disabled={!formValues.email}
            >
              <Trans i18nKey="Send link" />
            </button>
          )}
        </ModalFooterButtonDiv>
      </ModalFooter>
    </Form>
  );
};
