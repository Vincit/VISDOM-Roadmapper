import { DraggableLocation } from 'react-beautiful-dnd';
import {
  Customer,
  Roadmap,
  RoadmapUser,
  Task,
  Taskrating,
} from '../redux/roadmaps/types';
import { customerWeight, isCustomer } from './CustomerUtils';
import { UserInfo } from '../redux/user/types';
import {
  RoleType,
  TaskRatingDimension,
} from '../../../shared/types/customTypes';
import {
  SortingOrders,
  sorted,
  sortKeyNumeric,
  sortKeyLocale,
  SortComparison,
} from './SortUtils';
import { getType, isUserInfo } from './UserUtils';

export { SortingOrders } from './SortUtils';

export enum FilterTypes {
  SHOW_ALL,
  NOT_RATED_BY_ME,
  RATED_BY_ME,
  COMPLETED,
  NOT_COMPLETED,
}

export enum SortingTypes {
  NO_SORT,
  SORT_NAME,
  SORT_STATUS,
  SORT_DESC,
  SORT_CREATEDAT,
  SORT_RATINGS,
  SORT_AVG_VALUE,
  SORT_AVG_WORK,
  SORT_TOTAL_VALUE,
  SORT_TOTAL_WORK,
}

export const totalRatingsByDimension = (
  task: Task,
): Map<TaskRatingDimension, { sum: number; count: number }> => {
  return task.ratings.reduce((result, { value, dimension }) => {
    const { sum, count } = result.get(dimension) || { sum: 0, count: 0 };
    return result.set(dimension, { sum: sum + value, count: count + 1 });
  }, new Map());
};

const averageRatingsByDimension = (
  task: Task,
): Map<TaskRatingDimension, number> => {
  const ratings = totalRatingsByDimension(task);
  return new Map(
    Array.from(ratings).map(([key, { sum, count }]) => [key, sum / count]),
  );
};

export const totalValueAndWork = (tasks: Task[]) =>
  tasks
    .map((task) => averageRatingsByDimension(task))
    .reduce(
      ({ value, work }, ratings) => ({
        value: value + (ratings.get(TaskRatingDimension.BusinessValue) || 0),
        work: work + (ratings.get(TaskRatingDimension.RequiredWork) || 0),
      }),
      { value: 0, work: 0 },
    );

export const averageValueAndWork = (tasks: Task[]) => {
  const totals = totalValueAndWork(tasks);
  return {
    value: totals.value / tasks.length,
    work: totals.work / tasks.length,
  };
};

export const calcTaskAverageRating = (
  dimension: TaskRatingDimension,
  task: Task,
) => {
  let sum = 0;
  let count = 0;
  task.ratings.forEach((rating) => {
    if (rating.dimension !== dimension) return;
    count += 1;
    sum += rating.value;
  });

  if (count > 0) {
    return sum / count;
  }
  return undefined;
};

export const calcTaskPriority = (task: Task) => {
  const ratings = averageRatingsByDimension(task);
  const avgBusinessRating = ratings.get(TaskRatingDimension.BusinessValue);
  const avgWorkRating = ratings.get(TaskRatingDimension.RequiredWork);
  if (!avgBusinessRating) return -2;
  if (!avgWorkRating) return -1;
  return avgBusinessRating / avgWorkRating;
};

const sortTaskValueSum = (task: Task) => {
  return (
    totalRatingsByDimension(task).get(TaskRatingDimension.BusinessValue)?.sum ??
    0
  );
};

const sortTaskWorkSum = (task: Task) => {
  return (
    totalRatingsByDimension(task).get(TaskRatingDimension.RequiredWork)?.sum ??
    0
  );
};

const sortAverageTaskWork = (task: Task) => {
  return (
    averageRatingsByDimension(task).get(TaskRatingDimension.RequiredWork) ?? 0
  );
};

const sortAverageTaskValue = (task: Task) => {
  return (
    averageRatingsByDimension(task).get(TaskRatingDimension.BusinessValue) ?? 0
  );
};

