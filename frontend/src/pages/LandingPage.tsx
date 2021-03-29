import React from 'react';
import styled from 'styled-components';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ReactComponent as VisdomLogo } from '../icons/visdom_icon.svg';
import { ReactComponent as VincitLogo } from '../icons/vincit_text_logo.svg';
import BackgroundImage from '../visdom-background.png';

const Background = styled.div`
  :before {
    content: '';
    background-image: url(${BackgroundImage});
    background-size: cover;
    background-repeat: no-repeat;
    filter: blur(0.55%);
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 1025px;
    border: 0px;
  }
  display: grid;

  width: 100vw;
  min-height: 100vh;
  grid-template-rows: 1fr auto auto;

  /* absolute position needed while NavBar is rendered by App */
  position: absolute;
  top: 0;
  left: 0;

  font-family: Work Sans;
  font-style: normal;
  font-weight: normal;

  border: 0;
  margin: 0;
  padding: 0;
  justify-content: start;
  vertical-align: middle;
  box-sizing: border-box;

  h1 {
    /* headings/h1 */
    font-family: Anonymous Pro;
    font-style: normal;
    font-weight: normal;
    font-size: 56px;
    line-height: 100%;
    letter-spacing: 0.2em;
    text-transform: uppercase;

    color: #ffffff;
    margin: 20px 10px;
  }

  h2 {
    /* headings/h2.light */
    font-size: 24px;
    line-height: 32px;

    /* white */
    color: #ffffff;
    opacity: 0.7;

    margin: 20px 0px;
  }

  ul {
    margin: 12px;
    padding: 0px 8px;
  }

  li {
    /* Paragraph / Body 1 */
    font-size: 14px;
    line-height: 20px;
    /* or 143% */
    letter-spacing: -0.02em;

    /* dark grey */
    color: #6a6a6a;

    text-align: start;
    ::marker {
      font-size: 1.5em;
      /* link.cta */
      color: #0ec679;
    }
    overflow-wrap: break-word;
  }
`;

const HomeDiv = styled.div`
  position: relative;
  width: 100vw;
`;

const Gradient = styled.div`
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.7) 0%,
    #c3c3c3 85.42%,
    #d3d3d3 100%
  );
`;

const TopBar = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  padding: 0px;

  position: relative;
  height: 32px;
  top: 46px;

  margin: 0px 10vw;
  svg {
    height: 32px;
    width: auto;
  }
`;

const LoginButton = styled(Link)`
  /* Button / Small / Outlined */

  padding: 10px 16px;
  left: calc(100% - width);

  /* link.cta */
  background: #0ec679;
  border-radius: 25px;

  /* Inside Auto Layout */
  font-weight: 500;
  font-size: 13px;
  line-height: 16px;
  color: #ffffff;
`;

const VisdomBigLogo = styled(VisdomLogo)`
  position: relative;
  width: 300px;
  height: auto;
  max-width: 40vw;
  margin-top: 12rem;
  margin-bottom: 4rem;
`;

const Cards = styled.div`
  background-image: linear-gradient(
    176deg,
    rgba(0, 0, 0, 0),
    rgba(0, 0, 0, 0) 60%,
    rgba(250, 250, 250, 1) 60%
  );
  padding: 0px max(calc((100% - 1000px) / 2), 8vw);
  margin-top: 8em;
  display: grid;
  gap: 35px;
  grid-template-columns: max-content;
  @media (min-width: calc(3 * 310px + 20px)) {
    grid-template-columns: repeat(3, 1fr);
  }
  justify-content: center;
  align-content: center;
`;

const Card = styled.div`
  padding: 0px 26px;
  padding-bottom: 36px;
  text-align: start;
  max-width: 94vw;

  /* white */
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0px 20px 70px rgba(0, 0, 0, 0.2);

  /* headings/h3 */
  h3 {
    font-weight: 600;
    font-size: 20px;
    line-height: 140%;
    /* identical to box height, or 140% */
    letter-spacing: -0.03em;
    color: #000000;
    margin: 30px 0px;
  }

  hr {
    width: 20px;
    height: 0px;
    left: 0px;
    margin: 30px 0px;

    /* blue.deep */
    border: 1px solid #00a3ff;
  }
