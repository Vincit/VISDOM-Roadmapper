import { FormEvent } from 'react';
import { useHistory } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import { Trans } from 'react-i18next';
import { Modal, ModalTypes } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import { paths } from '../../routers/paths';
import { ReactComponent as AlertOrangeIcon } from '../../icons/alert_orange_icon.svg';
import '../../shared.scss';

export const JoinLinkNoAccessModal: Modal<ModalTypes.JOIN_LINK_NO_ACCESS_MODAL> = ({
  closeModal,
  invitationLink,
}) => {
  const history = useHistory();

  const closeAndRedirectToOverview = () => {
    closeModal();
    history.push(`${paths.overview}`);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    closeModal();
    history.push(
      `${paths.logoutPage}?redirectTo=${encodeURIComponent(
        `/join/${invitationLink}`,
      )}`,
    );
  };

  return (
    <Form onSubmit={handleSubmit}>
      <ModalHeader closeModal={closeAndRedirectToOverview}>
        <h3>
          <Trans i18nKey="Log in with another account" />
        </h3>
      </ModalHeader>
      <ModalContent>
        <div className="modalCancelContent">
          <AlertOrangeIcon />
          <div>
            <Trans i18nKey="Project link no access info 1/2" />
          </div>
          <Trans i18nKey="Project link no access info 2/2" />
        </div>
      </ModalContent>
      <ModalFooter>
        <ModalFooterButtonDiv>
          <button
            className="button-large cancel"
            onClick={closeAndRedirectToOverview}
            type="button"
          >
            <Trans i18nKey="No, thanks" />
          </button>
        </ModalFooterButtonDiv>
        <ModalFooterButtonDiv>
          <button className="button-large" type="submit">
            <Trans i18nKey="Yes, log in again" />
          </button>
        </ModalFooterButtonDiv>
      </ModalFooter>
    </Form>
  );
};
