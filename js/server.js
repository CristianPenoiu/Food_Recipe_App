const express = require('express');
const neo4j = require('neo4j-driver');
const cors = require('cors');

const app = express();
const port = 3000;

// Enable CORS middleware
app.use(cors());

// Define Neo4j connection details
const URI = 'neo4j://34.232.57.230:7687';
const USER = 'neo4j';
const PASSWORD = 'internship-2024';

// Create a Neo4j driver instance
const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));

// Define route handler for /api/recipes endpoint
app.get('/api/recipes', async (req, res) => {
  res.charset = 'utf-8';

  const session = driver.session();

  try {
    // Run a Cypher query to fetch recipes from the database
    const result = await session.run(`
    MATCH (a:Author)-[:WROTE]->(r:Recipe)-[:CONTAINS_INGREDIENT]->(i:Ingredient)
    RETURN r.name AS name, a.name AS author, COUNT(i) AS numberOfIngredients, r.skillLevel AS skillLevel
    ORDER BY r.name  
    `);

    // Extract data from the result
    const recipes = result.records.map(record => ({
      name: record.get('name'),
      author: record.get('author'),
      skillLevel: record.get('skillLevel'),
      numberOfIngredients: record.get('numberOfIngredients').toNumber()
    }));

    res.json(recipes); // Send JSON response with the recipes data
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  } finally {
    await session.close();
  }
});

// Define route handler for /api/recipe/details/:name endpoint
app.get('/api/recipe/details/:name', async (req, res) => {
  res.charset = 'utf-8';

  const name = req.params['name'].trim(); // Extract the recipe name from the route parameter

  const session = driver.session();

  try {
    // Run a Cypher query to fetch recipes from the database based on the provided name
    result = await session.run(`
      MATCH (r:Recipe { name: " ${name}" })
      OPTIONAL MATCH (r)-[:CONTAINS_INGREDIENT]->(i:Ingredient)
      WITH r, COLLECT(i.name) AS ingredients
      RETURN r.description AS description, r.cookingTime AS cookingTime, r.preparationTime AS preparationTime, ingredients
    `);

    if (result.records.length === 0) {
      result = await session.run(`
      MATCH (r:Recipe { name: "${name}" })
      OPTIONAL MATCH (r)-[:CONTAINS_INGREDIENT]->(i:Ingredient)
      WITH r, COLLECT(i.name) AS ingredients
      RETURN r.description AS description, r.cookingTime AS cookingTime, r.preparationTime AS preparationTime, ingredients
    `);
    }
    
    // Extract data from the result
    const recipes = result.records.map(record => ({
      description: record.get('description'),
      cookingTime: record.get('cookingTime').toNumber(), // Assuming cookingTime is stored as a numeric value
      preparationTime: record.get('preparationTime').toNumber(), // Assuming preparationTime is stored as a numeric value
      ingredients: record.get('ingredients')
    }));

    res.json(recipes); // Send JSON response with the recipes data
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  } finally {
    await session.close();
  }
});


// Define route handler for /api/search endpoint
app.get('/api/search/:recipe_name', async (req, res) => {
  res.charset = 'utf-8';

  const session = driver.session();
  
  const recipe_name = req.params['recipe_name'].trim(); // Get the search query from the request query parameters

  try {
    // Run a Cypher query to search for recipes by name
    result = await session.run(`
    MATCH (a:Author)-[:WROTE]->(r:Recipe)-[:CONTAINS_INGREDIENT]->(i:Ingredient)
    WHERE toLower(r.name) CONTAINS toLower(" ${recipe_name}") // Case-insensitive search
    RETURN r.name AS name, a.name AS author, COUNT(i) AS numberOfIngredients, r.skillLevel AS skillLevel
    ORDER BY r.name  
    `);

    if (result.records.length === 0) {
      result = await session.run(`
      MATCH (a:Author)-[:WROTE]->(r:Recipe)-[:CONTAINS_INGREDIENT]->(i:Ingredient)
      WHERE toLower(r.name) CONTAINS toLower("${recipe_name}") // Case-insensitive search
      RETURN r.name AS name, a.name AS author, COUNT(i) AS numberOfIngredients, r.skillLevel AS skillLevel
      ORDER BY r.name  
      `);
    }

    // Extract data from the result
    const recipes = result.records.map(record => ({
      name: record.get('name'),
      author: record.get('author'),
      skillLevel: record.get('skillLevel'),
      numberOfIngredients: record.get('numberOfIngredients').toNumber()
    }));

    res.json(recipes); // Send JSON response with the search results
  } catch (error) {
    console.error('Error searching for recipes:', error);
    res.status(500).json({ error: 'Failed to search for recipes' });
  } finally {
    await session.close();
  }
});

app.get('/api/search/ingredients/:ingredients', async (req, res) => {
  res.charset = 'utf-8';
  
  const session = driver.session();
  
  let ingredientsList = req.params['ingredients'].split(',').map(ingredient => `"${ingredient.trim()}"`).join(', ');

  try {
    const result = await session.run(`
    MATCH (a:Author)-[:WROTE]->(r:Recipe)
    WHERE ALL(ingredient IN [${ingredientsList}] WHERE (r)-[:CONTAINS_INGREDIENT]->(:Ingredient {name: ingredient}))
    WITH r, a
    OPTIONAL MATCH (r)-[:CONTAINS_INGREDIENT]->(i:Ingredient)
    RETURN r.name AS name, a.name AS author, COUNT(i) AS numberOfIngredients, r.skillLevel AS skillLevel
    ORDER BY r.name
    
    `);

    // Extract data from the result
    const recipes = result.records.map(record => ({
      name: record.get('name'),
      author: record.get('author'),
      skillLevel: record.get('skillLevel'),
      numberOfIngredients: record.get('numberOfIngredients').toNumber()
    }));

    res.json(recipes); // Send JSON response with the search results
  } catch (error) {
    console.error('Error searching for recipes:', error);
    res.status(500).json({ error: 'Failed to search for recipes' });
  } finally {
    await session.close();
  }
});


app.get('/api/search/recipes/by/author/:authorname', async (req, res) => {
  res.charset = 'utf-8';

  const authorName = req.params['authorname'].trim(); // Extract the recipe name from the route parameter

  const session = driver.session();

  try {
    // Run a Cypher query to search for recipes by name
    const result = await session.run(`
    MATCH (a:Author {name: "${authorName}"})-[:WROTE]->(r:Recipe)
    RETURN r.name AS recipeName
    Order by r.name
    `);

    // Extract data from the result
    const recipes = result.records.map(record => ({
      name: record.get('recipeName'),
    }));

    res.json(recipes); // Send JSON response with the search results
  } catch (error) {
    console.error('Error searching for recipes:', error);
    res.status(500).json({ error: 'Failed to search for recipes' });
  } finally {
    await session.close();
  }

});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
