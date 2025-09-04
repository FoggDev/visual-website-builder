"use client";

import type { BuilderComponent } from "./builder-context";
import { getInheritedStyles } from "./responsive-utils";
import JSZip from "jszip";

export interface ExportOptions {
  format: "html" | "react" | "json" | "nextjs";
  includeStyles: boolean;
  minify: boolean;
  responsive: boolean;
}

function toCamelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9\s]/g, "") // Remove special characters
    .split(/\s+/) // Split by whitespace
    .map((word, index) => {
      if (index === 0) {
        // First word: capitalize first letter
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      // Subsequent words: capitalize first letter
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join("");
}

function generatePackageJSONWithShadcn(): string {
  return JSON.stringify(
    {
      name: "exported-website",
      version: "0.1.0",
      private: true,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
        lint: "next lint",
      },
      dependencies: {
        react: "^18",
        "react-dom": "^18",
        next: "14.0.0",
        "@radix-ui/react-checkbox": "^1.0.4",
        "@radix-ui/react-label": "^2.0.2",
        "@radix-ui/react-select": "^2.0.0",
        "@radix-ui/react-radio-group": "^1.1.3",
        "@radix-ui/react-slot": "^1.0.2",
        "class-variance-authority": "^0.7.0",
        clsx: "^2.0.0",
        "lucide-react": "^0.294.0",
        "tailwind-merge": "^2.0.0",
        "tailwindcss-animate": "^1.0.7",
      },
      devDependencies: {
        typescript: "^5",
        "@types/node": "^20",
        "@types/react": "^18",
        "@types/react-dom": "^18",
        tailwindcss: "^3.3.0",
        autoprefixer: "^10.0.1",
        postcss: "^8",
        eslint: "^8",
        "eslint-config-next": "14.0.0",
      },
    },
    null,
    2
  );
}

function generateNextConfig(): string {
  return `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': __dirname,
    }
    return config
  },
}

module.exports = nextConfig`;
}

function generateTailwindConfig(): string {
  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;
}

function generatePostCSSConfig(): string {
  return `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
}

function generateGlobalCSS(): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom styles */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.button {
  @apply inline-block px-6 py-3 bg-gray-800 text-white no-underline rounded-lg font-medium transition-colors hover:bg-gray-700;
}

.hero {
  @apply py-16 px-8 text-center bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl mb-8;
}

.card {
  @apply bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-6;
}`;
}

function generateLayout(): string {
  return `import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Exported Website',
  description: 'Website exported from MIRA Visual Builder',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}`;
}

function generateComponentsJSON(): string {
  return JSON.stringify(
    {
      $schema: "https://ui.shadcn.com/schema.json",
      style: "default",
      rsc: true,
      tsx: true,
      tailwind: {
        config: "tailwind.config.js",
        css: "app/globals.css",
        baseColor: "slate",
        cssVariables: true,
        prefix: "",
      },
      aliases: {
        components: "@/components",
        utils: "@/lib/utils",
      },
    },
    null,
    2
  );
}

function generateUtilsFile(): string {
  return `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertStylesToTailwind(styles: Record<string, any>): string {
  const classes: string[] = []
  
  // Convert common CSS properties to Tailwind classes
  if (styles.display === 'flex') classes.push('flex')
  if (styles.alignItems === 'center') classes.push('items-center')
  if (styles.justifyContent === 'center') classes.push('justify-center')
  if (styles.justifyContent === 'space-between') classes.push('justify-between')
  if (styles.gap === '0.5rem') classes.push('gap-2')
  if (styles.gap === '1rem') classes.push('gap-4')
  if (styles.marginBottom === '1rem') classes.push('mb-4')
  if (styles.marginBottom === '1.5rem') classes.push('mb-6')
  if (styles.padding === '1rem') classes.push('p-4')
  if (styles.padding === '2rem') classes.push('p-8')
  if (styles.fontSize === '1rem') classes.push('text-base')
  if (styles.fontSize === '1.25rem') classes.push('text-xl')
  if (styles.cursor === 'pointer') classes.push('cursor-pointer')
  if (styles.backgroundColor === '#ffffff') classes.push('bg-white')
  if (styles.border === '1px solid #e5e7eb') classes.push('border')
  if (styles.borderRadius === '0.75rem') classes.push('rounded-xl')
  if (styles.boxShadow) classes.push('shadow-sm')
  if (styles.maxWidth === '600px') classes.push('max-w-2xl')
  if (styles.minHeight === '200px') classes.push('min-h-[200px]')
  if (styles.width === '100%') classes.push('w-full')
  
  return classes.join(' ')
}`;
}

function generateTSConfig(): string {
  return `{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`;
}

function generateShadcnComponents(): { name: string; content: string }[] {
  return [
    {
      name: "components/ui/button.tsx",
      content: `import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }`,
    },
    {
      name: "components/ui/input.tsx",
      content: `import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }`,
    },
    {
      name: "components/ui/textarea.tsx",
      content: `import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }`,
    },
    {
      name: "components/ui/checkbox.tsx",
      content: `import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from 'lucide-react'
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }`,
    },
    {
      name: "components/ui/label.tsx",
      content: `import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }`,
    },
  ];
}

function generateComponentFiles(): { name: string; content: string }[] {
  return [
    {
      name: "components/site/navbar-component.tsx",
      content: `import { Button } from "@/components/ui/button"
import { Menu } from 'lucide-react'
import { cn, convertStylesToTailwind } from "@/lib/utils"

interface NavbarComponentProps {
  component: any
  className?: string
}

export function NavbarComponent({ component, className }: NavbarComponentProps) {
  const { content, styles } = component
  const tailwindClasses = convertStylesToTailwind(styles?.desktop || {})
  
  return (
    <nav className={cn("flex items-center justify-between py-4", tailwindClasses, className)}>
      <div className="text-xl font-bold">
        {content.logo || "Logo"}
      </div>
      
      {/* Desktop Menu */}
      <div className="hidden md:flex space-x-6">
        {(content.menuItems || []).map((item: any, index: number) => (
          <a
            key={index}
            href={item.href || "#"}
            className="hover:text-gray-600 transition-colors"
          >
            {item.text || "Link"}
          </a>
        ))}
      </div>
      
      {/* Mobile Menu Button */}
      <Button variant="ghost" size="icon" className="md:hidden">
        <Menu className="h-6 w-6" />
      </Button>
    </nav>
  )
}`,
    },
    {
      name: "components/site/form-component.tsx",
      content: `import { cn, convertStylesToTailwind } from "@/lib/utils"

interface FormComponentProps {
  component: any
  children: React.ReactNode
  className?: string
}

export function FormComponent({ component, children, className }: FormComponentProps) {
  const { content, styles } = component
  const tailwindClasses = convertStylesToTailwind(styles?.desktop || {})
  
  return (
    <form 
      className={cn("space-y-4 p-6 bg-white rounded-lg border", tailwindClasses, className)}
      action={content.action || ""}
      method={content.method || "POST"}
    >
      {content.title && (
        <h2 className="text-xl font-semibold mb-4">{content.title}</h2>
      )}
      
      {children}
      
      {content.showSubmitButton && (
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          {content.submitButtonText || "Submit"}
        </button>
      )}
    </form>
  )
}`,
    },
    {
      name: "components/site/image-component.tsx",
      content: `import { cn, convertStylesToTailwind } from "@/lib/utils";

interface ImageComponentProps {
  content: {
    src: string;
    alt: string;
    caption?: string;
    alignment?: string;
    width?: string;
    height?: string;
  };
  styles?: {
    desktop?: {
      width?: string;
      height?: string;
      borderRadius?: string;
      marginBottom?: string;
    };
    tablet?: Record<string, string>;
    mobile?: Record<string, string>;
  };
}

export const ImageComponent = ({
  component,
}: {
  component: ImageComponentProps;
}) => {
  const { content, styles } = component;
  const tailwindClasses = convertStylesToTailwind(styles?.desktop || {});

  return (
    <div
      className={cn(
        "flex items-center justify-center space-x-2",
        tailwindClasses
      )}
    >
      <img
        src={content.src}
        alt={content.alt}
        style={{
          width: styles?.desktop?.width || "100%",
          height: styles?.desktop?.height || "auto",
          borderRadius: styles?.desktop?.borderRadius || "0",
          marginBottom: styles?.desktop?.marginBottom || "0",
        }}
      />
      {content.caption && (
        <p className="text-sm text-gray-600 mt-2">{content.caption}</p>
      )}
    </div>
  );
};

`,
    },
    {
      name: "components/site/input-component.tsx",
      content: `import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn, convertStylesToTailwind } from "@/lib/utils"

interface InputComponentProps {
  component: any
  className?: string
}

export function InputComponent({ component, className }: InputComponentProps) {
  const { content, styles } = component
  const tailwindClasses = convertStylesToTailwind(styles?.desktop || {})
  
  return (
    <div className={cn("space-y-2", tailwindClasses, className)}>
      {content.label && (
        <Label htmlFor={content.name}>
          {content.label}
          {content.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Input
        id={content.name}
        name={content.name}
        type={content.type || "text"}
        placeholder={content.placeholder || ""}
        required={content.required || false}
      />
    </div>
  )
}`,
    },
    {
      name: "components/site/textarea-component.tsx",
      content: `import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn, convertStylesToTailwind } from "@/lib/utils"

interface TextareaComponentProps {
  component: any
  className?: string
}

export function TextareaComponent({ component, className }: TextareaComponentProps) {
  const { content, styles } = component
  const tailwindClasses = convertStylesToTailwind(styles?.desktop || {})
  
  return (
    <div className={cn("space-y-2", tailwindClasses, className)}>
      {content.label && (
        <Label htmlFor={content.name}>
          {content.label}
          {content.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Textarea
        id={content.name}
        name={content.name}
        placeholder={content.placeholder || ""}
        rows={content.rows || 4}
        required={content.required || false}
      />
    </div>
  )
}`,
    },
    {
      name: "components/site/checkbox-component.tsx",
      content: `import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn, convertStylesToTailwind } from "@/lib/utils"

interface CheckboxComponentProps {
  component: any
  className?: string
}

export function CheckboxComponent({ component, className }: CheckboxComponentProps) {
  const { content, styles } = component
  const tailwindClasses = convertStylesToTailwind(styles?.desktop || {})
  
  return (
    <div className={cn("flex items-center space-x-2", tailwindClasses, className)}>
      <Checkbox
        id={content.name}
        name={content.name}
        value={content.value || ""}
        defaultChecked={content.checked || false}
        required={content.required || false}
      />
      {content.label && (
        <Label htmlFor={content.name} className="cursor-pointer">
          {content.label}
          {content.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
    </div>
  )
}`,
    },
  ];
}

function generateRenderSiteComponent(): string {
  return `import { NavbarComponent } from "./site/navbar-component"
import { FormComponent } from "./site/form-component"
import { ImageComponent } from "./site/image-component"
import { InputComponent } from "./site/input-component"
import { TextareaComponent } from "./site/textarea-component"
import { CheckboxComponent } from "./site/checkbox-component"
import { Button } from "./ui/button"
import { cn, convertStylesToTailwind } from "@/lib/utils"

interface RenderSiteProps {
  data: {
    version: string
    components: any[]
    exportedAt: string
    canvasBackground?: {
      type: "color" | "image"
      color: string
      image?: string
      imageSize: "cover" | "contain" | "repeat"
      imagePosition: "center" | "top" | "bottom" | "left" | "right"
    }
  }
}

export function RenderSite({ data }: RenderSiteProps) {
  const renderComponent = (component: any): React.ReactNode => {
    const { type, content, styles, children } = component
    const tailwindClasses = convertStylesToTailwind(styles?.desktop || {})
    
    switch (type) {
      case "navbar":
        return <NavbarComponent key={component.id} component={component} />
        
      case "form":
        return (
          <FormComponent key={component.id} component={component}>
            {children?.map(renderComponent)}
          </FormComponent>
        )
        
      case "image":
        return <ImageComponent key={component.id} component={component} />
        
      case "input":
        return <InputComponent key={component.id} component={component} />
        
      case "textarea":
        return <TextareaComponent key={component.id} component={component} />
        
      case "checkbox":
        return <CheckboxComponent key={component.id} component={component} />
        
      case "heading":
        const HeadingTag = content.level || "h2"
        return (
          <HeadingTag key={component.id} className={cn("font-bold mb-4", tailwindClasses)}>
            {content.text || "Heading"}
          </HeadingTag>
        )
        
      case "paragraph":
        return (
          <p key={component.id} className={cn("text-gray-600 mb-4", tailwindClasses)}>
            {content.text || "Paragraph text"}
          </p>
        )
        
      case "button":
        return (
          <Button key={component.id} asChild className={tailwindClasses}>
            <a href={content.href || "#"}>
              {content.text || "Button"}
            </a>
          </Button>
        )
        
      case "video":
        if (content.type === "youtube") {
          const videoId = content.src?.includes("youtube.com/watch?v=") 
            ? content.src.split("v=")[1]?.split("&")[0]
            : content.src?.includes("youtu.be/")
            ? content.src.split("youtu.be/")[1]?.split("?")[0]
            : null
          
          if (videoId) {
            return (
              <div key={component.id} className={cn("mb-6", tailwindClasses)}>
                <iframe
                  src={\`https://www.youtube.com/embed/\${videoId}\`}
                  title={content.title || "Video"}
                  width={content.width || "100%"}
                  height={content.height || "315"}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full rounded-lg"
                />
              </div>
            )
          }
        }
        
        return (
          <div key={component.id} className={cn("mb-6", tailwindClasses)}>
            <video
              src={content.src}
              controls={content.controls}
              autoPlay={content.autoplay}
              loop={content.loop}
              muted={content.muted}
              width={content.width || "100%"}
              height={content.height || "315"}
              className="w-full rounded-lg"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )
        
      case "fanregistration":
        const countries = Array.isArray(content.countries) ? content.countries : [
          "United States", "Canada", "United Kingdom", "Australia", "Germany", "France", "Spain", "Italy", "Japan", "Brazil", "Mexico", "Other"
        ]

        return (
          <div key={component.id} className={cn("mb-8 m-auto", tailwindClasses)}>
            <form
              action={content.submitEndpoint || "https://api.example.com/fan-registration"}
              method="POST"
              className="space-y-6 p-8 bg-white border border-gray-200 rounded-xl shadow-lg max-w-2xl mx-auto"
              style={{
                backgroundColor: content.backgroundColor || "#ffffff",
                borderColor: content.borderColor || "#e5e7eb",
              }}
            >
              {content.title && (
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
                  {content.title}
                </h2>
              )}

              {/* Name Field */}
              <div className="space-y-2">
                <label htmlFor="fan-name" className="block text-sm font-medium text-gray-700">
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
                <label htmlFor="fan-email" className="block text-sm font-medium text-gray-700">
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
                <label htmlFor="fan-country" className="block text-sm font-medium text-gray-700">
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
                <label htmlFor="fan-city" className="block text-sm font-medium text-gray-700">
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
                <label htmlFor="fan-zipcode" className="block text-sm font-medium text-gray-700">
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
                {content.submitButtonText || "Register Now"}
              </button>
            </form>
          </div>
        )
        
      case "container":
      case "section":
      case "sidebar":
        return (
          <div key={component.id} className={cn("mb-6", tailwindClasses)}>
            {children?.map(renderComponent)}
          </div>
        )
        
      case "grid":
        return (
          <div key={component.id} className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6", tailwindClasses)}>
            {children?.map(renderComponent)}
          </div>
        )
        
      case "hero":
        return (
          <section key={component.id} className={cn("py-16 px-8 text-center bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl mb-8", tailwindClasses)}>
            <h1 className="text-5xl font-bold mb-4">{content.title || "Hero Title"}</h1>
            <p className="text-xl mb-8 opacity-90">{content.subtitle || "Hero subtitle"}</p>
            {content.buttonText && (
              <Button asChild>
                <a href={content.buttonHref || "#"} className="bg-white text-gray-800 hover:bg-gray-100">
                  {content.buttonText}
                </a>
              </Button>
            )}
          </section>
        )
        
      case "card":
        return (
          <div key={component.id} className={cn("bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-6", tailwindClasses)}>
            {content.image && (
              <img src={content.image || "/placeholder.svg"} alt={content.title || "Card"} className="w-full h-48 object-cover" />
            )}
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{content.title || "Card Title"}</h3>
              <p className="text-gray-600 mb-4">{content.content || "Card content"}</p>
              {content.buttonText && (
                <Button asChild>
                  <a href={content.buttonHref || "#"}>
                    {content.buttonText}
                  </a>
                </Button>
              )}
            </div>
          </div>
        )
        
      default:
        return (
          <div key={component.id} className={cn("p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500 mb-4", tailwindClasses)}>
            {type} component
          </div>
        )
    }
  }
  
  const getBackgroundStyles = () => {
    if (!data.canvasBackground) return {}
    
    const { type, color, image, imageSize, imagePosition } = data.canvasBackground
    
    if (type === "image" && image) {
      return {
        backgroundImage: \`url(\${image})\`,
        backgroundSize: imageSize || "cover",
        backgroundPosition: imagePosition || "center",
        backgroundRepeat: imageSize === "repeat" ? "repeat" : "no-repeat",
      }
    }
    
    if (type === "color" && color) {
      return {
        backgroundColor: color,
      }
    }
    
    return {}
  }
  
  return (
    <div className="min-h-screen" style={getBackgroundStyles()}>
      {data.components.map(renderComponent)}
    </div>
  )
}`;
}

function generateNextJSPageWithRenderSite(page: any, siteData: any): string {
  const componentName = toCamelCase(page.name) + "Page";

  return (
    'import { RenderSite } from "@/components/render-site"\n\n' +
    "const siteData = " +
    JSON.stringify(siteData, null, 2) +
    "\n\n" +
    "const " +
    componentName +
    " = () => {\n" +
    "  return <RenderSite data={siteData} />\n" +
    "}\n\n" +
    "export default " +
    componentName
  );
}

function getPagePath(page: any): string {
  // Use page URL or generate from name
  if (page.url && page.url !== "/") {
    // Ensure URL is properly formatted for app router
    const path = page.url.startsWith("/") ? page.url : `/${page.url}`;
    return path === "/" ? "" : path;
  }

  // Generate path from page name
  const slug = page.name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  // Home page should be at root (empty path), others get their slug
  return slug === "home" ? "" : `/${slug}`;
}

function stylesToCSS(styles: Record<string, any>, indent = "  "): string {
  return Object.entries(styles)
    .map(([property, value]) => {
      const cssProperty = camelToKebab(property);
      return `${indent}${cssProperty}: ${value};`;
    })
    .join("\n");
}

function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
}

