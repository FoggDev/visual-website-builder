'use client'

import type React from 'react'
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode
} from 'react'

// Import React for useEffect

// Component types
export interface BuilderComponent {
  id: string
  type: string
  content: Record<string, any>
  styles: {
    desktop: Record<string, any>
    tablet: Record<string, any>
    mobile: Record<string, any>
  }
  children?: BuilderComponent[]
  parentId?: string
}

export interface Page {
  id: string
  name: string
  url: string
  components: BuilderComponent[]
}

// Routing configuration interface
export interface RouteMapping {
  id: string
  path: string
  pageId: string
  isActive: boolean
}

// Breakpoint type
export type Breakpoint = 'desktop' | 'tablet' | 'mobile'

// Builder state
interface BuilderState {
  pages: Page[]
  currentPageId: string
  selectedComponentId: string | null
  currentBreakpoint: Breakpoint
  previewMode: boolean
  leftSidebarVisible: boolean
  rightSidebarVisible: boolean
  canvasBackground: {
    type: 'color' | 'image'
    color: string
    image?: string
    imageSize: 'cover' | 'contain' | 'repeat'
    imagePosition: 'center' | 'top' | 'bottom' | 'left' | 'right'
  }
  // Routing configuration
  routeMappings: RouteMapping[]
}

// Actions
type BuilderAction =
  | {
      type: 'ADD_COMPONENT'
      payload: {
        component: BuilderComponent
        parentId?: string
        insertIndex?: number
      }
    }
  | {
      type: 'UPDATE_COMPONENT'
      payload: { id: string; updates: Partial<BuilderComponent> }
    }
  | { type: 'DELETE_COMPONENT'; payload: { id: string } }
  | { type: 'SELECT_COMPONENT'; payload: { id: string | null } }
  | { type: 'SET_BREAKPOINT'; payload: { breakpoint: Breakpoint } }
  | { type: 'TOGGLE_PREVIEW'; payload: { enabled: boolean } }
  | { type: 'REORDER_COMPONENTS'; payload: { dragId: string; hoverId: string } }
  | { type: 'DUPLICATE_COMPONENT'; payload: { id: string } }
  | { type: 'IMPORT_COMPONENTS'; payload: { components: BuilderComponent[] } }
  | {
      type: 'ADD_TO_CONTAINER'
      payload: { component: BuilderComponent; containerId: string }
    }
  | { type: 'TOGGLE_LEFT_SIDEBAR' }
  | { type: 'TOGGLE_RIGHT_SIDEBAR' }
  | {
      type: 'REORDER_COMPONENT'
      payload: { componentId: string; newIndex: number; parentId?: string }
    }
  | {
      type: 'UPDATE_CANVAS_BACKGROUND'
      payload: { background: Partial<BuilderState['canvasBackground']> }
    }
  | { type: 'ADD_PAGE'; payload: { page: Page } }
  | { type: 'DELETE_PAGE'; payload: { pageId: string } }
  | { type: 'UPDATE_PAGE'; payload: { pageId: string; updates: Partial<Page> } }
  | { type: 'SET_CURRENT_PAGE'; payload: { pageId: string } }
  | { type: 'DUPLICATE_PAGE'; payload: { pageId: string } }
  // Routing configuration actions
  | { type: 'ADD_ROUTE_MAPPING'; payload: { routeMapping: RouteMapping } }
  | {
      type: 'UPDATE_ROUTE_MAPPING'
      payload: { id: string; updates: Partial<RouteMapping> }
    }
  | { type: 'DELETE_ROUTE_MAPPING'; payload: { id: string } }

const defaultPage: Page = {
  id: 'home',
  name: 'Home',
  url: '/',
  components: []
}

const initialState: BuilderState = {
  pages: [defaultPage],
  currentPageId: 'home',
  selectedComponentId: null,
  currentBreakpoint: 'desktop',
  previewMode: false,
  leftSidebarVisible: true,
  rightSidebarVisible: true,
  canvasBackground: {
    type: 'color',
    color: '#ffffff',
    imageSize: 'cover',
    imagePosition: 'center'
  },
  // Default route mappings
  routeMappings: [
    {
      id: 'default-home',
      path: '/',
      pageId: 'home',
      isActive: true
    }
  ]
}

function getCurrentPageComponents(state: BuilderState): BuilderComponent[] {
  if (!state || !state.pages || !Array.isArray(state.pages)) {
    return []
  }
  const currentPage = state.pages.find(
    (page) => page.id === state.currentPageId
  )
  return currentPage?.components || []
}

