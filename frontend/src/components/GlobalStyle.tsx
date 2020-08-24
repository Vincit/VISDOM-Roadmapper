import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  body {
    font-family: Work Sans, Arial, Helvetica, sans-serif;
    margin: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    height: 100vh;
    width: 100vw;
    overflow-y: auto;
    font-size: 14px;
  }

  #root {
    height: 100vh;
    width: 100vw;
    overflow-y: auto;
  }

  .App {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    text-align: center;
    overflow-y: auto;
  }
`;
