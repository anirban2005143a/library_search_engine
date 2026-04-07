"use client"

import React from "react"
import { ProtectedRoute } from "@/components/ProtectedRoute"

const FavoritesContent = () => {
  return <div>Favorites</div>
}

const Favorites = () => {
  return (
    <ProtectedRoute allowedRoles={["READER", "ADMIN", "ROOT_ADMIN"]}>
      <FavoritesContent />
    </ProtectedRoute>
  )
}

export default Favorites
