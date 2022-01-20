import { FormEvent, useEffect, useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { useDispatch, shallowEqual, useSelector } from 'react-redux';
import { StoreDispatchType } from '../../redux';
import { RootState } from '../../redux/types';
import { roadmapsActions } from '../../redux/roadmaps';
import { allCustomersSelector } from '../../redux/roadmaps/selectors';
import { RoleType, Permission } from '../../../../shared/types/customTypes';
import { ModalTypes, Modal } from './types';
import { LoadingSpinner } from '../LoadingSpinner';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import {
  SelectMemberRole,
  AddTeamMemberInfo,
  SelectCustomers,
} from './modalparts/TeamMemberModalParts';
import { Input } from '../forms/FormField';
import css from './AddTeamMemberModal.module.scss';
import { CheckableCustomer, Customer } from '../../redux/roadmaps/types';
import { getCheckedIds } from '../../utils/CustomerUtils';
import { hasPermission } from '../../../../shared/utils/permission';

const classes = classNames.bind(css);

export const AddTeamMemberModal: Modal<ModalTypes.ADD_TEAM_MEMBER_MODAL> = ({
  closeModal,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<StoreDispatchType>();
  const roadmapCustomers = useSelector<RootState, Customer[] | undefined>(
    allCustomersSelector,
    shallowEqual,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [openInfo, setOpenInfo] = useState(true);
  const [formValues, setFormValues] = useState({
    type: RoleType.Developer,
    email: '',
  });
  const [customers, setCustomers] = useState<CheckableCustomer[]>([]);
  const [hasRepresentPermission, setHasRepresentPermission] = useState(false);

  useEffect(() => {
    if (roadmapCustomers)
      setCustomers(roadmapCustomers.map((obj) => ({ ...obj, checked: false })));
  }, [roadmapCustomers]);

  useEffect(() => {
    if (!roadmapCustomers) dispatch(roadmapsActions.getCustomers());
  }, [dispatch, roadmapCustomers]);

  useEffect(() => {
    setHasRepresentPermission(
      hasPermission(formValues.type, Permission.CustomerRepresent),
    );
  }, [formValues.type]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    setIsLoading(true);
    const res = await dispatch(
      roadmapsActions.sendInvitation({
        email: formValues.email,
        type: formValues.type,
        ...(hasRepresentPermission && {
          representativeFor: getCheckedIds(customers),
        }),
      }),
    );
    setIsLoading(false);
    if (roadmapsActions.sendInvitation.rejected.match(res)) {
      if (res.payload?.response?.data.errors)
        setErrorMessage(res.payload?.response?.data.errors);
      else if (res.payload?.message) setErrorMessage(res.payload.message);

      return;
    }
    dispatch(roadmapsActions.getInvitations());
    closeModal();
  };

  return (
    <Form onSubmit={handleSubmit}>
      <ModalHeader closeModal={closeModal}>
        <h3>
          <Trans i18nKey="Add a team member" />
        </h3>
      </ModalHeader>
      <ModalContent>
        <div className={classes(css.addMemberContent)}>
          <AddTeamMemberInfo open={openInfo} onChange={setOpenInfo} />
          <div>
            <SelectMemberRole
              role={formValues.type}
              onChange={(role) => setFormValues({ ...formValues, type: role })}
            />
          </div>
          {hasRepresentPermission && (
            <SelectCustomers
              customers={customers}
              onCustomerChange={(idx, checked) => {
                if (idx >= 0 && idx < customers.length) {
                  const copy = [...customers];
                  copy[idx].checked = checked;
                  setCustomers(copy);
                }
              }}
            />
          )}
          <div className={classes(css.sendEmailContent)}>
            <div className={classes(css.inputContainer)}>
              <Input
                label={t('Member email the link will be sent to')}
                placeholder={t('Example email', { localPart: 'teammember' })}
                name="send link"
                type="email"
                value={formValues.email}
                onChange={(e) =>
                  setFormValues({ ...formValues, email: e.currentTarget.value })
                }
              />
            </div>
          </div>
        </div>
        <Alert
          show={errorMessage.length > 0}
          variant="danger"
          dismissible
          onClose={() => setErrorMessage('')}
        >
          {errorMessage}
        </Alert>
      </ModalContent>
      <ModalFooter closeModal={closeModal}>
        <ModalFooterButtonDiv>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <button
              className="button-large"
              type="submit"
              disabled={!formValues.email}
            >
              <Trans i18nKey="Send link" />
            </button>
          )}
        </ModalFooterButtonDiv>
      </ModalFooter>
    </Form>
  );
};
