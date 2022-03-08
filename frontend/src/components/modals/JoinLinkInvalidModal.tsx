import { FormEvent } from 'react';
import { useHistory } from 'react-router-dom';
import { Trans } from 'react-i18next';
import { Modal, ModalTypes } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import { paths } from '../../routers/paths';
import { ReactComponent as AlertOrangeIcon } from '../../icons/alert_orange_icon.svg';
import '../../shared.scss';

export const JoinLinkInvalidModal: Modal<ModalTypes.JOIN_LINK_INVALID_MODAL> = ({
  closeModal,
}) => {
  const history = useHistory();

  const closeAndRedirectToOverview = () => {
    closeModal();
    history.push(`${paths.overview}`);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    closeAndRedirectToOverview();
  };

  return (
    <form onSubmit={handleSubmit}>
      <ModalHeader closeModal={closeAndRedirectToOverview}>
        <h3>
          <Trans i18nKey="Project link invalid" />
        </h3>
      </ModalHeader>
      <ModalContent>
        <div className="modalCancelContent">
          <AlertOrangeIcon />
          <div>
            <Trans i18nKey="Project link invalid info 1/2" />
          </div>
          <Trans i18nKey="Project link invalid info 2/2" />
        </div>
      </ModalContent>
      <ModalFooter>
        <ModalFooterButtonDiv>
          <button className="button-large" type="submit">
            <Trans i18nKey="OK!" />
          </button>
        </ModalFooterButtonDiv>
      </ModalFooter>
    </form>
  );
};
