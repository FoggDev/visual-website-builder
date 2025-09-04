'use client'

import {
  AlignLeft,
  Box,
  CheckSquare,
  ChevronDown,
  FileText,
  FormInput,
  Grid3X3,
  ImageIcon,
  Layout,
  Link,
  List,
  Menu,
  Minus,
  MousePointer,
  Play,
  Quote,
  Radio,
  Sidebar,
  Square,
  Type,
  Users
} from 'lucide-react'
import type React from 'react'

import {
  componentTemplates,
  type ComponentTemplate
} from './component-templates'

export interface ComponentRegistryItem {
  id: string
  name: string
  description: string
  category: string
  icon: React.ComponentType<any>
  template: ComponentTemplate
}

export const componentRegistry: Record<string, ComponentRegistryItem> = {
  navbar: {
    id: 'navbar',
    name: 'Navbar',
    description:
      'Navigation bar with logo and menu items, responsive hamburger menu',
    category: 'Layout',
    icon: Menu,
    template: componentTemplates.navbar
  },
  form: {
    id: 'form',
    name: 'Form',
    description: 'Form wrapper container for form elements',
    category: 'Layout',
    icon: FormInput,
    template: componentTemplates.form
  },
  input: {
    id: 'input',
    name: 'Input',
    description: 'Text input field',
    category: 'Interactive',
    icon: FormInput,
    template: componentTemplates.input
  },
  textarea: {
    id: 'textarea',
    name: 'TextArea',
    description: 'Multi-line text input field',
    category: 'Interactive',
    icon: FileText,
    template: componentTemplates.textarea
  },
  checkbox: {
    id: 'checkbox',
    name: 'Checkbox',
    description: 'Checkbox input field with label',
    category: 'Interactive',
    icon: CheckSquare,
    template: componentTemplates.checkbox
  },
  select: {
    id: 'select',
    name: 'Select',
    description: 'Dropdown select field with customizable options',
    category: 'Interactive',
    icon: ChevronDown,
    template: componentTemplates.select
  },
  radiogroup: {
    id: 'radiogroup',
    name: 'Radio Group',
    description: 'Radio button group for single selection',
    category: 'Interactive',
    icon: Radio,
    template: componentTemplates.radiogroup
  },
  link: {
    id: 'link',
    name: 'Link',
    description: 'Clickable text link',
    category: 'Interactive',
    icon: Link,
    template: componentTemplates.link
  },
  divider: {
    id: 'divider',
    name: 'Divider',
    description: 'Horizontal line separator',
    category: 'Content',
    icon: Minus,
    template: componentTemplates.divider
  },
  video: {
    id: 'video',
    name: 'Video',
    description: 'Embed YouTube videos or MP4 files',
    category: 'Content',
    icon: Play,
    template: componentTemplates.video
  },
  quote: {
    id: 'quote',
    name: 'Quote',
    description: 'Blockquote with optional author attribution',
    category: 'Content',
    icon: Quote,
    template: componentTemplates.quote
  },
  list: {
    id: 'list',
    name: 'List',
    description: 'Ordered or unordered list with customizable items',
    category: 'Content',
    icon: List,
    template: componentTemplates.list
  },
  sidebar: {
    id: 'sidebar',
    name: 'Sidebar',
    description: 'Side navigation or content panel',
    category: 'Layout',
    icon: Sidebar,
    template: componentTemplates.sidebar
  },
  section: {
    id: 'section',
    name: 'Section',
    description: 'Semantic section container for content organization',
    category: 'Layout',
    icon: Layout,
    template: componentTemplates.section
  },
  grid: {
    id: 'grid',
    name: 'Grid',
    description: 'CSS Grid layout container',
    category: 'Layout',
    icon: Grid3X3,
    template: componentTemplates.grid
  },
  container: {
    id: 'container',
    name: 'Container',
    description: 'Layout container for grouping elements',
    category: 'Layout',
    icon: Box,
    template: componentTemplates.container
  },
  heading: {
    id: 'heading',
    name: 'Heading',
    description: 'Text heading (H1-H6)',
    category: 'Content',
    icon: Type,
    template: componentTemplates.heading
  },
  paragraph: {
    id: 'paragraph',
    name: 'Paragraph',
    description: 'Body text paragraph',
    category: 'Content',
    icon: AlignLeft,
    template: componentTemplates.paragraph
  },
  button: {
    id: 'button',
    name: 'Button',
    description: 'Clickable button',
    category: 'Interactive',
    icon: MousePointer,
    template: componentTemplates.button
  },
  image: {
    id: 'image',
    name: 'Image',
    description: 'Responsive image',
    category: 'Content',
    icon: ImageIcon,
    template: componentTemplates.image
  },
  hero: {
    id: 'hero',
    name: 'Hero Section',
    description: 'Large banner section',
    category: 'Layout',
    icon: Square,
    template: componentTemplates.hero
  },
  card: {
    id: 'card',
    name: 'Card',
    description: 'Content card container',
    category: 'Layout',
    icon: Square,
    template: componentTemplates.card
  },
  fanregistration: {
    id: 'fanregistration',
    name: 'Fan Registration',
    description: 'Complete fan registration form with validation',
    category: 'Custom',
    icon: Users,
    template: componentTemplates.fanregistration
  }
}

export function getComponentRegistryItem(
  id: string
): ComponentRegistryItem | null {
  return componentRegistry[id] || null
}

export function getAllComponentRegistryItems(): ComponentRegistryItem[] {
  return Object.values(componentRegistry)
}

export function getComponentsByCategory(
  category: string
): ComponentRegistryItem[] {
  return Object.values(componentRegistry).filter(
    (item) => item.category === category
  )
}

export function getAvailableCategories(): string[] {
  const categories = new Set(
    Object.values(componentRegistry).map((item) => item.category)
  )
  return Array.from(categories).sort()
}

export function getComponentTemplate(
  componentType: string
): ComponentTemplate | null {
  const registryItem = getComponentRegistryItem(componentType)
  return registryItem ? registryItem.template : null
}
