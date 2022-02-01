import { useState } from 'react';
import classNames from 'classnames';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { StoreDispatchType } from '../../redux';
import { InviteRoadmapUser } from '../../redux/roadmaps/types';
import { userActions } from '../../redux/user';
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
  SkipMemberAddition,
} from './modalparts/TeamMemberModalParts';
import css from './AddRoadmapModal.module.scss';
import { apiV2 } from '../../api/api';

const classes = classNames.bind(css);

export const AddRoadmapModal: Modal<ModalTypes.ADD_ROADMAP_MODAL> = ({
  closeModal,
}) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const { t } = useTranslation();
  const history = useHistory();
  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
  });
  const [members, setMembers] = useState<InviteRoadmapUser[]>([]);
  const [open, setOpen] = useState({
    info: true,
    tooltip: false,
    addMember: false,
  });
  const [editMember, setEditMember] = useState<undefined | InviteRoadmapUser>(
    undefined,
  );
  const [emailError, setEmailError] = useState(false);
  const [createdRoadmapId, setCreatedRoadmapId] = useState<undefined | number>(
    undefined,
  );
  const [addRoadmap] = apiV2.useAddRoadmapMutation();
  const [sendInvitation] = apiV2.useSendInvitationMutation();

  const handleSubmit = async () => {
    try {
      const { id } = await addRoadmap({
        name: formValues.name,
        description: formValues.description,
      }).unwrap();
      const promises = members.map((member) =>
        sendInvitation({
          roadmapId: id,
          invitation: { ...member, roadmapId: id },
        }).unwrap(),
      );

      await Promise.all(promises);
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
        <div className={css.addMembersStep}>
          <AddTeamMemberInfo
            open={open.info}
            onChange={(info) => setOpen({ ...open, info })}
          />
          <div className={classes(css.addBox)}>
            {!open.addMember && !editMember && (
              <>
                <div className={classes({ [css.members]: members.length > 0 })}>
                  {members.map((member) => (
                    <DisplayInvitedMember
                      key={member.email}
                      member={member}
                      onDelete={() =>
                        setMembers(
                          members.filter(({ email }) => email !== member.email),
                        )
                      }
                      onEdit={() => {
                        setEditMember(member);
                        setEmailError(false);
                      }}
                    />
                  ))}
                </div>
                <div
                  className={classes(css.addMemberButton, {
                    [css.bottomItem]: members.length > 0,
                  })}
                >
                  <AddButton
                    onClick={() => {
                      setOpen({ ...open, addMember: true });
                      setEmailError(false);
                    }}
                  >
                    <Trans i18nKey="Add member" />
                  </AddButton>
                </div>
              </>
            )}
            {open.addMember && (
              <AddOrModifyMember
                error={emailError}
                onSubmit={(member) => {
                  const alreadyExists = members.find(
                    ({ email }) => email === member.email,
                  );
                  if (alreadyExists) {
                    setEmailError(true);
                    return;
                  }
                  setMembers([...members, member]);
                  setOpen({ ...open, addMember: false });
                }}
                onCancel={() => setOpen({ ...open, addMember: false })}
                onCloseError={() => setEmailError(false)}
              />
            )}
            {editMember && (
              <AddOrModifyMember
                error={emailError}
                initialMember={editMember}
                onSubmit={(member) => {
                  const alreadyExists = members.find(
                    ({ email }) =>
                      email !== editMember.email && email === member.email,
                  );
                  if (alreadyExists) {
                    setEmailError(true);
                    return;
                  }
                  setMembers(
                    members.map(({ email, type }) =>
                      email === editMember.email && type === editMember.type
                        ? member
                        : { email, type },
                    ),
                  );
                  setEditMember(undefined);
                }}
                onCancel={() => setEditMember(undefined)}
                onCloseError={() => setEmailError(false)}
              />
            )}
          </div>
          <SkipMemberAddition
            extraStep={!!members.length}
            onSkip={() => setMembers([])}
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
          <div className={classes(css.summaryItem)}>
            <Trans i18nKey="Members summary" />
            {members.length === 0 && '-'}
          </div>
          <div className={classes(css.summaryMembers)}>
            {members.map((member) => (
              <DisplayInvitedMember
                key={`${member.email}-${member.type}`}
                member={member}
                readonly
              />
            ))}
          </div>
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
