import { CircularProgress } from '@mui/material'
import React, { Suspense } from 'react'

interface AppSuspenseProps {
  children?: React.ReactElement
  comp?: React.LazyExoticComponent<() => JSX.Element>
}

export const LoadingScreen = () => {
  return (
    <div className="text-center h-screen flex justify-center items-center">
      <CircularProgress color="success" />
    </div>
  )
}

const AppSuspense: React.FC<AppSuspenseProps> = ({ children, comp: Comp }) => {
  return <Suspense fallback={<LoadingScreen />}>{Comp ? <Comp /> : children}</Suspense>
}

export default AppSuspense
