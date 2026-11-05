'use client'

import { create } from 'zustand'

export type ModalType = 'client' | 'appointment' | 'payment' | 'workorder' | 'membership'

export interface ModalPayload {
  id?: string
  clientId?: string
  start?: string
  kind?: 'ingreso' | 'gasto'
  amount?: number
  concept?: string
}

interface UiState {
  modal: { type: ModalType; payload: ModalPayload } | null
  detailClientId: string | null
  searchOpen: boolean
  toast: { id: number; text: string; tone: 'ok' | 'bad' } | null
  openModal: (type: ModalType, payload?: ModalPayload) => void
  closeModal: () => void
  openClient: (id: string | null) => void
  setSearchOpen: (open: boolean) => void
  notify: (text: string, tone?: 'ok' | 'bad') => void
}

export const useUi = create<UiState>()((set) => ({
  modal: null,
  detailClientId: null,
  searchOpen: false,
  toast: null,
  openModal: (type, payload = {}) => set({ modal: { type, payload }, searchOpen: false }),
  closeModal: () => set({ modal: null }),
  openClient: (id) => set({ detailClientId: id, searchOpen: false }),
  setSearchOpen: (open) => set({ searchOpen: open }),
  notify: (text, tone = 'ok') => set({ toast: { id: Date.now(), text, tone } }),
}))
