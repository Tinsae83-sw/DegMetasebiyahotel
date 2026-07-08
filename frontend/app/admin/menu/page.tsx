"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Image as ImageIcon, ChefHat, Clock, Flame, Loader2, X } from "lucide-react"
import { toast } from "sonner"
import { useMenuItems } from "@/hooks/use-menu-items"
import { useCategories } from "@/hooks/use-categories"
import type { MenuItem } from "@/lib/api/menu"
import type { Category } from "@/lib/api/categories"

export default function MenuPage() {
  const { menuItems, createMenuItem, updateMenuItem, deleteMenuItem, isCreating, isUpdating, isDeleting } = useMenuItems()
  const { categories } = useCategories()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    categoryId: "",
    images: [] as string[],
    preparationTime: 15,
    ingredients: [] as string[],
    isFeatured: false,
    isAvailable: true,
    spicyLevel: 0,
    tags: [] as string[],
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState("")

  const categoriesData = categories.data || []
  const menuItemsData = menuItems.data || []

  const filteredItems = menuItemsData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.categoryId === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }
      
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate image is required for new items
    if (!editingItem && !imageFile && !imagePreview) {
      toast.error("Image is required")
      return
    }
    
    if (editingItem) {
      updateMenuItem({ id: editingItem.id, data: formData, imageFile: imageFile || undefined })
    } else {
      createMenuItem({ data: formData, imageFile: imageFile || undefined })
    }
    
    setIsDialogOpen(false)
    setEditingItem(null)
    setFormData({
      name: "",
      description: "",
      price: 0,
      categoryId: "",
      images: [],
      preparationTime: 15,
      ingredients: [],
      isFeatured: false,
      isAvailable: true,
      spicyLevel: 0,
      tags: [],
    })
    setImageFile(null)
    setImagePreview("")
  }

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item)
    setFormData(item)
    setImagePreview(item.images[0] || "")
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteMenuItem(id)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingItem(null)
    setFormData({
      name: "",
      description: "",
      price: 0,
      categoryId: "",
      images: [],
      preparationTime: 15,
      ingredients: [],
      isFeatured: false,
      isAvailable: true,
      spicyLevel: 0,
      tags: [],
    })
    setImageFile(null)
    setImagePreview("")
  }

  const getSpicyLevelIcon = (level: number) => {
    return Array.from({ length: level }).map((_, i) => (
      <Flame key={i} className="h-3 w-3 text-orange-500 fill-orange-500" />
    ))
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Menu Items</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button onClick={() => { setEditingItem(null); setIsDialogOpen(true) }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Menu Item
            </Button>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesData.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Image {!editingItem && <span className="text-destructive">*</span>}</Label>
                  <div className="space-y-2">
                    {imagePreview ? (
                      <div className="relative w-full h-40 rounded-lg overflow-hidden border">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="image-upload"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Click to select image</p>
                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 5MB</p>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preparationTime">Preparation Time (min)</Label>
                    <Input
                      id="preparationTime"
                      type="number"
                      value={formData.preparationTime}
                      onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spicyLevel">Spicy Level (0-3)</Label>
                    <Input
                      id="spicyLevel"
                      type="number"
                      min="0"
                      max="3"
                      value={formData.spicyLevel}
                      onChange={(e) => setFormData({ ...formData, spicyLevel: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ingredients">Ingredients (comma-separated)</Label>
                  <Input
                    id="ingredients"
                    value={formData.ingredients.join(", ")}
                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value.split(",").map(i => i.trim()) })}
                    placeholder="Ingredient 1, Ingredient 2, ..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags.join(", ")}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(",").map(t => t.trim()) })}
                    placeholder="gluten-free, spicy, popular"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.isFeatured}
                      onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                    />
                    <Label>Featured</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.isAvailable}
                      onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
                    />
                    <Label>Available</Label>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating || isUpdating}>
                    {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingItem ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Menu Items</CardTitle>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search items..."
                    className="pl-8 w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categoriesData.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {menuItems.isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="aspect-video w-full rounded-lg bg-muted mb-4 flex items-center justify-center overflow-hidden">
                        {item.images[0] ? (
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold">{item.name}</h3>
                          <span className="font-bold text-lg">${item.price.toFixed(2)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{item.preparationTime} min</span>
                          </div>
                          <div className="flex gap-0.5">
                            {getSpicyLevelIcon(item.spicyLevel)}
                          </div>
                          {item.isFeatured && (
                            <Badge variant="secondary" className="text-xs">
                              <ChefHat className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          {!item.isAvailable && (
                            <Badge variant="destructive" className="text-xs">
                              Unavailable
                            </Badge>
                          )}
                        </div>
                        {item.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {item.tags.map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex justify-end space-x-2 pt-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
