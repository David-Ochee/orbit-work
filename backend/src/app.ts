import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { ApolloServer } from 'apollo-server-express';
import { schema } from './graphql/schema';
import bountiesRouter from './routes/bounties';
import applicationsRouter from './routes/applications';
import usersRouter from './routes/users';
import authRouter from './routes/auth';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(compression());
app.use(express.json());
app.use(
  rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// REST routes
app.use('/api/auth', authRouter);
app.use('/api/bounties', bountiesRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/users', usersRouter);

// GraphQL
const apollo = new ApolloServer({ schema, context: ({ req }) => ({ req }) });
(async () => {
  await apollo.start();
  apollo.applyMiddleware({ app: app as any, path: process.env.GRAPHQL_PATH || '/graphql' });
})();

app.use(errorHandler);

export default app;
