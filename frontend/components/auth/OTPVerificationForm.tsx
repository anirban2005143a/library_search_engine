"use client";

import React, { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from "react";
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
import { OTPVerificationFormProps } from "./types";

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



export const OTPVerificationForm: React.FC<OTPVerificationFormProps> = ({
  onBack,
  onVerify,
}) => {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [resendTimer, setResendTimer] = useState<number>(0);
  const [canResend, setCanResend] = useState<boolean>(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize email and OTP from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) setEmail(storedEmail);

    const storedOtp = localStorage.getItem("otpValue");
    const storedTime = localStorage.getItem("otpTimestamp");
    const now = Date.now();

    if (storedOtp && storedTime && now - parseInt(storedTime) < OTP_EXPIRY_MS) {
      if (/^\d{6}$/.test(storedOtp)) {
        const digits = storedOtp.split("");
        setOtp(digits);
        const nextEmpty = digits.findIndex((d) => d === "");
        setActiveIndex(nextEmpty === -1 ? 5 : nextEmpty);
      }
    } else {
      localStorage.removeItem("otpValue");
      localStorage.removeItem("otpTimestamp");
    }
  }, []);

  // Save OTP to localStorage whenever it changes
  useEffect(() => {
    const otpString = otp.join("");
    if (otpString !== "") {
      localStorage.setItem("otpValue", otpString);
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
        const remainingTime = Math.max(0, Math.floor((timerEnd - currentTime) / 1000));

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
        startResendTimer();
      }
    };

    initializeTimer();
  }, []);

  // Timer countdown effect with localStorage sync
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (resendTimer > 0 && !canResend) {
      timer = setTimeout(() => {
        const newTimer = resendTimer - 1;
        setResendTimer(newTimer);

        if (newTimer > 0) {
          const newEndTime = Date.now() + newTimer * 1000;
          localStorage.setItem("otpTimerEnd", newEndTime.toString());
        } else {
          setCanResend(true);
          localStorage.removeItem("otpTimerEnd");
          localStorage.setItem("otpCanResend", "true");
        }
      }, 1000);
    }

    return () => clearTimeout(timer);
  }, [resendTimer, canResend]);

  const startResendTimer = () => {
    const timerDuration = 60;
    const endTime = Date.now() + timerDuration * 1000;

    setResendTimer(timerDuration);
    setCanResend(false);
    localStorage.setItem("otpTimerEnd", endTime.toString());
    localStorage.removeItem("otpCanResend");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
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

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split("");
      const newOtp = [...otp];
      digits.forEach((digit, idx) => {
        if (idx < 6) newOtp[idx] = digit;
      });
      setOtp(newOtp);
      const lastIndex = Math.min(digits.length, 5);
      inputRefs.current[lastIndex]?.focus();
      setActiveIndex(lastIndex);
    }
  };

  const handleResendOTP = () => {
    if (canResend) {
      startResendTimer();
      console.log("Resending OTP to:", email);
    }
  };

  const handleVerify = () => {
    const otpValue = otp.join("");
    if (otpValue.length === 6) {
      setIsVerifying(true);
      setTimeout(() => {
        onVerify?.(otpValue);
        setIsVerifying(false);
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
          {/* OTP CARD */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-card/95 to-background/95 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-[0_8px_20px_-5px_rgba(0,0,0,0.5)] hover:shadow-2xl transition-shadow"
          >
            <div className="space-y-8">
              {/* OTP INPUT FIELDS */}
              <div className="space-y-4" onPaste={handlePaste}>
                <label className="text-sm font-medium text-muted-foreground tracking-wider flex items-center gap-2">
                  <KeyRound size={12} /> Enter 6-Digit Code
                </label>
                <div className="flex gap-3 justify-between">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el: HTMLInputElement | null) => { inputRefs.current[index] = el; }}      
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleChange(index, e.target.value)
                      }
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
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};