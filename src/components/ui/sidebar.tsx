
"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH_EXPANDED = "16rem"
const SIDEBAR_WIDTH_COLLAPSED = "3.5rem"
const SIDEBAR_WIDTH_MOBILE = "16rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContext = {
  state: "expanded" | "collapsed"
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }
  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, children, ...props }, ref) => {
  const isMobile = useIsMobile()
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  const toggleSidebar = React.useCallback(() => {
    setIsCollapsed(prev => !prev)
  }, [])

  React.useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true)
    }
  }, [isMobile])

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  const state = isCollapsed ? "collapsed" : "expanded"

  const contextValue = React.useMemo(
    () => ({ state, isMobile, toggleSidebar }),
    [state, isMobile, toggleSidebar]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          ref={ref}
          className={cn("flex min-h-screen", className)}
          data-state={state}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
})
SidebarProvider.displayName = "SidebarProvider"

const Sidebar = React.forwardRef<
  HTMLElement,
  React.ComponentProps<"aside">
>(({ className, children, ...props }, ref) => {
  const { isMobile } = useSidebar()

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 md:hidden">
            <PanelLeft />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[var(--sidebar-width)] bg-sidebar p-0 text-sidebar-foreground"
          style={{ "--sidebar-width": SIDEBAR_WIDTH_MOBILE } as React.CSSProperties}
        >
           <SheetTitle className="sr-only">Main Navigation</SheetTitle>
           <SheetDescription className="sr-only">Navigate through the app sections.</SheetDescription>
          <div className="flex h-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <aside
      ref={ref}
      className={cn(
        "hidden md:flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
        "data-[state=expanded]:w-[var(--sidebar-width-expanded)] data-[state=collapsed]:w-[var(--sidebar-width-collapsed)]",
        className
      )}
      style={{
        "--sidebar-width-expanded": SIDEBAR_WIDTH_EXPANDED,
        "--sidebar-width-collapsed": SIDEBAR_WIDTH_COLLAPSED,
      } as React.CSSProperties}
      {...props}
    >
      {children}
    </aside>
  )
})
Sidebar.displayName = "Sidebar"


const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"main">
>(({ className, ...props }, ref) => {
  const { state, isMobile } = useSidebar();
  
  if (isMobile) {
    return <main ref={ref} className={cn("flex-1 pt-16", className)} {...props} />;
  }

  return (
    <main
      ref={ref}
      className={cn("flex-1 transition-all duration-300 ease-in-out", "ml-[var(--sidebar-width-collapsed)] data-[state=expanded]:ml-[var(--sidebar-width-expanded)]", className)}
      style={{
        "--sidebar-width-expanded": SIDEBAR_WIDTH_EXPANDED,
        "--sidebar-width-collapsed": SIDEBAR_WIDTH_COLLAPSED,
      } as React.CSSProperties}
      {...props}
    />
  );
})
SidebarInset.displayName = "SidebarInset"

// Simplified Trigger for desktop view, often placed inside the sidebar itself
const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar, isMobile } = useSidebar()

  if (isMobile) return null;

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"


const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-center justify-between p-3", className)}
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col gap-2 p-3 mt-auto", className)}
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"


const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"


const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-col gap-1 px-3 py-2", className)}
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("relative", className)}
    {...props}
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"


const sidebarMenuButtonVariants = cva(
  "flex items-center gap-3 w-full rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground",
  {
    variants: {
      size: {
        default: "h-9",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(
  (
    {
      asChild = false,
      isActive = false,
      tooltip,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { state } = useSidebar()
    
    if (asChild) {
       const child = React.Children.only(children);
       const childWithProps = React.cloneElement(child as React.ReactElement, {
            "data-active": isActive,
            className: cn(sidebarMenuButtonVariants(), state === 'collapsed' && "justify-center", (child as React.ReactElement).props.className, className),
            ...props
       });

       return (
           <Tooltip>
                <TooltipTrigger asChild>
                   {childWithProps}
                 </TooltipTrigger>
                 {tooltip && state === 'collapsed' && (
                    <TooltipContent side="right" align="center">
                        {typeof tooltip === 'string' ? <p>{tooltip}</p> : tooltip}
                    </TooltipContent>
                 )}
           </Tooltip>
       );
    }
    
    const buttonContent = (
       <React.Fragment>
         {React.Children.map(children, (child, index) => {
           if (React.isValidElement(child) && index === 0) { // Icon
             return React.cloneElement(child, { className: 'h-5 w-5 shrink-0' });
           }
           if (typeof child === 'string' || React.isValidElement(child)) { // Label
              return <span className={cn("truncate", state === 'collapsed' && 'hidden')}>{child}</span>
           }
           return child;
         })}
       </React.Fragment>
    );

    const button = (
      <button
        ref={ref}
        data-active={isActive}
        className={cn(sidebarMenuButtonVariants(), state === 'collapsed' && "justify-center", className)}
        {...props}
      >
        {buttonContent}
      </button>
    )

    if (!tooltip || state === 'expanded') {
      return button
    }
    
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right" align="center">
           {typeof tooltip === 'string' ? <p>{tooltip}</p> : tooltip}
        </TooltipContent>
      </Tooltip>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
}
