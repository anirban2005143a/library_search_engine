"use client";

import LoginForm from "@/component/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="w-screen min-h-screen flex justify-end bg-background text-foreground relative overflow-hidden">
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

      <LoginForm />
    </div>
  );
}
