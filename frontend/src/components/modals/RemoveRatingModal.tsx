import { FormEvent, useState } from 'react';
import Alert from '@mui/material/Alert';
import { Trans, useTranslation } from 'react-i18next';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { LoadingSpinner } from '../LoadingSpinner';
import { Modal, ModalTypes } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import { ReactComponent as AlertIcon } from '../../icons/alert_icon.svg';
import '../../shared.scss';
import { apiV2, selectById } from '../../api/api';

export const RemoveRatingModal: Modal<ModalTypes.REMOVE_RATING_MODAL> = ({
  closeModal,
  roadmapId,
  rating,
}) => {
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState('');
  const [
    deleteTaskratingTrigger,
    { isLoading },
  ] = apiV2.useDeleteTaskratingMutation();

  const { data: rater } = apiV2.useGetRoadmapUsersQuery(
    roadmapId ?? skipToken,
    selectById(rating.createdByUser),
  );
  const { data: customer } = apiV2.useGetCustomersQuery(
    roadmapId ?? skipToken,
    selectById(rating.forCustomer),
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setErrorMessage('');
    try {
      await deleteTaskratingTrigger({
        roadmapId,
        rating,
      }).unwrap();
      closeModal();
    } catch (err: any) {
      setErrorMessage(err.data?.message ?? err.data ?? 'something went wrong');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <ModalHeader closeModal={closeModal}>
        <h3>
          <Trans i18nKey="Remove rating" />
        </h3>
      </ModalHeader>
      <ModalContent>
        <div className="modalCancelContent">
          <AlertIcon />
          <div>
            {customer ? (
              <Trans
                i18nKey="Remove representative rating warning"
                values={{
                  rater: rater?.email ?? t('deleted account'),
                  customer: customer.name,
                }}
              />
            ) : (
              <Trans
                i18nKey="Remove developer rating warning"
                values={{
                  rater: rater?.email ?? t('deleted account'),
                }}
              />
            )}
          </div>
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
      <ModalFooter>
        <ModalFooterButtonDiv>
          <button
            className="button-large cancel"
            onClick={() => closeModal()}
            type="button"
          >
            <Trans i18nKey="No, go back" />
          </button>
        </ModalFooterButtonDiv>
        <ModalFooterButtonDiv>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <button className="button-large" type="submit">
              <Trans i18nKey="Yes, remove it" />
            </button>
          )}
        </ModalFooterButtonDiv>
      </ModalFooter>
    </form>
  );
};
