import { getEventByPage } from '@app/libs/api/event'
import { IEvent } from '@app/server/firebaseType'
import { RootState } from '@app/stores'
import { AnyAction, createSlice, PayloadAction, ThunkAction } from '@reduxjs/toolkit'
export const namespace = 'LIST_EVENT'
type StateType = {
  eventList: IEvent[]
  lastSnapShot: any
  isLastPage: boolean
}
const initialState: StateType = { eventList: [], lastSnapShot: null, isLastPage: false }

const slice = createSlice({
  name: namespace,
  initialState,
  reducers: {
    setListEvent: (state, action: PayloadAction<StateType>) => {
      state.eventList = action.payload.eventList
      state.lastSnapShot = action.payload.lastSnapShot
      state.isLastPage = action.payload.isLastPage
    },
    clearListEvent: () => initialState,
  },
})

export const { setListEvent, clearListEvent } = slice.actions
export const listEventStore = (state: RootState) => state[namespace].eventList
export const isLastPageStore = (state: RootState) => state[namespace].isLastPage
export const reducer = slice.reducer
//Thunk
export function updateEventList(): ThunkAction<void, RootState, unknown, AnyAction> {
  return async (dispatch, getState) => {
    try {
      const notiState = getState().LIST_EVENT
      const result = await getEventByPage(notiState.lastSnapShot)
      dispatch(setListEvent(result!))
    } catch (error) {
      console.log('err: ', error)
    }
  }
}

export function initializeEventList(): ThunkAction<void, RootState, unknown, AnyAction> {
  return async (dispatch) => {
    try {
      const result = await getEventByPage(null)
      dispatch(setListEvent(result!))
    } catch (error) {
      console.log('err: ', error)
    }
  }
}