function updateCurrentPageComponents(
  state: BuilderState,
  components: BuilderComponent[]
): BuilderState {
  return {
    ...state,
    pages: state.pages.map((page) =>
      page.id === state.currentPageId ? { ...page, components } : page
    )
  }
}

function builderReducer(
  state: BuilderState,
  action: BuilderAction
): BuilderState {
  console.log('[v0] builderReducer action:', action.type, action.payload)

  let parentId: string | undefined
  try {
    switch (action.type) {
      case 'ADD_PAGE':
        return {
          ...state,
          pages: [...state.pages, action.payload.page],
          currentPageId: action.payload.page.id,
          selectedComponentId: null
        }

      case 'DELETE_PAGE':
        const filteredPages = state.pages.filter(
          (page) => page.id !== action.payload.pageId
        )
        // Don't allow deleting the last page
        if (filteredPages.length === 0) return state

        return {
          ...state,
          pages: filteredPages,
          currentPageId:
            state.currentPageId === action.payload.pageId
              ? filteredPages[0].id
              : state.currentPageId,
          selectedComponentId: null
        }

      case 'UPDATE_PAGE':
        return {
          ...state,
          pages: state.pages.map((page) =>
            page.id === action.payload.pageId
              ? { ...page, ...action.payload.updates }
              : page
          )
        }

      case 'SET_CURRENT_PAGE':
        return {
          ...state,
          currentPageId: action.payload.pageId,
          selectedComponentId: null
        }

      case 'DUPLICATE_PAGE':
        const pageToDuplicate = state.pages.find(
          (page) => page.id === action.payload.pageId
        )
        if (!pageToDuplicate) return state

        const duplicatedPage: Page = {
          ...pageToDuplicate,
          id: Math.random().toString(36).substr(2, 9),
          name: `${pageToDuplicate.name} Copy`,
          url: `${pageToDuplicate.url}-copy`,
          components: pageToDuplicate.components.map((comp) => ({
            ...comp,
            id: Math.random().toString(36).substr(2, 9)
          }))
        }

        return {
          ...state,
          pages: [...state.pages, duplicatedPage],
          currentPageId: duplicatedPage.id,
          selectedComponentId: null
        }

      case 'UPDATE_CANVAS_BACKGROUND':
        return {
          ...state,
          canvasBackground: {
            ...state.canvasBackground,
            ...action.payload.background
          }
        }

      case 'REORDER_COMPONENT':
        const { componentId, newIndex } = action.payload
        parentId = action.payload.parentId
        const currentComponents = getCurrentPageComponents(state)

        if (parentId) {
          // Reorder within a container's children
          const reorderInContainer = (
            components: BuilderComponent[]
          ): BuilderComponent[] => {
            return components.map((comp) => {
              if (comp.id === parentId && comp.children) {
                const currentIndex = comp.children.findIndex(
                  (c) => c.id === componentId
                )
                if (
                  currentIndex === -1 ||
                  newIndex < 0 ||
                  newIndex >= comp.children.length
                ) {
                  return comp
                }

                const newChildren = [...comp.children]
                const [movedComponent] = newChildren.splice(currentIndex, 1)
                newChildren.splice(newIndex, 0, movedComponent)

                return { ...comp, children: newChildren }
              }
              if (comp.children) {
                return { ...comp, children: reorderInContainer(comp.children) }
              }
              return comp
            })
          }

          return updateCurrentPageComponents(
            state,
            reorderInContainer(currentComponents)
          )
        } else {
          // Reorder at root level
          const currentIndex = currentComponents.findIndex(
            (c) => c.id === componentId
          )

          if (
            currentIndex === -1 ||
            newIndex < 0 ||
            newIndex >= currentComponents.length
          ) {
            return state
          }

          const newComponents = [...currentComponents]
          const [movedComponent] = newComponents.splice(currentIndex, 1)
          newComponents.splice(newIndex, 0, movedComponent)

          return updateCurrentPageComponents(state, newComponents)
        }

      case 'ADD_COMPONENT':
        const { component, insertIndex } = action.payload
        parentId = action.payload.parentId
        const componentsForAdd = getCurrentPageComponents(state)

        if (parentId) {
          const addToContainer = (
            components: BuilderComponent[]
          ): BuilderComponent[] => {
            return components.map((comp) => {
              if (comp.id === parentId) {
                return {
                  ...comp,
                  children: [
                    ...(comp.children || []),
                    { ...component, parentId }
                  ]
                }
              }
              if (comp.children) {
                return {
                  ...comp,
                  children: addToContainer(comp.children)
                }
              }
              return comp
            })
          }

          return {
            ...updateCurrentPageComponents(
              state,
              addToContainer(componentsForAdd)
            ),
            selectedComponentId: component.id
          }
        }

        if (insertIndex !== undefined) {
          const newComponents = [...componentsForAdd]
          newComponents.splice(insertIndex, 0, component)
          return {
            ...updateCurrentPageComponents(state, newComponents),
            selectedComponentId: component.id
          }
        }
        return {
          ...updateCurrentPageComponents(state, [
            ...componentsForAdd,
            component
          ]),
          selectedComponentId: component.id
        }

      case 'ADD_TO_CONTAINER':
        const { component: containerComponent, containerId } = action.payload
        const componentsForContainer = getCurrentPageComponents(state)
        const addToSpecificContainer = (
          components: BuilderComponent[]
        ): BuilderComponent[] => {
          return components.map((comp) => {
            if (comp.id === containerId) {
              return {
                ...comp,
                children: [
                  ...(comp.children || []),
                  { ...containerComponent, parentId: containerId }
                ]
              }
            }
            if (comp.children) {
              return {
                ...comp,
                children: addToSpecificContainer(comp.children)
              }
            }
            return comp
          })
        }

        return {
          ...updateCurrentPageComponents(
            state,
            addToSpecificContainer(componentsForContainer)
          ),
          selectedComponentId: containerComponent.id
        }

      case 'DUPLICATE_COMPONENT':
        console.log(
          '[v0] DUPLICATE_COMPONENT starting for id:',
          action.payload.id
        )
        const componentsForDuplicate = getCurrentPageComponents(state)
        console.log(
          '[v0] Components for duplicate:',
          componentsForDuplicate.length
        )

        const findComponent = (
          components: BuilderComponent[],
          id: string
        ): BuilderComponent | null => {
          for (const comp of components) {
            if (!comp) {
              console.log('[v0] Found null component in array')
              continue
            }
            if (!comp.id) {
              console.log('[v0] Found component without id:', comp)
              continue
            }
            if (comp.id === id) {
              console.log('[v0] Found component:', comp.id)
              return comp
            }
            if (comp.children && Array.isArray(comp.children)) {
              const found = findComponent(comp.children, id)
              if (found) return found
            }
          }
          return null
        }

        const componentToDuplicate = findComponent(
          componentsForDuplicate,
          action.payload.id
        )
        console.log('[v0] Component to duplicate:', componentToDuplicate?.id)

        if (!componentToDuplicate) {
          console.log('[v0] Component not found for duplication')
          return state
        }

        const newComponentId = Math.random().toString(36).substr(2, 9)

        const originalParentId = componentToDuplicate.parentId

        const duplicatedComponent = {
          ...componentToDuplicate,
          id: newComponentId,
          content: { ...componentToDuplicate.content },
          children: componentToDuplicate.children
            ? componentToDuplicate.children.map((child) => ({
                ...child,
                id: Math.random().toString(36).substr(2, 9),
                parentId: newComponentId
              }))
            : undefined
        }

        if (originalParentId) {
          // Duplicate within container
          const duplicateInContainer = (
            components: BuilderComponent[]
          ): BuilderComponent[] => {
            return components.map((comp) => {
              if (!comp) {
                console.log('[v0] Null component in duplicateInContainer')
                return comp
              }
              if (!comp.id) {
                console.log(
                  '[v0] Component without id in duplicateInContainer:',
                  comp
                )
                return comp
              }

              if (comp.id === originalParentId && comp.children) {
                const originalIndex = comp.children.findIndex(
                  (c) => c && c.id === action.payload.id
                )
                const newChildren = [...comp.children]
                const duplicatedWithParent = {
                  ...duplicatedComponent,
                  parentId: originalParentId
                }
                newChildren.splice(originalIndex + 1, 0, duplicatedWithParent)
                return { ...comp, children: newChildren }
              }
              if (comp.children) {
                return {
                  ...comp,
                  children: duplicateInContainer(comp.children)
                }
              }
              return comp
            })
          }

          return {
            ...updateCurrentPageComponents(
              state,
              duplicateInContainer(componentsForDuplicate)
            ),
            selectedComponentId: duplicatedComponent.id
          }
        } else {
          // Duplicate at root level
          const originalIndex = componentsForDuplicate.findIndex((c) => {
            if (!c || !c.id) {
              console.log('[v0] Null component in root level findIndex')
              return false
            }
            return c.id === action.payload.id
          })

          const newComponents = [...componentsForDuplicate]
          newComponents.splice(originalIndex + 1, 0, duplicatedComponent)

          return {
            ...updateCurrentPageComponents(state, newComponents),
            selectedComponentId: duplicatedComponent.id
          }
        }

      case 'UPDATE_COMPONENT':
        console.log('[v0] UPDATE_COMPONENT action:', action.payload)
        const componentsForUpdate = getCurrentPageComponents(state)

        const updateNestedComponent = (
          components: BuilderComponent[]
        ): BuilderComponent[] => {
          return components.map((comp) => {
            if (comp.id === action.payload.id) {
              return { ...comp, ...action.payload.updates }
            }
            if (comp.children) {
              return { ...comp, children: updateNestedComponent(comp.children) }
            }
            return comp
          })
        }

        const updatedComponents = updateNestedComponent(componentsForUpdate)
        console.log(
          '[v0] Updated components:',
          updatedComponents.find((c) => c.id === action.payload.id)
        )
        return updateCurrentPageComponents(state, updatedComponents)

      case 'DELETE_COMPONENT':
        const componentsForDelete = getCurrentPageComponents(state)
        const deleteNestedComponent = (
          components: BuilderComponent[]
        ): BuilderComponent[] => {
          return components
            .filter((comp) => comp.id !== action.payload.id)
            .map((comp) => ({
              ...comp,
              children: comp.children
                ? deleteNestedComponent(comp.children)
                : undefined
            }))
        }

        return {
          ...updateCurrentPageComponents(
            state,
            deleteNestedComponent(componentsForDelete)
          ),
          selectedComponentId:
            state.selectedComponentId === action.payload.id
              ? null
              : state.selectedComponentId
        }
      case 'SELECT_COMPONENT':
        const selectedComponentId = action.payload?.id || null
        return {
          ...state,
          selectedComponentId: selectedComponentId
        }
      case 'SET_BREAKPOINT':
        return {
          ...state,
          currentBreakpoint: action.payload.breakpoint
        }
      case 'TOGGLE_PREVIEW':
        return {
          ...state,
          previewMode: action.payload.enabled
        }
      case 'IMPORT_COMPONENTS':
        return updateCurrentPageComponents(state, action.payload.components)
      case 'TOGGLE_LEFT_SIDEBAR':
        return {
          ...state,
          leftSidebarVisible: !state.leftSidebarVisible
        }
      case 'TOGGLE_RIGHT_SIDEBAR':
        return {
          ...state,
          rightSidebarVisible: !state.rightSidebarVisible
        }
      // Routing configuration cases
      case 'ADD_ROUTE_MAPPING':
        return {
          ...state,
          routeMappings: [...state.routeMappings, action.payload.routeMapping]
        }

      case 'UPDATE_ROUTE_MAPPING':
        return {
          ...state,
          routeMappings: state.routeMappings.map((mapping) =>
            mapping.id === action.payload.id
              ? { ...mapping, ...action.payload.updates }
              : mapping
          )
        }

      case 'DELETE_ROUTE_MAPPING':
        return {
          ...state,
          routeMappings: state.routeMappings.filter(
            (mapping) => mapping.id !== action.payload.id
          )
        }
      default:
        return state
    }
  } catch (error) {
    console.error(
      '[v0] Error in builderReducer:',
      error,
      'Action:',
      action.type,
      action.payload
    )
    return state
  }
}

