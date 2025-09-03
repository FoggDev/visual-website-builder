"use client"

import type React from "react"

import { useState } from "react"
import { useBuilder } from "./builder-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Download, Code, FileText, Braces, Copy, Check } from "lucide-react"
import {
  exportToHTML,
  exportToReact,
  exportToJSON,
  downloadFile,
  type ExportOptions,
  exportToNextJS,
  downloadNextJSZip,
} from "./export-utils"

interface ExportDialogProps {
  children: React.ReactNode
}

export function ExportDialog({ children }: ExportDialogProps) {
  const { state } = useBuilder()
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "html",
    includeStyles: true,
    minify: false,
    responsive: true,
  })
  const [previewContent, setPreviewContent] = useState("")
  const [copied, setCopied] = useState(false)

  const currentPage = state.pages.find((page) => page.id === state.currentPageId)
  const currentComponents = currentPage?.components || []

  const generatePreview = () => {
    switch (exportOptions.format) {
      case "html":
        setPreviewContent(exportToHTML(currentComponents, exportOptions))
        break
      case "react":
        const reactExport = exportToReact(currentComponents, exportOptions)
        setPreviewContent(reactExport.component)
        break
      case "json":
        setPreviewContent(exportToJSON(currentComponents))
        break
      case "nextjs":
        const nextjsExport = exportToNextJS(state.pages, state.routeMappings, state.canvasBackground, exportOptions)
        setPreviewContent(nextjsExport.mainPage)
        break
    }
  }

  const handleExport = () => {
    let content = ""
    let filename = ""
    let mimeType = "text/plain"

    switch (exportOptions.format) {
      case "html":
        content = exportToHTML(currentComponents, exportOptions)
        filename = "index.html"
        mimeType = "text/html"
        break
      case "react":
        const reactExport = exportToReact(currentComponents, exportOptions)
        content = reactExport.component
        filename = "ExportedComponent.jsx"
        mimeType = "text/javascript"

        // Also download styles if included
        if (exportOptions.includeStyles) {
          downloadFile(reactExport.styles, "styles.css", "text/css")
        }
        break
      case "json":
        content = exportToJSON(currentComponents)
        filename = "website-data.json"
        mimeType = "application/json"
        break
      case "nextjs":
        const nextjsExport = exportToNextJS(state.pages, state.routeMappings, state.canvasBackground, exportOptions)
        downloadNextJSZip(nextjsExport)
        return // Don't download individual file for Next.js
    }

    downloadFile(content, filename, mimeType)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(previewContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy to clipboard:", err)
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "html":
        return <FileText className="h-4 w-4" />
      case "react":
        return <Code className="h-4 w-4" />
      case "json":
        return <Braces className="h-4 w-4" />
      case "nextjs":
        return <Code className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Your Website
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* Export Options */}
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Export Format</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[
                  { value: "html", label: "HTML", desc: "Static HTML file" },
                  { value: "react", label: "React", desc: "JSX component" },
                  { value: "json", label: "JSON", desc: "Raw data" },
                  { value: "nextjs", label: "Next.js", desc: "Full Next.js app" },
                ].map((format) => (
                  <Button
                    key={format.value}
                    variant={exportOptions.format === format.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setExportOptions({ ...exportOptions, format: format.value as any })}
                    className="flex flex-col h-auto p-3"
                  >
                    {getFormatIcon(format.value)}
                    <span className="mt-1 text-xs">{format.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium">Export Options</Label>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="include-styles">Include Styles</Label>
                  <p className="text-xs text-muted-foreground">Embed CSS styles in the export</p>
                </div>
                <Switch
                  id="include-styles"
                  checked={exportOptions.includeStyles}
                  onCheckedChange={(checked) => setExportOptions({ ...exportOptions, includeStyles: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="responsive">Responsive Design</Label>
                  <p className="text-xs text-muted-foreground">Include mobile and tablet breakpoints</p>
                </div>
                <Switch
                  id="responsive"
                  checked={exportOptions.responsive}
                  onCheckedChange={(checked) => setExportOptions({ ...exportOptions, responsive: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="minify">Minify Code</Label>
                  <p className="text-xs text-muted-foreground">Remove whitespace and comments</p>
                </div>
                <Switch
                  id="minify"
                  checked={exportOptions.minify}
                  onCheckedChange={(checked) => setExportOptions({ ...exportOptions, minify: checked })}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={generatePreview} variant="outline" className="flex-1 bg-transparent">
                Generate Preview
              </Button>
              <Button onClick={handleExport} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Export Summary</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Page:</span>
                  <Badge variant="secondary">{currentPage?.name || "Untitled"}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Components:</span>
                  <Badge variant="secondary">{currentComponents.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Format:</span>
                  <Badge variant="secondary" className="capitalize">
                    {exportOptions.format}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Responsive:</span>
                  <Badge variant={exportOptions.responsive ? "default" : "secondary"}>
                    {exportOptions.responsive ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Code Preview</Label>
              {previewContent && (
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span className="ml-2">{copied ? "Copied!" : "Copy"}</span>
                </Button>
              )}
            </div>

            <Textarea
              value={previewContent || "Click 'Generate Preview' to see the exported code"}
              readOnly
              className="font-mono text-xs h-96 resize-none"
              placeholder="Preview will appear here..."
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