`;

const Content = styled.div`
  background: rgba(250, 250, 250, 1);
  padding: 4rem max(calc((100% - 1000px) / 2), 8vw);
  padding-top: 8rem;
  display: grid;
  gap: 2rem;

  text-align: start;

  * {
    max-width: 100%;
  }

  div {
    /* Body */
    font-size: 14px;
    line-height: 150%;
    /* or 21px */

    /* Black/60 */
    color: #696969;

    margin: 17px 0px;
  }

  a {
    color: #0ec679;
  }

  strong {
    color: #00a3ff;
  }

  h2 {
    font-weight: 600;
    font-size: 30px;
    line-height: 32px;
    /* identical to box height, or 107% */
    letter-spacing: -0.03em;

    /* Black / 100 */
    color: #000000;

    /* Inside Auto Layout */
    margin: 17px 0px;
  }
  grid-template-columns: 1fr;
  @media (min-width: calc(2 * 300px + 40px)) {
    grid-template-columns: repeat(2, 1fr);
    div {
      grid-column: span 2;
    }
  }
  @media (min-width: calc(3 * 300px + 40px)) {
    grid-template-columns: repeat(3, 1fr);
    div {
      grid-column: span 2;
    }
  }
`;

const Contact = styled.div`
  /* Black / 10 */
  background: #e3e3e3;
  position: relative;
  width: 100vw;
  min-height: 320px;
  text-align: center;
  letter-spacing: 0.02em;

  h3 {
    /* Subtitle */
    font-weight: 500;
    font-size: 20px;
    line-height: 23px;
    height: 23px;
    margin: 86px 0px 63px 0px;

    color: #000000;
  }

  div {
    justify-content: center;
    display: grid;
    gap: 20px;
    grid-template-columns: auto;
    @media (min-width: calc(2 * 220px)) {
      grid-template-columns: repeat(2, fit-content(20%));
    }
  }

  a {
    /* Auto Layout */
    padding: 10px 16px;

    height: 34px;
    min-width: max-content;

    /* Brand / Emerald */
    border: 2px solid #0ec679;
    border-radius: 25px;

    /* Body (small) */
    font-size: 12px;
    line-height: 100%;
    color: #000000;
  }
`;

const Footer = styled.div`
  background: #000000;
  position: relative;
  width: 100vw;
  padding: 140px max(calc((100% - 1000px) / 2), 8vw);
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 40px;
  div {
    flex: 1 1 30%;
  }
  color: #ffffff;
  svg {
    margin: 40px 0px;
  }
  p {
    margin-bottom: 40px;
  }
  a {
    color: #ffffff;
  }
