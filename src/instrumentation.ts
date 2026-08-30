export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('[Sehetak Cron Engine] Starting automatic 45-second background reminder ticker...');

    // Run immediately on boot
    triggerCron();

    // Ticker interval every 45 seconds
    setInterval(() => {
      triggerCron();
    }, 45 * 1000);
  }
}

async function triggerCron() {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    await fetch(`${appUrl}/api/cron/dispatch-reminders`, {
      method: 'GET',
      cache: 'no-store',
    });
  } catch {
    // Ignore fetch errors during server initialization/shutdown
  }
}
