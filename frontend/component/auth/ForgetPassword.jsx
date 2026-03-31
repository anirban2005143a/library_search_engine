"use client";

import React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Lock,
  Shield,
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Key,
  AlertCircle,
} from "lucide-react";

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

export const ForgetPasswordForm = ({ onBack, onSuccess, email }) => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: "",
  });

  // Get email from localStorage if not provided as prop
  useEffect(() => {
    if (!email) {
      const storedEmail = localStorage.getItem("userEmail");
      if (storedEmail) {
        email = storedEmail;
      }
    }
  }, [email]);

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let score = 0;
    let feedback = "";

    if (password.length === 0) {
      return { score: 0, feedback: "" };
    }

    // Length check
    if (password.length >= 6) score++;
    if (password.length >= 12) score++;

    // Complexity checks
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    // Normalize score to 0-4 range
    score = Math.min(score, 4);

    // Set feedback based on score
    if (score === 0) feedback = "";
    else if (score === 1) feedback = "Very Weak";
    else if (score === 2) feedback = "Weak";
    else if (score === 3) feedback = "Good";
    else if (score === 4) feedback = "Strong";

    return { score, feedback };
  };

  const isPasswordValid = () => {
    const { newPassword, confirmPassword } = formData;

    return (
      newPassword.length >= 6 &&
      /[A-Z]/.test(newPassword) &&
      /[0-9]/.test(newPassword) &&
      /[^A-Za-z0-9]/.test(newPassword) &&
      newPassword === confirmPassword
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Update password strength for new password field
    if (name === "newPassword") {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const { newPassword, confirmPassword } = formData;

    // New password validation
    // New password validation
    if (!newPassword) {
      newErrors.newPassword = "Password is required";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters long";
    } else if (!/[A-Z]/.test(newPassword)) {
      newErrors.newPassword =
        "Password must include at least one uppercase letter";
    } else if (!/[0-9]/.test(newPassword)) {
      newErrors.newPassword = "Password must include at least one number";
    } else if (!/[^A-Za-z0-9]/.test(newPassword)) {
      newErrors.newPassword =
        "Password must include at least one special character";
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call to set new password
    try {
      // Here you would make your actual API call
      // await api.setNewPassword({ email, newPassword: formData.newPassword });

      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Clear any stored OTP timer data if exists
      localStorage.removeItem("otpTimerEnd");
      localStorage.removeItem("otpCanResend");

      // Call success callback
      onSuccess?.(formData.newPassword);
    } catch (error) {
      setErrors({
        submit: "Failed to set new password. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrengthColor = () => {
    const colors = {
      0: "bg-gray-200",
      1: "bg-red-500",
      2: "bg-orange-500",
      3: "bg-yellow-500",
      4: "bg-green-500",
    };
    return colors[passwordStrength.score] || "bg-gray-200";
  };

  const getPasswordStrengthTextColor = () => {
    const colors = {
      0: "text-gray-500",
      1: "text-red-500",
      2: "text-orange-500",
      3: "text-yellow-600",
      4: "text-green-600",
    };
    return colors[passwordStrength.score] || "text-gray-500";
  };

  return (
    <div className="w-full h-full flex md:justify-end overflow-hidden justify-center relative">
      <div className="relative md:w-2/5 w-full sm:min-w-[500px] max-w-[650px] flex items-center h-full bg-gradient-to-br from-card/70 via-card/70 to-card/70 backdrop-blur-sm xl:px-20 lg:px-15 md:px-10 sm:px-8 p-8 md:rounded-tl-[80px] md:rounded-bl-[80px] border-2 border-border overflow-auto">
        <motion.div
          className="text-left w-full"
          variants={formContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* BRANDING */}
          <div className="space-y-2 mb-5">
            <motion.h1
              variants={itemVariants}
              className="text-4xl font-poppins font-bold leading-tight"
            >
              <span className="bg-gradient-to-r mr-2 from-foreground to-foreground/80 bg-clip-text text-transparent">
                Set New
              </span>
              <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                Password
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
                Password Reset
              </span>
            </motion.div>
          </div>

          {/* PASSWORD FORM CARD */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-card/95 to-background/95 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-[0_8px_20px_-5px_rgba(0,0,0,0.5)] hover:shadow-2xl transition-shadow"
          >
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    Create New Password
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <Key size={12} />
                    Create a strong password for your account
                  </p>
                </div>
                {onBack && (
                  <button
                    onClick={onBack}
                    className="p-2 hover:bg-primary/5 rounded-lg transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={20} className="text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* NEW PASSWORD FIELD */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground tracking-wider flex items-center gap-2">
                  <Lock size={12} /> New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`w-full py-3.5 px-4 rounded-xl border-2 
                      ${
                        errors.newPassword
                          ? "border-red-500/50 bg-red-500/5 focus:ring-red-500/10"
                          : "border-border/50 bg-background/50 focus:border-primary/50"
                      }
                      focus:outline-none focus:ring-4 focus:ring-primary/10 
                      transition-all duration-200 pr-12`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Password strength indicator */}
                {formData.newPassword && (
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            level <= passwordStrength.score
                              ? getPasswordStrengthColor()
                              : "bg-border/50"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <span
                        className={`text-xs font-medium ${getPasswordStrengthTextColor()}`}
                      >
                        {passwordStrength.feedback}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formData.newPassword.length}/6+ characters
                      </span>
                    </div>
                  </div>
                )}

                {errors.newPassword && (
                  <div className="flex items-center gap-2 text-sm text-red-500">
                    <AlertCircle size={12} />
                    <span>{errors.newPassword}</span>
                  </div>
                )}

                {/* Password requirements */}
                <div className="grid grid-cols-2 gap-2 text-xs font-medium text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CheckCircle
                      size={10}
                      className={
                        formData.newPassword.length >= 6
                          ? "text-green-700"
                          : "text-gray-700"
                      }
                    />
                    <span>At least 6 characters</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle
                      size={10}
                      className={
                        /[A-Z]/.test(formData.newPassword)
                          ? "text-green-700"
                          : "text-gray-700"
                      }
                    />
                    <span>Uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle
                      size={10}
                      className={
                        /[0-9]/.test(formData.newPassword)
                          ? "text-green-700"
                          : "text-gray-700"
                      }
                    />
                    <span>Number</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle
                      size={10}
                      className={
                        /[^A-Za-z0-9]/.test(formData.newPassword)
                          ? "text-green-700"
                          : "text-gray-700"
                      }
                    />
                    <span>Special character</span>
                  </div>
                </div>
              </div>

              {/* CONFIRM PASSWORD FIELD */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground tracking-wider flex items-center gap-2">
                  <Shield size={12} /> Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full py-3.5 px-4 rounded-xl border-2 
                      ${
                        errors.confirmPassword
                          ? "border-red-500/50 bg-red-500/5 focus:ring-red-500/10"
                          : "border-border/50 bg-background/50 focus:border-primary/50"
                      }
                      focus:outline-none focus:ring-4 focus:ring-primary/10 
                      transition-all duration-200 pr-12`}
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="flex items-center gap-2 text-sm text-red-500">
                    <AlertCircle size={12} />
                    <span>{errors.confirmPassword}</span>
                  </div>
                )}
              </div>

              {/* SUBMIT BUTTON */}
              <motion.button
                variants={itemVariants}
                type="submit"
                disabled={isSubmitting || !isPasswordValid()}
                className={`w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground disabled:opacity-0
                  flex items-center justify-center gap-2 font-semibold relative overflow-hidden group disabled:cursor-not-allowed cursor-pointer
                  ${isSubmitting && "opacity-50 cursor-not-allowed"}`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="relative z-10">Setting Password...</span>
                  </>
                ) : (
                  <>
                    <Lock size={18} className="relative z-10" />
                    <span className="relative z-10">Set New Password</span>
                  </>
                )}
              </motion.button>

              {/* ERROR MESSAGE */}
              {errors.submit && (
                <motion.div
                  variants={itemVariants}
                  className="p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                >
                  <div className="flex items-center gap-2 text-sm text-red-500">
                    <AlertCircle size={12} />
                    <span>{errors.submit}</span>
                  </div>
                </motion.div>
              )}
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
