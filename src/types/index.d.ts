import "@total-typescript/ts-reset";

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "@styles/globals.css";
declare module "@styles/markdown.css";
declare module "@styles/syntax.css";
