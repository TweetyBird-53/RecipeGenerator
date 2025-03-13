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

  // Add embeddings to recipes
  for (const recipe of recipes) {
    const text = `Title: ${recipe.title}\nIngredients: ${recipe.Ingredients}\nInstructions: ${recipe.Instructions}`;
    const embedding = await generateEmbedding(text);
    recipe.embedding = embedding;
  }

  // Save the processed recipes with embeddings
  writeFileSync('processed_recipes.json', JSON.stringify(recipes, null, 2));
  console.log('Processed recipes saved to processed_recipes.json');
}

// Call the processRecipes function to generate embeddings and save the data
processRecipes();
