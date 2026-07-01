import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PlayerProvider from '@/components/player/PlayerProvider'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16 pb-[72px]">{children}</main>
      <Footer />
      <PlayerProvider />
    </>
  )
}
