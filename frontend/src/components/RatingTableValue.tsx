import classNames from 'classnames';
import { useSelector, shallowEqual } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { useTranslation } from 'react-i18next';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { ratingTable, RatingRow } from './RatingTable';
import { EditButton, DeleteButton } from './forms/SvgButton';
import { Dot } from './Dot';
import {
  TaskRatingDimension,
  Permission,
} from '../../../shared/types/customTypes';
import { RoleIcon } from './RoleIcons';
import css from './RatingTable.module.scss';
import { apiV2, selectById } from '../api/api';
import { userRoleSelector } from '../redux/user/selectors';
import { hasPermission } from '../../../shared/utils/permission';

const classes = classNames.bind(css);

const numFormat = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const TableValueRatingRow: RatingRow = ({
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
  const { data: customer } = apiV2.useGetCustomersQuery(
    roadmapId ?? skipToken,
    selectById(rating.forCustomer),
  );
  const role = useSelector(userRoleSelector, shallowEqual);
  const hasEditOthersPermission = hasPermission(
    role,
    Permission.TaskRatingEditOthers,
  );

  if (!customer) return null;
  return (
    <div style={style} className={classes(css.ratingRow)}>
      <div className={classes(css.valueRating)}>
        <div className={classes(css.leftSide)}>
          <div className={classes(css.topRow)}>
            <Dot fill={customer.color} />
            <div className={classes(css.name)}>{customer.name}</div>
          </div>
          <div className={classes(css.bottomRow)}>
            {createdBy && <RoleIcon type={createdBy.type} small tooltip />}
            <div className={classes(css.name)}>
              {createdBy?.email ?? `<${t('deleted account')}>`}
            </div>
          </div>
        </div>
        <div className={classes(css.rightSide)}>
          {rating.createdByUser === user.id &&
            user.representativeFor?.some(
              ({ id }) => id === rating.forCustomer,
            ) && <EditButton fontSize="medium" onClick={onEdit} />}
          {hasEditOthersPermission && <DeleteButton onClick={onDelete} />}
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

export const RatingTableValue = ratingTable({
  type: TaskRatingDimension.BusinessValue,
  Row: TableValueRatingRow,
});
