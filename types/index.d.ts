import "@total-typescript/ts-reset"

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}
