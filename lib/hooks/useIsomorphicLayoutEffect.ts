import { useEffect, useLayoutEffect } from "react";

/**
 * useIsomorphicLayoutEffect
 *
 * Resolves the SSR warning: "useLayoutEffect does nothing on the server because its
 * effect cannot be encoded into the server renderer's output format."
 *
 * On the server (SSR), useLayoutEffect is replaced with useEffect (a no-op during
 * render). On the client it uses the real useLayoutEffect so DOM measurements fire
 * synchronously before paint — matching the original behaviour.
 */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default useIsomorphicLayoutEffect;
