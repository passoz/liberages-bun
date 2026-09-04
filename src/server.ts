export async function gracefulShutdown(timeoutMs = 10000): Promise<{ success: boolean; duration: number }> {
  return { success: false, duration: 0 };
}
