import classNames from 'classnames';
import BuildSharpIcon from '@mui/icons-material/BuildSharp';
import { useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { ratingTable, RatingRow } from './RatingTable';
import { EditButton } from './forms/SvgButton';
import { TaskRatingDimension } from '../../../shared/types/customTypes';
import css from './RatingTable.module.scss';
import { apiV2, selectById } from '../api/api';

const classes = classNames.bind(css);

const numFormat = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const TableComplexityRatingRow: RatingRow = ({
  rating,
  style,
  userId,
  onEdit,
}) => {
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const { data: user } = apiV2.useGetRoadmapUsersQuery(
    roadmapId ?? skipToken,
    selectById(rating.createdByUser),
  );

  if (!user) return null;

  return (
    <div style={style} className={classes(css.ratingRow)}>
      <div className={classes(css.topRow)}>
        <div className={classes(css.roleIcon)}>
          <BuildSharpIcon fontSize="small" />
        </div>
        <div className={classes(css.name)}>{user.email}</div>
        <div className={classes(css.rightSide)}>
          {user.id === userId && (
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
