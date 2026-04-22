// App.tsx - Example of how to set up with ToastContainer
import BookUploadPage from '@/components/Upload_books';
import React from 'react';
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <>
      <BookUploadPage />
      <ToastContainer/>
    </>
  );
}

export default App;