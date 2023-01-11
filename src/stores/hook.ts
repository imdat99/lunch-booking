import type { TypedUseSelectorHook } from 'react-redux'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '.'
import { ThunkDispatch } from 'redux-thunk'
import { AnyAction } from 'redux'

type TypedDispatch<T> = ThunkDispatch<T, any, AnyAction>

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<TypedDispatch<RootState>>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
