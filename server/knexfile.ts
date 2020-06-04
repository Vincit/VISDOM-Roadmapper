import Dotenv from 'dotenv';
Dotenv.config();

const config = {
  development: {
    client: 'postgresql',
    connection: {
      port: parseInt(process.env.KNEX_PORT!),
      host: process.env.KNEX_HOST,
      database: process.env.KNEX_DATABASE,
      user: process.env.KNEX_USER,
      password: process.env.KNEX_PASSWORD,
    },
    migrations: {
      directory: './src/migrations',
    },
    seeds: {
      directory: './src/seeds',
    },
  },
};

module.exports = config;
export default config;
