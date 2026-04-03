// "use client";

// import React from "react";
// import { useState } from "react";
// import { motion } from "framer-motion";
// import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";


// // Variants for staggered children
// const formContainerVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: {
//       staggerChildren: 0.08,
//       delayChildren: 0.1,
//     },
//   },
// };

// const itemVariants = {
//   hidden: { opacity: 0, y: 15 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     // transition: { duration: 0.5, ease: "easeOut" }
//   },
// };

// const LoginForm = () => {
//       const [show, setShow] = useState(false);

//   return (
//     <>
//       {/* FORM */}
//       <div className="w-full h-full flex md:justify-end overflow-hidden justify-center relative">
//         <div className="relative md:w-2/5 w-full sm:min-w-[500px] max-w-[650px] flex items-center h-full bg-gradient-to-br from-card/70 via-card/70 to-card/70 backdrop-blur-sm xl:px-20 lg:px-15 md:px-10 sm:px-8 p-8 md:rounded-tl-[80px] md:rounded-bl-[80px] border-2 border-border overflow-auto">
//           <motion.div
//             className="text-left w-full"
//             variants={formContainerVariants}
//             initial="hidden"
//             animate="visible"
//           >
//             {/* BRANDING */}
//             <div className="space-y-2">
//               <motion.h1
//                 variants={itemVariants}
//                 className="text-4xl font-poppins font-bold leading-tight"
//               >
//                 <span className="bg-gradient-to-r mr-2 from-foreground to-foreground/80 bg-clip-text text-transparent">
//                   Library Catalog
//                 </span>
//                 <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
//                   Search Engine
//                 </span>
//               </motion.h1>

//               <motion.div
//                 variants={itemVariants}
//                 className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-5"
//               >
//                 <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
//                 <span className="text-xs font-semibold text-primary tracking-wide">
//                   IIT (ISM) DHANBAD
//                 </span>
//                 <span className="text-xs text-muted-foreground">|</span>
//                 <span className="text-xs font-medium text-primary/80">
//                   Central Library
//                 </span>
//               </motion.div>
//             </div>

//             {/* FORM CARD */}
//             <motion.div
//               variants={itemVariants}
//               className="bg-gradient-to-br from-card/95 to-background/95 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-[0_8px_20px_-5px_rgba(0,0,0,0.5)] hover:shadow-2xl transition-shadow"
//             >
//               <div className="mb-8">
//                 <h2 className="text-2xl font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
//                   Welcome back
//                 </h2>
//                 <p className="text-sm text-muted-foreground mt-1">
//                   Access the IIT (ISM) digital library catalog
//                 </p>
//               </div>

//               <form className="space-y-6">
//                 {/* EMAIL */}
//                 <motion.div variants={itemVariants} className="space-y-2">
//                   <label className="text-sm font-medium text-muted-foreground tracking-wider flex items-center gap-2">
//                     <Mail size={12} /> Institute Email
//                   </label>
//                   <div className="relative group">
//                     <Mail
//                       size={18}
//                       className="absolute left-4 top-3.5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200"
//                     />
//                     <input
//                       type="email"
//                       placeholder="your.name@iitism.ac.in"
//                       className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-border/50 bg-background/50 focus:bg-background focus:border-primary/50 outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-200 shadow-sm hover:shadow-md"
//                     />
//                   </div>
//                 </motion.div>

//                 {/* PASSWORD */}
//                 <motion.div variants={itemVariants} className="space-y-2">
//                   <label className="text-sm font-medium text-muted-foreground tracking-wider flex items-center gap-2">
//                     <Lock size={12} /> Password
//                   </label>
//                   <div className="relative group">
//                     <Lock
//                       size={18}
//                       className="absolute left-4 top-3.5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200"
//                     />
//                     <input
//                       type={show ? "text" : "password"}
//                       placeholder="••••••••"
//                       className="w-full pl-11 pr-12 py-3.5 rounded-xl border-2 border-border/50 bg-background/50 focus:bg-background focus:border-primary/50 outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-200 shadow-sm hover:shadow-md"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShow(!show)}
//                       className="absolute right-4 top-3.5 text-muted-foreground hover:text-primary transition-colors duration-200"
//                     >
//                       {show ? <EyeOff size={18} /> : <Eye size={18} />}
//                     </button>
//                   </div>
//                 </motion.div>

//                 {/* FORGOT PASSWORD */}
//                 <motion.div
//                   variants={itemVariants}
//                   className="flex justify-end"
//                 >
//                   <span className="text-sm text-primary/80 hover:text-primary cursor-pointer transition-all duration-200 hover:underline decoration-primary/30 underline-offset-4 font-medium">
//                     Forgot password?
//                   </span>
//                 </motion.div>

