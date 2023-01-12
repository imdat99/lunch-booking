import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import * as eventStore from './events'
import * as listEventStore from './listEvent'
import * as clearListEvent from './listEventDetail'
import * as listUserStore from './listUser'
import * as listNotiStore from './noti'
import * as userStore from './user'


// ...

export const store = configureStore({
  reducer: {
    [userStore.namespace]: userStore.reducer,
    [eventStore.namespace]: eventStore.reducer,
    [listUserStore.namespace]: listUserStore.reducer,
    [clearListEvent.namespace]: clearListEvent.reducer,
    [listEventStore.namespace]: listEventStore.reducer,
    [listNotiStore.namespace]: listNotiStore.reducer,
  },
  middleware: [
    ...getDefaultMiddleware({
      serializableCheck: false,
    }),
  ],
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
