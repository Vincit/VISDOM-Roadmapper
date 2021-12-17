import { Form } from 'react-bootstrap';
import { Trans } from 'react-i18next';
import classNames from 'classnames';
import HelpIcon from '@material-ui/icons/Help';
import { Modal, ModalTypes } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import css from './InfoModal.module.scss';

const classes = classNames.bind(css);

export const InfoModal: Modal<ModalTypes.INFO_MODAL> = ({
  closeModal,
  header,
  content,
}) => {
  return (
    <Form>
      <ModalHeader closeModal={closeModal}>
        <div className={classes(css.headerDiv)}>
          <h3>{header}</h3>
        </div>
      </ModalHeader>
      <div className={classes(css.helpContainer)}>
        <HelpIcon className={classes(css.helpIcon)} />
      </div>
      <ModalContent>
        <div className={classes(css.modalContent)}>
          {content.subHeader && (
            <div className={classes(css.subHeader)}>{content.subHeader}</div>
          )}
          {content.columns.map((data) => (
            <div key={data.header}>
              <b>{data.header}:</b> {data.text}
            </div>
          ))}
        </div>
      </ModalContent>
      <div className={classes(css.modalFooter)}>
        <ModalFooterButtonDiv>
          <button
            className="button-large"
            type="button"
            onClick={() => closeModal()}
          >
            <Trans i18nKey="Great!" />
          </button>
        </ModalFooterButtonDiv>
      </div>
    </Form>
  );
};
