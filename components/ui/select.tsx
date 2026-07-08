"use client"

import * as React from "react"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

const SelectContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
  value: string
  setValue: (value: string) => void
}>({
  open: false,
  setOpen: () => {},
  value: "",
  setValue: () => {},
})

function Select({ children, defaultValue = "", value: controlledValue, onValueChange }: {
  children: React.ReactNode
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
  const open = uncontrolledOpen
  const setOpen = setUncontrolledOpen
  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue
  const setValue = onValueChange || setUncontrolledValue

  return (
    <SelectContext.Provider value={{ open, setOpen, value, setValue }}>
      {children}
    </SelectContext.Provider>
  )
}

function SelectTrigger({ className, children, ...props }: React.ComponentProps<"button">) {
  const { open, setOpen } = React.useContext(SelectContext)
  
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-8 w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
}

function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = React.useContext(SelectContext)
  return <span>{value || placeholder}</span>
}

function SelectContent({ className, children }: { className?: string, children: React.ReactNode }) {
  const { open, setOpen } = React.useContext(SelectContext)
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open, setOpen])

  if (!open) return null

  return (
    <div
      ref={contentRef}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md p-1",
        className
      )}
    >
      {children}
    </div>
  )
}

function SelectItem({ className, children, value: itemValue }: { className?: string, children: React.ReactNode, value: string }) {
  const { value, setValue, setOpen } = React.useContext(SelectContext)
  
  return (
    <div
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      onClick={() => {
        setValue(itemValue)
        setOpen(false)
      }}
      data-selected={value === itemValue}
    >
      <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
        {value === itemValue && <Check className="h-4 w-4" />}
      </span>
      {children}
    </div>
  )
}

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
}
