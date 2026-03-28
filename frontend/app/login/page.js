// "use client"
// import React, { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   Mail,
//   Lock,
//   BookOpen,
//   Sparkles,
//   LogIn,
//   Eye,
//   EyeOff,
//   CheckCircle,
//   AlertCircle,
//   Library,
//   Search,
//   Star
// } from 'lucide-react';

// const FloatingBook = ({ delay, rotate, xOffset, yOffset, title, author, icon: Icon }) => {
//   return (
//     <motion.div
//       className="absolute bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-3 w-44 border border-amber-100/50 cursor-pointer"
//       style={{ x: xOffset, y: yOffset, rotate: rotate }}
//       initial={{ opacity: 0, y: 20, scale: 0.9 }}
//       animate={{ opacity: 1, y: 0, scale: 1, transition: { delay, duration: 0.6, ease: "easeOut" } }}
//       whileHover={{ scale: 1.08, rotate: 0, transition: { duration: 0.2 }, y: -5 }}
//       whileTap={{ scale: 0.98 }}
//     >
//       <div className="flex items-center gap-3">
//         <div className="p-2 bg-amber-100 rounded-lg">
//           <Icon size={18} className="text-amber-700" />
//         </div>
//         <div className="flex-1">
//           <p className="text-xs font-semibold text-gray-800 line-clamp-1">{title}</p>
//           <p className="text-[10px] text-gray-500">{author}</p>
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// const LoginPage = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [successMsg, setSuccessMsg] = useState('');
//   const [rememberMe, setRememberMe] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     // Validation
//     if (!email.trim() || !password.trim()) {
//       setError('Please fill in both email and password');
//       return;
//     }
//     if (!email.includes('@') || !email.includes('.')) {
//       setError('Please enter a valid email address');
//       return;
//     }
//     if (password.length < 6) {
//       setError('Password must be at least 6 characters');
//       return;
//     }

//     setIsLoading(true);

//     // Simulate API call
//     try {
//       await new Promise(resolve => setTimeout(resolve, 1500));
//       setSuccessMsg('Welcome back! Redirecting to library search...');
//       setTimeout(() => {
//         // Here you would typically redirect to dashboard
//         console.log('Login successful', { email, rememberMe });
//         // window.location.href = '/dashboard';
//       }, 1000);
//     } catch (err) {
//       setError('Login failed. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const bookFloats = [
//     {
//       id: 1,
//       title: "The Midnight Library",
//       author: "Matt Haig",
//       delay: 0.1,
//       rotate: -3,
//       x: -20,
//       y: 40,
//       icon: BookOpen
//     },
//     {
//       id: 2,
//       title: "Atomic Habits",
//       author: "James Clear",
//       delay: 0.3,
//       rotate: 5,
//       x: 70,
//       y: 120,
//       icon: Sparkles
//     },
//     {
//       id: 3,
//       title: "The Name of the Wind",
//       author: "P. Rothfuss",
//       delay: 0.5,
//       rotate: -2,
//       x: -40,
//       y: 200,
//       icon: Star
//     },
//     {
//       id: 4,
//       title: "Dune",
//       author: "Frank Herbert",
//       delay: 0.7,
//       rotate: 4,
//       x: 50,
//       y: 280,
//       icon: BookOpen
//     },
//     {
//       id: 5,
//       title: "Sapiens",
//       author: "Yuval Harari",
//       delay: 0.9,
//       rotate: -1,
//       x: -10,
//       y: 340,
//       icon: Library
//     },
//   ];

//   return (
//     <div className="min-h-screen w-full flex flex-col md:flex-row bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100">
//       {/* LEFT SIDE - Library Theme */}
//       <motion.div
//         initial={{ opacity: 0, x: -50 }}
//         animate={{ opacity: 1, x: 0 }}
//         transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
//         className="relative w-full md:w-1/2 bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900 overflow-hidden p-8 md:p-12 flex flex-col justify-center items-center text-white shadow-2xl"
//       >
//         {/* Animated background pattern */}
//         <div className="absolute inset-0 opacity-5">
//           <div className="absolute inset-0" style={{
//             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5L55 20L30 35L5 20L30 5z M30 45L55 30L30 15L5 30L30 45z' fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
//             backgroundRepeat: 'repeat'
//           }} />
//         </div>

