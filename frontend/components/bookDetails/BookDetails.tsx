"use client"

import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Calendar, Globe, Hash, MapPin, Star, Tag, User } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import axios from 'axios';
import Loader from '../Loader';

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

// Sample book data
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

const hasValue = (value: any): boolean => {
  return value !== null && value !== undefined && value !== '';
};

const DetailField = ({ label, value, icon: Icon }: { label: string; value: any; icon?: any }) => {
  if (!hasValue(value)) return null;
  
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/40 last:border-0">
      {Icon && (
        <div className="shrink-0 mt-0.5">
          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <dt className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
          {label}
        </dt>
        <dd className="text-sm text-foreground break-words">
          {typeof value === 'string' && value.includes('http') && (label === 'Link' || label === 'Thumbnail') ? (
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline transition-colors break-all">
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

const BookDetailPage = memo(( ) => {
  const [book, setbook] = useState<any>(null)
  const [isLoading, setisLoading] = useState(true)
  const params = useParams()
  const rawId = params?.id;
  
  const getBookById = async(bookId:string)=> {
    setisLoading(true)
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/books/${bookId}`);
    console.log(response)
    setbook(response?.data?.book)

  } catch (error:any) {
    console.log(error.response?.data)
    console.log('Error fetching book:', error.response?.data?.message || error.message);
    throw error; // Rethrow to handle it outside if needed
  }finally{
    setisLoading(false)
  }
}

  const getAvailabilityStyle = () => {
    const status = book?.availability_status?.toLowerCase();
    if (status === 'available') return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
    if (status === 'borrowed') return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
    if (status === 'reserved') return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
    return 'bg-muted text-muted-foreground border-border';
  };

  const categoriesArray = hasValue(book?.categories) 
    ? book?.categories.split(',').map((cat:string) => cat.trim())
    : []; 

  useEffect(() => {
    if (!rawId || Array.isArray(rawId)) return;
    getBookById(rawId)
  }, [])
  
  console.log(rawId)
    
  if(isLoading){
      return (<div className=" w-full flex justify-center">
        <Loader text="Loading Books ..."/>
      </div>)
    }

  if (!book) return (
  <div className="min-h-screen bg-background">
    
    <main className="container max-w-5xl mx-auto px-4 py-16">
      <div className="flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-muted/30 flex items-center justify-center">
          <BookOpen className="w-12 h-12 text-muted-foreground/50" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Book Not Found</h1>
          <p className="text-muted-foreground">
            The book you're looking for doesn't exist or has been removed.
          </p>
        </div>
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-all"
        >
          Browse Catalog
        </Link>
      </div>
    </main>
  </div>
); 

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link 
              href="/search" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Catalog</span>
            </Link>
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getAvailabilityStyle()}`}>
              {hasValue(book?.availability_status) ? book?.availability_status : 'Status Unknown'}
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column - Cover & Actions */}
          <div className="md:col-span-1">
            <div className="sticky top-20 space-y-4">
              <div className="relative rounded-lg overflow-hidden border border-border bg-muted/20">
                {hasValue(book?.thumbnail) ? (
                  <img
                    src={book?.thumbnail}
                    alt={`Cover of ${book?.title}`}
                    className="w-full object-cover aspect-[3/4]"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex items-center justify-center aspect-[3/4] bg-muted/30">
                    <BookOpen className="w-12 h-12 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {hasValue(book?.link) && (
                  <a
                    href={book?.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-all"
                  >
                    <BookOpen className="w-4 h-4" />
                    Read / Purchase
                  </a>
                )}
                
                {hasValue(book?.id) && (
                  <div className="flex justify-center pt-1">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                      <Hash className="w-2.5 h-2.5" />
                      Ref: {book?.id}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Title & Author */}
            <div className="space-y-3">
              {hasValue(book?.title) && (
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">
                  {book?.title}
                </h1>
              )}
              {hasValue(book?.author) && (
                <div className="flex items-center gap-2 text-base text-muted-foreground">
                  <span>by</span>
                  <span className="font-semibold text-foreground">{book?.author}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {hasValue(book?.average_rating) && (
                  <div className="flex items-center gap-2 bg-muted/30 px-2.5 py-1 rounded-md">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${star <= Math.floor(parseFloat(book?.average_rating)) ? 'fill-primary text-primary' : 'fill-muted text-muted-foreground/30'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-foreground">{book?.average_rating}</span>
                  </div>
                )}

                {categoriesArray.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {categoriesArray.map((category:string, idx:number) => (
                      <span key={idx} className="px-2 py-0.5 bg-secondary/50 text-secondary-foreground rounded text-[10px] font-medium">
                        {category}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {hasValue(book?.description) && (
              <div className="space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Synopsis
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {book?.description}
                </p>
              </div>
            )}

            {/* Details Grid */}
            <div className="space-y-3 pt-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0 border border-border/40 rounded-lg p-4 bg-muted/5">
                <DetailField label="Publisher" value={book?.publisher} icon={User} />
                <DetailField label="Year" value={book?.published_year} icon={Calendar} />
                <DetailField label="Language" value={book?.language} icon={Globe} />
                <DetailField label="Pages" value={book?.pages} icon={BookOpen} />
                <DetailField label="ISBN" value={book?.isbn} icon={Hash} />
                <DetailField label="Format" value={book?.format} icon={Tag} />
                <DetailField label="Type" value={book?.type} icon={Tag} />
                <DetailField label="Reading Level" value={book?.reading_level} icon={User} />
                <DetailField label="Physical Location" value={book?.location} icon={MapPin} />
              </div>
            </div>

            {/* Additional Info */}
            {(hasValue(book?.link) || hasValue(book?.thumbnail)) && (
              <div className="pt-2">
                <div className="p-4 rounded-lg bg-muted/10 border border-border/40">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Metadata Assets
                  </h3>
                  <div className="space-y-2 text-xs">
                    {hasValue(book?.link) && (
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-muted-foreground">Source URL</span>
                        <a href={book?.link} target='_blank' className="text-primary hover:underline break-all">{book?.link}</a>
                      </div>
                    )}
                    {hasValue(book?.thumbnail) && (
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-muted-foreground">Asset Pointer</span>
                        <a href={book?.thumbnail} target='_blank' className="text-primary break-all text-[11px]">{book?.thumbnail}</a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-12 border-t border-border py-6">
        <div className="container max-w-5xl mx-auto px-4 text-center">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            © 2026 BEMO Library Systems
          </p>
        </div>
      </footer>
    </div>
  );
});

export default BookDetailPage;