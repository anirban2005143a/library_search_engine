// types.ts
export interface Book {
  id: number;
  title: string;
  thumbnail: string;
  rating: number;
  readingLevel: string;
  author: string;
  publisher: string;
  publishedYear: number;
  language: string;
  categories: string[];
  genre: string;
  isbn: string;
  format: string;
  documentType: string;
}

export interface FilterState {
  author?: string[];
  genre?: string[];
  isbn?: string[];
  format?: string[];
  documentType?: string[];
  readingLevel?: string[];
}


export type FieldKey =
  | "author"
  | "genre"
  | "isbn"
  | "format"
  | "documentType"
  | "readingLevel";

export interface FieldConfig {
  key: FieldKey;
  label: string;
  placeholder?: string;
  options?: string[];
  icon: React.ComponentType<{ size?: number; className?: string }>;
}
export interface SideBarFiltersProps {
  position?: "left" | "right";
  className?: string;
  filters: Partial<Record<FieldKey, string[]>>;
  onAddFilter?: (key: FieldKey, value: string) => void;
  onRemoveFilter?: (key: FieldKey, value: string) => void;
  sideExpanded: boolean;
  onToggleExpand?: () => void;
}

export type ItemCardProps = {
  book: Book;
};

export type MetadataItemProps = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  truncate?: boolean;
  monospace?: boolean;
};