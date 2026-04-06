"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Pencil, X, UploadCloud } from "lucide-react"

type ViewState = "idle" | "open" | "uploading" | "file_upload"

export default function AddUsersButton() {
  const [viewState, setViewState] = useState<ViewState>("idle")
  const containerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        if (viewState === "open" || viewState === "file_upload") {
          setViewState("idle")
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [viewState])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleOptionClick = async (
    e: React.MouseEvent,
    type: "file" | "manual"
  ) => {
    e.stopPropagation()

    if (type === "file") {
      setViewState("file_upload")
      return
    }

    setViewState("uploading")

    // --- REMOVE THIS BLOCK LATER (Simulated delay) ---
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setViewState("idle")
    }, 4000)
    // -------------------------------------------------

    // --- ADD YOUR BACKEND LOGIC HERE ---
    /*
    try {
      // Example fetch request:
      // const response = await fetch('/api/users/add', { method: 'POST', body: yourData });
      // if (response.ok) {
      //   // On success, go back to the initial state
      //   setViewState('idle'); 
      // }
    } catch (error) {
      // Handle error
      // setViewState('idle'); 
    }
    */
    // -----------------------------------
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setViewState("uploading")

      // --- REMOVE THIS BLOCK LATER (Simulated delay) ---
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        setViewState("idle")
      }, 4000)
      // -------------------------------------------------

      // --- ADD YOUR FILE UPLOAD LOGIC HERE ---
      // const file = e.target.files[0]
      // const formData = new FormData()
      // formData.append('file', file)
      // fetch('/api/upload', { method: 'POST', body: formData })
      // ...
    }
  }

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation()

    // --- REMOVE THIS LINE LATER (Clears the simulated delay) ---
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    // ------------------------------------------------------------

    setViewState("idle")

    // --- ADD YOUR CANCEL LOGIC HERE ---
    // e.g., abort the fetch request if necessary using an AbortController
    // ----------------------------------
  }

  const isOpen = viewState === "open"
  const isUploading = viewState === "uploading"
  const isFileUpload = viewState === "file_upload"

  return (
    <div className="relative flex items-center justify-center bg-background p-4">
      <AnimatePresence>
        {(isOpen || isFileUpload) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/20 backdrop-blur-[2px]"
            onClick={() => setViewState("idle")}
          />
        )}
      </AnimatePresence>
      <motion.div
        ref={containerRef}
        animate={{
          width: isFileUpload ? 320 : isOpen ? 240 : isUploading ? 160 : 140,
          height: isFileUpload ? 320 : isOpen ? 164 : isUploading ? 88 : 44,
          borderRadius: isOpen || isFileUpload ? 16 : 12,
          zIndex: isOpen || isUploading || isFileUpload ? 50 : 10,
        }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className={`absolute top-0 right-0 overflow-hidden border border-border bg-card shadow-sm ${viewState === "idle" ? "cursor-pointer transition-colors hover:bg-accent/50" : ""}`}
        onClick={() => viewState === "idle" && setViewState("open")}
      >
        {/* The + / Separator */}
        <motion.div
          animate={{
            top: isOpen ? 36 : 21,
            left: isOpen ? 16 : 24,
            width: isOpen ? 208 : 14,
            height: isOpen ? 1 : 2,
            opacity: isUploading || isFileUpload ? 0 : isOpen ? 0.2 : 1,
          }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          className="absolute origin-left rounded-full bg-foreground"
        />
        <motion.div
          animate={{
            top: isOpen ? 36 : 14,
            left: isOpen ? 16 : 30,
            width: 2,
            height: isOpen ? 0 : 16,
            opacity: isUploading || isFileUpload ? 0 : isOpen ? 0 : 1,
          }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          className="absolute origin-top rounded-full bg-foreground"
        />

        {/* Text */}
        <motion.div
          animate={{
            top: isOpen ? 12 : 12,
            left: isOpen ? 16 : 46,
            scale: isOpen ? 0.85 : 1,
            opacity: isUploading || isFileUpload ? 0 : isOpen ? 0.7 : 1,
          }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          className="absolute origin-top-left text-sm font-medium whitespace-nowrap text-foreground"
        >
          Add users
        </motion.div>

        {/* Dropdown Content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{
                opacity: 0,
                y: 10,
                filter: "blur(4px)",
                transition: { duration: 0.2 },
              }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="absolute top-[44px] left-0 flex w-full flex-col gap-3 p-4 pt-2"
            >
              <button
                className="group flex items-center gap-3 rounded-lg border border-border bg-background p-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                onClick={(e) => handleOptionClick(e, "file")}
              >
                <div className="rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] font-bold transition-colors group-hover:bg-background">
                  .xlsx
                </div>
                Upload file
              </button>
              <button
                className="group flex items-center gap-3 rounded-lg border border-border bg-background p-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                onClick={(e) => handleOptionClick(e, "manual")}
              >
                <div className="rounded border border-border bg-muted/50 p-1 transition-colors group-hover:bg-background">
                  <Pencil className="h-3.5 w-4.5" />
                </div>
                Add manually
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* File Upload State Content */}
        <AnimatePresence>
          {isFileUpload && (
            <motion.div
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{
                opacity: 0,
                filter: "blur(4px)",
                transition: { duration: 0.2 },
              }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="absolute inset-0 flex h-full w-full flex-col p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Upload file
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setViewState("open")
                  }}
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div
                className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 transition-colors hover:bg-muted/50"
                onClick={(e) => {
                  e.stopPropagation()
                  document.getElementById("file-upload")?.click()
                }}
              >
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".xlsx"
                  onChange={handleFileUpload}
                />
                <UploadCloud className="mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">
                  Click or drag and drop
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  .xlsx files only
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Uploading State Content */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{
                opacity: 0,
                filter: "blur(4px)",
                transition: { duration: 0.2 },
              }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-2 p-3"
            >
              <div className="flex items-center text-sm font-medium text-foreground">
                Adding Users
                <span className="ml-0.5 flex w-4">
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      times: [0, 0.5, 1],
                    }}
                  >
                    .
                  </motion.span>
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      delay: 0.2,
                      times: [0, 0.5, 1],
                    }}
                  >
                    .
                  </motion.span>
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      delay: 0.4,
                      times: [0, 0.5, 1],
                    }}
                  >
                    .
                  </motion.span>
                </span>
              </div>

              {/* change below button to Button from ./ui/shadcn with variant='destructive' */}
              <button
                onClick={handleCancel}
                className="flex w-full items-center justify-center gap-1.5 rounded-md px-1 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-red-600 hover:text-foreground"
              >
                <X className="h-3 w-3" />
                Cancel
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
