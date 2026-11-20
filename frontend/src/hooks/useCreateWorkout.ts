import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createWorkout } from "@/api"
import type { CreateWorkoutInput } from "@/types"

export function useCreateWorkout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateWorkoutInput) => createWorkout(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["activities", variables.userId],
      })
      void queryClient.invalidateQueries({
        queryKey: ["calories", variables.userId],
      })
      void queryClient.invalidateQueries({ queryKey: ["schema-variety"] })
    },
  })
}