const BuilderContext = createContext<{
  state: BuilderState
  dispatch: React.Dispatch<BuilderAction>
} | null>(null)

export function BuilderProvider({ children }: { children: ReactNode }) {
  const getInitialState = (): BuilderState => {
    if (typeof window !== 'undefined') {
      try {
        const savedState = localStorage.getItem('mira-builder-state')
        if (savedState) {
          const parsed = JSON.parse(savedState)
          // Ensure the state has the required structure
          if (
            parsed.pages &&
            Array.isArray(parsed.pages) &&
            parsed.pages.length > 0
          ) {
            return {
              ...initialState,
              ...parsed,
              // Ensure we have a valid currentPageId
              currentPageId:
                parsed.currentPageId &&
                parsed.pages.find((p: Page) => p.id === parsed.currentPageId)
                  ? parsed.currentPageId
                  : parsed.pages[0].id
            }
          }
        }
      } catch (error) {
        console.warn('[v0] Failed to load saved state:', error)
      }
    }
    return initialState
  }

  const [state, dispatch] = useReducer(builderReducer, getInitialState())

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('mira-builder-state', JSON.stringify(state))
      } catch (error) {
        console.warn('[v0] Failed to save state:', error)
      }
    }
  }, [state])

  return (
    <BuilderContext.Provider value={{ state, dispatch }}>
      {children}
    </BuilderContext.Provider>
  )
}

