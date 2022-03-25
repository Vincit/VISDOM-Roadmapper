import classNames from 'classnames';
import BuildSharpIcon from '@mui/icons-material/BuildSharp';
import { useSelector, shallowEqual } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { useTranslation } from 'react-i18next';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { ratingTable, RatingRow } from './RatingTable';
import { EditButton, DeleteButton } from './forms/SvgButton';
import {
  TaskRatingDimension,
  Permission,
} from '../../../shared/types/customTypes';
import css from './RatingTable.module.scss';
import { apiV2, selectById } from '../api/api';
import { userRoleSelector } from '../redux/user/selectors';
import { hasPermission } from '../../../shared/utils/permission';

const classes = classNames.bind(css);

const numFormat = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const TableComplexityRatingRow: RatingRow = ({
  rating,
  style,
  user,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const { data: createdBy } = apiV2.useGetRoadmapUsersQuery(
    roadmapId ?? skipToken,
    selectById(rating.createdByUser),
  );
  const role = useSelector(userRoleSelector, shallowEqual);
  const hasEditOthersPermission = hasPermission(
    role,
    Permission.TaskRatingEditOthers,
  );

  return (
    <div style={style} className={classes(css.ratingRow)}>
      <div className={classes(css.topRow)}>
        <div className={classes(css.roleIcon)}>
          <BuildSharpIcon fontSize="small" />
        </div>
        <div className={classes(css.name)}>
          {createdBy?.email ?? `<${t('deleted account')}>`}
        </div>
        <div className={classes(css.rightSide)}>
          {hasEditOthersPermission && <DeleteButton onClick={onDelete} />}
          {rating.createdByUser === user.id && (
            <EditButton fontSize="medium" onClick={onEdit} />
          )}
          <div className={classes(css.value)}>
            {numFormat.format(rating.value)}
          </div>
        </div>
      </div>
      {rating.comment.length > 0 && (
        <div className={classes(css.comment)}>{rating.comment}</div>
      )}
    </div>
  );
};

export const RatingTableComplexity = ratingTable({
  type: TaskRatingDimension.Complexity,
  Row: TableComplexityRatingRow,
});
