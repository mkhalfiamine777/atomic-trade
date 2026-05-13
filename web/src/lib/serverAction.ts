'use server'

/**
 * Server Action Helpers — Atomic Trade
 * Reusable wrappers for auth, validation, and error monitoring.
 * 
 * Designed to work with the existing { success, error } pattern.
 * Integrates Sentry for production error tracking (P0-2 audit fix).
 */

import * as Sentry from '@sentry/nextjs'

/**
 * Wraps a Server Action with Sentry error tracking.
 * Tags errors with the action name for easy filtering in Sentry dashboard.
 * 
 * Usage:
 *   const result = await withSentry('createListing', async () => {
 *     // ... your action logic
 *   })
 * 
 * @param actionName - Human-readable name for Sentry tags (e.g. 'createListing')
 * @param fn - The async function to execute
 */
export async function withSentry<T>(actionName: string, fn: () => Promise<T>): Promise<T> {
  return Sentry.withScope(async (scope) => {
    scope.setTag('action', actionName)
    try {
      return await fn()
    } catch (error) {
      Sentry.captureException(error, {
        tags: { action: actionName },
      })
      throw error  // re-throw so the calling action's catch block handles it
    }
  })
}
