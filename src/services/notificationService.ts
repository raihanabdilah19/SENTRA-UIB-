// Web Audio API chime generator for pleasant real-time notifications
export const playNotificationChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.45);
  } catch {
    // Ignore audio autoplays on restricted browsers
  }
};

// Dispatch simulated email notification with logs
export interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  sentAt: string;
  status: 'Sent' | 'Failed';
}

const EMAIL_LOGS_KEY = 'org_hub_email_logs_v1';

export const getEmailLogs = (): EmailLog[] => {
  try {
    const raw = localStorage.getItem(EMAIL_LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const sendSimulatedEmail = (recipient: string, subject: string, body: string): EmailLog => {
  const log: EmailLog = {
    id: 'em-' + Date.now(),
    recipient,
    subject,
    body,
    sentAt: 'Baru saja',
    status: 'Sent',
  };
  const logs = getEmailLogs();
  logs.unshift(log);
  try {
    localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify(logs.slice(0, 50)));
  } catch (e) {
    console.error(e);
  }
  return log;
};
