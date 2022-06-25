import { FC } from 'react';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PanToolAltIcon from '@mui/icons-material/PanToolAlt';
import PanToolIcon from '@mui/icons-material/PanTool';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import ZoomInIcon from '@mui/icons-material/ZoomIn';

export const overviewColumns: {
  title: string;
  columns: { subtitle: string; description: string; Icon?: FC }[];
}[] = [
  {
    title: 'Task relations',
    columns: [
      {
        subtitle: 'Relations',
        description: 'Relations description',
      },
      {
        subtitle: 'Synergies',
        description: 'Synergies description',
      },
    ],
  },
  {
    title: 'View',
    columns: [
      {
        subtitle: 'Task map',
        description: 'Task map description',
      },
      {
        subtitle: 'Task circles',
        description: 'Task circles description',
      },
      {
        subtitle: 'Unstaged tasks list',
        description: 'Unstaged tasks list description',
      },
      {
        subtitle: 'Task info',
        description: 'Task info description',
      },
    ],
  },
  {
    title: 'Screen functions',
    columns: [
      {
        Icon: () => <FullscreenIcon />,
        subtitle: 'Fit groups into the viewport',
        description: 'Fit groups description',
      },
      {
        Icon: () => <RestartAltIcon />,
        subtitle: 'Reset group positions',
        description: 'Reset group positions description',
      },
    ],
  },
];

export const actionColumns = [
  {
    title: 'Adding and removing task relations & Synergies',
    columns: [
      {
        subtitle: 'Add relation',
        action: 'Add relation action',
        description: 'Add relation description',
      },
      {
        subtitle: 'Remove relation',
        action: 'Remove relation action',
        description: 'Remove relation description',
      },
      {
        subtitle: 'Add synergy',
        action: 'Add synergy action',
        description: 'Add synergy description',
      },
      {
        subtitle: 'Remove synergy',
        action: 'Remove synergy actions',
        description: 'Remove synergy description',
      },
    ],
  },
  {
    title: 'Reorganizing the view and viewing info',
    columns: [
      {
        subtitle: 'Move a task or group',
        action: 'Move a task or group action',
        description: 'Move a task or group description',
      },
      {
        subtitle: 'Show task info',
        action: 'Show task info action',
        description: 'Show task info description',
      },
    ],
  },
];

export const actionIcons = [
  {
    Icon: () => <PanToolAltIcon />,
    action: 'Click or Click & drag',
  },
  {
    Icon: () => <PanToolIcon />,
    action: 'Grab (a task)',
  },
  {
    Icon: () => <OpenWithIcon />,
    action: 'Move (a group)',
  },
  {
    Icon: () => <ZoomInIcon />,
    action: 'Zoom in and out (scroll wheel)',
  },
];
