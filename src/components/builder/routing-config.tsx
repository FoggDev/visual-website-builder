"use client"

import { useState } from "react"
import { useBuilder, type RouteMapping } from "./builder-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus, Globe } from "lucide-react"
import { Switch } from "@/components/ui/switch"

export function RoutingConfig() {
  const { state, dispatch } = useBuilder()
  const [newPath, setNewPath] = useState("")
  const [newPageId, setNewPageId] = useState("")

  const handleAddRoute = () => {
    if (!newPath || !newPageId) return

    const newRoute: RouteMapping = {
      id: Math.random().toString(36).substr(2, 9),
      path: newPath.startsWith("/") ? newPath : `/${newPath}`,
      pageId: newPageId,
      isActive: true,
    }

    dispatch({ type: "ADD_ROUTE_MAPPING", payload: { routeMapping: newRoute } })
    setNewPath("")
    setNewPageId("")
  }

  const handleUpdateRoute = (id: string, updates: Partial<RouteMapping>) => {
    dispatch({ type: "UPDATE_ROUTE_MAPPING", payload: { id, updates } })
  }

  const handleDeleteRoute = (id: string) => {
    dispatch({ type: "DELETE_ROUTE_MAPPING", payload: { id } })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          URL Routing Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Route */}
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-medium">Add New Route</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="new-path">Path</Label>
              <Input
                id="new-path"
                placeholder="/custom-path"
                value={newPath}
                onChange={(e) => setNewPath(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="new-page">Points to Page</Label>
              <Select value={newPageId} onValueChange={setNewPageId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select page" />
                </SelectTrigger>
                <SelectContent>
                  {state.pages.map((page) => (
                    <SelectItem key={page.id} value={page.id}>
                      {page.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleAddRoute} disabled={!newPath || !newPageId} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Route
          </Button>
        </div>

        {/* Existing Routes */}
        <div className="space-y-3">
          <h3 className="font-medium">Current Routes</h3>
          {state.routeMappings.length === 0 ? (
            <p className="text-gray-500 text-sm">No custom routes configured</p>
          ) : (
            state.routeMappings.map((route) => {
              const page = state.pages.find((p) => p.id === route.pageId)
              return (
                <div key={route.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">Path</Label>
                      <Input
                        value={route.path}
                        onChange={(e) => handleUpdateRoute(route.id, { path: e.target.value })}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Points to</Label>
                      <Select
                        value={route.pageId}
                        onValueChange={(value) => handleUpdateRoute(route.id, { pageId: value })}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {state.pages.map((page) => (
                            <SelectItem key={page.id} value={page.id}>
                              {page.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={route.isActive}
                      onCheckedChange={(checked) => handleUpdateRoute(route.id, { isActive: checked })}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRoute(route.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Preview URLs */}
        <div className="space-y-2">
          <h3 className="font-medium">Preview URLs</h3>
          <div className="text-sm text-gray-600 space-y-1">
            {state.routeMappings
              .filter((route) => route.isActive)
              .map((route) => {
                const page = state.pages.find((p) => p.id === route.pageId)
                return (
                  <div key={route.id} className="flex justify-between">
                    <code className="bg-gray-100 px-2 py-1 rounded">/preview{route.path}</code>
                    <span>→ {page?.name}</span>
                  </div>
                )
              })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
