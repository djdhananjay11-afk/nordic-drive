import type { ThreeElements } from "@react-three/fiber";

/* eslint-disable @typescript-eslint/no-empty-object-type */

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
