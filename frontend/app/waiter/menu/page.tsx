"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { WaiterLayout } from "@/components/layout/waiter-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  Leaf,
  Flame,
  XCircle,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  X,
  AlertTriangle,
  CheckCircle2,
  ChefHat
} from "lucide-react"
import { useMenuItems } from "@/hooks/use-menu-items"
import { useCategories } from "@/hooks/use-categories"
import { MenuItem, OrderItem } from "@/types/waiter"
import Image from "next/image"
import { toast } from "sonner"

export default function MenuBrowserPage() {
  const router = useRouter()
  const { menuItems } = useMenuItems()
  const { categories } = useCategories()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [priceFilter, setPriceFilter] = useState<"all" | "low" | "medium" | "high">("all")
  const [sortBy, setSortBy] = useState<"name" | "price" | "popular">("name")
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [cart, setCart] = useState<OrderItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filterVegetarian, setFilterVegetarian] = useState(false)
  const [filterVegan, setFilterVegan] = useState(false)
  const [filterSpicy, setFilterSpicy] = useState(false)

  const menuItemsData = menuItems.data || []
  const categoriesData = categories.data || []

  // Filter menu items
  const filteredItems = menuItemsData.filter((item: any) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === "all" || item.categoryId === selectedCategory
    
    let matchesPrice = true
    if (priceFilter === "low") matchesPrice = item.price < 10
    if (priceFilter === "medium") matchesPrice = item.price >= 10 && item.price < 20
    if (priceFilter === "high") matchesPrice = item.price >= 20

    const matchesVegetarian = !filterVegetarian || item.vegetarian
    const matchesVegan = !filterVegan || item.vegan
    const matchesSpicy = !filterSpicy || (item.spicy || (item.spicyLevel && item.spicyLevel > 0))

    return matchesSearch && matchesCategory && matchesPrice && matchesVegetarian && matchesVegan && matchesSpicy
  })

  // Sort items
  const sortedItems = [...filteredItems].sort((a: any, b: any) => {
    if (sortBy === "name") return a.name.localeCompare(b.name)
    if (sortBy === "price") return a.price - b.price
    if (sortBy === "popular") return (b.popularity || 0) - (a.popularity || 0)
    return 0
  })

  const activeFiltersCount = [filterVegetarian, filterVegan, filterSpicy].filter(Boolean).length

  const clearFilters = () => {
    setFilterVegetarian(false)
    setFilterVegan(false)
    setFilterSpicy(false)
    setSearchQuery("")
    setSelectedCategory("all")
    setPriceFilter("all")
  }

  const getCategoryName = (categoryId: string) => {
    const category = categoriesData.find(c => c.id === categoryId)
    return category?.name || "Uncategorized"
  }

  // Cart functions
  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find(cartItem => cartItem.menuItemId === item.id)
    
    if (existingItem) {
      setCart(prev => 
        prev.map(cartItem => 
          cartItem.menuItemId === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      )
      toast.success(`Increased quantity of ${item.name}`)
    } else {
      setCart(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          menuItemId: item.id,
          name: item.name,
          quantity: 1,
          price: item.price,
          notes: "",
          specialInstructions: "",
        }
      ])
      toast.success(`Added ${item.name} to cart`)
    }
  }

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId))
    toast.success("Item removed from cart")
  }

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => 
      prev.map(item => {
        if (item.id === cartItemId) {
          const newQuantity = Math.max(1, item.quantity + delta)
          return { ...item, quantity: newQuantity }
        }
        return item
      })
    )
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const proceedToOrder = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty")
      return
    }
    
    // Store cart in localStorage for the order creation page
    localStorage.setItem('waiter-cart', JSON.stringify(cart))
    router.push('/waiter/orders/create')
  }

  return (
    <WaiterLayout>
      <div className="space-y-6 pb-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Menu Browser</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 bg-amber-500">{activeFiltersCount}</Badge>
              )}
            </Button>
            <Button 
              onClick={() => setIsCartOpen(true)}
              className="relative"
              size="lg"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Cart
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-amber-600">
                  {cart.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search for dishes..."
            className="pl-12 h-12 rounded-full border-amber-200 dark:border-gray-700 focus:ring-amber-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className={`${showFilters ? "block" : "hidden"} md:block`}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-amber-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categoriesData.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort By</label>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="price">Price (Low to High)</SelectItem>
                    <SelectItem value="popular">Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Price Range</label>
                <Select value={priceFilter} onValueChange={(value: any) => setPriceFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="low">Under Br10</SelectItem>
                    <SelectItem value="medium">Br10 - Br20</SelectItem>
                    <SelectItem value="high">Br20+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dietary Filters */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Dietary Preferences</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={filterVegetarian ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterVegetarian(!filterVegetarian)}
                    className={filterVegetarian ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    <Leaf className="h-4 w-4 mr-1" />
                    Vegetarian
                  </Button>
                  <Button
                    variant={filterVegan ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterVegan(!filterVegan)}
                    className={filterVegan ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    <Leaf className="h-4 w-4 mr-1" />
                    Vegan
                  </Button>
                  <Button
                    variant={filterSpicy ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterSpicy(!filterSpicy)}
                    className={filterSpicy ? "bg-red-500 hover:bg-red-600" : ""}
                  >
                    <Flame className="h-4 w-4 mr-1" />
                    Spicy
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        {sortedItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="h-24 w-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No items found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your filters or search terms
            </p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
          >
            {sortedItems.map((item: any, index: number) => {
              const cartItem = cart.find(c => c.menuItemId === item.id)
              const quantity = cartItem?.quantity || 0
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer border-amber-200 dark:border-gray-700"
                    onClick={() => {
                      setSelectedItem(item)
                      setIsDetailOpen(true)
                    }}
                  >
                    <div className="relative h-48 overflow-hidden">
                      {item.images && item.images[0] ? (
                        <Image
                          src={item.images[0]}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900 flex items-center justify-center">
                          <span className="text-amber-600 dark:text-amber-400 font-semibold text-lg">{item.name.charAt(0)}</span>
                        </div>
                      )}
                      {!item.isAvailable && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">Unavailable</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        {item.isFeatured && (
                          <Badge className="bg-amber-500 hover:bg-amber-600">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {item.vegetarian && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                            <Leaf className="h-3 w-3 mr-1" />
                            Veg
                          </Badge>
                        )}
                        {item.vegan && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                            <Leaf className="h-3 w-3 mr-1" />
                            Vegan
                          </Badge>
                        )}
                        {(item.spicy || (item.spicyLevel && item.spicyLevel > 0)) && (
                          <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200">
                            <Flame className="h-3 w-3 mr-1" />
                            Spicy
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg line-clamp-1">{item.name}</h3>
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                        {item.preparationTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{item.preparationTime} min</span>
                          </div>
                        )}
                        <span className="capitalize">{getCategoryName(item.categoryId)}</span>
                      </div>
                      {quantity > 0 ? (
                        <div className="flex items-center justify-between">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              cartItem && removeFromCart(cartItem.id)
                            }}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="font-semibold">{quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              addToCart(item)
                            }}
                            disabled={!item.isAvailable}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation()
                            addToCart(item)
                          }}
                          disabled={!item.isAvailable}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add to Cart
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>

      {/* Menu Item Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl">{selectedItem.name}</DialogTitle>
                <DialogDescription>{getCategoryName(selectedItem.categoryId)}</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 sm:space-y-6">
                {/* Image */}
                {selectedItem.images && selectedItem.images[0] && (
                  <div className="relative h-48 sm:h-64 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={selectedItem.images[0]}
                      alt={selectedItem.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}

                {/* Price and Availability */}
                <div className="flex items-center justify-between">
                  <div className="text-2xl sm:text-3xl font-bold text-amber-600">
                    ${selectedItem.price.toFixed(2)}
                  </div>
                  <Badge 
                    variant={selectedItem.isAvailable ? "default" : "destructive"}
                    className="text-base sm:text-lg px-3 sm:px-4 py-2"
                  >
                    {selectedItem.isAvailable ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Available
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-1" />
                        Unavailable
                      </>
                    )}
                  </Badge>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-2">Description</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">{selectedItem.description}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Preparation Time</p>
                      <p className="font-semibold text-sm sm:text-base">{selectedItem.preparationTime || selectedItem.prepTime || 15} minutes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 sm:h-5 w-4 sm:w-5 text-amber-500" />
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Rating</p>
                      <p className="font-semibold text-sm sm:text-base">{selectedItem.rating || 4.5} / 5</p>
                    </div>
                  </div>
                </div>

                {/* Dietary Information */}
                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-3">Dietary Information</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.vegetarian && (
                      <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                        <Leaf className="h-3 w-3 mr-1" />
                        Vegetarian
                      </Badge>
                    )}
                    {selectedItem.vegan && (
                      <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                        <Leaf className="h-3 w-3 mr-1" />
                        Vegan
                      </Badge>
                    )}
                    {(selectedItem.spicy || (selectedItem.spicyLevel && selectedItem.spicyLevel > 0)) && (
                      <Badge variant="outline" className="text-red-600 border-red-600 text-xs">
                        <Flame className="h-3 w-3 mr-1" />
                        Spicy
                      </Badge>
                    )}
                    {selectedItem.glutenFree && (
                      <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs">
                        Gluten Free
                      </Badge>
                    )}
                    {selectedItem.isFeatured && (
                      <Badge className="bg-amber-500 text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {selectedItem.chefSpecial && (
                      <Badge variant="outline" className="text-amber-600 border-amber-600 text-xs">
                        <ChefHat className="h-3 w-3 mr-1" />
                        Chef's Special
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Allergens */}
                {selectedItem.allergens && selectedItem.allergens.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 sm:h-5 w-4 sm:w-5 text-amber-500" />
                      Allergens
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.allergens.map((allergen: string, index: number) => (
                        <Badge key={index} variant="destructive" className="bg-amber-600 text-xs">
                          {allergen}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ingredients (if available) */}
                {selectedItem.ingredients && selectedItem.ingredients.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg mb-3">Ingredients</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.ingredients.map((ingredient: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {ingredient}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Cart Dialog */}
      <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">Shopping Cart</DialogTitle>
          </DialogHeader>
          
          {cart.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Cart Items */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.id} className="p-3 sm:p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm sm:text-base truncate">{item.name}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 shrink-0"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateCartQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateCartQuantity(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="font-semibold text-sm sm:text-base">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-base sm:text-lg font-bold">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Proceed to Order Button */}
              <Button
                onClick={proceedToOrder}
                className="w-full"
                size="lg"
              >
                <ArrowRight className="h-5 w-5 mr-2" />
                Proceed to Create Order
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </WaiterLayout>
  )
}
