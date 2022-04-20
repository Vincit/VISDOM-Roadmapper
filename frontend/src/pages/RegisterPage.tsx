import { FormEvent, useState } from 'react';
import Alert from '@mui/material/Alert';
import classNames from 'classnames';
import { Trans, useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, Redirect, matchPath } from 'react-router-dom';
import { userActions } from '../redux/user';
import { ModalContent } from '../components/modals/modalparts/ModalContent';
import { ModalHeader } from '../components/modals/modalparts/ModalHeader';
import { Footer } from '../components/Footer';
import { Input, FieldProps, errorState } from '../components/forms/FormField';
import { Checkbox } from '../components/forms/Checkbox';
import { paths } from '../routers/paths';
import { StoreDispatchType } from '../redux';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import css from './RegisterPage.module.scss';

const classes = classNames.bind(css);

export const RegisterPage = () => {
  const dispatch = useDispatch<StoreDispatchType>();
  const urlSearchString = useLocation().search;
  const queryParams = new URLSearchParams(urlSearchString);
  const { t } = useTranslation();
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );

  const [checked, setChecked] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fields: { [K in FormFieldName]: FieldProps<HTMLInputElement> } = {
    email: {
      label: t('Your email'),
      placeholder: t('Example email', { localPart: 'email' }),
      maxLength: 255,
      autoComplete: 'off',
      type: 'email',
      error: errorState(useState('')),
    },
    password: {
      label: t('Password'),
      placeholder: '-',
      type: 'password',
      autoComplete: 'new-password',
      minLength: 8,
      maxLength: 72,
      error: errorState(useState('')),
    },
    confirmPassword: {
      label: t('Confirm password'),
      placeholder: '-',
      type: 'password',
      autoComplete: 'confirm-password',
      minLength: 8,
      maxLength: 72,
      error: errorState(useState('')),
    },
  };

  type FormFieldName = keyof typeof formValues;

  const knownField = (value: any): value is FormFieldName =>
    value in formValues;

  const setError = (column: string, message: string) => {
    if (knownField(column)) {
      fields[column].error!.setMessage(message);
    } else {
      setErrorMessage(message);
    }
  };

  const errorHandler = (data?: {
    error?: string;
    message: string;
    columns: string[] | { column: string; message: string }[];
  }) => {
    switch (data?.error) {
      case 'UniqueViolationError': {
        const cols = data.columns as string[];
        cols.forEach((column) => {
          setError(column, t('uniqueViolation', { field: t(column) }));
        });
        break;
      }
      case 'ValidationError': {
        const cols = data.columns as { column: string; message: string }[];
        cols.forEach(({ column }) => {
          setError(column, t('validationError', { field: t(column) }));
        });
        break;
      }
      default:
        setErrorMessage(t('Internal server error.'));
        break;
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!checked) return setErrorMessage(t('Terms of use error'));
    if (formValues.password !== formValues.confirmPassword) {
      setError('confirmPassword', t('Password confirmation error'));
      return;
    }

    const res = await dispatch(
      userActions.register({
        email: formValues.email,
        password: formValues.password,
      }),
    );
    if (userActions.register.rejected.match(res)) {
      errorHandler(res.payload?.response?.data);
    }
  };

  return (
    <>
      {userInfo && (
        <Redirect
          to={
            matchPath(queryParams.get('redirectTo') || '', {
              path: paths.joinRoadmap,
            })
              ? queryParams.get('redirectTo')!
              : paths.home
          }
        />
      )}
      <div className={classes(css.formDiv)}>
        <ModalHeader>
          <h2>
            <Trans i18nKey="New here?" />
          </h2>
        </ModalHeader>
        <ModalContent gap={50}>
          <div className={classes(css.formSubtitle)}>
            <Trans i18nKey="Please fill out some info about you" />
          </div>
          <form onSubmit={handleSubmit}>
            {Object.entries(fields).map(([name, props]) => {
              if (!knownField(name)) throw new Error(`invalid field: ${name}`);
              return (
                <Input
                  {...props}
                  key={name}
                  id={name}
                  required
                  value={formValues[name]}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      [name]: e.currentTarget.value,
                    })
                  }
                />
              );
            })}

            <div className={classes(css.termsLabel)}>
              <Checkbox
                checked={checked}
                onChange={(changed) => setChecked(changed)}
              />
              <Trans i18nKey="Terms of use">
                I agree to the <Link to="/terms">terms of use</Link> and{' '}
                <Link to="/privacy">privacy policy</Link>
              </Trans>
            </div>

            {errorMessage.length > 0 && (
              <Alert
                severity="error"
                onClose={() => setErrorMessage('')}
                icon={false}
              >
                {errorMessage}
              </Alert>
            )}

            <button className={classes(css['button-large'])} type="submit">
              <Trans i18nKey="Create account" />
            </button>
          </form>
          <div className={classes(css.formFooter)}>
            <Trans i18nKey="Already have an account?" />{' '}
            <Link to={`${paths.loginPage}${urlSearchString}`}>
              <Trans i18nKey="Log in" />
            </Link>
          </div>
        </ModalContent>
      </div>
      <Footer />
    </>
  );
};
