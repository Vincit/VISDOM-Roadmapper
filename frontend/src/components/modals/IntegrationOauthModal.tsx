import { FormEvent, useEffect, useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import { api, apiV2, selectById } from '../../api/api';
import { LoadingSpinner } from '../LoadingSpinner';
import { Modal, ModalTypes } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
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
  const [retry, setRetry] = useState(0);
  const { data: roadmap } = apiV2.useGetRoadmapsQuery(
    undefined,
    selectById(roadmapId),
  );
  const currentConfiguration = roadmap?.integrations.find(
    (it) => it.name === name,
  );

  const [formValues, setFormValues] = useState({
    token: '',
    tokenSecret: '',
    oauthVerifierCode: '',
  });

  useEffect(() => {
    if (!currentConfiguration) {
      setErrorMessage(
        t('Missing configuration error', { name: titleCase(name) }),
      );
      return;
    }
    const getOAuthURL = async () => {
      try {
        const response = await api.getIntegrationOauthURL(name, roadmapId);
        const { url, token, tokenSecret } = response;
        setFormValues({
          oauthVerifierCode: '',
          token,
          tokenSecret,
        });
        setOAuthURL(url);
        setErrorMessage('');
      } catch {
        setErrorMessage(t('Oauth url query error', { name: titleCase(name) }));
      }
    };

    getOAuthURL();
  }, [currentConfiguration, roadmapId, name, retry, t]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
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
            t('Oauth token swap error', { name: titleCase(name) }),
          );
        } catch (err: any) {
          setErrorMessage(
            err.response?.data?.errors ?? t('Internal server error'),
          );
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
        <label htmlFor="board">{t('OAuth URL')}</label>
        <p>
          <Trans i18nKey="Oauth authorization link">
            Please visit{' '}
            <a
              href={oauthURL.toString()}
              target="_blank"
              rel="noopener noreferrer"
            >
              this URL
            </a>{' '}
            and input the code below:
          </Trans>
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

  const submitOrRetryButton = () => {
    if (!formValues.oauthVerifierCode || isLoading) return null;
    if (errorMessage) {
      return (
        <button
          className="button-large cancel"
          type="button"
          onClick={() => setRetry(retry + 1)}
        >
          <Trans i18nKey="Retry" />
        </button>
      );
    }
    return (
      <button className="button-large" type="submit">
        <Trans i18nKey="Save" />
      </button>
    );
  };

  return (
    <Form onSubmit={handleSubmit}>
      <ModalHeader closeModal={closeModal}>
        <h3>{t('Setup OAuth for', { name: titleCase(name) })}</h3>
      </ModalHeader>
      <ModalContent>
        {modalBody()}
        <Alert show={errorMessage.length > 0} variant="danger">
          {errorMessage}
        </Alert>
      </ModalContent>
      <ModalFooter closeModal={closeModal}>
        <ModalFooterButtonDiv>{submitOrRetryButton()}</ModalFooterButtonDiv>
      </ModalFooter>
    </Form>
  );
};
