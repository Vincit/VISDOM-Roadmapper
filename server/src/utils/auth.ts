import { QueryBuilder } from 'objection';
import passport from 'koa-passport';
import * as passportLocal from 'passport-local';
import TokenStrategy from 'passport-auth-token';
import User from '../api/users/users.model';

const firstWithGraph = <T>(query: QueryBuilder<User, T>) =>
  query
    .withGraphFetched('[representativeFor, roles, emailVerificationLink]')
    .first();

const fetchUserById = async (id: number) =>
  await firstWithGraph(User.query().findById(id));

const fetchUserByEmail = async (email: string) =>
  await firstWithGraph(User.query().modify('findByEmail', email));

const fetchUserByToken = async (token: string) =>
  await firstWithGraph(User.query().where('authToken', token));

const addAuthToPassport = () => {
  passport.serializeUser((user: User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await fetchUserById(id);
      done(null, user ? user : null);
    } catch (err) {
      done(err, null);
    }
  });

  passport.use(
    new TokenStrategy(
      {
        headerFields: ['authorization'],
        session: false,
        caseInsensitive: true,
      },
      async (token, done) => {
        try {
          const user = await fetchUserByToken(token.replace(/^bearer +/i, ''));
          done(null, user ? user : false);
        } catch (err) {
          done(err, false);
        }
      },
    ),
  );

  const LocalStrategy = passportLocal.Strategy;
  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
          const user = await fetchUserByEmail(email);
          if (!user) return done(null, false);

          if (await user.verifyPassword(password)) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        } catch (err) {
          done(err, false);
        }
      },
    ),
  );
};

export const setupAuth = addAuthToPassport;
