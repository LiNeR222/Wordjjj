import { runInAction } from 'mobx'
import { SerializedError } from '@/shared/lib/serialized-error'

interface Context {
  loading: boolean
  error: SerializedError | null
}

export async function withErrorAndLoading<T>(
  context: Context,
  action: () => Promise<T>
): Promise<T | void> {
  runInAction(() => {
    context.loading = true
    context.error = null
  })

  try {
    const result = await action()
    return result
  } catch (err) {
    runInAction(() => {
      context.error = err as SerializedError
    })
  } finally {
    runInAction(() => {
      context.loading = false
    })
  }
}
