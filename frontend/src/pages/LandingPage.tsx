import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { ReactComponent as VisdomLogo } from '../icons/visdom_icon.svg';
import { ReactComponent as RoamappingSvg } from '../assets/images/roadmapping.svg';
import { ReactComponent as RationaleSvg } from '../assets/images/rationale.svg';
import { ReactComponent as FeaturesSvg } from '../assets/images/features.svg';
import { LandingPageNavBar } from '../components/LoginNavBar';
import { Footer } from '../components/Footer';
import { paths } from '../routers/paths';
import css from './LandingPage.module.scss';

const classes = classNames.bind(css);

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
      'Fine-tune complexity or value estimations based on retrospective analysis',
      'Keep the big picture of the development always at hand',
    ],
  },
];

export const LandingPage = () => {
  return (
    <div className={classes(css.background)}>
      <LandingPageNavBar />
      <div>
        <div className={classes(css.gradient)}>
          <VisdomLogo className={classes(css.bigLogo)} />
          <h1>Visdom roadmap tool</h1>
          <h2>Open-source roadmap planning and visualisation tool</h2>
          <div className={classes(css.cards)}>
            {cardData.map(({ title, points }) => (
              <div className={classes(css.card)} key={title}>
                <h3>{title}</h3>
                <hr />
                <ul>
                  {points.map((e) => (
                    <li key={`${title}-${e}`}>{e}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className={classes(css.content)}>
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
          <RoamappingSvg />

          <RationaleSvg />
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
                milestones. The graph represents how the estimated complexity
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
                tasks by how complex they see each of them, and the customers by
                how much value it brings to them.
              </li>
            </ul>
            <p>
              See example images from{' '}
              <a href="https://iteavisdom.org/news/142">this article</a>.
            </p>
          </div>
          <FeaturesSvg />
        </div>
      </div>
      <div className={classes(css.login)}>
        <h3>Ready to visualize your roadmap?</h3>
        <div>
          <Link className={classes(css.registerButton)} to={paths.registerPage}>
            <Trans i18nKey="Create an account" />
          </Link>
        </div>
        <Trans i18nKey="Already have an account?" />{' '}
        <Link to={paths.loginPage}>
          <Trans i18nKey="Log in" />
        </Link>
      </div>
      <div className={classes(css.contact)}>
        <h3>Contact us</h3>
        <div>
          <a href="https://github.com/Vincit/VISDOM-Roadmapper">
            Check us out on github
          </a>
          <a href="mailto:visdom@vincit.fi">Send us email</a>
        </div>
      </div>
      <Footer />
    </div>
  );
};
