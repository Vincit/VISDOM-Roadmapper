import React from 'react';
import { Redirect, useLocation } from 'react-router-dom';

const useQuery = () => {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
};

export const OauthRedirectPage = () => {
  const query = useQuery();
  return (
    <Redirect
      to={`/roadmap/${query.get(
        'roadmapId',
      )}/configure?openModal=SETUP_OAUTH_MODAL&modalProps=%7B%22name%22%3A%22${query.get(
        'integrationName',
      )}%22%2C%22roadmapId%22%3A${query.get(
        'roadmapId',
      )}%2C%22code%22%3A%22${query.get('code')}%22%7D`}
    />
  );
};
