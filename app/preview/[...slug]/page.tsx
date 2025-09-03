"use client"
import { Canvas } from "@/components/builder/canvas"
import { BuilderProvider, useBuilder, findPageByPath } from "@/components/builder/builder-context"
import { FormStateProvider } from "@/components/builder/form-state-context"
import { useParams } from "next/navigation"
import { useEffect } from "react"

function PagePreviewContent() {
  const { state, dispatch } = useBuilder()
  const params = useParams()

  useEffect(() => {
    const slug = Array.isArray(params.slug) ? params.slug.join("/") : params.slug || ""
    const pageUrl = `/${slug}`

    // First try to find page using route mappings
    const matchingPage = findPageByPath(state, pageUrl)

    // If no route mapping found, fall back to direct URL matching
    const fallbackPage = matchingPage || state.pages.find((page) => page.url === pageUrl)

    if (fallbackPage && fallbackPage.id !== state.currentPageId) {
      dispatch({ type: "SET_CURRENT_PAGE", payload: { pageId: fallbackPage.id } })
    }
  }, [params.slug, dispatch]) // Removed state.currentPageId from dependencies and state.routeMappings

  const slug = Array.isArray(params.slug) ? params.slug.join("/") : params.slug || ""
  const pageUrl = `/${slug}`
  const currentPage = findPageByPath(state, pageUrl) || state.pages.find((page) => page.url === pageUrl)

  if (!currentPage) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md">
            <h2 className="font-medium mb-2">No page found</h2>
            <p className="text-sm">No page at {pageUrl} detected. You can configure custom routes in the builder.</p>
          </div>
          <div className="text-sm text-gray-600">
            <p>Available pages:</p>
            <ul className="mt-2 space-y-1">
              {state.pages.map((page) => (
                <li key={page.id}>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">/preview{page.url}</code> → {page.name}
                </li>
              ))}
            </ul>
            {state.routeMappings.length > 0 && (
              <>
                <p className="mt-4">Custom routes:</p>
                <ul className="mt-2 space-y-1">
                  {state.routeMappings
                    .filter((route) => route.isActive)
                    .map((route) => {
                      const page = state.pages.find((p) => p.id === route.pageId)
                      return (
                        <li key={route.id}>
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs">/preview{route.path}</code> →{" "}
                          {page?.name}
                        </li>
                      )
                    })}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Canvas isPreviewMode={true} />
    </div>
  )
}

export default function PagePreview() {
  return (
    <BuilderProvider>
      <FormStateProvider>
        <PagePreviewContent />
      </FormStateProvider>
    </BuilderProvider>
  )
}
