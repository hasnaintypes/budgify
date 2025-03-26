"use client";

import * as React from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SmilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmojiPickerProps {
  selectedEmoji?: string;
  onEmojiSelect?: (emoji: any) => void;
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          aria-label="Pick an emoji"
        >
          <SmilePlus className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full border-none p-0 shadow-xl"
        side="right"
        sideOffset={40}
      >
        <Picker
          data={data}
          onEmojiSelect={onEmojiSelect}
          theme="light"
          previewPosition="none"
          skinTonePosition="none"
        />
      </PopoverContent>
    </Popover>
  );
}
