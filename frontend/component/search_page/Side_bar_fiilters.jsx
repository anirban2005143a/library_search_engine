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
import { useMemo, useState } from "react";

const LEFT_FIELDS = [
  { key: "author", label: "Author", placeholder: "Filter by name...", icon: Tag },
  { key: "genre", label: "Genre", placeholder: "Select category...", icon: BookOpen },
  { key: "isbn", label: "ISBN", placeholder: "Enter code...", icon: Hash },
];

const RIGHT_FIELDS = [
  { key: "format", label: "Format", options: ["Hardcover", "Paperback", "eBook", "Audiobook"], icon: Layers },
  { key: "documentType", label: "Document Type", options: ["Novel", "Guide", "Research", "Atlas", "Reference"], icon: FileText },
  { key: "readingLevel", label: "Reading Level", options: ["Beginner", "Intermediate", "Advanced"], icon: GraduationCap },
];

const SideBarFilters = ({
  position = "left",
  filters,
  onAddFilter,
  onRemoveFilter,
  sideExpanded,
  onToggleExpand,
}) => {
  const fieldConfig = position === "left" ? LEFT_FIELDS : RIGHT_FIELDS;
  const [leftFieldText, setLeftFieldText] = useState({ author: "", genre: "", isbn: "" });
  const [rightFieldValue, setRightFieldValue] = useState({ format: "", documentType: "", readingLevel: "" });

  // Memoized field counts for performance
  const fieldCounts = useMemo(() => {
    return fieldConfig.reduce((acc, field) => {
      acc[field.key] = (filters[field.key] || []).length;
      return acc;
    }, {});
  }, [filters, fieldConfig]);

  // Memoized rendering of active filter badges
  const activeBadges = useMemo(() => {
    const badges = {};
    fieldConfig.forEach(({ key }) => {
      badges[key] = (filters[key] || []).map((value) => (
        <div
          key={value}
          className="flex items-center gap-1 px-2 py-1 rounded text-sm"
          style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
        >
          <span>{value}</span>
          <button
            onClick={() => onRemoveFilter(key, value)}
            className="hover:text-red-600 transition-colors"
          >
            <X size={12} strokeWidth={3} />
          </button>
        </div>
      ));
    });
    return badges;
  }, [filters, fieldConfig, onRemoveFilter]);

  const handleAddFilter = (key, value) => {
    if (!value || !value.trim()) return;
    onAddFilter(key, value);
    if (position === "left") setLeftFieldText((state) => ({ ...state, [key]: "" }));
    else setRightFieldValue((state) => ({ ...state, [key]: "" }));
  };

  return (
    <aside
      className={`h-full bg-card shadow-lg flex flex-col transition-width duration-300 ease-in-out ${
        sideExpanded ? "w-80" : "w-16"
      }`}
      style={{ borderColor: "var(--sidebar-border)", color: "var(--sidebar-foreground)" }}
    >
      {/* Header */}
      <button
        onClick={onToggleExpand}
        className="flex h-16 items-center px-4 border-b transition-colors"
        style={{ borderColor: "var(--sidebar-border)", background: "var(--sidebar)", color: "var(--sidebar-foreground)" }}
      >
        <Filter size={20} className="text-gray-600" />
        {sideExpanded && (
          <div className="ml-3 flex w-full items-center justify-between">
            <span className="font-semibold text-xs uppercase tracking-wider text-gray-800">
              Catalog Filters
            </span>
            <ChevronRight
              size={16}
              className={`transition-transform ${sideExpanded ? "rotate-180" : ""} text-gray-600`}
            />
          </div>
        )}
      </button>

      {/* Filter Fields */}
      <div className="flex-1 overflow-y-auto">
        {sideExpanded ? (
          <div className="p-5 space-y-8">
            {fieldConfig.map(({ key, label, placeholder, options, icon: Icon }) => (
              <div key={key} className="space-y-3">
                {/* Label + Count */}
                <div className="flex items-center justify-between pb-1 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
                  <div className="flex items-center gap-2">
                    <Icon size={14} className="text-muted-foreground" />
                    <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--sidebar-foreground)" }}>
                      {label}
                    </label>
                  </div>
                  {fieldCounts[key] > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                      {fieldCounts[key]}
                    </span>
                  )}
                </div>

                {/* Input */}
                <div className="flex rounded shadow-sm overflow-hidden" style={{ borderColor: "var(--sidebar-border)", background: "var(--sidebar)" }}>
                  {position === "left" ? (
                    <input
                      value={leftFieldText[key] || ""}
                      onChange={(e) => setLeftFieldText((prev) => ({ ...prev, [key]: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && handleAddFilter(key, leftFieldText[key])}
                      placeholder={placeholder}
                      className="flex-1 px-3 py-2 text-sm outline-none"
                      style={{ color: "var(--sidebar-foreground)", background: "transparent" }}
                    />
                  ) : (
                    <select
                      value={rightFieldValue[key] || ""}
                      onChange={(e) => setRightFieldValue((prev) => ({ ...prev, [key]: e.target.value }))}
                      className="flex-1 px-3 py-2 text-sm outline-none cursor-pointer"
                      style={{ color: "var(--sidebar-foreground)", background: "transparent" }}
                    >
                      <option value="">Select Option</option>
                      {options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    onClick={() => {
                      const val = position === "left" ? leftFieldText[key] : rightFieldValue[key];
                      handleAddFilter(key, val);
                    }}
                    className="px-3 flex items-center justify-center transition-colors"
                    style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Active Filters */}
                <div className="flex flex-wrap gap-2" style={{ color: "var(--sidebar-foreground)" }}>{activeBadges[key]}</div>
              </div>
            ))}
          </div>
        ) : (
          // Collapsed Icons Only
          <div className="flex flex-col items-center py-6 gap-6">
            {fieldConfig.map(({ key, icon: Icon, label }) => (
              <div key={key} className="relative group flex flex-col items-center">
                <Icon
                  size={20}
                  className="transition-colors"
                  style={{ color: fieldCounts[key] > 0 ? "var(--primary)" : "var(--muted-foreground)" }}
                />
                {fieldCounts[key] > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-[8px] font-bold rounded-full"
                    style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                  >
                    {fieldCounts[key]}
                  </div>
                )}
                <div className="absolute left-full ml-2 hidden group-hover:block z-50">
                  <div className="bg-gray-900 text-white text-[10px] px-2 py-1 rounded uppercase tracking-wide whitespace-nowrap">
                    {label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {sideExpanded && (
        <div className="p-4 border-t border-gray-200 text-gray-400 text-[10px] font-mono">
          ARCHIVE SYSTEM v4.2.0
        </div>
      )}
    </aside>
  );
};

export default SideBarFilters;