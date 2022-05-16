import React from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import { modalLink, ModalTypes } from '../components/modals/types';

const useQuery = () => {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
};

export const OauthRedirectPage = () => {
  const query = useQuery();
  return (
    <Redirect
      to={`/roadmap/${query.get('roadmapId')}/configure${modalLink(
        ModalTypes.SETUP_OAUTH_MODAL,
        {
          name: query.get('integrationName')!,
          roadmapId: +query.get('roadmapId')!,
          code: query.get('code')!,
        },
      )}`}
    />
  );
};
