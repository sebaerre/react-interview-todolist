import '@testing-library/jest-dom/vitest'
import { vi, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import React from 'react'

afterEach(() => cleanup())

// Mock framer-motion globally — prevents animation timing issues in tests.
// Uses Proxy so every motion.* element (div, span, li, etc.) is covered.
vi.mock('framer-motion', () => {
  const passthrough = (tag: string) =>
    React.forwardRef(
      (
        {
          children,
          animate: _a,
          initial: _i,
          transition: _t,
          layout: _l,
          ...rest
        }: React.HTMLAttributes<HTMLElement> & {
          children?: React.ReactNode
          animate?: unknown
          initial?: unknown
          transition?: unknown
          layout?: unknown
        },
        ref: React.Ref<unknown>
      ) => React.createElement(tag, { ...rest, ref }, children)
    )
  return {
    motion: new Proxy({}, { get: (_target, prop: string) => passthrough(prop) }),
    AnimatePresence: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
  }
})
