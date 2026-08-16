/// <reference types="vite/client" />

declare module "*.jsx" {
  import type { ComponentType } from "react";
  const component: ComponentType<Record<string, never>>;
  export default component;
}
