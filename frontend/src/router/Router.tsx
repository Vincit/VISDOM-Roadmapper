import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { routes } from './routes';

export const Router = () => {
  return (
    <Switch>
      {routes.map((route) => (
        <Route
          exact
          key={route.path}
          path={route.path}
          component={route.component}
        />
      ))}
    </Switch>
  );
};
