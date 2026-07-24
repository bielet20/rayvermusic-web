import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PublicMain from '@/components/layout/PublicMain'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <PublicMain>{children}</PublicMain>
      <Footer />
    </>
  )
}
