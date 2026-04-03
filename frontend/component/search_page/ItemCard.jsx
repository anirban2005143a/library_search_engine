// "use client";

// import {
//   Star,
//   Calendar,
//   Globe,
//   Hash,
//   User,
//   Building2,
//   ExternalLink,
//   Tag,
// } from "lucide-react";
// import { motion } from "framer-motion";

// const ItemCard = ({ book }) => {
//   return (
//     <article className="group flex flex-col overflow-hidden border-b border-border bg-background transition-colors hover:bg-muted/30 sm:flex-row sm:py-6 sm:px-4">
//       {/* Book Cover - Fixed aspect ratio for a library catalog look */}
//       <div className="relative mx-auto mt-4 w-32 shrink-0 sm:mx-0 sm:mt-0 sm:w-36">
//         <img
//           src={book.thumbnail}
//           alt={book.title}
//           className="aspect-[2/3] w-full object-cover shadow-sm ring-1 ring-border"
//         />
//         {book.documentType === "E-Book" && (
//           <div className="absolute top-0 right-0 bg-foreground px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-background">
//             Digital
//           </div>
//         )}
//       </div>

//       {/* Main Content Area */}
//       <div className="flex flex-1 flex-col p-6">
//         {/* Header Section */}
//         <div className="flex items-start justify-between gap-4">
//           <div className="flex-1 space-y-2">
//             <h2 className="text-xl font-semibold text-foreground leading-tight">
//               {book.title}
//             </h2>
//             <div className="flex items-center gap-2 text-sm">
//               <span className="text-muted-foreground">by</span>
//               <button className="text-foreground/80 hover:text-primary font-medium transition-colors">
//                 {book.author}
//               </button>
//             </div>
//           </div>

//           {/* Rating Badge */}
//           <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/30 border border-border rounded-md">
//             <Star size={14} className="fill-foreground/70 text-foreground/70" />
//             <span className="text-sm font-semibold text-foreground">
//               {book.rating.toFixed(1)}
//             </span>
//           </div>
//         </div>

//         {/* Metadata Grid */}
//         <div className="mt-6 grid grid-cols-2 xl:grid-cols-4 gap-5">
//           <MetadataItem
//             label="Published"
//             value={book.publishedYear}
//             icon={<Calendar size={14} />}
//           />
//           <MetadataItem
//             label="Publisher"
//             value={book.publisher}
//             icon={<Building2 size={14} />}
//             truncate
//           />
//           <MetadataItem
//             label="Language"
//             value={book.language}
//             icon={<Globe size={14} />}
//           />
//           <div className="col-span-2 md:col-span-1">
//             <MetadataItem
//               label="ISBN"
//               value={book.isbn}
//               icon={<Hash size={14} />}
//               monospace
//             />
//           </div>

//           {/* Categories spanning full width */}
//           <div className="col-span-2 xl:col-span-4">
//             <div className="flex items-start gap-4">
//               <div className="flex items-center gap-1.5 min-w-[80px]">
//                 <Tag size={14} className="text-muted-foreground" />
//                 <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
//                   Categories
//                 </label>
//               </div>
//               <div className="flex flex-wrap gap-2 flex-1">
//                 {book.categories.map((category) => (
//                   <span
//                     key={category}
//                     className="px-2.5 py-1 text-xs bg-muted/30 border border-border rounded-md text-foreground/80"
//                   >
//                     {category}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer Section */}
//         <div className="mt-6 pt-6 border-t border-border">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             {/* Left side - Tags & Categories */}
//             <div className="flex flex-wrap items-center gap-3">
//               {/* Reading Level Badge */}
//               <span className="px-2.5 py-1 text-xs font-medium bg-muted/30 border border-border rounded-md text-foreground/80">
//                 {book.readingLevel}
//               </span>

//               {/* Separator */}
//               <span className="hidden sm:block text-border">|</span>

//               {/* Categories */}
//               <div className="flex flex-wrap items-center gap-2">
//                 <span className="text-xs text-muted-foreground">
//                   Categories:
//                 </span>
//                 {book.categories.slice(0, 3).map((category, index) => (
//                   <span
//                     key={category}
//                     className="text-xs text-foreground/70 hover:text-foreground transition-colors"
//                   >
//                     {category}
//                     {index < Math.min(2, book.categories.length - 1) ? "," : ""}
//                   </span>
//                 ))}
//               </div>
//             </div>