export function useBuilder() {
  const context = useContext(BuilderContext)
  if (!context) {
    throw new Error('useBuilder must be used within a BuilderProvider')
  }
  return context
}

export function findComponentById(
  state: BuilderState,
  id: string
): BuilderComponent | null {
  if (!state || !state.pages) {
    return null
  }

  const components = getCurrentPageComponents(state)
  for (const comp of components) {
    if (comp.id === id) return comp
    if (comp.children) {
      const found = findComponentInChildren(comp.children, id)
      if (found) return found
    }
  }
  return null
}

function findComponentInChildren(
  children: BuilderComponent[],
  id: string
): BuilderComponent | null {
  for (const comp of children) {
    if (!comp || !comp.id) continue
    if (comp.id === id) return comp
    if (comp.children) {
      const found = findComponentInChildren(comp.children, id)
      if (found) return found
    }
  }
  return null
}

export function findComponentAndParent(
  state: BuilderState,
  id: string
): {
  component: BuilderComponent
  parent: BuilderComponent | null
  siblings: BuilderComponent[]
} | null {
  if (!state || !state.pages) {
    return null
  }

  const components = getCurrentPageComponents(state)

  // Check root level
  for (let i = 0; i < components.length; i++) {
    const comp = components[i]
    if (comp.id === id) {
      return { component: comp, parent: null, siblings: components }
    }
  }

  // Check nested levels
  for (const comp of components) {
    if (comp.children) {
      for (let i = 0; i < comp.children.length; i++) {
        const child = comp.children[i]
        if (child.id === id) {
          return { component: child, parent: comp, siblings: comp.children }
        }
      }

      const found = findComponentAndParentInChildren(comp.children, id, comp)
      if (found) return found
    }
  }

  return null
}

