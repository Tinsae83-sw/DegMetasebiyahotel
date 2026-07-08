import { Toaster as Sonner } from "sonner"

function Toaster() {
  return (
    <Sonner
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "toast toast-offset",
          description: "toast-description",
          actionButton: "toast-action",
          cancelButton: "toast-cancel",
        },
      }}
    />
  )
}

export { Toaster }
