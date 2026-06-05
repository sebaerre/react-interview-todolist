import { Spinner } from "@components";
import { motion } from "framer-motion";

interface TodoItemLabelProps {
  name: string;
  done: boolean;
  syncing: boolean;
}

const strikeTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
} as const;

export const TodoItemLabel = ({ name, done, syncing }: TodoItemLabelProps) => (
  <span className="min-w-0">
    <span
      className={[
        "relative inline-block text-sm transition-colors duration-300",
        done ? "text-on-primary-muted" : "text-on-primary",
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        {name} {syncing && <Spinner size={16} label="Saving" />}
      </div>
      <motion.span
        className="absolute left-0 top-1/2 -translate-y-1/2 h-px w-full bg-on-primary-muted block"
        initial={false}
        animate={{ scaleX: done ? 1 : 0 }}
        transition={{
          ...strikeTransition,
          delay: done ? 0.1 : 0,
        }}
        style={{ transformOrigin: "left" }}
      />
    </span>
  </span>
);
