import React, { useEffect, useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import { api } from '../../api/api';
import { StoreDispatchType } from '../../redux';
import { roadmapsActions } from '../../redux/roadmaps/index';
import { chosenRoadmapIdSelector } from '../../redux/roadmaps/selectors';
import { IntegrationBoard, RootState } from '../../redux/types';
import { userActions } from '../../redux/user';
import { userInfoSelector } from '../../redux/user/selectors';
import { UserInfo } from '../../redux/user/types';
import { LoadingSpinner } from '../LoadingSpinner';
import { ModalProps } from '../types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import { titleCase } from '../../utils/string';
import '../../shared.scss';

export const ImportTasksModal: React.FC<ModalProps & { name: string }> = ({
  name,
  closeModal,
}) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [boards, setBoards] = useState<IntegrationBoard[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | undefined>();
  const [availableLabels, setAvailableLabels] = useState<
    string[] | undefined
  >();
  const [selectedLabels, setSelectedLabels] = useState<Map<string, string[]>>(
    new Map(),
  );
  const [loadedBoards, setLoadedBoards] = useState(false);
  const chosenRoadmapId = useSelector<RootState, number | undefined>(
    chosenRoadmapIdSelector,
  );
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );

  useEffect(() => {
    if (!userInfo) dispatch(userActions.getUserInfo());
  }, [userInfo, dispatch]);

  useEffect(() => {
    const getBoards = async () => {
      const newBoards = await api.getIntegrationBoards(name, {
        roadmapId: chosenRoadmapId!,
      });
      setBoards(newBoards);
      setLoadedBoards(true);
    };
    getBoards();
  }, [chosenRoadmapId, name]);

  useEffect(() => {
    const getLabels = async () => {
      const labels = await api.getIntegrationBoardLabels(name, {
        roadmapId: chosenRoadmapId!,
        boardId: selectedBoardId!,
      });
      setAvailableLabels(labels);
    };
    if (selectedBoardId !== undefined) {
      getLabels();
    }
  }, [selectedBoardId, chosenRoadmapId, name]);

  useEffect(() => {
    if (boards.length > 0) {
      setSelectedBoardId(boards[0].id);
    }
  }, [boards]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity()) {
      setIsLoading(true);

      dispatch(
        roadmapsActions.importIntegrationBoard({
          name,
          boardId: selectedBoardId!,
          createdByUser: userInfo!.id,
          roadmapId: chosenRoadmapId!,
          filters: {
            labels: selectedLabels.get(selectedBoardId!),
          },
        }),
      ).then((res) => {
        setIsLoading(false);
        if (roadmapsActions.importIntegrationBoard.rejected.match(res)) {
          if (res.payload) {
            setErrorMessage(res.payload.message);
          }
        } else {
          closeModal();
        }
      });
    }
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <ModalHeader closeModal={closeModal}>
          <h3>
            <Trans i18nKey="Import tasks from" /> {titleCase(name)}
          </h3>
        </ModalHeader>
        <ModalContent>
          <label htmlFor="board">Select {titleCase(name)} board:</label>
          {loadedBoards ? (
            <>
              <Select
                name="board"
                id="board"
                className="react-select"
                placeholder="No boards available"
                isDisabled={boards.length === 0}
                onChange={(selected) =>
                  selected && setSelectedBoardId(selected.value)
                }
                defaultValue={
                  boards.length > 0
                    ? {
                        value: boards[0].id,
                        label: boards[0].name,
                      }
                    : null
                }
                options={boards.map((board) => ({
                  value: board.id,
                  label: board.name,
                }))}
              />
              <label htmlFor="labels" style={{ marginTop: '1em' }}>
                Select labels to import:
              </label>
              <Select
                id="labels"
                key={selectedBoardId}
                className="react-select"
                placeholder="Import all issues"
                isMulti
                isClearable
                isDisabled={selectedBoardId === undefined}
                onChange={(selected) =>
                  setSelectedLabels(
                    new Map(selectedLabels).set(
                      selectedBoardId!,
                      selected.map(({ value }) => value),
                    ),
                  )
                }
                isLoading={
                  selectedBoardId !== undefined && availableLabels === undefined
                }
                defaultValue={selectedLabels
                  .get(selectedBoardId!)
                  ?.map((label) => ({ value: label, label }))}
                options={availableLabels?.map((label) => ({
                  value: label,
                  label,
                }))}
              />
            </>
          ) : (
            <LoadingSpinner />
          )}

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
                <Trans i18nKey="Import" />
              </button>
            )}
          </ModalFooterButtonDiv>
        </ModalFooter>
      </Form>
    </>
  );
};
