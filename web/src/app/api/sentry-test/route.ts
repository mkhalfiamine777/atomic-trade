// 🧪 Temporary Sentry verification endpoint
// DELETE THIS FILE after confirming Sentry receives errors.
// Created: 2026-05-13 — P0-2 Audit Fix

import { NextResponse } from 'next/server'

export async function GET() {
  // This will be caught by Sentry's server instrumentation
  throw new Error('[Sentry Test] 🧪 This is a deliberate test error — يمكن حذف هذا الملف بعد التأكد')
}

// Force Node.js runtime (not Edge) so server Sentry config picks it up
export const runtime = 'nodejs'
