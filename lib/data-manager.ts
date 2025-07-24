import type { Recipe, Client, Ingredient, Step } from "./types"

// Generate a unique ID
export function generateId(): string {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substr(2, 9)
  const id = `${timestamp}_${random}`
  console.log("🆔 DATA MANAGER: Generated new ID:", id)
  return id
}

// Generic storage functions with better error handling
export function getFromStorage<T>(key: string): T[] {
  if (typeof window === "undefined") {
    console.log("🔍 DATA MANAGER: Server-side rendering, returning empty array for", key)
    return []
  }

  try {
    const data = localStorage.getItem(key)
    console.log(`🔍 DATA MANAGER: Getting ${key} from storage:`, data ? `${data.length} chars` : "null")

    if (!data) {
      console.log(`📝 DATA MANAGER: No data found for ${key}, returning empty array`)
      return []
    }

    const parsed = JSON.parse(data)
    console.log(`📊 DATA MANAGER: Parsed ${key}:`, Array.isArray(parsed) ? `${parsed.length} items` : typeof parsed)

    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error(`❌ DATA MANAGER: Error parsing ${key} from localStorage:`, error)
    return []
  }
}

export function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") {
    console.log("💾 DATA MANAGER: Server-side rendering, skipping save for", key)
    return
  }

  try {
    console.log(
      `💾 DATA MANAGER: Saving ${key} to storage:`,
      Array.isArray(data) ? `${data.length} items` : typeof data,
    )

    const jsonData = JSON.stringify(data)
    localStorage.setItem(key, jsonData)

    console.log(`✅ DATA MANAGER: Successfully saved ${key} (${jsonData.length} chars)`)

    // Dispatch storage event for cross-component updates
    window.dispatchEvent(new StorageEvent("storage", { key }))
  } catch (error) {
    console.error(`❌ DATA MANAGER: Error saving ${key} to localStorage:`, error)
  }
}

// Recipe functions
export function getRecipes(): Recipe[] {
  return getFromStorage<Recipe>("recipes")
}

export function getRecipeById(id: string): Recipe | null {
  const recipes = getRecipes()
  return recipes.find((recipe) => recipe.id === id) || null
}

export function saveRecipe(recipe: Recipe): boolean {
  try {
    const recipes = getRecipes()
    const existingIndex = recipes.findIndex((r) => r.id === recipe.id)

    if (existingIndex >= 0) {
      recipes[existingIndex] = recipe
      console.log("📝 DATA MANAGER: Updated existing recipe:", recipe.id)
    } else {
      if (!recipe.id) {
        recipe.id = generateId()
      }
      recipes.push(recipe)
      console.log("📝 DATA MANAGER: Added new recipe:", recipe.id)
    }

    saveToStorage("recipes", recipes)
    return true
  } catch (error) {
    console.error("❌ DATA MANAGER: Error saving recipe:", error)
    return false
  }
}

export function updateRecipe(id: string, updates: Partial<Recipe>): boolean {
  try {
    const recipes = getRecipes()
    const index = recipes.findIndex((recipe) => recipe.id === id)

    if (index === -1) {
      console.log("❌ DATA MANAGER: Recipe not found for update:", id)
      return false
    }

    recipes[index] = { ...recipes[index], ...updates }
    saveToStorage("recipes", recipes)
    console.log("✅ DATA MANAGER: Recipe updated:", id)
    return true
  } catch (error) {
    console.error("❌ DATA MANAGER: Error updating recipe:", error)
    return false
  }
}

export function deleteRecipe(id: string): boolean {
  try {
    console.log("🗑️ DATA MANAGER: Deleting recipe:", id)

    // Delete the recipe
    const recipes = getRecipes()
    const filteredRecipes = recipes.filter((recipe) => recipe.id !== id)

    if (filteredRecipes.length === recipes.length) {
      console.log("❌ DATA MANAGER: Recipe not found for deletion:", id)
      return false
    }

    saveToStorage("recipes", filteredRecipes)

    // Delete associated ingredients
    const ingredients = getIngredients()
    const filteredIngredients = ingredients.filter((ingredient) => ingredient.recipe_id !== id)
    saveToStorage("ingredients", filteredIngredients)

    // Delete associated steps
    const steps = getSteps()
    const filteredSteps = steps.filter((step) => step.recipe_id !== id)
    saveToStorage("steps", filteredSteps)

    console.log("✅ DATA MANAGER: Recipe and associated data deleted:", id)
    return true
  } catch (error) {
    console.error("❌ DATA MANAGER: Error deleting recipe:", error)
    return false
  }
}

