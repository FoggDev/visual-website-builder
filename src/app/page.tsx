"use client"
import { ComponentLibrary } from "@/components/builder/component-library"
import { Canvas } from "@/components/builder/canvas"
import { PropertiesPanel } from "@/components/builder/properties-panel"
import { Toolbar } from "@/components/builder/toolbar"
import { BuilderProvider, useBuilder } from "@/components/builder/builder-context"
import { FormStateProvider } from "@/components/builder/form-state-context"

function VisualBuilderContent() {
  const { state } = useBuilder()

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Toolbar */}
      <Toolbar />

      {/* Main Builder Interface */}
      <div className="flex-1 flex overflow-hidden">
        {state.leftSidebarVisible && (
          <div className="w-80 bg-sidebar border-r border-sidebar-border flex-shrink-0">
            <ComponentLibrary />
          </div>
        )}

        {/* Center Canvas Area */}
        <div className="flex-1 bg-muted overflow-auto">
          <Canvas />
        </div>

        {state.rightSidebarVisible && (
          <div className="w-80 bg-sidebar border-l border-sidebar-border flex-shrink-0">
            <PropertiesPanel />
          </div>
        )}
      </div>
    </div>
  )
}

export default function VisualBuilder() {
  return (
    <BuilderProvider>
      <FormStateProvider>
        <VisualBuilderContent />
      </FormStateProvider>
    </BuilderProvider>
  )
}
