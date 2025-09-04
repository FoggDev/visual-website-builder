'use client'

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  CheckCircle,
  FileText,
  Layout,
  Loader2,
  Monitor,
  Palette,
  Plus,
  Send,
  Settings,
  Smartphone,
  Scaling as Spacing,
  Tablet,
  Trash2,
  Type,
  XCircle
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

import { getComponentPosition, useBuilder } from './builder-context'
import { getComponentTemplate } from './component-templates'
import { useFormState } from './form-state-context'
import { RoutingConfig } from './routing-config'

export function PropertiesPanel() {
  const { state, dispatch } = useBuilder()
  const { getFormState } = useFormState()
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
    data?: any
  } | null>(null)
  const [isTestingEndpoint, setIsTestingEndpoint] = useState(false)

  const currentPage = state.pages.find(
    (page) => page.id === state.currentPageId
  )

  const updateCanvasBackground = (
    updates: Partial<typeof state.canvasBackground>
  ) => {
    dispatch({
      type: 'UPDATE_CANVAS_BACKGROUND',
      payload: { background: updates }
    })
  }

  const updatePageProperty = (property: string, value: string) => {
    if (!currentPage) return
    dispatch({
      type: 'UPDATE_PAGE',
      payload: {
        pageId: currentPage.id,
        updates: { [property]: value }
      }
    })
  }

  const testFormEndpoint = async (formComponent: any) => {
    if (!formComponent.content.action) {
      setTestResult({ success: false, message: 'No endpoint URL specified' })
      return
    }

    setIsTestingEndpoint(true)
    setTestResult(null)

    try {
      const formData = getFormState(formComponent.id) || {}
      const method = formComponent.content.method || 'POST'

      console.log('[v0] Testing form endpoint:', {
        url: formComponent.content.action,
        method,
        data: formData
      })

      const response = await fetch(formComponent.content.action, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: method !== 'GET' ? JSON.stringify(formData) : undefined
      })

      const responseData = await response.text()

      setTestResult({
        success: response.ok,
        message: response.ok
          ? `Success! ${response.status} ${response.statusText}`
          : `Error: ${response.status} ${response.statusText}`,
        data: responseData
      })
    } catch (error) {
      console.error('[v0] Form endpoint test error:', error)
      setTestResult({
        success: false,
        message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setIsTestingEndpoint(false)
    }
  }

  const findComponentById = (components: any[], id: string): any => {
    for (const component of components) {
      if (component.id === id) {
        return component
      }
      if (component.children && component.children.length > 0) {
        const found = findComponentById(component.children, id)
        if (found) return found
      }
    }
    return null
  }

  const selectedComponent = state.selectedComponentId
    ? findComponentById(
        currentPage?.components || [],
        state.selectedComponentId
      )
    : null

  const template = selectedComponent
    ? getComponentTemplate(selectedComponent.type)
    : null

  useEffect(() => {
    if (selectedComponent) {
      console.log('[v0] Selected component:', selectedComponent)
      console.log('[v0] Component type:', selectedComponent.type)
      console.log('[v0] Template found:', template)
      console.log('[v0] Template properties:', template?.properties)
    }
  }, [selectedComponent, template])

  useEffect(() => {
    console.log(
      '[v0] Properties panel render - selectedComponentId:',
      state.selectedComponentId
    )
    console.log(
      '[v0] Properties panel render - selectedComponent:',
      selectedComponent
    )
    console.log('[v0] Properties panel render - template:', template)
  }, [state.selectedComponentId, selectedComponent, template])

  const moveComponent = (direction: 'up' | 'down') => {
    if (!selectedComponent) return

    const position = getComponentPosition(
      state.components,
      selectedComponent.id
    )
    if (!position) return

    const newIndex =
      direction === 'up' ? position.index - 1 : position.index + 1
    if (newIndex < 0 || newIndex >= position.total) return

    console.log('[v0] Moving component:', {
      componentId: selectedComponent.id,
      direction,
      currentIndex: position.index,
      newIndex,
      totalComponents: position.total,
      parentId: position.parentId
    })

    dispatch({
      type: 'REORDER_COMPONENT',
      payload: {
        componentId: selectedComponent.id,
        newIndex,
        parentId: position.parentId
      }
    })
  }

  const updateComponent = (updates: any) => {
    if (!selectedComponent) return
    console.log('[v0] Dispatching UPDATE_COMPONENT:', {
      id: selectedComponent.id,
      updates
    })
    dispatch({
      type: 'UPDATE_COMPONENT',
      payload: { id: selectedComponent.id, updates }
    })
  }

  const updateContent = (key: string, value: any) => {
    if (!selectedComponent) return
    console.log('[v0] Updating content:', {
      key,
      value,
      componentId: selectedComponent.id
    })
    updateComponent({
      content: { ...selectedComponent.content, [key]: value }
    })
  }

  const updateStyle = (key: string, value: any) => {
    if (!selectedComponent) return
    updateComponent({
      styles: {
        ...selectedComponent.styles,
        [state.currentBreakpoint]: {
          ...selectedComponent.styles[state.currentBreakpoint],
          [key]: value
        }
      }
    })
  }

  const currentStyles =
    selectedComponent?.styles?.[state.currentBreakpoint] || {}
  const position = selectedComponent
    ? getComponentPosition(state.components, selectedComponent.id)
    : null

  const findParentFormForComponent = (
    components: any[],
    componentId: string
  ): any | null => {
    for (const component of components) {
      if (component.type === 'form' && component.children) {
        const found = findComponentInChildrenRecursive(
          component.children,
          componentId
        )
        if (found) return component
      }
      if (component.children) {
        const found = findParentFormForComponent(
          component.children,
          componentId
        )
        if (found) return found
      }
    }
    return null
  }

  const findComponentInChildrenRecursive = (
    children: any[],
    componentId: string
  ): boolean => {
    for (const child of children) {
      if (child.id === componentId) return true
      if (
        child.children &&
        findComponentInChildrenRecursive(child.children, componentId)
      )
        return true
    }
    return false
  }

  if (!state.selectedComponentId) {
    console.log('[v0] Showing canvas settings - no component selected')
    return (
      <div className="w-80 bg-card border-l border-border h-full flex flex-col">
        <div className="p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="font-medium">Canvas Settings</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4 space-y-6">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4" />
                <h3 className="text-sm font-medium text-foreground">
                  Page Configuration
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="page-name">Page Name</Label>
                  <Input
                    id="page-name"
                    value={currentPage?.name || ''}
                    onChange={(e) => updatePageProperty('name', e.target.value)}
                    placeholder="Page Name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="page-url">Page URL</Label>
                  <Input
                    id="page-url"
                    value={currentPage?.url || ''}
                    onChange={(e) => updatePageProperty('url', e.target.value)}
                    placeholder="/page-url"
                    className="mt-1"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    This URL will be used for navigation and routing
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>
                      <strong>Page ID:</strong> {currentPage?.id}
                    </div>
                    <div>
                      <strong>Components:</strong>{' '}
                      {currentPage?.components.length || 0}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Palette className="h-4 w-4" />
                <h3 className="text-sm font-medium text-foreground">
                  Canvas Background
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Background Type</Label>
                  <Select
                    value={state.canvasBackground.type}
                    onValueChange={(value: 'color' | 'image') =>
                      updateCanvasBackground({ type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="color">Solid Color</SelectItem>
                      <SelectItem value="image">Background Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {state.canvasBackground.type === 'color' && (
                  <div>
                    <Label>Background Color</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={state.canvasBackground.color}
                        onChange={(e) =>
                          updateCanvasBackground({ color: e.target.value })
                        }
                        className="w-12 h-8 p-1 border rounded"
                      />
                      <Input
                        value={state.canvasBackground.color}
                        onChange={(e) =>
                          updateCanvasBackground({ color: e.target.value })
                        }
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>
                )}

                {state.canvasBackground.type === 'image' && (
                  <>
                    <div>
                      <Label>Image URL</Label>
                      <Input
                        value={state.canvasBackground.image || ''}
                        onChange={(e) =>
                          updateCanvasBackground({ image: e.target.value })
                        }
                        placeholder="https://example.com/image.jpg"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Image Size</Label>
                      <Select
                        value={state.canvasBackground.imageSize}
                        onValueChange={(
                          value: 'cover' | 'contain' | 'repeat'
                        ) => updateCanvasBackground({ imageSize: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cover">Cover</SelectItem>
                          <SelectItem value="contain">Contain</SelectItem>
                          <SelectItem value="repeat">Repeat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Image Position</Label>
                      <Select
                        value={state.canvasBackground.imagePosition}
                        onValueChange={(
                          value: 'center' | 'top' | 'bottom' | 'left' | 'right'
                        ) => updateCanvasBackground({ imagePosition: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="top">Top</SelectItem>
                          <SelectItem value="bottom">Bottom</SelectItem>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            </Card>

            <RoutingConfig />

            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Select a component to edit its properties, or use the canvas
                background settings above to customize the page background.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  console.log(
    '[v0] Showing properties panel for component:',
    selectedComponent?.type,
    selectedComponent?.id
  )

  const isFormComponent = selectedComponent.type === 'form'
  const currentPageComponents = currentPage?.components || []
  const parentForm = findParentFormForComponent(
    currentPageComponents,
    selectedComponent.id
  )
  const formState = isFormComponent ? getFormState(selectedComponent.id) : null

  return (
    <div className="w-80 bg-sidebar border-l border-sidebar-border h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-sidebar-border flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-sidebar-foreground">
            Properties
          </h2>
          <Badge variant="secondary" className="capitalize">
            {selectedComponent.type}
          </Badge>
        </div>

        {/* Breakpoint Indicator */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {state.currentBreakpoint === 'desktop' && (
            <Monitor className="h-4 w-4" />
          )}
          {state.currentBreakpoint === 'tablet' && (
            <Tablet className="h-4 w-4" />
          )}
          {state.currentBreakpoint === 'mobile' && (
            <Smartphone className="h-4 w-4" />
          )}
          <span className="capitalize">
            Editing {state.currentBreakpoint} styles
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="style">Style</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4 mt-4">
              {isFormComponent && (
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-4 w-4 bg-blue-500 rounded-full"></div>
                    <h3 className="text-sm font-medium text-blue-900">
                      Form State
                    </h3>
                  </div>

                  {formState && Object.keys(formState).length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-xs text-blue-700 mb-2">
                        Live form data (JSON):
                      </div>
                      <pre className="text-xs text-blue-800 bg-white p-3 rounded border overflow-auto max-h-40 font-mono">
                        {JSON.stringify(formState, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-xs text-blue-600">
                      No form data yet. Add form fields and start typing!
                    </div>
                  )}
                </Card>
              )}

              {isFormComponent && selectedComponent.content.enableTesting && (
                <Card className="p-4 bg-green-50 border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Send className="h-4 w-4 text-green-600" />
                    <h3 className="text-sm font-medium text-green-900">
                      Form Submit Testing
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs text-green-700">
                      Test your form endpoint with current form data
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => testFormEndpoint(selectedComponent)}
                        disabled={
                          isTestingEndpoint || !selectedComponent.content.action
                        }
                        className="flex-1"
                      >
                        {isTestingEndpoint ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Testing...
                          </>
                        ) : (
                          <>
                            <Send className="h-3 w-3 mr-1" />
                            Test Endpoint
                          </>
                        )}
                      </Button>
                    </div>

                    {testResult && (
                      <div
                        className={`p-3 rounded-md text-xs ${
                          testResult.success
                            ? 'bg-green-100 border border-green-300 text-green-800'
                            : 'bg-red-100 border border-red-300 text-red-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {testResult.success ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-600" />
                          )}
                          <span className="font-medium">
                            {testResult.message}
                          </span>
                        </div>
                        {testResult.data && (
                          <div className="mt-2">
                            <div className="font-medium mb-1">Response:</div>
                            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-20">
                              {testResult.data}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="text-xs text-green-600">
                      <strong>Endpoint:</strong>{' '}
                      {selectedComponent.content.action || 'Not set'}
                      <br />
                      <strong>Method:</strong>{' '}
                      {selectedComponent.content.method || 'POST'}
                      <br />
                      <strong>Data:</strong>{' '}
                      {formState
                        ? Object.keys(formState).length + ' fields'
                        : 'No data'}
                    </div>
                  </div>
                </Card>
              )}

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Type className="h-4 w-4" />
                  <h3 className="text-sm font-medium text-foreground">
                    Content Properties
                  </h3>
                </div>

                {/* Dynamic content controls based on component template */}
                {template?.properties.map((property) => (
                  <div key={property.key} className="space-y-2 mb-4">
                    <Label htmlFor={property.key}>{property.label}</Label>

                    {property.type === 'text' && (
                      <Input
                        id={property.key}
                        value={selectedComponent.content[property.key] || ''}
                        onChange={(e) =>
                          updateContent(property.key, e.target.value)
                        }
                        placeholder={property.placeholder}
                      />
                    )}

                    {property.type === 'textarea' && (
                      <Textarea
                        id={property.key}
                        value={selectedComponent.content[property.key] || ''}
                        onChange={(e) =>
                          updateContent(property.key, e.target.value)
                        }
                        placeholder={property.placeholder}
                        rows={3}
                      />
                    )}

                    {property.type === 'select' && property.options && (
                      <Select
                        value={
                          selectedComponent.content[property.key] ||
                          property.options[0]
                        }
                        onValueChange={(value) =>
                          updateContent(property.key, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {property.options.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {selectedComponent.type === 'select' &&
                      property.key === 'options' && (
                        <div className="space-y-3">
                          <div className="text-sm font-medium">
                            Select Options
                          </div>
                          {(selectedComponent.content.options || []).map(
                            (option: any, index: number) => (
                              <div
                                key={index}
                                className="flex gap-2 items-center p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex-1 space-y-2">
                                  <Input
                                    placeholder="Display text"
                                    value={option.text || ''}
                                    onChange={(e) => {
                                      const newOptions = [
                                        ...(selectedComponent.content.options ||
                                          [])
                                      ]
                                      newOptions[index] = {
                                        ...newOptions[index],
                                        text: e.target.value
                                      }
                                      updateContent('options', newOptions)
                                    }}
                                  />
                                  <Input
                                    placeholder="Value"
                                    value={option.value || ''}
                                    onChange={(e) => {
                                      const newOptions = [
                                        ...(selectedComponent.content.options ||
                                          [])
                                      ]
                                      newOptions[index] = {
                                        ...newOptions[index],
                                        value: e.target.value
                                      }
                                      updateContent('options', newOptions)
                                    }}
                                  />
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newOptions = [
                                      ...(selectedComponent.content.options ||
                                        [])
                                    ]
                                    newOptions.splice(index, 1)
                                    updateContent('options', newOptions)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newOptions = [
                                ...(selectedComponent.content.options || []),
                                { text: '', value: '' }
                              ]
                              updateContent('options', newOptions)
                            }}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Option
                          </Button>
                        </div>
                      )}

                    {selectedComponent.type === 'radiogroup' &&
                      property.key === 'options' && (
                        <div className="space-y-3">
                          <div className="text-sm font-medium">
                            Radio Options
                          </div>
                          {(selectedComponent.content.options || []).map(
                            (option: any, index: number) => (
                              <div
                                key={index}
                                className="flex gap-2 items-center p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex-1 space-y-2">
                                  <Input
                                    placeholder="Display text"
                                    value={option.text || ''}
                                    onChange={(e) => {
                                      const newOptions = [
                                        ...(selectedComponent.content.options ||
                                          [])
                                      ]
                                      newOptions[index] = {
                                        ...newOptions[index],
                                        text: e.target.value
                                      }
                                      updateContent('options', newOptions)
                                    }}
                                  />
                                  <Input
                                    placeholder="Value"
                                    value={option.value || ''}
                                    onChange={(e) => {
                                      const newOptions = [
                                        ...(selectedComponent.content.options ||
                                          [])
                                      ]
                                      newOptions[index] = {
                                        ...newOptions[index],
                                        value: e.target.value
                                      }
                                      updateContent('options', newOptions)
                                    }}
                                  />
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newOptions = [
                                      ...(selectedComponent.content.options ||
                                        [])
                                    ]
                                    newOptions.splice(index, 1)
                                    updateContent('options', newOptions)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newOptions = [
                                ...(selectedComponent.content.options || []),
                                { text: '', value: '' }
                              ]
                              updateContent('options', newOptions)
                            }}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Option
                          </Button>
                        </div>
                      )}

                    {selectedComponent.type === 'navbar' &&
                      property.key === 'menuItems' && (
                        <div className="space-y-3">
                          <div className="text-sm font-medium">Menu Items</div>
                          {(selectedComponent.content.menuItems || []).map(
                            (item: any, index: number) => (
                              <div
                                key={index}
                                className="flex gap-2 items-center p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex-1 space-y-2">
                                  <Input
                                    placeholder="Menu text"
                                    value={item.text || ''}
                                    onChange={(e) => {
                                      const newItems = [
                                        ...(selectedComponent.content
                                          .menuItems || [])
                                      ]
                                      newItems[index] = {
                                        ...newItems[index],
                                        text: e.target.value
                                      }
                                      updateContent('menuItems', newItems)
                                    }}
                                  />
                                  <Input
                                    placeholder="Link URL"
                                    value={item.href || ''}
                                    onChange={(e) => {
                                      const newItems = [
                                        ...(selectedComponent.content
                                          .menuItems || [])
                                      ]
                                      newItems[index] = {
                                        ...newItems[index],
                                        href: e.target.value
                                      }
                                      updateContent('menuItems', newItems)
                                    }}
                                  />
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newItems = [
                                      ...(selectedComponent.content.menuItems ||
                                        [])
                                    ]
                                    newItems.splice(index, 1)
                                    updateContent('menuItems', newItems)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newItems = [
                                ...(selectedComponent.content.menuItems || []),
                                { text: '', href: '' }
                              ]
                              updateContent('menuItems', newItems)
                            }}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Menu Item
                          </Button>
                        </div>
                      )}

                    {property.type === 'url' && (
                      <Input
                        id={property.key}
                        type="url"
                        value={selectedComponent.content[property.key] || ''}
                        onChange={(e) =>
                          updateContent(property.key, e.target.value)
                        }
                        placeholder={property.placeholder}
                      />
                    )}

                    {property.type === 'boolean' && (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={property.key}
                          checked={
                            selectedComponent.content[property.key] || false
                          }
                          onCheckedChange={(checked) =>
                            updateContent(property.key, checked)
                          }
                        />
                        <Label htmlFor={property.key}>{property.label}</Label>
                      </div>
                    )}

                    {property.description && (
                      <p className="text-xs text-muted-foreground">
                        {property.description}
                      </p>
                    )}
                  </div>
                ))}
              </Card>
            </TabsContent>

            <TabsContent value="style" className="space-y-4 mt-4">
              {/* Typography Controls */}
              {(selectedComponent.type === 'heading' ||
                selectedComponent.type === 'paragraph') && (
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Type className="h-4 w-4" />
                    <h3 className="text-sm font-medium text-foreground">
                      Typography
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Font Size</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Slider
                          value={[
                            Number.parseInt(
                              currentStyles.fontSize?.replace('rem', '') || '1'
                            ) * 16
                          ]}
                          onValueChange={([value]) =>
                            updateStyle('fontSize', `${value / 16}rem`)
                          }
                          max={72}
                          min={12}
                          step={2}
                          className="flex-1"
                        />
                        <span className="text-xs text-muted-foreground w-12">
                          {Number.parseInt(
                            currentStyles.fontSize?.replace('rem', '') || '1'
                          ) * 16}
                          px
                        </span>
                      </div>
                    </div>

                    <div>
                      <Label>Font Weight</Label>
                      <Select
                        value={currentStyles.fontWeight || '400'}
                        onValueChange={(value) =>
                          updateStyle('fontWeight', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="300">Light (300)</SelectItem>
                          <SelectItem value="400">Regular (400)</SelectItem>
                          <SelectItem value="500">Medium (500)</SelectItem>
                          <SelectItem value="600">Semibold (600)</SelectItem>
                          <SelectItem value="700">Bold (700)</SelectItem>
                          <SelectItem value="800">Extra Bold (800)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Text Alignment</Label>
                      <div className="flex gap-1 mt-1">
                        {[
                          { value: 'left', icon: AlignLeft },
                          { value: 'center', icon: AlignCenter },
                          { value: 'right', icon: AlignRight },
                          { value: 'justify', icon: AlignJustify }
                        ].map(({ value, icon: Icon }) => (
                          <Button
                            key={value}
                            variant={
                              currentStyles.textAlign === value
                                ? 'default'
                                : 'outline'
                            }
                            size="sm"
                            onClick={() => updateStyle('textAlign', value)}
                            className="p-2"
                          >
                            <Icon className="h-4 w-4" />
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Color Controls */}
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="h-4 w-4" />
                  <h3 className="text-sm font-medium text-foreground">
                    Colors
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Text Color</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={currentStyles.color || '#000000'}
                        onChange={(e) => updateStyle('color', e.target.value)}
                        className="w-12 h-8 p-1 border rounded"
                      />
                      <Input
                        value={currentStyles.color || '#000000'}
                        onChange={(e) => updateStyle('color', e.target.value)}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Background Color</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={currentStyles.backgroundColor || '#ffffff'}
                        onChange={(e) =>
                          updateStyle('backgroundColor', e.target.value)
                        }
                        className="w-12 h-8 p-1 border rounded"
                      />
                      <Input
                        value={currentStyles.backgroundColor || '#ffffff'}
                        onChange={(e) =>
                          updateStyle('backgroundColor', e.target.value)
                        }
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Border & Effects */}
              <Card className="p-4">
                <h3 className="text-sm font-medium text-foreground mb-3">
                  Border & Effects
                </h3>

                <div className="space-y-4">
                  <div>
                    <Label>Border Radius</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Slider
                        value={[
                          Number.parseInt(
                            currentStyles.borderRadius?.replace('px', '') || '0'
                          )
                        ]}
                        onValueChange={([value]) =>
                          updateStyle('borderRadius', `${value}px`)
                        }
                        max={50}
                        min={0}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-xs text-muted-foreground w-12">
                        {Number.parseInt(
                          currentStyles.borderRadius?.replace('px', '') || '0'
                        )}
                        px
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label>Border Width</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Slider
                        value={[
                          Number.parseInt(
                            currentStyles.borderWidth?.replace('px', '') || '0'
                          )
                        ]}
                        onValueChange={([value]) =>
                          updateStyle('borderWidth', `${value}px`)
                        }
                        max={10}
                        min={0}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-xs text-muted-foreground w-12">
                        {Number.parseInt(
                          currentStyles.borderWidth?.replace('px', '') || '0'
                        )}
                        px
                      </span>
                    </div>
                  </div>

                  {Number.parseInt(
                    currentStyles.borderWidth?.replace('px', '') || '0'
                  ) > 0 && (
                    <div>
                      <Label>Border Color</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          type="color"
                          value={currentStyles.borderColor || '#e5e7eb'}
                          onChange={(e) =>
                            updateStyle('borderColor', e.target.value)
                          }
                          className="w-12 h-8 p-1 border rounded"
                        />
                        <Input
                          value={currentStyles.borderColor || '#e5e7eb'}
                          onChange={(e) =>
                            updateStyle('borderColor', e.target.value)
                          }
                          placeholder="#e5e7eb"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="layout" className="space-y-4 mt-4">
              {/* Alignment Controls */}
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Layout className="h-4 w-4" />
                  <h3 className="text-sm font-medium text-foreground">
                    Alignment & Position
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Component Order</Label>
                    <div className="text-xs text-muted-foreground mb-2">
                      {position ? (
                        <>
                          Component {position.index + 1} of {position.total}
                          {position.parentId && ' (in container)'}
                        </>
                      ) : (
                        'Position unknown'
                      )}
                    </div>
                    <div className="flex gap-2 mt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log('[v0] Move Up clicked')
                          moveComponent('up')
                        }}
                        disabled={!position || position.index === 0}
                        className="flex-1"
                      >
                        <ArrowUp className="h-4 w-4 mr-1" />
                        Move Up
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log('[v0] Move Down clicked')
                          moveComponent('down')
                        }}
                        disabled={
                          !position || position.index === position.total - 1
                        }
                        className="flex-1"
                      >
                        <ArrowDown className="h-4 w-4 mr-1" />
                        Move Down
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Display</Label>
                    <Select
                      value={currentStyles.display || 'block'}
                      onValueChange={(value) => updateStyle('display', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="block">Block</SelectItem>
                        <SelectItem value="inline-block">
                          Inline Block
                        </SelectItem>
                        <SelectItem value="flex">Flex</SelectItem>
                        <SelectItem value="inline-flex">Inline Flex</SelectItem>
                        <SelectItem value="none">Hidden</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Horizontal Alignment</Label>
                    <div className="flex gap-1 mt-1">
                      {[
                        { value: 'left', label: 'Left', icon: AlignLeft },
                        { value: 'center', label: 'Center', icon: AlignCenter },
                        { value: 'right', label: 'Right', icon: AlignRight }
                      ].map(({ value, label, icon: Icon }) => (
                        <Button
                          key={value}
                          variant={
                            selectedComponent.content.alignment === value ||
                            (value === 'left' &&
                              !selectedComponent.content.alignment)
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
                          onClick={() => updateContent('alignment', value)}
                          className="flex-1 p-2"
                          title={label}
                        >
                          <Icon className="h-4 w-4" />
                        </Button>
                      ))}
                    </div>
                  </div>

                  {currentStyles.display?.includes('flex') && (
                    <>
                      <div>
                        <Label>Justify Content</Label>
                        <Select
                          value={currentStyles.justifyContent || 'flex-start'}
                          onValueChange={(value) =>
                            updateStyle('justifyContent', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="flex-start">Start</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="flex-end">End</SelectItem>
                            <SelectItem value="space-between">
                              Space Between
                            </SelectItem>
                            <SelectItem value="space-around">
                              Space Around
                            </SelectItem>
                            <SelectItem value="space-evenly">
                              Space Evenly
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Align Items</Label>
                        <Select
                          value={currentStyles.alignItems || 'stretch'}
                          onValueChange={(value) =>
                            updateStyle('alignItems', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="stretch">Stretch</SelectItem>
                            <SelectItem value="flex-start">Start</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="flex-end">End</SelectItem>
                            <SelectItem value="baseline">Baseline</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  <div>
                    <Label>Position</Label>
                    <Select
                      value={currentStyles.position || 'static'}
                      onValueChange={(value) => updateStyle('position', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="static">Static</SelectItem>
                        <SelectItem value="relative">Relative</SelectItem>
                        <SelectItem value="absolute">Absolute</SelectItem>
                        <SelectItem value="fixed">Fixed</SelectItem>
                        <SelectItem value="sticky">Sticky</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              {/* Spacing Controls */}
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Spacing className="h-4 w-4" />
                  <h3 className="text-sm font-medium text-foreground">
                    Spacing
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Vertical Position</Label>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          updateStyle('marginTop', '0px')
                          updateStyle('marginBottom', '16px')
                        }}
                        className="text-xs"
                      >
                        Top
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          updateStyle('marginTop', '32px')
                          updateStyle('marginBottom', '32px')
                        }}
                        className="text-xs"
                      >
                        Center
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          updateStyle('marginTop', '16px')
                          updateStyle('marginBottom', '0px')
                        }}
                        className="text-xs"
                      >
                        Bottom
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          updateStyle('marginTop', '64px')
                          updateStyle('marginBottom', '16px')
                        }}
                        className="text-xs"
                      >
                        Spaced
                      </Button>
                    </div>
                  </div>

                  {/* Quick Spacing Presets */}
                  <div>
                    <Label>Quick Spacing</Label>
                    <div className="grid grid-cols-3 gap-1 mt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          updateStyle('margin', '0')
                          updateStyle('padding', '0')
                        }}
                        className="text-xs"
                      >
                        None
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          updateStyle('margin', '8px')
                          updateStyle('padding', '8px')
                        }}
                        className="text-xs"
                      >
                        Small
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          updateStyle('margin', '16px')
                          updateStyle('padding', '16px')
                        }}
                        className="text-xs"
                      >
                        Medium
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Margin</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div>
                        <Label className="text-xs">Top</Label>
                        <Input
                          value={currentStyles.marginTop || '0'}
                          onChange={(e) =>
                            updateStyle('marginTop', e.target.value)
                          }
                          placeholder="0px"
                          className="text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Bottom</Label>
                        <Input
                          value={currentStyles.marginBottom || '0'}
                          onChange={(e) =>
                            updateStyle('marginBottom', e.target.value)
                          }
                          placeholder="0px"
                          className="text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Left</Label>
                        <Input
                          value={currentStyles.marginLeft || '0'}
                          onChange={(e) =>
                            updateStyle('marginLeft', e.target.value)
                          }
                          placeholder="0px"
                          className="text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Right</Label>
                        <Input
                          value={currentStyles.marginRight || '0'}
                          onChange={(e) =>
                            updateStyle('marginRight', e.target.value)
                          }
                          placeholder="0px"
                          className="text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Padding</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div>
                        <Label className="text-xs">Top</Label>
                        <Input
                          value={currentStyles.paddingTop || '0'}
                          onChange={(e) =>
                            updateStyle('paddingTop', e.target.value)
                          }
                          placeholder="0px"
                          className="text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Bottom</Label>
                        <Input
                          value={currentStyles.paddingBottom || '0'}
                          onChange={(e) =>
                            updateStyle('paddingBottom', e.target.value)
                          }
                          placeholder="0px"
                          className="text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Left</Label>
                        <Input
                          value={currentStyles.paddingLeft || '0'}
                          onChange={(e) =>
                            updateStyle('paddingLeft', e.target.value)
                          }
                          placeholder="0px"
                          className="text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Right</Label>
                        <Input
                          value={currentStyles.paddingRight || '0'}
                          onChange={(e) =>
                            updateStyle('paddingRight', e.target.value)
                          }
                          placeholder="0px"
                          className="text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Size Controls */}
              <Card className="p-4">
                <h3 className="text-sm font-medium text-foreground mb-3">
                  Size
                </h3>

                <div className="space-y-4">
                  <div>
                    <Label>Width</Label>
                    <Select
                      value={currentStyles.width || 'auto'}
                      onValueChange={(value) => updateStyle('width', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="100%">Full Width</SelectItem>
                        <SelectItem value="75%">3/4 Width</SelectItem>
                        <SelectItem value="50%">Half Width</SelectItem>
                        <SelectItem value="25%">Quarter Width</SelectItem>
                        <SelectItem value="fit-content">Fit Content</SelectItem>
                        <SelectItem value="200px">200px</SelectItem>
                        <SelectItem value="300px">300px</SelectItem>
                        <SelectItem value="400px">400px</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Height</Label>
                    <Select
                      value={currentStyles.height || 'auto'}
                      onValueChange={(value) => updateStyle('height', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="40px">40px (Small)</SelectItem>
                        <SelectItem value="48px">48px (Medium)</SelectItem>
                        <SelectItem value="56px">56px (Large)</SelectItem>
                        <SelectItem value="100px">100px</SelectItem>
                        <SelectItem value="200px">200px</SelectItem>
                        <SelectItem value="300px">300px</SelectItem>
                        <SelectItem value="400px">400px</SelectItem>
                        <SelectItem value="100vh">Full Height</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Min/Max Width Controls */}
                  <div>
                    <Label>Min Width</Label>
                    <Input
                      value={currentStyles.minWidth || ''}
                      onChange={(e) => updateStyle('minWidth', e.target.value)}
                      placeholder="e.g., 100px, 20%"
                      className="text-xs"
                    />
                  </div>

                  <div>
                    <Label>Max Width</Label>
                    <Input
                      value={currentStyles.maxWidth || ''}
                      onChange={(e) => updateStyle('maxWidth', e.target.value)}
                      placeholder="e.g., 500px, 100%"
                      className="text-xs"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
