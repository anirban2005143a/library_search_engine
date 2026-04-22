"use client"

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  Loader2,
  AlertCircle,
  BookOpen,
  Trash2,
  Download,
  FileText,
  HardDrive,
  Library
} from 'lucide-react';
import { toast, ToastOptions } from 'react-toastify';
import axios from "axios"

// Reusable showToast function
const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
  const options: ToastOptions = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
  }
  switch (type) {
    case 'success':
      toast.success(message, options);
      break;
    case 'error':
      toast.error(message, options);
      break;
    case 'warning':
      toast.warning(message, options);
      break;
    default:
      toast.info(message, options);
  }
};

interface FileMetadata {
  fileName: string;
  fileSize: number;
  totalBooks: number;
  validBooks: number;
  invalidBooks: number;
  uploadTime: Date;
}


const BookUploadPage: React.FC = () => {
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const STRICT_REQUIRED = ["title", "id"];
  
  const validateBookData = (data: any[]): { validCount: number; errors: string[] } => {
    let validCount = 0;
    const errors: string[] = [];
    
    data.forEach((row, index) => {
      const rowNumber = index + 2;
      
      if (!row || Object.keys(row).length === 0) return;
      
      // 1. Check for absolute essentials
      const missingStrict = STRICT_REQUIRED.filter(col => !row[col]);
      if (missingStrict.length > 0) {
        errors.push(`Row ${rowNumber}: Essential columns missing - ${missingStrict.join(', ')}`);
        return;
      }
      
      validCount++;
    });

    console.log(validCount)
    
    return { validCount, errors };
  };

  const handleFinalUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/books/upload`, formData);

      const result = await response.data;

      if (result.success) {
        showToast(`Successfully saved ${result.uploaded} books to the database!`, 'success');
        resetState();
      } else {
        showToast(result.message || 'Upload failed', 'error');
      }
    } catch (error) {
      showToast('Server connection error', 'error');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const processExcelFile = async (file: File) => {
    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          
          if (jsonData.length === 0) {
            showToast('The Excel file is empty', 'error');
            resetState();
            return;
          }
          
          const { validCount, errors } = validateBookData(jsonData);
          
          if (errors.length > 0) {
            showToast(`${errors.length} rows had validation issues`, 'warning');
          }
          
          setFileMetadata({
            fileName: file.name,
            fileSize: file.size,
            totalBooks: jsonData.length,
            validBooks: validCount,
            invalidBooks: errors.length,
            uploadTime: new Date()
          });
          
          showToast(`Processed ${jsonData.length} records successfully`, 'success');
        } catch (error) {
          showToast('Error parsing Excel file', 'error');
          resetState();
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const processCSVFile = async (file: File) => {
    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csvData = e.target?.result as string;
          const workbook = XLSX.read(csvData, { type: 'string' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          
          if (jsonData.length === 0) {
            showToast('The CSV file is empty', 'error');
            resetState();
            return;
          }
          
          const { validCount, errors } = validateBookData(jsonData);
          
          setFileMetadata({
            fileName: file.name,
            fileSize: file.size,
            totalBooks: jsonData.length,
            validBooks: validCount,
            invalidBooks: errors.length,
            uploadTime: new Date()
          });
          
          showToast(`Processed ${jsonData.length} records from CSV`, 'success');
        } catch (error) {
          showToast('Error parsing CSV file', 'error');
          resetState();
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (file: File) => {
    // Reset previous file data first (Single file allowed)
    resetState();

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(fileExtension || '')) {
      showToast('Only Excel (.xlsx, .xls) and CSV files are allowed', 'error');
      return;
    }
    
    const maxSize = 5 * 1024 * 1024; 
    if (file.size > maxSize) {
      showToast('File size must be less than 5MB', 'error');
      return;
    }
    
    setSelectedFile(file);
    if (fileExtension === 'csv') {
      processCSVFile(file);
    } else {
      processExcelFile(file);
    }
  };

  const resetState = () => {
    setSelectedFile(null);
    setFileMetadata(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    e.target.value = ''; 
  };

  const downloadTemplate = () => {
    const template = [{
      title: 'Sample Title', author: 'Author Name', publisher: 'Publisher', 
      language: 'English', published_year: '2024', categories: 'Fiction', 
      description: 'Desc', thumbnail: 'url', pages: '200', link: 'url', 
      isbn: '123-456', location: 'Shelf-A', availability_status: 'Available', 
      id: 'BK001', format: 'Hardcover', type: 'Physical', 
      reading_level: 'Adult', average_rating: '4.5'
    }];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Books');
    XLSX.writeFile(wb, 'book_template.xlsx');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen size={32} style={{ color: 'var(--primary)' }} />
            <h1 className="text-3xl font-bold">Book Management System</h1>
          </div>
          <p style={{ color: 'var(--muted-foreground)' }}>Upload a single Excel/CSV file to validate and view book metadata.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Upload Section */}
          <div className="space-y-6">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                dragActive ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              style={{ borderColor: dragActive ? 'var(--primary)' : 'var(--border)' }}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full" style={{ backgroundColor: 'var(--muted)' }}>
                  <FileSpreadsheet size={48} style={{ color: 'var(--primary)' }} />
                </div>
                <div>
                  <p className="text-lg font-medium">Upload File</p>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Drag and drop or click to browse</p>
                </div>
                
                <div className="flex gap-3">
                  <label className="cursor-pointer">
                    <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileSelect} className="hidden" disabled={isLoading} />
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium"
                      style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                      <Upload size={16} /> Select File
                    </span>
                  </label>
                  <button onClick={downloadTemplate} className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium border cursor-pointer"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
                    <Download size={16} /> Download Template
                  </button>
                </div>
              </div>
            </div>

            {/* Instructions */}
             <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
               <h3 className="font-semibold mb-2 flex items-center gap-2">
                 <AlertCircle size={16} style={{ color: 'var(--primary)' }} />
                 Excel File Requirements
               </h3>
               <ul className="text-sm space-y-1" style={{ color: 'var(--muted-foreground)' }}>
                 <li>• Supported formats: Excel (.xlsx, .xls) and CSV files</li>
                 <li>• Required columns (18): title, author, publisher, language, published_year, categories, description, thumbnail, pages, link, isbn, location, availability_status, id, format, type, reading_level, average_rating</li>
                 <li>• Published year must be a 4-digit year (e.g., 2024)</li>
                 <li>• Pages must be a positive number</li>
                 <li>• Average rating must be between 0 and 5</li>
                 <li>• Availability status: Available, Borrowed, Reserved, or Maintenance</li>
                 <li>• First row should contain column headers matching the required fields</li>
               </ul>
             </div>
          </div>

          {/* Right: Metadata Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Library size={20} style={{ color: 'var(--primary)' }} />
                File Metadata
              </h2>
              {fileMetadata && (
                <button onClick={resetState} className="text-sm flex items-center gap-1" style={{ color: 'var(--destructive)' }}>
                  <Trash2 size={14} /> Clear
                </button>
              )}
            </div>
            
            {!fileMetadata ? (
              <div className="text-center py-20 rounded-lg border border-dashed" style={{ borderColor: 'var(--border)' }}>
                <FileText size={48} className="mx-auto mb-4 opacity-20" />
                <p style={{ color: 'var(--muted-foreground)' }}>No file data available</p>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="p-6 rounded-lg border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
                  <div className="flex items-start gap-3 mb-6">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(var(--primary-rgb), 0.1)' }}>
                      <FileText size={24} style={{ color: 'var(--primary)' }} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h3 className="font-semibold text-lg truncate">{fileMetadata.fileName}</h3>
                      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        Processed at {fileMetadata.uploadTime.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between p-3 rounded-md bg-muted/30">
                      <div className="flex items-center gap-2">
                        <HardDrive size={16} className="opacity-60" />
                        <span className="text-sm">File Size</span>
                      </div>
                      <span className="font-mono font-medium">{formatFileSize(fileMetadata.fileSize)}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-md bg-muted/30">
                      <div className="flex items-center gap-2">
                        <Library size={16} className="opacity-60" />
                        <span className="text-sm">Total Records</span>
                      </div>
                      <span className="font-mono font-medium text-lg">{fileMetadata.totalBooks}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-md border" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex items-center gap-2 mb-1 text-xs uppercase tracking-wider opacity-60">
                          <CheckCircle size={12} /> Valid
                        </div>
                        <div className="text-xl font-bold" style={{ color: 'var(--primary)' }}>{fileMetadata.validBooks}</div>
                      </div>
                      <div className="p-3 rounded-md border" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex items-center gap-2 mb-1 text-xs uppercase tracking-wider opacity-60">
                          <XCircle size={12} /> Invalid
                        </div>
                        <div className="text-xl font-bold" style={{ color: 'var(--destructive)' }}>{fileMetadata.invalidBooks}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span style={{ color: 'var(--muted-foreground)' }}>Validation Success Rate</span>
                      <span className="font-medium">
                        {((fileMetadata.validBooks / fileMetadata.totalBooks) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full transition-all duration-500" 
                        style={{ 
                          width: `${(fileMetadata.validBooks / fileMetadata.totalBooks) * 100}%`,
                          backgroundColor: 'var(--primary)'
                        }} 
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm text-center font-medium" style={{ color: 'var(--primary)' }}>
                    {isLoading ? "Analyzing file content..." : "File analysis complete"}
                  </p>
                </div>

                {fileMetadata && fileMetadata.validBooks > 0 && (
                  <button
                    onClick={handleFinalUpload}
                    disabled={isUploading}
                    className="w-full flex cursor-pointer items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-primary-foreground transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    {isUploading ? (
                      <><Loader2 className="animate-spin" size={18} /> Saving to Database...</>
                    ) : (
                      <><CheckCircle size={18} /> Confirm & Upload {fileMetadata.validBooks} Books</>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookUploadPage;