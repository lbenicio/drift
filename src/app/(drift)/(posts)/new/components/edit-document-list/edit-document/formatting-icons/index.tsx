import { Bold, Code, Image as ImageIcon, Italic, Link, List } from "react-feather";
import { RefObject, useCallback } from "react";
import styles from "./formatting-icons.module.css";
import { TextareaMarkdownRef } from "textarea-markdown-editor";
import { Tooltip } from "@components/tooltip";
import { Button } from "@components/button";
import clsx from "clsx";
import React from "react";

const formattingButtons = [
  { icon: <Bold />, name: "bold", trigger: "bold" as const },
  { icon: <Italic />, name: "italic", trigger: "italic" as const },
  { icon: <Link />, name: "hyperlink", trigger: "link" as const },
  { icon: <ImageIcon />, name: "image", trigger: "image" as const },
  { icon: <Code />, name: "code", trigger: "code" as const },
  { icon: <List />, name: "unordered-list", trigger: "unordered-list" as const },
];

function FormattingIcons({ textareaRef, className }: { textareaRef?: RefObject<TextareaMarkdownRef>; className?: string }) {
  const handleAction = useCallback(
    (trigger: string) => {
      textareaRef?.current?.trigger(trigger);
    },
    [textareaRef],
  );

  return (
    <div className={clsx(styles.actionWrapper, className)}>
      {formattingButtons.map(({ icon, name, trigger }) => (
        <Tooltip content={name[0].toUpperCase() + name.slice(1).replace("-", " ")} key={name} delayDuration={100}>
          <Button aria-label={name} onMouseDown={(e) => e.preventDefault()} onClick={() => handleAction(trigger)} variant="ghost">
            {React.cloneElement(icon, {
              className: "h-4 w-4",
            })}
          </Button>
        </Tooltip>
      ))}
    </div>
  );
}

export default FormattingIcons;
