// https://www.joshwcomeau.com/snippets/react-components/fade-in/
import React from "react";
import styles from "./fade.module.css";

function FadeIn({
  duration = 300,
  delay = 0,
  children,
  as,
  ...delegated
}: {
  duration?: number;
  delay?: number;
  children: React.ReactNode;
  as?: React.ElementType | React.ReactElement;
} & React.HTMLAttributes<HTMLElement>) {
  if (as !== null && React.isValidElement(as)) {
    return React.cloneElement(as as React.ReactElement<{ className?: string; style?: React.CSSProperties }>, {
      className: styles.fadeIn,
      style: {
        ...((as as React.ReactElement<{ style?: React.CSSProperties }>).props.style || {}),
        animationDuration: duration + "ms",
        animationDelay: delay + "ms",
      },
    });
  }
  const Element = as || "div";
  return (
    <Element
      {...delegated}
      className={styles.fadeIn}
      style={{
        ...(delegated.style || {}),
        animationDuration: duration + "ms",
        animationDelay: delay + "ms",
      }}
    >
      {children}
    </Element>
  );
}

export default FadeIn;
