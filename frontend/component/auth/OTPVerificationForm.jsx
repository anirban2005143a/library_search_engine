"use client";

import React from "react";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  KeyRound,
  Shield,
  ArrowLeft,
  CheckCircle,
  Mail,
  Clock,
  ArrowRight,
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
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 Minutes

export const OTPVerificationForm = ({ onBack, onVerify }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [email, setEmail] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Initialize email and OTP from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) setEmail(storedEmail);

    const storedOtp = localStorage.getItem("otpValue");
    const storedTime = localStorage.getItem("otpTimestamp");
    const now = Date.now();

    // Check if OTP exists and is not expired
    if (storedOtp && storedTime && now - parseInt(storedTime) < OTP_EXPIRY_MS) {
      if (/^\d{6}$/.test(storedOtp)) {
        console.log("otp found on local store")
        const digits = storedOtp.split("");
        setOtp(digits);
        const nextEmpty = digits.findIndex((d) => d === "");
        setActiveIndex(nextEmpty === -1 ? 5 : nextEmpty);
      }
    } else {
      // Clear expired or non-existent data
      localStorage.removeItem("otpValue");
      localStorage.removeItem("otpTimestamp");
    }
  }, []);

  // Save OTP to localStorage whenever it changes (optional)
  useEffect(() => {
    const otpString = otp.join("");
    if (otpString !== "") {
      localStorage.setItem("otpValue", otpString);
      // Only set timestamp if it doesn't exist yet (start of entry)
      if (!localStorage.getItem("otpTimestamp")) {
        localStorage.setItem("otpTimestamp", Date.now().toString());
      }
    } else {
      localStorage.removeItem("otpValue");
      localStorage.removeItem("otpTimestamp");
    }
  }, [otp]);

  // Initialize or restore timer from localStorage
  useEffect(() => {
    const initializeTimer = () => {
      const storedTimerEnd = localStorage.getItem("otpTimerEnd");
      const storedCanResend = localStorage.getItem("otpCanResend");

      if (storedTimerEnd) {
        const timerEnd = parseInt(storedTimerEnd, 10);
        const currentTime = Date.now();
        const remainingTime = Math.max(
          0,
          Math.floor((timerEnd - currentTime) / 1000),
        );

        if (remainingTime > 0) {
          setResendTimer(remainingTime);
          setCanResend(false);
        } else {
          setResendTimer(0);
          setCanResend(true);
          localStorage.removeItem("otpTimerEnd");
          localStorage.setItem("otpCanResend", "true");
        }
      } else if (storedCanResend === "true") {
        setCanResend(true);
        setResendTimer(0);
      } else {
        // Start initial timer if no stored state
        startResendTimer();
      }
    };

    initializeTimer();
  }, []);

  // Timer countdown effect with localStorage sync
  useEffect(() => {
    let timer;

    if (resendTimer > 0 && !canResend) {
      timer = setTimeout(() => {
        const newTimer = resendTimer - 1;
        setResendTimer(newTimer);

        // Update localStorage with new end time
        if (newTimer > 0) {
          const newEndTime = Date.now() + newTimer * 1000;
          localStorage.setItem("otpTimerEnd", newEndTime.toString());
        } else {
          // Timer finished
          setCanResend(true);
          localStorage.removeItem("otpTimerEnd");
          localStorage.setItem("otpCanResend", "true");
        }
      }, 1000);
    }

    return () => clearTimeout(timer);
  }, [resendTimer, canResend]);

  const startResendTimer = () => {
    const timerDuration = 60; // 1 minute in seconds
    const endTime = Date.now() + timerDuration * 1000;

    setResendTimer(timerDuration);
    setCanResend(false);
    localStorage.setItem("otpTimerEnd", endTime.toString());
    localStorage.removeItem("otpCanResend");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    // Take only the last character if multiple are pasted
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
        setActiveIndex(index - 1);
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveIndex(index - 1);
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split("");
      const newOtp = [...otp];
      digits.forEach((digit, idx) => {
        if (idx < 6) newOtp[idx] = digit;
      });
      setOtp(newOtp);
      // Focus the last filled input
      const lastIndex = Math.min(digits.length, 5);
      inputRefs.current[lastIndex]?.focus();
      setActiveIndex(lastIndex);
    }
  };

  const handleResendOTP = () => {
    if (canResend) {
      startResendTimer();
      // Here you would call your API to resend OTP
      console.log("Resending OTP to:", email);

      // Show a toast or notification (you can implement this)
      // For now, just console log
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");
    if (otpValue.length === 6) {
      setIsVerifying(true);
      // Simulate API call
      setTimeout(() => {
        onVerify?.(otpValue);
        setIsVerifying(false);
        // Clear timer data on successful verification
        localStorage.removeItem("otpTimerEnd");
        localStorage.removeItem("otpCanResend");
      }, 1500);
    }
  };

  return (
    <div className="w-full h-full flex md:justify-end overflow-hidden justify-center relative">
      <div className="relative md:w-2/5 w-full sm:min-w-[500px] max-w-[650px]  grid min-h-screen  bg-gradient-to-br from-card/70 via-card/70 to-card/70 backdrop-blur-sm xl:px-20 lg:px-15 md:px-10 sm:px-8 p-8 md:rounded-tl-[80px] md:rounded-bl-[80px] border-2 border-border overflow-auto">
        <motion.div
          className="text-left w-full my-auto "
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
                Verify
              </span>
              <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                Your OTP
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
                Two-Factor Authentication
              </span>
            </motion.div>
          </div>

          {/* OTP CARD */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-card/95 to-background/95 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-[0_8px_20px_-5px_rgba(0,0,0,0.5)] hover:shadow-2xl transition-shadow"
          >
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    Verification Code
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <Mail size={12} />
                    We've sent a 6-digit code to
                    <span className="font-medium text-primary">{email}</span>
                  </p>
                </div>
                {onVerify && (
                  <button
                    onClick={() => {
                      if (otp.join("").length === 6) {
                        onVerify(otp.join(""));
                      }
                    }}
                    disabled={otp.join("").length !== 6}
                    className={`p-2 px-3 cursor-pointer rounded-lg transition-colors 
                          disabled:cursor-not-allowed ${
                            otp.join("").length === 6
                              ? "hover:bg-primary/5 text-primary"
                              : "opacity-50 cursor-not-allowed"
                          }`}
                  >
                    <ArrowRight size={20} className="text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-8">
              {/* OTP INPUT FIELDS */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-muted-foreground tracking-wider flex items-center gap-2">
                  <KeyRound size={12} /> Enter 6-Digit Code
                </label>
                <div
                  className="flex gap-3 justify-between"
                  onPaste={handlePaste}
                >
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={`w-full h-14 text-center text-xl font-semibold rounded-xl border-2 
                        ${
                          digit
                            ? "border-primary/50 bg-primary/5"
                            : activeIndex === index
                              ? "border-primary/70 bg-background/80 ring-4 ring-primary/10"
                              : "border-border/50 bg-background/50"
                        } 
                        focus:border-primary/50 outline-none focus:ring-4 focus:ring-primary/10 
                        transition-all duration-200 shadow-sm hover:shadow-md`}
                    />
                  ))}
                </div>
              </div>

              {/* VERIFY BUTTON */}
              <motion.button
                variants={itemVariants}
                onClick={handleVerify}
                disabled={otp.join("").length !== 6 || isVerifying}
                className={`w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground  disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold relative overflow-hidden group cursor-pointer `}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {isVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="relative z-10">Verifying...</span>
                  </>
                ) : (
                  <>
                    <Shield size={18} className="relative z-10" />
                    <span className="relative z-10">Verify & Access</span>
                  </>
                )}
              </motion.button>

              {/* RESEND OTP SECTION */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/80" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card/80 px-3 text-muted-foreground flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary" />
                      Didn't receive code?
                      <span className="w-1 h-1 rounded-full bg-primary" />
                    </span>
                  </div>
                </div>

                <div className="text-center space-y-2">
                  {canResend ? (
                    <button
                      onClick={handleResendOTP}
                      className="text-sm text-primary font-medium transition-all duration-200 hover:underline decoration-primary/80 underline-offset-4 cursor-pointer"
                    >
                      Resend verification code
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Clock size={14} className="text-primary" />
                      <span>
                        Resend code available in{" "}
                        <span className="font-mono font-semibold text-primary bg-primary/5 px-1.5 py-0.5 rounded">
                          {formatTime(resendTimer)}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* INFO MESSAGE */}
              <motion.div
                variants={itemVariants}
                className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle size={12} className="text-primary" />
                  <span>
                    For security reasons, the code expires in{" "}
                    <strong> 10 minutes</strong>
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