//             {/* Action Button */}
//             <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary border border-primary/20 rounded-md hover:border-primary/40 hover:bg-primary/5 transition-all group cursor-pointer">
//               <span>Details</span>
//               <ExternalLink
//                 size={14}
//                 className="transition-transform group-hover:translate-x-0.5"
//               />
//             </button>
//           </div>
//         </div>
//       </div>
//     </article>
//   );
// };

// export default ItemCard;

// /* Meta Component */
// const MetadataItem = ({
//   label,
//   value,
//   icon,
//   truncate = false,
//   monospace = false,
// }) => (
//   <div className="space-y-1.5">
//     <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
//       {icon}
//       <span>{label}</span>
//     </div>
//     <p
//       className={`text-sm text-foreground/90 ${truncate ? "truncate" : ""} ${monospace ? "font-mono text-xs" : ""}`}
//     >
//       {value}
//     </p>
//   </div>
// );

"use client";

import {
  Star,
  Calendar,
  Globe,
  Hash,
  User,
  Building2,
  ExternalLink,
  Tag,
  GraduationCap,
} from "lucide-react";
import { motion } from "framer-motion";

const ItemCard = ({ book }) => {
  return (
    <article className="group flex flex-col overflow-hidden border-b border-border bg-background transition-colors hover:bg-muted/30 sm:flex-row sm:p-6">
      {/* Book Cover */}
      <div className="relative mx-auto mt-4 w-32 shrink-0 sm:mx-0 sm:mt-0 sm:w-36">
        <img
          src={book.thumbnail}
          alt={book.title}
          className="aspect-[2/3] w-full object-cover shadow-sm ring-1 ring-border"
        />
        {book.documentType === "E-Book" && (
          <div className="absolute top-0 right-0 bg-foreground px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-background">
            Digital
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col p-5 sm:p-0 sm:pl-6">
        {/* Header with Title and Reading Level */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground leading-tight">
              {book.title}
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-sm text-muted-foreground">by</span>
              <button className="text-sm text-foreground/80 hover:text-primary font-medium transition-colors">
                {book.author}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Reading Level */}
            <span className="px-2 py-0.5 text-xs font-medium text-primary bg-primary/10 rounded">
              {book.readingLevel}
            </span>

            {/* Rating */}
            <div className="flex items-center gap-1">
              <Star size={14} className="fill-primary/80 text-primary/80" />
              <span className="text-sm font-semibold text-foreground">
                {book.rating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
          <MetadataItem
            label="Published"
            value={book.publishedYear}
            icon={<Calendar size={12} />}
          />
          <MetadataItem
            label="Publisher"
            value={book.publisher}
            icon={<Building2 size={12} />}
            truncate
          />
          <MetadataItem
            label="Language"
            value={book.language}
            icon={<Globe size={12} />}
          />
          <MetadataItem
            label="ISBN"
            value={book.isbn}
            icon={<Hash size={12} />}
            monospace
          />
        </div>

        {/* Categories Section */}
        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
          <div className="flex items-center gap-1.5">
            <Tag size={12} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Categories:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {book.categories.map((category, index) => (
              <span
                key={category}
                className="text-xs text-foreground/70 hover:text-foreground transition-colors"
              >
                {category}
                {index < book.categories.length - 1 ? "," : ""}
              </span>
            ))}
          </div>
        </div>

        {/* Footer with Action */}
        <div className="mt-5 pt-4 border-t border-border text-end">
          <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors">
            <span>View Details</span>
            <ExternalLink size={14} />
          </button>
        </div>
      </div>
    </article>
  );
};

export default ItemCard;

/* Metadata Item Component */
const MetadataItem = ({
  label,
  value,
  icon,
  truncate = false,
  monospace = false,
}) => (
  <div>
    <div className="flex items-center gap-1.5 mb-1">
      {icon}
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
    <p
      className={`text-sm text-foreground/90 ${truncate ? "truncate" : ""} ${monospace ? "font-mono text-xs" : ""}`}
    >
      {value}
    </p>
  </div>
);
