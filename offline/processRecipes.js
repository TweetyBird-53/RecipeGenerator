import { readFileSync, writeFileSync } from 'fs';
import { OpenAI } from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import 'dotenv/config';


const openaiKey = process.env.OPENAI_API_KEY;
// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: openaiKey,
});

// const pineconeKey = process.env.PINECONE_API_KEY;
// // Initialize Pinecone client
// const pinecone = new Pinecone({
//   apiKey: pineconeKey,
//   // environment: process.env.PINECONE_HOST_URL,
// });

// Function to generate embeddings using OpenAI API
async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',  // You can choose another model
    input: text,
  });
  return response.data[0].embedding;
}

// Function to process the recipes
async function processRecipes() {
  const recipes = JSON.parse(readFileSync('recipes.json', 'utf8'));

  // Process each recipe and store it inside a "recipe" object
  const processedRecipes = [];

  // Add embeddings to recipes
  for (const recipe of recipes) {
    const text = `Title: ${recipe.title}\nIngredients: ${recipe.Ingredients}\nInstructions: ${recipe.Instructions}`;
    const embedding = await generateEmbedding(text);
    // recipe.embedding = embedding;
    processedRecipes.push({
      recipe: {
        id: String(recipe.id),
        title: recipe.title,
        Ingredients: recipe.Ingredients,
        Instructions: recipe.Instructions,
    },
    embedding: embedding, // Keep the embedding separate
  });
  }

  

  // Save the processed recipes with embeddings
  writeFileSync('embeddings_data.json', JSON.stringify(processedRecipes, null, 2));
  console.log('Processed recipes saved to embeddings_data.json');
}

// Call the processRecipes function to generate embeddings and save the data
processRecipes();
