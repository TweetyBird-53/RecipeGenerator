import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { promises as fs } from 'fs';

const DB_PATH = 'offline/5k-recipes.db';

async function extractRecipes(limit = 5000) {
    const db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database,
    });
  
    const recipes = await db.all(`
      SELECT id, Title AS title, Ingredients AS ingredients, Instructions AS instructions
      FROM recipes
      LIMIT ?;
    `, [limit]);
  
    await db.close();
  
    return recipes.map(recipe => ({
      id: recipe.id,
      title: `${recipe.title}` || 'Unknown Recipe',
      Ingredients: `${recipe.ingredients || 'No ingredients found'}`,
      Instructions: `${recipe.instructions || 'No instructions found'}`
    }));
  }
  

async function saveJSON(data, filename) {
  await fs.writeFile(filename, JSON.stringify(data, null, 2));
  console.log(`Saved data to ${filename}`);
}

(async () => {
  const recipes = await extractRecipes();
  await saveJSON(recipes, 'recipes.json');
})();
