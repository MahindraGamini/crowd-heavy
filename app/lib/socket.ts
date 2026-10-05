// lib/socket.ts
import type { Server } from "socket.io";

export const getIO = () => (globalThis as any).io as Server | undefined;