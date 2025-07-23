"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { RecipeCard } from "@/components/recipe-card"
import { Button } from "@/components/ui/button"
import type { Recipe } from "@/lib/types"
import { Search, Plus } from "lucide-react"
import Link from "next/link"

interface SearchBarProps {
  recipes: Recipe[]
}

export function SearchBar({ recipes }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredRecipes = recipes.filter(
    (recipe) =>
      recipe.nome_receita.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.client?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <>
      {/* Search Bar */}
      <div className="mb-6 sm:mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar receitas..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Recipes Grid */}
      {filteredRecipes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <Plus className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">
              {searchTerm ? "Nenhuma receita encontrada" : "Nenhuma receita cadastrada"}
            </p>
            <p className="text-sm px-4">
              {searchTerm ? "Tente buscar por outro termo" : "Comece criando sua primeira ficha técnica"}
            </p>
          </div>
          {!searchTerm && (
            <Link href="/recipes/new">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Receita
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </>
  )
}
