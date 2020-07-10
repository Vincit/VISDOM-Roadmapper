import styled, { css } from 'styled-components';

export const LayoutRow = styled.div<{
  overflowY?: 'scroll' | 'visible' | 'auto';
}>`
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  padding: 0;
  margin: 0;
  overflow-y: ${(props) => (props.overflowY ? props.overflowY : 'visible')};
`;

export const LayoutCol = styled.div<{
  overflowY?: 'scroll' | 'visible' | 'auto';
}>`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 0;
  margin: 0;
  overflow-y: ${(props) => (props.overflowY ? props.overflowY : 'auto')};
`;

export const TopBar = styled.div`
  display: flex;
  justify-content: start;
  vertical-align: middle;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.35);
`;

export const StyledTable = styled.table`
  thead {
    border-bottom: 1px solid rgb(0, 0, 0, 0.1);
  }
`;

export const StyledTh = styled.th<{
  clickable?: boolean;
  textAlign?: 'end' | 'left' | 'center';
}>`
  font-style: normal;
  font-size: 16px;
  line-height: 19px;
  padding: 16px;
  vertical-align: middle;
  text-align: ${(props) => (props.textAlign ? props.textAlign : 'left')};
  ${(props) =>
    props.clickable &&
    css`
      position: relative;
      cursor: pointer;
      user-select: none;
    `};
`;

export const StyledTd = styled.td<{
  clickable?: boolean;
  nowrap?: boolean;
  textAlign?: 'end' | 'left' | 'center';
}>`
  border-bottom: 1px solid rgb(0, 0, 0, 0.1);
  padding: 16px;
  vertical-align: middle;
  max-width: 30em;
  cursor: ${(props) => (props.clickable ? 'pointer' : 'inherit')};
  text-align: ${(props) => (props.textAlign ? props.textAlign : 'left')};
  white-space: ${(props) => (props.nowrap ? 'nowrap' : 'inherit')};
`;

export const HeaderSpan = styled.span`
  position: relative;

  svg {
    position: absolute;
    right: -1.6em;
    width: 1.2em;
    height: 1.2em;
  }
`;

export const SearchBarContainer = styled.div`
  position: relative;
  display: flex;
  flex-grow: 1;
  max-width: 20em;
  min-width: 10em;

  svg {
    fill: black;
    position: absolute;
    top: 1em;
    right: 1em;
  }
`;
