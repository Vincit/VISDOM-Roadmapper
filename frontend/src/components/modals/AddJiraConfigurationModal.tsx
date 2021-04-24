/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { StoreDispatchType } from '../../redux';
import { roadmapsActions } from '../../redux/roadmaps/index';
import { chosenRoadmapSelector } from '../../redux/roadmaps/selectors';
import { JiraConfigurationRequest, Roadmap } from '../../redux/roadmaps/types';
import { RootState } from '../../redux/types';
import { ModalProps } from '../types';
import { ModalCloseButton } from './modalparts/ModalCloseButton';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import '../../shared.scss';

export interface AddJiraConfigurationModalProps extends ModalProps {
  roadmapId: number;
}

export const AddJiraConfigurationModal: React.FC<AddJiraConfigurationModalProps> = ({
  closeModal,
  roadmapId,
}) => {
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch<StoreDispatchType>();

  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );

  const [formValues, setFormValues] = useState({
    url: '',
    privatekey: '',
    roadmapId: currentRoadmap ? currentRoadmap.id : roadmapId,
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity()) {
      setIsLoading(true);
      const req: JiraConfigurationRequest = {
        roadmapId: formValues.roadmapId,
        url: formValues.url,
        privatekey: formValues.privatekey,
      };

      dispatch(roadmapsActions.addJiraConfiguration(req)).then((res) => {
        setIsLoading(false);
        if (roadmapsActions.addJiraConfiguration.rejected.match(res)) {
          if (res.payload) {
            setErrorMessage(res.payload.message);
          }
        } else {
          closeModal();
        }
      });
    }
  };

  const onJiraUrlChange = (url: string) => {
    setFormValues({ ...formValues, url });
  };

  const onJiraPrivatekeyChange = (privatekey: string) => {
    setFormValues({ ...formValues, privatekey });
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <ModalHeader>
          <h3>
            <Trans i18nKey="jiraconfiguration" />
          </h3>
          <ModalCloseButton onClick={closeModal} />
        </ModalHeader>

        <ModalContent>
          {currentRoadmap ? (
            <>
              <label htmlFor="board">Roadmap: {currentRoadmap.name}</label>
              <p>Instructions here</p>
              <Form.Group>
                <input
                  autoComplete="off"
                  required
                  name="url"
                  id="url"
                  placeholder={t('Jira URL')}
                  value={formValues.url}
                  onChange={(e: any) => onJiraUrlChange(e.currentTarget.value)}
                />
              </Form.Group>
              <Form.Group>
                <input
                  autoComplete="off"
                  required
                  type="password"
                  name="privatekey"
                  id="privatekey"
                  placeholder={t('Jira integration private key')}
                  value={formValues.privatekey}
                  onChange={(e: any) =>
                    onJiraPrivatekeyChange(e.currentTarget.value)
                  }
                />
              </Form.Group>
            </>
          ) : (
            <p>Roadmap is undefined</p>
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
              type="button"
              onClick={closeModal}
            >
              <Trans i18nKey="Cancel" />
            </button>
          </ModalFooterButtonDiv>
          <ModalFooterButtonDiv>
            {formValues.roadmapId &&
            formValues.url &&
            formValues.privatekey &&
            !isLoading ? (
              <button className="button-large" type="submit">
                <Trans i18nKey="Save" />
              </button>
            ) : (
              <button className="button-large" disabled type="submit">
                <Trans i18nKey="Save" />
              </button>
            )}
          </ModalFooterButtonDiv>
        </ModalFooter>
      </Form>
    </>
  );
};
