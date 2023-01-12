import React, { ReactElement } from 'react'

export class ErrorBoundary extends React.Component<{ children: ReactElement }, { hasError: boolean }> {
  constructor(props: Readonly<{ children: ReactElement }>) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.log(error)
    console.log(errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center p-5 w-full bg-white">
          <div className="text-center">
            <div className="inline-flex rounded-full bg-red-100 p-4">
              <div className="rounded-full stroke-red-300 bg-red-200 p-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-40 h-40 dark:text-red-400">
                  <path
                    fill="currentColor"
                    d="M256,16C123.452,16,16,123.452,16,256S123.452,496,256,496,496,388.548,496,256,388.548,16,256,16ZM403.078,403.078a207.253,207.253,0,1,1,44.589-66.125A207.332,207.332,0,0,1,403.078,403.078Z"
                  ></path>
                  <rect width="176" height="32" x="168" y="320" fill="currentColor"></rect>
                  <polygon
                    fill="currentColor"
                    points="210.63 228.042 186.588 206.671 207.958 182.63 184.042 161.37 162.671 185.412 138.63 164.042 117.37 187.958 141.412 209.329 120.042 233.37 143.958 254.63 165.329 230.588 189.37 251.958 210.63 228.042"
                  ></polygon>
                  <polygon
                    fill="currentColor"
                    points="383.958 182.63 360.042 161.37 338.671 185.412 314.63 164.042 293.37 187.958 317.412 209.329 296.042 233.37 319.958 254.63 341.329 230.588 365.37 251.958 386.63 228.042 362.588 206.671 383.958 182.63"
                  ></polygon>
                </svg>
              </div>
            </div>
            <h1 className="mt-5 text-[36px] font-bold text-slate-800 lg:text-[50px]">Something went wrong</h1>
            <p className="text-slate-600 mt-5 lg:text-lg">It&apos;s us not you. Please try to refresh the page to solve the problem</p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
