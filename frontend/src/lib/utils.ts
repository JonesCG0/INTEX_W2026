import { clsx } from "clsx"
import type { ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
} 

// This flag is used by a few components that need to know when they are embedded.
export const isIframe = window.self !== window.top;
