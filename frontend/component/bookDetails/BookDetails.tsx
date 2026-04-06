"use client"

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Calendar, Globe, Hash, MapPin, Star, Tag, User, AlertCircle } from 'lucide-react';

// Type definition for Book
interface Book {
  title: string;
  author: string;
  publisher: string;
  language: string;
  published_year: string;
  categories: string;
  description: string;
  thumbnail: string;
  pages: string;
  link: string;
  isbn: string;
  location: string;
  availability_status: string;
  id: string;
  format: string;
  type: string;
  reading_level: string;
  average_rating: string;
}

// Sample book data (BEMO book example)
const sampleBook: Book = {
  title: "The Architecture of BEMO: Modern Design Patterns",
  author: "Sarah Chen",
  publisher: "TechPress International",
  language: "English",
  published_year: "2024",
  categories: "Technology, Design, Software Architecture",
  description: "A comprehensive guide to building scalable and maintainable applications using BEMO architecture. This book explores modern design patterns, component-driven development, and best practices for enterprise-level applications. Learn how to implement clean, reusable, and efficient code structures that stand the test of time.",
  thumbnail: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=500&fit=crop",
  pages: "456",
  link: "https://example.com/book/bemo-architecture",
  isbn: "978-3-16-148410-0",
  location: "Main Library, Section A-12",
  availability_status: "Available",
  id: "BEMO-2024-001",
  format: "Hardcover, eBook",
  type: "Technical Reference",
  reading_level: "Advanced",
  average_rating: "4.8"
};

// Helper function to check if a value exists and is not empty
const hasValue = (value: any): boolean => {
  return value !== null && value !== undefined && value !== '';
};

// Component to conditionally render a field
const DetailField = ({ label, value, icon: Icon }: { label: string; value: any; icon?: any }) => {
  if (!hasValue(value)) return null;
  
  return (
    <div className="group flex items-start gap-3 py-3 border-b border-border/50 transition-all hover:bg-muted/30 -mx-2 px-2 rounded-lg">
      {Icon && (
        <div className="shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-primary/70" />
        </div>
      )}
      <div className="flex-1">
        <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
          {label}
        </dt>
        <dd className="text-foreground font-medium break-words">
          {typeof value === 'string' && value.includes('http') && (label === 'Link' || label === 'Thumbnail') ? (
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline transition-colors">
              {value.length > 50 ? `${value.substring(0, 50)}...` : value}
            </a>
          ) : (
            value
          )}
        </dd>
      </div>
    </div>
  );
};

// Main Book Detail Page Component
export default function BookDetailPage({ params }: { params: { id: string } }) {
  // In a real app, fetch data based on params.id
  // For demo, we'll use our sample book
  const book = sampleBook;
  
  // If book not found, show 404
  if (!book) {
    notFound();
  }

  // Get availability status styling
  const getAvailabilityStyle = () => {
    const status = book.availability_status?.toLowerCase();
    if (status === 'available') return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
    if (status === 'borrowed') return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
    if (status === 'reserved') return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
    return 'bg-muted text-muted-foreground border-border';
  };

  // Parse categories into array if exists
  const categoriesArray = hasValue(book.categories) 
    ? book.categories.split(',').map(cat => cat.trim())
    : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium">Back to Catalog</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getAvailabilityStyle()}`}>
                {hasValue(book.availability_status) ? book.availability_status : 'Status Unknown'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Left Column - Cover Image & Quick Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {/* Book Cover */}
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-border">
                {hasValue(book.thumbnail) ? (
                  <Image
                    src={book.thumbnail}
                    alt={`Cover of ${book.title}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gradient-to-br from-muted to-muted/50">
                    <BookOpen className="w-16 h-16 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              {hasValue(book.link) && (
                <div className="mt-6 space-y-3">
                  <a
                    href={book.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
                  >
                    <BookOpen className="w-4 h-4" />
                    View Online / Purchase
                  </a>
                </div>
              )}

              {/* Book ID Badge */}
              {hasValue(book.id) && (
                <div className="mt-4 text-center">
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                    <Hash className="w-3 h-3" />
                    Book ID: {book.id}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Book Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Author */}
            <div className="space-y-3">
              {hasValue(book.title) && (
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif tracking-tight text-foreground leading-tight">
                  {book.title}
                </h1>
              )}
              {hasValue(book.author) && (
                <div className="flex items-center gap-2 text-lg text-muted-foreground">
                  <User className="w-5 h-5" />
                  <span>by <span className="font-medium text-foreground">{book.author}</span></span>
                </div>
              )}
            </div>

            {/* Rating */}
            {hasValue(book.average_rating) && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= parseFloat(book.average_rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-muted text-muted'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-foreground">{book.average_rating}</span>
                <span className="text-sm text-muted-foreground">/ 5.0</span>
              </div>
            )}

            {/* Categories / Tags */}
            {categoriesArray.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {categoriesArray.map((category, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium"
                  >
                    <Tag className="w-3 h-3" />
                    {category}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {hasValue(book.description) && (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Description
                </h2>
                <p className="text-muted-foreground leading-relaxed">{book.description}</p>
              </div>
            )}

            {/* Details Grid */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                Book Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1 bg-card rounded-xl border border-border overflow-hidden">
                <DetailField label="Publisher" value={book.publisher} icon={User} />
                <DetailField label="Published Year" value={book.published_year} icon={Calendar} />
                <DetailField label="Language" value={book.language} icon={Globe} />
                <DetailField label="Pages" value={book.pages} icon={BookOpen} />
                <DetailField label="ISBN" value={book.isbn} icon={Hash} />
                <DetailField label="Format" value={book.format} icon={Tag} />
                <DetailField label="Type" value={book.type} icon={Tag} />
                <DetailField label="Reading Level" value={book.reading_level} icon={User} />
                <DetailField label="Location" value={book.location} icon={MapPin} />
              </div>
            </div>

            {/* Additional Info Section for remaining fields */}
            {(hasValue(book.link) || hasValue(book.thumbnail) || hasValue(book.categories)) && (
              <div className="space-y-4 pt-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Additional Information
                </h2>
                <div className="bg-card rounded-xl border border-border p-4 space-y-3">
                  {hasValue(book.link) && (
                    <div className="text-sm">
                      <span className="font-medium text-muted-foreground">External Link:</span>{' '}
                      <a href={book.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                        {book.link}
                      </a>
                    </div>
                  )}
                  {hasValue(book.thumbnail) && (
                    <div className="text-sm">
                      <span className="font-medium text-muted-foreground">Cover URL:</span>{' '}
                      <span className="text-muted-foreground break-all">{book.thumbnail}</span>
                    </div>
                  )}
                  {hasValue(book.categories) && (
                    <div className="text-sm">
                      <span className="font-medium text-muted-foreground">Categories (raw):</span>{' '}
                      <span className="text-muted-foreground">{book.categories}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* No data fallback message - only shown if no fields have values */}
            {!hasValue(book.title) && !hasValue(book.author) && !hasValue(book.description) && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No book information available</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-8">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground">
            © 2024 BEMO Library • All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}

// Optional: Generate static params for dynamic routes
export async function generateStaticParams() {
  // In a real app, fetch book IDs from your data source
  return [
    { id: 'BEMO-2024-001' },
  ];
}