export const filterTasksRatedByUser = (userId: number = -1, rated: boolean) => {
  return (task: Task) => {
    if (
      task.ratings?.find((taskrating) => taskrating.createdByUser === userId)
    ) {
      return rated;
    }
    return !rated;
  };
};

export const filterTasksByCompletion = (completion: boolean) => {
  return (task: Task) => task.completed === completion;
};

export const filterTasks = (
  taskList: Task[],
  filterType: FilterTypes,
  userId?: number,
) => {
  let filterFunc: (task: Task) => boolean;
  switch (filterType) {
    case FilterTypes.NOT_RATED_BY_ME:
      filterFunc = filterTasksRatedByUser(userId, false);
      break;
    case FilterTypes.RATED_BY_ME:
      filterFunc = filterTasksRatedByUser(userId, true);
      break;
    case FilterTypes.COMPLETED:
      filterFunc = filterTasksByCompletion(true);
      break;
    case FilterTypes.NOT_COMPLETED:
      filterFunc = filterTasksByCompletion(false);
      break;
    default:
      filterFunc = () => true;
  }
  return taskList.filter(filterFunc);
};

const taskCompare = (
  sortingType: SortingTypes,
): SortComparison<Task> | undefined => {
  switch (sortingType) {
    case SortingTypes.SORT_CREATEDAT:
      return sortKeyNumeric((t) => new Date(t.createdAt).getTime());
    case SortingTypes.SORT_NAME:
      return sortKeyLocale((t) => t.name);
    case SortingTypes.SORT_DESC:
      return sortKeyLocale((t) => t.description);
    case SortingTypes.SORT_STATUS:
      return sortKeyNumeric((t) => +t.completed);
    case SortingTypes.SORT_RATINGS:
      return sortKeyNumeric(calcTaskPriority);
    case SortingTypes.SORT_AVG_VALUE:
      return sortKeyNumeric(sortAverageTaskValue);
    case SortingTypes.SORT_AVG_WORK:
      return sortKeyNumeric(sortAverageTaskWork);
    case SortingTypes.SORT_TOTAL_VALUE:
      return sortKeyNumeric(sortTaskValueSum);
    case SortingTypes.SORT_TOTAL_WORK:
      return sortKeyNumeric(sortTaskWorkSum);
    default:
      // SortingTypes.NO_SORT
      break;
  }
};

export const sortTasks = (
  taskList: Task[],
  sortingType: SortingTypes,
  sortingOrder: SortingOrders,
) => sorted(taskList, taskCompare(sortingType), sortingOrder);

// Function to help with reordering item in list
export const reorderList = (
  list: Task[],
  startIndex: number,
  endIndex: number,
) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

// Function to help move items between lists
export const dragDropBetweenLists = (
  source: Task[],
  destination: Task[],
  droppableSource: DraggableLocation,
  droppableDestination: DraggableLocation,
) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  return {
    [droppableSource.droppableId]: sourceClone,
    [droppableDestination.droppableId]: destClone,
  };
};

export const calcTaskWeightedValueSum = (
  task: Task,
  allCustomers: Customer[],
  roadmap: Roadmap,
) => {
  const customerValuesSum = allCustomers.reduce(
    (total, customer) => total + customerWeight(customer),
    0,
  );

  const ratingValue = (rating: Taskrating) => {
    const ratingCreator = allCustomers.find(
      ({ id }) => id === rating.forCustomer,
    );

    const ratingCreatorValue = ratingCreator
      ? customerWeight(ratingCreator, roadmap.plannerCustomerWeights)
      : 0;

    let creatorPlannerWeight = roadmap.plannerCustomerWeights?.find(
      ({ customerId }) => customerId === rating.forCustomer,
    )?.weight;
    if (creatorPlannerWeight === undefined) creatorPlannerWeight = 1;

    let creatorValueWeight = 0;
    if (ratingCreator === undefined) creatorValueWeight = 1;

    if (ratingCreatorValue > 0 && customerValuesSum > 0) {
      creatorValueWeight = ratingCreatorValue / customerValuesSum;
    }
    return rating.value * creatorValueWeight * creatorPlannerWeight;
  };

  return task.ratings
    .filter(({ dimension }) => dimension === TaskRatingDimension.BusinessValue)
    .map(ratingValue)
    .reduce((sum, value) => sum + value, 0);
};