function escapeHTML(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function minifyHTML(html: string): string {
  return html.replace(/\s+/g, " ").replace(/>\s+</g, "><").trim();
}

export function exportToHTML(
  components: BuilderComponent[],
  options: ExportOptions = {
    format: "html",
    includeStyles: true,
    minify: false,
    responsive: true,
  }
): string {
  const css = generateCSS(components, options.responsive);
  const html = generateHTML(components);

  const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Website</title>
    ${options.includeStyles ? `<style>\n${css}\n    </style>` : ""}
</head>
<body>
    <div class="container">
${html}
    </div>
</body>
</html>`;

  return options.minify ? minifyHTML(fullHTML) : fullHTML;
}

export function exportToReact(
  components: BuilderComponent[],
  options: ExportOptions = {
    format: "react",
    includeStyles: true,
    minify: false,
    responsive: true,
  }
): { component: string; styles: string } {
  const css = generateCSS(components, options.responsive);
  const jsx = generateReactJSX(components);

  const reactComponent = `import React from 'react';
${options.includeStyles ? "import './styles.css';" : ""}

export default function ExportedComponent() {
  return (
    <div className="container">
${jsx}
    </div>
  );
}`;

  return {
    component: reactComponent,
    styles: css,
  };
}

export function exportToJSON(components: BuilderComponent[]): string {
  return JSON.stringify(
    {
      version: "1.0.0",
      components: components,
      exportedAt: new Date().toISOString(),
    },
    null,
    2
  );
}

function generateButtonComponent(): string {
  return `import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }`;
}

function generateInputUIComponent(): string {
  return `import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }`;
}

function generateTextareaUIComponent(): string {
  return `import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }`;
}

function generateCheckboxUIComponent(): string {
  return `import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from 'lucide-react'
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }`;
}

function generateLabelUIComponent(): string {
  return `import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }`;
}

function generateNavbarSiteComponent(): string {
  return `import { Button } from "@/components/ui/button"