//                 {/* BUTTON */}
//                 <motion.button
//                   variants={itemVariants}
//                   // whileTap={{ scale: 0.97 }}
//                   // whileHover={{ scale: 1.02, translateY: -2 }}
//                   className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground flex items-center justify-center gap-2 font-semibold  relative overflow-hidden group cursor-pointer"
//                 >
//                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
//                   <LogIn size={18} className="relative z-10" />
//                   <span className="relative z-10">Access Library Catalog</span>
//                 </motion.button>

//                 {/* Divider */}
//                 <motion.div variants={itemVariants} className="relative mt-6">
//                   <div className="absolute inset-0 flex items-center">
//                     <div className="w-full border-t border-border/50" />
//                   </div>
//                   <div className="relative flex justify-center text-xs uppercase">
//                     <span className="bg-card/80 px-3 text-muted-foreground flex items-center gap-2">
//                       <span className="w-1 h-1 rounded-full bg-primary" />
//                       Institutional Access Only
//                       <span className="w-1 h-1 rounded-full bg-primary" />
//                     </span>
//                   </div>
//                 </motion.div>
//               </form>
//             </motion.div>
//           </motion.div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default LoginForm;


"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";

// Variants for staggered children
const formContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const LoginForm: React.FC = () => {
  const [show, setShow] = useState<boolean>(false);

  return (
    <>
      {/* FORM */}
      <div className="w-full h-full flex md:justify-end overflow-hidden justify-center relative">
        <div className="relative md:w-2/5 w-full sm:min-w-[500px] max-w-[650px] flex items-center h-full bg-gradient-to-br from-card/70 via-card/70 to-card/70 backdrop-blur-sm xl:px-20 lg:px-15 md:px-10 sm:px-8 p-8 md:rounded-tl-[80px] md:rounded-bl-[80px] border-2 border-border overflow-auto">
          <motion.div
            className="text-left w-full"
            variants={formContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* BRANDING */}
            <div className="space-y-2">
              <motion.h1
                variants={itemVariants}
                className="text-4xl font-poppins font-bold leading-tight"
              >
                <span className="bg-gradient-to-r mr-2 from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Library Catalog
                </span>
                <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                  Search Engine
                </span>
              </motion.h1>

              <motion.div
                variants={itemVariants}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-semibold text-primary tracking-wide">
                  IIT (ISM) DHANBAD
                </span>
                <span className="text-xs text-muted-foreground">|</span>
                <span className="text-xs font-medium text-primary/80">
                  Central Library
                </span>
              </motion.div>
            </div>

            {/* FORM CARD */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-card/95 to-background/95 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-[0_8px_20px_-5px_rgba(0,0,0,0.5)] hover:shadow-2xl transition-shadow"
            >
              <div className="mb-8">
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Welcome back
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Access the IIT (ISM) digital library catalog
                </p>
              </div>

              <form className="space-y-6">
                {/* EMAIL */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground tracking-wider flex items-center gap-2">
                    <Mail size={12} /> Institute Email
                  </label>
                  <div className="relative group">
                    <Mail
                      size={18}
                      className="absolute left-4 top-3.5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200"
                    />
                    <input
                      type="email"
                      placeholder="your.name@iitism.ac.in"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-border/50 bg-background/50 focus:bg-background focus:border-primary/50 outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-200 shadow-sm hover:shadow-md"
                    />
                  </div>
                </motion.div>

                {/* PASSWORD */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground tracking-wider flex items-center gap-2">
                    <Lock size={12} /> Password
                  </label>
                  <div className="relative group">
                    <Lock
                      size={18}
                      className="absolute left-4 top-3.5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200"
                    />
                    <input
                      type={show ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-12 py-3.5 rounded-xl border-2 border-border/50 bg-background/50 focus:bg-background focus:border-primary/50 outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-200 shadow-sm hover:shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      className="absolute right-4 top-3.5 text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {show ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </motion.div>

                {/* FORGOT PASSWORD */}
                <motion.div
                  variants={itemVariants}
                  className="flex justify-end"
                >
                  <span className="text-sm text-primary/80 hover:text-primary cursor-pointer transition-all duration-200 hover:underline decoration-primary/30 underline-offset-4 font-medium">
                    Forgot password?
                  </span>
                </motion.div>

                {/* BUTTON */}
                <motion.button
                  variants={itemVariants}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground flex items-center justify-center gap-2 font-semibold  relative overflow-hidden group cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <LogIn size={18} className="relative z-10" />
                  <span className="relative z-10">Access Library Catalog</span>
                </motion.button>

                {/* Divider */}
                <motion.div variants={itemVariants} className="relative mt-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card/80 px-3 text-muted-foreground flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary" />
                      Institutional Access Only
                      <span className="w-1 h-1 rounded-full bg-primary" />
                    </span>
                  </div>
                </motion.div>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default LoginForm;