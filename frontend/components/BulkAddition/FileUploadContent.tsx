import { motion } from "framer-motion"
import { X, UploadCloud } from "lucide-react"
import { ViewState } from "./types"

interface FileUploadContentProps {
  setViewState: (state: ViewState) => void
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function FileUploadContent({ setViewState, handleFileUpload }: FileUploadContentProps) {
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
      className="absolute inset-0 flex h-full w-full flex-col p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Upload file</span>
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
        <p className="text-sm font-medium text-foreground">Click or drag and drop</p>
        <p className="mt-1 text-xs text-muted-foreground">.xlsx files only</p>
      </div>
    </motion.div>
  )
}
