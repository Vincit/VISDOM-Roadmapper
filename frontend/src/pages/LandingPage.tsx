import React from 'react';
import styled from 'styled-components';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ReactComponent as VisdomLogo } from '../icons/visdom_icon.svg';
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

  display: grid;

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
  padding: 0px 10vw;
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

  ul {
    margin: 0px 12px;
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
    max-width: 40ch;
    overflow-wrap: break-word;
  }
`;

const Content = styled.div`
  background: rgba(250, 250, 250, 1);
  padding: 4rem 10vw;
  padding-top: 8rem;
  display: grid;
  gap: 2rem;

  text-align: start;

  * {
    max-width: 100%;
  }

  p {
    /* Body */
    font-size: 14px;
    line-height: 150%;
    /* or 21px */

    /* Black/60 */
    color: #696969;

    margin: 17px 0px;
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
  min-height: 500px;
  h1 {
    margin-top: 200px;
  }
`;

const cardData = [
  {
    title: 'Stakeholder evaluations',
    points: [
      `
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
      eiusmod tempor incididunt ut labore et dolore magna aliqua.
    `,
      'two',
      'three',
    ],
  },
  {
    title: 'Balance your roadmap',
    points: ['one', 'two', 'three'],
  },
  {
    title: 'Keep track of progression',
    points: ['one', 'two', 'three'],
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
            <h2>Something something</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Id
              nibh tortor id aliquet lectus proin nibh. Laoreet id donec
              ultrices tincidunt arcu non. Egestas integer eget aliquet nibh. Et
              malesuada fames ac turpis egestas. Sit amet nulla facilisi morbi
              tempus iaculis urna. Aliquam etiam erat velit scelerisque in
              dictum non. Tempor orci eu lobortis elementum nibh tellus molestie
              nunc non. Venenatis lectus magna fringilla urna porttitor. Iaculis
              at erat pellentesque adipiscing commodo elit at. Eu non diam
              phasellus vestibulum.
            </p>
          </div>
          <img
            src="http://2.bp.blogspot.com/_h937HNtz6ek/S0XR_lEkQPI/AAAAAAAAQKU/z8Ky_coR39g/s400/cute-cats-39.jpg"
            alt="cat"
          />

          <img
            src="http://s6.favim.com/orig/61/cute-lovely-white-cat-Favim.com-569356.jpg"
            alt="cat"
          />
          <div>
            <h2>Something something</h2>
            <p>
              Suspendisse interdum consectetur libero id faucibus nisl. Turpis
              massa sed elementum tempus. Nec nam aliquam sem et tortor
              consequat. Ac tortor dignissim convallis aenean et tortor at risus
              viverra. Pharetra et ultrices neque ornare aenean euismod
              elementum nisi quis. Scelerisque felis imperdiet proin fermentum.
              Cursus in hac habitasse platea dictumst quisque. Sed velit
              dignissim sodales ut eu sem integer vitae. Tempus urna et pharetra
              pharetra massa. Semper quis lectus nulla at volutpat diam ut
              venenatis. Donec ultrices tincidunt arcu non sodales neque.
              Laoreet sit amet cursus sit amet. At imperdiet dui accumsan sit.
            </p>
          </div>

          <div>
            <h2>Something something</h2>
            <p>
              Feugiat vivamus at augue eget arcu dictum varius duis. Et
              sollicitudin ac orci phasellus egestas tellus rutrum. Enim
              facilisis gravida neque convallis a cras semper auctor neque. Arcu
              ac tortor dignissim convallis aenean et. Vitae et leo duis ut
              diam. Sapien eget mi proin sed libero. Nam libero justo laoreet
              sit amet cursus sit. Enim sit amet venenatis urna cursus eget
              nunc. At tellus at urna condimentum mattis pellentesque id. Nunc
              sed augue lacus viverra vitae congue eu. Consectetur adipiscing
              elit pellentesque habitant morbi tristique. Tincidunt lobortis
              feugiat vivamus at augue eget arcu dictum varius. Eget lorem dolor
              sed viverra ipsum nunc aliquet bibendum. Tincidunt eget nullam non
              nisi. Augue interdum velit euismod in pellentesque massa. Diam
              donec adipiscing tristique risus nec feugiat. Purus sit amet
              luctus venenatis lectus magna. Donec massa sapien faucibus et
              molestie ac feugiat sed. Velit egestas dui id ornare.
            </p>
          </div>
          <img
            src="http://images2.fanpop.com/images/photos/8400000/cute-cats-cats-8477436-400-261.jpg"
            alt="cat"
          />
        </Content>
      </HomeDiv>
      <Contact>
        <h3>Contact us</h3>
        <div>
          <a href="https://github.com/Vincit/VISDOM-Roadmapper">
            Check us out on github
          </a>
          <a href="mailto:nobody@example.com">Send us email</a>
        </div>
      </Contact>
      <Footer>
        <h1>Footer</h1>
      </Footer>
    </Background>
  );
};
