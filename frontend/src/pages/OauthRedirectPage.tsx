import { Redirect, useParams } from 'react-router-dom';

export const OauthRedirectPage = () => {
  const { code, roadmapId, integration } = useParams<{
    code: string;
    roadmapId: string;
    integration: string;
  }>();
  return (
    <Redirect
      to={`roadmap/${roadmapId}/configure?openModal=SETUP_OAUTH_MODAL&modalProps=%7B%22name%22%3A%22${integration}%22%2C%22roadmapId%22%3A${roadmapId}%2C%22code%22%3A%22${code}%22%7D`}
    />
  );
};
