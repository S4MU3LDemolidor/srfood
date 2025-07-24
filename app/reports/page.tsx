"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileDown, Calendar, Users, ChefHat, BarChart3, Download } from "lucide-react"
import {
  generateRecipesSummaryReport,
  generateClientsSummaryReport,
  generateMonthlyStatsReport,
  generateAnalyticsReport,
} from "@/lib/report-generators"

export default function ReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null)

  const downloadPDF = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleGenerateReport = async (reportType: string, reportId: string) => {
    setGenerating(reportId)

    try {
      let pdfBlob: Blob
      let filename: string

      switch (reportId) {
        case "recipes-summary":
          pdfBlob = await generateRecipesSummaryReport()
          filename = `Relatorio_Receitas_${new Date().toISOString().split("T")[0]}.pdf`
          break
        case "clients-summary":
          pdfBlob = await generateClientsSummaryReport()
          filename = `Relatorio_Clientes_${new Date().toISOString().split("T")[0]}.pdf`
          break
        case "monthly-stats":
          pdfBlob = await generateMonthlyStatsReport()
          filename = `Relatorio_Mensal_${new Date().toISOString().split("T")[0]}.pdf`
          break
        case "analytics-report":
          pdfBlob = await generateAnalyticsReport()
          filename = `Relatorio_Analitico_${new Date().toISOString().split("T")[0]}.pdf`
          break
        default:
          throw new Error("Tipo de relatório não reconhecido")
      }

      downloadPDF(pdfBlob, filename)
      console.log(`✅ REPORTS: ${reportType} generated and downloaded successfully`)
    } catch (error) {
      console.error(`❌ REPORTS: Error generating ${reportType}:`, error)
      alert(`Erro ao gerar relatório "${reportType}". Tente novamente.`)
    } finally {
      setGenerating(null)
    }
  }

  const reports = [
    {
      id: "recipes-summary",
      title: "Relatório de Receitas",
      description: "Lista completa de todas as receitas cadastradas com detalhes completos",
      icon: ChefHat,
      color: "emerald",
    },
    {
      id: "clients-summary",
      title: "Relatório de Clientes",
      description: "Informações detalhadas sobre clientes e suas receitas associadas",
      icon: Users,
      color: "blue",
    },
    {
      id: "monthly-stats",
      title: "Relatório Mensal",
      description: "Estatísticas e métricas do período atual com análise de desempenho",
      icon: Calendar,
      color: "purple",
    },
    {
      id: "analytics-report",
      title: "Relatório Analítico",
      description: "Análise completa com insights detalhados e tendências do sistema",
      icon: BarChart3,
      color: "orange",
    },
  ]

  const quickExports = [
    {
      id: "all-recipes",
      title: "Exportar Todas as Receitas",
      icon: ChefHat,
      action: () => handleGenerateReport("Relatório de Receitas", "recipes-summary"),
    },
    {
      id: "all-clients",
      title: "Exportar Lista de Clientes",
      icon: Users,
      action: () => handleGenerateReport("Relatório de Clientes", "clients-summary"),
    },
    {
      id: "statistics",
      title: "Exportar Estatísticas",
      icon: BarChart3,
      action: () => handleGenerateReport("Relatório Analítico", "analytics-report"),
    },
  ]

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Relatórios em PDF</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          Gere e baixe relatórios detalhados do sistema em formato PDF
        </p>
      </div>

      {/* Reports Grid - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${report.color}-100 text-${report.color}-700`}>
                  <report.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base sm:text-lg">{report.title}</CardTitle>
                </div>
                {generating === report.id && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500"></div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">{report.description}</p>
              <Button
                onClick={() => handleGenerateReport(report.title, report.id)}
                disabled={generating === report.id}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                {generating === report.id ? "Gerando PDF..." : "Baixar Relatório PDF"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions - Mobile Responsive */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <FileDown className="w-5 h-5" />
            Exportações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {quickExports.map((exportItem) => (
              <Button
                key={exportItem.id}
                variant="outline"
                className="justify-start bg-transparent text-sm h-12"
                onClick={exportItem.action}
                disabled={generating !== null}
              >
                <exportItem.icon className="w-4 h-4 mr-2" />
                {exportItem.title}
              </Button>
            ))}
          </div>

          <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-700">
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Dica:</span>
            </div>
            <p className="text-sm text-emerald-600 mt-1">
              Todos os relatórios são gerados em tempo real com os dados mais atualizados do sistema. Os arquivos PDF
              incluem logotipo, formatação profissional e são otimizados para impressão.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Status indicator */}
      {generating && (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Gerando relatório...</p>
              <p className="text-xs text-gray-500">Isso pode levar alguns segundos</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
