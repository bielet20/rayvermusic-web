import Navbar from '@/components/layout/Navbar'
import GramolaClient from '@/components/gramola/GramolaClient'

export default function GramolaPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        <GramolaClient />
      </main>
    </>
  )
}