// Client functions
export function getClients(): Client[] {
  return getFromStorage<Client>("clients")
}

export function getClientById(id: string): Client | null {
  const clients = getClients()
  return clients.find((client) => client.id === id) || null
}

export function saveClient(client: Client): boolean {
  try {
    const clients = getClients()
    const existingIndex = clients.findIndex((c) => c.id === client.id)

    if (existingIndex >= 0) {
      clients[existingIndex] = client
      console.log("📝 DATA MANAGER: Updated existing client:", client.id)
    } else {
      if (!client.id) {
        client.id = generateId()
      }
      clients.push(client)
      console.log("📝 DATA MANAGER: Added new client:", client.id)
    }

    saveToStorage("clients", clients)
    return true
  } catch (error) {
    console.error("❌ DATA MANAGER: Error saving client:", error)
    return false
  }
}

export function updateClient(id: string, updates: Partial<Client>): boolean {
  try {
    const clients = getClients()
    const index = clients.findIndex((client) => client.id === id)

    if (index === -1) {
      console.log("❌ DATA MANAGER: Client not found for update:", id)
      return false
    }

    clients[index] = { ...clients[index], ...updates }
    saveToStorage("clients", clients)
    console.log("✅ DATA MANAGER: Client updated:", id)
    return true
  } catch (error) {
    console.error("❌ DATA MANAGER: Error updating client:", error)
    return false
  }
}

export function deleteClient(id: string): boolean {
  try {
    console.log("🗑️ DATA MANAGER: Deleting client:", id)

    const clients = getClients()
    const filteredClients = clients.filter((client) => client.id !== id)

    if (filteredClients.length === clients.length) {
      console.log("❌ DATA MANAGER: Client not found for deletion:", id)
      return false
    }

    saveToStorage("clients", filteredClients)
    console.log("✅ DATA MANAGER: Client deleted:", id)
    return true
  } catch (error) {
    console.error("❌ DATA MANAGER: Error deleting client:", error)
    return false
  }
}

// Combined functions
export function getRecipesWithClients(): (Recipe & { client?: Client })[] {
  const recipes = getRecipes()
  const clients = getClients()

  return recipes.map((recipe) => ({
    ...recipe,
    client: recipe.client_id ? clients.find((client) => client.id === recipe.client_id) : undefined,
  }))
}

// Ingredient functions
export function getIngredients(): Ingredient[] {
  return getFromStorage<Ingredient>("ingredients")
}

export function getIngredientsByRecipeId(recipeId: string): Ingredient[] {
  const ingredients = getIngredients()
  return ingredients.filter((ingredient) => ingredient.recipe_id === recipeId)
}

export function saveIngredient(ingredient: Ingredient): boolean {
  try {
    const ingredients = getIngredients()
    const existingIndex = ingredients.findIndex((i) => i.id === ingredient.id)

    if (existingIndex >= 0) {
      ingredients[existingIndex] = ingredient
    } else {
      if (!ingredient.id) {
        ingredient.id = generateId()
      }
      ingredients.push(ingredient)
    }

    saveToStorage("ingredients", ingredients)
    return true
  } catch (error) {
    console.error("❌ DATA MANAGER: Error saving ingredient:", error)
    return false
  }
}

export function deleteIngredient(id: string): boolean {
  try {
    const ingredients = getIngredients()
    const filteredIngredients = ingredients.filter((ingredient) => ingredient.id !== id)
    saveToStorage("ingredients", filteredIngredients)
    return true
  } catch (error) {
    console.error("❌ DATA MANAGER: Error deleting ingredient:", error)
    return false
  }
}

// Step functions
export function getSteps(): Step[] {
  return getFromStorage<Step>("steps")
}

export function getStepsByRecipeId(recipeId: string): Step[] {
  const steps = getSteps()
  return steps.filter((step) => step.recipe_id === recipeId)
}

export function saveStep(step: Step): boolean {
  try {
    const steps = getSteps()
    const existingIndex = steps.findIndex((s) => s.id === step.id)

    if (existingIndex >= 0) {
      steps[existingIndex] = step
    } else {
      if (!step.id) {
        step.id = generateId()
      }
      steps.push(step)
    }

    saveToStorage("steps", steps)
    return true
  } catch (error) {
    console.error("❌ DATA MANAGER: Error saving step:", error)
    return false
  }
}

export function deleteStep(id: string): boolean {
  try {
    const steps = getSteps()
    const filteredSteps = steps.filter((step) => step.id !== id)
    saveToStorage("steps", filteredSteps)
    return true
  } catch (error) {
    console.error("❌ DATA MANAGER: Error deleting step:", error)
    return false
  }
}
