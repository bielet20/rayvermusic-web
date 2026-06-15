import { createClient } from '@/lib/supabase/server'
import PollsClient from '@/components/community/PollsClient'

export default async function VotacionesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: polls } = await supabase
    .from('polls')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: userVotes } = await supabase
    .from('poll_votes')
    .select('poll_id, option_index')
    .eq('user_id', user!.id)

  // Contar votos por poll
  const voteCounts: Record<string, number[]> = {}
  if (polls) {
    for (const poll of polls) {
      const { data: counts } = await supabase
        .from('poll_votes')
        .select('option_index')
        .eq('poll_id', poll.id)
      const options = poll.options as { text: string }[]
      voteCounts[poll.id] = options.map((_, i) => counts?.filter(v => v.option_index === i).length ?? 0)
    }
  }

  return (
    <PollsClient
      polls={polls ?? []}
      userVotes={Object.fromEntries((userVotes ?? []).map(v => [v.poll_id, v.option_index]))}
      voteCounts={voteCounts}
      userId={user!.id}
    />
  )
}
