import passport from 'koa-passport';
import * as passportLocal from 'passport-local';
import TokenStrategy from 'passport-auth-token';
import User from '../api/users/users.model';

const fetchUserById = async (id: number) => {
  return await User.query().findById(id).first();
};

const fetchUserByName = async (username: string) => {
  return await User.query().modify('searchByUsernameExact', username).first();
};

const fetchUserByToken = async (token: string) => {
  return await User.query().where('authToken', token).first();
};

const addAuthToPassport = () => {
  passport.serializeUser((user: User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await fetchUserById(id);
      done(null, user ? user : false);
    } catch (err) {
      done(err, false);
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
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await fetchUserByName(username);
        if (!user) return done(null, false);

        if (await user.verifyPassword(password)) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (err) {
        done(err, false);
      }
    }),
  );
};

export const setupAuth = addAuthToPassport;
