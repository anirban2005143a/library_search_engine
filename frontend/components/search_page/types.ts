export type MetadataItemProps = {
  label: string;
  value: string | number | null | undefined;
  icon: React.ReactNode;
  truncate?: boolean;
  monospace?: boolean;
};