import { Menu } from 'lucide-react'
import { cn, convertStylesToTailwind } from "@/lib/utils"

interface NavbarComponentProps {
  component: any
  className?: string
}

export function NavbarComponent({ component, className }: NavbarComponentProps) {
  const { content, styles } = component
  const tailwindClasses = convertStylesToTailwind(styles?.desktop || {})
  
  return (
    <div className="w-[90%] mx-auto">
      <nav className={cn("flex items-center justify-between py-4", tailwindClasses, className)}>
        <div className="text-xl font-bold">
          {content.logo || "Logo"}
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6">
          {(content.menuItems || []).map((item: any, index: number) => (
            <a
              key={index}
              href={item.href || "#"}
              className="hover:text-gray-600 transition-colors"
            >
              {item.text || "Link"}
            </a>
          ))}
        </div>
        
        {/* Mobile Menu Button */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </nav>
    </div>
  )
}`;
}

function generateFormSiteComponent(): string {
  return `import { cn, convertStylesToTailwind } from "@/lib/utils"

interface FormComponentProps {
  component: any
  children: React.ReactNode
  className?: string
}

export function FormComponent({ component, children, className }: FormComponentProps) {
  const { content, styles } = component
  const tailwindClasses = convertStylesToTailwind(styles?.desktop || {})
  
  return (
    <form 
      className={cn("space-y-4 p-6 bg-white rounded-lg border", tailwindClasses, className)}
      action={content.action || ""}
      method={content.method || "POST"}
    >
      {content.title && (
        <h2 className="text-xl font-semibold mb-4">{content.title}</h2>
      )}
      
      {children}
      
      {content.showSubmitButton && (
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          {content.submitButtonText || "Submit"}
        </button>
      )}
    </form>
  )
}`;
}

function generateImageSiteComponent(): string {
  return `import { cn, convertStylesToTailwind } from "@/lib/utils"

interface ImageComponentProps {
  component: any
  className?: string
}

export function ImageComponent({ component, className }: ImageComponentProps) {
  const { content, styles } = component
  const tailwindClasses = convertStylesToTailwind(styles?.desktop || {})
  
  return (
    <div className={cn("flex justify-center items-center", tailwindClasses, className)}>
      <img
        src={content.src}
        alt={content.alt}
        width={content.width}
        height={content.height}
      />
    </div>
  )
}`;
}

function generateInputSiteComponent(): string {
  return `import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn, convertStylesToTailwind } from "@/lib/utils"