//         {/* Animated floating particles */}
//         <motion.div
//           className="absolute inset-0"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 0.3 }}
//           transition={{ duration: 1 }}
//         >
//           {[...Array(20)].map((_, i) => (
//             <motion.div
//               key={i}
//               className="absolute w-1 h-1 bg-amber-300 rounded-full"
//               initial={{
//                 x: Math.random() * window.innerWidth,
//                 y: Math.random() * window.innerHeight,
//               }}
//               animate={{
//                 y: [null, -30, 30, -30],
//                 x: [null, 20, -20, 20],
//               }}
//               transition={{
//                 duration: 3 + Math.random() * 2,
//                 repeat: Infinity,
//                 ease: "easeInOut"
//               }}
//             />
//           ))}
//         </motion.div>

//         {/* Main Content */}
//         <motion.div
//           className="relative z-10 max-w-md text-center md:text-left"
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2, duration: 0.6 }}
//         >
//           <motion.div
//             className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6"
//             whileHover={{ scale: 1.05 }}
//           >
//             <Sparkles size={16} className="text-amber-300" />
//             <span className="text-xs font-medium tracking-wide">Knowledge Hub</span>
//           </motion.div>

//           <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 drop-shadow-sm">
//             Library
//             <span className="text-amber-300">Search</span>
//             <br />
//             Engine
//           </h1>

//           <motion.p
//             className="text-amber-50/90 text-base md:text-lg leading-relaxed mb-8 border-l-4 border-amber-300 pl-4 italic"
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.4 }}
//           >
//             "A room without books is like a body without a soul." — Cicero
//           </motion.p>

//           <div className="flex flex-wrap gap-3 text-sm text-amber-100/80">
//             <motion.div
//               className="flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-full px-4 py-2"
//               whileHover={{ scale: 1.05 }}
//             >
//               <BookOpen size={14} />
//               <span>10k+ Books</span>
//             </motion.div>
//             <motion.div
//               className="flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-full px-4 py-2"
//               whileHover={{ scale: 1.05 }}
//             >
//               <Search size={14} />
//               <span>Smart Search</span>
//             </motion.div>
//             <motion.div
//               className="flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-full px-4 py-2"
//               whileHover={{ scale: 1.05 }}
//             >
//               <Star size={14} />
//               <span>Rare Collections</span>
//             </motion.div>
//           </div>
//         </motion.div>

//         {/* Floating Books */}
//         <div className="absolute inset-0 pointer-events-none overflow-hidden">
//           {bookFloats.map((book) => (
//             <FloatingBook
//               key={book.id}
//               delay={book.delay}
//               rotate={book.rotate}
//               xOffset={book.x}
//               yOffset={book.y}
//               title={book.title}
//               author={book.author}
//               icon={book.icon}
//             />
//           ))}

//           {/* Animated Stack of Books */}
//           <motion.div
//             className="absolute bottom-8 right-8 opacity-60"
//             animate={{ y: [0, -10, 0] }}
//             transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
//           >
//             <div className="relative">
//               <div className="w-28 h-24 bg-amber-900/40 rounded-md shadow-xl rotate-3 backdrop-blur-sm"></div>
//               <div className="w-28 h-24 bg-amber-800/60 rounded-md shadow-xl -mt-14 ml-5 -rotate-6 backdrop-blur-sm"></div>
//               <div className="w-28 h-24 bg-amber-700/80 rounded-md shadow-xl -mt-14 ml-10 rotate-2 backdrop-blur-sm"></div>
//               <div className="absolute -top-6 left-12 text-xs font-semibold text-amber-200">✦ classics</div>
//             </div>
//           </motion.div>
//         </div>
//       </motion.div>

//       {/* RIGHT SIDE - Login Form */}
//       <motion.div
//         initial={{ opacity: 0, x: 50 }}
//         animate={{ opacity: 1, x: 0 }}
//         transition={{ duration: 0.6, delay: 0.1 }}
//         className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-gradient-to-br from-white via-white to-amber-50/30"
//       >
//         <motion.div
//           className="w-full max-w-md"
//           initial={{ scale: 0.95, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.2 }}
//         >
//           <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 border border-gray-100">
//             {/* Header */}
//             <div className="text-center mb-8">
//               <motion.div
//                 className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl mb-4 shadow-lg"
//                 whileHover={{ rotate: 5, scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 <Library size={40} className="text-amber-700" />
//               </motion.div>
//               <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Welcome back</h2>
//               <p className="text-gray-500 mt-2">Sign in to explore the library universe</p>
//             </div>

