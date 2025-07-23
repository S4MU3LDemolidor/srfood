const DB_NAME = "RecipeAppDB"
const DB_VERSION = 1
const STORES = {
  CLIENTS: "clients",
  RECIPES: "recipes",
  INGREDIENTS: "ingredients",
  STEPS: "steps",
}

// IndexedDB Database Interface
interface DBStore {
  name: string
  keyPath: string
  indexes?: { name: string; keyPath: string; unique?: boolean }[]
}

const DB_STORES: DBStore[] = [
  {
    name: STORES.CLIENTS,
    keyPath: "id",
    indexes: [{ name: "name", keyPath: "name" }],
  },
  {
    name: STORES.RECIPES,
    keyPath: "id",
    indexes: [
      { name: "nome_receita", keyPath: "nome_receita" },
      { name: "client_id", keyPath: "client_id" },
      { name: "tipo_ficha", keyPath: "tipo_ficha" },
    ],
  },
  {
    name: STORES.INGREDIENTS,
    keyPath: "id",
    indexes: [
      { name: "ficha_id", keyPath: "ficha_id" },
      { name: "ordem", keyPath: "ordem" },
    ],
  },
  {
    name: STORES.STEPS,
    keyPath: "id",
    indexes: [
      { name: "ficha_id", keyPath: "ficha_id" },
      { name: "ordem", keyPath: "ordem" },
    ],
  },
]

// IndexedDB Helper Class
class IndexedDBManager {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        console.error("❌ IndexedDB: Failed to open database")
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        console.log("✅ IndexedDB: Database opened successfully")
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        console.log("🔄 IndexedDB: Upgrading database schema")

        // Create object stores
        DB_STORES.forEach((storeConfig) => {
          if (!db.objectStoreNames.contains(storeConfig.name)) {
            const store = db.createObjectStore(storeConfig.name, { keyPath: storeConfig.keyPath })

            // Create indexes
            if (storeConfig.indexes) {
              storeConfig.indexes.forEach((index) => {
                store.createIndex(index.name, index.keyPath, { unique: index.unique || false })
              })
            }

            console.log(`📁 IndexedDB: Created store '${storeConfig.name}'`)
          }
        })
      }
    })
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly")
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => {
        console.log(`📖 IndexedDB: Retrieved ${request.result.length} items from '${storeName}'`)
        resolve(request.result)
      }

      request.onerror = () => {
        console.error(`❌ IndexedDB: Failed to get all from '${storeName}'`)
        reject(request.error)
      }
    })
  }

  async getById<T>(storeName: string, id: string): Promise<T | null> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly")
      const store = transaction.objectStore(storeName)
      const request = store.get(id)

      request.onsuccess = () => {
        const result = request.result || null
        console.log(`🔍 IndexedDB: ${result ? "Found" : "Not found"} item '${id}' in '${storeName}'`)
        resolve(result)
      }

      request.onerror = () => {
        console.error(`❌ IndexedDB: Failed to get '${id}' from '${storeName}'`)
        reject(request.error)
      }
    })
  }

  async getAllByIndex<T>(storeName: string, indexName: string, value: string): Promise<T[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly")
      const store = transaction.objectStore(storeName)
      const index = store.index(indexName)
      const request = index.getAll(value)

      request.onsuccess = () => {
        console.log(
          `📖 IndexedDB: Retrieved ${request.result.length} items from '${storeName}' where ${indexName}='${value}'`,
        )
        resolve(request.result)
      }

      request.onerror = () => {
        console.error(`❌ IndexedDB: Failed to get by index '${indexName}' from '${storeName}'`)
        reject(request.error)
      }
    })
  }

  async add<T>(storeName: string, data: T): Promise<T> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.add(data)

      request.onsuccess = () => {
        console.log(`✅ IndexedDB: Added item to '${storeName}'`)
        resolve(data)
      }

      request.onerror = () => {
        console.error(`❌ IndexedDB: Failed to add to '${storeName}'`)
        reject(request.error)
      }
    })
  }

  async update<T>(storeName: string, data: T): Promise<T> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.put(data)

      request.onsuccess = () => {
        console.log(`✅ IndexedDB: Updated item in '${storeName}'`)
        resolve(data)
      }

      request.onerror = () => {
        console.error(`❌ IndexedDB: Failed to update in '${storeName}'`)
        reject(request.error)
      }
    })
  }

  async delete(storeName: string, id: string): Promise<boolean> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.delete(id)

      request.onsuccess = () => {
        console.log(`✅ IndexedDB: Deleted item '${id}' from '${storeName}'`)
        resolve(true)
      }

      request.onerror = () => {
        console.error(`❌ IndexedDB: Failed to delete '${id}' from '${storeName}'`)
        reject(request.error)
      }
    })
  }

  async deleteByIndex(storeName: string, indexName: string, value: string): Promise<number> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      const index = store.index(indexName)
      const request = index.getAllKeys(value)

      request.onsuccess = () => {
        const keys = request.result
        let deletedCount = 0

        keys.forEach((key) => {
          const deleteRequest = store.delete(key)
          deleteRequest.onsuccess = () => deletedCount++
        })

        console.log(`✅ IndexedDB: Deleted ${deletedCount} items from '${storeName}' where ${indexName}='${value}'`)
        resolve(deletedCount)
      }

      request.onerror = () => {
        console.error(`❌ IndexedDB: Failed to delete by index from '${storeName}'`)
        reject(request.error)
      }
    })
  }
}

// Global IndexedDB instance
const dbManager = new IndexedDBManager()

// Export the manager and store names
export { dbManager, STORES }
export type { DBStore }