interface InputComponentProps {
  component: any
  className?: string
}

export function InputComponent({ component, className }: InputComponentProps) {
  const { content, styles } = component
  const tailwindClasses = convertStylesToTailwind(styles?.desktop || {})
  
  return (
    <div className={cn("space-y-2", tailwindClasses, className)}>
      {content.label && (
        <Label htmlFor={content.name}>
          {content.label}
          {content.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Input
        id={content.name}
        name={content.name}
        type={content.type || "text"}
        placeholder={content.placeholder || ""}
        required={content.required || false}
      />
    </div>
  )
}`;
}

function generateTextareaSiteComponent(): string {
  return `import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn, convertStylesToTailwind } from "@/lib/utils"

interface TextareaComponentProps {
  component: any
  className?: string
}

export function TextareaComponent({ component, className }: TextareaComponentProps) {
  const { content, styles } = component
  const tailwindClasses = convertStylesToTailwind(styles?.desktop || {})
  
  return (
    <div className={cn("space-y-2", tailwindClasses, className)}>
      {content.label && (
        <Label htmlFor={content.name}>
          {content.label}
          {content.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Textarea
        id={content.name}
        name={content.name}
        placeholder={content.placeholder || ""}
        rows={content.rows || 4}
        required={content.required || false}
      />
    </div>
  )
}`;
}

function generateCheckboxSiteComponent(): string {
  return `import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn, convertStylesToTailwind } from "@/lib/utils"

interface CheckboxComponentProps {
  component: any
  className?: string
}

export function CheckboxComponent({ component, className }: CheckboxComponentProps) {
  const { content, styles } = component
  const tailwindClasses = convertStylesToTailwind(styles?.desktop || {})
  
  return (
    <div className={cn("flex items-center space-x-2", tailwindClasses, className)}>
      <Checkbox
        id={content.name}
        name={content.name}
        value={content.value || ""}
        defaultChecked={content.checked || false}
        required={content.required || false}
      />
      {content.label && (
        <Label htmlFor={content.name} className="cursor-pointer">
          {content.label}
          {content.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
    </div>
  )
}`;
}

export function exportToNextJS(
  pages: any[],
  routeMappings: any[],
  canvasBackground?: any,
  options: ExportOptions = {
    format: "nextjs",
    includeStyles: true,
    minify: false,
    responsive: true,
  }
): {
  mainPage: string;
  files: { name: string; content: string }[];
} {
  const files: { name: string; content: string }[] = [];

  // Generate package.json with shadcn dependencies
  files.push({
    name: "package.json",
    content: generatePackageJSONWithShadcn(),
  });

  // Generate next.config.js
  files.push({
    name: "next.config.js",
    content: generateNextConfig(),
  });

  // Generate tailwind.config.js
  files.push({
    name: "tailwind.config.js",
    content: generateTailwindConfig(),
  });

  // Generate postcss.config.js
  files.push({
    name: "postcss.config.js",
    content: generatePostCSSConfig(),
  });

  // Generate globals.css
  files.push({
    name: "app/globals.css",
    content: generateGlobalCSS(),
  });

  // Generate layout.tsx
  files.push({
    name: "app/layout.tsx",
    content: generateLayout(),
  });

  // Generate components.json for shadcn
  files.push({
    name: "components.json",
    content: generateComponentsJSON(),
  });

  // Generate lib/utils.ts
  files.push({
    name: "lib/utils.ts",
    content: generateUtilsFile(),
  });

  // Generate RenderSite component
  files.push({
    name: "components/render-site.tsx",
    content: generateRenderSiteComponent(),
  });

  // Generate shadcn UI components
  files.push({
    name: "components/ui/button.tsx",
    content: generateButtonComponent(),
  });

  files.push({
    name: "components/ui/input.tsx",
    content: generateInputUIComponent(),
  });

  files.push({
    name: "components/ui/textarea.tsx",
    content: generateTextareaUIComponent(),
  });

  files.push({
    name: "components/ui/checkbox.tsx",
    content: generateCheckboxUIComponent(),
  });

  files.push({
    name: "components/ui/label.tsx",
    content: generateLabelUIComponent(),
  });

  // Generate site-specific components
  files.push({
    name: "components/site/navbar-component.tsx",
    content: generateNavbarSiteComponent(),
  });

  files.push({
    name: "components/site/form-component.tsx",
    content: generateFormSiteComponent(),
  });

  files.push({
    name: "components/site/image-component.tsx",
    content: generateImageSiteComponent(),
  });

  files.push({
    name: "components/site/input-component.tsx",
    content: generateInputSiteComponent(),
  });

  files.push({
    name: "components/site/textarea-component.tsx",
    content: generateTextareaSiteComponent(),
  });

  files.push({
    name: "components/site/checkbox-component.tsx",
    content: generateCheckboxSiteComponent(),
  });

  // Generate pages
  let mainPagePath = "";
  pages.forEach((page) => {
    const pagePath = getPagePath(page);
    const pageFilePath =
      pagePath === "" ? "app/page.tsx" : `app${pagePath}/page.tsx`;

    if (pagePath === "") {
      mainPagePath = pageFilePath;
    }

    const siteData = {
      version: "1.0.0",
      components: page.components || [],
      exportedAt: new Date().toISOString(),
      canvasBackground: canvasBackground || {
        type: "color",
        color: "#ffffff",
        imageSize: "cover",
        imagePosition: "center",
      },
    };

    files.push({
      name: pageFilePath,
      content: generateNextJSPageWithRenderSite(page, siteData),
    });
  });

  return {
    mainPage: mainPagePath || "app/page.tsx",
    files,
  };
}

function generateHTML(components: BuilderComponent[]): string {
  return components
    .map((component, index) => {
      const className = `component-${component.type}-${index}`;

      switch (component.type) {
        case "heading":
          const level = component.content.level || "h2";
          return `      <${level} class="${className}">${escapeHTML(
            component.content.text || "Heading"
          )}</${level}>`;

        case "paragraph":
          return `      <p class="${className}">${escapeHTML(
            component.content.text || "Paragraph text"
          )}</p>`;

        case "button":
          const href = component.content.href || "#";
          return `      <a href="${href}" class="${className} button">${escapeHTML(
            component.content.text || "Button"
          )}</a>`;

        case "image":
          const src = component.content.src || "/placeholder.svg";
          const alt = component.content.alt || "Image";
          return `      <img src="${src}" alt="${escapeHTML(
            alt
          )}" class="${className}" />`;

        case "hero":
          return `      <section class="${className} hero">
        <h1>${escapeHTML(component.content.title || "Hero Title")}</h1>
        <p>${escapeHTML(component.content.subtitle || "Hero subtitle")}</p>
        ${
          component.content.buttonText
            ? `<a href="${
                component.content.buttonHref || "#"
              }" class="hero-button">${escapeHTML(
                component.content.buttonText
              )}</a>`
            : ""
        }
      </section>`;

        case "card":
          return `      <div class="${className} card">
        ${
          component.content.image
            ? `<img src="${component.content.image}" alt="${escapeHTML(
                component.content.title || "Card"
              )}" class="card-image" />`
            : ""
        }
        <div class="card-content">
          <h3>${escapeHTML(component.content.title || "Card Title")}</h3>
          <p>${escapeHTML(component.content.content || "Card content")}</p>
          ${
            component.content.buttonText
              ? `<a href="${
                  component.content.buttonHref || "#"
                }" class="card-button">${escapeHTML(
                  component.content.buttonText
                )}</a>`
              : ""
          }
        </div>
      </div>`;

        case "container":
          return `      <div class="${className} container-component">
         Container content 
      </div>`;

        default:
          return `      <div class="${className}">${escapeHTML(
            component.type
          )}</div>`;
      }
    })
    .join("\n");
}

function generateReactJSX(components: BuilderComponent[]): string {
  return components
    .map((component, index) => {
      return generateComponentJSX(component, index);
    })
    .join("\n");
}

function generateComponentJSX(
  component: BuilderComponent,
  index: number
): string {
  const renderChildren = (children?: BuilderComponent[]) => {
    if (!children || children.length === 0) return "";
    return children
      .map((child, childIndex) => generateComponentJSX(child, childIndex))
      .join("\n        ");
  };

  switch (component.type) {
    case "heading":
      const level = component.content.level || "h2";
      return `      <${level} className="text-4xl font-bold mb-4">${
        component.content.text || "Heading"
      }</${level}>`;

    case "paragraph":
      return `      <p className="text-gray-600 mb-4">${
        component.content.text || "Paragraph text"
      }</p>`;

    case "button":
      const href = component.content.href || "#";
      return `      <a href="${href}" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">${
        component.content.text || "Button"
      }</a>`;

    case "image":
      const src = component.content.src || "/placeholder.svg";
      const alt = component.content.alt || "Image";
      const width =
        component.content.width && component.content.width !== "auto"
          ? component.content.width
          : undefined;
      const height =
        component.content.height && component.content.height !== "auto"
          ? component.content.height
          : undefined;
      const imageStyle =
        width || height
          ? ` style={{${width ? `width: '${width}'` : ""}${
              width && height ? ", " : ""
            }${height ? `height: '${height}'` : ""}}}`
          : "";
      const baseClasses =
        component.content.width === "auto" &&
        component.content.height === "auto"
          ? "w-full h-auto"
          : "";
      return `      <img src="${src}" alt="${alt}" className="${baseClasses} rounded-lg mb-4"${imageStyle} />`;

    case "hero":
      return `      <section className="py-16 px-8 text-center bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl mb-8">
        <h1 className="text-5xl font-bold mb-4">${
          component.content.title || "Hero Title"
        }</h1>
        <p className="text-xl mb-8 opacity-90">${
          component.content.subtitle || "Hero subtitle"
        }</p>
        ${
          component.content.buttonText
            ? `<a href="${
                component.content.buttonHref || "#"
              }" className="bg-white text-gray-800 px-8 py-3 rounded text-sm hover:bg-gray-100 transition-colors">${
                component.content.buttonText
              }</a>`
            : ""
        }
      </section>`;

    case "card":
      return `      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-6">
        ${
          component.content.image
            ? `<img src="${component.content.image}" alt="${
                component.content.title || "Card"
              }" className="w-full h-48 object-cover" />`
            : ""
        }
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-2">${
            component.content.title || "Card Title"
          }</h3>
          <p className="text-gray-600 mb-4">${
            component.content.content || "Card content"
          }</p>
          ${
            component.content.buttonText
              ? `<a href="${
                  component.content.buttonHref || "#"
                }" className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors">${
                  component.content.buttonText
                }</a>`
              : ""
          }
        </div>
      </div>`;

    case "navbar":
      const menuItems = component.content.menuItems || [];
      return `      <nav className="flex items-center justify-between py-4 mb-8 bg-white border-b">
        <div className="text-xl font-bold">${
          component.content.logo || "Logo"
        }</div>
        <div className="hidden md:flex space-x-6">
          ${menuItems
            .map(
              (item: any) =>
                `<a href="${
                  item.href || "#"
                }" className="hover:text-gray-600">${item.text || "Link"}</a>`
            )
            .join("\n          ")}
        </div>
        <button className="md:hidden">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>`;

    case "form":
      const children = renderChildren(component.children);
      return `      <form className="space-y-4 p-6 bg-white rounded-lg border">
        ${children}
        ${
          component.content.submitText
            ? `<button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">${component.content.submitText}</button>`
            : ""
        }
      </form>`;

    case "input":
      return `      <div className="mb-4">
        ${
          component.content.label
            ? `<label className="block text-sm font-medium text-gray-700 mb-2">${
                component.content.label
              }${component.content.required ? " *" : ""}</label>`
            : ""
        }
        <input
          type="${component.content.type || "text"}"
          name="${component.content.name || "input"}"
          placeholder="${component.content.placeholder || ""}"
          ${component.content.required ? "required" : ""}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>`;

    case "textarea":
      return `      <div className="mb-4">
        ${
          component.content.label
            ? `<label className="block text-sm font-medium text-gray-700 mb-2">${
                component.content.label
              }${component.content.required ? " *" : ""}</label>`
            : ""
        }
        <textarea
          name="${component.content.name || "textarea"}"
          placeholder="${component.content.placeholder || ""}"
          rows={${component.content.rows || 4}}
          ${component.content.required ? "required" : ""}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>`;

    case "checkbox":
      return `      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          name="${component.content.name || "checkbox"}"
          id="${component.content.name || "checkbox"}"
          ${component.content.required ? "required" : ""}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        ${
          component.content.label
            ? `<label htmlFor="${
                component.content.name || "checkbox"
              }" className="ml-2 block text-sm text-gray-900">${
                component.content.label
              }${component.content.required ? " *" : ""}</label>`
            : ""
        }
      </div>`;

    case "select":
      const options = component.content.options || [];
      return `      <div className="mb-4">
        ${
          component.content.label
            ? `<label className="block text-sm font-medium text-gray-700 mb-2">${
                component.content.label
              }${component.content.required ? " *" : ""}</label>`
            : ""
        }
        <select
          name="${component.content.name || "select"}"
          ${component.content.required ? "required" : ""}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          ${options
            .map(
              (option: any) =>
                `<option value="${option.value || ""}">${
                  option.text || "Option"
                }</option>`
            )
            .join("\n          ")}
        </select>
      </div>`;

    case "radiogroup":
      const radioOptions = component.content.options || [];
      return `      <div className="mb-4">
        ${
          component.content.label
            ? `<fieldset><legend className="block text-sm font-medium text-gray-700 mb-2">${
                component.content.label
              }${component.content.required ? " *" : ""}</legend>`
            : ""
        }
        <div className="space-y-2">
          ${radioOptions
            .map(
              (option: any, optIndex: number) => `
          <div className="flex items-center">
            <input
              type="radio"
              name="${component.content.name || "radio"}"
              id="${component.content.name || "radio"}_${optIndex}"
              value="${option.value || ""}"
              ${component.content.required ? "required" : ""}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label htmlFor="${
              component.content.name || "radio"
            }_${optIndex}" className="ml-2 block text-sm text-gray-900">${
                option.text || "Option"
              }</label>
          </div>`
            )
            .join("")}
        </div>
        ${component.content.label ? `</fieldset>` : ""}
      </div>`;

    case "link":
      return `      <a href="${
        component.content.href || "#"
      }" className="text-blue-600 hover:text-blue-800 underline">${
        component.content.text || "Link"
      }</a>`;

    case "divider":
      return `      <hr className="my-8 border-gray-300" />`;

    case "video":
      if (
        component.content.src?.includes("youtube.com") ||
        component.content.src?.includes("youtu.be")
      ) {
        const videoId = component.content.src.match(
          /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
        )?.[1];
        return `      <div className="aspect-video mb-6">
        <iframe
          src="https://www.youtube.com/embed/${videoId}"
          className="w-full h-full rounded-lg"
          allowFullScreen
        ></iframe>
      </div>`;
      } else {
        return `      <video controls className="w-full rounded-lg mb-6">
        <source src="${component.content.src || ""}" type="video/mp4" />
        Your browser does not support the video tag.
      </video>`;
      }

    case "quote":
      return `      <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-6">
        <p className="mb-2">"${component.content.text || "Quote text"}"</p>
        ${
          component.content.author
            ? `<cite className="text-sm text-gray-500">— ${component.content.author}</cite>`
            : ""
        }
      </blockquote>`;

    case "list":
      const listItems = component.content.items || [];
      const listType = component.content.type || "unordered";
      const ListTag = listType === "ordered" ? "ol" : "ul";
      const listClass = listType === "ordered" ? "list-decimal" : "list-disc";
      return `      <${ListTag} className="${listClass} pl-6 mb-6 space-y-2">
        ${listItems
          .map((item: string) => `<li>${item}</li>`)
          .join("\n        ")}
      </${ListTag}>`;

    case "container":
    case "section":
    case "sidebar":
    case "grid":
      const containerChildren = renderChildren(component.children);
      const containerClass =
        component.type === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6"
          : "mb-6 p-4 border border-gray-200 rounded-lg";
      return `      <div className="${containerClass}">
        ${containerChildren}
      </div>`;

    default:
      return `      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500 mb-4">
        ${component.type} component
      </div>`;
  }
}

function generateCSS(
  components: BuilderComponent[],
  responsive = true
): string {
  let css = `/* Base Styles */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #1f2937;
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.button:hover {
  background-color: #374151;
}

