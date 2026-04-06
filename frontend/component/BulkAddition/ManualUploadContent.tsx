import { motion } from "framer-motion"
import { X, ChevronDown, ChevronLeft, ChevronRight, Trash2 } from "lucide-react"
import { ViewState, UserEntry, Role } from "./types"

interface ManualUploadContentProps {
  setViewState: (state: ViewState) => void
  users: UserEntry[]
  currentIndex: number
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>
  currentUser: UserEntry
  updateCurrent: (updates: Partial<UserEntry>) => void
  isCurrentValid: () => boolean
  handleDeleteCurrent: () => void
  handleAddToQueue: () => void
  handleAddUsersSubmit: () => void
  isFormDisabled: boolean
  canSubmit: boolean
  fieldErrors?: Record<string, string>
  hasAttemptedSubmit?: boolean
}

export function ManualUploadContent({
  setViewState,
  users,
  currentIndex,
  setCurrentIndex,
  currentUser,
  updateCurrent,
  isCurrentValid,
  handleDeleteCurrent,
  handleAddToQueue,
  handleAddUsersSubmit,
  isFormDisabled,
  canSubmit,
  fieldErrors = {},
  hasAttemptedSubmit = false,
}: ManualUploadContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(4px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{
        opacity: 0,
        filter: "blur(4px)",
        transition: { duration: 0.2 },
      }}
      transition={{ delay: 0.2, duration: 0.3 }}
      className="absolute inset-0 flex h-full w-full flex-col p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="text-base font-medium text-foreground">Add Users</span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setViewState("open")
          }}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-2">
        <div className="flex-col gap-4 md:flex">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-medium text-foreground">
              First Name (Required)
            </label>
            <input
              type="text"
              className={`w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 ${
                hasAttemptedSubmit && fieldErrors.firstName
                  ? "border-red-500 focus:ring-0"
                  : "border-border focus:ring-2 focus:ring-ring"
              }`}
              value={currentUser.firstName}
              onChange={(e) => updateCurrent({ firstName: e.target.value })}
              disabled={isFormDisabled}
            />
            {hasAttemptedSubmit && fieldErrors.firstName && (
              <p className="mt-1 text-xs text-red-500">
                {fieldErrors.firstName}
              </p>
            )}
          </div>
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-medium text-foreground">
              Last Name (Required)
            </label>
            <input
              type="text"
              className={`w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 ${
                hasAttemptedSubmit && fieldErrors.lastName
                  ? "border-red-500 focus:ring-0"
                  : "border-border focus:ring-2 focus:ring-ring"
              }`}
              value={currentUser.lastName}
              onChange={(e) => updateCurrent({ lastName: e.target.value })}
              disabled={isFormDisabled}
            />
            {hasAttemptedSubmit && fieldErrors.lastName && (
              <p className="mt-1 text-xs text-red-500">
                {fieldErrors.lastName}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-foreground">
            Email (Required)
          </label>
          <input
            type="email"
            className={`w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 ${
              hasAttemptedSubmit && fieldErrors.email
                ? "border-red-500 focus:ring-0"
                : "border-border focus:ring-2 focus:ring-ring"
            }`}
            value={currentUser.email}
            onChange={(e) => updateCurrent({ email: e.target.value })}
            disabled={isFormDisabled}
          />
          {hasAttemptedSubmit && fieldErrors.email && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-foreground">
            Password (Required)
          </label>
          <input
            type="password"
            className={`w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 ${
              hasAttemptedSubmit && fieldErrors.password
                ? "border-red-500 focus:ring-0"
                : "border-border focus:ring-2 focus:ring-ring"
            }`}
            value={currentUser.password}
            onChange={(e) => updateCurrent({ password: e.target.value })}
            disabled={isFormDisabled}
          />
          {hasAttemptedSubmit && fieldErrors.password && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-foreground">
            Role
          </label>
          <div className="relative">
            <select
              className={`w-full appearance-none rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:outline-none disabled:opacity-50 ${
                hasAttemptedSubmit && fieldErrors.role
                  ? "border-red-500 focus:ring-0"
                  : "border-border focus:ring-2 focus:ring-ring"
              }`}
              value={currentUser.role}
              onChange={(e) => updateCurrent({ role: e.target.value as Role })}
              disabled={isFormDisabled}
            >
              <option value="READER">READER (default)</option>
              <option value="ADMIN">ADMIN</option>
              <option value="ROOT_ADMIN">ROOT_ADMIN</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
          {hasAttemptedSubmit && fieldErrors.role && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.role}</p>
          )}
        </div>

        <div className="mt-2 flex items-center gap-3">
          {currentUser.isQueued && (
            <>
              <button
                className="rounded-md border border-border bg-background px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
                onClick={() => updateCurrent({ isEditing: true })}
                disabled={currentUser.isEditing}
              >
                EDIT
              </button>
              <button
                className="rounded-md border border-border bg-background px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
                onClick={() => updateCurrent({ isEditing: false })}
                disabled={!currentUser.isEditing || !isCurrentValid()}
              >
                SAVE
              </button>
            </>
          )}
          <button
            className="flex items-center justify-center rounded-md border border-border bg-background p-2 text-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
            onClick={handleDeleteCurrent}
            disabled={
              users.length === 1 &&
              !currentUser.isQueued &&
              !currentUser.firstName &&
              !currentUser.lastName &&
              !currentUser.email &&
              !currentUser.password
            }
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <div className="flex-1" />
          {!currentUser.isQueued && (
            <button
              className="rounded-md border border-border bg-background px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
              onClick={handleAddToQueue}
            >
              ADD TO QUEUE
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <div className="flex items-center gap-3">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-accent disabled:opacity-50"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-accent disabled:opacity-50"
            onClick={() =>
              setCurrentIndex((i) => Math.min(users.length - 1, i + 1))
            }
            disabled={currentIndex === users.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="ml-2 text-xs font-medium text-muted-foreground">
            User {currentIndex + 1} of {users.length}
          </span>
        </div>

        <button
          className="rounded-md border border-border bg-background px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
          onClick={handleAddUsersSubmit}
          disabled={!canSubmit}
        >
          ADD USERS
        </button>
      </div>
    </motion.div>
  )
}
