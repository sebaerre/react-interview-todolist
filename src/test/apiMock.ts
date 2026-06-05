import { vi } from 'vitest'
export { qk } from '../api/queryKeys'

export const apiFetch = vi.fn()
export const json = vi.fn()
export const fetchTodoLists = vi.fn()
export const fetchTodoItems = vi.fn()
export const createTodoList = vi.fn()
export const createTodoItem = vi.fn()
export const deleteList = vi.fn()
export const completeAll = vi.fn()
export const updateList = vi.fn()
export const deleteItem = vi.fn()
export const updateItem = vi.fn()
