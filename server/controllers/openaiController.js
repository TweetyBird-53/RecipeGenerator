import OpenAI from 'openai';
import 'dotenv/config';

const openaiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: openaiKey,
});

export const queryOpenAIEmbedding = async (_req, res, next) => {
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

export const queryOpenAIChat = async (_req, res, next) => {
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

  const recipeOptions = pineconeQueryResult
    .map(
      (recipe, i) =>
        `'''Option ${i}: ${recipe.metadata?.title}: ${recipe.metadata?.Instructions}'''`
    )
    .join(', ');

  const instructRole = `You are a helpful assistant that recommends a recipe to users based on their ingredients.`;
  const instructGoal = `When given a user's query and a list of ingredients, recommend a single recipe to the user and include a brief description with simple but clear steps to execute the recipe.`;
  const instructFormat = `
  Your response should be in the format: 
  "[Recipe Name] - [Brief description with steps]"`;
  const systemMessage = instructRole + instructGoal + instructFormat;
  const userMessage = `
  User request: """I have these ingredients in my fridge: ${userQuery}"""
  Recipe options: """${recipeOptions}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
      store: true,
    });
    
    const { content } = completion.choices[0].message;
    console.log("content: ", content);
    if (!content) {
      const error = {
        log: 'OpenAI did not return a completion',
        message: { err: 'An error occurred while querying OpenAI' },
        status: 500,
      };
      return next(error);
    }
    res.locals.allRecipeRecommentations = completion.choices.map(
      (choice) => choice.message.content || ''
    );
    res.locals.recipeRecommendation = content;
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