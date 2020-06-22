import { Task, TaskRatingDimension } from '../redux/roadmaps/types';

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
}

export enum SortingOrders {
  ASCENDING,
  DESCENDING,
}

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
  return -1;
};

export const calcTaskPriority = (task: Task) => {
  const avgBusinessRating = calcTaskAverageRating(
    TaskRatingDimension.BusinessValue,
    task,
  );
  if (avgBusinessRating < 0) return -2;
  const avgWorkRating = calcTaskAverageRating(
    TaskRatingDimension.RequiredWork,
    task,
  );
  if (avgWorkRating < 0) return -1;

  return avgBusinessRating / avgWorkRating;
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

export const sortTasks = (
  taskList: Task[],
  sortingType: SortingTypes,
  sortingOrder: SortingOrders,
) => {
  const tasks = [...taskList];
  switch (sortingType) {
    case SortingTypes.SORT_CREATEDAT:
      tasks.sort(
        (a, b) =>
          (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
          (sortingOrder === SortingOrders.DESCENDING ? -1 : 1),
      );
      break;
    case SortingTypes.SORT_NAME:
      tasks.sort(
        (a, b) =>
          a.name.localeCompare(b.name) *
          (sortingOrder === SortingOrders.DESCENDING ? -1 : 1),
      );
      break;
    case SortingTypes.SORT_DESC:
      tasks.sort(
        (a, b) =>
          a.description.localeCompare(b.description) *
          (sortingOrder === SortingOrders.DESCENDING ? -1 : 1),
      );
      break;
    case SortingTypes.SORT_STATUS:
      tasks.sort(
        (a, b) =>
          (+a.completed - +b.completed) *
          (sortingOrder === SortingOrders.DESCENDING ? -1 : 1),
      );
      break;
    case SortingTypes.SORT_RATINGS:
      tasks.sort(
        (a, b) =>
          (calcTaskPriority(a) - calcTaskPriority(b)) *
          (sortingOrder === SortingOrders.DESCENDING ? -1 : 1),
      );
      break;
    default:
      // SortingTypes.NO_SORT
      break;
  }

  return tasks;
};
