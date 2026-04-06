"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ViewState, UserEntry } from "./BulkAddition/types"
import { DropdownContent } from "./BulkAddition/DropdownContent"
import { FileUploadContent } from "./BulkAddition/FileUploadContent"
import { ManualUploadContent } from "./BulkAddition/ManualUploadContent"
import { UploadingContent } from "./BulkAddition/UploadingContent"
import { registerUsersBulk, registerUsersByFile } from "@/lib/api/users"
import { ApiError } from "@/lib/api/client"
import { validateUser, isUserValid } from "@/lib/validators/userValidator"

const createNewUser = (): UserEntry => ({
  id: Math.random().toString(36).substring(7),
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  role: "READER",
  isQueued: false,
  isEditing: false,
})

interface AddUsersInBulkProps {
  onSuccess?: () => void
}

export default function AddUsersInBulk({ onSuccess }: AddUsersInBulkProps) {
  const [viewState, setViewState] = useState<ViewState>("idle")
  const [users, setUsers] = useState<UserEntry[]>([createNewUser()])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

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

  // Reset validation flag when opening manual upload
  useEffect(() => {
    if (viewState === "manual_upload") {
      setHasAttemptedSubmit(false)
      setFieldErrors({})
    }
  }, [viewState])

  const handleOptionClick = async (
    e: React.MouseEvent,
    type: "file" | "manual"
  ) => {
    e.stopPropagation()

    if (type === "file") {
      setViewState("file_upload")
      return
    }

    if (type === "manual") {
      setUsers([createNewUser()])
      setCurrentIndex(0)
      setViewState("manual_upload")
      return
    }

    setViewState("uploading")

    // --- REMOVE THIS BLOCK LATER (Simulated delay) ---
    // if (timeoutRef.current) clearTimeout(timeoutRef.current)
    // timeoutRef.current = setTimeout(() => {
    //   setViewState("idle")
    // }, 4000)
    // -------------------------------------------------
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setViewState("uploading")
      setUploadError(null)
      setUploadSuccess(null)

      try {
        const file = e.target.files[0]
        const response = await registerUsersByFile(file)

        setUploadSuccess(
          `Successfully added ${response.data.success?.length || 0} users. ${response.data.errors?.length > 0 ? `${response.data.errors.length} failed.` : ""}`
        )

        // Reset after 2 seconds
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
          setViewState("idle")
          onSuccess?.()
        }, 2000)
      } catch (error) {
        const apiError =
          error instanceof ApiError ? error : new Error(String(error))
        setUploadError(apiError.message)

        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
          setViewState("idle")
        }, 3000)
      }
    }
  }

  const handleAddUsersSubmit = async () => {
    const queuedUsers = users.filter((u) => u.isQueued)
    if (queuedUsers.length === 0) return

    setViewState("uploading")
    setUploadError(null)
    setUploadSuccess(null)

    try {
      const payload = queuedUsers.map((u) => ({
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        password: u.password,
        role: u.role,
      }))

      const response = await registerUsersBulk(payload)

      const successCount = response.data.success?.length || 0
      const failureCount = response.data.errors?.length || 0

      setUploadSuccess(
        `Successfully added ${successCount} users. ${failureCount > 0 ? `${failureCount} failed.` : ""}`
      )

      // Reset after 2 seconds
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        setViewState("idle")
        setUsers([createNewUser()])
        setCurrentIndex(0)
        onSuccess?.()
      }, 2000)
    } catch (error) {
      const apiError =
        error instanceof ApiError ? error : new Error(String(error))
      setUploadError(apiError.message)

      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        setViewState("idle")
      }, 3000)
    }
  }

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation()

    // --- REMOVE THIS LINE LATER (Clears the simulated delay) ---
    // if (timeoutRef.current) clearTimeout(timeoutRef.current)
    // ------------------------------------------------------------

    setViewState("idle")
  }

  const currentUser = users[currentIndex] || createNewUser()

  const updateCurrent = (updates: Partial<UserEntry>) => {
    setUsers((prev) => {
      const newUsers = [...prev]
      const updatedUser = { ...newUsers[currentIndex], ...updates }
      newUsers[currentIndex] = updatedUser

      // Only validate if user has attempted to submit
      if (hasAttemptedSubmit) {
        const errors = validateUser(updatedUser)
        setFieldErrors(errors)
      }

      return newUsers
    })
  }

  const isCurrentValid = () => {
    return isUserValid(currentUser)
  }

  const handleDeleteCurrent = () => {
    if (users.length === 1) {
      setUsers([createNewUser()])
    } else {
      const newUsers = users.filter((_, i) => i !== currentIndex)
      setUsers(newUsers)
      if (currentIndex >= newUsers.length) {
        setCurrentIndex(newUsers.length - 1)
      }
    }
  }

  const handleAddToQueue = () => {
    // Mark that user attempted to submit
    setHasAttemptedSubmit(true)

    // Validate current user
    const errors = validateUser(currentUser)
    setFieldErrors(errors)

    if (!isUserValid(currentUser)) return

    setUsers((prev) => {
      const newUsers = [...prev]
      newUsers[currentIndex] = {
        ...newUsers[currentIndex],
        isQueued: true,
        isEditing: false,
      }
      return [...newUsers, createNewUser()]
    })
    setCurrentIndex(users.length)
    setHasAttemptedSubmit(false)
  }

  const isOpen = viewState === "open"
  const isUploading = viewState === "uploading"
  const isFileUpload = viewState === "file_upload"
  const isManualUpload = viewState === "manual_upload"
  const isIdle = viewState === "idle"

  const isFormDisabled = currentUser.isQueued && !currentUser.isEditing
  const canSubmit =
    users.filter((u) => u.isQueued).length > 0 &&
    !users.some((u) => u.isEditing)

  return (
    <div className="relative flex items-center justify-center bg-background p-4">
      <AnimatePresence>
        {(isOpen || isFileUpload || isManualUpload) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/20 backdrop-blur-[2px]"
            onClick={() => {
              if (!isManualUpload) setViewState("idle")
            }}
          />
        )}
      </AnimatePresence>
      <motion.div
        ref={containerRef}
        layout
        animate={{
          // This ensures it never exceeds 95% of the screen width on mobile
          width: isManualUpload
            ? "min(520px, 95vw)"
            : isFileUpload
              ? "min(320px, 90vw)" 
              : isIdle
                ? 140
                : 240,

          height: isManualUpload
            ? "min(600px, 90vh)" 
            : isFileUpload
              ? 320 
              : isIdle
                ? 44
                : 164,
          borderRadius: isOpen || isFileUpload || isManualUpload ? 16 : 12,
          zIndex:
            isOpen || isUploading || isFileUpload || isManualUpload ? 50 : 10,
        }}
        style={{ transformOrigin: "top right" }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className={`absolute top-0 overflow-hidden border border-border bg-card shadow-sm md:top-[-5px] md:right-0 ${viewState === "idle" ? "cursor-pointer transition-colors hover:bg-accent/50" : ""}`}
        onClick={() => viewState === "idle" && setViewState("open")}
      >
        {/* The + / Separator */}
        <motion.div
          animate={{
            top: isOpen ? 36 : 21,
            left: isOpen ? 16 : 24,
            width: isOpen ? 208 : 14,
            height: isOpen ? 1 : 2,
            opacity:
              isUploading || isFileUpload || isManualUpload
                ? 0
                : isOpen
                  ? 0.2
                  : 1,
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
            opacity:
              isUploading || isFileUpload || isManualUpload
                ? 0
                : isOpen
                  ? 0
                  : 1,
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
            opacity:
              isUploading || isFileUpload || isManualUpload
                ? 0
                : isOpen
                  ? 0.7
                  : 1,
          }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          className="absolute origin-top-left text-sm font-medium whitespace-nowrap text-foreground"
        >
          Add users
        </motion.div>

        {/* Dropdown Content */}
        <AnimatePresence>
          {isOpen && <DropdownContent handleOptionClick={handleOptionClick} />}
        </AnimatePresence>

        {/* File Upload State Content */}
        <AnimatePresence>
          {isFileUpload && (
            <FileUploadContent
              setViewState={setViewState}
              handleFileUpload={handleFileUpload}
            />
          )}
        </AnimatePresence>

        {/* Manual Upload State Content */}
        <AnimatePresence>
          {isManualUpload && (
            <ManualUploadContent
              setViewState={setViewState}
              users={users}
              currentIndex={currentIndex}
              setCurrentIndex={setCurrentIndex}
              currentUser={currentUser}
              updateCurrent={updateCurrent}
              isCurrentValid={isCurrentValid}
              handleDeleteCurrent={handleDeleteCurrent}
              handleAddToQueue={handleAddToQueue}
              handleAddUsersSubmit={handleAddUsersSubmit}
              isFormDisabled={isFormDisabled}
              canSubmit={canSubmit}
              fieldErrors={fieldErrors}
              hasAttemptedSubmit={hasAttemptedSubmit}
            />
          )}
        </AnimatePresence>

        {/* Uploading State Content */}
        <AnimatePresence>
          {isUploading && (
            <UploadingContent
              handleCancel={handleCancel}
              error={uploadError}
              success={uploadSuccess}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
