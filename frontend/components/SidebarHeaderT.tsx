import { useSidebar } from "./ui/sidebar"
import Logo from "./Logo"
const SidebarHeaderT = () => {
  // 1. Grab the current state of the sidebar (expanded or collapsed)
  const { state, toggleSidebar } = useSidebar()
  const isCollapsed = state === "collapsed"

  const brand = {
    name: "LMS",
    slogan: "",
    // slogan: "Aaiye na humra bihar me",
  }

  // --- CONDITION 1: SIDEBAR IS COLLAPSED ---
  if (isCollapsed) {
    return (
      <div
        onClick={toggleSidebar}
        className="cursor-pointer" // Good practice to show it's clickable
        role="button"
        tabIndex={0}
      >
        <Logo isCollapsed={isCollapsed} />
      </div>
    )
  }

  // --- CONDITION 2: SIDEBAR IS EXPANDED ---
  return (
    <div className="mt-auto w-full p-1 border border-sidebar-border bg-sidebar rounded-xl">
      {/* <motion.div
        layout
        className="flex w-full cursor-pointer flex-col overflow-hidden border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
        initial={false}
        animate={{
          borderRadius: isOpen ? "24px" : "32px",
        }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      > */}
      {/* Top Section */}
      {/* <motion.div
          layout="position"
          className="flex h-16 shrink-0 items-center justify-between p-2"
        > */}
      <div className="flex items-center gap-4">
        <div
          onClick={toggleSidebar}
          className="cursor-pointer"
          role="button"
          tabIndex={0}
        >
          <Logo isCollapsed={isCollapsed} />
        </div>
        <div className="flex items-center">
          <span className="text-lg leading-none font-medium">{brand.name}</span>
          {!brand.slogan?.length && (
            <span className="mt-1.5 text-xs text-muted-foreground">
              {brand.slogan}
            </span>
          )}
        </div>
      </div>

      {/* </motion.div> */}

      {/* Expanded Section */}
      {/* <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.6 }}
              className="px-3"
            >
            <p> a component for the expanded state like sidebar profile </p>
            </motion.div>
          )}
        </AnimatePresence> */}
      {/* </motion.div> */}
    </div>
  )
}

export default SidebarHeaderT