//             {/* Form */}
//             <form onSubmit={handleSubmit} className="space-y-5">
//               <motion.div
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.2 }}
//               >
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
//                 <div className="relative group">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <Mail size={18} className="text-gray-400 group-focus-within:text-amber-500 transition-colors" />
//                   </div>
//                   <input
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-200 outline-none text-gray-800"
//                     placeholder="librarian@library.com"
//                   />
//                 </div>
//               </motion.div>

//               <motion.div
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.3 }}
//               >
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
//                 <div className="relative group">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <Lock size={18} className="text-gray-400 group-focus-within:text-amber-500 transition-colors" />
//                   </div>
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-200 outline-none text-gray-800"
//                     placeholder="••••••••"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                   >
//                     {showPassword ?
//                       <EyeOff size={18} className="text-gray-400 hover:text-gray-600" /> :
//                       <Eye size={18} className="text-gray-400 hover:text-gray-600" />
//                     }
//                   </button>
//                 </div>
//               </motion.div>

//               <div className="flex items-center justify-between text-sm">
//                 <label className="flex items-center gap-2 cursor-pointer group">
//                   <input
//                     type="checkbox"
//                     checked={rememberMe}
//                     onChange={(e) => setRememberMe(e.target.checked)}
//                     className="rounded border-gray-300 text-amber-600 focus:ring-amber-400 cursor-pointer"
//                   />
//                   <span className="text-gray-600 group-hover:text-gray-800 transition">Remember me</span>
//                 </label>
//                 <a href="#" className="text-amber-700 hover:text-amber-800 font-medium transition hover:underline">Forgot password?</a>
//               </div>

//               <AnimatePresence>
//                 {error && (
//                   <motion.div
//                     initial={{ opacity: 0, y: -10, height: 0 }}
//                     animate={{ opacity: 1, y: 0, height: 'auto' }}
//                     exit={{ opacity: 0, y: -10, height: 0 }}
//                     className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 flex items-center gap-2"
//                   >
//                     <AlertCircle size={16} />
//                     <span>{error}</span>
//                   </motion.div>
//                 )}
//                 {successMsg && (
//                   <motion.div
//                     initial={{ opacity: 0, scale: 0.95 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     exit={{ opacity: 0, scale: 0.95 }}
//                     className="bg-green-50 text-green-700 text-sm p-3 rounded-xl border border-green-100 flex items-center gap-2"
//                   >
//                     <CheckCircle size={16} />
//                     <span>{successMsg}</span>
//                   </motion.div>
//                 )}
//               </AnimatePresence>

//               <motion.button
//                 type="submit"
//                 disabled={isLoading}
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 className={`w-full py-3.5 rounded-xl font-semibold text-white shadow-md transition-all flex items-center justify-center gap-2 ${
//                   isLoading ? 'bg-amber-400 cursor-wait' : 'bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900'
//                 } focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2`}
//               >
//                 {isLoading ? (
//                   <>
//                     <motion.div
//                       animate={{ rotate: 360 }}
//                       transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//                     >
//                       <svg className="h-5 w-5 text-white" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                       </svg>
//                     </motion.div>
//                     Authenticating...
//                   </>
//                 ) : (
//                   <>
//                     <LogIn size={18} />
//                     Sign In
//                   </>
//                 )}
//               </motion.button>
//             </form>

//             <div className="mt-8 pt-4 border-t border-gray-100 text-center">
//               <p className="text-gray-500 text-sm">
//                 Don't have an account?{" "}
//                 <a href="#" className="text-amber-700 font-semibold hover:underline">Create account</a>
//               </p>
//               <p className="text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
//                 <Library size={12} />
//                 Demo: use any email (6+ char password)
//               </p>
//             </div>
//           </div>

//           {/* Footer Decoration */}
//           <motion.div
//             className="flex justify-center mt-6 gap-3 text-gray-400 text-xs"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.6 }}
//           >
//             <span className="flex items-center gap-1">🔐 Secure Login</span>
//             <span>•</span>
//             <span className="flex items-center gap-1">📖 Digital Library Access</span>
//             <span>•</span>
//             <span className="flex items-center gap-1">✨ 24/7 Available</span>
//           </motion.div>
//         </motion.div>
//       </motion.div>
//     </div>
//   );
// };

// export default LoginPage;

"use client";
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";

