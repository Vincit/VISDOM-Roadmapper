import { CustomPicker } from 'react-color';
import convert from 'color-convert';
import {
  EditableInput,
  Hue,
  Saturation,
} from 'react-color/lib/components/common';

import classNames from 'classnames';
import css from './ColorPicker.module.scss';

const classes = classNames.bind(css);

interface HSVColor {
  a?: number;
  h: number;
  s: number;
  v: number;
  source?: string;
}

interface HSLColor {
  a?: number;
  h: number;
  l: number;
  s: number;
  source?: string;
}

const picker = () => <div className={classes(css.picker)} />;

export const ColorPicker = CustomPicker((props: any) => {
  const { hex } = props;

  const handleChange = (value: HSVColor | HSLColor) => {
    if ('v' in value)
      props.setColor(
        `#${convert.hsv.hex([value.h, value.s * 100, value.v * 100])}`,
      );
    else
      props.setColor(
        `#${convert.hsl.hex([value.h, value.s * 100, value.l * 100])}`,
      );
  };
  return (
    <div className={classes(css.container)}>
      <div className={classes(css.saturation)}>
        <Saturation {...props} value={hex} onChange={handleChange} />
      </div>
      <div className={classes(css.hue)}>
        <Hue {...props} value={hex} onChange={handleChange} pointer={picker} />
      </div>
      <div className={classes(css.hex)}>
        Hex:
        <EditableInput
          value={hex}
          onChange={(value) => props.setColor(value)}
        />
      </div>
    </div>
  );
});
