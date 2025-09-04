'use client'

import {
  Download,
  Eye,
  EyeOff,
  PanelLeft,
  PanelRight,
  Redo,
  Undo
} from 'lucide-react'

import { Button } from '@/components/ui/button'

import { useBuilder } from './builder-context'
import { ExportDialog } from './export-dialog'
import { PageManager } from './page-manager'

export function Toolbar() {
  const { state, dispatch } = useBuilder()

  return (
    <div className="h-14 bg-card border-b border-border flex items-center justify-between px-4">
      {/* Left Section - Logo, Pages & Sidebar Toggles */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-foreground">MIRA</span>
        </div>

        <div className="h-6 w-px bg-border" />

        <PageManager />

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" disabled>
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" disabled>
            <Redo className="h-4 w-4" />
          </Button>

          <div className="h-6 w-px bg-border mx-2" />
          <Button
            variant={state.leftSidebarVisible ? 'default' : 'ghost'}
            size="sm"
            onClick={() => dispatch({ type: 'TOGGLE_LEFT_SIDEBAR' })}
            title="Toggle component library"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={state.rightSidebarVisible ? 'default' : 'ghost'}
            size="sm"
            onClick={() => dispatch({ type: 'TOGGLE_RIGHT_SIDEBAR' })}
            title="Toggle properties panel"
          >
            <PanelRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Right Section - Preview & Export */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            dispatch({
              type: 'TOGGLE_PREVIEW',
              payload: { enabled: !state.previewMode }
            })
          }
        >
          {state.previewMode ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          <span className="ml-2 hidden sm:inline">
            {state.previewMode ? 'Edit' : 'Preview'}
          </span>
        </Button>

        <ExportDialog>
          <Button variant="default" size="sm">
            <Download className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Export</span>
          </Button>
        </ExportDialog>
      </div>
    </div>
  )
}
