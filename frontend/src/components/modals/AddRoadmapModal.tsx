import { useState, FC } from 'react';
import classNames from 'classnames';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { StoreDispatchType } from '../../redux';
import { RootState } from '../../redux/types';
import {
  InviteRoadmapUser,
  RoadmapCreationCustomer,
} from '../../redux/roadmaps/types';
import { userActions } from '../../redux/user';
import { UserInfo } from '../../redux/user/types';
import { userInfoSelector } from '../../redux/user/selectors';
import { Modal, ModalTypes } from './types';
import { StepForm } from '../forms/StepForm';
import { Input, TextArea } from '../forms/FormField';
import { AddButton } from '../forms/AddButton';
import { paths } from '../../routers/paths';
import { SummaryStepContent } from './modalparts/SummaryStepContent';
import {
  AddTeamMemberInfo,
  DisplayInvitedMember,
  AddOrModifyMember,
  SkipPeopleAddition,
  isInviteUser,
} from './modalparts/TeamMemberModalParts';
import { AddOrModifyCustomer } from './modalparts/CustomerModalParts';
import { Permission, RoleType } from '../../../../shared/types/customTypes';
import css from './AddRoadmapModal.module.scss';
import { apiV2 } from '../../api/api';
import { hasPermission } from '../../../../shared/utils/permission';

const classes = classNames.bind(css);

const removeRepresentative = (
  customers: RoadmapCreationCustomer[],
  member: InviteRoadmapUser,
) =>
  customers.map((customer) => ({
    ...customer,
    representatives: customer.representatives.filter(
      ({ email }) => email !== member.email,
    ),
  }));

const getKey = (person: InviteRoadmapUser | RoadmapCreationCustomer) =>
  isInviteUser(person) ? person.email : `${person.name}@${person.email}`;

const AddPeopleList: FC<{
  type: 'member' | 'client';
  people: InviteRoadmapUser[] | RoadmapCreationCustomer[];
  onAdd: () => void;
  onEdit: (person: RoadmapCreationCustomer | InviteRoadmapUser) => void;
  onDelete: (person: InviteRoadmapUser | RoadmapCreationCustomer) => void;
}> = ({ type, people, onAdd, onEdit, onDelete }) => (
  <>
    <div className={classes({ [css.people]: people.length > 0 })}>
      {people.map((person) => (
        <DisplayInvitedMember
          key={getKey(person)}
          member={person}
          onDelete={() => onDelete(person)}
          onEdit={() => onEdit(person)}
        />
      ))}
    </div>
    <div
      className={classes(css.addButton, {
        [css.bottomItem]: people.length > 0,
      })}
    >
      <AddButton onClick={() => onAdd()}>
        <Trans i18nKey={`Add ${type}`} />
      </AddButton>
    </div>
  </>
);

const DisplayPeople: FC<{
  type: 'members' | 'clients';
  people: InviteRoadmapUser[] | RoadmapCreationCustomer[];
}> = ({ type, people }) => (
  <>
    <div className={classes(css.summaryItem)}>
      <Trans i18nKey={`${type} summary`} />
      {people.length === 0 && '-'}
    </div>
    <div className={classes(css.summaryList)}>
      {people.map((person) => (
        <DisplayInvitedMember key={getKey(person)} member={person} readonly />
      ))}
    </div>
  </>
);

