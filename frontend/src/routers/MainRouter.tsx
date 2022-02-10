import { useEffect } from 'react';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/types';
import { UserInfo } from '../redux/user/types';
import { userInfoSelector } from '../redux/user/selectors';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals';
import { ModalTypes } from '../components/modals/types';
import { NavLayout } from '../components/NavLayout';
import { HomePage } from '../pages/HomePage';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { LogoutPage } from '../pages/LogoutPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ProjectOverviewPage } from '../pages/ProjectOverviewPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { UserInfoPage } from '../pages/UserInfoPage';
import { paths } from './paths';
import { RoadmapRouter } from './RoadmapRouter';
import { CreateProjectPage } from '../pages/CreateProjectPage';
import { JoinRoadmapPage } from '../pages/JoinRoadmapPage';
import {
  VerifyEmailPage,
  EmailVerificationPage,
} from '../pages/VerifyEmailPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { ResetPasswordEmail } from '../components/emails/ResetPasswordEmail';

const Home = () => {
  const loggedInUser = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  return loggedInUser ? <NavLayout Content={HomePage} /> : <LandingPage />;
};

const routes = [
  {
    path: paths.loginPage,
    component: () => <NavLayout Content={LoginPage} />,
    exact: false,
  },
  {
    path: paths.logoutPage,
    component: () => <NavLayout Content={LogoutPage} />,
    exact: false,
  },
  {
    path: paths.registerPage,
    component: () => <NavLayout Content={RegisterPage} />,
    exact: false,
  },
  {
    path: paths.getStarted,
    component: () => <NavLayout Content={CreateProjectPage} />,
    exact: false,
  },
  {
    path: paths.joinRoadmap,
    component: () => <NavLayout Content={JoinRoadmapPage} />,
    exact: false,
  },
  {
    path: paths.emailVerification,
    component: () => <NavLayout Content={EmailVerificationPage} />,
    exact: false,
  },
  {
    path: paths.verifyEmail,
    component: () => <NavLayout Content={VerifyEmailPage} />,
    exact: false,
  },
  {
    path: paths.userInfo,
    component: () => <NavLayout Content={UserInfoPage} />,
    exact: false,
  },
  {
    path: paths.overview,
    component: () => <NavLayout Content={ProjectOverviewPage} />,
    exact: false,
  },
  {
    path: paths.roadmapRouter,
    component: () => <NavLayout Content={RoadmapRouter} />,
    exact: false,
  },
  {
    path: paths.home,
    component: () => <Home />,
    exact: true,
  },
  {
    path: paths.notFound,
    component: () => <NavLayout Content={NotFoundPage} />,
    exact: true,
  },
  {
    path: paths.forgotPassword,
    component: () => <NavLayout Content={ForgotPasswordPage} />,
    exact: true,
  },
  {
    path: paths.resetPassword,
    component: () => <NavLayout Content={ResetPasswordPage} />,
    exact: false,
  },
  {
    path: paths.emailTest1,
    component: () => <NavLayout Content={ResetPasswordEmail} />,
    exact: false,
  },
  {
    path: '',
    component: () => <Redirect to={paths.notFound} />,
    exact: false,
  },
];

export const MainRouter = () => {
  const query = new URLSearchParams(useLocation().search);
  const dispatch = useDispatch<StoreDispatchType>();

  // Parse query params
  let queryModal = query.get('openModal');
  if (
    !queryModal ||
    !Object.values(ModalTypes).includes(queryModal as ModalTypes)
  ) {
    queryModal = null;
  }
  let queryProps = query.get('modalProps');
  try {
    queryProps = JSON.parse(queryProps!);
  } catch (e) {
    queryProps = null;
  }

  useEffect(() => {
    // Open modals for corresponding query params
    if (!queryModal) return;
    if (!queryProps) return;

    dispatch(
      modalsActions.showModal({
        modalType: queryModal as ModalTypes,
        modalProps: queryProps as any,
      }),
    );
  }, [queryModal, queryProps, dispatch]);

  return (
    <>
      <Switch>
        {routes.map((route) => (
          <Route
            exact={route.exact}
            key={route.path}
            path={route.path}
            component={route.component}
          />
        ))}
      </Switch>
    </>
  );
};
