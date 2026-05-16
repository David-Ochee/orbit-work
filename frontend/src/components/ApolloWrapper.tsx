'use client';

import { ApolloClient, InMemoryCache, ApolloProvider, split, HttpLink } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const httpLink = new HttpLink({ uri: `${API_URL}/graphql` });

const wsLink =
  typeof window !== 'undefined'
    ? new GraphQLWsLink(createClient({ url: API_URL.replace(/^http/, 'ws') + '/graphql/ws' }))
    : null;

const splitLink =
  wsLink !== null
    ? split(
        ({ query }) => {
          const def = getMainDefinition(query);
          return def.kind === 'OperationDefinition' && def.operation === 'subscription';
        },
        wsLink,
        httpLink,
      )
    : httpLink;

const client = new ApolloClient({ link: splitLink, cache: new InMemoryCache() });

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
