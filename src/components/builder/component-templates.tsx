'use client'

export interface ComponentTemplate {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  defaultContent: Record<string, any>
  defaultStyles: {
    desktop: Record<string, any>
    tablet: Record<string, any>
    mobile: Record<string, any>
  }
  properties: ComponentProperty[]
}

export interface ComponentProperty {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'color' | 'select' | 'boolean' | 'url'
  options?: string[]
  placeholder?: string
  description?: string
}

export const componentTemplates: Record<string, ComponentTemplate> = {
  navbar: {
    id: 'navbar',
    name: 'Navbar',
    description:
      'Navigation bar with logo and menu items, responsive hamburger menu',
    category: 'Layout',
    tags: ['navigation', 'header', 'menu', 'responsive'],
    defaultContent: {
      logo: 'LOGO',
      logoHref: '/',
      menuItems: [
        { text: 'Home', href: '/' },
        { text: 'About', href: '/about' },
        { text: 'Services', href: '/services' },
        { text: 'Contact', href: '/contact' }
      ],
      backgroundColor: '#ffffff',
      textColor: '#374151',
      logoColor: '#1f2937',
      sticky: false,
      shadow: true
    },
    defaultStyles: {
      desktop: {
        width: '100%',
        padding: '1rem 2rem',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        zIndex: '50'
      },
      tablet: {
        padding: '1rem 1.5rem'
      },
      mobile: {
        padding: '1rem'
      }
    },
    properties: [
      {
        key: 'logo',
        label: 'Logo Text',
        type: 'text',
        placeholder: 'Enter logo text'
      },
      { key: 'logoHref', label: 'Logo Link', type: 'url', placeholder: '/' },
      {
        key: 'menuItems',
        label: 'Menu Items',
        type: 'text',
        placeholder: 'Menu items will be managed below'
      },
      {
        key: 'backgroundColor',
        label: 'Background Color',
        type: 'color',
        placeholder: '#ffffff'
      },
      {
        key: 'textColor',
        label: 'Text Color',
        type: 'color',
        placeholder: '#374151'
      },
      {
        key: 'logoColor',
        label: 'Logo Color',
        type: 'color',
        placeholder: '#1f2937'
      },
      { key: 'sticky', label: 'Sticky Navigation', type: 'boolean' },
      { key: 'shadow', label: 'Show Shadow', type: 'boolean' }
    ]
  },
  form: {
    id: 'form',
    name: 'Form',
    description: 'Form wrapper container for form elements',
    category: 'Layout',
    tags: ['form', 'wrapper', 'container', 'interactive'],
    defaultContent: {
      title: 'Contact Form',
      action: '',
      method: 'POST',
      alignment: 'left',
      submitButtonText: 'Submit',
      showSubmitButton: true,
      enableTesting: false
    },
    defaultStyles: {
      desktop: {
        padding: '2rem',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '0.75rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        marginBottom: '1.5rem',
        maxWidth: '600px',
        minHeight: '200px'
      },
      tablet: {
        padding: '1.5rem'
      },
      mobile: {
        padding: '1rem'
      }
    },
    properties: [
      {
        key: 'title',
        label: 'Form Title',
        type: 'text',
        placeholder: 'Enter form title'
      },
      {
        key: 'action',
        label: 'Submit Endpoint URL',
        type: 'url',
        placeholder: 'https://api.example.com/submit'
      },
      {
        key: 'method',
        label: 'HTTP Method',
        type: 'select',
        options: ['POST', 'PUT', 'PATCH', 'GET']
      },
      {
        key: 'alignment',
        label: 'Form Alignment',
        type: 'select',
        options: ['left', 'center', 'right']
      },
      {
        key: 'submitButtonText',
        label: 'Submit Button Text',
        type: 'text',
        placeholder: 'Submit'
      },
      { key: 'showSubmitButton', label: 'Show Submit Button', type: 'boolean' },
      {
        key: 'enableTesting',
        label: 'Enable Endpoint Testing',
        type: 'boolean'
      }
    ]
  },
  input: {
    id: 'input',
    name: 'Input',
    description: 'Text input field',
    category: 'Interactive',
    tags: ['form', 'input', 'field', 'text'],
    defaultContent: {
      label: 'Input Label',
      placeholder: 'Enter text here',
      type: 'text',
      name: 'input_field',
      required: false,
      value: ''
    },
    defaultStyles: {
      desktop: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #d1d5db',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        marginBottom: '1rem',
        backgroundColor: '#ffffff'
      },
      tablet: {},
      mobile: {}
    },
    properties: [
      {
        key: 'label',
        label: 'Field Label',
        type: 'text',
        placeholder: 'Enter field label'
      },
      {
        key: 'placeholder',
        label: 'Placeholder Text',
        type: 'text',
        placeholder: 'Enter placeholder'
      },
      {
        key: 'type',
        label: 'Input Type',
        type: 'select',
        options: ['text', 'email', 'password', 'number', 'tel', 'url']
      },
      {
        key: 'name',
        label: 'Field Name',
        type: 'text',
        placeholder: 'field_name'
      },
      { key: 'required', label: 'Required Field', type: 'boolean' },
      {
        key: 'value',
        label: 'Default Value',
        type: 'text',
        placeholder: 'Default value (optional)'
      }
    ]
  },
  textarea: {
    id: 'textarea',
    name: 'TextArea',
    description: 'Multi-line text input field',
    category: 'Interactive',
    tags: ['form', 'textarea', 'field', 'multiline'],
    defaultContent: {
      label: 'Message',
      placeholder: 'Enter your message here',
      name: 'message',
      required: false,
      rows: '4',
      value: ''
    },
    defaultStyles: {
      desktop: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #d1d5db',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        marginBottom: '1rem',
        backgroundColor: '#ffffff',
        minHeight: '100px',
        resize: 'vertical'
      },
      tablet: {},
      mobile: {}
    },
    properties: [
      {
        key: 'label',
        label: 'Field Label',
        type: 'text',
        placeholder: 'Enter field label'
      },
      {
        key: 'placeholder',
        label: 'Placeholder Text',
        type: 'textarea',
        placeholder: 'Enter placeholder'
      },
      {
        key: 'name',
        label: 'Field Name',
        type: 'text',
        placeholder: 'field_name'
      },
      { key: 'required', label: 'Required Field', type: 'boolean' },
      {
        key: 'rows',
        label: 'Number of Rows',
        type: 'select',
        options: ['2', '3', '4', '5', '6', '8', '10']
      },
      {
        key: 'value',
        label: 'Default Value',
        type: 'textarea',
        placeholder: 'Default value (optional)'
      }
    ]
  },
  checkbox: {
    id: 'checkbox',
    name: 'Checkbox',
    description: 'Checkbox input field with label',
    category: 'Interactive',
    tags: ['form', 'checkbox', 'field', 'boolean'],
    defaultContent: {
      label: 'Checkbox Label',
      name: 'checkbox_field',
      value: 'checkbox_value',
      checked: false,
      required: false
    },
    defaultStyles: {
      desktop: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem',
        fontSize: '1rem',
        cursor: 'pointer'
      },
      tablet: {},
      mobile: {}
    },
    properties: [
      {
        key: 'label',
        label: 'Checkbox Label',
        type: 'text',
        placeholder: 'Enter checkbox label'
      },
      {
        key: 'name',
        label: 'Field Name',
        type: 'text',
        placeholder: 'field_name'
      },
      {
        key: 'value',
        label: 'Checkbox Value',
        type: 'text',
        placeholder: 'checkbox_value'
      },
      { key: 'checked', label: 'Default Checked', type: 'boolean' },
      { key: 'required', label: 'Required Field', type: 'boolean' }
    ]
  },
  link: {
    id: 'link',
    name: 'Link',
    description: 'Clickable text link',
    category: 'Interactive',
    tags: ['text', 'link', 'anchor', 'navigation'],
    defaultContent: {
      text: 'Click here',
      href: 'https://example.com',
      target: '_self',
      underline: true,
      alignment: 'left'
    },
    defaultStyles: {
      desktop: {
        color: '#3b82f6',
        textDecoration: 'underline',
        fontSize: '1rem',
        cursor: 'pointer',
        display: 'inline',
        marginBottom: '0.5rem'
      },
      tablet: {},
      mobile: {}
    },
    properties: [
      {
        key: 'text',
        label: 'Link Text',
        type: 'text',
        placeholder: 'Enter link text'
      },
      {
        key: 'href',
        label: 'Link URL',
        type: 'url',
        placeholder: 'https://example.com'
      },
      {
        key: 'target',
        label: 'Open In',
        type: 'select',
        options: ['_self', '_blank']
      },
      { key: 'underline', label: 'Show Underline', type: 'boolean' },
      {
        key: 'alignment',
        label: 'Text Alignment',
        type: 'select',
        options: ['left', 'center', 'right']
      }
    ]
  },
  divider: {
    id: 'divider',
    name: 'Divider',
    description: 'Horizontal line separator',
    category: 'Content',
    tags: ['separator', 'line', 'divider', 'hr'],
    defaultContent: {
      style: 'solid',
      color: '#000000',
      thickness: '2px',
      width: '100%',
      margin: 'medium'
    },
    defaultStyles: {
      desktop: {
        width: '100%',
        height: '2px',
        backgroundColor: '#000000',
        border: 'none',
        margin: '1.5rem 0'
      },
      tablet: {
        margin: '1.25rem 0'
      },
      mobile: {
        margin: '1rem 0'
      }
    },
    properties: [
      {
        key: 'style',
        label: 'Line Style',
        type: 'select',
        options: ['solid', 'dashed', 'dotted']
      },
      {
        key: 'color',
        label: 'Line Color',
        type: 'color',
        placeholder: '#000000'
      },
      {
        key: 'thickness',
        label: 'Line Thickness',
        type: 'select',
        options: ['1px', '2px', '3px', '4px', '5px']
      },
      {
        key: 'width',
        label: 'Line Width',
        type: 'select',
        options: ['25%', '50%', '75%', '100%']
      },
      {
        key: 'margin',
        label: 'Spacing',
        type: 'select',
        options: ['none', 'small', 'medium', 'large', 'xl']
      }
    ]
  },
  video: {
    id: 'video',
    name: 'Video',
    description: 'Embed YouTube videos or MP4 files',
    category: 'Content',
    tags: ['media', 'video', 'youtube', 'mp4', 'embed'],
    defaultContent: {
      src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      type: 'youtube',
      title: 'Video Player',
      controls: true,
      autoplay: false,
      loop: false,
      muted: false,
      width: '100%',
      height: '315px',
      alignment: 'center'
    },
    defaultStyles: {
      desktop: {
        width: '100%',
        maxWidth: '800px',
        height: '450px',
        borderRadius: '0.5rem',
        marginBottom: '1rem',
        overflow: 'hidden'
      },
      tablet: {
        height: '315px'
      },
      mobile: {
        height: '200px'
      }
    },
    properties: [
      {
        key: 'src',
        label: 'Video URL',
        type: 'url',
        placeholder: 'YouTube URL or MP4 file URL'
      },
      {
        key: 'type',
        label: 'Video Type',
        type: 'select',
        options: ['youtube', 'mp4']
      },
      {
        key: 'title',
        label: 'Video Title',
        type: 'text',
        placeholder: 'Video title for accessibility'
      },
      { key: 'controls', label: 'Show Controls', type: 'boolean' },
      { key: 'autoplay', label: 'Autoplay', type: 'boolean' },
      { key: 'loop', label: 'Loop Video', type: 'boolean' },
      { key: 'muted', label: 'Muted', type: 'boolean' },
      {
        key: 'alignment',
        label: 'Alignment',
        type: 'select',
        options: ['left', 'center', 'right']
      },
      {
        key: 'width',
        label: 'Video Width',
        type: 'select',
        options: ['100%', '75%', '50%', '25%']
      }
    ]
  },
  quote: {
    id: 'quote',
    name: 'Quote',
    description: 'Blockquote with optional author attribution',
    category: 'Content',
    tags: ['text', 'quote', 'testimonial', 'blockquote'],
    defaultContent: {
      text: 'This is an inspiring quote that adds credibility and engagement to your content.',
      author: 'Author Name',
      position: 'Position or Company',
      alignment: 'left',
      style: 'default'
    },
    defaultStyles: {
      desktop: {
        fontSize: '1.25rem',
        lineHeight: '1.6',
        fontStyle: 'italic',
        padding: '1.5rem',
        borderLeft: '4px solid #3b82f6',
        backgroundColor: '#f8fafc',
        borderRadius: '0.5rem',
        marginBottom: '1.5rem',
        color: '#374151'
      },
      tablet: {
        padding: '1.25rem',
        fontSize: '1.125rem'
      },
      mobile: {
        padding: '1rem',
        fontSize: '1rem'
      }
    },
    properties: [
      {
        key: 'text',
        label: 'Quote Text',
        type: 'textarea',
        placeholder: 'Enter the quote text'
      },
      {
        key: 'author',
        label: 'Author Name',
        type: 'text',
        placeholder: 'Quote author (optional)'
      },
      {
        key: 'position',
        label: 'Author Position',
        type: 'text',
        placeholder: 'Position or company (optional)'
      },
      {
        key: 'alignment',
        label: 'Text Alignment',
        type: 'select',
        options: ['left', 'center', 'right']
      },
      {
        key: 'style',
        label: 'Quote Style',
        type: 'select',
        options: ['default', 'minimal', 'bordered', 'highlighted']
      }
    ]
  },
  list: {
    id: 'list',
    name: 'List',
    description: 'Ordered or unordered list with customizable items',
    category: 'Content',
    tags: ['text', 'content', 'items', 'bullets'],
    defaultContent: {
      type: 'unordered',
      items: ['First list item', 'Second list item', 'Third list item'],
      alignment: 'left'
    },
    defaultStyles: {
      desktop: {
        fontSize: '1rem',
        lineHeight: '1.6',
        marginBottom: '1rem',
        paddingLeft: '1.5rem',
        color: 'inherit'
      },
      tablet: {},
      mobile: {}
    },
    properties: [
      {
        key: 'type',
        label: 'List Type',
        type: 'select',
        options: ['ordered', 'unordered']
      },
      {
        key: 'items',
        label: 'List Items',
        type: 'textarea',
        placeholder: 'Enter each item on a new line'
      },
      {
        key: 'alignment',
        label: 'Text Alignment',
        type: 'select',
        options: ['left', 'center', 'right']
      }
    ]
  },
  sidebar: {
    id: 'sidebar',
    name: 'Sidebar',
    description: 'Side navigation or content panel',
    category: 'Layout',
    tags: ['navigation', 'layout', 'side', 'panel'],
    defaultContent: {
      title: 'Sidebar',
      position: 'left',
      width: '300px',
      backgroundColor: '#f8fafc',
      padding: 'medium'
    },
    defaultStyles: {
      desktop: {
        width: '300px',
        minHeight: '400px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        position: 'relative',
        marginBottom: '1rem'
      },
      tablet: {
        width: '250px',
        padding: '1rem'
      },
      mobile: {
        width: '100%',
        minHeight: '200px',
        padding: '1rem'
      }
    },
    properties: [
      {
        key: 'title',
        label: 'Sidebar Title',
        type: 'text',
        placeholder: 'Optional sidebar title'
      },
      {
        key: 'position',
        label: 'Position',
        type: 'select',
        options: ['left', 'right']
      },
      {
        key: 'width',
        label: 'Width',
        type: 'select',
        options: ['200px', '250px', '300px', '350px', '400px']
      },
      {
        key: 'backgroundColor',
        label: 'Background Color',
        type: 'color',
        placeholder: '#f8fafc'
      },
      {
        key: 'padding',
        label: 'Padding',
        type: 'select',
        options: ['none', 'small', 'medium', 'large']
      }
    ]
  },
  section: {
    id: 'section',
    name: 'Section',
    description: 'Semantic section container for content organization',
    category: 'Layout',
    tags: ['semantic', 'layout', 'section', 'container'],
    defaultContent: {
      title: '',
      backgroundColor: 'transparent',
      padding: 'medium',
      alignment: 'left'
    },
    defaultStyles: {
      desktop: {
        width: '100%',
        padding: '2rem',
        backgroundColor: 'transparent',
        minHeight: '150px',
        border: '2px dashed #e5e7eb',
        borderRadius: '0.5rem',
        marginBottom: '1rem'
      },
      tablet: {
        padding: '1.5rem'
      },
      mobile: {
        padding: '1rem'
      }
    },
    properties: [
      {
        key: 'title',
        label: 'Section Title',
        type: 'text',
        placeholder: 'Optional section title'
      },
      {
        key: 'backgroundColor',
        label: 'Background Color',
        type: 'color',
        placeholder: '#ffffff'
      },
      {
        key: 'padding',
        label: 'Padding',
        type: 'select',
        options: ['none', 'small', 'medium', 'large', 'xl']
      },
      {
        key: 'alignment',
        label: 'Content Alignment',
        type: 'select',
        options: ['left', 'center', 'right']
      }
    ]
  },
  grid: {
    id: 'grid',
    name: 'Grid',
    description: 'CSS Grid layout container',
    category: 'Layout',
    tags: ['layout', 'grid', 'columns'],
    defaultContent: {
      columns: '2',
      gap: 'medium',
      alignment: 'stretch'
    },
    defaultStyles: {
      desktop: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1rem',
        width: '100%',
        minHeight: '200px',
        border: '2px dashed #e5e7eb',
        borderRadius: '0.5rem',
        padding: '1rem'
      },
      tablet: {
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '0.75rem'
      },
      mobile: {
        gridTemplateColumns: '1fr',
        gap: '0.5rem'
      }
    },
    properties: [
      {
        key: 'columns',
        label: 'Columns',
        type: 'select',
        options: ['1', '2', '3', '4', '5', '6']
      },
      {
        key: 'gap',
        label: 'Gap',
        type: 'select',
        options: ['none', 'small', 'medium', 'large']
      },
      {
        key: 'alignment',
        label: 'Item Alignment',
        type: 'select',
        options: ['start', 'center', 'end', 'stretch']
      }
    ]
  },
  container: {
    id: 'container',
    name: 'Container',
    description: 'Layout container for grouping elements',
    category: 'Layout',
    tags: ['wrapper', 'layout', 'group'],
    defaultContent: {
      maxWidth: '1200px',
      alignment: 'center',
      padding: 'medium',
      backgroundColor: 'transparent'
    },
    defaultStyles: {
      desktop: {
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '1rem',
        backgroundColor: 'transparent',
        minHeight: '100px',
        border: '2px dashed #e5e7eb',
        borderRadius: '0.5rem'
      },
      tablet: {
        padding: '0.75rem'
      },
      mobile: {
        padding: '0.5rem'
      }
    },
    properties: [
      {
        key: 'maxWidth',
        label: 'Max Width',
        type: 'select',
        options: ['none', 'sm', 'md', 'lg', 'xl', '2xl', 'full']
      },
      {
        key: 'alignment',
        label: 'Alignment',
        type: 'select',
        options: ['left', 'center', 'right']
      },
      {
        key: 'padding',
        label: 'Padding',
        type: 'select',
        options: ['none', 'small', 'medium', 'large']
      },
      {
        key: 'backgroundColor',
        label: 'Background Color',
        type: 'color',
        placeholder: '#ffffff'
      }
    ]
  },
  heading: {
    id: 'heading',
    name: 'Heading',
    description: 'Text heading (H1-H6)',
    category: 'Content',
    tags: ['text', 'title'],
    defaultContent: {
      text: 'Your Heading Here',
      level: 'h2',
      alignment: 'left'
    },
    defaultStyles: {
      desktop: {
        fontSize: '2rem',
        fontWeight: '700',
        marginBottom: '1rem',
        color: 'inherit'
      },
      tablet: {},
      mobile: {
        fontSize: '1.5rem'
      }
    },
    properties: [
      {
        key: 'text',
        label: 'Heading Text',
        type: 'text',
        placeholder: 'Enter heading text'
      },
      {
        key: 'level',
        label: 'Heading Level',
        type: 'select',
        options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
      },
      {
        key: 'alignment',
        label: 'Text Alignment',
        type: 'select',
        options: ['left', 'center', 'right']
      }
    ]
  },
  paragraph: {
    id: 'paragraph',
    name: 'Paragraph',
    description: 'Body text paragraph',
    category: 'Content',
    tags: ['text', 'content'],
    defaultContent: {
      text: 'Your paragraph text goes here. Click to edit this content and make it your own.',
      alignment: 'left'
    },
    defaultStyles: {
      desktop: {
        fontSize: '1rem',
        lineHeight: '1.6',
        marginBottom: '1rem',
        color: 'inherit'
      },
      tablet: {},
      mobile: {}
    },
    properties: [
      {
        key: 'text',
        label: 'Paragraph Text',
        type: 'textarea',
        placeholder: 'Enter paragraph text'
      },
      {
        key: 'alignment',
        label: 'Text Alignment',
        type: 'select',
        options: ['left', 'center', 'right', 'justify']
      }
    ]
  },
  button: {
    id: 'button',
    name: 'Button',
    description: 'Clickable button',
    category: 'Interactive',
    tags: ['action', 'cta'],
    defaultContent: {
      text: 'Click Me',
      href: '#',
      variant: 'primary',
      size: 'medium'
    },
    defaultStyles: {
      desktop: {
        padding: '0.75rem 1.5rem',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        fontWeight: '500',
        cursor: 'pointer',
        border: 'none',
        display: 'inline-block'
      },
      tablet: {},
      mobile: {}
    },
    properties: [
      {
        key: 'text',
        label: 'Button Text',
        type: 'text',
        placeholder: 'Enter button text'
      },
      {
        key: 'href',
        label: 'Link URL',
        type: 'url',
        placeholder: 'https://example.com'
      },
      {
        key: 'variant',
        label: 'Button Style',
        type: 'select',
        options: ['primary', 'secondary', 'outline', 'ghost']
      },
      {
        key: 'size',
        label: 'Button Size',
        type: 'select',
        options: ['small', 'medium', 'large']
      }
    ]
  },
  image: {
    id: 'image',
    name: 'Image',
    description: 'Responsive image',
    category: 'Content',
    tags: ['media', 'photo'],
    defaultContent: {
      src: '/placeholder-image.png',
      alt: 'Image description',
      caption: '',
      alignment: 'left',
      width: 'auto',
      height: 'auto'
    },
    defaultStyles: {
      desktop: {
        width: '100%',
        height: 'auto',
        borderRadius: '0.5rem',
        marginBottom: '1rem'
      },
      tablet: {},
      mobile: {}
    },
    properties: [
      {
        key: 'src',
        label: 'Image URL',
        type: 'url',
        placeholder: 'https://example.com/image.jpg'
      },
      {
        key: 'alt',
        label: 'Alt Text',
        type: 'text',
        placeholder: 'Describe the image'
      },
      {
        key: 'caption',
        label: 'Caption',
        type: 'text',
        placeholder: 'Optional image caption'
      },
      {
        key: 'alignment',
        label: 'Alignment',
        type: 'select',
        options: ['left', 'center', 'right']
      },
      {
        key: 'width',
        label: 'Width',
        type: 'select',
        options: [
          'auto',
          '25%',
          '50%',
          '75%',
          '100%',
          '200px',
          '300px',
          '400px',
          '500px',
          '600px'
        ]
      },
      {
        key: 'height',
        label: 'Height',
        type: 'select',
        options: [
          'auto',
          '100px',
          '150px',
          '200px',
          '250px',
          '300px',
          '400px',
          '500px'
        ]
      }
    ]
  },
  hero: {
    id: 'hero',
    name: 'Hero Section',
    description: 'Large banner section',
    category: 'Layout',
    tags: ['banner', 'header'],
    defaultContent: {
      title: 'Welcome to Our Website',
      subtitle: 'Create amazing experiences with our powerful tools',
      buttonText: 'Get Started',
      buttonHref: '#',
      backgroundImage: '/abstract-hero-background.png',
      alignment: 'center'
    },
    defaultStyles: {
      desktop: {
        padding: '4rem 2rem',
        textAlign: 'center',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      tablet: {
        padding: '3rem 1.5rem',
        minHeight: '400px'
      },
      mobile: {
        padding: '2rem 1rem',
        minHeight: '300px'
      }
    },
    properties: [
      {
        key: 'title',
        label: 'Hero Title',
        type: 'text',
        placeholder: 'Enter hero title'
      },
      {
        key: 'subtitle',
        label: 'Hero Subtitle',
        type: 'textarea',
        placeholder: 'Enter hero subtitle'
      },
      {
        key: 'buttonText',
        label: 'Button Text',
        type: 'text',
        placeholder: 'Enter button text'
      },
      {
        key: 'buttonHref',
        label: 'Button Link',
        type: 'url',
        placeholder: 'https://example.com'
      },
      {
        key: 'backgroundImage',
        label: 'Background Image',
        type: 'url',
        placeholder: 'https://example.com/bg.jpg'
      },
      {
        key: 'alignment',
        label: 'Content Alignment',
        type: 'select',
        options: ['left', 'center', 'right']
      }
    ]
  },
  card: {
    id: 'card',
    name: 'Card',
    description: 'Content card container',
    category: 'Layout',
    tags: ['box', 'content'],
    defaultContent: {
      title: 'Card Title',
      content:
        'This is the card content. You can add any text or other elements here.',
      image: '/generic-card-design.png',
      buttonText: 'Learn More',
      buttonHref: '#'
    },
    defaultStyles: {
      desktop: {
        padding: '1.5rem',
        borderRadius: '0.75rem',
        border: '1px solid #e5e7eb',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        marginBottom: '1rem'
      },
      tablet: {},
      mobile: {
        padding: '1rem'
      }
    },
    properties: [
      {
        key: 'title',
        label: 'Card Title',
        type: 'text',
        placeholder: 'Enter card title'
      },
      {
        key: 'content',
        label: 'Card Content',
        type: 'textarea',
        placeholder: 'Enter card content'
      },
      {
        key: 'image',
        label: 'Card Image',
        type: 'url',
        placeholder: 'https://example.com/image.jpg'
      },
      {
        key: 'buttonText',
        label: 'Button Text',
        type: 'text',
        placeholder: 'Enter button text'
      },
      {
        key: 'buttonHref',
        label: 'Button Link',
        type: 'url',
        placeholder: 'https://example.com'
      }
    ]
  },
  select: {
    id: 'select',
    name: 'Select',
    description: 'Dropdown select field with customizable options',
    category: 'Interactive',
    tags: ['form', 'select', 'dropdown', 'field'],
    defaultContent: {
      label: 'Select Option',
      name: 'select_field',
      required: false,
      options: [
        { text: 'Option 1', value: 'option1' },
        { text: 'Option 2', value: 'option2' },
        { text: 'Option 3', value: 'option3' }
      ],
      placeholder: 'Choose an option',
      value: ''
    },
    defaultStyles: {
      desktop: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #d1d5db',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        marginBottom: '1rem',
        backgroundColor: '#ffffff',
        cursor: 'pointer'
      },
      tablet: {},
      mobile: {}
    },
    properties: [
      {
        key: 'label',
        label: 'Field Label',
        type: 'text',
        placeholder: 'Enter field label'
      },
      {
        key: 'name',
        label: 'Field Name',
        type: 'text',
        placeholder: 'field_name'
      },
      { key: 'required', label: 'Required Field', type: 'boolean' },
      {
        key: 'options',
        label: 'Select Options',
        type: 'text',
        placeholder: 'Options will be managed below'
      },
      {
        key: 'placeholder',
        label: 'Placeholder Text',
        type: 'text',
        placeholder: 'Choose an option'
      },
      {
        key: 'value',
        label: 'Default Value',
        type: 'text',
        placeholder: 'Default selected option (optional)'
      }
    ]
  },
  radiogroup: {
    id: 'radiogroup',
    name: 'Radio Group',
    description: 'Radio button group for single selection',
    category: 'Interactive',
    tags: ['form', 'radio', 'group', 'field', 'selection'],
    defaultContent: {
      label: 'Radio Group Label',
      name: 'radio_field',
      required: false,
      options: [
        { text: 'Option 1', value: 'option1' },
        { text: 'Option 2', value: 'option2' },
        { text: 'Option 3', value: 'option3' }
      ],
      value: '',
      layout: 'vertical'
    },
    defaultStyles: {
      desktop: {
        marginBottom: '1rem',
        fontSize: '1rem'
      },
      tablet: {},
      mobile: {}
    },
    properties: [
      {
        key: 'label',
        label: 'Group Label',
        type: 'text',
        placeholder: 'Enter group label'
      },
      {
        key: 'name',
        label: 'Field Name',
        type: 'text',
        placeholder: 'field_name'
      },
      { key: 'required', label: 'Required Field', type: 'boolean' },
      {
        key: 'options',
        label: 'Radio Options',
        type: 'text',
        placeholder: 'Options will be managed below'
      },
      {
        key: 'value',
        label: 'Default Value',
        type: 'text',
        placeholder: 'Default selected option (optional)'
      },
      {
        key: 'layout',
        label: 'Layout',
        type: 'select',
        options: ['vertical', 'horizontal']
      }
    ]
  },
  fanregistration: {
    id: 'fanregistration',
    name: 'Fan Registration',
    description: 'Complete fan registration form with validation',
    category: 'Custom',
    tags: ['form', 'registration', 'fan', 'custom', 'validation'],
    defaultContent: {
      title: 'Fan Registration',
      submitEndpoint: 'https://api.example.com/fan-registration',
      submitButtonText: 'Register Now',
      successMessage: 'Thank you for registering!',
      backgroundColor: '#ffffff',
      borderColor: '#e5e7eb',
      countries: [
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
    },
    defaultStyles: {
      desktop: {
        maxWidth: '600px',
        padding: '2rem',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '0.75rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem'
      },
      tablet: {
        padding: '1.5rem',
        maxWidth: '500px'
      },
      mobile: {
        padding: '1rem',
        maxWidth: '100%'
      }
    },
    properties: [
      {
        key: 'title',
        label: 'Form Title',
        type: 'text',
        placeholder: 'Enter form title'
      },
      {
        key: 'submitEndpoint',
        label: 'Submit Endpoint URL',
        type: 'url',
        placeholder: 'https://api.example.com/submit'
      },
      {
        key: 'submitButtonText',
        label: 'Submit Button Text',
        type: 'text',
        placeholder: 'Register Now'
      },
      {
        key: 'successMessage',
        label: 'Success Message',
        type: 'text',
        placeholder: 'Thank you for registering!'
      },
      {
        key: 'backgroundColor',
        label: 'Background Color',
        type: 'color',
        placeholder: '#ffffff'
      },
      {
        key: 'borderColor',
        label: 'Border Color',
        type: 'color',
        placeholder: '#e5e7eb'
      }
    ]
  }
}

export function getComponentTemplate(id: string): ComponentTemplate | null {
  return componentTemplates[id] || null
}

export function getAllComponentTemplates(): ComponentTemplate[] {
  return Object.values(componentTemplates)
}
