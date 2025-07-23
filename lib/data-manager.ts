import type { Client, Recipe, Ingredient, Step } from "./types"
import { dbManager, STORES } from "./indexeddb-manager"

// Check if we're in browser environment
function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof indexedDB !== "undefined"
}

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

// ==================== CLIENTS CRUD ====================

export async function getClients(): Promise<Client[]> {
  if (!isBrowser()) return []

  try {
    console.log(`🔍 READING CLIENTS FROM INDEXEDDB`)
    return await dbManager.getAll<Client>(STORES.CLIENTS)
  } catch (error) {
    console.error("❌ Error reading clients from IndexedDB:", error)
    return []
  }
}

export async function getClientById(id: string): Promise<Client | null> {
  if (!isBrowser()) return null

  try {
    console.log(`🔍 SEARCHING CLIENT BY ID: ${id}`)
    return await dbManager.getById<Client>(STORES.CLIENTS, id)
  } catch (error) {
    console.error("❌ Error getting client by ID:", error)
    return null
  }
}

export async function createClient(clientData: Omit<Client, "id" | "created_at" | "updated_at">): Promise<Client> {
  if (!isBrowser()) throw new Error("IndexedDB not available")

  console.log(`🆕 CREATING CLIENT: ${clientData.name}`)

  const newClient: Client = {
    ...clientData,
    id: generateId(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  try {
    await dbManager.add(STORES.CLIENTS, newClient)
    console.log(`✅ CLIENT SAVED TO INDEXEDDB: ${newClient.id}`)
    return newClient
  } catch (error) {
    console.error(`❌ FAILED TO SAVE CLIENT TO INDEXEDDB:`, error)
    throw new Error("Failed to save client to IndexedDB")
  }
}

export async function updateClient(id: string, clientData: Partial<Client>): Promise<Client | null> {
  if (!isBrowser()) return null

  console.log(`📝 UPDATING CLIENT: ${id}`)

  try {
    const existingClient = await dbManager.getById<Client>(STORES.CLIENTS, id)
    if (!existingClient) {
      console.log(`❌ CLIENT NOT FOUND: ${id}`)
      return null
    }

    const updatedClient: Client = {
      ...existingClient,
      ...clientData,
      updated_at: new Date().toISOString(),
    }

    await dbManager.update(STORES.CLIENTS, updatedClient)
    console.log(`✅ CLIENT UPDATE SAVED TO INDEXEDDB: ${id}`)
    return updatedClient
  } catch (error) {
    console.error(`❌ FAILED TO UPDATE CLIENT IN INDEXEDDB:`, error)
    return null
  }
}

export async function deleteClient(id: string): Promise<boolean> {
  if (!isBrowser()) return false

  console.log(`🗑️ DELETING CLIENT: ${id}`)

  try {
    if (!id || typeof id !== "string") {
      console.error(`❌ Invalid client ID: ${id}`)
      return false
    }

    const success = await dbManager.delete(STORES.CLIENTS, id)
    if (success) {
      console.log(`✅ Client ${id} successfully deleted from IndexedDB`)
    }
    return success
  } catch (error) {
    console.error(`❌ CRITICAL ERROR deleting client:`, error)
    return false
  }
}

// ==================== RECIPES CRUD ====================

export async function getRecipes(): Promise<Recipe[]> {
  if (!isBrowser()) return []

  try {
    console.log(`🔍 READING RECIPES FROM INDEXEDDB`)
    return await dbManager.getAll<Recipe>(STORES.RECIPES)
  } catch (error) {
    console.error("❌ Error reading recipes from IndexedDB:", error)
    return []
  }
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  if (!isBrowser()) return null

  try {
    console.log(`🔍 SEARCHING RECIPE BY ID: ${id}`)
    return await dbManager.getById<Recipe>(STORES.RECIPES, id)
  } catch (error) {
    console.error("❌ Error getting recipe by ID:", error)
    return null
  }
}

export async function getRecipeWithDetails(id: string): Promise<Recipe | null> {
  if (!isBrowser()) return null

  try {
    console.log(`🔍 GETTING RECIPE WITH DETAILS: ${id}`)
    const recipe = await getRecipeById(id)
    if (!recipe) return null

    const client = recipe.client_id ? await getClientById(recipe.client_id) : null
    const ingredients = await getIngredientsByRecipeId(id)
    const steps = await getStepsByRecipeId(id)

    // Add subficha details to ingredients
    const ingredientsWithSubfichas = await Promise.all(
      ingredients.map(async (ingredient) => {
        if (ingredient.subficha_id) {
          const subficha = await getRecipeById(ingredient.subficha_id)
          return { ...ingredient, subficha }
        }
        return ingredient
      }),
    )

    return {
      ...recipe,
      client: client || undefined,
      ingredients: ingredientsWithSubfichas,
      steps,
    }
  } catch (error) {
    console.error("❌ Error getting recipe with details:", error)
    return null
  }
}

export async function getRecipesWithClients(): Promise<Recipe[]> {
  if (!isBrowser()) return []

  try {
    console.log(`🔍 READING RECIPES WITH CLIENTS FROM INDEXEDDB`)
    const recipes = await getRecipes()
    const clients = await getClients()

    return recipes.map((recipe) => {
      const client = recipe.client_id ? clients.find((c) => c.id === recipe.client_id) : null
      return {
        ...recipe,
        client: client || undefined,
      }
    })
  } catch (error) {
    console.error("❌ Error reading recipes with clients:", error)
    return []
  }
}

export async function createRecipe(recipeData: Omit<Recipe, "id" | "created_at" | "updated_at">): Promise<Recipe> {
  if (!isBrowser()) throw new Error("IndexedDB not available")

  console.log(`🆕 CREATING RECIPE: ${recipeData.nome_receita}`)

  const newRecipe: Recipe = {
    ...recipeData,
    id: generateId(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  try {
    await dbManager.add(STORES.RECIPES, newRecipe)
    console.log(`✅ RECIPE SAVED TO INDEXEDDB: ${newRecipe.id}`)
    return newRecipe
  } catch (error) {
    console.error(`❌ FAILED TO SAVE RECIPE TO INDEXEDDB:`, error)
    throw new Error("Failed to save recipe to IndexedDB")
  }
}

export async function updateRecipe(id: string, recipeData: Partial<Recipe>): Promise<Recipe | null> {
  if (!isBrowser()) return null

  console.log(`📝 UPDATING RECIPE: ${id}`)

  try {
    const existingRecipe = await dbManager.getById<Recipe>(STORES.RECIPES, id)
    if (!existingRecipe) {
      console.log(`❌ RECIPE NOT FOUND: ${id}`)
      return null
    }

    const updatedRecipe: Recipe = {
      ...existingRecipe,
      ...recipeData,
      updated_at: new Date().toISOString(),
    }

    await dbManager.update(STORES.RECIPES, updatedRecipe)
    console.log(`✅ RECIPE UPDATE SAVED TO INDEXEDDB: ${id}`)
    return updatedRecipe
  } catch (error) {
    console.error(`❌ FAILED TO UPDATE RECIPE IN INDEXEDDB:`, error)
    return null
  }
}

export async function deleteRecipe(id: string): Promise<boolean> {
  if (!isBrowser()) return false

  console.log(`🗑️ DELETING RECIPE FROM INDEXEDDB: ${id}`)

  try {
    if (!id || typeof id !== "string") {
      console.error(`❌ Invalid recipe ID: ${id}`)
      return false
    }

    // Delete recipe and related data
    const recipeDeleted = await dbManager.delete(STORES.RECIPES, id)
    const ingredientsDeleted = await dbManager.deleteByIndex(STORES.INGREDIENTS, "ficha_id", id)
    const stepsDeleted = await dbManager.deleteByIndex(STORES.STEPS, "ficha_id", id)

    console.log(`🔄 DELETION RESULTS:`)
    console.log(`  - Recipe: ${recipeDeleted ? "✅ SUCCESS" : "❌ FAILED"}`)
    console.log(`  - Ingredients: ${ingredientsDeleted} deleted`)
    console.log(`  - Steps: ${stepsDeleted} deleted`)

    if (recipeDeleted) {
      console.log(`✅ Recipe ${id} successfully deleted from IndexedDB`)
    }
    return recipeDeleted
  } catch (error) {
    console.error(`❌ CRITICAL ERROR deleting recipe:`, error)
    return false
  }
}

// ==================== INGREDIENTS CRUD ====================

export async function getIngredients(): Promise<Ingredient[]> {
  if (!isBrowser()) return []

  try {
    console.log(`🔍 READING INGREDIENTS FROM INDEXEDDB`)
    return await dbManager.getAll<Ingredient>(STORES.INGREDIENTS)
  } catch (error) {
    console.error("❌ Error reading ingredients from IndexedDB:", error)
    return []
  }
}

export async function getIngredientsByRecipeId(recipeId: string): Promise<Ingredient[]> {
  if (!isBrowser()) return []

  try {
    console.log(`🔍 READING INGREDIENTS FOR RECIPE: ${recipeId}`)
    const ingredients = await dbManager.getAllByIndex<Ingredient>(STORES.INGREDIENTS, "ficha_id", recipeId)
    return ingredients.sort((a, b) => a.ordem - b.ordem)
  } catch (error) {
    console.error("❌ Error reading ingredients by recipe ID:", error)
    return []
  }
}

export async function createIngredient(ingredientData: Omit<Ingredient, "id" | "created_at">): Promise<Ingredient> {
  if (!isBrowser()) throw new Error("IndexedDB not available")

  console.log(`🆕 CREATING INGREDIENT: ${ingredientData.ingrediente}`)

  const newIngredient: Ingredient = {
    ...ingredientData,
    id: generateId(),
    created_at: new Date().toISOString(),
  }

  try {
    await dbManager.add(STORES.INGREDIENTS, newIngredient)
    console.log(`✅ INGREDIENT SAVED TO INDEXEDDB: ${newIngredient.id}`)
    return newIngredient
  } catch (error) {
    console.error(`❌ FAILED TO SAVE INGREDIENT TO INDEXEDDB:`, error)
    throw new Error("Failed to save ingredient to IndexedDB")
  }
}

export async function updateIngredient(id: string, ingredientData: Partial<Ingredient>): Promise<Ingredient | null> {
  if (!isBrowser()) return null

  console.log(`📝 UPDATING INGREDIENT: ${id}`)

  try {
    const existingIngredient = await dbManager.getById<Ingredient>(STORES.INGREDIENTS, id)
    if (!existingIngredient) {
      console.log(`❌ INGREDIENT NOT FOUND: ${id}`)
      return null
    }

    const updatedIngredient: Ingredient = {
      ...existingIngredient,
      ...ingredientData,
    }

    await dbManager.update(STORES.INGREDIENTS, updatedIngredient)
    console.log(`✅ INGREDIENT UPDATE SAVED TO INDEXEDDB: ${id}`)
    return updatedIngredient
  } catch (error) {
    console.error(`❌ FAILED TO UPDATE INGREDIENT IN INDEXEDDB:`, error)
    return null
  }
}

export async function deleteIngredient(id: string): Promise<boolean> {
  if (!isBrowser()) return false

  console.log(`🗑️ DELETING INGREDIENT FROM INDEXEDDB: ${id}`)

  try {
    const success = await dbManager.delete(STORES.INGREDIENTS, id)
    if (success) {
      console.log(`✅ INGREDIENT DELETION SAVED TO INDEXEDDB: ${id}`)
    }
    return success
  } catch (error) {
    console.error(`❌ FAILED TO DELETE INGREDIENT FROM INDEXEDDB:`, error)
    return false
  }
}

// ==================== STEPS CRUD ====================

export async function getSteps(): Promise<Step[]> {
  if (!isBrowser()) return []

  try {
    console.log(`🔍 READING STEPS FROM INDEXEDDB`)
    return await dbManager.getAll<Step>(STORES.STEPS)
  } catch (error) {
    console.error("❌ Error reading steps from IndexedDB:", error)
    return []
  }
}

export async function getStepsByRecipeId(recipeId: string): Promise<Step[]> {
  if (!isBrowser()) return []

  try {
    console.log(`🔍 READING STEPS FOR RECIPE: ${recipeId}`)
    const steps = await dbManager.getAllByIndex<Step>(STORES.STEPS, "ficha_id", recipeId)
    return steps.sort((a, b) => a.ordem - b.ordem)
  } catch (error) {
    console.error("❌ Error reading steps by recipe ID:", error)
    return []
  }
}

export async function createStep(stepData: Omit<Step, "id" | "created_at">): Promise<Step> {
  if (!isBrowser()) throw new Error("IndexedDB not available")

  console.log(`🆕 CREATING STEP FOR RECIPE: ${stepData.ficha_id}`)

  const newStep: Step = {
    ...stepData,
    id: generateId(),
    created_at: new Date().toISOString(),
  }

  try {
    await dbManager.add(STORES.STEPS, newStep)
    console.log(`✅ STEP SAVED TO INDEXEDDB: ${newStep.id}`)
    return newStep
  } catch (error) {
    console.error(`❌ FAILED TO SAVE STEP TO INDEXEDDB:`, error)
    throw new Error("Failed to save step to IndexedDB")
  }
}

export async function updateStep(id: string, stepData: Partial<Step>): Promise<Step | null> {
  if (!isBrowser()) return null

  console.log(`📝 UPDATING STEP: ${id}`)

  try {
    const existingStep = await dbManager.getById<Step>(STORES.STEPS, id)
    if (!existingStep) {
      console.log(`❌ STEP NOT FOUND: ${id}`)
      return null
    }

    const updatedStep: Step = {
      ...existingStep,
      ...stepData,
    }

    await dbManager.update(STORES.STEPS, updatedStep)
    console.log(`✅ STEP UPDATE SAVED TO INDEXEDDB: ${id}`)
    return updatedStep
  } catch (error) {
    console.error(`❌ FAILED TO UPDATE STEP IN INDEXEDDB:`, error)
    return null
  }
}

export async function deleteStep(id: string): Promise<boolean> {
  if (!isBrowser()) return false

  console.log(`🗑️ DELETING STEP FROM INDEXEDDB: ${id}`)

  try {
    const success = await dbManager.delete(STORES.STEPS, id)
    if (success) {
      console.log(`✅ STEP DELETION SAVED TO INDEXEDDB: ${id}`)
    }
    return success
  } catch (error) {
    console.error(`❌ FAILED TO DELETE STEP FROM INDEXEDDB:`, error)
    return false
  }
}
