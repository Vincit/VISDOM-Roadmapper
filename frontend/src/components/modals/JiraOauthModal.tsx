/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useEffect, useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { api } from '../../api/api';
import { StyledButton } from '../forms/StyledButton';
import { StyledFormControl } from '../forms/StyledFormControl';
import { LoadingSpinner } from '../LoadingSpinner';
import { ModalProps } from '../types';
import { ModalCloseButton } from './modalparts/ModalCloseButton';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import { chosenJiraconfigurationSelector } from '../../redux/roadmaps/selectors';

export const JiraOauthModal: React.FC<ModalProps> = ({ closeModal }) => {
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState('');
  const [oauthURL, setOAuthURL] = useState<null | URL>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentJiraConfiguration = useSelector(
    chosenJiraconfigurationSelector(),
  )!;

  const [formValues, setFormValues] = useState({
    token: '',
    tokenSecret: '',
    oauthVerifierCode: '',
  });

  useEffect(() => {
    const getOAuthURL = async () => {
      try {
        const response = await api.getJiraOauthURL({
          id: currentJiraConfiguration.id,
        });
        const { token, tokenSecret } = response;
        setFormValues({ ...formValues, token, tokenSecret });
        setOAuthURL(response.url);
      } catch (error) {
        setErrorMessage(
          'Unable to query Jira OAuth URL. Please contact an administrator if the problem persists.',
        );
      }
    };

    getOAuthURL();
  }, [formValues, currentJiraConfiguration.id]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity()) {
      setIsLoading(true);

      const swapToken = async () => {
        const success = await api.swapJiraOAuthToken({
          id: currentJiraConfiguration.id,
          verifierToken: formValues.oauthVerifierCode,
          token: formValues.token,
          tokenSecret: formValues.tokenSecret,
        });
        setIsLoading(false);

        if (success) {
          closeModal();
        } else {
          setErrorMessage(
            'Unable to swap Jira OAuth token. Please contact an administrator if the problem persists.',
          );
        }
      };
      swapToken();
    }
  };

  const onOAuthVerifierCodeChange = (oauthVerifierCode: string) => {
    setFormValues({ ...formValues, oauthVerifierCode });
  };

  return (
    <>
      <ModalCloseButton onClick={closeModal} />
      <Form onSubmit={handleSubmit}>
        <ModalHeader>
          <Trans i18nKey="Setup Jira OAuth" />
        </ModalHeader>
        <ModalContent>
          {isLoading || !oauthURL ? (
            <LoadingSpinner />
          ) : (
            <>
              <label htmlFor="board">OAuth URL:</label>
              <p>
                Please visit{' '}
                <a
                  href={oauthURL.toString()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  this URL
                </a>{' '}
                and input the code below:
              </p>
              <Form.Group>
                <StyledFormControl
                  autoComplete="off"
                  required
                  name="oauthVerifierCode"
                  id="oauthVerifierCode"
                  placeholder={t('OAuth verifier code')}
                  value={formValues.oauthVerifierCode}
                  onChange={(e: any) =>
                    onOAuthVerifierCodeChange(e.currentTarget.value)
                  }
                />
              </Form.Group>
            </>
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
            {formValues.oauthVerifierCode && !isLoading ? (
              <StyledButton fullWidth buttonType="submit" type="submit">
                <Trans i18nKey="Save" />
              </StyledButton>
            ) : null}
          </ModalFooterButtonDiv>
        </ModalFooter>
      </Form>
    </>
  );
};
