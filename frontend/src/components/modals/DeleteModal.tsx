import { FC, FormEvent, useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import DeleteIcon from '@material-ui/icons/DeleteSharp';
import { StoreDispatchType } from '../../redux';
import { roadmapsActions } from '../../redux/roadmaps/index';
import { LoadingSpinner } from '../LoadingSpinner';
import { Modal, ModalTypes } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import css from './DeleteModal.module.scss';
import { paths } from '../../routers/paths';

const classes = classNames.bind(css);

const DeleteModalContent: FC<{
  header: string;
  action: any;
  payload: any;
  closeModal: (success?: boolean) => void;
}> = ({ header, action, payload, closeModal, children }) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsLoading(true);
    const res = await dispatch(action(payload));
    setIsLoading(false);
    if (action.rejected.match(res)) {
      if (res.payload?.message) setErrorMessage(res.payload.message);
      return;
    }
    closeModal(true);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <ModalHeader closeModal={closeModal}>
        <div className={classes(css.headerDiv)}>
          <h3>{header}</h3>
          <DeleteIcon />
        </div>
      </ModalHeader>
      <ModalContent>
        <div className={classes(css.descriptionDiv)}>{children}</div>
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
  );
};

export const DeleteVersionModal: Modal<ModalTypes.DELETE_VERSION_MODAL> = ({
  closeModal,
  ...payload
}) => {
  const { t } = useTranslation();
  return (
    <DeleteModalContent
      header={t('Delete milestone')}
      action={roadmapsActions.deleteVersion}
      payload={payload}
      closeModal={closeModal}
    >
      <Trans i18nKey="Delete milestone confirmation" />
    </DeleteModalContent>
  );
};

export const DeleteRoadmapModal: Modal<ModalTypes.DELETE_ROADMAP_MODAL> = ({
  closeModal,
  id,
}) => {
  const { t } = useTranslation();
  const history = useHistory();
  return (
    <DeleteModalContent
      header={t('Delete project')}
      action={roadmapsActions.deleteRoadmap}
      payload={{ id }}
      closeModal={(success) => {
        closeModal(success);
        if (success) history.push(paths.overview);
      }}
    >
      <Trans i18nKey="Delete project confirmation">
        <p>{t('Are you sure to continue')}</p>
        <p className={classes(css.warning)}>{t('Project deletion warning')}</p>
      </Trans>
    </DeleteModalContent>
  );
};