.hero {
  padding: 4rem 2rem;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 0.75rem;
  margin-bottom: 2rem;
}

.hero h1 {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.hero-button {
  background-color: white;
  color: #1f2937;
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.2s;
}

.hero-button:hover {
  background-color: #f3f4f6;
}

.card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.card-image {
  width: 100%;
  height: 12rem;
  object-fit: cover;
}

.card-content {
  padding: 1.5rem;
}

.card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.card p {
  color: #6b7280;
  margin-bottom: 1rem;
}

.card-button {
  background-color: #1f2937;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  text-decoration: none;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.card-button:hover {
  background-color: #374151;
}

.container-component {
  padding: 1.5rem;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  background-color: #f9fafb;
  margin-bottom: 1rem;
  text-align: center;
  color: #6b7280;
}

`;

  // Generate component-specific styles
  components.forEach((component, index) => {
    const className = `.component-${component.type}-${index}`;
    const desktopStyles = getInheritedStyles(component, "desktop");

    if (Object.keys(desktopStyles).length > 0) {
      css += `${className} {\n${stylesToCSS(desktopStyles)}\n}\n\n`;
    }

    if (responsive) {
      // Tablet styles
      const tabletStyles = component.styles.tablet || {};
      if (Object.keys(tabletStyles).length > 0) {
        css += `@media (max-width: 1199px) {\n  ${className} {\n${stylesToCSS(
          tabletStyles,
          "    "
        )}\n  }\n}\n\n`;
      }

      // Mobile styles
      const mobileStyles = component.styles.mobile || {};
      if (Object.keys(mobileStyles).length > 0) {
        css += `@media (max-width: 767px) {\n  ${className} {\n${stylesToCSS(
          mobileStyles,
          "    "
        )}\n  }\n}\n\n`;
      }
    }
  });

  return css;
}

export function downloadFile(
  content: string,
  filename: string,
  mimeType = "text/plain"
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadZip(
  files: { name: string; content: string }[],
  zipName = "website.zip"
) {
  const zip = new JSZip();

  files.forEach((file) => {
    const pathParts = file.name.split("/");
    if (pathParts.length > 1) {
      zip.file(file.name, file.content);
    } else {
      zip.file(file.name, file.content);
    }
  });

  zip.generateAsync({ type: "blob" }).then((content) => {
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = zipName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
}

export function downloadNextJSZip(nextjsExport: {
  files: { name: string; content: string }[];
}) {
  downloadZip(nextjsExport.files, "nextjs-website.zip");
}
