import { useState, useEffect } from 'react';
import { Trans } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { StoreDispatchType } from '../redux';
import { userActions } from '../redux/user';
import { paths } from '../routers/paths';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ModalContent } from '../components/modals/modalparts/ModalContent';
import { ModalHeader } from '../components/modals/modalparts/ModalHeader';
import { Footer } from '../components/Footer';
import '../shared.scss';

export const NotFoundPage = () => {
  const dispatch = useDispatch<StoreDispatchType>();
  const history = useHistory();
  const [loadedUserInfo, setLoadedUserInfo] = useState(false);

  useEffect(() => {
    if (!loadedUserInfo)
      dispatch(userActions.getUserInfo()).then(() => setLoadedUserInfo(true));
  }, [dispatch, loadedUserInfo]);

  if (!loadedUserInfo) return <LoadingSpinner />;
  return (
    <>
      <div className="formDiv">
        <ModalHeader>
          <h2>
            <Trans i18nKey="Oops" />
          </h2>
        </ModalHeader>
        <ModalContent gap={50}>
          <div className="formSubtitle">
            <Trans i18nKey="Page not found description 1/2" />
          </div>
          <Trans i18nKey="Page not found description 2/2" />
          <button
            className="button-large"
            type="submit"
            tabIndex={0}
            onClick={() => history.push(paths.home)}
          >
            <Trans i18nKey="Go to Homepage" />
          </button>
          <div className="formFooter">
            <Trans i18nKey="Problems with Roadmapper?" />{' '}
            <a href="mailto:visdom@vincit.fi">
              <Trans i18nKey="Contact us" />
            </a>
          </div>
        </ModalContent>
      </div>
      <Footer />
    </>
  );
};
