"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { getAllComponentRegistryItems, getAvailableCategories, getComponentsByCategory } from "./component-registry"

export function ComponentLibrary() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, componentType: string) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ type: componentType }))
    e.dataTransfer.effectAllowed = "copy"
  }

  const allComponents = getAllComponentRegistryItems()
  const availableCategories = getAvailableCategories()

  const filteredCategories = availableCategories
    .map((categoryName) => ({
      name: categoryName,
      components: getComponentsByCategory(categoryName).filter((component) => {
        const matchesSearch =
          searchTerm === "" ||
          component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          component.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          component.template.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

        const matchesCategory = selectedCategory === null || categoryName === selectedCategory

        return matchesSearch && matchesCategory
      }),
    }))
    .filter((category) => category.components.length > 0)

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-sidebar-border flex-shrink-0">
        <h2 className="text-lg font-semibold text-sidebar-foreground">Components</h2>
        <p className="text-sm text-muted-foreground mb-3">Drag components to the canvas</p>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="p-4 border-b border-sidebar-border flex-shrink-0">
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedCategory === null ? "default" : "secondary"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Badge>
          {availableCategories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No components found</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your search terms</p>
            </div>
          ) : (
            filteredCategories.map((category) => (
              <div key={category.name}>
                <h3 className="text-sm font-medium text-sidebar-foreground mb-3">
                  {category.name}
                  <span className="ml-2 text-xs text-muted-foreground">({category.components.length})</span>
                </h3>
                <div className="space-y-2">
                  {category.components.map((component) => {
                    const Icon = component.icon
                    return (
                      <Card
                        key={component.id}
                        className="p-3 cursor-grab active:cursor-grabbing hover:bg-sidebar-accent hover:shadow-sm transition-all duration-200 group"
                        draggable
                        onDragStart={(e) => handleDragStart(e, component.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-sidebar-primary rounded-md group-hover:bg-sidebar-accent-foreground/10 transition-colors">
                            <Icon className="h-4 w-4 text-sidebar-primary-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-sidebar-foreground">{component.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{component.description}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {component.template.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs px-1.5 py-0.5 bg-muted rounded text-muted-foreground"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
