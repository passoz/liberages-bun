export interface ShutdownHook {
  (): Promise<void> | void;
}

const shutdownHooks: ShutdownHook[] = [];

export function registerShutdownHook(hook: ShutdownHook): void {
  shutdownHooks.push(hook);
}

export async function gracefulShutdown(timeoutMs = 10000): Promise<{ success: boolean; duration: number }> {
  const start = Date.now();

  const shutdownPromise = Promise.all(
    shutdownHooks.map(async (hook) => {
      try {
        await hook();
      } catch (err) {
        console.error("Error running shutdown hook:", err);
      }
    })
  );

  const timeoutPromise = new Promise<void>((_, reject) => {
    const timer = setTimeout(() => reject(new Error("Graceful shutdown timeout")), timeoutMs);
    timer.unref?.();
  });

  try {
    await Promise.race([shutdownPromise, timeoutPromise]);
    return { success: true, duration: Date.now() - start };
  } catch {
    return { success: false, duration: Date.now() - start };
  }
}

if (typeof process !== "undefined" && process.on) {
  process.on("SIGTERM", async () => {
    const result = await gracefulShutdown(10000);
    process.exit(result.success ? 0 : 1);
  });
}
