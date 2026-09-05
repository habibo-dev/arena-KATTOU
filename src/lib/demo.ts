import type { Appointment, Patient, ServiceId } from './types';
import { bookingReference, capabilityToken, shortId, uuid } from './id';
import { SERVICE_IDS } from './types';

/**
 * DEMO DATA
 *
 * Explicitly labelled as demonstration data everywhere it can appear. It is
 * never presented as clinic history: `demoMode` is set when it is loaded and
 * the analytics screen shows a banner saying so.
 *
 * Names are generic Algerian first names; phone numbers use the reserved
 * demonstration range so no real subscriber can be contacted by mistake.
 */

const DEMO_PATIENTS: { name: string; phone: string }[] = [
  { name: 'Mohamed B.', phone: '+213550000001' },
  { name: 'Sara K.', phone: '+213550000002' },
  { name: 'Ahmed T.', phone: '+213550000003' },
  { name: 'Amina L.', phone: '+213550000004' },
  { name: 'Yacine H.', phone: '+213550000005' },
  { name: 'Nadia R.', phone: '+213550000006' },
  { name: 'Karim S.', phone: '+213550000007' },
  { name: 'Lina M.', phone: '+213550000008' },
];

/** Plan: [patient index, service, status, minutes checked in ago] */
type Row = [number, ServiceId, Appointment['status'], number];

const PLAN: Row[] = [
  [0, 'soins', 'completed', 145],
  [1, 'radio', 'completed', 120],
  [2, 'extractions', 'in_consultation', 12],
  [3, 'soins', 'waiting', 20],
  [4, 'protheses', 'waiting', 16],
  [5, 'odf', 'waiting', 11],
  [6, 'blanchiment', 'waiting', 6],
  [7, 'soins', 'confirmed', 0],
];

export function createDemoAppointments(date: string): {
  appointments: Appointment[];
  patients: Patient[];
} {
  const now = Date.now();
  const patients: Patient[] = DEMO_PATIENTS.map((p) => ({
    id: shortId('pat'),
    fullName: p.name,
    phone: p.phone,
    createdAt: new Date(now - 86400000 * 20).toISOString(),
    cancellationCount: 0,
    noShowCount: 0,
  }));

  let ticket = 0;
  const appointments: Appointment[] = PLAN.map(([index, serviceId, status, minutesAgo]) => {
    const patient = patients[index];
    ticket += 1;
    const queueNumber = status === 'confirmed' ? null : ticket;
    const checkedInAt =
      minutesAgo > 0 ? new Date(now - minutesAgo * 60000).toISOString() : null;

    const base: Appointment = {
      id: uuid(),
      ref: bookingReference(),
      token: capabilityToken(),
      patientId: patient.id,
      patientName: patient.fullName,
      patientPhone: patient.phone,
      serviceId,
      type: 'scheduled',
      status,
      date,
      slot: null,
      queueNumber,
      checkedInAt,
      consultationStartedAt:
        status === 'in_consultation' ? new Date(now - minutesAgo * 60000).toISOString() : null,
      completedAt: status === 'completed' ? new Date(now - (minutesAgo - 30) * 60000).toISOString() : null,
      waitingMode: status === 'confirmed' ? null : index % 3 === 0 ? 'outside' : 'inside',
      createdAt: new Date(now - 86400000 * 3).toISOString(),
      updatedAt: new Date(now - minutesAgo * 60000).toISOString(),
      history: [
        {
          at: new Date(now - 86400000 * 3).toISOString(),
          actor: 'demo',
          action: 'created_by_demo',
        },
      ],
    };

    // Measured durations are only attached to completed visits — the same rule
    // real data follows, so analytics behaves identically either way.
    if (status === 'completed') {
      base.slot = null;
      base.measuredDurationMinutes = [22, 14, 35][index % 3];
    }

    return base;
  });

  // Only completed/walk-in style services from the real catalogue are used.
  void SERVICE_IDS;

  return { appointments, patients };
}
