"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useBuilder, type Page } from "./builder-context"
import { Plus, MoreHorizontal, Copy, Edit, Trash2, ExternalLink } from "lucide-react"

export function PageManager() {
  const { state, dispatch } = useBuilder()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingPage, setEditingPage] = useState<Page | null>(null)
  const [newPageName, setNewPageName] = useState("")
  const [newPageUrl, setNewPageUrl] = useState("")

  const handleAddPage = () => {
    if (!newPageName.trim() || !newPageUrl.trim()) return

    const newPage: Page = {
      id: Math.random().toString(36).substr(2, 9),
      name: newPageName.trim(),
      url: newPageUrl.trim(),
      components: [],
    }

    dispatch({ type: "ADD_PAGE", payload: { page: newPage } })
    setNewPageName("")
    setNewPageUrl("")
    setIsAddDialogOpen(false)
  }

  const handleEditPage = () => {
    if (!editingPage || !newPageName.trim() || !newPageUrl.trim()) return

    dispatch({
      type: "UPDATE_PAGE",
      payload: {
        pageId: editingPage.id,
        updates: {
          name: newPageName.trim(),
          url: newPageUrl.trim(),
        },
      },
    })

    setEditingPage(null)
    setNewPageName("")
    setNewPageUrl("")
    setIsEditDialogOpen(false)
  }

  const handleDuplicatePage = (pageId: string) => {
    dispatch({ type: "DUPLICATE_PAGE", payload: { pageId } })
  }

  const handleDeletePage = (pageId: string) => {
    if (state.pages.length <= 1) return // Don't allow deleting the last page
    dispatch({ type: "DELETE_PAGE", payload: { pageId } })
  }

  const openEditDialog = (page: Page) => {
    setEditingPage(page)
    setNewPageName(page.name)
    setNewPageUrl(page.url)
    setIsEditDialogOpen(true)
  }

  const generateUrlFromName = (name: string) => {
    return (
      "/" +
      name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
    )
  }

  return (
    <div className="flex items-center gap-2">
      {/* Page Tabs */}
      <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
        {state.pages.map((page) => (
          <div key={page.id} className="flex items-center">
            <Button
              variant={state.currentPageId === page.id ? "default" : "ghost"}
              size="sm"
              onClick={() => dispatch({ type: "SET_CURRENT_PAGE", payload: { pageId: page.id } })}
              className="h-8 px-3 rounded-md"
            >
              {page.name}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-1">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openEditDialog(page)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Page
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDuplicatePage(page.id)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(page.url, "_blank")} className="text-blue-600">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Preview URL
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeletePage(page.id)}
                  disabled={state.pages.length <= 1}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      {/* Add Page Button */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 bg-transparent">
            <Plus className="h-4 w-4 mr-1" />
            Add Page
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Page</DialogTitle>
            <DialogDescription>
              Create a new page for your website. Each page will have its own URL and components.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="page-name">Page Name</Label>
              <Input
                id="page-name"
                placeholder="About Us"
                value={newPageName}
                onChange={(e) => {
                  setNewPageName(e.target.value)
                  if (!newPageUrl || newPageUrl === generateUrlFromName(newPageName)) {
                    setNewPageUrl(generateUrlFromName(e.target.value))
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="page-url">Page URL</Label>
              <Input
                id="page-url"
                placeholder="/about-us"
                value={newPageUrl}
                onChange={(e) => setNewPageUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPage} disabled={!newPageName.trim() || !newPageUrl.trim()}>
              Add Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Page Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Page</DialogTitle>
            <DialogDescription>
              Update the page name and URL. The URL will be used for navigation and routing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-page-name">Page Name</Label>
              <Input
                id="edit-page-name"
                placeholder="About Us"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-page-url">Page URL</Label>
              <Input
                id="edit-page-url"
                placeholder="/about-us"
                value={newPageUrl}
                onChange={(e) => setNewPageUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditPage} disabled={!newPageName.trim() || !newPageUrl.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
