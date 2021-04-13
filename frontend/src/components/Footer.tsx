import React from 'react';
import classNames from 'classnames';
import { ReactComponent as VincitLogo } from '../icons/vincit_text_logo.svg';
import css from './Footer.module.scss';

const classes = classNames.bind(css);

export const Footer = () => (
  <footer className={classes(css.footer)}>
    <div style={{ textAlign: 'left' }}>
      <strong>VISDOM Roadmap visualization tool</strong>
      <p>
        The VISDOM project will develop new types of visualisations that utilise
        and merge data from several data sources in modern DevOps development.
        The aim is to provide simple “health check” visualisations about the
        state of the development process, software and use.
      </p>
      <strong>Project repository</strong>
      <p>
        <a href="https://github.com/Vincit/VISDOM-Roadmapper">
          https://github.com/Vincit/VISDOM-Roadmapper
        </a>
      </p>
      <strong>Read more</strong>
      <p>
        <a href="https://itea3.org/news/the-itea-project-visdom-developed-open-source-roadmap-planning-and-visualisation-tool.html">
          https://itea3.org/news/the-itea-project-visdom-developed-open-source-roadmap-planning-and-visualisation-tool.html
        </a>
      </p>
    </div>
    <div style={{ textAlign: 'right' }}>
      <strong>Designed and developed by</strong>
      <br />
      <VincitLogo />
      <p>
        Vincit Ltd
        <br />
        <a href="https://www.vincit.fi/en/">vincit.fi</a>
      </p>
      <strong>Contact the team</strong>
      <p>
        <a href="mailto:visdom@vincit.fi">visdom@vincit.fi</a>
      </p>
    </div>
  </footer>
);
