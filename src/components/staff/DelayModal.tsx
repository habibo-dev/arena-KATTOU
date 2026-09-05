import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, InfoNote, Input } from '@/components/ui/Form';
import { useI18n } from '@/i18n';
import { useClinic } from '@/store/clinic';
import { useToast } from '@/components/ui/Toast';
import { safeInt } from '@/lib/validation';

const PRESETS = [10, 20, 30];

/** "تأخير الطبيب" — declared by reception, never inferred automatically. */
export function DelayModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const { declareDelay, clearDelay, clinicDelayMinutes, snapshot } = useClinic();
  const toast = useToast();
  const [custom, setCustom] = useState('');
  const [selected, setSelected] = useState<number | null>(clinicDelayMinutes || null);
  const [busy, setBusy] = useState(false);

  const apply = async (minutes: number) => {
    setBusy(true);
    await declareDelay(minutes, 'reception');
    setBusy(false);
    toast.push({
      tone: 'warn',
      title: t('reception.delayTitle'),
      body: t('reception.delayActive', { n: minutes }),
    });
    onClose();
  };

  const clear = async () => {
    setBusy(true);
    await clearDelay('reception');
    setBusy(false);
    setSelected(null);
    setCustom('');
    toast.push({ tone: 'neutral', title: t('reception.clearDelay') });
    onClose();
  };

  const affected = snapshot.waiting.length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('reception.delayTitle')}
      description={t('reception.delayBody')}
      tone="warn"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('cta.cancel')}
          </Button>
          {clinicDelayMinutes > 0 ? (
            <Button variant="ghost" onClick={clear} loading={busy}>
              {t('reception.clearDelay')}
            </Button>
          ) : null}
          <Button
            icon="timer"
            loading={busy}
            disabled={!selected || selected <= 0}
            onClick={() => selected && apply(selected)}
          >
            {t('reception.applyDelay')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {clinicDelayMinutes > 0 ? (
          <InfoNote tone="warn" icon="timer">
            {t('reception.delayActive', { n: clinicDelayMinutes })}
          </InfoNote>
        ) : null}

        <div>
          <p className="mb-2 text-[0.8125rem] font-medium text-navy-800">
            {t('reception.delayTitle')}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((minutes) => (
              <button
                key={minutes}
                type="button"
                onClick={() => {
                  setSelected(minutes);
                  setCustom('');
                }}
                className={`num h-12 rounded-md border text-[0.9375rem] font-semibold transition-colors ${
                  selected === minutes
                    ? 'border-navy-800 bg-navy-800 text-shell-50'
                    : 'border-shell-400 bg-white text-navy-800 hover:border-clay-400 hover:bg-clay-50'
                }`}
              >
                +{minutes}
              </button>
            ))}
          </div>
        </div>

        <Field label={t('reception.delayCustom')} htmlFor="customDelay">
          <Input
            id="customDelay"
            type="number"
            inputMode="numeric"
            min={0}
            max={240}
            value={custom}
            dir="ltr"
            className="text-start"
            onChange={(e) => {
              setCustom(e.target.value);
              setSelected(safeInt(e.target.value, 1, 240, 0) || null);
            }}
          />
        </Field>

        <InfoNote tone="info" icon="users">
          {t('reception.waitingPatients')}: <strong className="num">{affected}</strong>
          {' · '}
          {t('reception.delayBody')}
        </InfoNote>
      </div>
    </Modal>
  );
}
