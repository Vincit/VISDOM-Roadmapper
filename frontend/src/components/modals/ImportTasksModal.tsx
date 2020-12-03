/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useEffect, useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { api } from '../../api/api';
import { StoreDispatchType } from '../../redux';
import { roadmapsActions } from '../../redux/roadmaps/index';
import { chosenRoadmapIdSelector } from '../../redux/roadmaps/selectors';
import { JiraBoard, RootState } from '../../redux/types';
import { userActions } from '../../redux/user';
import { userInfoSelector } from '../../redux/user/selectors';
import { UserInfo } from '../../redux/user/types';
import { StyledButton } from '../forms/StyledButton';
import { LoadingSpinner } from '../LoadingSpinner';
import { ModalProps } from '../types';
import { ModalCloseButton } from './modalparts/ModalCloseButton';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';

export const ImportTasksModal: React.FC<ModalProps> = ({ closeModal }) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [jiraBoards, setJiraBoards] = useState<JiraBoard[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState(0);
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
    const getJiraBoards = async () => {
      const boards = await api.getJiraBoards();
      setJiraBoards(boards);
      setLoadedBoards(true);
    };
    getJiraBoards();
  }, []);

  useEffect(() => {
    if (jiraBoards.length > 0) {
      setSelectedBoardId(jiraBoards[0].id);
    }
  }, [jiraBoards]);

  const handleSelectBoardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBoardId(parseInt(e.target.value, 10));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity()) {
      setIsLoading(true);

      dispatch(
        roadmapsActions.importJiraBoard({
          boardId: selectedBoardId,
          createdByUser: userInfo!.id,
          roadmapId: chosenRoadmapId!,
        }),
      ).then((res) => {
        setIsLoading(false);
        if (roadmapsActions.importJiraBoard.rejected.match(res)) {
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
      <ModalCloseButton onClick={closeModal} />
      <Form onSubmit={handleSubmit}>
        <ModalHeader>
          <Trans i18nKey="Import Jira tasks" />
        </ModalHeader>
        <ModalContent>
          <label htmlFor="board">Select JIRA board:</label>
          {loadedBoards ? (
            <>
              {jiraBoards.length > 0 ? (
                <select
                  name="board"
                  id="board"
                  onChange={handleSelectBoardChange}
                >
                  {jiraBoards.map((board) => (
                    <option key={board.id} value={board.id}>
                      {board.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p>No boards available</p>
              )}
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
          <ModalFooterButtonDiv rightmargin>
            <StyledButton
              fullWidth
              buttonType="cancel"
              onClick={closeModal}
              type="button"
            >
              <Trans i18nKey="Cancel" />
            </StyledButton>
          </ModalFooterButtonDiv>
          <ModalFooterButtonDiv>
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <StyledButton fullWidth buttonType="submit" type="submit">
                <Trans i18nKey="Import" />
              </StyledButton>
            )}
          </ModalFooterButtonDiv>
        </ModalFooter>
      </Form>
    </>
  );
};
