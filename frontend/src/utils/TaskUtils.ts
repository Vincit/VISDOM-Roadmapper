import { DraggableLocation } from 'react-beautiful-dnd';
import {
  PublicUser,
  Roadmap,
  Task,
  TaskRatingDimension,
} from '../redux/roadmaps/types';
import { UserType } from '../redux/user/types';

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

const averageRatingsByDimension = (
  task: Task,
): Map<TaskRatingDimension, number> => {
  const ratings = task.ratings.reduce((result, { value, dimension }) => {
    const { sum, count } = result.get(dimension) || { sum: 0, count: 0 };
    return result.set(dimension, { sum: sum + value, count: count + 1 });
  }, new Map());
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

export const averageValueAndWork = (tasks: Task[]) => ({
  value: totalValueAndWork(tasks).value / tasks.length,
  work: totalValueAndWork(tasks).work / tasks.length,
});

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
export const calcTaskValueSum = (task: Task) => {
  let ratingValuesSum = 0;
  task.ratings.forEach((rating) => {
    if (rating.dimension !== TaskRatingDimension.BusinessValue) return;
    ratingValuesSum += rating.value;
  });

  return ratingValuesSum;
};

export const calcTaskWeightedValueSum = (
  task: Task,
  allUsers: PublicUser[],
  roadmap: Roadmap,
) => {
  let customerValuesSum = 0;
  allUsers.forEach((user) => {
    if (user.type === UserType.CustomerUser) {
      if (user.customerValue) {
        customerValuesSum += user.customerValue;
      }
    }
  });

  let ratingValuesSum = 0;
  task.ratings.forEach((rating) => {
    if (rating.dimension !== TaskRatingDimension.BusinessValue) return;
    const ratingCreator = allUsers.find(
      (user) => user.id === rating.createdByUser,
    );

    const ratingCreatorValue = ratingCreator?.customerValue || 0;

    let creatorPlannerWeight = roadmap.plannerUserWeights?.find(
      (weight) => weight.userId === rating.createdByUser,
    )?.weight;
    if (creatorPlannerWeight === undefined) creatorPlannerWeight = 1;

    let creatorValueWeight = 0;
    if (ratingCreator?.type !== UserType.CustomerUser) creatorValueWeight = 1;

    if (ratingCreatorValue > 0 && customerValuesSum > 0) {
      creatorValueWeight = ratingCreatorValue / customerValuesSum;
    }
    ratingValuesSum += rating.value * creatorValueWeight * creatorPlannerWeight;
  });

  return ratingValuesSum;
};

export const calcWeightedTaskPriority = (
  task: Task,
  allUsers: PublicUser[],
  roadmap: Roadmap,
) => {
  const weightedValue = calcTaskWeightedValueSum(task, allUsers, roadmap);
  if (!weightedValue) return -2;

  const avgWorkRating = calcTaskAverageRating(
    TaskRatingDimension.RequiredWork,
    task,
  );

  if (!avgWorkRating) return -1;

  return weightedValue / avgWorkRating;
};