export const AddRoadmapModal: Modal<ModalTypes.ADD_ROADMAP_MODAL> = ({
  closeModal,
}) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const { t } = useTranslation();
  const history = useHistory();
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  )!;
  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
  });
  const [members, setMembers] = useState<InviteRoadmapUser[]>([]);
  const [open, setOpen] = useState({
    info: true,
    tooltip: false,
    addMember: false,
    addCustomer: false,
  });
  const [editMember, setEditMember] = useState<undefined | InviteRoadmapUser>(
    undefined,
  );
  const [uniqueMemberError, setUniqueMemberError] = useState(false);
  const [uniqueCustomerError, setUniqueCustomerError] = useState(false);
  const [customers, setCustomers] = useState<RoadmapCreationCustomer[]>([]);
  const [editCustomer, setEditCustomer] = useState<
    undefined | RoadmapCreationCustomer
  >(undefined);
  const [createdRoadmapId, setCreatedRoadmapId] = useState<undefined | number>(
    undefined,
  );
  const [addRoadmap] = apiV2.useAddRoadmapMutation();

  const memberExists = (email: string, oldEmail?: string) => {
    const alreadyExists = members.find(
      (member) => member.email === email && member.email !== oldEmail,
    );
    return alreadyExists || userInfo.email === email;
  };

  const customerExists = (
    customer: RoadmapCreationCustomer,
    oldCustomer?: RoadmapCreationCustomer,
  ) =>
    customers.find(
      ({ name, email }) =>
        name === customer.name &&
        email === customer.email &&
        (oldCustomer?.name !== customer.name ||
          oldCustomer?.email !== customer.email),
    );

  const handleSubmit = async () => {
    try {
      const { id } = await addRoadmap({
        roadmap: {
          name: formValues.name,
          description: formValues.description,
        },
        customers,
        invitations: members.map((member) => ({
          ...member,
          representativeFor: customers.filter(({ representatives }) =>
            representatives.find(
              ({ email, checked }) => email === member.email && checked,
            ),
          ),
        })),
      }).unwrap();

      await dispatch(userActions.getUserInfo());
      setCreatedRoadmapId(id);
    } catch (err) {
      return { message: err.data?.message ?? t('Internal server error') };
    }
  };

  const steps = [
    {
      disabled: () => !formValues.name || !formValues.description,
      noCancelConfirmation: () => !formValues.name && !formValues.description,
      description: 'Name it',
      component: () => (
        <div>
          <Input
            label={t('Project name')}
            required
            id="name"
            autoComplete="off"
            value={formValues.name}
            placeholder={t('Give it a name')}
            onChange={(e) =>
              setFormValues({
                ...formValues,
                name: e.currentTarget.value,
              })
            }
          />
          <br />
          <TextArea
            label={t('Description')}
            required
            id="description"
            autoComplete="off"
            value={formValues.description}
            placeholder={t('Description')}
            onChange={(e) =>
              setFormValues({
                ...formValues,
                description: e.currentTarget.value,
              })
            }
          />
        </div>
      ),
    },
    {
      description: 'Add members',
      component: () => (
        <div className={css.addPeopleStep}>
          <AddTeamMemberInfo
            open={open.info}
            onChange={(info) => setOpen({ ...open, info })}
          />
          <div className={classes(css.addBox)}>
            {!open.addMember && !editMember && (
              <AddPeopleList
                type="member"
                people={members}
                onAdd={() => {
                  setOpen({ ...open, addMember: true });
                  setUniqueMemberError(false);
                }}
                onEdit={(member) => {
                  setEditMember(member as InviteRoadmapUser);
                  setUniqueMemberError(false);
                }}
                onDelete={(member) => {
                  setMembers(
                    members.filter(({ email }) => email !== member.email),
                  );
                  setCustomers(
                    removeRepresentative(
                      customers,
                      member as InviteRoadmapUser,
                    ),
                  );
                }}
              />
            )}
            {open.addMember && (
              <AddOrModifyMember
                error={uniqueMemberError}
                onSubmit={(member) => {
                  if (memberExists(member.email)) {
                    setUniqueMemberError(true);
                    return;
                  }
                  setMembers([...members, member]);
                  setOpen({ ...open, addMember: false });
                }}
                onCancel={() => setOpen({ ...open, addMember: false })}
                onCloseError={() => setUniqueMemberError(false)}
              />
            )}
            {editMember && (
              <AddOrModifyMember
                error={uniqueMemberError}
                initialMember={editMember}
                onSubmit={(member) => {
                  if (memberExists(member.email, editMember.email)) {
                    setUniqueMemberError(true);
                    return;
                  }
                  setMembers(
                    members.map(({ email, type }) =>
                      email === editMember.email && type === editMember.type
                        ? member
                        : { email, type },
                    ),
                  );
                  if (
                    !hasPermission(member.type, Permission.CustomerRepresent)
                  ) {
                    setCustomers(removeRepresentative(customers, editMember));
                    return;
                  }
                  // update email and role
                  setCustomers(
                    customers.map((customer) => ({
                      ...customer,
                      representatives: customer.representatives.map((rep) =>
                        rep.email === editMember.email
                          ? { ...member, checked: rep.checked }
                          : rep,
                      ),
                    })),
                  );
                  setEditMember(undefined);
                }}
                onCancel={() => setEditMember(undefined)}
                onCloseError={() => setUniqueMemberError(false)}
              />
            )}
          </div>
          <SkipPeopleAddition
            type="members"
            extraStep={!!members.length}
            onSkip={() => setMembers([])}
          />
        </div>
      ),
    },
    {
      description: 'Add clients',
      component: () => (
        <div className={css.addPeopleStep}>
          <div className={classes(css.addBox)}>
            {!open.addCustomer && !editCustomer && (
              <AddPeopleList
                type="client"
                people={customers}
                onAdd={() => {
                  setOpen({ ...open, addCustomer: true });
                  setUniqueCustomerError(false);
                }}
                onEdit={(customer) => {
                  setEditCustomer(customer as RoadmapCreationCustomer);
                  setUniqueCustomerError(false);
                }}
                onDelete={(customer) =>
                  setCustomers(
                    customers.filter(
                      ({ name, email }) =>
                        name !== (customer as RoadmapCreationCustomer).name ||
                        email !== customer.email,
                    ),
                  )
                }
              />
            )}
            {open.addCustomer && (
              <AddOrModifyCustomer
                error={uniqueCustomerError}
                onSubmit={(customer) => {
                  if (customerExists(customer)) {
                    setUniqueCustomerError(true);
                    return;
                  }
                  setCustomers([...customers, customer]);
                  setOpen({ ...open, addCustomer: false });
                }}
                onCancel={() => setOpen({ ...open, addCustomer: false })}
                customers={customers}
                members={[
                  ...members,
                  { email: userInfo.email, type: RoleType.Admin },
                ]}
                onCloseError={() => setUniqueCustomerError(false)}
              />
            )}
            {editCustomer && (
              <AddOrModifyCustomer
                error={uniqueCustomerError}
                initialCustomer={editCustomer}
                onSubmit={(customer) => {
                  if (customerExists(customer, editCustomer)) {
                    setUniqueCustomerError(true);
                    return;
                  }
                  setCustomers(
                    customers.map((existing) =>
                      existing.name === editCustomer.name &&
                      existing.email === editCustomer.email
                        ? customer
                        : existing,
                    ),
                  );
                  setEditCustomer(undefined);
                }}
                onCancel={() => setEditCustomer(undefined)}
                customers={customers}
                members={[
                  ...members,
                  { email: userInfo.email, type: RoleType.Admin },
                ]}
                onCloseError={() => setUniqueCustomerError(false)}
              />
            )}
          </div>
          <SkipPeopleAddition
            type="clients"
            extraStep={!!customers.length}
            onSkip={() => setCustomers([])}
          />
        </div>
      ),
    },
    {
      description: 'Finish',
      component: () => (
        <SummaryStepContent
          description="All done roadmap description"
          formValues={formValues}
        >
          <DisplayPeople type="members" people={members} />
          <DisplayPeople type="clients" people={customers} />
        </SummaryStepContent>
      ),
    },
  ];

  return (
    <StepForm
      header={t('Create new project')}
      finishHeader={t('Project created')}
      finishMessage={
        <div className={classes(css.finishStep)}>
          {t('Awesome! Your project is now up and running!')}
          {members.length > 0 && (
            <div>
              <Trans i18nKey="Invitation status info">
                The invitation statuses can be checked at{' '}
                <button
                  type="submit"
                  onClick={() =>
                    history.push(
                      `${paths.roadmapHome}/${createdRoadmapId}${paths.roadmapRelative.team}`,
                    )
                  }
                >
                  Team page
                </button>
              </Trans>
            </div>
          )}
        </div>
      }
      cancelHeader={t('Cancel project creation')}
      cancelMessage={t('Are you sure you want to cancel project creation?')}
      submit={handleSubmit}
      closeModal={closeModal}
      steps={steps}
    />
  );
};
