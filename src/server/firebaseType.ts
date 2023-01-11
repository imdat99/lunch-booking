export type User = {
  bankName?: string
  ldapAcc?: string
  address?: string
  age?: string
  bankAccount?: string
  bankAccountName?: string
  name?: string | null
  password?: string
  phone?: string
  email?: string | null
  lastSeen?: string | null
  uid?: string | null
  count?: number
  photoURL?: string | null
  qrCodeURL?: string
}

// export type PayHistory = {}

export interface IEvent {
  id?: string | null
  address?: string
  date?: string
  eventName?: string
  billAmount?: number
  userPayId?: string
  userPayName?: string
  members?: User[]
  tip?: number
  totalAmount?: number
  isAllPaid?: boolean
}
export interface IEventDetail {
  id?: string | null
  eventId?: string | null
  email?: string | null
  name?: string | null
  uid?: string | null
  isPaid?: boolean
  amount?: number
  count?: number
  amountToPay?: number
}
export interface INoti {
  id?: string
  date: string
  content: string
  fromUid: string
  toUids: string[]
  userSeen: string[]
  eventId: string
  isSeen?: boolean
}