function findComponentAndParentInChildren(
  children: BuilderComponent[],
  id: string,
  parent: BuilderComponent
): {
  component: BuilderComponent
  parent: BuilderComponent | null
  siblings: BuilderComponent[]
} | null {
  for (const comp of children) {
    if (comp.children) {
      for (let i = 0; i < comp.children.length; i++) {
        const child = comp.children[i]
        if (child.id === id) {
          return { component: child, parent: comp, siblings: comp.children }
        }
      }

      const found = findComponentAndParentInChildren(comp.children, id, comp)
      if (found) return found
    }
  }
  return null
}

export function getComponentPosition(
  state: BuilderState,
  id: string
): {
  index: number
  total: number
  parentId?: string
} | null {
  if (!state || !state.pages) {
    return null
  }

  const result = findComponentAndParent(state, id)
  if (!result) return null

  const index = result.siblings.findIndex((c) => c.id === id)
  return {
    index,
    total: result.siblings.length,
    parentId: result.parent?.id
  }
}

export function updateContent(
  dispatch: React.Dispatch<BuilderAction>,
  componentId: string,
  content: Record<string, any>
) {
  console.log('[v0] updateContent called with:', componentId, content)
  dispatch({
    type: 'UPDATE_COMPONENT',
    payload: {
      id: componentId,
      updates: { content }
    }
  })
}

export function updateStyles(
  dispatch: React.Dispatch<BuilderAction>,
  componentId: string,
  breakpoint: Breakpoint,
  styles: Record<string, any>
) {
  console.log('[v0] updateStyles called with:', componentId, breakpoint, styles)
  dispatch({
    type: 'UPDATE_COMPONENT',
    payload: {
      id: componentId,
      updates: {
        styles: {
          desktop: breakpoint === 'desktop' ? styles : {},
          tablet: breakpoint === 'tablet' ? styles : {},
          mobile: breakpoint === 'mobile' ? styles : {}
        }
      }
    }
  })
}

// Helper function to find page by route path
export function findPageByPath(state: BuilderState, path: string): Page | null {
  const routeMapping = state.routeMappings.find(
    (mapping) => mapping.path === path && mapping.isActive
  )
  if (!routeMapping) return null

  return state.pages.find((page) => page.id === routeMapping.pageId) || null
}
