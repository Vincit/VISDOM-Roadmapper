import { FormEvent, useState, useEffect } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { StoreDispatchType } from '../../redux';
import { userActions } from '../../redux/user';
import { chosenRoadmapIdSelector } from '../../redux/roadmaps/selectors';
import { CheckableUser } from '../../redux/roadmaps/types';
import { RoleType } from '../../../../shared/types/customTypes';
import { LoadingSpinner } from '../LoadingSpinner';
import { Modal, ModalTypes } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import '../../shared.scss';
import { randomColor, getCheckedIds } from '../../utils/CustomerUtils';
import {
  SelectCustomerInfo,
  SelectRepresentatives,
} from './modalparts/CustomerModalParts';
import { apiV2 } from '../../api/api';

export const EditCustomerModal: Modal<ModalTypes.EDIT_CUSTOMER_MODAL> = ({
  closeModal,
  customer,
}) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const { data: roadmapUsers } = apiV2.useGetRoadmapUsersQuery(
    roadmapId ?? skipToken,
  );
  const { data: customers } = apiV2.useGetCustomersQuery(
    roadmapId ?? skipToken,
  );
  const [
    patchCustomerTrigger,
    patchCustomerStatus,
  ] = apiV2.usePatchCustomerMutation();
  const [errorMessage, setErrorMessage] = useState('');
  const [colorType, setColorType] = useState('pick');
  const [formValues, setFormValues] = useState({
    name: customer.name,
    email: customer.email,
    color: customer.color,
  });
  const [representatives, setRepresentatives] = useState<CheckableUser[]>([]);
  const [validEmail, setValidEmail] = useState(true);

  useEffect(() => {
    if (patchCustomerStatus.isError) {
      setErrorMessage(
        (patchCustomerStatus.error as any)?.data?.message ||
          'something went wrong',
      );
    } else if (patchCustomerStatus.isSuccess) {
      dispatch(userActions.getUserInfo());
      closeModal();
    }
  }, [closeModal, patchCustomerStatus, dispatch]);

  useEffect(() => {
    if (!roadmapUsers) return;
    setRepresentatives(
      roadmapUsers
        .filter(
          (user) =>
            user.type === RoleType.Admin || user.type === RoleType.Business,
        )
        .map((obj) =>
          customer.representatives?.find((rep) => rep.id === obj.id)
            ? { ...obj, checked: true }
            : { ...obj, checked: false },
        ),
    );
  }, [roadmapUsers, customer.representatives]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (roadmapId === undefined) return;
    patchCustomerTrigger({
      roadmapId,
      customer: {
        id: customer.id,
        name: formValues.name,
        email: formValues.email,
        color: colorType === 'pick' ? formValues.color : randomColor(customers),
        representatives: getCheckedIds(representatives),
      },
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <ModalHeader closeModal={closeModal}>
        <h3>
          <Trans i18nKey="Modify client information" />
        </h3>
      </ModalHeader>
      <ModalContent>
        <SelectCustomerInfo
          name={formValues.name}
          onNameChange={(value) =>
            setFormValues({ ...formValues, name: value })
          }
          email={formValues.email}
          onEmailChange={(value, valid) => {
            setFormValues({ ...formValues, email: value });
            setValidEmail(valid);
          }}
          colorType={colorType}
          onColorTypeChange={(value) => setColorType(value)}
          color={formValues.color}
          onColorChange={(value) =>
            setFormValues({ ...formValues, color: value })
          }
        />
        <SelectRepresentatives
          representatives={representatives}
          onRepresentativeChange={(idx, checked) => {
            const copy = [...representatives];
            copy[idx].checked = checked;
            setRepresentatives(copy);
          }}
        />
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
          {patchCustomerStatus.isLoading ? (
            <LoadingSpinner />
          ) : (
            <button
              className="button-large"
              type="submit"
              disabled={
                !formValues.name ||
                !validEmail ||
                !getCheckedIds(representatives).length
              }
            >
              <Trans i18nKey="Confirm" />
            </button>
          )}
        </ModalFooterButtonDiv>
      </ModalFooter>
    </Form>
  );
};
