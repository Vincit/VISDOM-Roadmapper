import React, { useState } from 'react';
import assert from 'assert';
import { withStyles } from '@material-ui/core/styles';
import { Alert } from 'react-bootstrap';
import classNames from 'classnames';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import Checkbox from '@material-ui/core/Checkbox';
import { Link, useHistory } from 'react-router-dom';
import { userActions } from '../redux/user';
import { ModalContent } from '../components/modals/modalparts/ModalContent';
import { ModalHeader } from '../components/modals/modalparts/ModalHeader';
import { Footer } from '../components/Footer';
import { Input, FieldProps, errorState } from '../components/forms/FormField';
import { paths } from '../routers/paths';
import { StoreDispatchType } from '../redux';
import css from './RegisterPage.module.scss';
import colors from '../colors.module.scss';

const classes = classNames.bind(css);

export const RegisterPage = () => {
  const dispatch = useDispatch<StoreDispatchType>();
  const history = useHistory();
  const { t } = useTranslation();
  const [formValues, setFormValues] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [checked, setChecked] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fields: { [K in FormFieldName]: FieldProps<HTMLInputElement> } = {
    username: {
      label: t('Your name'),
      placeholder: t('Your name'),
      maxLength: 255,
      error: errorState(useState('')),
    },
    email: {
      label: t('Your email'),
      placeholder: t('Example email'),
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

  const errorHandler = (
    type: string | undefined,
    data?: {
      message: string;
      columns: string[] | { column: string; message: string }[];
    },
  ) => {
    switch (type) {
      case 'UniqueViolationError': {
        const cols = data!.columns as string[];
        cols.forEach((column) => {
          setError(column, t('uniqueViolation', { field: t(column) }));
        });
        break;
      }
      case 'ValidationError': {
        const cols = data!.columns as { column: string; message: string }[];
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!checked) return setErrorMessage(t('Terms of use error'));
    if (formValues.password !== formValues.confirmPassword) {
      setError('confirmPassword', t('Password confirmation error'));
      return;
    }

    const res = await dispatch(
      userActions.register({
        username: formValues.username,
        email: formValues.email,
        password: formValues.password,
      }),
    );
    if (userActions.register.rejected.match(res)) {
      const data = res.payload?.response?.data;
      errorHandler(data?.error, data);
    } else if (userActions.register.fulfilled.match(res)) {
      history.push('/login');
    }
  };

  const EmeraldCheckBox = withStyles({
    root: {
      color: '#DADADA',
      '&$checked': {
        color: colors.emerald,
      },
    },
    checked: {},
  })((props) => (
    <Checkbox
      color="default"
      checked={checked}
      onChange={(event) => setChecked(event.target.checked)}
      {...props}
    />
  ));

  return (
    <>
      <div className={classes(css.formDiv)}>
        <ModalHeader>
          <Trans i18nKey="New here?" />
        </ModalHeader>
        <ModalContent>
          <div className={classes(css.about)}>
            <Trans i18nKey="Please fill out some info about you." />
          </div>
          <form onSubmit={handleSubmit}>
            {Object.entries(fields).map(([name, props]) => {
              assert(knownField(name), `invalid field: ${name}`);
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
              <EmeraldCheckBox />
              <Trans i18nKey="Terms of use">
                I agree to the <Link to="/terms">terms of use</Link> and{' '}
                <Link to="/privacy">privacy policy</Link>
              </Trans>
            </div>

            <Alert
              show={errorMessage.length > 0}
              variant="danger"
              dismissible
              onClose={() => setErrorMessage('')}
            >
              {errorMessage}
            </Alert>

            <button className={classes(css['button-large'])} type="submit">
              <Trans i18nKey="Create account" />
            </button>
          </form>
          <div className={classes(css.registerFooter)}>
            <Trans i18nKey="Already have an account?" />{' '}
            <Link to={paths.loginPage}>
              <Trans i18nKey="Log in" />
            </Link>
          </div>
        </ModalContent>
      </div>
      <Footer />
    </>
  );
};
