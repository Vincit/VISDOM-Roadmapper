import { ReactNode } from 'react';
import { Trans } from 'react-i18next';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PanToolAltIcon from '@mui/icons-material/PanToolAlt';
import PanToolIcon from '@mui/icons-material/PanTool';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import ZoomInIcon from '@mui/icons-material/ZoomIn';

export const overviewColumns: {
  title: ReactNode;
  columns: {
    subtitle: ReactNode;
    description: ReactNode;
    icon?: ReactNode;
  }[];
}[] = [
  {
    title: <Trans i18nKey="Task relations" />,
    columns: [
      {
        subtitle: <Trans i18nKey="Relations" />,
        description: <Trans i18nKey="Relations description" />,
      },
      {
        subtitle: <Trans i18nKey="Synergies" />,
        description: <Trans i18nKey="Synergies description" />,
      },
    ],
  },
  {
    title: <Trans i18nKey="View" />,
    columns: [
      {
        subtitle: <Trans i18nKey="Task map" />,
        description: <Trans i18nKey="Task map description" />,
      },
      {
        subtitle: <Trans i18nKey="Task circles" />,
        description: <Trans i18nKey="Task circles description" />,
      },
      {
        subtitle: <Trans i18nKey="Unstaged tasks list" />,
        description: <Trans i18nKey="Unstaged tasks list description" />,
      },
      {
        subtitle: <Trans i18nKey="Task info" />,
        description: <Trans i18nKey="Task info description" />,
      },
    ],
  },
  {
    title: <Trans i18nKey="Screen functions" />,
    columns: [
      {
        icon: <FullscreenIcon />,
        subtitle: <Trans i18nKey="Fit groups into the viewport" />,
        description: <Trans i18nKey="Fit groups description" />,
      },
      {
        icon: <RestartAltIcon />,
        subtitle: <Trans i18nKey="Reset group positions" />,
        description: <Trans i18nKey="Reset group positions description" />,
      },
    ],
  },
];

export const actionColumns = [
  {
    title: <Trans i18nKey="Adding and removing task relations & Synergies" />,
    columns: [
      {
        subtitle: <Trans i18nKey="Add relation" />,
        action: <Trans i18nKey="Add relation action" />,
        description: <Trans i18nKey="Add relation description" />,
      },
      {
        subtitle: <Trans i18nKey="Remove relation" />,
        action: <Trans i18nKey="Remove relation action" />,
        description: <Trans i18nKey="Remove relation description" />,
      },
      {
        subtitle: <Trans i18nKey="Add synergy" />,
        action: <Trans i18nKey="Add synergy action" />,
        description: <Trans i18nKey="Add synergy description" />,
      },
      {
        subtitle: <Trans i18nKey="Remove synergy" />,
        action: <Trans i18nKey="Remove synergy actions" />,
        description: <Trans i18nKey="Remove synergy description" />,
      },
    ],
  },
  {
    title: <Trans i18nKey="Reorganizing the view and viewing info" />,
    columns: [
      {
        subtitle: <Trans i18nKey="Move a task or group" />,
        action: <Trans i18nKey="Move a task or group action" />,
        description: <Trans i18nKey="Move a task or group description" />,
      },
      {
        subtitle: <Trans i18nKey="Show task info" />,
        action: <Trans i18nKey="Show task info action" />,
        description: <Trans i18nKey="Show task info description" />,
      },
    ],
  },
];

export const actionIcons = [
  {
    icon: <PanToolAltIcon />,
    action: <Trans i18nKey="Click or Click & drag" />,
  },
  {
    icon: <PanToolIcon />,
    action: <Trans i18nKey="Grab (a task)" />,
  },
  {
    icon: <OpenWithIcon />,
    action: <Trans i18nKey="Move (a group)" />,
  },
  {
    icon: <ZoomInIcon />,
    action: <Trans i18nKey="Zoom in and out (scroll wheel)" />,
  },
];