export default function LoginPage() {
  const [show, setShow] = useState(false);

  return (
    <div className="w-dvw h-dvh flex justify-end bg-background text-foreground relative">
      {/* backgound IMAGE */}
      <div className="absolute left-0 hidden md:block lg:w-4/5 w-full h-full">
        <img
          src="/login_page_image.png" // 🔥 CHANGE THIS PATH
          alt="library"
          className="w-full h-full object-contain object-bottom-left"
        />
      </div>
      {/* gradient overlay */}
      <div className="absolute w-full h-full bg-gradient-to-t from-background/80 via-transparent to-transparent" />

      {/* FORM */}
      <div className="w-full h-full flex items-center  md:justify-end justify-center relative ">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative md:w-2/5 w-full sm:min-w-[500px] max-w-[650px] h-full bg-gradient-to-br from-card/70 via-card/70 to-card/70 backdrop-blur-sm  xl:p-20 lg:p-15 md:p-10 sm:p-8 p-8 md:rounded-tl-[80px] md:rounded-bl-[80px] border-l border-t border-border overflow-auto"
        >
          {/* 🔥 BRANDING - IIT (ISM) DHANBAD LIBRARY CATALOG */}
          <div className="mb-10 text-left">
            {/* Main Heading */}
            <div className="space-y-2">
              <h1 className="text-4xl font-serif font-bold leading-tight">
                <span className="bg-gradient-to-r mr-2 from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Library Catalog
                </span>
                {/* <br /> */}
                <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                  Search Engine
                </span>
              </h1>
              {/* Institute Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-semibold text-primary tracking-wide">
                  IIT (ISM) DHANBAD
                </span>
                <span className="text-xs text-muted-foreground">|</span>
                <span className="text-xs font-medium text-primary/80">
                  Central Library
                </span>
              </div>
            </div>

            {/* FORM CARD - Same improved design */}
            <div className="bg-gradient-to-br from-card/95 to-background/95 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl hover:shadow-2xl transition-all duration-300">
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
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Mail size={12} />
                    Institute Email / User ID
                  </label>

                  <div className="relative group">
                    <Mail
                      size={18}
                      className="absolute left-4 top-3.5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200"
                    />

                    <input
                      type="email"
                      placeholder="your.name@iitism.ac.in"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-border/50 bg-background/50 
              focus:bg-background focus:border-primary/50 outline-none focus:ring-4 focus:ring-primary/10 
              transition-all duration-200 shadow-sm hover:shadow-md placeholder:text-muted-foreground/50"
                    />

                    <div className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity duration-200">
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-primary/10 blur-sm" />
                    </div>
                  </div>
                </div>

                {/* PASSWORD */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Lock size={12} />
                    Password
                  </label>

                  <div className="relative group">
                    <Lock
                      size={18}
                      className="absolute left-4 top-3.5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200"
                    />

                    <input
                      type={show ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-12 py-3.5 rounded-xl border-2 border-border/50 bg-background/50 
              focus:bg-background focus:border-primary/50 outline-none focus:ring-4 focus:ring-primary/10 
              transition-all duration-200 shadow-sm hover:shadow-md placeholder:text-muted-foreground/50"
                    />

                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      className="absolute right-4 top-3.5 text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {show ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>

                    <div className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity duration-200">
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-primary/10 blur-sm" />
                    </div>
                  </div>
                </div>

                {/* FORGOT PASSWORD */}
                <div className="flex justify-end">
                  <span className="text-sm text-primary/80 hover:text-primary cursor-pointer transition-all duration-200 hover:underline decoration-primary/30 underline-offset-4 font-medium">
                    Forgot password?
                  </span>
                </div>

                {/* BUTTON */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.02 }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground 
          flex items-center justify-center gap-2 font-semibold 
          shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                  <LogIn size={18} className="relative z-10" />
                  <span className="relative z-10">Access Library Catalog</span>
                </motion.button>

                {/* Divider */}
                <div className="relative mt-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card/80 px-3 text-muted-foreground flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="w-1 h-1 rounded-full bg-primary" />
                      </span>
                      Institutional Access Only
                    </span>
                  </div>
                </div>
              </form>
            </div>

            {/* Decorative IIT (ISM) Emblem Element */}
            <div className="absolute bottom-8 right-8 opacity-30">
              <div className="relative">
                <div className="w-12 h-12 border-2 border-primary/30 rounded-full" />
                <div className="absolute top-3 left-3 w-6 h-6 border-2 border-primary/30 rounded-full" />
                <div className="absolute top-5 left-5 w-2 h-2 rounded-full bg-primary/40" />
              </div>
            </div>

            
          </div>
        </motion.div>
      </div>
    </div>
  );
}
