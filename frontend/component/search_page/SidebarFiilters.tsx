"use client";

import {
  ChevronRight,
  Plus,
  X,
  Filter,
  Tag,
  BookOpen,
  Hash,
  Layers,
  FileText,
  GraduationCap,
} from "lucide-react";
import { JSX, useMemo, useState } from "react";
import { FieldConfig, FieldKey, SideBarFiltersProps } from "./types";



const LEFT_FIELDS: FieldConfig[] = [
  { key: "author", label: "Author", placeholder: "Filter by name...", icon: Tag },
  { key: "genre", label: "Genre", placeholder: "Select category...", icon: BookOpen },
  { key: "isbn", label: "ISBN", placeholder: "Enter code...", icon: Hash },
];

const RIGHT_FIELDS: FieldConfig[] = [
  { key: "format", label: "Format", options: ["Hardcover", "Paperback", "eBook", "Audiobook"], icon: Layers },
  { key: "documentType", label: "Document Type", options: ["Novel", "Guide", "Research", "Atlas", "Reference"], icon: FileText },
  { key: "readingLevel", label: "Reading Level", options: ["Beginner", "Intermediate", "Advanced"], icon: GraduationCap },
];



const SideBarFilters: React.FC<SideBarFiltersProps> = ({
  position = "left",
  className,
  filters,
  onAddFilter = () => {},
  onRemoveFilter = () => {},
  sideExpanded,
  onToggleExpand = () => {},
}) => {
  const fieldConfig = position === "left" ? LEFT_FIELDS : RIGHT_FIELDS;

 // Narrow state types
const [leftFieldText, setLeftFieldText] = useState<Record<"author" | "genre" | "isbn", string>>({
  author: "",
  genre: "",
  isbn: "",
});

const [rightFieldValue, setRightFieldValue] = useState<Record<"format" | "documentType" | "readingLevel", string>>({
  format: "",
  documentType: "",
  readingLevel: "",
});

// Updated handleAddFilter
const handleAddFilter = (key: FieldKey, value?: string) => {
  if (!value || !value.trim()) return;
  onAddFilter(key, value);

  if (position === "left" && key in leftFieldText) {
    setLeftFieldText((state) => ({ ...state, [key]: "" }));
  } else if (position === "right" && key in rightFieldValue) {
    setRightFieldValue((state) => ({ ...state, [key]: "" }));
  }
};

  const fieldCounts = useMemo(() => {
    return fieldConfig.reduce<Record<FieldKey, number>>((acc, field) => {
      acc[field.key] = (filters[field.key] || []).length;
      return acc;
    }, {} as Record<FieldKey, number>);
  }, [filters, fieldConfig]);

  const activeBadges = useMemo(() => {
    const badges: Record<FieldKey, JSX.Element[]> = {} as Record<FieldKey, JSX.Element[]>;
    fieldConfig.forEach(({ key }) => {
      badges[key] = (filters[key] || []).map((value) => (
        <div
          key={value}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-muted border border-border text-foreground"
        >
          <span className="max-w-[150px] truncate">{value}</span>
          <button
            onClick={() => onRemoveFilter(key, value)}
            className="hover:text-destructive transition-colors cursor-pointer"
            aria-label={`Remove filter ${value}`}
          >
            <X size={12} strokeWidth={3} />
          </button>
        </div>
      ));
    });
    return badges;
  }, [filters, fieldConfig, onRemoveFilter]);


  return (
    <aside
      className={`h-full flex bg-sidebar shadow-lg flex-col transition-all duration-300 ease-in-out ${
        sideExpanded ? "w-[30%] min-w-[280px]" : "w-16"
      } ${className}`}
    >
      {/* Header */}
      <button
        onClick={onToggleExpand}
        className="flex h-16 items-center px-4 border-b border-sidebar-border bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors group"
      >
        <Filter
          size={20}
          className="text-sidebar-foreground/70 group-hover:text-sidebar-foreground"
        />
        {sideExpanded && (
          <div className="ml-3 flex w-full items-center justify-between">
            <span className="font-semibold text-xs uppercase tracking-wider text-sidebar-foreground/80">
              Catalog Filters
            </span>
            <ChevronRight
              size={16}
              className={`transition-transform duration-300 lg:hidden block ${
                sideExpanded ? "rotate-180" : ""
              } text-sidebar-foreground/60`}
            />
          </div>
        )}
      </button>

      {/* Filter Fields */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {sideExpanded ? (
          <div className="p-5 space-y-8">
            {fieldConfig.map(
              ({ key, label, placeholder, options, icon: Icon }) => (
                <div key={key} className="space-y-3">
                  {/* Label + Count */}
                  <div className="flex items-center justify-between pb-2 border-b border-sidebar-border">
                    <div className="flex items-center gap-2.5">
                      <Icon size={14} className="text-muted-foreground" />
                      <label className="text-[11px] font-bold uppercase tracking-wide text-sidebar-foreground/70">
                        {label}
                      </label>
                    </div>
                    {fieldCounts[key] > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {fieldCounts[key]}
                      </span>
                    )}
                  </div>

                  {/* Input */}
                  <div className="flex rounded-lg shadow-sm overflow-hidden border border-sidebar-border bg-sidebar focus-within:ring-1 focus-within:ring-ring focus-within:border-transparent transition-all">
                    {position === "left" ? (
                      <input
                         value={leftFieldText[key as keyof typeof leftFieldText] || ""}
                        onChange={(e) =>
                          setLeftFieldText((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          } as typeof prev))
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          handleAddFilter(key,leftFieldText[key as keyof typeof leftFieldText] || "")
                        }
                        placeholder={placeholder}
                        className="flex-1 min-w-0 px-3 py-2 text-sm outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 bg-transparent text-sidebar-foreground placeholder:text-muted-foreground"
                      />
                    ) : (
                      <select
                        value={rightFieldValue[key as keyof typeof rightFieldValue] || ""}
                        onChange={(e) =>
                          setRightFieldValue((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          } as typeof prev))
                        }
                        className="flex-1 px-3 py-2 text-sm outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 cursor-pointer bg-transparent text-sidebar-foreground"
                      >
                        <option
                          value=""
                          className="bg-sidebar text-muted-foreground"
                        >
                          Select Option
                        </option>
                        {options?.map((option) => (
                          <option
                            key={option}
                            value={option}
                            className="bg-sidebar"
                          >
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                    <button
                      onClick={() => {
                        const val =
                          position === "left"
                            ?  (leftFieldText[key as keyof typeof leftFieldText] || "")
                            : (rightFieldValue[key as keyof typeof rightFieldValue] || "");
                        handleAddFilter(key, val);
                      }}
                      className="px-3 flex items-center cursor-pointer justify-center transition-all bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95"
                      aria-label={`Add ${label} filter`}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Active Filters */}
                  <div className="flex flex-wrap gap-2">{activeBadges[key]}</div>
                </div>
              )
            )}
          </div>
        ) : (
          // Collapsed Icons Only
          <div className="flex flex-col items-center py-6 gap-6">
            {fieldConfig.map(({ key, icon: Icon, label }) => (
              <div
                key={key}
                className="relative group flex flex-col items-center cursor-pointer hover:scale-110 transition-transform"
              >
                <Icon
                  size={20}
                  className={`transition-colors ${
                    fieldCounts[key] > 0
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-sidebar-foreground"
                  }`}
                />
                {fieldCounts[key] > 0 && (
                  <div className="absolute -top-2 -right-2 w-4.5 h-4.5 flex items-center justify-center text-[9px] font-bold rounded-full bg-primary text-primary-foreground shadow-sm">
                    {fieldCounts[key]}
                  </div>
                )}
                {/* Tooltip */}
                <div className="absolute left-full ml-3 hidden group-hover:block z-50 animate-in fade-in slide-in-from-left-2">
                  <div className="bg-popover text-popover-foreground text-[11px] font-medium px-2.5 py-1.5 rounded-md shadow-lg border border-border whitespace-nowrap">
                    {label}
                    {fieldCounts[key] > 0 && (
                      <span className="ml-1.5 text-primary font-bold">
                        ({fieldCounts[key]})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {sideExpanded && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-[10px] font-mono text-muted-foreground/60 tracking-wider">
            ARCHIVE SYSTEM v4.2.0
          </div>
        </div>
      )}
    </aside>
  );
};

export default SideBarFilters;