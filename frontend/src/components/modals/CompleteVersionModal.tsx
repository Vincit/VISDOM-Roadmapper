import { FormEvent, useState } from 'react';
import Alert from '@mui/material/Alert';
import { Trans } from 'react-i18next';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { chosenRoadmapIdSelector } from '../../redux/roadmaps/selectors';
import { LoadingSpinner } from '../LoadingSpinner';
import { Modal, ModalTypes } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import css from './CompleteVersionModal.module.scss';
import { apiV2 } from '../../api/api';

const classes = classNames.bind(css);

export const CompleteVersionModal: Modal<ModalTypes.COMPLETE_VERSION_MODAL> = ({
  closeModal,
  id,
  name,
}) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [completeVersion, { isLoading }] = apiV2.useCompleteVersionMutation();
  const roadmapId = useSelector(chosenRoadmapIdSelector);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!roadmapId) return;
    try {
      await completeVersion({ roadmapId, id }).unwrap();
      closeModal();
    } catch (err: any) {
      setErrorMessage(err.data?.message ?? err.data ?? 'something went wrong');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <ModalHeader closeModal={closeModal}>
        <div className={classes(css.headerDiv)}>
          <h3>
            <Trans i18nKey="Finish milestone" />
          </h3>
          <DoneAllIcon />
        </div>
      </ModalHeader>
      <ModalContent>
        <div className={classes(css.descriptionDiv)}>
          <Trans i18nKey="Finish milestone description" values={{ name }} />
        </div>
        {errorMessage.length > 0 && (
          <Alert
            severity="error"
            onClose={() => setErrorMessage('')}
            icon={false}
          >
            {errorMessage}
          </Alert>
        )}
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
    </form>
  );
};
