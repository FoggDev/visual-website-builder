'use client'

import type { Breakpoint, BuilderComponent } from './builder-context'

export function getInheritedStyles(
  component: BuilderComponent,
  targetBreakpoint: Breakpoint
): Record<string, any> {
  const breakpointHierarchy: Breakpoint[] = ['desktop', 'tablet', 'mobile']
  const targetIndex = breakpointHierarchy.indexOf(targetBreakpoint)

  let inheritedStyles = {}

  // Inherit from parent breakpoints
  for (let i = 0; i <= targetIndex; i++) {
    const breakpoint = breakpointHierarchy[i]
    const styles = component.styles[breakpoint] || {}
    inheritedStyles = { ...inheritedStyles, ...styles }
  }

  return inheritedStyles
}

export function getEffectiveStyles(
  component: BuilderComponent,
  currentBreakpoint: Breakpoint
): Record<string, any> {
  return getInheritedStyles(component, currentBreakpoint)
}

export function hasCustomStylesForBreakpoint(
  component: BuilderComponent,
  breakpoint: Breakpoint
): boolean {
  const styles = component.styles[breakpoint]
  return styles && Object.keys(styles).length > 0
}

export function getBreakpointLabel(breakpoint: Breakpoint): string {
  switch (breakpoint) {
    case 'desktop':
      return 'Desktop (1200px+)'
    case 'tablet':
      return 'Tablet (768-1199px)'
    case 'mobile':
      return 'Mobile (320-767px)'
    default:
      return breakpoint
  }
}

export function getBreakpointIcon(breakpoint: Breakpoint): string {
  switch (breakpoint) {
    case 'desktop':
      return '🖥️'
    case 'tablet':
      return '📱'
    case 'mobile':
      return '📱'
    default:
      return '📱'
  }
}

export function cleanupBreakpointStyles(
  component: BuilderComponent
): BuilderComponent {
  const cleanedStyles = { ...component.styles }

  // Remove empty style objects
  Object.keys(cleanedStyles).forEach((breakpoint) => {
    const styles = cleanedStyles[breakpoint as Breakpoint]
    if (styles && Object.keys(styles).length === 0) {
      delete cleanedStyles[breakpoint as Breakpoint]
    }
  })

  return {
    ...component,
    styles: cleanedStyles
  }
}

export function copyStylesToBreakpoint(
  component: BuilderComponent,
  fromBreakpoint: Breakpoint,
  toBreakpoint: Breakpoint
): BuilderComponent {
  const sourceStyles = component.styles[fromBreakpoint] || {}

  return {
    ...component,
    styles: {
      ...component.styles,
      [toBreakpoint]: { ...sourceStyles }
    }
  }
}

export function resetBreakpointStyles(
  component: BuilderComponent,
  breakpoint: Breakpoint
): BuilderComponent {
  const newStyles = { ...component.styles }
  delete newStyles[breakpoint]

  return {
    ...component,
    styles: newStyles
  }
}
