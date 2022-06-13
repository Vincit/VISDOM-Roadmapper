import { Trans } from 'react-i18next';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PanToolAltIcon from '@mui/icons-material/PanToolAlt';
import PanToolIcon from '@mui/icons-material/PanTool';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import ZoomInIcon from '@mui/icons-material/ZoomIn';

export const overviewColumns = [
  {
    Title: <Trans i18nKey="Task relations" />,
    Columns: [
      {
        Subtitle: <Trans i18nKey="Relations" />,
        Description: <Trans i18nKey="Relations description" />,
      },
      {
        Subtitle: <Trans i18nKey="Synergies" />,
        Description: <Trans i18nKey="Synergies description" />,
      },
    ],
  },
  {
    Title: <Trans i18nKey="View" />,
    Columns: [
      {
        Subtitle: <Trans i18nKey="Task map" />,
        Description: <Trans i18nKey="Task map description" />,
      },
      {
        Subtitle: <Trans i18nKey="Task circles" />,
        Description: <Trans i18nKey="Task circles description" />,
      },
      {
        Subtitle: <Trans i18nKey="Unstaged tasks list" />,
        Description: <Trans i18nKey="Unstaged tasks list description" />,
      },
      {
        Subtitle: <Trans i18nKey="Task info" />,
        Description: <Trans i18nKey="Task info description" />,
      },
    ],
  },
];

export const overviewIcons = [
  {
    Title: <Trans i18nKey="Screen functions" />,
    Columns: [
      {
        Icon: <FullscreenIcon />,
        Subtitle: <Trans i18nKey="Fit groups into the viewport" />,
        Description: <Trans i18nKey="Fit groups description" />,
      },
      {
        Icon: <RestartAltIcon />,
        Subtitle: <Trans i18nKey="Reset group positions" />,
        Description: <Trans i18nKey="Reset group positions description" />,
      },
    ],
  },
];

export const actionColumns = [
  {
    Title: <Trans i18nKey="Adding and removing task relations & Synergies" />,
    Columns: [
      {
        Subtitle: <Trans i18nKey="Add relation" />,
        Action: <Trans i18nKey="Add relation action" />,
        Description: <Trans i18nKey="Add relation description" />,
      },
      {
        Subtitle: <Trans i18nKey="Remove relation" />,
        Action: <Trans i18nKey="Remove relation action" />,
        Description: <Trans i18nKey="Remove relation description" />,
      },
      {
        Subtitle: <Trans i18nKey="Add synergy" />,
        Action: <Trans i18nKey="Add synergy action" />,
        Description: <Trans i18nKey="Add synergy description" />,
      },
      {
        Subtitle: <Trans i18nKey="Remove synergy" />,
        Action: <Trans i18nKey="Remove synergy actions" />,
        Description: <Trans i18nKey="Remove synergy description" />,
      },
    ],
  },
  {
    Title: <Trans i18nKey="Reorganizing the view and viewing info" />,
    Columns: [
      {
        Subtitle: <Trans i18nKey="Move a task or group" />,
        Action: <Trans i18nKey="Move a task or group action" />,
        Description: <Trans i18nKey="Move a task or group description" />,
      },
      {
        Subtitle: <Trans i18nKey="Show task info" />,
        Action: <Trans i18nKey="Show task info action" />,
        Description: <Trans i18nKey="Show task info description" />,
      },
    ],
  },
];

export const actionIcons = [
  {
    Icon: <PanToolAltIcon />,
    Action: <Trans i18nKey="Click or Click & drag" />,
  },
  {
    Icon: <PanToolIcon />,
    Action: <Trans i18nKey="Grab (a task)" />,
  },
  {
    Icon: <OpenWithIcon />,
    Action: <Trans i18nKey="Move (a group)" />,
  },
  {
    Icon: <ZoomInIcon />,
    Action: <Trans i18nKey="Zoom in and out (scroll wheel)" />,
  },
];
