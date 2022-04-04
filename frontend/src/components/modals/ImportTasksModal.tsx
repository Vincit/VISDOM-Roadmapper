import { FormEvent, SyntheticEvent, useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import { Trans, useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import { apiV2 } from '../../api/api';
import { StoreDispatchType } from '../../redux';
import { chosenRoadmapIdSelector } from '../../redux/roadmaps/selectors';
import { RootState } from '../../redux/types';
import { userActions } from '../../redux/user';
import { userInfoSelector } from '../../redux/user/selectors';
import { UserInfo } from '../../redux/user/types';
import { LoadingSpinner } from '../LoadingSpinner';
import { ModalTypes, Modal } from './types';
import { modalsActions } from '../../redux/modals/index';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import { titleCase } from '../../utils/string';
import '../../shared.scss';

export const ImportTasksModal: Modal<ModalTypes.IMPORT_TASKS_MODAL> = ({
  name,
  closeModal,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<StoreDispatchType>();
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedBoardId, setSelectedBoardId] = useState<string | undefined>();
  const [selectedLabels, setSelectedLabels] = useState<Map<string, string[]>>(
    new Map(),
  );
  const [tokenError, setTokenError] = useState(false);
  const chosenRoadmapId = useSelector(chosenRoadmapIdSelector);
  const [
    importIntegrationBoard,
    importStatus,
  ] = apiV2.useImportIntegrationBoardMutation();
  const boards = apiV2.useGetIntegrationBoardsQuery(
    {
      name,
      roadmapId: chosenRoadmapId!,
    },
    { skip: !chosenRoadmapId },
  );
  const labels = apiV2.useGetIntegrationBoardLabelsQuery(
    {
      name,
      boardId: selectedBoardId!,
      roadmapId: chosenRoadmapId!,
    },
    { skip: !selectedBoardId || !chosenRoadmapId },
  );
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );

  useEffect(() => {
    if (!userInfo) dispatch(userActions.getUserInfo());
  }, [userInfo, dispatch]);

  const isTokenError = (err: any) => err.data?.error === 'InvalidTokenError';

  useEffect(() => {
    if (!boards.isError && !labels.isError) return;
    const err = boards.error ?? labels.error;
    if (isTokenError(err)) {
      setTokenError(true);
      setErrorMessage(t('Invalid Oauth token error'));
    } else {
      setErrorMessage(t('Internal server error'));
    }
  }, [boards, labels, t]);

  useEffect(() => {
    if (boards.data?.length) {
      setSelectedBoardId(boards.data[0].id);
    }
  }, [boards.data]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity()) {
      try {
        await importIntegrationBoard({
          name,
          boardId: selectedBoardId!,
          createdByUser: userInfo!.id,
          roadmapId: chosenRoadmapId!,
          filters: {
            labels: selectedLabels.get(selectedBoardId!),
          },
        }).unwrap();
        closeModal();
      } catch (err: any) {
        setErrorMessage(err.data?.message ?? 'something went wrong');
      }
    }
  };

  const configureOauth = (e: SyntheticEvent) => {
    e.preventDefault();
    if (chosenRoadmapId) {
      dispatch(
        modalsActions.showModal({
          modalType: ModalTypes.SETUP_OAUTH_MODAL,
          modalProps: {
            name,
            roadmapId: chosenRoadmapId,
            onSuccess: {
              modalType: ModalTypes.IMPORT_TASKS_MODAL,
              modalProps: { name },
            },
          },
        }),
      );
    }
  };

  const modalBody = () => {
    if (boards.isLoading) return <LoadingSpinner />;
    if (tokenError) {
      return (
        <button
          className="button-small-filled"
          onClick={configureOauth}
          type="button"
        >
          + <Trans i18nKey="Configure OAuth" />
        </button>
      );
    }
    if (!boards.data) return null;
    return (
      <>
        <Select
          name="board"
          id="board"
          className="react-select"
          classNamePrefix="react-select"
          styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          placeholder="No boards available"
          isDisabled={boards.data.length === 0}
          menuPortalTarget={document.body}
          onChange={(selected) =>
            selected && setSelectedBoardId(selected.value)
          }
          defaultValue={
            boards.data.length > 0
              ? {
                  value: boards.data[0].id,
                  label: boards.data[0].name,
                }
              : null
          }
          options={boards.data.map((board) => ({
            value: board.id,
            label: board.name,
          }))}
        />
        <label htmlFor="labels" style={{ marginTop: '1em' }}>
          {t('Select labels to import')}
        </label>
        <Select
          id="labels"
          key={selectedBoardId}
          className="react-select"
          styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          placeholder="Import all issues"
          isMulti
          isClearable
          isDisabled={selectedBoardId === undefined}
          menuPortalTarget={document.body}
          onChange={(selected) =>
            setSelectedLabels(
              new Map(selectedLabels).set(
                selectedBoardId!,
                selected.map(({ value }) => value),
              ),
            )
          }
          isLoading={selectedBoardId !== undefined && labels.isLoading}
          defaultValue={selectedLabels
            .get(selectedBoardId!)
            ?.map((label) => ({ value: label, label }))}
          options={labels.data?.map((label) => ({
            value: label,
            label,
          }))}
        />
      </>
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <ModalHeader closeModal={closeModal}>
        <h3>{t('Import tasks from', { name: titleCase(name) })}</h3>
      </ModalHeader>
      <ModalContent>
        <label htmlFor="board">
          {t('Select integration board', { name: titleCase(name) })}
        </label>
        {modalBody()}
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
          {importStatus.isLoading ? (
            <LoadingSpinner />
          ) : (
            <button
              className="button-large"
              type="submit"
              disabled={selectedBoardId === undefined}
            >
              <Trans i18nKey="Import" />
            </button>
          )}
        </ModalFooterButtonDiv>
      </ModalFooter>
    </form>
  );
};
