const { RequestHandler } = require('express');
const OpenAI = require('openai');
require('dotenv/config');

const openaiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: openaiKey,
});

const queryOpenAIEmbedding = async (_req, res, next) => {
  if (res.locals.embedding) return next();
  
  const { userQuery } = res.locals;
  console.log('userQuery: ', userQuery);
  if (!userQuery) {
    const error = {
      log: 'queryOpenAIEmbedding did not receive a user query',
      status: 500,
      message: { err: 'An error occurred before querying OpenAI' },
    };
    return next(error);
  }
  try {
    const embeddingRes = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: userQuery,
    });
    console.log('embeddingRes: ', embeddingRes);
    res.locals.embedding = embeddingRes.data[0].embedding;
    return next();
  } catch (err) {
    return next({
      log: `StringContaining "queryOpenAI: Error: OpenAI error"`,
      message: { err: 'An error occurred while querying OpenAI' },
      status: 500,
    });
  }
};

const queryOpenAIChat = async (_req, res, next) => {
  const { userQuery, pineconeQueryResult } = res.locals;
  if (!userQuery) {
    const error = {
      log: 'queryOpenAIChat did not receive a user query',
      status: 500,
      message: { err: 'An error occurred before querying OpenAI' },
    };
    return next(error);
  }
  if (!pineconeQueryResult) {
    const error = {
      log: 'queryOpenAIChat did not receive pinecone query results',
      status: 500,
      message: { err: 'An error occurred before querying OpenAI' },
    };
    return next(error);
  }

  const movieOptions = pineconeQueryResult.map((movie, i) => `'''Option ${i}: ${movie.metadata?.title}: ${movie.metadata?.plot}'''`).join(', ');

  const instructRole = `You are a helpful assistant that recommends movies to users based on their interests.`;
  const instructGoal = `When given a user's query and a list of movies, recommend a single movie to the user and include a brief one-sentence description without spoilers.`;
  const instructFormat = `
  Your response should be in the format: 
  "[Movie Title] - [One-sentence description]"`;
  const systemMessage = instructRole + instructGoal + instructFormat;
  const userMessage = `
  User request: """I want to watch a movie about: ${userQuery}"""
  Movie options: """${movieOptions}`;
  
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
      store: true,
    });
    const { content } = completion.choices[0].message;
    if (!content) {
      const error = {
        log: 'OpenAI did not return a completion',
        message: { err: 'An error occurred while querying OpenAI' },
        status: 500,
      };
      return next(error);
    }
    res.locals.allMovieRecommentations = completion.choices.map((choice) => choice.message.content || '');
    res.locals.movieRecommendation = content;
    return next();
  } catch (err) {
    const error = {
      log: `queryOpenAIChat: ${err}`,
      message: { err: 'An error occurred while querying OpenAI' },
      status: 500,
    };

    return next(error);
  }
};

module.exports = {
  queryOpenAIEmbedding,
  queryOpenAIChat,
};