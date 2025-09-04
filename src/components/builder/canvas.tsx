'use client'

import { GripVertical, Monitor, Smartphone, Tablet } from 'lucide-react'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { AddComponentButton } from './add-component-button'
import { useBuilder } from './builder-context'
import { generateId, generateTailwindClasses } from './canvas-utils'
import { getComponentTemplate } from './component-registry'
import { useFormState } from './form-state-context'

interface CanvasProps {
  isPreviewMode?: boolean
}

export type Breakpoint = 'mobile' | 'tablet' | 'desktop'

export function Canvas({ isPreviewMode = false }: CanvasProps) {
  const { state, dispatch } = useBuilder()
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [dragOverContainer, setDragOverContainer] = useState<{
    id: string
    type: string
    name?: string
  } | null>(null)
  const [mobileMenuStates, setMobileMenuStates] = useState<
    Record<string, boolean>
  >({})

  const currentPage = state.pages.find(
    (page) => page.id === state.currentPageId
  )
  const currentComponents = currentPage?.components || []

  const toggleMobileMenu = (componentId: string) => {
    setMobileMenuStates((prev) => ({
      ...prev,
      [componentId]: !prev[componentId]
    }))
  }

  const handleDrop = React.useCallback(
    (e: React.DragEvent, insertIndex?: number) => {
      e.preventDefault()
      setIsDragOver(false)
      setDragOverIndex(null)
      setDragOverContainer(null)

      try {
        const data = JSON.parse(e.dataTransfer.getData('application/json'))
        const template = getComponentTemplate(data.type)

        if (!template) {
          console.warn(`No template found for component type: ${data.type}`)
          return
        }

        const newComponent = {
          id: generateId(),
          type: data.type,
          content: { ...template.defaultContent },
          styles: {
            desktop: { ...template.defaultStyles.desktop },
            tablet: { ...template.defaultStyles.tablet },
            mobile: { ...template.defaultStyles.mobile }
          }
        }

        dispatch({
          type: 'ADD_COMPONENT',
          payload: {
            component: newComponent,
            insertIndex: insertIndex
          }
        })
      } catch (error) {
        console.error('Error parsing drop data:', error)
      }
    },
    [dispatch]
  )

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    // Only set drag over to false if we're leaving the canvas entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
      setDragOverIndex(null)
      setDragOverContainer(null)
    }
  }, [])

  const handleComponentDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()

    const rect = e.currentTarget.getBoundingClientRect()
    const midpoint = rect.top + rect.height / 2
    const insertIndex = e.clientY < midpoint ? index : index + 1

    setDragOverIndex(insertIndex)
  }

  const handleCanvasClick = () => {
    dispatch({ type: 'SELECT_COMPONENT', payload: { id: null } })
  }

  const handleDuplicate = (component: any) => {
    dispatch({ type: 'DUPLICATE_COMPONENT', payload: { id: component.id } })
  }

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_COMPONENT', payload: { id: id } })
  }

  const getCanvasBackgroundStyles = () => {
    const { canvasBackground } = state
    const styles: React.CSSProperties = {}

    if (canvasBackground.type === 'color') {
      styles.backgroundColor = canvasBackground.color
    } else if (canvasBackground.type === 'image' && canvasBackground.image) {
      styles.backgroundImage = `url(${canvasBackground.image})`
      styles.backgroundSize = canvasBackground.imageSize
      styles.backgroundPosition = canvasBackground.imagePosition
      styles.backgroundRepeat =
        canvasBackground.imageSize === 'repeat' ? 'repeat' : 'no-repeat'
    }

    return styles
  }

  return (
    <div
      className={cn('flex-1 p-4 overflow-auto transition-all duration-200')}
      style={{
        minHeight: isPreviewMode ? '100vh' : 'calc(100vh - 200px)',
        ...getCanvasBackgroundStyles()
      }}
      onDrop={isPreviewMode ? undefined : handleDrop}
      onDragOver={isPreviewMode ? undefined : handleDragOver}
      onDragLeave={isPreviewMode ? undefined : handleDragLeave}
      onClick={isPreviewMode ? undefined : handleCanvasClick}
    >
      {!isPreviewMode && (
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2 bg-background border rounded-lg p-1">
            {['mobile', 'tablet', 'desktop'].map((breakpoint) => (
              <Button
                key={breakpoint}
                variant={
                  state.currentBreakpoint === breakpoint ? 'default' : 'ghost'
                }
                size="sm"
                onClick={() =>
                  dispatch({
                    type: 'SET_BREAKPOINT',
                    payload: { breakpoint: breakpoint as Breakpoint }
                  })
                }
                className="capitalize"
              >
                {breakpoint === 'mobile' && (
                  <Smartphone className="h-4 w-4 mr-1" />
                )}
                {breakpoint === 'tablet' && <Tablet className="h-4 w-4 mr-1" />}
                {breakpoint === 'desktop' && (
                  <Monitor className="h-4 w-4 mr-1" />
                )}
                {breakpoint}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Canvas Content */}
      <div
        className={cn(
          'mx-auto bg-background border rounded-lg shadow-sm transition-all duration-200',
          state.currentBreakpoint === 'mobile' && 'w-full max-w-sm',
          state.currentBreakpoint === 'tablet' && 'w-full max-w-2xl',
          state.currentBreakpoint === 'desktop' && 'w-full max-w-6xl',
          isPreviewMode && 'max-w-none w-full border-0 shadow-none rounded-none'
        )}
        style={{
          minHeight: isPreviewMode ? '100vh' : '600px',
          width: isPreviewMode
            ? '100%'
            : state.currentBreakpoint === 'mobile'
              ? '384px'
              : state.currentBreakpoint === 'tablet'
                ? '672px'
                : '1152px'
        }}
      >
        {!isPreviewMode && isDragOver && !dragOverContainer && (
          <div className="absolute inset-0 bg-accent/20 border-2 border-dashed border-accent rounded-lg flex items-center justify-center z-10">
            <div className="text-accent-foreground font-medium">
              Drop component here
            </div>
          </div>
        )}

        {currentComponents.length === 0 && !isPreviewMode ? (
          <div className="flex items-center justify-center h-96 text-muted-foreground">
            <div className="text-center">
              <div className="text-lg font-medium mb-2">
                Start building your page
              </div>
              <div className="text-sm">
                Drag components from the sidebar to get started
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-0">
            {currentComponents.map((component, index) => (
              <div key={component.id} className="relative">
                {!isPreviewMode && dragOverIndex === index && (
                  <div className="h-1 bg-accent rounded-full mb-2" />
                )}
                <CanvasComponent
                  component={component}
                  isSelected={
                    !isPreviewMode && state.selectedComponentId === component.id
                  }
                  onClick={
                    isPreviewMode
                      ? () => {}
                      : (e) => {
                          e?.stopPropagation()
                          dispatch({
                            type: 'SELECT_COMPONENT',
                            payload: { id: component.id }
                          })
                        }
                  }
                  onDragOver={
                    isPreviewMode
                      ? () => {}
                      : (e) => handleComponentDragOver(e, index)
                  }
                  onDuplicate={
                    isPreviewMode ? () => {} : () => handleDuplicate(component)
                  }
                  onDelete={
                    isPreviewMode ? () => {} : () => handleDelete(component.id)
                  }
                  currentBreakpoint={state.currentBreakpoint}
                  dispatch={dispatch}
                  state={state}
                  isPreviewMode={isPreviewMode}
                  dragOverContainer={dragOverContainer}
                  setDragOverContainer={setDragOverContainer}
                  mobileMenuStates={mobileMenuStates}
                  toggleMobileMenu={toggleMobileMenu}
                />
                {!isPreviewMode && dragOverIndex === index + 1 && (
                  <div className="h-1 bg-accent rounded-full mt-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface CanvasComponentProps {
  component: any
  isSelected: boolean
  onClick: (e?: React.MouseEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDuplicate: () => void
  onDelete: () => void
  currentBreakpoint: string
  dispatch: any
  state: any
  isPreviewMode?: boolean
  dragOverContainer: { id: string; type: string; name?: string } | null
  setDragOverContainer: (
    container: { id: string; type: string; name?: string } | null
  ) => void
  mobileMenuStates: Record<string, boolean>
  toggleMobileMenu: (componentId: string) => void
}

function CanvasComponent({
  component,
  isSelected,
  onClick,
  onDragOver,
  onDuplicate,
  onDelete,
  currentBreakpoint,
  dispatch,
  state,
  isPreviewMode = false,
  dragOverContainer,
  setDragOverContainer,
  mobileMenuStates,
  toggleMobileMenu
}: CanvasComponentProps) {
  const { updateFormField, getFormState } = useFormState()
  const [isHovered, setIsHovered] = useState(false)
  const [previousFieldNames, setPreviousFieldNames] = useState<
    Map<string, string>
  >(new Map())

  const getResponsiveClasses = (component: any) => {
    let classes = ''

    // Apply mobile styles (base)
    if (component.styles.mobile) {
      classes += generateTailwindClasses(component.styles.mobile)
    }

    // Apply tablet styles with md: prefix
    if (component.styles.tablet) {
      const tabletClasses = generateTailwindClasses(
        component.styles.tablet,
        'md:'
      )
      classes += ` ${tabletClasses}`
    }

    // Apply desktop styles with lg: prefix
    if (component.styles.desktop) {
      const desktopClasses = generateTailwindClasses(
        component.styles.desktop,
        'lg:'
      )
      classes += ` ${desktopClasses}`
    }

    return classes.trim()
  }

  const getInlineStyles = (component: any) => {
    const styles: React.CSSProperties = {}

    if (!component || !component.styles) {
      return styles
    }

    // Get styles for current breakpoint with inheritance
    const currentStyles = component.styles[currentBreakpoint] || {}
    const tabletStyles = component.styles.tablet || {}
    const desktopStyles = component.styles.desktop || {}

    // Apply styles with inheritance (mobile inherits from tablet, tablet from desktop)
    let finalStyles = { ...desktopStyles }
    if (currentBreakpoint === 'tablet' || currentBreakpoint === 'mobile') {
      finalStyles = { ...finalStyles, ...tabletStyles }
    }
    if (currentBreakpoint === 'mobile') {
      finalStyles = { ...finalStyles, ...currentStyles }
    } else if (currentBreakpoint === 'tablet') {
      finalStyles = { ...finalStyles, ...currentStyles }
    } else {
      finalStyles = { ...finalStyles, ...currentStyles }
    }

    // Apply color properties
    if (finalStyles.color) {
      styles.color = finalStyles.color
    }
    if (finalStyles.backgroundColor) {
      styles.backgroundColor = finalStyles.backgroundColor
    }

    if (finalStyles.border) {
      styles.border = finalStyles.border
    }

    // Apply individual border properties (these will override the general border property)
    if (finalStyles.borderColor) {
      styles.borderColor = finalStyles.borderColor
    }
    if (finalStyles.borderWidth) {
      styles.borderWidth = finalStyles.borderWidth
    }
    if (finalStyles.borderStyle) {
      styles.borderStyle = finalStyles.borderStyle
    }
    if (finalStyles.borderRadius) {
      styles.borderRadius = finalStyles.borderRadius
    }

    if (
      (finalStyles.borderWidth || finalStyles.borderColor) &&
      !finalStyles.borderStyle &&
      !finalStyles.border
    ) {
      styles.borderStyle = 'solid'
    }

    // Apply effect properties
    if (finalStyles.boxShadow) {
      styles.boxShadow = finalStyles.boxShadow
    }
    if (finalStyles.opacity) {
      styles.opacity = finalStyles.opacity
    }
    if (finalStyles.transform) {
      styles.transform = finalStyles.transform
    }
    if (finalStyles.filter) {
      styles.filter = finalStyles.filter
    }

    // Apply sizing properties that might not be handled by Tailwind
    if (
      finalStyles.width &&
      !finalStyles.width.includes('px') &&
      !finalStyles.width.includes('%')
    ) {
      styles.width = finalStyles.width
    }
    if (
      finalStyles.height &&
      !finalStyles.height.includes('px') &&
      !finalStyles.height.includes('%')
    ) {
      styles.height = finalStyles.height
    }
    if (finalStyles.minWidth) {
      styles.minWidth = finalStyles.minWidth
    }
    if (finalStyles.minHeight) {
      styles.minHeight = finalStyles.minHeight
    }
    if (finalStyles.maxWidth) {
      styles.maxWidth = finalStyles.maxWidth
    }
    if (finalStyles.maxHeight) {
      styles.maxHeight = finalStyles.maxHeight
    }

    return styles
  }

  const renderComponent = () => {
    const getAlignment = (alignment: string) => {
      switch (alignment) {
        case 'center':
          return 'flex justify-center'
        case 'right':
          return 'flex justify-end'
        case 'left':
        default:
          return 'flex justify-start'
      }
    }
    const responsiveClasses = getResponsiveClasses(component)
    const inlineStyles = getInlineStyles(component)

    const findParentForm = (
      components: any[],
      componentId: string
    ): any | null => {
      for (const comp of components) {
        if (
          comp.type === 'form' &&
          comp.children &&
          comp.children.some((child: any) => child.id === componentId)
        ) {
          return comp
        }
        if (comp.children) {
          const found = findParentForm(comp.children, componentId)
          if (found) return found
        }
      }
      return null
    }

    const renameFormField = (
      formId: string,
      oldName: string,
      newName: string
    ) => {
      dispatch({
        type: 'RENAME_FORM_FIELD',
        payload: {
          formId: formId,
          oldName: oldName,
          newName: newName
        }
      })
    }

    const getSectionResponsiveClasses = (component: any) => {
      let classes = 'py-12 md:py-24 lg:py-32'

      if (component.content.padding === 'none') {
        classes = 'py-0'
      } else if (component.content.padding === 'small') {
        classes = 'py-6 md:py-12 lg:py-16'
      }

      return classes
    }

    const getGridResponsiveClasses = (component: any) => {
      let classes = 'grid gap-6'

      switch (component.content.columns) {
        case '2':
          classes += ' md:grid-cols-2'
          break
        case '3':
          classes += ' md:grid-cols-3'
          break
        case '4':
          classes += ' md:grid-cols-2 lg:grid-cols-4'
          break
        default:
          classes += ' md:grid-cols-1'
          break
      }

      return classes
    }

    const getHeadingResponsiveSize = (level: string) => {
      switch (level) {
        case 'h1':
          return 'text-4xl md:text-5xl lg:text-6xl'
        case 'h2':
          return 'text-3xl md:text-4xl lg:text-5xl'
        case 'h3':
          return 'text-2xl md:text-3xl lg:text-4xl'
        case 'h4':
          return 'text-xl md:text-2xl lg:text-3xl'
        case 'h5':
          return 'text-lg md:text-xl lg:text-2xl'
        case 'h6':
          return 'text-base md:text-lg lg:text-xl'
        default:
          return 'text-3xl md:text-4xl lg:text-5xl'
      }
    }

    const getButtonVariant = (variant: string) => {
      switch (variant) {
        case 'secondary':
          return 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        case 'destructive':
          return 'bg-destructive text-destructive-foreground hover:bg-destructive/80'
        case 'outline':
          return 'bg-transparent border border-input hover:bg-accent hover:text-accent-foreground'
        case 'ghost':
          return 'bg-transparent hover:bg-accent hover:text-accent-foreground'
        case 'link':
          return 'bg-transparent underline-offset-4 hover:underline text-foreground'
        case 'primary':
        default:
          return 'bg-primary text-primary-foreground hover:bg-primary/90'
      }
    }

    const getButtonResponsiveSize = (size: string) => {
      switch (size) {
        case 'lg':
          return 'px-8 py-3 text-lg'
        case 'sm':
          return 'px-3 py-1 text-sm'
        case 'default':
        default:
          return 'px-4 py-2'
      }
    }

    switch (component.type) {
      case 'navbar':
        const menuItems = Array.isArray(component.content.menuItems)
          ? component.content.menuItems
          : []
        const isMobile = state.currentBreakpoint === 'mobile'
        const isMobileMenuOpen = mobileMenuStates[component.id] || false

        const navbarContent = (
          <nav
            className={`w-full ${
              component.content.sticky ? 'sticky top-0' : 'relative'
            } z-50 ${responsiveClasses}`}
            style={{
              ...inlineStyles,
              backgroundColor: component.content.backgroundColor || '#ffffff',
              boxShadow: component.content.shadow
                ? '0 1px 3px rgba(0, 0, 0, 0.1)'
                : 'none'
            }}
          >
            <div className="w-[90%] mx-auto">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  {/* Logo */}
                  <div className="flex-shrink-0">
                    <a
                      href={component.content.logoHref || '/'}
                      className="text-xl font-bold"
                      style={{
                        color: component.content.logoColor || '#1f2937'
                      }}
                    >
                      {component.content.logo || 'LOGO'}
                    </a>
                  </div>

                  {!isMobile && (
                    <div className="flex">
                      <div className="ml-10 flex items-baseline space-x-4">
                        {menuItems.map((item: any, index: number) => {
                          const itemText =
                            typeof item === 'object'
                              ? item.text || item.href || 'Menu Item'
                              : item
                          const itemHref =
                            typeof item === 'object' ? item.href || '#' : '#'

                          return (
                            <a
                              key={index}
                              href={itemHref}
                              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
                              style={{
                                color: component.content.textColor || '#374151'
                              }}
                            >
                              {itemText}
                            </a>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {isMobile && (
                    <div className="flex">
                      <button
                        onClick={() => {
                          console.log(
                            '[v0] Mobile menu toggled:',
                            !isMobileMenuOpen
                          )
                          toggleMobileMenu(component.id)
                        }}
                        className="inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        style={{
                          color: component.content.textColor || '#374151'
                        }}
                      >
                        <span className="sr-only">Open main menu</span>
                        {!isMobileMenuOpen ? (
                          <svg
                            className="block h-6 w-6"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 6h16M4 12h16M4 18h16"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="block h-6 w-6"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isMobile && isMobileMenuOpen && (
              <div className="block">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
                  {menuItems.map((item: any, index: number) => {
                    const itemText =
                      typeof item === 'object'
                        ? item.text || item.href || 'Menu Item'
                        : item
                    const itemHref =
                      typeof item === 'object' ? item.href || '#' : '#'

                    return (
                      <a
                        key={index}
                        href={itemHref}
                        className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 transition-colors"
                        style={{
                          color: component.content.textColor || '#374151'
                        }}
                        onClick={() => {
                          console.log(
                            '[v0] Mobile menu item clicked:',
                            itemText
                          )
                          toggleMobileMenu(component.id)
                        }}
                      >
                        {itemText}
                      </a>
                    )
                  })}
                </div>
              </div>
            )}
          </nav>
        )

        return navbarContent

      case 'form':
        const formState = getFormState(component.id)
        const handleFormSubmit = (e: React.FormEvent) => {
          e.preventDefault()
          if (component.content.endpoint && component.content.method) {
            const formData = formState || {}
            console.log('[v0] Form submitted:', formData)

            fetch(component.content.endpoint, {
              method: component.content.method,
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(formData)
            })
              .then((response) => response.json())
              .then((data) => console.log('[v0] Form response:', data))
              .catch((error) => console.error('[v0] Form error:', error))
          }
        }

        return (
          <div
            key={component.id}
            className={cn(
              'relative group',
              isSelected && 'ring-2 ring-accent ring-offset-2',
              dragOverContainer?.id === component.id &&
                'ring-2 ring-blue-500 bg-blue-50/50',
              getInlineStyles(component.styles, currentBreakpoint)
            )}
            onClick={onClick}
          >
            {dragOverContainer?.id === component.id && (
              <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 rounded-lg flex items-center justify-center z-20">
                <div className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm font-medium">
                  Drop component as nested component of{' '}
                  {component.content.title || 'Form'}
                </div>
              </div>
            )}
            <form
              className="space-y-4 p-6 border rounded-lg bg-background"
              onSubmit={handleFormSubmit}
              onDrop={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setDragOverContainer(null)
                try {
                  const data = JSON.parse(
                    e.dataTransfer.getData('application/json')
                  )
                  const template = getComponentTemplate(data.type)

                  if (!template) {
                    console.warn(
                      `No template found for component type: ${data.type}`
                    )
                    return
                  }

                  const newComponent = {
                    id: generateId(),
                    type: data.type,
                    content: { ...template.defaultContent },
                    styles: {
                      desktop: { ...template.defaultStyles.desktop },
                      tablet: { ...template.defaultStyles.tablet },
                      mobile: { ...template.defaultStyles.mobile }
                    }
                  }

                  dispatch({
                    type: 'ADD_TO_CONTAINER',
                    payload: {
                      containerId: component.id,
                      component: newComponent
                    }
                  })
                } catch (error) {
                  console.error('Error parsing drop data for form:', error)
                }
              }}
              onDragOver={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setDragOverContainer({
                  id: component.id,
                  type: 'Form',
                  name: component.content.title
                })
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setDragOverContainer(null)
                }
              }}
            >
              {component.content.title && (
                <h3 className="text-xl font-semibold mb-6 text-foreground">
                  {component.content.title}
                </h3>
              )}

              {component.children &&
                component.children.length > 0 &&
                component.children.map((childComponent: any) => (
                  <CanvasComponent
                    key={childComponent.id}
                    component={childComponent}
                    isSelected={state.selectedComponentId === childComponent.id}
                    onClick={(e) => {
                      e?.stopPropagation()
                      dispatch({
                        type: 'SELECT_COMPONENT',
                        payload: { id: childComponent.id }
                      })
                    }}
                    onDuplicate={() =>
                      dispatch({
                        type: 'DUPLICATE_COMPONENT',
                        payload: { id: childComponent.id }
                      })
                    }
                    onDelete={() =>
                      dispatch({
                        type: 'DELETE_COMPONENT',
                        payload: { id: childComponent.id }
                      })
                    }
                    currentBreakpoint={currentBreakpoint}
                    dispatch={dispatch}
                    state={state}
                    onDragOver={(e) => e.preventDefault()}
                    isPreviewMode={isPreviewMode}
                    dragOverContainer={dragOverContainer}
                    setDragOverContainer={setDragOverContainer}
                    mobileMenuStates={mobileMenuStates}
                    toggleMobileMenu={toggleMobileMenu}
                  />
                ))}

              {component.content.showSubmitButton &&
                component.children &&
                component.children.length > 0 && (
                  <button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    {component.content.submitButtonText || 'Submit'}
                  </button>
                )}

              {component.children && component.children.length > 0 ? (
                <div className="mt-4">
                  <AddComponentButton
                    containerId={component.id}
                    dispatch={dispatch}
                    containerType="form"
                  />
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <p className="text-gray-500 mb-4">Drop form elements here</p>
                  <AddComponentButton
                    containerId={component.id}
                    dispatch={dispatch}
                    containerType="form"
                  />
                </div>
              )}
            </form>
          </div>
        )

      case 'input':
        const currentInputName = component.content.name || 'unnamed'
        const previousInputName = previousFieldNames.get(component.id)

        if (previousInputName && previousInputName !== currentInputName) {
          const formComponent = findParentForm(state.components, component.id)
          if (formComponent) {
            renameFormField(
              formComponent.id,
              previousInputName,
              currentInputName
            )
          }
        }

        // Update the tracked name
        if (previousInputName !== currentInputName) {
          setPreviousFieldNames((prev) =>
            new Map(prev).set(component.id, currentInputName)
          )
        }

        return (
          <div
            className={`space-y-2 ${responsiveClasses}`}
            style={inlineStyles}
          >
            {component.content.label && (
              <label
                htmlFor={component.content.name}
                className="block text-sm font-medium text-foreground"
              >
                {component.content.label}
                {component.content.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
            )}
            <input
              id={component.content.name}
              name={component.content.name}
              type={component.content.type || 'text'}
              placeholder={component.content.placeholder}
              defaultValue={component.content.value}
              required={component.content.required}
              onChange={(e) => {
                const formComponent = findParentForm(
                  state.components,
                  component.id
                )
                if (formComponent) {
                  updateFormField(
                    formComponent.id,
                    component.content.name || 'unnamed',
                    e.target.value
                  )
                }
              }}
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
        )

      case 'textarea':
        const currentTextareaName = component.content.name || 'unnamed'
        const previousTextareaName = previousFieldNames.get(component.id)

        if (
          previousTextareaName &&
          previousTextareaName !== currentTextareaName
        ) {
          const formComponent = findParentForm(state.components, component.id)
          if (formComponent) {
            renameFormField(
              formComponent.id,
              previousTextareaName,
              currentTextareaName
            )
          }
        }

        // Update the tracked name
        if (previousTextareaName !== currentTextareaName) {
          setPreviousFieldNames((prev) =>
            new Map(prev).set(component.id, currentTextareaName)
          )
        }

        return (
          <div
            className={`space-y-2 ${responsiveClasses}`}
            style={inlineStyles}
          >
            {component.content.label && (
              <label
                htmlFor={component.content.name}
                className="block text-sm font-medium text-foreground"
              >
                {component.content.label}
                {component.content.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
            )}
            <textarea
              id={component.content.name}
              name={component.content.name}
              placeholder={component.content.placeholder}
              defaultValue={component.content.value}
              required={component.content.required}
              rows={component.content.rows || 4}
              onChange={(e) => {
                const formComponent = findParentForm(
                  state.components,
                  component.id
                )
                if (formComponent) {
                  updateFormField(
                    formComponent.id,
                    component.content.name || 'unnamed',
                    e.target.value
                  )
                }
              }}
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-vertical"
            />
          </div>
        )

      case 'checkbox':
        const currentCheckboxName = component.content.name || 'unnamed'
        const previousCheckboxName = previousFieldNames.get(component.id)

        if (
          previousCheckboxName &&
          previousCheckboxName !== currentCheckboxName
        ) {
          const formComponent = findParentForm(state.components, component.id)
          if (formComponent) {
            renameFormField(
              formComponent.id,
              previousCheckboxName,
              currentCheckboxName
            )
          }
        }

        // Update the tracked name
        if (previousCheckboxName !== currentCheckboxName) {
          setPreviousFieldNames((prev) =>
            new Map(prev).set(component.id, currentCheckboxName)
          )
        }

        return (
          <div
            className={`flex items-center space-x-2 ${responsiveClasses}`}
            style={inlineStyles}
          >
            <input
              id={component.content.name}
              name={component.content.name}
              type="checkbox"
              defaultChecked={component.content.checked}
              value={component.content.value || 'on'}
              required={component.content.required}
              onChange={(e) => {
                const formComponent = findParentForm(
                  state.components,
                  component.id
                )
                if (formComponent) {
                  updateFormField(
                    formComponent.id,
                    component.content.name || 'unnamed',
                    e.target.checked
                  )
                }
              }}
              className="h-4 w-4 text-primary focus:ring-ring border-input rounded"
            />
            <label
              htmlFor={component.content.name}
              className="text-sm font-medium text-foreground"
            >
              {component.content.label}
              {component.content.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
          </div>
        )

      case 'select':
        const currentSelectName = component.content.name || 'unnamed'
        const previousSelectName = previousFieldNames.get(component.id)

        if (previousSelectName && previousSelectName !== currentSelectName) {
          const formComponent = findParentForm(state.components, component.id)
          if (formComponent) {
            renameFormField(
              formComponent.id,
              previousSelectName,
              currentSelectName
            )
          }
        }

        // Update the tracked name
        if (previousSelectName !== currentSelectName) {
          setPreviousFieldNames((prev) =>
            new Map(prev).set(component.id, currentSelectName)
          )
        }

        const selectOptions = Array.isArray(component.content.options)
          ? component.content.options
          : []

        return (
          <div
            className={`space-y-2 ${responsiveClasses}`}
            style={inlineStyles}
          >
            {component.content.label && (
              <label
                htmlFor={component.content.name}
                className="block text-sm font-medium text-foreground"
              >
                {component.content.label}
                {component.content.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
            )}
            <select
              id={component.content.name}
              name={component.content.name}
              defaultValue={component.content.value}
              required={component.content.required}
              onChange={(e) => {
                const formComponent = findParentForm(
                  state.components,
                  component.id
                )
                if (formComponent) {
                  updateFormField(
                    formComponent.id,
                    component.content.name || 'unnamed',
                    e.target.value
                  )
                }
              }}
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            >
              {component.content.placeholder && (
                <option value="" disabled>
                  {component.content.placeholder}
                </option>
              )}
              {selectOptions.map((option: any, index: number) => {
                const optionValue =
                  typeof option === 'object'
                    ? option.value || option.text || ''
                    : option
                const optionText =
                  typeof option === 'object'
                    ? option.text || option.value || 'Option'
                    : option

                return (
                  <option key={index} value={optionValue}>
                    {optionText}
                  </option>
                )
              })}
            </select>
          </div>
        )

      case 'radiogroup':
        const currentRadioName = component.content.name || 'unnamed'
        const previousRadioName = previousFieldNames.get(component.id)

        if (previousRadioName && previousRadioName !== currentRadioName) {
          const formComponent = findParentForm(state.components, component.id)
          if (formComponent) {
            renameFormField(
              formComponent.id,
              previousRadioName,
              currentRadioName
            )
          }
        }

        // Update the tracked name
        if (previousRadioName !== currentRadioName) {
          setPreviousFieldNames((prev) =>
            new Map(prev).set(component.id, currentRadioName)
          )
        }

        const radioOptions = Array.isArray(component.content.options)
          ? component.content.options
          : []
        const isHorizontal = component.content.layout === 'horizontal'

        return (
          <div
            className={`space-y-2 ${responsiveClasses}`}
            style={inlineStyles}
          >
            {component.content.label && (
              <fieldset>
                <legend className="block text-sm font-medium text-foreground mb-3">
                  {component.content.label}
                  {component.content.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </legend>
                <div
                  className={`${
                    isHorizontal ? 'flex flex-wrap gap-4' : 'space-y-2'
                  }`}
                >
                  {radioOptions.map((option: any, index: number) => {
                    const optionValue =
                      typeof option === 'object'
                        ? option.value || option.text || ''
                        : option
                    const optionText =
                      typeof option === 'object'
                        ? option.text || option.value || 'Option'
                        : option
                    const radioId = `${component.content.name}_${index}`

                    return (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          id={radioId}
                          name={component.content.name}
                          type="radio"
                          value={optionValue}
                          defaultChecked={
                            component.content.value === optionValue
                          }
                          required={component.content.required}
                          onChange={(e) => {
                            const formComponent = findParentForm(
                              state.components,
                              component.id
                            )
                            if (formComponent) {
                              updateFormField(
                                formComponent.id,
                                component.content.name || 'unnamed',
                                e.target.value
                              )
                            }
                          }}
                          className="h-4 w-4 text-primary focus:ring-ring border-input"
                        />
                        <label
                          htmlFor={radioId}
                          className="text-sm font-medium text-foreground cursor-pointer"
                        >
                          {optionText}
                        </label>
                      </div>
                    )
                  })}
                </div>
              </fieldset>
            )}
          </div>
        )

      case 'link':
        const linkTarget =
          component.content.target === '_blank' ? '_blank' : '_self'
        const linkRel =
          component.content.target === '_blank'
            ? 'noopener noreferrer'
            : undefined

        return (
          <div className={getAlignment(component.content.alignment)}>
            <a
              href={component.content.href || '#'}
              target={linkTarget}
              rel={linkRel}
              className={`text-foreground hover:opacity-80 transition-opacity cursor-pointer ${
                component.content.underline !== false
                  ? 'underline'
                  : 'no-underline'
              } ${responsiveClasses}`}
              style={inlineStyles}
            >
              {component.content.text || 'Click here'}
            </a>
          </div>
        )

      case 'divider':
        console.log('[v0] Rendering divider component:', component)

        const getDividerStyle = (style: string) => {
          switch (style) {
            case 'dashed':
              return 'border-dashed'
            case 'dotted':
              return 'border-dotted'
            default:
              return 'border-solid'
          }
        }

        const getDividerWidth = (width: string) => {
          switch (width) {
            case '25%':
              return 'w-1/4'
            case '50%':
              return 'w-1/2'
            case '75%':
              return 'w-3/4'
            case '100%':
            default:
              return 'w-full'
          }
        }

        const getDividerMargin = (margin: string) => {
          switch (margin) {
            case 'none':
              return 'my-0'
            case 'small':
              return 'my-2'
            case 'medium':
              return 'my-4'
            case 'large':
              return 'my-6'
            case 'xl':
              return 'my-8'
            default:
              return 'my-4'
          }
        }

        const dividerColor = component.content.backgroundColor || '#000000'
        const dividerThickness = component.content.thickness || '2px'

        console.log('[v0] Divider styles:', {
          color: dividerColor,
          thickness: dividerThickness
        })

        const dividerInlineStyles = { ...inlineStyles }
        delete dividerInlineStyles.border

        return (
          <div
            className={`flex justify-center ${getDividerMargin(
              component.content.margin
            )} ${responsiveClasses}`}
          >
            <div
              className={`${getDividerWidth(
                component.content.width
              )} ${getDividerStyle(component.content.style)} border-t`}
              style={{
                ...dividerInlineStyles,
                borderTopWidth: dividerThickness,
                borderTopColor: dividerColor,
                height: 0
              }}
            />
          </div>
        )

      case 'sidebar':
        return (
          <aside
            className={`transition-all duration-200 ${responsiveClasses} ${
              isHovered ? 'border-accent bg-accent/10' : ''
            } ${
              dragOverContainer?.id === component.id
                ? 'ring-2 ring-blue-500 bg-blue-50/50'
                : ''
            }`}
            style={inlineStyles}
            onDrop={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setDragOverContainer(null)

              try {
                const data = JSON.parse(
                  e.dataTransfer.getData('application/json')
                )
                const template = getComponentTemplate(data.type)

                if (!template) {
                  console.warn(
                    `No template found for component type: ${data.type}`
                  )
                  return
                }

                const newComponent = {
                  id: generateId(),
                  type: data.type,
                  content: { ...template.defaultContent },
                  styles: {
                    desktop: { ...template.defaultStyles.desktop },
                    tablet: { ...template.defaultStyles.tablet },
                    mobile: { ...template.defaultStyles.mobile }
                  }
                }

                dispatch({
                  type: 'ADD_TO_CONTAINER',
                  payload: {
                    containerId: component.id,
                    component: newComponent
                  }
                })
              } catch (error) {
                console.error('Error parsing drop data for sidebar:', error)
              }
            }}
            onDragOver={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setDragOverContainer({
                id: component.id,
                type: 'Sidebar',
                name: component.content.title
              })
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setDragOverContainer(null)
              }
            }}
          >
            {dragOverContainer?.id === component.id && (
              <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 rounded-lg flex items-center justify-center z-20">
                <div className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm font-medium">
                  Drop component as nested component of{' '}
                  {component.content.title || 'Sidebar'}
                </div>
              </div>
            )}
            {component.content.title && (
              <h3
                className={`text-lg font-semibold mb-4 ${getAlignment(
                  component.content.alignment
                )}`}
              >
                {component.content.title}
              </h3>
            )}

            {component.children && component.children.length > 0 ? (
              <div className="space-y-3">
                {component.children.map((childComponent: any) => (
                  <CanvasComponent
                    key={childComponent.id}
                    component={childComponent}
                    isSelected={
                      state?.selectedComponentId === childComponent.id
                    }
                    onClick={(e) => {
                      e?.stopPropagation()
                      dispatch({
                        type: 'SELECT_COMPONENT',
                        payload: { id: childComponent.id }
                      })
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDuplicate={() =>
                      dispatch({
                        type: 'DUPLICATE_COMPONENT',
                        payload: { id: childComponent.id }
                      })
                    }
                    onDelete={() =>
                      dispatch({
                        type: 'DELETE_COMPONENT',
                        payload: { id: childComponent.id }
                      })
                    }
                    currentBreakpoint={currentBreakpoint}
                    dispatch={dispatch}
                    state={state}
                    onDragOver={(e) => e.preventDefault()}
                    isPreviewMode={isPreviewMode}
                    dragOverContainer={dragOverContainer}
                    setDragOverContainer={setDragOverContainer}
                    mobileMenuStates={mobileMenuStates}
                    toggleMobileMenu={toggleMobileMenu}
                  />
                ))}
                <div className="pt-2">
                  <AddComponentButton
                    containerId={component.id}
                    dispatch={dispatch}
                    containerType="sidebar"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8 border-2 border-dashed border-border rounded-md">
                <div className="w-10 h-10 mx-auto mb-3 bg-muted rounded-lg flex items-center justify-center">
                  <GripVertical className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium mb-2 block">Sidebar</span>
                <p className="text-xs mb-4">
                  Add navigation or content components
                </p>
                <AddComponentButton
                  containerId={component.id}
                  dispatch={dispatch}
                  containerType="sidebar"
                />
              </div>
            )}
          </aside>
        )

      case 'section':
        return (
          <section
            className={`w-full transition-all duration-200 ${getSectionResponsiveClasses(
              component
            )} ${responsiveClasses} ${
              isHovered ? 'border-accent bg-accent/10' : ''
            } ${
              dragOverContainer?.id === component.id
                ? 'ring-2 ring-blue-500 bg-blue-50/50'
                : ''
            }`}
            style={inlineStyles}
            onDrop={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setDragOverContainer(null)

              try {
                const data = JSON.parse(
                  e.dataTransfer.getData('application/json')
                )
                const template = getComponentTemplate(data.type)

                if (!template) {
                  console.warn(
                    `No template found for component type: ${data.type}`
                  )
                  return
                }

                const newComponent = {
                  id: generateId(),
                  type: data.type,
                  content: { ...template.defaultContent },
                  styles: {
                    desktop: { ...template.defaultStyles.desktop },
                    tablet: { ...template.defaultStyles.tablet },
                    mobile: { ...template.defaultStyles.mobile }
                  }
                }

                dispatch({
                  type: 'ADD_TO_CONTAINER',
                  payload: {
                    containerId: component.id,
                    component: newComponent
                  }
                })
              } catch (error) {
                console.error('Error parsing drop data for section:', error)
              }
            }}
            onDragOver={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setDragOverContainer({
                id: component.id,
                type: 'Section',
                name: component.content.title
              })
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setDragOverContainer(null)
              }
            }}
          >
            {dragOverContainer?.id === component.id && (
              <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 rounded-lg flex items-center justify-center z-20">
                <div className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm font-medium">
                  Drop component as nested component of{' '}
                  {component.content.title || 'Section'}
                </div>
              </div>
            )}
            {component.content.title && (
              <h2
                className={`text-2xl md:text-4xl lg:text-6xl font-bold mb-4 ${getAlignment(
                  component.content.alignment
                )}`}
              >
                {component.content.title}
              </h2>
            )}

            {component.children && component.children.length > 0 ? (
              <div className="space-y-4">
                {component.children.map((childComponent: any) => (
                  <CanvasComponent
                    key={childComponent.id}
                    component={childComponent}
                    isSelected={
                      state?.selectedComponentId === childComponent.id
                    }
                    onClick={(e) => {
                      e?.stopPropagation()
                      dispatch({
                        type: 'SELECT_COMPONENT',
                        payload: { id: childComponent.id }
                      })
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDuplicate={() =>
                      dispatch({
                        type: 'DUPLICATE_COMPONENT',
                        payload: { id: childComponent.id }
                      })
                    }
                    onDelete={() =>
                      dispatch({
                        type: 'DELETE_COMPONENT',
                        payload: { id: childComponent.id }
                      })
                    }
                    currentBreakpoint={currentBreakpoint}
                    dispatch={dispatch}
                    state={state}
                    onDragOver={(e) => e.preventDefault()}
                    isPreviewMode={isPreviewMode}
                    dragOverContainer={dragOverContainer}
                    setDragOverContainer={setDragOverContainer}
                    mobileMenuStates={mobileMenuStates}
                    toggleMobileMenu={toggleMobileMenu}
                  />
                ))}
                <div className="pt-2">
                  <AddComponentButton
                    containerId={component.id}
                    dispatch={dispatch}
                    containerType="section"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12 border-2 border-dashed border-border rounded-md">
                <div className="w-12 h-12 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                  <GripVertical className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium mb-2 block">Section</span>
                <p className="text-xs mb-4">
                  Add components to organize content in this section
                </p>
                <AddComponentButton
                  containerId={component.id}
                  dispatch={dispatch}
                  containerType="section"
                />
              </div>
            )}
          </section>
        )

      case 'container':
        return (
          <div
            className={`w-full min-h-[200px] transition-all duration-200 ${responsiveClasses} ${
              isHovered ? 'border-accent bg-accent/10' : ''
            } ${
              dragOverContainer?.id === component.id
                ? 'ring-2 ring-blue-500 bg-blue-50/50'
                : ''
            }`}
            style={inlineStyles}
            onDrop={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setDragOverContainer(null)

              try {
                const data = JSON.parse(
                  e.dataTransfer.getData('application/json')
                )
                const template = getComponentTemplate(data.type)

                if (!template) {
                  console.warn(
                    `No template found for component type: ${data.type}`
                  )
                  return
                }

                const newComponent = {
                  id: generateId(),
                  type: data.type,
                  content: { ...template.defaultContent },
                  styles: {
                    desktop: { ...template.defaultStyles.desktop },
                    tablet: { ...template.defaultStyles.tablet },
                    mobile: { ...template.defaultStyles.mobile }
                  }
                }

                dispatch({
                  type: 'ADD_TO_CONTAINER',
                  payload: {
                    containerId: component.id,
                    component: newComponent
                  }
                })
              } catch (error) {
                console.error('Error parsing drop data for container:', error)
              }
            }}
            onDragOver={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setDragOverContainer({
                id: component.id,
                type: 'Container',
                name: component.content.title
              })
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setDragOverContainer(null)
              }
            }}
          >
            {dragOverContainer?.id === component.id && (
              <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 rounded-lg flex items-center justify-center z-20">
                <div className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm font-medium">
                  Drop component as nested component of Container
                </div>
              </div>
            )}
            {component.children && component.children.length > 0 ? (
              <div className="space-y-4">
                {component.children.map((childComponent: any) => (
                  <CanvasComponent
                    key={childComponent.id}
                    component={childComponent}
                    isSelected={
                      state?.selectedComponentId === childComponent.id
                    }
                    onClick={(e) => {
                      e?.stopPropagation()
                      dispatch({
                        type: 'SELECT_COMPONENT',
                        payload: { id: childComponent.id }
                      })
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDuplicate={() =>
                      dispatch({
                        type: 'DUPLICATE_COMPONENT',
                        payload: { id: childComponent.id }
                      })
                    }
                    onDelete={() =>
                      dispatch({
                        type: 'DELETE_COMPONENT',
                        payload: { id: childComponent.id }
                      })
                    }
                    currentBreakpoint={currentBreakpoint}
                    dispatch={dispatch}
                    state={state}
                    onDragOver={(e) => e.preventDefault()}
                    isPreviewMode={isPreviewMode}
                    dragOverContainer={dragOverContainer}
                    setDragOverContainer={setDragOverContainer}
                    mobileMenuStates={mobileMenuStates}
                    toggleMobileMenu={toggleMobileMenu}
                  />
                ))}
                <div className="pt-2">
                  <AddComponentButton
                    containerId={component.id}
                    dispatch={dispatch}
                    containerType="container"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8 border-2 border-dashed border-border rounded-md">
                <div className="w-10 h-10 mx-auto mb-3 bg-muted rounded-lg flex items-center justify-center">
                  <GripVertical className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium mb-2 block">
                  Container
                </span>
                <p className="text-xs mb-4">
                  Add components to organize content in this container
                </p>
                <AddComponentButton
                  containerId={component.id}
                  dispatch={dispatch}
                  containerType="container"
                />
              </div>
            )}
          </div>
        )

      case 'grid':
        return (
          <div
            className={`grid min-h-[200px] transition-all duration-200 ${getGridResponsiveClasses(
              component
            )} ${responsiveClasses} ${
              isHovered ? 'border-accent bg-accent/10' : ''
            } ${
              dragOverContainer?.id === component.id
                ? 'ring-2 ring-blue-500 bg-blue-50/50'
                : ''
            }`}
            style={inlineStyles}
            onDrop={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setDragOverContainer(null)

              try {
                const data = JSON.parse(
                  e.dataTransfer.getData('application/json')
                )
                const template = getComponentTemplate(data.type)

                if (!template) {
                  console.warn(
                    `No template found for component type: ${data.type}`
                  )
                  return
                }

                const newComponent = {
                  id: generateId(),
                  type: data.type,
                  content: { ...template.defaultContent },
                  styles: {
                    desktop: { ...template.defaultStyles.desktop },
                    tablet: { ...template.defaultStyles.tablet },
                    mobile: { ...template.defaultStyles.mobile }
                  }
                }

                dispatch({
                  type: 'ADD_TO_CONTAINER',
                  payload: {
                    containerId: component.id,
                    component: newComponent
                  }
                })
              } catch (error) {
                console.error('Error parsing drop data for grid:', error)
              }
            }}
            onDragOver={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setDragOverContainer({
                id: component.id,
                type: 'Grid',
                name: component.content.title
              })
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setDragOverContainer(null)
              }
            }}
          >
            {dragOverContainer?.id === component.id && (
              <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 rounded-lg flex items-center justify-center z-20">
                <div className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm font-medium">
                  Drop component as nested component of Grid
                </div>
              </div>
            )}
            {component.children && component.children.length > 0 ? (
              <>
                {component.children.map((childComponent: any) => (
                  <CanvasComponent
                    key={childComponent.id}
                    component={childComponent}
                    isSelected={
                      state?.selectedComponentId === childComponent.id
                    }
                    onClick={(e) => {
                      e?.stopPropagation()
                      dispatch({
                        type: 'SELECT_COMPONENT',
                        payload: { id: childComponent.id }
                      })
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDuplicate={() =>
                      dispatch({
                        type: 'DUPLICATE_COMPONENT',
                        payload: { id: childComponent.id }
                      })
                    }
                    onDelete={() =>
                      dispatch({
                        type: 'DELETE_COMPONENT',
                        payload: { id: childComponent.id }
                      })
                    }
                    currentBreakpoint={currentBreakpoint}
                    dispatch={dispatch}
                    state={state}
                    onDragOver={(e) => e.preventDefault()}
                    isPreviewMode={isPreviewMode}
                    dragOverContainer={dragOverContainer}
                    setDragOverContainer={setDragOverContainer}
                    mobileMenuStates={mobileMenuStates}
                    toggleMobileMenu={toggleMobileMenu}
                  />
                ))}
                <div className="col-span-full pt-2">
                  <AddComponentButton
                    containerId={component.id}
                    dispatch={dispatch}
                    containerType="grid"
                  />
                </div>
              </>
            ) : (
              <div className="col-span-full text-center text-muted-foreground py-8 border-2 border-dashed border-border rounded-md">
                <div className="text-center">
                  <span className="text-muted-foreground">Grid Layout</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add components to arrange them in a grid
                  </p>
                </div>
                <AddComponentButton
                  containerId={component.id}
                  dispatch={dispatch}
                  containerType="grid"
                />
              </div>
            )}
          </div>
        )

      case 'heading':
        const HeadingTag = component.content.level || 'h2'
        return (
          <HeadingTag
            className={`font-bold text-foreground ${getHeadingResponsiveSize(
              component.content.level
            )} ${getAlignment(
              component.content.alignment
            )} ${responsiveClasses}`}
            style={inlineStyles}
          >
            {component.content.text || 'Your Heading Here'}
          </HeadingTag>
        )

      case 'paragraph':
        return (
          <p
            className={`text-foreground leading-relaxed ${getAlignment(
              component.content.alignment
            )} ${responsiveClasses}`}
            style={inlineStyles}
          >
            {component.content.text ||
              'Your paragraph text goes here. Click to edit this content.'}
          </p>
        )

      case 'list':
        const ListTag = component.content.type === 'ordered' ? 'ol' : 'ul'
        const items = Array.isArray(component.content.items)
          ? component.content.items
          : (component.content.items || '')
              .split('\n')
              .filter((item) => item.trim())

        return (
          <ListTag
            className={`text-foreground leading-relaxed ${getAlignment(
              component.content.alignment
            )} ${responsiveClasses} ${
              component.content.type === 'ordered'
                ? 'list-decimal'
                : 'list-disc'
            } list-inside space-y-1`}
            style={inlineStyles}
          >
            {items.length > 0 ? (
              items.map((item, index) => (
                <li key={index} className="text-foreground">
                  {item.trim() || `List item ${index + 1}`}
                </li>
              ))
            ) : (
              <>
                <li>First list item</li>
                <li>Second list item</li>
                <li>Third list item</li>
              </>
            )}
          </ListTag>
        )

      case 'quote':
        const getQuoteStyle = (style: string) => {
          switch (style) {
            case 'minimal':
              return 'border-l-2 border-gray-300 pl-4 italic'
            case 'bordered':
              return 'border border-gray-200 p-4 rounded-lg bg-gray-50 italic'
            case 'highlighted':
              return 'bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg italic'
            default:
              return 'bg-blue-50 border-l-4 border-blue-500 pl-6 bg-gray-50 p-4 rounded-md italic'
          }
        }

        return (
          <blockquote
            className={`text-foreground ${getAlignment(
              component.content.alignment
            )} ${getQuoteStyle(component.content.style)} ${responsiveClasses}`}
            style={inlineStyles}
          >
            <p className="text-lg leading-relaxed mb-3">
              "
              {component.content.text ||
                'This is an inspiring quote that adds credibility and engagement to your content.'}
              "
            </p>
            {component.content.author && (
              <footer className="text-sm italic">
                — {component.content.author}
              </footer>
            )}
          </blockquote>
        )

      case 'image':
        const imageStyles = {
          ...inlineStyles,
          ...(component.content.width &&
            component.content.width !== 'auto' && {
              width: component.content.width
            }),
          ...(component.content.height &&
            component.content.height !== 'auto' && {
              height: component.content.height
            })
        }

        return (
          <div className={getAlignment(component.content.alignment)}>
            <img
              src={
                component.content.src || 'https://via.placeholder.com/500x300'
              }
              alt={component.content.alt || 'Placeholder Image'}
              className={`max-w-full ${
                component.content.width === 'auto' &&
                component.content.height === 'auto'
                  ? 'h-auto'
                  : ''
              } ${responsiveClasses}`}
              style={imageStyles}
            />
            {component.content.caption && (
              <p className="text-sm text-gray-600 mt-2 text-center">
                {component.content.caption}
              </p>
            )}
          </div>
        )

      case 'button':
        return (
          <div className={getAlignment(component.content.alignment)}>
            <Button
              variant={getButtonVariant(component.content.variant)}
              size={getButtonResponsiveSize(component.content.size)}
              className={responsiveClasses}
              style={inlineStyles}
            >
              {component.content.text || 'Click me'}
            </Button>
          </div>
        )

      case 'video':
        const getYouTubeEmbedUrl = (url: string) => {
          const videoId = url.match(
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
          )
          return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : url
        }

        const videoSrc =
          component.content.type === 'youtube'
            ? getYouTubeEmbedUrl(component.content.src || '')
            : component.content.src || ''

        return (
          <div
            className={`${getAlignment(
              component.content.alignment
            )} ${responsiveClasses}`}
            style={inlineStyles}
          >
            {component.content.type === 'youtube' ? (
              <iframe
                src={videoSrc}
                title={component.content.title || 'Video Player'}
                width={component.content.width || '100%'}
                height={component.content.height || '315px'}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg"
              />
            ) : (
              <video
                src={videoSrc}
                title={component.content.title || 'Video Player'}
                width={component.content.width || '100%'}
                height={component.content.height || '315px'}
                controls={component.content.controls !== false}
                autoPlay={component.content.autoplay === true}
                loop={component.content.loop === true}
                muted={component.content.muted === true}
                className="rounded-lg"
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        )

      case 'fanregistration':
        console.log(
          '[v0] FanRegistration alignment:',
          component.content.alignment
        )
        console.log(
          '[v0] FanRegistration getAlignment result:',
          getAlignment(component.content.alignment || 'left')
        )

        const countries = Array.isArray(component.content.countries)
          ? component.content.countries
          : [
              'United States',
              'Canada',
              'United Kingdom',
              'Australia',
              'Germany',
              'France',
              'Spain',
              'Italy',
              'Japan',
              'Brazil',
              'Mexico',
              'Other'
            ]

        const handleFanRegistrationSubmit = async (e: React.FormEvent) => {
          e.preventDefault()
          const formData = new FormData(e.target as HTMLFormElement)
          const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            country: formData.get('country'),
            city: formData.get('city'),
            zipCode: formData.get('zipCode')
          }

          console.log('[v0] Fan Registration submitted:', data)

          // Validate required fields
          if (!data.name || !data.email || !data.country) {
            alert('Please fill in all required fields')
            return
          }

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(data.email as string)) {
            alert('Please enter a valid email address')
            return
          }

          try {
            const response = await fetch(
              component.content.submitEndpoint ||
                'https://api.example.com/fan-registration',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
              }
            )

            if (response.ok) {
              alert(
                component.content.successMessage || 'Thank you for registering!'
              )
              ;(e.target as HTMLFormElement).reset()
            } else {
              alert('Registration failed. Please try again.')
            }
          } catch (error) {
            console.error('[v0] Fan Registration error:', error)
            alert('Registration failed. Please try again.')
          }
        }

        return (
          <div
            className={`w-full m-auto ${getAlignment(
              component.content.alignment || 'left'
            )} ${responsiveClasses}`}
            style={inlineStyles}
          >
            <form
              onSubmit={handleFanRegistrationSubmit}
              className="space-y-6 p-8 bg-white border border-gray-200 rounded-xl shadow-lg w-full max-w-2xl"
              style={{
                backgroundColor: component.content.backgroundColor || '#ffffff',
                borderColor: component.content.borderColor || '#e5e7eb'
              }}
            >
              {component.content.title && (
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
                  {component.content.title}
                </h2>
              )}

              {/* Name Field */}
              <div className="space-y-2">
                <label
                  htmlFor="fan-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="fan-name"
                  name="name"
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="fan-email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="fan-email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your email address"
                />
              </div>

              {/* Country Field */}
              <div className="space-y-2">
                <label
                  htmlFor="fan-country"
                  className="block text-sm font-medium text-gray-700"
                >
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  id="fan-country"
                  name="country"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select your country</option>
                  {countries.map((country, index) => (
                    <option key={index} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              {/* City Field */}
              <div className="space-y-2">
                <label
                  htmlFor="fan-city"
                  className="block text-sm font-medium text-gray-700"
                >
                  City
                </label>
                <input
                  id="fan-city"
                  name="city"
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your city"
                />
              </div>

              {/* Zip Code Field */}
              <div className="space-y-2">
                <label
                  htmlFor="fan-zipcode"
                  className="block text-sm font-medium text-gray-700"
                >
                  Zip Code
                </label>
                <input
                  id="fan-zipcode"
                  name="zipCode"
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your zip code"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {component.content.submitButtonText || 'Register Now'}
              </button>
            </form>
          </div>
        )

      default:
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            Unknown component type: {component.type}
          </div>
        )
    }
  }

  return (
    <div
      className={cn(
        'relative group',
        isSelected && 'ring-2 ring-accent ring-offset-2',
        isHovered && 'ring-1 ring-accent ring-offset-1'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      onDragOver={onDragOver}
    >
      {renderComponent()}
      {!isPreviewMode && (
        <div className="absolute top-2 right-2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDuplicate()
            }}
            className="p-1 rounded-md bg-white hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9zM6 6a1.5 1.5 0 00-1.5 1.5v9A1.5   7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9zM6 6a1.5 1.5 0 00-1.5 1.5v9A1.5
006 18h9a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0015 6H6zm3 6.75a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="p-1 rounded-md bg-white hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M16.5 5.25a.75.75 0 01.75.75v6a.75.75 0 01-1.5 0V6a.75.75 0 01.75-.75zM9 5.25a.75.75 0 01.75.75v6a.75.75 0 01-1.5 0V6a.75.75 0 01.75-.75zM3 9a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 9v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.
25 0 013 15V9z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
