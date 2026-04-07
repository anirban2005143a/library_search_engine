import { Loader2 } from 'lucide-react';
import React from 'react'

const Loader = ({text }:{text:string}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10">
      
      {/* Spinner Container */}
      <div className="flex items-center justify-center ">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>

      {/* Text */}
      <p className="text-sm font-medium text-muted-foreground tracking-normal">
        {text}
      </p>
    </div>
  );
};

export default Loader;