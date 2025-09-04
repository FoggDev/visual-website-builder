'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { generateId } from '@/lib/utils'

import { getAllComponentRegistryItems } from './component-registry'
import { getComponentTemplate } from './component-templates'

interface AddComponentButtonProps {
  containerId: string
  dispatch: any
  containerType:
    | 'container'
    | 'grid'
    | 'section'
    | 'form'
    | 'hero'
    | 'card'
    | 'sidebar'
}

export function AddComponentButton({
  containerId,
  dispatch,
  containerType
}: AddComponentButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const allComponents = getAllComponentRegistryItems()

  const handleAddComponent = (componentType: string) => {
    if (!containerId) {
      console.error(
        '[v0] AddComponentButton: containerId is undefined, cannot add component'
      )
      return
    }

    if (!dispatch || typeof dispatch !== 'function') {
      console.error(
        '[v0] AddComponentButton: dispatch is not a function, cannot add component'
      )
      return
    }

    const template = getComponentTemplate(componentType)

    if (!template) {
      console.warn(`No template found for component type: ${componentType}`)
      return
    }

    const content = { ...template.defaultContent }

    // Generate unique names for form field components
    const formFieldTypes = [
      'input',
      'textarea',
      'checkbox',
      'select',
      'radiogroup'
    ]
    if (formFieldTypes.includes(componentType) && content.name) {
      const timestamp = Date.now().toString().slice(-6) // Last 6 digits of timestamp
      const baseName = content.name.replace(/_field$/, '') // Remove _field suffix if present
      content.name = `${baseName}_${timestamp}`
    }

    const newComponent = {
      id: generateId(),
      type: componentType,
      content,
      styles: {
        desktop: { ...template.defaultStyles.desktop },
        tablet: { ...template.defaultStyles.tablet },
        mobile: { ...template.defaultStyles.mobile }
      }
    }

    console.log('[v0] Adding component via button:', containerId, newComponent)

    dispatch({
      type: 'ADD_TO_CONTAINER',
      payload: {
        containerId: containerId,
        component: newComponent
      }
    })

    setIsOpen(false)
  }

  if (isOpen) {
    return (
      <div className="relative">
        <Card className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10 p-4 shadow-lg border bg-background min-w-[400px] max-h-[400px] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-sm">Add Component</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsOpen(false)}
            >
              ×
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {allComponents.map((component) => {
              const Icon = component.icon
              return (
                <Button
                  key={component.id}
                  variant="ghost"
                  className="h-auto p-2 flex flex-col items-center gap-1 hover:bg-accent text-xs"
                  onClick={() => handleAddComponent(component.id)}
                >
                  <Icon className="h-4 w-4" />
                  <div className="text-center">
                    <div className="text-xs font-medium">{component.name}</div>
                  </div>
                </Button>
              )
            })}
          </div>
        </Card>
        <div className="fixed inset-0 z-0" onClick={() => setIsOpen(false)} />
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full border-dashed border-2 hover:border-accent hover:bg-accent/10 transition-colors bg-transparent"
      onClick={() => setIsOpen(true)}
    >
      <Plus className="h-4 w-4 mr-2" />
      Add Component
    </Button>
  )
}
