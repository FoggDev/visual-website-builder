"use client"

import type React from "react"
import { getComponentTemplate } from "./component-templates"

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}

export const generateTailwindClasses = (styles: Record<string, any>, prefix = ""): string => {
  let classes = ""

  // Convert style properties to Tailwind classes
  Object.entries(styles).forEach(([key, value]) => {
    switch (key) {
      case "fontSize":
        if (value === "12px") classes += ` ${prefix}text-xs`
        else if (value === "14px") classes += ` ${prefix}text-sm`
        else if (value === "16px") classes += ` ${prefix}text-base`
        else if (value === "18px") classes += ` ${prefix}text-lg`
        else if (value === "20px") classes += ` ${prefix}text-xl`
        else if (value === "24px") classes += ` ${prefix}text-2xl`
        else if (value === "30px") classes += ` ${prefix}text-3xl`
        else if (value === "36px") classes += ` ${prefix}text-4xl`
        break
      case "fontWeight":
        if (value === "400") classes += ` ${prefix}font-normal`
        else if (value === "500") classes += ` ${prefix}font-medium`
        else if (value === "600") classes += ` ${prefix}font-semibold`
        else if (value === "700") classes += ` ${prefix}font-bold`
        break
      case "textAlign":
        if (value === "center") classes += ` ${prefix}text-center`
        else if (value === "right") classes += ` ${prefix}text-right`
        else if (value === "justify") classes += ` ${prefix}text-justify`
        break
      case "marginTop":
        if (value === "8px") classes += ` ${prefix}mt-2`
        else if (value === "16px") classes += ` ${prefix}mt-4`
        else if (value === "24px") classes += ` ${prefix}mt-6`
        else if (value === "32px") classes += ` ${prefix}mt-8`
        break
      case "marginBottom":
        if (value === "8px") classes += ` ${prefix}mb-2`
        else if (value === "16px") classes += ` ${prefix}mb-4`
        else if (value === "24px") classes += ` ${prefix}mb-6`
        else if (value === "32px") classes += ` ${prefix}mb-8`
        break
      case "padding":
        if (value === "8px") classes += ` ${prefix}p-2`
        else if (value === "16px") classes += ` ${prefix}p-4`
        else if (value === "24px") classes += ` ${prefix}p-6`
        else if (value === "32px") classes += ` ${prefix}p-8`
        break
      case "display":
        if (value === "flex") classes += ` ${prefix}flex`
        else if (value === "inline-flex") classes += ` ${prefix}inline-flex`
        else if (value === "block") classes += ` ${prefix}block`
        else if (value === "inline-block") classes += ` ${prefix}inline-block`
        else if (value === "none") classes += ` ${prefix}hidden`
        break
      case "width":
        if (value === "100%") classes += ` ${prefix}w-full`
        else if (value === "75%") classes += ` ${prefix}w-3/4`
        else if (value === "50%") classes += ` ${prefix}w-1/2`
        else if (value === "25%") classes += ` ${prefix}w-1/4`
        break
      case "height":
        if (value === "100vh") classes += ` ${prefix}h-screen`
        else if (value === "100%") classes += ` ${prefix}h-full`
        break
    }
  })

  return classes.trim()
}

export const handleContainerDrop = (e: React.DragEvent, containerId: string, dispatch: any) => {
  e.preventDefault()
  e.stopPropagation()

  try {
    const data = JSON.parse(e.dataTransfer.getData("application/json"))
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
        mobile: { ...template.defaultStyles.mobile },
      },
    }

    dispatch({
      type: "ADD_TO_CONTAINER",
      payload: {
        component: newComponent,
        containerId: containerId,
      },
    })

    console.log("[v0] Added component to container:", containerId, newComponent)
  } catch (error) {
    console.error("Error parsing drop data for container:", error)
  }
}

export const duplicateComponent = (componentId: string, dispatch: any) => {
  console.log("[v0] Duplicating component:", componentId)
  dispatch({
    type: "DUPLICATE_COMPONENT",
    payload: { id: componentId },
  })
}

export const deleteComponent = (componentId: string, dispatch: any) => {
  console.log("[v0] Deleting component:", componentId)
  dispatch({
    type: "DELETE_COMPONENT",
    payload: { id: componentId },
  })
}
