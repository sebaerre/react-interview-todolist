import { memo } from "react";
import { motion } from "framer-motion";
import { Checkmark } from "../../icons";

interface Props {
  checked: boolean;
}

const transition = { type: "spring", stiffness: 400, damping: 25 } as const;

export const Checkbox = memo(function Checkbox({ checked }: Props) {
  return (
    <div
      className={[
        "w-[17px] h-[17px] shrink-0 rounded-sm border flex items-center justify-center overflow-hidden",
        checked ? "border-accent" : "border-tertiary-border",
      ].join(" ")}
    >
      <motion.div
        className="w-full h-full bg-accent flex items-center justify-center"
        initial={false}
        animate={{ scale: checked ? 1 : 0 }}
        transition={transition}
      >
        <Checkmark />
      </motion.div>
    </div>
  );
});
