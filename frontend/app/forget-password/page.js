"use client";

import { ForgetPasswordForm } from "@/component/auth/ForgetPassword";
import { OTPVerificationForm } from "@/component/auth/OTPVerificationForm";
import { useState } from "react";

export default function VerifyOTPPage() {
  const [component, setcomponent] = useState(0);
  return (
    <div className="w-dvw h-dvh flex justify-end bg-background text-foreground relative overflow-hidden">
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

      {component == 0 && <OTPVerificationForm onVerify={() => setcomponent(1)}/>}
      {component == 1 && <ForgetPasswordForm onBack={() => setcomponent(0)}/>}
    </div>
  );
}
