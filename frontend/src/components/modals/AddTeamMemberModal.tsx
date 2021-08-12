import { FC, FormEvent, useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import ExpandLessSharpIcon from '@material-ui/icons/ExpandLessSharp';
import ExpandMoreSharpIcon from '@material-ui/icons/ExpandMoreSharp';
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
import { ControlledTooltip } from '../ControlledTooltip';
import { getRoleType } from '../../utils/string';
import css from './AddTeamMemberModal.module.scss';

const classes = classNames.bind(css);

const SendEmail: FC<{
  open: boolean;
  role: string;
}> = ({ open, role }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<StoreDispatchType>();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [openToolTip, setOpenTooltip] = useState(false);
  const chosenRoadmapId = useSelector<RootState, number | undefined>(
    chosenRoadmapIdSelector,
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    setIsLoading(true);
    const res = await dispatch(
      roadmapsActions.sendInvitation({
        email,
        link: 'todo',
        role: getRoleType(role)!,
        roadmapId: chosenRoadmapId!,
      }),
    );
    setIsLoading(false);
    if (roadmapsActions.sendInvitation.rejected.match(res)) {
      if (res.payload?.message) setErrorMessage(res.payload.message);
      return;
    }
    setOpenTooltip(true);
  };

  return (
    <>
      {open && (
        <>
          <Form onSubmit={handleSubmit}>
            <Input
              label={t('Member email the link will be sent to')}
              placeholder={t('Example email', { localPart: 'teammember' })}
              name="send link"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />
            <div className={classes(css.sendButton)}>
              <ControlledTooltip
                title={t('Sent!')}
                placement="bottom"
                open={openToolTip}
                onClose={() => setOpenTooltip(false)}
              >
                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <button
                    className={classes(css['button-small-filled'])}
                    type="submit"
                    disabled={!email}
                  >
                    <Trans i18nKey="Send link" />
                  </button>
                )}
              </ControlledTooltip>
            </div>
          </Form>
          <Alert
            show={errorMessage.length > 0}
            variant="danger"
            dismissible
            onClose={() => setErrorMessage('')}
          >
            {errorMessage}
          </Alert>
        </>
      )}
    </>
  );
};

export const AddTeamMemberModal: Modal<ModalTypes.ADD_TEAM_MEMBER_MODAL> = ({
  closeModal,
}) => {
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState('');
  const [open, setOpen] = useState({
    info: true,
    tooltip: false,
    email: false,
  });
  const [selectedRole, setSelectedRole] = useState(
    RoleType[RoleType.Developer],
  );

  return (
    <>
      <ModalHeader closeModal={closeModal}>
        <h3>
          <Trans i18nKey="Add a team member" />
        </h3>
      </ModalHeader>
      <ModalContent>
        <div className={classes(css.addMemberContent)}>
          {open.info && (
            <div className={classes(css.instructions)}>
              <b>
                <Trans i18nKey="Here’s how to add a team member" />
              </b>{' '}
              <Trans i18nKey="Team member addition instructions" />{' '}
              <button
                className={classes(css.linkButton, css.blue)}
                tabIndex={0}
                type="button"
                onClick={() => setOpen({ ...open, info: false })}
              >
                <Trans i18nKey="Hide info" />
              </button>
            </div>
          )}
          <div>
            <SelectMemberRole
              role={selectedRole}
              onChange={(role) => setSelectedRole(role)}
            />
          </div>
          <div className={classes(css.joinLinkContent)}>
            <Input
              label={t('Joining link')}
              disabled
              name="joining link"
              value="todo"
            />
            <div className={classes(css.buttons)}>
              <ControlledTooltip
                title={t('Copied!')}
                placement="bottom"
                open={open.tooltip}
                onClose={() => setOpen({ ...open, tooltip: false })}
              >
                <button
                  className={classes(css['button-small-filled'])}
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('todo');
                    setOpen({ ...open, tooltip: true });
                  }}
                >
                  <Trans i18nKey="Copy link" />
                </button>
              </ControlledTooltip>
              <button
                className={classes(css['button-small-outlined'])}
                type="button"
              >
                <Trans i18nKey="Create a new link" />
              </button>
            </div>
            <Alert
              show={errorMessage.length > 0}
              variant="danger"
              dismissible
              onClose={() => setErrorMessage('')}
            >
              {errorMessage}
            </Alert>
          </div>
          <div className={classes(css.sendEmailContent)}>
            <div
              className={classes(css.header)}
              onClick={() => setOpen({ ...open, email: !open.email })}
              onKeyPress={() => setOpen({ ...open, email: !open.email })}
              role="button"
              tabIndex={0}
            >
              <Trans i18nKey="Send via email" />{' '}
              {open.email ? <ExpandLessSharpIcon /> : <ExpandMoreSharpIcon />}
            </div>
            <SendEmail open={open.email} role={selectedRole} />
          </div>
        </div>
      </ModalContent>
      <ModalFooter>
        <ModalFooterButtonDiv>
          <button
            className="button-large"
            type="button"
            onClick={() => closeModal(true)}
          >
            <Trans i18nKey="All done button" />
          </button>
        </ModalFooterButtonDiv>
      </ModalFooter>
    </>
  );
};
