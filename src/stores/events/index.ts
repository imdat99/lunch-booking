import { IEvent, User } from '@app/server/firebaseType'
import { RootState } from '@app/stores'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import dayjs from 'dayjs'
export const namespace = 'List_user'

//TODO milo remove
const mockBillDetail = {
  address: 'hungyen',
  date: dayjs(new Date()).format('MM/DD/YYYY'),
  eventName: 'Mock detail',
  totalAmount: 15,
  userId: '',
  tip: 10,
  billAmount: 25,
  userPayId: 'PnFrsmRWjFNaHUKvCG5uHU4h1892',
  userPayName: 'Phuc',
}

const initialState: { selectedListMember: User[]; isEditBill: boolean; billDetail: IEvent } = {
  selectedListMember: [],
  isEditBill: false,
  billDetail: mockBillDetail,
}

const slice = createSlice({
  name: namespace,
  initialState,
  reducers: {
    setSelectedListMember: (state, action: PayloadAction<User[]>) => {
      state.selectedListMember = action.payload
    },
    setIsEditBill: (state, action) => {
      state.isEditBill = action.payload
    },
  },
})

export const { setSelectedListMember, setIsEditBill } = slice.actions
export const billStore = (state: RootState) => state[namespace]
export const reducer = slice.reducer
