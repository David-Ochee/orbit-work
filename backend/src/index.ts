import 'dotenv/config';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import app from './app';
import { schema } from './graphql/schema';

const PORT = process.env.PORT || 4000;

const httpServer = createServer(app);

const wss = new WebSocketServer({
  server: httpServer,
  path: process.env.GRAPHQL_WS_PATH || '/graphql/ws',
});
useServer({ schema }, wss);

httpServer.listen(PORT, () => {
  console.warn(`🚀 API ready at http://localhost:${PORT}`);
  console.warn(
    `🔌 WS  ready at ws://localhost:${PORT}${process.env.GRAPHQL_WS_PATH || '/graphql/ws'}`,
  );
});
