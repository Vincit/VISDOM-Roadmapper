/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { StoreDispatchType } from '../../redux';
import { roadmapsActions } from '../../redux/roadmaps/index';
import { chosenJiraconfigurationSelector } from '../../redux/roadmaps/selectors';
import { JiraConfigurationRequest } from '../../redux/roadmaps/types';
import { StyledFormControl } from '../forms/StyledFormControl';
import { ModalProps } from '../types';
import { ModalCloseButton } from './modalparts/ModalCloseButton';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import '../../shared.scss';

export interface EditJiraConfigurationModalProps extends ModalProps {
  jiraconfigurationId: number;
}

export const EditJiraConfigurationModal: React.FC<EditJiraConfigurationModalProps> = ({
  closeModal,
}) => {
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch<StoreDispatchType>();

  const currentJiraConfiguration = useSelector(
    chosenJiraconfigurationSelector(),
  )!;

  const [formValues, setFormValues] = useState({
    url: currentJiraConfiguration?.url || '',
    privatekey: currentJiraConfiguration?.privatekey || '',
    roadmapId: currentJiraConfiguration?.roadmapId,
    id: currentJiraConfiguration?.id,
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity()) {
      setIsLoading(true);
      const req: JiraConfigurationRequest = {
        id: formValues.id,
        roadmapId: formValues.roadmapId,
        url: formValues.url,
        privatekey: formValues.privatekey,
      };

      dispatch(roadmapsActions.patchJiraConfiguration(req)).then((res) => {
        setIsLoading(false);
        if (roadmapsActions.patchJiraConfiguration.rejected.match(res)) {
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
            <Trans i18nKey="edit_jiraconfiguration" />
          </h3>
          <ModalCloseButton onClick={closeModal} />
        </ModalHeader>
        <ModalContent>
          {currentJiraConfiguration ? (
            <>
              <label htmlFor="board">
                Roadmap: {currentJiraConfiguration.roadmapId}
              </label>
              <p>Instructions here</p>
              <Form.Group>
                <StyledFormControl
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
                <StyledFormControl
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
              onClick={closeModal}
              type="button"
            >
              <Trans i18nKey="Cancel" />
            </button>
          </ModalFooterButtonDiv>
          <ModalFooterButtonDiv>
            {formValues.id &&
            formValues.url &&
            formValues.privatekey &&
            !isLoading ? (
              <button className="button-large" type="submit">
                <Trans i18nKey="Save" />
              </button>
            ) : null}
          </ModalFooterButtonDiv>
        </ModalFooter>
      </Form>
    </>
  );
};
