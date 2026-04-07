"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { apiCall } from "@/lib/api/client"
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react"

interface LoginFormProps {
  onSuccess?: () => void
}
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

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { setToken } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [show, setShow] = useState(false)
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  // const dispatch = useDispatch<AppDispatch>()

  const validateForm = (): boolean => {
    if (!email || !password) {
      setError("Email and password are required")
      return false
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      return false
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await apiCall<{
        user: { id: string; email: string }
        tokens: { accessToken: string }
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        requireAuth: false,
      })

      if (response.data?.tokens?.accessToken) {
        const token = response.data.tokens.accessToken
        setToken(token, true)

        onSuccess?.()

        // Redirect after a short delay to ensure token is persisted to localStorage
        setTimeout(() => {
          // Use full page reload so all components re-initialize with new auth state
          window.location.href = "/home"
        }, 100)
      } else {
        setError("Login failed: No token received")
      }
    } catch (err) {
      let errorMessage = "Login failed. Please try again."

      if (err instanceof Error) {
        errorMessage = err.message
      } else if (typeof err === "object" && err !== null) {
        const errObj = err as Record<string, unknown>
        const dataMsg = (errObj.data as Record<string, unknown>)?.message
        errorMessage =
          (errObj.message as string) ||
          (typeof dataMsg === "string" ? dataMsg : errorMessage)
      }

      setError(errorMessage)
      console.error("Login error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* FORM */}
      <div className="relative flex h-full w-full justify-center overflow-hidden">
        <div className="relative flex h-full w-full max-w-[650px] min-w-0 rounded-[80px] items-center overflow-auto border-2 border-border bg-linear-to-br from-card/70 via-card/70 to-card/70 p-8 backdrop-blur-sm sm:px-8 md:w-2/5 md:px-10 lg:px-15 xl:px-20">
          <motion.div
            className="w-full text-left"
            variants={formContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* BRANDING */}
            <div className="space-y-2">
              <motion.h1
                variants={itemVariants}
                className="font-poppins text-4xl leading-tight font-bold"
              >
                <span className="mr-2 bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Library Catalog
                </span>
                <span className="bg-linear-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                  Search Engine
                </span>
              </motion.h1>

              <motion.div
                variants={itemVariants}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5"
              >
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                <span className="text-xs font-semibold tracking-wide text-primary">
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
              className="rounded-2xl border border-border/50 bg-linear-to-br from-card/95 to-background/95 p-8 shadow-[0_8px_20px_-5px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-shadow hover:shadow-2xl"
            >
              <div className="mb-8">
                <h2 className="bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-2xl font-semibold text-transparent">
                  Welcome back
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Access the IIT (ISM) digital library catalog
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* EMAIL */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium tracking-wider text-muted-foreground">
                    <Mail size={12} /> Institute Email
                  </label>
                  <div className="group relative">
                    <Mail
                      size={18}
                      className="absolute top-3.5 left-4 text-muted-foreground transition-colors duration-200 group-focus-within:text-primary"
                    />
                    <input
                      id="email"
                      type="email"
                      placeholder="your.name@iitism.ac.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full rounded-xl border-2 border-border/50 bg-background/50 py-3.5 pr-4 pl-11 shadow-sm transition-all duration-200 outline-none hover:shadow-md focus:border-primary/50 focus:bg-background focus:ring-4 focus:ring-primary/10"
                    />
                  </div>
                </motion.div>

                {/* PASSWORD */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium tracking-wider text-muted-foreground">
                    <Lock size={12} /> Password
                  </label>
                  <div className="group relative">
                    <Lock
                      size={18}
                      className="absolute top-3.5 left-4 text-muted-foreground transition-colors duration-200 group-focus-within:text-primary"
                    />
                    <input
                      type={show ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                      className="w-full rounded-xl border-2 border-border/50 bg-background/50 py-3.5 pr-12 pl-11 shadow-sm transition-all duration-200 outline-none hover:shadow-md focus:border-primary/50 focus:bg-background focus:ring-4 focus:ring-primary/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      className="absolute top-3.5 right-4 text-muted-foreground transition-colors duration-200 hover:text-primary"
                    >
                      {show ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </motion.div>

                {/* ERROR MESSAGE */}
                {error && (
                  <motion.div
                    variants={itemVariants}
                    className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-500 dark:border-red-800 dark:bg-red-900/20"
                  >
                    {error}
                  </motion.div>
                )}

                {/* FORGOT PASSWORD */}
                <motion.div
                  variants={itemVariants}
                  className="flex justify-end"
                >
                  <span className="cursor-pointer text-sm font-medium text-primary/80 decoration-primary/30 underline-offset-4 transition-all duration-200 hover:text-primary hover:underline">
                    Forgot password?
                  </span>
                </motion.div>

                {/* BUTTON */}
                <motion.button
                  variants={itemVariants}
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl bg-linear-to-r from-primary to-primary/80 py-3.5 font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                  <LogIn size={18} className="relative z-10" />
                  <span className="relative z-10">
                    {isLoading ? "Accessing..." : "Access Library Catalog"}
                  </span>
                </motion.button>

                {/* Divider */}
                <motion.div variants={itemVariants} className="relative mt-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="flex items-center gap-2 bg-card/80 px-3 text-muted-foreground">
                      <span className="h-1 w-1 rounded-full bg-primary" />
                      Institutional Access Only
                      <span className="h-1 w-1 rounded-full bg-primary" />
                    </span>
                  </div>
                </motion.div>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
