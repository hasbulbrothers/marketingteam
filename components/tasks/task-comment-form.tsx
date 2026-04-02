"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function TaskCommentForm({ onSubmit }: { onSubmit: (message: string) => void }) {
  const [message, setMessage] = useState("");

  function handleSubmit() {
    const trimmed = message.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setMessage("");
  }

  return (
    <div className="rounded-[24px] bg-white p-5 shadow-sm">
      <div className="space-y-3">
        <Textarea
          className="min-h-28 rounded-[24px] border-none bg-background shadow-sm"
          placeholder="Add feedback, approval notes, or revision context"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <div className="flex justify-end">
          <Button className="rounded-2xl bg-primary text-primary-foreground hover:bg-primary/95" onClick={handleSubmit}>
            Add comment
          </Button>
        </div>
      </div>
    </div>
  );
}
