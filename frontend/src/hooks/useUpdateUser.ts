import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateUserProfile } from "@/api"
import { useAuth } from "@/context/AuthContext"

export function useUpdateUser() {
  const queryClient = useQueryClient()
  const { setUser } = useAuth()

  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string
      patch: {
        fitnessGoal?: string
        weight?: number
        contact?: { phone?: string; address?: string }
      }
    }) => updateUserProfile(id, patch),
    onSuccess: (user) => {
      setUser(user)
      void queryClient.invalidateQueries({ queryKey: ["users"] })
      void queryClient.invalidateQueries({ queryKey: ["user", user._id] })
      void queryClient.invalidateQueries({ queryKey: ["leaderboard"] })
    },
  })
}
