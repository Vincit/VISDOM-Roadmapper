// import { MouseEvent, useState, useEffect } from 'react';
import { shallowEqual, useSelector } from 'react-redux';

import classNames from 'classnames';
// import { Trans } from 'react-i18next';
// import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import { useTranslation } from 'react-i18next';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';
import { Roadmap } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
// import { StoreDispatchType } from '../redux';
// import { roadmapsActions } from '../redux/roadmaps';
// import {
//   roadmapsSelector,
//   chosenRoadmapSelector,
// } from '../redux/roadmaps/selectors';
// import { Roadmap } from '../redux/roadmaps/types';
// import { RootState } from '../redux/types';
// import { modalsActions } from '../redux/modals';
// import { ModalTypes } from '../components/modals/types';
// import { ProjectSummary } from '../compon§`ents/ProjectSummary';
// import { AddButton } from '../components/forms/AddButton';
import { averageValueAndWork } from '../utils/TaskUtils';

import { MetricsSummary } from '../components/MetricsSummary';

import css from './TaskOverviewPage.module.scss';

const classes = classNames.bind(css);

export const TaskOverviewPage = () => {
  const { t } = useTranslation();
  const roadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );
  const { value, work } = averageValueAndWork(roadmap?.tasks ?? []);

  const numFormat = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  //   const dispatch = useDispatch<StoreDispatchType>();
  //   const roadmaps = useSelector<RootState, Roadmap[] | undefined>(
  //     roadmapsSelector,
  //     shallowEqual,
  //   );
  //   const chosenRoadmap = useSelector<RootState, Roadmap | undefined>(
  //     chosenRoadmapSelector,
  //     shallowEqual,
  //   );
  //   const [selectedRoadmapId, setSelectedRoadmapId] = useState<
  //     number | undefined
  //   >(undefined);

  //   useEffect(() => {
  //     if (!roadmaps) dispatch(roadmapsActions.getRoadmaps());
  //   }, [dispatch, roadmaps]);

  //   useEffect(() => {
  //     if (chosenRoadmap) {
  //       setSelectedRoadmapId(chosenRoadmap.id);
  //     }
  //   }, [chosenRoadmap]);

  //   const addRoadmapClicked = (e: MouseEvent) => {
  //     e.preventDefault();
  //     e.stopPropagation();
  //     dispatch(
  //       modalsActions.showModal({
  //         modalType: ModalTypes.ADD_ROADMAP_MODAL,
  //         modalProps: {},
  //       }),
  //     );
  //   };

  const metrics = [
    {
      label: 'Avg Value',
      metricsValue: numFormat.format(value),
      children: <MonetizationOnIcon />,
    },
    {
      label: 'Avg Work',
      metricsValue: numFormat.format(work),
      children: <MonetizationOnIcon />,
    },
  ];

  return (
    <div>
      <p style={{ textAlign: 'left', fontSize: '26px' }}>
        <strong>Task Overview: </strong>Create a new button for the form
      </p>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <div className={classes(css.data)}>
            {metrics.map(({ label, metricsValue, children }) => (
              <MetricsSummary key={label} label={t(label)} value={metricsValue}>
                {children}
              </MetricsSummary>
            ))}
          </div>
        </Grid>
        <Grid item xs={12} md={4}>
          <table>
            <tr>
              <td className={classes(css.attName)}>{t('Title')}</td>
              <td>
                <strong>Create a new button for the form</strong>
              </td>
            </tr>
            <tr>
              <td className={classes(css.attName)}>{t('Description')}</td>
              <td>
                Customer X wanted to have a possibility to send the form without
                saving it in the middle of the process
              </td>
            </tr>
          </table>
        </Grid>
        <Grid item xs={12} md={4}>
          <table>
            <tr>
              <td className={classes(css.attName)}>Created on</td>
              <td>28.05.2021, 12.31</td>
            </tr>
            <tr>
              <td className={classes(css.attName)}>Status</td>
              <td>COMPLETED</td>
            </tr>
          </table>
        </Grid>
      </Grid>
      <p style={{ textAlign: 'left', fontSize: '26px' }}>
        <strong>Relations</strong>
      </p>
    </div>
  );
};
