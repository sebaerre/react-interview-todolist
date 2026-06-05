import { motion } from "framer-motion";
import { TodoItem } from "@types";
import { TodoItemRow } from "@components";

const layoutTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
} as const;

interface TodoItemsList {
  todoItems: TodoItem[];
  listId: string;
}

export const TodoItemsList = ({ todoItems, listId }: TodoItemsList) =>
  todoItems.map((item) => (
    <motion.div key={item.id} layout transition={layoutTransition}>
      <TodoItemRow item={item} listId={listId} />
    </motion.div>
  ));
