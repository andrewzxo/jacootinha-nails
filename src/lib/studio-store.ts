"use client";

import { create } from "zustand";
import {
  DEFAULT_WORK_HOURS,
  type Service,
  type Course,
  type Booking,
  type WorkHours,
  type DayBlock,
  type GalleryImage,
  type Session,
  type Role,
} from "@/lib/studio-data";

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || "Ocorreu um erro. Tente novamente.");
  }
  return data as T;
}

interface StudioState {
  session: Session | null;
  sessionLoading: boolean;
  loadSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<Session>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginVisitor: () => Promise<void>;
  logout: () => Promise<void>;

  services: Service[];
  loadServices: () => Promise<void>;
  addService: (s: Omit<Service, "id">) => Promise<void>;
  updateService: (id: string, s: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;

  courses: Course[];
  loadCourses: () => Promise<void>;
  addCourse: (c: Omit<Course, "id">) => Promise<void>;
  updateCourse: (id: string, c: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;

  bookings: Booking[];
  loadBookings: () => Promise<void>;
  addBooking: (b: Omit<Booking, "id" | "createdAt" | "serviceName">) => Promise<Booking>;
  updateBookingStatus: (id: string, status: Booking["status"]) => Promise<void>;
  rescheduleBooking: (id: string, date: string, time: string) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;

  workHours: WorkHours;
  loadWorkHours: () => Promise<void>;
  setWorkHours: (weekday: number, h: WorkHours[number]) => Promise<void>;

  blocks: DayBlock[];
  loadBlocks: () => Promise<void>;
  addBlock: (b: Omit<DayBlock, "id">) => Promise<void>;
  removeBlock: (id: string) => Promise<void>;

  gallery: GalleryImage[];
  loadGallery: () => Promise<void>;
  addGalleryImage: (g: { url: string; caption?: string; order?: number; imagePosition?: string }) => Promise<void>;
  removeGalleryImage: (id: string) => Promise<void>;

  adminView: boolean;
  setAdminView: (v: boolean) => void;

  pendingAction: "booking" | "course" | null;
  setPendingAction: (a: "booking" | "course" | null) => void;
}

export const useStudioStore = create<StudioState>()((set, get) => ({
  session: null,
  sessionLoading: true,
  loadSession: async () => {
    try {
      const s = await api<Session | null>("/api/auth/me");
      set({ session: s, sessionLoading: false });
    } catch {
      set({ session: null, sessionLoading: false });
    }
  },
  login: async (email, password) => {
    const s = await api<Session>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    set({ session: s, adminView: false });
    get().loadServices();
    return s;
  },
  register: async (name, email, password) => {
    const s = await api<Session>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    set({ session: s });
    get().loadServices();
  },
  loginVisitor: async () => {
    const s = await api<Session>("/api/auth/visitor", { method: "POST" });
    set({ session: s });
    get().loadServices();
  },
  logout: async () => {
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    set({ session: null, adminView: false });
  },

  services: [],
  loadServices: async () => {
    const services = await api<Service[]>("/api/services");
    set({ services });
  },
  addService: async (s) => {
    await api("/api/services", { method: "POST", body: JSON.stringify(s) });
    await get().loadServices();
  },
  updateService: async (id, s) => {
    await api("/api/services", { method: "PUT", body: JSON.stringify({ id, ...s }) });
    await get().loadServices();
  },
  deleteService: async (id) => {
    await api(`/api/services?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    await get().loadServices();
  },

  courses: [],
  loadCourses: async () => {
    const courses = await api<Course[]>("/api/courses");
    set({ courses });
  },
  addCourse: async (c) => {
    await api("/api/courses", { method: "POST", body: JSON.stringify(c) });
    await get().loadCourses();
  },
  updateCourse: async (id, c) => {
    await api("/api/courses", { method: "PUT", body: JSON.stringify({ id, ...c }) });
    await get().loadCourses();
  },
  deleteCourse: async (id) => {
    await api(`/api/courses?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    await get().loadCourses();
  },

  bookings: [],
  loadBookings: async () => {
    const bookings = await api<Booking[]>("/api/bookings");
    set({ bookings });
  },
  addBooking: async (b) => {
    const booking = await api<Booking>("/api/bookings", {
      method: "POST",
      body: JSON.stringify(b),
    });
    return booking;
  },
  updateBookingStatus: async (id, status) => {
    await api(`/api/bookings/${id}`, { method: "PUT", body: JSON.stringify({ status }) });
    await get().loadBookings();
  },
  rescheduleBooking: async (id, date, time) => {
    await api(`/api/bookings/${id}`, { method: "PUT", body: JSON.stringify({ date, time }) });
    await get().loadBookings();
  },
  deleteBooking: async (id) => {
    await api(`/api/bookings/${id}`, { method: "DELETE" });
    await get().loadBookings();
  },

  workHours: DEFAULT_WORK_HOURS,
  loadWorkHours: async () => {
    const wh = await api<WorkHours>("/api/workhours");
    set({ workHours: wh });
  },
  setWorkHours: async (weekday, h) => {
    set((st) => ({ workHours: { ...st.workHours, [weekday]: h } }));
    await api("/api/workhours", {
      method: "PUT",
      body: JSON.stringify({ weekday, ...h }),
    });
  },

  blocks: [],
  loadBlocks: async () => {
    const blocks = await api<DayBlock[]>("/api/blocks");
    set({ blocks });
  },
  addBlock: async (b) => {
    await api("/api/blocks", { method: "POST", body: JSON.stringify(b) });
    await get().loadBlocks();
  },
  removeBlock: async (id) => {
    await api(`/api/blocks?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    await get().loadBlocks();
  },

  gallery: [],
  loadGallery: async () => {
    const gallery = await api<GalleryImage[]>("/api/gallery");
    set({ gallery });
  },
  addGalleryImage: async (g) => {
    await api("/api/gallery", { method: "POST", body: JSON.stringify(g) });
    await get().loadGallery();
  },
  removeGalleryImage: async (id) => {
    await api(`/api/gallery?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    await get().loadGallery();
  },

  adminView: false,
  setAdminView: (v) => set({ adminView: v }),

  pendingAction: null,
  setPendingAction: (a) => set({ pendingAction: a }),
}));

export type { Role };
export { api };
