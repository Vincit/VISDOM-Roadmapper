import { FC } from 'react';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import { SortingOrders } from '../utils/SortUtils';

export const SortingArrow: FC<{ order: SortingOrders }> = ({ order }) =>
  order === SortingOrders.ASCENDING ? (
    <ArrowCircleUpIcon fontSize="small" />
  ) : (
    <ArrowCircleDownIcon fontSize="small" />
  );
