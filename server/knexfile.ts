import Dotenv from 'dotenv';
Dotenv.config();

const config = {
  development: {
    client: 'postgresql',
    connection: {
      port: parseInt(process.env.RDS_PORT!),
      host: process.env.RDS_HOSTNAME,
      database: process.env.RDS_DB_NAME,
      user: process.env.RDS_USERNAME,
      password: process.env.RDS_PASSWORD,
    },
    migrations: {
      directory: './src/migrations',
    },
    seeds: {
      directory: './src/seeds',
    },
  },
};

module.exports = config.development;
export default config.development;
