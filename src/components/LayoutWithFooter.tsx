import Footer from './Footer'

export default function LayoutWithFooter({ children }: any) {
  return (
    <div className="flex flex-col justify-between min-h-screen">
      <div style={{ marginBottom: '60px' }}>{children}</div>

      <Footer />
    </div>
  )
}
