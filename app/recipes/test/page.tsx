"use client"

export default function TestPage() {
  console.log("🧪 TEST PAGE: This page loaded successfully!")

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Page</h1>
        <p className="text-gray-600">If you can see this, routing is working!</p>
        <p className="text-sm text-gray-500 mt-2">URL: /recipes/test</p>
      </div>
    </div>
  )
}
