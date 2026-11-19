import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateUser } from "@/api"
import type { User } from "@/types"

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string
      patch: Partial<Pick<User, "goal" | "weightKg">> & {
        contact?: Partial<User["contact"]>
      }
    }) => updateUser(id, patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] })
      void queryClient.invalidateQueries({ queryKey: ["leaderboard"] })
    },
  })
}
