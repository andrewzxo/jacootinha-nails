"use client";

import { useEffect, useState } from "react";
import { useStudioStore } from "@/lib/studio-store";
import { LoginGate } from "@/components/site/LoginGate";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Services } from "@/components/site/Services";
import { Courses } from "@/components/site/Courses";
import { Gallery } from "@/components/site/Gallery";
import { Testimonials } from "@/components/site/Testimonials";
import { Footer } from "@/components/site/Footer";
import { CoursePage } from "@/components/site/CoursePage";
import { BookingDialog } from "@/components/site/BookingDialog";
import { LoginRequiredDialog } from "@/components/site/LoginRequiredDialog";
import { AdminArea } from "@/components/admin/AdminArea";
import { BUSINESS } from "@/lib/studio-data";

const COURSE_WHATSAPP_URL = `${BUSINESS.whatsapp.url}?text=${encodeURIComponent(
  "Olá! Tenho interesse no Curso Pro Nails — Molde F1. Quero mais informações sobre as turmas."
)}`;

export default function Home() {
  const session = useStudioStore((s) => s.session);
  const sessionLoading = useStudioStore((s) => s.sessionLoading);
  const adminView = useStudioStore((s) => s.adminView);
  const pendingAction = useStudioStore((s) => s.pendingAction);
  const setPendingAction = useStudioStore((s) => s.setPendingAction);
  const loadSession = useStudioStore((s) => s.loadSession);
  const loadServices = useStudioStore((s) => s.loadServices);
  const loadCourses = useStudioStore((s) => s.loadCourses);
  const loadGallery = useStudioStore((s) => s.loadGallery);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [preselected, setPreselected] = useState<string | null>(null);
  const [loginRequiredOpen, setLoginRequiredOpen] = useState(false);
  const [loginRequiredAction, setLoginRequiredAction] = useState<"booking" | "course" | null>(null);
  const [area] = useState<"unhas" | "curso">(() =>
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("area") === "curso"
      ? "curso"
      : "unhas"
  );

  // Document title per area
  useEffect(() => {
    document.title =
      area === "curso"
        ? "Curso Pro Nails Molde F1 — Jacqueline | Jacootinha Nails"
        : "Jacootinha Nails — Alongamentos & Curso Molde F1";
  }, [area]);

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    if (session) {
      loadServices().catch(() => {});
      loadCourses().catch(() => {});
      loadGallery().catch(() => {});
    }
  }, [session]);

  const openCourseWhatsApp = () => {
    window.open(COURSE_WHATSAPP_URL, "_blank", "noopener,noreferrer");
  };

  // Consume pending action after successful login/register (visitor gating)
  useEffect(() => {
    if (!session || session.role === "visitor") return;
    if (!pendingAction) return;
    const action = pendingAction;
    setPendingAction(null);
    const t = setTimeout(() => {
      if (action === "booking") {
        setPreselected(null);
        setBookingOpen(true);
      } else if (action === "course") {
        openCourseWhatsApp();
      }
    }, 150);
    return () => clearTimeout(t);
  }, [session, pendingAction, setPendingAction]);

  const isVisitor = !session || session.role === "visitor";

  const openBooking = (serviceId?: string | null) => {
    if (isVisitor) {
      setLoginRequiredAction("booking");
      setLoginRequiredOpen(true);
      return;
    }
    setPreselected(serviceId ?? null);
    setBookingOpen(true);
  };

  const requestEnroll = () => {
    if (isVisitor) {
      setLoginRequiredAction("course");
      setLoginRequiredOpen(true);
      return;
    }
    openCourseWhatsApp();
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--blush)] to-[var(--cream)]">
        <div className="font-script text-4xl text-[var(--rose-deep)] animate-pulse">Jacootinha Nails…</div>
      </div>
    );
  }

  if (!session) {
    return <LoginGate />;
  }

  if (adminView && session.role === "admin") {
    return <AdminArea />;
  }

  if (area === "curso") {
    return (
      <div className="min-h-screen flex flex-col">
        <CoursePage onEnroll={requestEnroll} />
        <LoginRequiredDialog
          open={loginRequiredOpen}
          onOpenChange={(v) => {
            setLoginRequiredOpen(v);
            if (!v) setPendingAction(null);
          }}
          action={loginRequiredAction}
          onGoToLogin={async () => {
            setLoginRequiredOpen(false);
            if (session?.role === "visitor") {
              await useStudioStore.getState().logout();
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header onBook={() => openBooking()} />
      <main className="flex-1">
        <Hero onBook={() => openBooking()} />
        <Services onBook={openBooking} />
        <Courses />
        <Gallery />
        <Testimonials />
      </main>
      <Footer />
      <BookingDialog
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        preselectedServiceId={preselected}
      />
      <LoginRequiredDialog
        open={loginRequiredOpen}
        onOpenChange={(v) => {
          setLoginRequiredOpen(v);
          if (!v) setPendingAction(null);
        }}
        action={loginRequiredAction}
        onGoToLogin={async () => {
          // Exit visitor mode; pendingAction is kept so the flow resumes after login
          setLoginRequiredOpen(false);
          if (session?.role === "visitor") {
            await useStudioStore.getState().logout();
          }
        }}
      />
    </div>
  );
}