`;

const cardData = [
  {
    title: 'Stakeholder evaluations',
    points: [
      'Product direction is based on evaluations of different people, each experts on their field',
      'Customer representatives provide info on the value produced',
      'Developers can speak aloud their estimations of task complexities',
    ],
  },
  {
    title: 'Balance your roadmap',
    points: [
      'Visualize stakeholder expectation fulfillment',
      'Create milestones and alternative scenarios to arrange future development',
      'Use different weighting to prioritize different clients',
    ],
  },
  {
    title: 'Keep track of progression',
    points: [
      'Track the completion of development tasks and milestones',
      'Fine-tune work or values estimations based on retrospective analysis',
      'Keep the big picture of the development always at hand',
    ],
  },
];

export const LandingPage = () => {
  return (
    <Background>
      <HomeDiv>
        <Gradient>
          <TopBar>
            <VisdomLogo />
            <span />
            <LoginButton as={Link} to="/login">
              <Trans i18nKey="Login" />
            </LoginButton>
          </TopBar>
          <VisdomBigLogo />
          <h1>Visdom roadmap tool</h1>
          <h2>Open-source roadmap planning and visualisation tool</h2>
          <Cards>
            {cardData.map(({ title, points }) => (
              <Card key={title}>
                <h3>{title}</h3>
                <hr />
                <ul>
                  {points.map((e) => (
                    <li key={`${title}-${e}`}>{e}</li>
                  ))}
                </ul>
              </Card>
            ))}
          </Cards>
        </Gradient>

        <Content>
          <div>
            <h2>Product roadmapping</h2>
            <p>
              When we talk about a roadmap in this context, we talk about
              product planning. More specifically, planning upcoming product
              development versions ahead. This is a task, which is usually the
              PO’s responsibility. Typically, a PO listens to all stakeholders
              (developers, customer representatives, product managers, sales
              team) and constructs the roadmap to best serve all parties
              involved.
            </p>
            <p>
              Roadmap offers a direction to a product. In this context the
              roadmap consists of sequential future versions, named as
              scenarios. Each scenario consists of milestones, which can have
              any scope. In this context we are using user stories as we are
              developing this tool from a software development perspective.
            </p>
            <p>
              To help achieve this goal, the roadmapper offers analysis tools to
              help the project owner to tailor the roadmap to a form where it
              best fulfills the wishes of customers and the team. Tool
              integrates currently with JIRA and other integrations are planned
              as well such as Redmine integration. This makes it easy to import
              roadmap items from the existing project management tools.
            </p>
          </div>
          <img alt="placeholder" />

          <img alt="placeholder" />
          <div>
            <h2>Rationale</h2>
            <p>
              The product owner plans a few versions ahead to gain aim towards
              specific goals. There can be many perspectives to goals but one
              universal goal for a product is to create value for the customers
              - to make profit. That goal generally contains many variables.
              From profitability perspective PO might think about these
              questions, when thinking about which stories to add to a version:
            </p>
            <ul>
              <li>What future customers might we acquire with this?</li>
              <li>
                How many current clients would profit from this? (customer need
                {'->'} more sales / continuity)
              </li>
              <li>
                How much work would this need relative to the income it creates?
              </li>
              <li>Which stories should be there before this one?</li>
              <li>
                We want to concentrate on this specific customer’s needs. How
                could we serve that goal the best?
              </li>
            </ul>
            <p>
              For development processes it is easy to select any existing tool,
              which supports the teams way to work. Adding a workflow layer for
              product roadmap planning to any existing tool creates unnecessary
              payload for all stakeholders. Having a separate tool for roadmap
              planning helps all stakeholders in their daily work:
            </p>
            <ul>
              <li>
                For developers the roadmap tool offers a separate “forum” for
                evaluating future stories, which helps to minimize context
                switch toll.
              </li>
              <li>
                When sales have a view of future stories and versions, it can
                more efficiently target new customers and ease communication
                towards existing clients.
              </li>
              <li>
                Evaluations of customer need for each story and value a customer
                might (or will) bring helps the product owner to plan versions
                ahead to best serve the business needs.
              </li>
              <li>
                Transparent and accessible “board” for future stories with
                workload and business value evaluation, remove most of the
                manual steps the product owner needs to evaluate which stories
                are most important.
              </li>
            </ul>
          </div>

          <div>
            <h2>Current list of features</h2>
            <p>
              The following descriptions and images present some of the ideas
              that are to be implemented in the tool. Currently VISDOM is a work
              in progress project.
            </p>
            <ul>
              <li>
                <strong>Dashboard</strong> - A view for the PO to get a wider
                view of the product development process.
              </li>
              <li>
                <strong>Planning tools - version milestones</strong> - A view
                for planning the current scenario based on the ordered and rated
                milestones. The graph represents how the estimated work
                (developers) correlate to the estimated value produced
                (customers). PO could arrange the upcoming milestones e.g. by
                “most value created” - for all customers or just specific ones.
              </li>
              <li>
                <strong>Task ordering</strong> - PO can order the rated tasks in
                whatever order he/she wants to.
              </li>
              <li>
                <strong>Client weighting</strong> - PO can set different
                weighting to different customers to try out how the roadmap
                would look like if someone’s prioritized over another.
              </li>
              <li>
                <strong>Time estimation</strong> - Based on pure guesses or
                already realized milestones, PO can estimate how other
                milestones’ durations look like based on another one.
              </li>
              <li>
                <strong>Developer / customer expert evaluation</strong> - The
                estimations are based on expert evaluation; developers rate
                tasks by how work-heavy they see each of them, and the customers
                by how much value it brings to them.
              </li>
              <li>
                <strong>Time estimation</strong> - Based on pure guesses or
                already realized milestones, PO can estimate how other
                milestones’ durations look like based on another one.
              </li>
            </ul>
            <p>
              See example images from{' '}
              <a href="https://iteavisdom.org/news/142">this article</a>.
            </p>
          </div>
          <img alt="placeholder" />
        </Content>
      </HomeDiv>
      <Contact>
        <h3>Contact us</h3>
        <div>
          <a href="https://github.com/Vincit/VISDOM-Roadmapper">
            Check us out on github
          </a>
          <a href="mailto:visdom@vincit.fi">Send us email</a>
        </div>
      </Contact>
      <Footer>
        <div style={{ textAlign: 'left' }}>
          <strong>VISDOM Roadmap visualization tool</strong>
          <p>
            The VISDOM project will develop new types of visualisations that
            utilise and merge data from several data sources in modern DevOps
            development. The aim is to provide simple “health check”
            visualisations about the state of the development process, software
            and use.
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
      </Footer>
    </Background>
  );
};
