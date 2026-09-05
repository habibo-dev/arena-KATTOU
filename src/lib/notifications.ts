import type {
  DeliveryResult,
  NotificationChannelId,
  NotificationEvent,
  NotificationRecord,
} from './types';
import { shortId } from './id';

/**
 * NOTIFICATION ARCHITECTURE
 *
 * Every state change that a patient should hear about emits a typed event on
 * an internal bus. Channels subscribe and deliver.
 *
 * HONESTY RULE (enforced in code):
 * `channel.isConfigured()` decides whether a channel is advertised as active.
 * The SMS / WhatsApp / push adapters shipped here are **not** configured, so
 * they return `delivered: false, reason: 'channel_not_configured'` and the UI
 * renders "قناة غير مُفعّلة" instead of claiming a message was sent.
 *
 * To go live: implement `send()` against a real provider (Twilio / WhatsApp
 * Cloud API / Web Push) and flip `enabled` in Settings → Notifications.
 */

export interface NotificationPayload {
  event: NotificationEvent;
  appointmentRef: string | null;
  patientName: string | null;
  phoneInternational: string | null;
  /** Pre-rendered strings for the in-app inbox (localised by the caller). */
  title: string;
  body: string;
  /** Data a real provider adapter will template from. */
  data: Record<string, string | number | null>;
}

export interface NotificationChannel {
  id: NotificationChannelId;
  /** Whether this channel is actually wired up. Drives honest UI copy. */
  isConfigured(): boolean;
  /** Human hint shown in Settings when not configured. */
  configurationHint(): string | null;
  send(payload: NotificationPayload): Promise<DeliveryResult>;
}

export type NotificationListener = (record: NotificationRecord) => void;

class NotificationBus {
  private channels = new Map<NotificationChannelId, NotificationChannel>();
  private listeners = new Set<NotificationListener>();
  private history: NotificationRecord[] = [];
  private queue: NotificationPayload[] = [];

  register(channel: NotificationChannel): void {
    this.channels.set(channel.id, channel);
  }

  unregister(id: NotificationChannelId): void {
    this.channels.delete(id);
  }

  channel(id: NotificationChannelId): NotificationChannel | undefined {
    return this.channels.get(id);
  }

  /** Channel capability map — the UI reads this to stay truthful. */
  capabilities(): { id: NotificationChannelId; configured: boolean; hint: string | null }[] {
    return [...this.channels.values()].map((c) => ({
      id: c.id,
      configured: c.isConfigured(),
      hint: c.configurationHint(),
    }));
  }

  subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Deliver to every channel registered for this event. Never throws. */
  async emit(payload: NotificationPayload): Promise<NotificationRecord[]> {
    this.queue.push(payload);
    const records: NotificationRecord[] = [];

    for (const channel of this.channels.values()) {
      if (!channel.isConfigured()) {
        const record = this.record(payload, {
          channel: channel.id,
          delivered: false,
          reason: 'channel_not_configured',
        });
        records.push(record);
        continue;
      }
      try {
        const result = await channel.send(payload);
        records.push(this.record(payload, result));
      } catch {
        records.push(
          this.record(payload, {
            channel: channel.id,
            delivered: false,
            reason: 'delivery_failed',
          }),
        );
      }
    }

    if (records.length === 0) {
      // No channel registered: still surface the event in-app so nothing is lost.
      records.push(
        this.record(payload, {
          channel: 'in_app',
          delivered: true,
        }),
      );
    }
    return records;
  }

  private record(payload: NotificationPayload, result: DeliveryResult): NotificationRecord {
    const rec: NotificationRecord = {
      id: shortId('ntf'),
      at: new Date().toISOString(),
      event: payload.event,
      appointmentRef: payload.appointmentRef,
      patientName: payload.patientName,
      title: payload.title,
      body: payload.body,
      channel: result.channel,
      delivered: result.delivered,
      reason: result.reason,
    };
    this.history.unshift(rec);
    this.history = this.history.slice(0, 200);
    for (const listener of this.listeners) listener(rec);
    return rec;
  }

  recent(limit = 40): NotificationRecord[] {
    return this.history.slice(0, limit);
  }

