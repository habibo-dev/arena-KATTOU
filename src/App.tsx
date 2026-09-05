import { Suspense, lazy } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { I18nProvider } from '@/i18n';
import { ToastProvider } from '@/components/ui/Toast';
import { ClinicProvider } from '@/store/clinic';
import { SessionProvider } from '@/store/session';
import { PublicLayout, ScrollToTop } from '@/components/layout/PublicLayout';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { StaffLayout } from '@/components/layout/StaffLayout';
import { RequireAuth } from '@/components/guards/RequireAuth';
import { Icon } from '@/components/ui/Icon';

import Home from '@/pages/Home';
import Services from '@/pages/Services';
import About from '@/pages/About';
import Location from '@/pages/Location';
import Contact from '@/pages/Contact';
import Book from '@/pages/Book';
import NotFound from '@/pages/NotFound';

import StaffIndex from '@/pages/staff/StaffIndex';

/**
 * Patient + staff surfaces are code-split so the marketing homepage and the
 * booking flow ship the smallest possible bundle.
 */
const Lookup = lazy(() => import('@/pages/patient/Lookup'));
const AppointmentPage = lazy(() => import('@/pages/patient/AppointmentPage'));
const QueuePage = lazy(() => import('@/pages/patient/QueuePage'));
const CheckInPage = lazy(() => import('@/pages/patient/CheckInPage'));
const Platform = lazy(() => import('@/pages/Platform'));
const Reception = lazy(() => import('@/pages/staff/Reception'));
const DoctorDashboard = lazy(() => import('@/pages/staff/Doctor'));
const Patients = lazy(() => import('@/pages/staff/Patients'));
const Analytics = lazy(() => import('@/pages/staff/Analytics'));
const Notifications = lazy(() => import('@/pages/staff/Notifications'));
const Settings = lazy(() => import('@/pages/staff/Settings'));
const Team = lazy(() => import('@/pages/staff/Team'));

function LazyFallback() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <span className="flex items-center gap-2 text-[0.8125rem] text-stone-500">
        <Icon name="refresh" size={16} className="animate-spin" />
        …
      </span>
    </div>
  );
}

/**
 * HashRouter keeps deep links (/a/:token/queue, /staff/queue) working on any
 * static host — including the existing GitHub Pages deployment — with no
 * server rewrite rules.
 */
export default function App() {
  return (
    <I18nProvider>
      <ToastProvider>
        <ClinicProvider>
          <SessionProvider>
            <HashRouter>
              <ScrollToTop />
              <Suspense fallback={<LazyFallback />}>
                <Routes>
                  {/* Public clinic website */}
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/book" element={<Book />} />
                    <Route path="/location" element={<Location />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/platform" element={<Platform />} />
                  </Route>

                  {/* Patient experience — opaque capability tokens only */}
                  <Route element={<PatientLayout />}>
                    <Route path="/appointment" element={<Lookup />} />
                    <Route path="/a/:token" element={<AppointmentPage />} />
                    <Route path="/a/:token/queue" element={<QueuePage />} />
                    <Route path="/checkin/:token" element={<CheckInPage />} />
                  </Route>

                  {/* Staff */}
                  <Route path="/staff" element={<StaffIndex />} />
                  <Route element={<StaffLayout />}>
                    <Route
                      path="/staff/queue"
                      element={
                        <RequireAuth capability="queue:read">
                          <Reception />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/staff/doctor"
                      element={
                        <RequireAuth capability="consultation:control">
                          <DoctorDashboard />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/staff/patients"
                      element={
                        <RequireAuth capability="patients:read">
                          <Patients />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/staff/analytics"
                      element={
                        <RequireAuth capability="analytics:read">
                          <Analytics />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/staff/notifications"
                      element={
                        <RequireAuth capability="queue:read">
                          <Notifications />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/staff/settings"
                      element={
                        <RequireAuth capability="settings:read">
                          <Settings />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/staff/team"
                      element={
                        <RequireAuth capability="staff:manage">
                          <Team />
                        </RequireAuth>
                      }
                    />
                  </Route>

                  <Route path="/index.html" element={<Navigate to="/" replace />} />
                  <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
                </Routes>
              </Suspense>
            </HashRouter>
          </SessionProvider>
        </ClinicProvider>
      </ToastProvider>
    </I18nProvider>
  );
}
