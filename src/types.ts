export enum TodoStatus {
  Pending = "Pending",
  Done = "Done",
  Syncing = "Syncing",
}

export interface TodoList {
  id: string;
  name: string;
}

export interface TodoItem {
  id: number;
  todoList: string;
  name: string;
  done: boolean;
}

/** Streaming payload emitted by the server for each item marked done during a complete-all operation. */
export interface CompleteAllProgressEvent {
  itemId: number;
  completed: number;
  total: number;
}
