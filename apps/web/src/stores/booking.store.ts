import { create } from "zustand";
import { Bike } from "@/types/bike.types";

export type BookingStep = 1 | 2 | 3 | 4;

export interface BookingState {
  // step 1
  selectedBikes: Bike[];
  isReservationCreated: boolean;

  // step 2
  slotHours: 1 | 2 | 3 | null;
  scheduledStart: string;

  // step 3
  notes: string;

  // step 4
  reservationId: string | null;
  clientKey: string | null;
  intentId: string | null;

  // pyament state tracking
  paymentStatus: 'idle' | 'initiated' | 'processing' | 'completed' | 'failed';
  setPaymentStatus: (status: BookingState['paymentStatus']) => void;

  // Navigation
  currentStep: BookingStep;

  // actions
  addBike: (bike: Bike) => void;
  setReservationCreated: (value: boolean) => void;
  removeBike: (bikeId: string) => void;
  setSlotHours: (hours: 1 | 2 | 3) => void;
  setScheduledStart: (date: string) => void;
  setNotes: (notes: string) => void;
  setStep: (step: BookingStep) => void;
  setReservation: (id: string, clientKey: string, intentId: string) => void;
  reset: () => void;

  // computed
  totalCost: () => number;
  canProceedStep1: () => boolean;
  canProceedStep2: () => boolean;
}

const RATE = 15000;

export const useBookingStore = create<BookingState>((set, get) => ({
  selectedBikes: [],
  isReservationCreated: false,
  slotHours: null,
  scheduledStart: "",
  notes: "",
  reservationId: null,
  clientKey: null,
  intentId: null,
  currentStep: 1,
  paymentStatus: 'idle',


  setPaymentStatus: (status) => set({ paymentStatus: status }),

  addBike: (bike) =>
    set((s) => {
      if (s.selectedBikes.length >= 5) return s;
      if (s.selectedBikes.find((b) => b._id === bike._id)) return s;
      return {
        selectedBikes: [...s.selectedBikes, bike],
      };
    }),
  setReservationCreated: (value) => set({ isReservationCreated: value }),
  removeBike: (bikeId) =>
    set((s) => ({
      selectedBikes: s.selectedBikes.filter((b) => b._id !== bikeId),
    })),
  setSlotHours: (hours) => set({ slotHours: hours }),
  setScheduledStart: (date) => set({ scheduledStart: date }),
  setNotes: (notes) => set({ notes }),
  setStep: (step) => set({ currentStep: step }),

  setReservation: (id, clientkey, intentId) =>
    set({ reservationId: id, clientKey: clientkey, intentId }),

  reset: () =>
    set({
      selectedBikes: [],
      slotHours: null,
      scheduledStart: "",
      notes: "",
      reservationId: null,
      clientKey: null,
      intentId: null,
      currentStep: 1,
      isReservationCreated: false,
      paymentStatus: 'idle',
    }),

  totalCost: () => {
    const { selectedBikes, slotHours } = get();
    if (!slotHours || selectedBikes.length === 0) return 0;
    return selectedBikes.length * slotHours * RATE;
  },

  canProceedStep1: () => get().selectedBikes.length > 0,

  canProceedStep2: () => {
    const { slotHours, scheduledStart } = get();
    if (!slotHours || !scheduledStart) return false;
    const date = new Date(scheduledStart);
    return date > new Date(); // Must be in the future
  },
}));

// addBike: (bike) => set((s) => {
//     if (s.selectedBikes.length >= 5) return s;

// })
