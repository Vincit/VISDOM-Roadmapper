import { useState } from 'react';
import classNames from 'classnames';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { StoreDispatchType } from '../../redux';
import { roadmapsActions } from '../../redux/roadmaps';
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
  const [createdRoadmapId, setCreatedRoadmapId] = useState<undefined | number>(
    undefined,
  );

  const handleSubmit = async () => {
    const res = await dispatch(
      roadmapsActions.addRoadmap({
        name: formValues.name,
        description: formValues.description,
      }),
    );

    if (roadmapsActions.addRoadmap.rejected.match(res)) {
      return { message: res.payload?.message ?? t('Internal server error') };
    }

    const promises = members.flatMap((member) =>
      dispatch(
        roadmapsActions.sendInvitation({
          ...member,
          roadmapId: res.payload.id,
        }),
      ),
    );
    await Promise.all(promises);
    await dispatch(userActions.getUserInfo());
    setCreatedRoadmapId(res.payload.id);
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
                  {members.map((member, idx) => (
                    <DisplayInvitedMember
                      key={idx}
                      member={member}
                      onDelete={() => {
                        const copy = [...members];
                        copy.splice(idx, 1);
                        setMembers(copy);
                      }}
                      onEdit={() => setEditMember(member)}
                    />
                  ))}
                </div>
                <div
                  className={classes(css.addMemberButton, {
                    [css.bottomItem]: members.length > 0,
                  })}
                >
                  <AddButton
                    onClick={() => setOpen({ ...open, addMember: true })}
                  >
                    <Trans i18nKey="Add member" />
                  </AddButton>
                </div>
              </>
            )}
            {open.addMember && (
              <AddOrModifyMember
                onSubmit={(member) => {
                  setMembers([...members, member]);
                  setOpen({ ...open, addMember: false });
                }}
                onCancel={() => setOpen({ ...open, addMember: false })}
              />
            )}
            {editMember && (
              <AddOrModifyMember
                initialMember={editMember}
                onSubmit={(member) => {
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
                      `${paths.roadmapHome}/${createdRoadmapId}${paths.roadmapRelative.people}`,
                    )
                  }
                >
                  People page
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
