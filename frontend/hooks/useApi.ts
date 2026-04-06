/**
 * useApi Hook
 * Handles API calls with loading, error, and success states
 */

"use client"

import { useState, useCallback } from "react"
import { ApiError } from "@/lib/api/client"

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: ApiError | Error | null
  success: boolean
}

export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  })

  const execute = useCallback(async (apiCall: () => Promise<any>) => {
    setState({ data: null, loading: true, error: null, success: false })

    try {
      const response = await apiCall()
      setState({
        data: response.data || response,
        loading: false,
        error: null,
        success: true,
      })
      return response.data || response
    } catch (error) {
      const apiError =
        error instanceof ApiError
          ? error
          : new ApiError(500, null, String(error))
      setState({
        data: null,
        loading: false,
        error: apiError,
        success: false,
      })
      throw apiError
    }
  }, [])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null, success: false })
  }, [])

  return {
    ...state,
    execute,
    reset,
  }
}
