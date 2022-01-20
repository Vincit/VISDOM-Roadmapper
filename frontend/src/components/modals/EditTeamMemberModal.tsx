import { FormEvent, useState, useEffect } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans } from 'react-i18next';
import classNames from 'classnames';
import { useDispatch, shallowEqual, useSelector } from 'react-redux';
import BuildSharpIcon from '@material-ui/icons/BuildSharp';
import StarSharpIcon from '@material-ui/icons/StarSharp';
import { BusinessIcon } from '../RoleIcons';
import { StoreDispatchType } from '../../redux';
import { RootState } from '../../redux/types';
import { roadmapsActions } from '../../redux/roadmaps';
import { allCustomersSelector } from '../../redux/roadmaps/selectors';
import {
  CheckableCustomer,
  Customer,
  Invitation,
  RoadmapUser,
} from '../../redux/roadmaps/types';
import { RoleType, Permission } from '../../../../shared/types/customTypes';
import { LoadingSpinner } from '../LoadingSpinner';
import { Modal, ModalTypes } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import {
  SelectMemberRole,
  SelectCustomers,
} from './modalparts/TeamMemberModalParts';
import { getCheckedIds } from '../../utils/CustomerUtils';
import { hasPermission } from '../../../../shared/utils/permission';
import css from './EditTeamMemberModal.module.scss';

const isInvitation = (member: Invitation | RoadmapUser): member is Invitation =>
  'updatedAt' in member;

const classes = classNames.bind(css);

export const EditTeamMemberModal: Modal<ModalTypes.EDIT_TEAM_MEMBER_MODAL> = ({
  closeModal,
  member,
}) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const roadmapCustomers = useSelector<RootState, Customer[] | undefined>(
    allCustomersSelector,
    shallowEqual,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState(member.type);
  const [customers, setCustomers] = useState<CheckableCustomer[]>([]);
  const [hasRepresentPermission, setHasRepresentPermission] = useState(false);
  const memberIsInvitation = isInvitation(member);

  useEffect(() => {
    if (!roadmapCustomers || !isInvitation(member)) return;
    const represented = member.representativeFor.map(({ id }) => id);
    setCustomers(
      roadmapCustomers.map((customer) => ({
        ...customer,
        checked: represented.includes(customer.id),
      })),
    );
  }, [member, roadmapCustomers]);

  useEffect(() => {
    if (!roadmapCustomers) dispatch(roadmapsActions.getCustomers());
  }, [dispatch, roadmapCustomers]);

  useEffect(() => {
    setHasRepresentPermission(
      hasPermission(selectedRole, Permission.CustomerRepresent),
    );
  }, [selectedRole]);

  const editInvitation = async () => {
    const res = await dispatch(
      roadmapsActions.patchInvitation({
        id: member.id as string,
        type: selectedRole,
        ...(hasRepresentPermission && {
          representativeFor: getCheckedIds(customers),
        }),
      }),
    );
    if (roadmapsActions.patchInvitation.rejected.match(res))
      if (res.payload?.message) return res.payload.message;
  };

  const editTeamMember = async () => {
    if (member.type === selectedRole) return;

    const res = await dispatch(
      roadmapsActions.patchRoadmapUser({
        id: member.id as number,
        type: selectedRole,
      }),
    );
    if (roadmapsActions.patchRoadmapUser.rejected.match(res))
      if (res.payload?.message) return res.payload.message;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    setIsLoading(true);
    const error = memberIsInvitation
      ? await editInvitation()
      : await editTeamMember();
    setIsLoading(false);

    if (error) setErrorMessage(error);
    else closeModal();
  };

  return (
    <Form onSubmit={handleSubmit}>
      <ModalHeader closeModal={closeModal}>
        <h3>
          {memberIsInvitation ? (
            <Trans i18nKey="Modify invitation" />
          ) : (
            <Trans i18nKey="Modify team members" />
          )}
        </h3>
      </ModalHeader>
      <ModalContent>
        <div className={classes(css.section, css.memberSection)}>
          {selectedRole === RoleType.Admin && <StarSharpIcon />}
          {selectedRole === RoleType.Developer && <BuildSharpIcon />}
          {selectedRole === RoleType.Business && <BusinessIcon />}
          {member.email}
        </div>
        <div className={classes(css.section)}>
          <SelectMemberRole
            role={selectedRole}
            onChange={(value) => setSelectedRole(value)}
            disableRoleIcons
          />
        </div>
        {memberIsInvitation && hasRepresentPermission && (
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
            <button className="button-large" type="submit">
              <Trans i18nKey="Confirm" />
            </button>
          )}
        </ModalFooterButtonDiv>
      </ModalFooter>
    </Form>
  );
};
