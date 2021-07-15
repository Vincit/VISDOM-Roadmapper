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

class RatingsSummary {
  private sum: number = 0;

  private count: number = 0;

  get total() {
    return this.sum;
  }

  get avg() {
    return this.count ? this.sum / this.count : 0;
  }

  add(rating: number) {
    this.sum += rating;
    this.count += 1;
    return this;
  }
}

// Accumulates results into provided map
const ratingsSummaryByDimensionInto = (
  result: Map<TaskRatingDimension, RatingsSummary>,
  task: Task,
) =>
  task.ratings.reduce((acc, { value, dimension }) => {
    const previous = acc.get(dimension) ?? new RatingsSummary();
    return acc.set(dimension, previous.add(value));
  }, result);

export const ratingsSummaryByDimension = (task: Task) =>
  ratingsSummaryByDimensionInto(new Map(), task);

export const valueAndWorkSummary = (task: Task) => {
  const ratings = ratingsSummaryByDimension(task);
  return {
    value:
      ratings.get(TaskRatingDimension.BusinessValue) ?? new RatingsSummary(),
    work: ratings.get(TaskRatingDimension.RequiredWork) ?? new RatingsSummary(),
  };
};

export const totalValueAndWork = (tasks: Task[]) =>
  tasks
    .map((task) => valueAndWorkSummary(task))
    .reduce(
      ({ value, work }, ratings) => ({
        value: value + ratings.value.avg,
        work: work + ratings.work.avg,
      }),
      { value: 0, work: 0 },
    );

export const averageValueAndWork = (tasks: Task[]) => {
  const ratings = tasks.reduce(ratingsSummaryByDimensionInto, new Map());
  return {
    value: ratings.get(TaskRatingDimension.BusinessValue)?.avg ?? 0,
    work: ratings.get(TaskRatingDimension.RequiredWork)?.avg ?? 0,
  };
};

export const calcTaskPriority = (task: Task) => {
  const ratings = ratingsSummaryByDimension(task);
  const value = ratings.get(TaskRatingDimension.BusinessValue);
  const work = ratings.get(TaskRatingDimension.RequiredWork);
  if (!value) return -2;
  if (!work) return -1;
  return value.avg / work.avg;
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
      return sortKeyNumeric((t) => valueAndWorkSummary(t).value.avg);
    case SortingTypes.SORT_AVG_WORK:
      return sortKeyNumeric((t) => valueAndWorkSummary(t).work.avg);
    case SortingTypes.SORT_TOTAL_VALUE:
      return sortKeyNumeric((t) => valueAndWorkSummary(t).value.total);
    case SortingTypes.SORT_TOTAL_WORK:
      return sortKeyNumeric((t) => valueAndWorkSummary(t).work.total);
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

const ratingValue = (allCustomers: Customer[], roadmap: Roadmap) => (
  rating: Taskrating,
) => {
  const ratingCreator = allCustomers.find(
    ({ id }) => id === rating.forCustomer,
  );
  const creatorWeight = ratingCreator
    ? customerWeight(ratingCreator, roadmap.plannerCustomerWeights)
    : 0;

  return rating.value * creatorWeight;
};

const taskWeightedValueSummary = (
  task: Task,
  allCustomers: Customer[],
  roadmap: Roadmap,
) =>
  task.ratings
    .filter(({ dimension }) => dimension === TaskRatingDimension.BusinessValue)
    .map(ratingValue(allCustomers, roadmap))
    .reduce((acc, num) => acc.add(num), new RatingsSummary());

export const totalWeightedValueAndWork = (
  tasks: Task[],
  allCustomers: Customer[],
  roadmap: Roadmap,
) => {
  const { work } = totalValueAndWork(tasks);
  const totalValue = tasks
    .map((task) => taskWeightedValueSummary(task, allCustomers, roadmap).avg)
    .reduce((sum, value) => sum + value, 0);
  return { value: totalValue, work };
};

export const calcWeightedTaskPriority = (
  task: Task,
  allCustomers: Customer[],
  roadmap: Roadmap,
) => {
  const weightedValue = taskWeightedValueSummary(task, allCustomers, roadmap)
    .avg;
  if (!weightedValue) return -2;

  const avgWorkRating = valueAndWorkSummary(task).work.avg;

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
    return !!userInfo?.representativeFor
      ?.filter((customer) => customer.roadmapId === task.roadmapId)
      ?.find(
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

    return customersMissing || devsMissing;
  });
  return unrated;
};
