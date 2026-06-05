import React from "react";
import { Checkbox, InlineInput } from "@components";

interface CreateTodoItemFormProps {
  handleSubmit: (e: React.FormEvent) => void;
  handleChange: React.Dispatch<React.SetStateAction<string>>;
  value: string;
  handleCancel: () => void;
}

export const CreateTodoItemForm = ({
  handleSubmit,
  handleChange,
  handleCancel,
  value,
}: CreateTodoItemFormProps) => (
  <form onSubmit={handleSubmit}>
    <div className="flex items-center gap-3 px-6 py-3 border-b border-panel-divider">
      <Checkbox checked={false} />
      <InlineInput
        value={value}
        onChange={handleChange}
        onBlur={() => {
          if (!value.trim()) handleCancel();
        }}
        placeholder="New todo…"
        label="New todo name"
        className="flex-1 text-sm bg-transparent text-on-primary placeholder:text-on-primary-muted outline-none"
      />
    </div>
  </form>
);
