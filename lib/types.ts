export interface Client {
  id: string
  name: string
  logo_url?: string
  created_at: string
  updated_at: string
}

export interface Recipe {
  id: string
  nome_receita: string
  tipo_ficha: "Normal" | "Subficha"
  client_id?: string
  client?: Client
  foto_produto_url?: string
  tempo_preparo?: string
  rendimento?: string
  peso_preparacao?: string
  peso_porcao?: string
  utensilios_necessarios?: string
  realizado_por?: string
  aprovado_por?: string
  created_at: string
  updated_at: string
  ingredients?: Ingredient[]
  steps?: Step[]
}

export interface Ingredient {
  id: string
  ficha_id: string
  ingrediente: string
  quantidade?: string
  medida_caseira?: string
  subficha_id?: string
  subficha?: Recipe
  ordem: number
  created_at: string
}

export interface Step {
  id: string
  ficha_id: string
  passo: string
  foto_url?: string
  ordem: number
  created_at: string
}
