import { Pinecone } from '@pinecone-database/pinecone';
import 'dotenv/config';

const pineconeKey = process.env.PINECONE_API_KEY;

// Initialize the Pinecone client
const pc = new Pinecone({
  apiKey: pineconeKey,
  // environment: process.env.PINECONE_HOST_URL,
});

const Index = pc.index('movies');

export const queryPineconeDatabase = async (_req, res, next) => {
  const { embedding } = res.locals;

  if (!embedding) {
    const error = {
      log: 'Database query middleware did not receive embedding',
      status: 500,
      message: { err: 'An error occurred before querying the database' },
    };
    return next(error);
  }
  const databaseQuery = {
    vector: embedding, // The embedding to query against
    topK: 3, // Number of results you want to retrieve
    includeMetadata: true, // Include metadata in the result
  };

  try {
    // Query Pinecone with the embedding
    const databaseQueryResult = await Index.query(databaseQuery);
    console.log('databaseQueryResult: ', databaseQueryResult.matches);
    // Store the query result in res.locals if successful
    res.locals.pineconeQueryResult = databaseQueryResult.matches;
    return next();
  } catch (err) {
    return next({
      log: 'queryPineconeDatabase: Error: Database query failed',
      message: { err: 'An error occurred while querying database' },
      status: 500,
    });
  }
};
