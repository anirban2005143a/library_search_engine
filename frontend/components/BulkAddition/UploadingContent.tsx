import { motion } from "framer-motion"
import { X, CheckCircle, AlertCircle } from "lucide-react"

interface UploadingContentProps {
  handleCancel: (e: React.MouseEvent) => void
  error?: string | null
  success?: string | null
}

export function UploadingContent({
  handleCancel,
  error,
  success,
}: UploadingContentProps) {
  if (error) {
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
        className="absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-3 p-3"
      >
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-sm font-medium text-red-600">Error</span>
        </div>
        <p className="text-center text-xs text-muted-foreground">{error}</p>
        <button
          onClick={handleCancel}
          className="flex w-full items-center justify-center gap-1.5 rounded-md px-1 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-slate-200 hover:text-foreground dark:hover:bg-slate-800"
        >
          <X className="h-3 w-3" />
          Close
        </button>
      </motion.div>
    )
  }

  if (success) {
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
        className="absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-3 p-3"
      >
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-emerald-500" />
          <span className="text-sm font-medium text-emerald-600">Success</span>
        </div>
        <p className="text-center text-xs text-muted-foreground">{success}</p>
      </motion.div>
    )
  }

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

      <button
        onClick={handleCancel}
        className="flex w-full items-center justify-center gap-1.5 rounded-md px-1 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-red-600 hover:text-foreground"
      >
        <X className="h-3 w-3" />
        Cancel
      </button>
    </motion.div>
  )
}
