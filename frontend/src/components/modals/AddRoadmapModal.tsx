import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { StoreDispatchType } from '../../redux';
import { roadmapsActions } from '../../redux/roadmaps';
import { userActions } from '../../redux/user';
import { Modal, ModalTypes } from './types';
import { StepForm } from '../forms/StepForm';
import { Input, TextArea } from '../forms/FormField';

export const AddRoadmapModal: Modal<ModalTypes.ADD_ROADMAP_MODAL> = ({
  closeModal,
}) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const { t } = useTranslation();
  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
  });

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
    await dispatch(userActions.getUserInfo());
  };

  const steps = [
    {
      disabled: () => !formValues.name || !formValues.description,
      noCancelConfirmation: () => !formValues.name && !formValues.description,
      description: '',
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
  ];

  return (
    <StepForm
      header={t('Create new project')}
      finishHeader={t('Project created')}
      finishMessage={t('Awesome! Your project is now up and running!')}
      cancelHeader={t('Cancel project creation')}
      cancelMessage={t('Are you sure you want to cancel project creation?')}
      submit={handleSubmit}
      closeModal={closeModal}
      steps={steps}
    />
  );
};
