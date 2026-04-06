import { motion } from "framer-motion"
import { Pencil } from "lucide-react"

interface DropdownContentProps {
  handleOptionClick: (e: React.MouseEvent, type: 'file' | 'manual') => void
}

export function DropdownContent({ handleOptionClick }: DropdownContentProps) {
  return (
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
        onClick={(e) => handleOptionClick(e, 'file')}
      >
        <div className="rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] font-bold transition-colors group-hover:bg-background">
          .xlsx
        </div>
        Upload file
      </button>
      <button
        className="group flex items-center gap-3 rounded-lg border border-border bg-background p-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        onClick={(e) => handleOptionClick(e, 'manual')}
      >
        <div className="rounded border border-border bg-muted/50 p-1 transition-colors group-hover:bg-background">
          <Pencil className="h-3.5 w-3.5" />
        </div>
        Add manually
      </button>
    </motion.div>
  )
};