  clear(): void {
    this.history = [];
  }
}

/* ------------------------------------------------------------------ */
/* Channels                                                            */
/* ------------------------------------------------------------------ */

/** Always available. Feeds the in-app notification centre. */
export class InAppChannel implements NotificationChannel {
  id = 'in_app' as const;
  isConfigured(): boolean {
    return true;
  }
  configurationHint(): string | null {
    return null;
  }
  async send(payload: NotificationPayload): Promise<DeliveryResult> {
    void payload;
    return { channel: 'in_app', delivered: true };
  }
}

/**
 * SMS adapter — integration point only. Not configured by default, therefore
 * it never reports a successful send.
 */
export class SmsChannel implements NotificationChannel {
  id = 'sms' as const;
  constructor(
    private readonly config: { enabled: boolean; provider: string | null },
    private readonly sender?: (payload: NotificationPayload) => Promise<DeliveryResult>,
  ) {}
  isConfigured(): boolean {
    return Boolean(this.config.enabled && this.config.provider && this.sender);
  }
  configurationHint(): string | null {
    return this.isConfigured()
      ? null
      : 'Connect an SMS provider (API key + sender ID) in Settings → Notifications.';
  }
  async send(payload: NotificationPayload): Promise<DeliveryResult> {
    if (!this.isConfigured() || !this.sender) {
      return { channel: 'sms', delivered: false, reason: 'channel_not_configured' };
    }
    return this.sender(payload);
  }
}

/** WhatsApp adapter — integration point only. */
export class WhatsAppChannel implements NotificationChannel {
  id = 'whatsapp' as const;
  constructor(
    private readonly config: { enabled: boolean; provider: string | null },
    private readonly sender?: (payload: NotificationPayload) => Promise<DeliveryResult>,
  ) {}
  isConfigured(): boolean {
    return Boolean(this.config.enabled && this.config.provider && this.sender);
  }
  configurationHint(): string | null {
    return this.isConfigured()
      ? null
      : 'Connect the WhatsApp Business Cloud API (phone number ID + token) in Settings.';
  }
  async send(payload: NotificationPayload): Promise<DeliveryResult> {
    if (!this.isConfigured() || !this.sender) {
      return { channel: 'whatsapp', delivered: false, reason: 'channel_not_configured' };
    }
    return this.sender(payload);
  }
}

/** Web Push adapter — integration point only. */
export class PushChannel implements NotificationChannel {
  id = 'push' as const;
  constructor(private readonly config: { enabled: boolean; provider: string | null }) {}
  isConfigured(): boolean {
    return Boolean(this.config.enabled && this.config.provider);
  }
  configurationHint(): string | null {
    return this.isConfigured()
      ? null
      : 'Generate a VAPID key pair and register service-worker subscriptions.';
  }
  async send(payload: NotificationPayload): Promise<DeliveryResult> {
    if (!this.isConfigured()) {
      return { channel: 'push', delivered: false, reason: 'channel_not_configured' };
    }
    void payload;
    return { channel: 'push', delivered: false, reason: 'not_implemented' };
  }
}

/** The event catalogue. `t()` keys are resolved by the i18n layer. */
export const NOTIFICATION_EVENTS: { id: NotificationEvent; trigger: string }[] = [
  { id: 'appointment_confirmed', trigger: 'Booking confirmed by the system or reception.' },
  { id: 'appointment_reminder', trigger: 'Scheduled reminder before the visit.' },
  { id: 'patient_checked_in', trigger: 'Patient registers arrival (QR or button).' },
  { id: 'queue_approaching', trigger: 'The patient is getting close to the front of the queue.' },
  { id: 'three_patients_remaining', trigger: 'Three patients left ahead.' },
  { id: 'one_patient_remaining', trigger: 'One patient left ahead.' },
  { id: 'patient_is_next', trigger: 'No one left ahead — patient is next.' },
  { id: 'doctor_delay', trigger: 'Reception declares a delay for the doctor.' },
  { id: 'appointment_cancelled', trigger: 'Appointment cancelled by patient or staff.' },
];

export const notificationBus = new NotificationBus();