export const calcWeightedTaskPriority = (
  task: Task,
  allCustomers: Customer[],
  roadmap: Roadmap,
) => {
  const weightedValue = calcTaskWeightedValueSum(task, allCustomers, roadmap);
  if (!weightedValue) return -2;

  const avgWorkRating = calcTaskAverageRating(
    TaskRatingDimension.RequiredWork,
    task,
  );

  if (!avgWorkRating) return -1;

  return weightedValue / avgWorkRating;
};

export const isRatedByUser = (user: RoadmapUser | UserInfo) => (
  rating: Taskrating,
) => rating.createdByUser === user.id;

export const isRatedByCustomer = (
  customer: Customer,
  rep: RoadmapUser | UserInfo,
) => (rating: Taskrating) =>
  rating.forCustomer === customer.id && rating.createdByUser === rep.id;

/*
  For Customers consider missing representative ratings
  For Admin and Business -users consider missing represented ratings
  For others consider their own missing ratings
*/
export const isUnrated = (
  user: RoadmapUser | Customer | UserInfo,
  customers?: Customer[],
) => (task: Task) => {
  if (isCustomer(user))
    return !!user.representatives?.find(
      (rep) => !task.ratings.some(isRatedByCustomer(user, rep)),
    );
  if (isUserInfo(user)) {
    const type = getType(user.roles, task.roadmapId);
    if (type === RoleType.Admin || type === RoleType.Business)
      return !!user.representativeFor?.find(
        (customer) => !task.ratings.some(isRatedByCustomer(customer, user)),
      );
    return !task.ratings.find(isRatedByUser(user));
  }
  if (user.type === RoleType.Admin || user.type === RoleType.Business) {
    const represented = customers?.filter((customer) =>
      customer.representatives?.find((rep) => rep.id === user.id),
    );
    return !!represented?.find(
      (customer) => !task.ratings.some(isRatedByCustomer(customer, user)),
    );
  }
  return !task.ratings.find(isRatedByUser(user));
};

export const unratedTasks = (
  user: RoadmapUser | Customer | UserInfo,
  tasks: Task[],
  customers?: Customer[],
) => tasks.filter(isUnrated(user, customers));

export const unratedTasksAmount = (
  user: RoadmapUser | Customer | UserInfo,
  tasks: Task[],
  customers?: Customer[],
) => unratedTasks(user, tasks, customers).length;

export const taskAwaitsRatings = (task: Task, userInfo?: UserInfo) => {
  const type = getType(userInfo?.roles, task.roadmapId);
  if (type === RoleType.Admin || type === RoleType.Business)
    return !!userInfo?.representativeFor?.find(
      (customer) =>
        !task.ratings.some(
          (rating) =>
            customer.id === rating.forCustomer &&
            rating.createdByUser === userInfo?.id,
        ),
    );
  return !task.ratings.find((rating) => rating.createdByUser === userInfo?.id);
};

export const unratedProductOwnerTasks: (
  tasks: Task[],
  allUsers: RoadmapUser[],
  allCustomers: Customer[],
) => Task[] = (tasks, allUsers, allCustomers) => {
  const developers = allUsers.filter(
    (user) => user.type === RoleType.Developer,
  );
  const unrated = tasks.filter((task) => {
    const ratingIds = task.ratings.map((rating) => rating.createdByUser);

    const customersMissing = allCustomers.some((customer) => {
      return !customer.representatives?.every((rep) =>
        ratingIds.includes(rep.id),
      );
    });

    const devsMissing = developers.some(
      (developer) => !ratingIds.includes(developer.id),
    );

    if (!customersMissing && !devsMissing) return false;
    return true;
  });
  return unrated;
};
