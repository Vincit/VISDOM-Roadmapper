import React, { useState, useEffect } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { StoreDispatchType } from '../../redux';
import { roadmapsActions } from '../../redux/roadmaps';
import { userActions } from '../../redux/user';
import {
  allCustomersSelector,
  roadmapUsersSelector,
} from '../../redux/roadmaps/selectors';
import {
  RoadmapUser,
  Customer,
  CheckableUser,
} from '../../redux/roadmaps/types';
import { RoleType } from '../../../../shared/types/customTypes';
import { RootState } from '../../redux/types';
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

export const EditCustomerModal: Modal<ModalTypes.EDIT_CUSTOMER_MODAL> = ({
  closeModal,
  customer,
}) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const customers = useSelector<RootState, Customer[] | undefined>(
    allCustomersSelector,
    shallowEqual,
  );
  const roadmapUsers = useSelector<RootState, RoadmapUser[] | undefined>(
    roadmapUsersSelector,
    shallowEqual,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [colorType, setColorType] = useState('pick');
  const [formValues, setFormValues] = useState({
    name: customer.name,
    email: customer.email,
    color: customer.color,
  });
  const [representatives, setRepresentatives] = useState<CheckableUser[]>([]);

  useEffect(() => {
    if (!roadmapUsers) return;
    setRepresentatives(
      roadmapUsers
        ?.filter(
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

  useEffect(() => {
    if (!roadmapUsers) dispatch(roadmapsActions.getRoadmapUsers());
  }, [dispatch, roadmapUsers]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsLoading(true);

    const res = await dispatch(
      roadmapsActions.patchCustomer({
        id: customer.id,
        name: formValues.name,
        email: formValues.email,
        color: colorType === 'pick' ? formValues.color : randomColor(customers),
        representatives: getCheckedIds(representatives),
      }),
    );
    setIsLoading(false);
    if (roadmapsActions.patchCustomer.rejected.match(res)) {
      if (res.payload?.message) setErrorMessage(res.payload.message);
      return;
    }
    closeModal();
    await dispatch(userActions.getUserInfo());
  };

  return (
    <>
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
            onEmailChange={(value) =>
              setFormValues({ ...formValues, email: value })
            }
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
              const copy = [...(representatives ?? [])];
              if (!copy) return;
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
        <ModalFooter>
          <ModalFooterButtonDiv>
            <button
              className="button-large cancel"
              onClick={closeModal}
              type="button"
            >
              <Trans i18nKey="Cancel" />
            </button>
          </ModalFooterButtonDiv>
          <ModalFooterButtonDiv>
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <button
                className="button-large"
                type="submit"
                disabled={
                  !formValues.name ||
                  !formValues.email ||
                  !getCheckedIds(representatives).length
                }
              >
                <Trans i18nKey="Confirm" />
              </button>
            )}
          </ModalFooterButtonDiv>
        </ModalFooter>
      </Form>
    </>
  );
};
