import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { Badge, Card, CardBody, SectionHeading } from '@/components/ui/Card';
import { AnchorButton, LinkButton } from '@/components/ui/Button';
import { FaqList } from '@/components/clinic/FaqList';
import { useI18n } from '@/i18n';
import { CLINIC } from '@/lib/clinic';

/**
 * /platform — the product page for clinic owners.
 * Positioning: appointment + queue management, not "online booking".
 */
export default function Platform() {
  const { t } = useI18n();

  return (
    <>
      <section className="surface-navy">
        <div className="container-page py-14 sm:py-20">
          <div className="max-w-2xl">
            <Badge tone="accent" size="sm" className="bg-sage-500/15 text-sage-200 ring-sage-300/25">
              {t('landing.forClinics')}
            </Badge>
            <h1 className="mt-4 text-[1.9rem] leading-[1.25] font-semibold text-shell-50 sm:text-[2.5rem] sm:leading-[1.2]">
              {t('landing.heroTitle')}
            </h1>
            <p className="mt-4 max-w-measure text-[0.9375rem] leading-[1.85] text-shell-200/75 sm:text-[1.0625rem]">
              {t('landing.heroSub')}
            </p>
            <p className="mt-4 text-[0.9375rem] font-semibold text-sage-300">
              {t('home.queuePitchTitle')}
            </p>
            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
              <LinkButton
                to="/book"
                size="lg"
                className="bg-shell-50 text-navy-900 hover:bg-white active:bg-shell-100"
                icon="calendar"
              >
                {t('cta.book')}
              </LinkButton>
              <LinkButton
                to="/staff"
                size="lg"
                variant="ghost"
                className="text-shell-100 ring-1 ring-inset ring-shell-50/20 hover:bg-shell-50/10"
                icon="lock"
              >
                {t('landing.discoverSystem')}
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="border-b border-shell-300 bg-shell-50">
        <div className="container-page grid gap-6 py-14 sm:py-18 md:grid-cols-2">
          <Card className="border-[#EBD0CD] bg-[#FDF7F6]">
            <CardBody>
              <span className="grid h-10 w-10 place-items-center rounded-md bg-[#FBEEED] text-[#8E3730]">
                <Icon name="alert" size={19} />
              </span>
              <h2 className="mt-4 text-[1.0625rem] font-semibold text-navy-900">
                {t('landing.problemTitle')}
              </h2>
              <p className="mt-2 text-[0.875rem] leading-[1.85] text-stone-600">
                {t('landing.problemBody')}
              </p>
            </CardBody>
          </Card>
          <Card className="border-sage-200 bg-sage-50/50">
            <CardBody>
              <span className="grid h-10 w-10 place-items-center rounded-md bg-sage-100 text-sage-700">
                <Icon name="checkCircle" size={19} />
              </span>
              <h2 className="mt-4 text-[1.0625rem] font-semibold text-navy-900">
                {t('landing.solutionTitle')}
              </h2>
              <p className="mt-2 text-[0.875rem] leading-[1.85] text-stone-600">
                {t('landing.solutionBody')}
              </p>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-shell-300 bg-white">
        <div className="container-page py-14 sm:py-18">
          <SectionHeading eyebrow={t('landing.featuresTitle')} title={t('landing.featuresTitle')} />
          <ul className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: 'calendar' as const, title: t('landing.f1Title'), body: t('landing.f1Body') },
              { icon: 'ticket' as const, title: t('landing.f2Title'), body: t('landing.f2Body') },
              { icon: 'clock' as const, title: t('landing.f3Title'), body: t('landing.f3Body') },
              { icon: 'pin' as const, title: t('landing.f4Title'), body: t('landing.f4Body') },
              { icon: 'users' as const, title: t('landing.f5Title'), body: t('landing.f5Body') },
              { icon: 'stethoscope' as const, title: t('landing.f6Title'), body: t('landing.f6Body') },
            ].map((feature) => (
              <li key={feature.title}>
                <Card className="h-full p-5">
                  <span className="grid h-10 w-10 place-items-center rounded-md bg-navy-800 text-shell-50">
                    <Icon name={feature.icon} size={19} />
                  </span>
                  <h3 className="mt-4 text-[0.9375rem] font-semibold text-navy-900">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-stone-600">
                    {feature.body}
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Screens */}
      <section className="border-b border-shell-300 surface-quiet">
        <div className="container-page py-14 sm:py-18">
          <SectionHeading eyebrow={t('home.howTitle')} title={t('home.valuesTitle')} />
          <div className="mt-9 grid gap-5 lg:grid-cols-3">
            <ScreenCard
              icon="users"
              title={t('reception.title')}
              body={t('landing.f5Body')}
              to="/staff/queue"
              points={[
                t('reception.queueManager'),
                t('reception.actionAdd'),
                t('reception.delayTitle'),
                t('reception.typeEmergency'),
              ]}
            />
            <ScreenCard
              icon="stethoscope"
              title={t('doctor.title')}
              body={t('landing.f6Body')}
              to="/staff/doctor"
              points={[
                t('doctor.nextAction'),
                t('doctor.startVisit'),
                t('doctor.finishVisit'),
                t('doctor.emergency'),
              ]}
            />
            <ScreenCard
              icon="chart"
              title={t('analytics.title')}
              body={t('analytics.subtitle')}
              to="/staff/analytics"
              points={[
                t('analytics.avgWaiting'),
                t('analytics.peakHours'),
                t('analytics.busiestDays'),
                t('analytics.byService'),
              ]}
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-b border-shell-300 bg-shell-50">
        <div className="container-page py-14 sm:py-18">
          <SectionHeading eyebrow={t('pricing.title')} title={t('pricing.title')} body={t('pricing.subtitle')} />

          <ul className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <PlanCard
              name={t('pricing.trial')}
              description={t('pricing.trialDesc')}
              features={['featureBooking', 'featureQueue', 'featureEta']}
            />
            <PlanCard
              name={t('pricing.basic')}
              description={t('pricing.basicDesc')}
              features={['featureBooking', 'featureQueue', 'featureEta', 'featureReception']}
            />
            <PlanCard
              name={t('pricing.professional')}
              description={t('pricing.professionalDesc')}
              highlighted
              features={[
                'featureBooking',
                'featureQueue',
                'featureEta',
                'featureReception',
                'featureDoctor',
                'featureAnalytics',
              ]}
            />
            <PlanCard
              name={t('pricing.clinic')}
              description={t('pricing.clinicDesc')}
              features={[
                'featureBooking',
                'featureQueue',
                'featureEta',
                'featureReception',
                'featureDoctor',
                'featureAdvancedAnalytics',
                'featureMultiDoctor',
                'featureSupport',
              ]}
            />
          </ul>

          <div className="mt-8 rounded-xl border border-shell-300 bg-white p-5 sm:p-6">
            <h3 className="text-[1rem] font-semibold text-navy-900">{t('pricing.dependsOn')}</h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {[
                t('pricing.depends1'),
                t('pricing.depends2'),
                t('pricing.depends3'),
                t('pricing.depends4'),
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-[0.8125rem] text-stone-600">
                  <Icon name="check" size={15} className="mt-0.5 shrink-0 text-sage-500" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[0.8125rem] text-stone-500">
              {t('admin.notificationsBody')}
            </p>
            <AnchorButton
              href={`tel:${CLINIC.phones[0].international}`}
              className="mt-4"
              icon="phone"
            >
              {t('pricing.contactForPricing')}
            </AnchorButton>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white">
        <div className="container-page py-14 sm:py-18">
          <SectionHeading eyebrow="FAQ" title={t('home.faqTitle')} />
          <FaqList className="mt-8 max-w-3xl" />
          <div className="mt-8 flex flex-wrap gap-2.5">
            <LinkButton to="/book" icon="calendar">
              {t('cta.book')}
            </LinkButton>
            <LinkButton to="/staff" variant="secondary" icon="lock">
              {t('landing.discoverSystem')}
            </LinkButton>
          </div>
        </div>
      </section>
    </>
  );
}

function ScreenCard({
  icon,
  title,
  body,
  points,
  to,
}: {
  icon: 'users' | 'stethoscope' | 'chart';
  title: string;
  body: string;
  points: string[];
  to: string;
}) {
  const { t } = useI18n();
  return (
    <Card className="flex h-full flex-col">
      <CardBody className="flex flex-1 flex-col">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-sage-50 text-sage-600">
          <Icon name={icon} size={19} />
        </span>
        <h3 className="mt-4 text-[1rem] font-semibold text-navy-900">{title}</h3>
        <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-stone-600">{body}</p>
        <ul className="mt-4 space-y-1.5">
          {points.map((point) => (
            <li key={point} className="flex items-start gap-2 text-[0.8125rem] text-navy-800">
              <Icon name="check" size={14} className="mt-0.5 shrink-0 text-sage-500" />
              {point}
            </li>
          ))}
        </ul>
        <Link
          to={to}
          className="mt-auto flex items-center gap-1.5 pt-5 text-[0.8125rem] font-medium text-sage-600 hover:text-sage-700"
        >
          {t('landing.discoverSystem')}
          <Icon name="arrowLeft" size={14} />
        </Link>
      </CardBody>
    </Card>
  );
}

function PlanCard({
  name,
  description,
  features,
  highlighted = false,
}: {
  name: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}) {
  const { t } = useI18n();
  return (
    <li>
      <Card
        className={`flex h-full flex-col ${
          highlighted ? 'border-navy-300 ring-1 ring-navy-200' : ''
        }`}
      >
        <CardBody className="flex flex-1 flex-col">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[1rem] font-semibold text-navy-900">{name}</h3>
            {highlighted ? (
              <Badge tone="accent" size="sm">
                {t('pricing.professional')}
              </Badge>
            ) : null}
          </div>
          <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-stone-600">{description}</p>

          <p className="mt-4 rounded-md border border-shell-300 bg-shell-50 px-3 py-2.5 text-[0.8125rem] font-medium text-navy-800">
            {t('pricing.priceOnRequest')}
          </p>

          <ul className="mt-4 flex-1 space-y-1.5">
            {features.map((key) => (
              <li key={key} className="flex items-start gap-2 text-[0.8125rem] text-navy-800">
                <Icon name="check" size={14} className="mt-0.5 shrink-0 text-sage-500" />
                {t(`pricing.${key as 'featureBooking'}`)}
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </li>
  );
}
