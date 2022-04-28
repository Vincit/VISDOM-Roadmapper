import { FC } from 'react';
import classNames from 'classnames';
import { Trans } from 'react-i18next';
import { Version } from '../redux/roadmaps/types';
import { isCompletedMilestone } from '../utils/TaskUtils';
import css from './MilestonesAmountSummary.module.scss';

const classes = classNames.bind(css);

export const MilestonesAmountSummary: FC<{
  versions: Version[];
  selected?: boolean;
}> = ({ versions, selected }) => {
  const versionsAmount = versions.length;
  const completedAmount = versions.filter(isCompletedMilestone).length;
  return (
    <div className={classes(css.summaryWrapper)}>
      <div>
        <Trans
          i18nKey={
            selected ? 'Selected milestones amount' : 'Milestones amount'
          }
          values={{ count: versionsAmount }}
        />
      </div>
      <div className={classes(css.summaryDetails)}>
        <div>
          <Trans
            i18nKey="In progress milestones amount"
            values={{ amount: versionsAmount - completedAmount }}
          />
        </div>
        <div>
          <Trans
            i18nKey="Completed milestones amount"
            values={{ amount: completedAmount }}
          />
        </div>
      </div>
    </div>
  );
};
