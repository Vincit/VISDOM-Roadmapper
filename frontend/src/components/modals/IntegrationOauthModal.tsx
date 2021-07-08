import React, { useEffect, useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { api } from '../../api/api';
import { LoadingSpinner } from '../LoadingSpinner';
import { Modal, ModalTypes } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import { chosenIntegrationSelector } from '../../redux/roadmaps/selectors';
import { titleCase } from '../../utils/string';
import { Input } from '../forms/FormField';
import '../../shared.scss';

export const OauthModal: Modal<ModalTypes.SETUP_OAUTH_MODAL> = ({
  closeModal,
  roadmapId,
  name,
}) => {
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState('');
  const [oauthURL, setOAuthURL] = useState<null | URL>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentConfiguration = useSelector(chosenIntegrationSelector(name));

  const [formValues, setFormValues] = useState({
    token: '',
    tokenSecret: '',
    oauthVerifierCode: '',
  });

  useEffect(() => {
    if (!currentConfiguration) {
      setErrorMessage(
        `No ${titleCase(
          name,
        )} configuration found. Please configure ${titleCase(name)} first.`,
      );
      return;
    }
    const getOAuthURL = async () => {
      try {
        const response = await api.getIntegrationOauthURL(name, roadmapId);
        const { url, token, tokenSecret } = response;
        setFormValues((prev) => ({ ...prev, token, tokenSecret }));
        setOAuthURL(url);
      } catch (error) {
        setErrorMessage(
          `Unable to query ${titleCase(
            name,
          )} OAuth URL. Please contact an administrator if the problem persists.`,
        );
      }
    };

    getOAuthURL();
  }, [currentConfiguration, roadmapId, name]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity() && currentConfiguration) {
      setIsLoading(true);

      const swapToken = async () => {
        try {
          const success = await api.swapIntegrationOAuthToken(
            name,
            {
              id: currentConfiguration.id,
              verifierToken: formValues.oauthVerifierCode,
              token: formValues.token,
              tokenSecret: formValues.tokenSecret,
            },
            roadmapId,
          );
          if (success) {
            closeModal(true);
            return;
          }
          setErrorMessage(
            `Unable to swap ${titleCase(
              name,
            )} OAuth token. Please contact an administrator if the problem persists.`,
          );
        } catch (err) {
          setErrorMessage(t('Internal server error'));
        }
        setIsLoading(false);
      };
      swapToken();
    }
  };

  const onOAuthVerifierCodeChange = (oauthVerifierCode: string) => {
    setFormValues({ ...formValues, oauthVerifierCode });
  };

  const modalBody = () => {
    if (isLoading || !oauthURL) return <LoadingSpinner />;
    if (errorMessage) return null;
    return (
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
          <Input
            autoComplete="off"
            required
            name="oauthVerifierCode"
            id="oauthVerifierCode"
            placeholder={t('OAuth verifier code')}
            value={formValues.oauthVerifierCode}
            onChange={(e) => onOAuthVerifierCodeChange(e.currentTarget.value)}
          />
        </Form.Group>
      </>
    );
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <ModalHeader closeModal={closeModal}>
          <h3>
            <Trans i18nKey="Setup OAuth for" /> {titleCase(name)}
          </h3>
        </ModalHeader>
        <ModalContent>
          {modalBody()}
          <Alert show={errorMessage.length > 0} variant="danger">
            {errorMessage}
          </Alert>
        </ModalContent>
        <ModalFooter>
          <ModalFooterButtonDiv>
            <button
              className="button-large cancel"
              onClick={() => closeModal()}
              type="button"
            >
              <Trans i18nKey="Cancel" />
            </button>
          </ModalFooterButtonDiv>
          <ModalFooterButtonDiv>
            {!errorMessage && formValues.oauthVerifierCode && !isLoading ? (
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
