import type { Client, Recipe, Ingredient, Step } from "./types"

// Check if we're in browser environment
function isBrowser(): boolean {
  const result = typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  console.log(`🌐 BROWSER CHECK: ${result ? 'IN BROWSER' : 'NOT IN BROWSER'}`)
  return result
}

function generateId(): string {
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
  console.log(`🆔 GENERATED ID: ${id}`)
  return id
}

// ==================== LOCALSTORAGE HELPERS ====================

function getFromStorage<T>(key: string): T[] {
  console.log(`🔍 GET FROM STORAGE: ${key}`)
  
  if (!isBrowser()) {
    console.log(`⚠️ NOT IN BROWSER - returning empty array for ${key}`)
    return []
  }

  try {
    console.log(`📖 READING localStorage.getItem('${key}')`)
    const data = window.localStorage.getItem(key)
    console.log(`📄 RAW DATA for ${key}:`, data ? `${data.length} characters` : 'null')
    
    if (!data) {
      console.log(`📭 NO DATA for ${key} - returning empty array`)
      return []
    }
    
    const parsed = JSON.parse(data)
    console.log(`✅ PARSED ${key}: ${Array.isArray(parsed) ? parsed.length : 'not array'} items`)
    
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error(`❌ ERROR reading ${key} from localStorage:`, error)
    return []
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  console.log(`💾 SAVE TO STORAGE: ${key} (${data.length} items)`)
  
  if (!isBrowser()) {
    console.log(`⚠️ NOT IN BROWSER - cannot save ${key}`)
    return
  }

  try {
    const jsonData = JSON.stringify(data)
    console.log(`📝 SAVING ${key}: ${jsonData.length} characters`)
    
    window.localStorage.setItem(key, jsonData)
    console.log(`✅ SAVED ${key} successfully`)

    // Verify the save worked
    const verification = window.localStorage.getItem(key)
    if (verification) {
      console.log(`✅ VERIFICATION: ${key} confirmed in localStorage`)
    } else {
      console.error(`❌ VERIFICATION FAILED: ${key} not found after save`)
    }

    // Dispatch custom event to notify components
    if (typeof window !== "undefined") {
      console.log(`📡 DISPATCHING dataChanged event for ${key}`)
      window.dispatchEvent(
        new CustomEvent("dataChanged", {
          detail: { key, count: data.length },
        }),
      )
    }
  } catch (error) {
    console.error(`❌ ERROR saving ${key} to localStorage:`, error)
  }
}

// ==================== CLIENTS CRUD ====================

export function getClients(): Client[] {
  console.log(`🔍 GET CLIENTS CALLED`)
  try {
    const clients = getFromStorage<Client>("clients")
    console.log(`📊 RETURNING ${clients.length} clients`)
    return clients
  } catch (error) {
    console.error(`❌ ERROR in getClients:`, error)
    return []
  }
}

export function getClientById(id: string): Client | null {
  console.log(`🔍 SEARCHING CLIENT BY ID: ${id}`)
  try {
    const clients = getClients()
    const found = clients.find((client) => client.id === id) || null
    console.log(`${found ? '✅ FOUND' : '❌ NOT FOUND'} client:`, found?.name)
    return found
  } catch (error) {
    console.error(`❌ ERROR in getClientById:`, error)
    return null
  }
}

export function createClient(clientData: Omit<Client, "id" | "created_at" | "updated_at">): Client {
  console.log(`🆕 CREATE CLIENT CALLED:`, clientData.name)

  try {
    const newClient: Client = {
      ...clientData,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log(`🆔 NEW CLIENT OBJECT:`, newClient)

    const clients = getClients()
    console.log(`📊 CURRENT CLIENTS BEFORE ADD:`, clients.length)
    
    clients.push(newClient)
    console.log(`📊 CLIENTS AFTER ADD:`, clients.length)
    
    saveToStorage("clients", clients)

    // Verify the client was saved
    const verification = getClients()
    console.log(`✅ VERIFICATION: ${verification.length} clients in storage after save`)
    
    return newClient
  } catch (error) {
    console.error(`❌ ERROR in createClient:`, error)
    throw error
  }
}

export function updateClient(id: string, clientData: Partial<Client>): Client | null {
  console.log(`📝 UPDATE CLIENT: ${id}`)

  try {
    const clients = getClients()
    const clientIndex = clients.findIndex((client) => client.id === id)

    if (clientIndex === -1) {
      console.log(`❌ CLIENT NOT FOUND: ${id}`)
      return null
    }

    const updatedClient: Client = {
      ...clients[clientIndex],
      ...clientData,
      updated_at: new Date().toISOString(),
    }

    clients[clientIndex] = updatedClient
    saveToStorage("clients", clients)

    console.log(`✅ CLIENT UPDATED: ${id}`)
    return updatedClient
  } catch (error) {
    console.error(`❌ ERROR in updateClient:`, error)
    return null
  }
}

export function deleteClient(id: string): boolean {
  console.log(`🗑️ DELETE CLIENT: ${id}`)

  try {
    if (!id || typeof id !== "string") {
      console.error(`❌ Invalid client ID: ${id}`)
      return false
    }

    const clients = getClients()
    const initialCount = clients.length
    const filteredClients = clients.filter((client) => client.id !== id)

    if (filteredClients.length === clients.length) {
      console.log(`❌ CLIENT NOT FOUND: ${id}`)
      return false
    }

    saveToStorage("clients", filteredClients)
    console.log(`✅ Client ${id} deleted (${initialCount} -> ${filteredClients.length})`)
    return true
  } catch (error) {
    console.error(`❌ ERROR in deleteClient:`, error)
    return false
  }
}

// ==================== RECIPES CRUD ====================

export function getRecipes(): Recipe[] {
  console.log(`🔍 GET RECIPES CALLED`)
  try {
    const recipes = getFromStorage<Recipe>("recipes")
    console.log(`📊 RETURNING ${recipes.length} recipes`)
    return recipes
  } catch (error) {
    console.error(`❌ ERROR in getRecipes:`, error)
    return []
  }
}

export function getRecipeById(id: string): Recipe | null {
  console.log(`🔍 SEARCHING RECIPE BY ID: ${id}`)
  try {
    const recipes = getRecipes()
    const found = recipes.find((recipe) => recipe.id === id) || null
    console.log(`${found ? '✅ FOUND' : '❌ NOT FOUND'} recipe:`, found?.nome_receita)
    return found
  } catch (error) {
    console.error(`❌ ERROR in getRecipeById:`, error)
    return null
  }
}

export function getRecipeWithDetails(id: string): Recipe | null {
  console.log(`🔍 GET RECIPE WITH DETAILS: ${id}`)
  try {
    const recipe = getRecipeById(id)
    if (!recipe) return null

    const client = recipe.client_id ? getClientById(recipe.client_id) : null
    const ingredients = getIngredientsByRecipeId(id)
    const steps = getStepsByRecipeId(id)

    // Add subficha details to ingredients
    const ingredientsWithSubfichas = ingredients.map((ingredient) => {
      if (ingredient.subficha_id) {
        const subficha = getRecipeById(ingredient.subficha_id)
        return { ...ingredient, subficha }
      }
      return ingredient
    })

    const result = {
      ...recipe,
      client: client || undefined,
      ingredients: ingredientsWithSubfichas,
      steps,
    }

    console.log(`✅ RECIPE WITH DETAILS:`, result.nome_receita, `(${ingredients.length} ingredients, ${steps.length} steps)`)
    return result
  } catch (error) {
    console.error(`❌ ERROR in getRecipeWithDetails:`, error)
    return null
  }
}

export function getRecipesWithClients(): Recipe[] {
  console.log(`🔍 GET RECIPES WITH CLIENTS CALLED`)
  try {
    const recipes = getRecipes()
    const clients = getClients()

    console.log(`📊 PROCESSING ${recipes.length} recipes with ${clients.length} clients`)

    const result = recipes.map((recipe) => {
      const client = recipe.client_id ? clients.find((c) => c.id === recipe.client_id) : null
      return {
        ...recipe,
        client: client || undefined,
      }
    })

    console.log(`📊 RETURNING ${result.length} recipes with client data`)
    return result
  } catch (error) {
    console.error(`❌ ERROR in getRecipesWithClients:`, error)
    return []
  }
}

export function createRecipe(recipeData: Omit<Recipe, "id" | "created_at" | "updated_at">): Recipe {
  console.log(`🆕 CREATE RECIPE CALLED:`, recipeData.nome_receita)

  try {
    const newRecipe: Recipe = {
      ...recipeData,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log(`🆔 NEW RECIPE OBJECT:`, newRecipe)

    const recipes = getRecipes()
    console.log(`📊 CURRENT RECIPES BEFORE ADD:`, recipes.length)
    
    recipes.push(newRecipe)
    console.log(`📊 RECIPES AFTER ADD:`, recipes.length)
    
    saveToStorage("recipes", recipes)

    // Verify the recipe was saved
    const verification = getRecipes()
    console.log(`✅ VERIFICATION: ${verification.length} recipes in storage after save`)
    
    return newRecipe
  } catch (error) {
    console.error(`❌ ERROR in createRecipe:`, error)
    throw error
  }
}

export function updateRecipe(id: string, recipeData: Partial<Recipe>): Recipe | null {
  console.log(`📝 UPDATE RECIPE: ${id}`)

  try {
    const recipes = getRecipes()
    const recipeIndex = recipes.findIndex((recipe) => recipe.id === id)

    if (recipeIndex === -1) {
      console.log(`❌ RECIPE NOT FOUND: ${id}`)
      return null
    }

    const updatedRecipe: Recipe = {
      ...recipes[recipeIndex],
      ...recipeData,
      updated_at: new Date().toISOString(),
    }

    recipes[recipeIndex] = updatedRecipe
    saveToStorage("recipes", recipes)

    console.log(`✅ RECIPE UPDATED: ${id}`)
    return updatedRecipe
  } catch (error) {
    console.error(`❌ ERROR in updateRecipe:`, error)
    return null
  }
}

export function deleteRecipe(id: string): boolean {
  console.log(`🗑️ DELETE RECIPE: ${id}`)

  try {
    if (!id || typeof id !== "string") {
      console.error(`❌ Invalid recipe ID: ${id}`)
      return false
    }

    // Delete recipe and related data
    const recipes = getRecipes()
    const ingredients = getIngredients()
    const steps = getSteps()

    const filteredRecipes = recipes.filter((recipe) => recipe.id !== id)
    const filteredIngredients = ingredients.filter((ingredient) => ingredient.ficha_id !== id)
    const filteredSteps = steps.filter((step) => step.ficha_id !== id)

    const recipeDeleted = filteredRecipes.length !== recipes.length
    const ingredientsDeleted = ingredients.length - filteredIngredients.length
    const stepsDeleted = steps.length - filteredSteps.length

    console.log(`🔄 DELETION RESULTS:`)
    console.log(`  - Recipe: ${recipeDeleted ? "✅ SUCCESS" : "❌ FAILED"}`)
    console.log(`  - Ingredients: ${ingredientsDeleted} deleted`)
    console.log(`  - Steps: ${stepsDeleted} deleted`)

    if (recipeDeleted) {
      saveToStorage("recipes", filteredRecipes)
      saveToStorage("ingredients", filteredIngredients)
      saveToStorage("steps", filteredSteps)
      console.log(`✅ Recipe ${id} successfully deleted`)
    }

    return recipeDeleted
  } catch (error) {
    console.error(`❌ ERROR in deleteRecipe:`, error)
    return false
  }
}

// ==================== INGREDIENTS CRUD ====================

export function getIngredients(): Ingredient[] {
  console.log(`🔍 GET INGREDIENTS CALLED`)
  try {
    return getFromStorage<Ingredient>("ingredients")
  } catch (error) {
    console.error(`❌ ERROR in getIngredients:`, error)
    return []
  }
}

export function getIngredientsByRecipeId(recipeId: string): Ingredient[] {
  console.log(`🔍 GET INGREDIENTS FOR RECIPE: ${recipeId}`)
  try {
    const ingredients = getIngredients()
    const filtered = ingredients.filter((ingredient) => ingredient.ficha_id === recipeId).sort((a, b) => a.ordem - b.ordem)
    console.log(`📊 FOUND ${filtered.length} ingredients for recipe ${recipeId}`)
    return filtered
  } catch (error) {
    console.error(`❌ ERROR in getIngredientsByRecipeId:`, error)
    return []
  }
}

export function createIngredient(ingredientData: Omit<Ingredient, "id" | "created_at">): Ingredient {
  console.log(`🆕 CREATE INGREDIENT:`, ingredientData.ingrediente)

  try {
    const newIngredient: Ingredient = {
      ...ingredientData,
      id: generateId(),
      created_at: new Date().toISOString(),
    }

    const ingredients = getIngredients()
    ingredients.push(newIngredient)
    saveToStorage("ingredients", ingredients)

    console.log(`✅ INGREDIENT CREATED: ${newIngredient.id}`)
    return newIngredient
  } catch (error) {
    console.error(`❌ ERROR in createIngredient:`, error)
    throw error
  }
}

export function updateIngredient(id: string, ingredientData: Partial<Ingredient>): Ingredient | null {
  console.log(`📝 UPDATE INGREDIENT: ${id}`)

  try {
    const ingredients = getIngredients()
    const ingredientIndex = ingredients.findIndex((ingredient) => ingredient.id === id)

    if (ingredientIndex === -1) {
      console.log(`❌ INGREDIENT NOT FOUND: ${id}`)
      return null
    }

    const updatedIngredient: Ingredient = {
      ...ingredients[ingredientIndex],
      ...ingredientData,
    }

    ingredients[ingredientIndex] = updatedIngredient
    saveToStorage("ingredients", ingredients)

    console.log(`✅ INGREDIENT UPDATED: ${id}`)
    return updatedIngredient
  } catch (error) {
    console.error(`❌ ERROR in updateIngredient:`, error)
    return null
  }
}

export function deleteIngredient(id: string): boolean {
  console.log(`🗑️ DELETE INGREDIENT: ${id}`)

  try {
    const ingredients = getIngredients()
    const filteredIngredients = ingredients.filter((ingredient) => ingredient.id !== id)

    if (filteredIngredients.length === ingredients.length) {
      console.log(`❌ INGREDIENT NOT FOUND: ${id}`)
      return false
    }

    saveToStorage("ingredients", filteredIngredients)
    console.log(`✅ INGREDIENT DELETED: ${id}`)
    return true
  } catch (error) {
    console.error(`❌ ERROR in deleteIngredient:`, error)
    return false
  }
}

// ==================== STEPS CRUD ====================

export function getSteps(): Step[] {
  console.log(`🔍 GET STEPS CALLED`)
  try {
    return getFromStorage<Step>("steps")
  } catch (error) {
    console.error(`❌ ERROR in getSteps:`, error)
    return []
  }
}

export function getStepsByRecipeId(recipeId: string): Step[] {
  console.log(`🔍 GET STEPS FOR RECIPE: ${recipeId}`)
  try {
    const steps = getSteps()
    const filtered = steps.filter((step) => step.ficha_id === recipeId).sort((a, b) => a.ordem - b.ordem)
    console.log(`📊 FOUND ${filtered.length} steps for recipe ${recipeId}`)
    return filtered
  } catch (error) {
    console.error(`❌ ERROR in getStepsByRecipeId:`, error)
    return []
  }
}

export function createStep(stepData: Omit<Step, "id" | "created_at">): Step {
  console.log(`🆕 CREATE STEP FOR RECIPE: ${stepData.ficha_id}`)

  try {
    const newStep: Step = {
      ...stepData,
      id: generateId(),
      created_at: new Date().toISOString(),
    }

    const steps = getSteps()
    steps.push(newStep)
    saveToStorage("steps", steps)

    console.log(`✅ STEP CREATED: ${newStep.id}`)
    return newStep
  } catch (error) {
    console.error(`❌ ERROR in createStep:`, error)
    throw error
  }
}

export function updateStep(id: string, stepData: Partial<Step>): Step | null {
  console.log(`📝 UPDATE STEP: ${id}`)

  try {
    const steps = getSteps()
    const stepIndex = steps.findIndex((step) => step.id === id)

    if (stepIndex === -1) {
      console.log(`❌ STEP NOT FOUND: ${id}`)
      return null
    }

    const updatedStep: Step = {
      ...steps[stepIndex],
      ...stepData,
    }

    steps[stepIndex] = updatedStep
    saveToStorage("steps", steps)

    console.log(`✅ STEP UPDATED: ${id}`)
    return updatedStep
  } catch (error) {
    console.error(`❌ ERROR in updateStep:`, error)
    return null
  }
}

export function deleteStep(id: string): boolean {
  console.log(`🗑️ DELETE STEP: ${id}`)

  try {
    const steps = getSteps()
    const filteredSteps = steps.filter((step) => step.id !== id)

    if (filteredSteps.length === steps.length) {
      console.log(`❌ STEP NOT FOUND: ${id}`)
      return false
    }

    saveToStorage("steps", filteredSteps)
    console.log(`✅ STEP DELETED: ${id}`)
    return true
  } catch (error) {
    console.error(`❌ ERROR in deleteStep:`, error)
    return false
  }
}
