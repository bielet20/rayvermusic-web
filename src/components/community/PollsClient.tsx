'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart2, CheckCircle2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Database } from '@/types/database'

type Poll = Database['public']['Tables']['polls']['Row']

interface Props {
  polls: Poll[]
  userVotes: Record<string, number>
  voteCounts: Record<string, number[]>
  userId: string
}

export default function PollsClient({ polls, userVotes, voteCounts, userId }: Props) {
  const supabase = createClient()
  const [votes, setVotes] = useState<Record<string, number>>(userVotes)
  const [counts, setCounts] = useState<Record<string, number[]>>(voteCounts)
  const [loading, setLoading] = useState<string | null>(null)

  async function handleVote(pollId: string, optionIndex: number) {
    if (votes[pollId] !== undefined || loading) return
    setLoading(pollId)
    const { error } = await supabase.from('poll_votes').insert({ poll_id: pollId, user_id: userId, option_index: optionIndex })
    if (!error) {
      setVotes(v => ({ ...v, [pollId]: optionIndex }))
      setCounts(c => ({
        ...c,
        [pollId]: c[pollId].map((n, i) => i === optionIndex ? n + 1 : n),
      }))
    }
    setLoading(null)
  }

  if (!polls.length) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-black mb-8">Votaciones</h1>
        <div className="text-center py-16 text-[var(--muted-foreground)] border border-dashed border-[var(--border)] rounded-2xl">
          <BarChart2 size={40} className="mx-auto mb-3 opacity-30" />
          <p>No hay votaciones activas</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-black mb-2">Votaciones</h1>
      <p className="text-[var(--muted-foreground)] text-sm mb-8">Tu voz importa. Ayuda a decidir el próximo movimiento.</p>

      <div className="space-y-6">
        {polls.map(poll => {
          const options = poll.options as { text: string }[]
          const hasVoted = votes[poll.id] !== undefined
          const pollCounts = counts[poll.id] ?? options.map(() => 0)
          const total = pollCounts.reduce((a, b) => a + b, 0)

          return (
            <div key={poll.id} className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
              <div className="flex items-start justify-between gap-3 mb-1">
                <h3 className="font-bold leading-snug">{poll.question}</h3>
                {!poll.is_active && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] whitespace-nowrap">Cerrada</span>
                )}
              </div>
              {poll.description && <p className="text-sm text-[var(--muted-foreground)] mb-4">{poll.description}</p>}
              {!poll.description && <div className="mb-4" />}

              <div className="space-y-2">
                {options.map((opt, i) => {
                  const isMyVote = votes[poll.id] === i
                  const pct = total > 0 ? Math.round((pollCounts[i] / total) * 100) : 0
                  return (
                    <button
                      key={i}
                      disabled={hasVoted || !poll.is_active || loading === poll.id}
                      onClick={() => handleVote(poll.id, i)}
                      className={`relative w-full text-left px-4 py-3 rounded-xl border text-sm font-medium overflow-hidden transition-all ${
                        isMyVote
                          ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                          : hasVoted
                            ? 'border-[var(--border)] text-[var(--muted-foreground)] cursor-default'
                            : 'border-[var(--border)] hover:border-purple-500/40 hover:bg-[var(--muted)] cursor-pointer'
                      }`}
                    >
                      {hasVoted && (
                        <div
                          className="absolute inset-0 bg-purple-500/10 origin-left transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      )}
                      <span className="relative flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          {isMyVote && <CheckCircle2 size={14} />}
                          {opt.text}
                        </span>
                        {hasVoted && <span className="text-xs text-[var(--muted-foreground)]">{pct}%</span>}
                      </span>
                    </button>
                  )
                })}
              </div>

              <p className="text-xs text-[var(--muted-foreground)] mt-3">
                {total} {total === 1 ? 'voto' : 'votos'}
                {poll.ends_at && ` · Cierra ${formatDate(poll.ends_at)}`}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
