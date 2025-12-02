// app/page.tsx

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="w-full border-b border-slate-800">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-slate-900">
              6A
            </div>
            <span className="font-semibold tracking-tight text-lg">
              SixASide
            </span>
          </div>

          <span className="text-xs sm:text-sm text-slate-400">
            Season 1 – launching soon
          </span>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex">
        <div className="mx-auto max-w-5xl px-4 py-10 lg:py-14 flex flex-col gap-10 lg:flex-row lg:items-center">
          {/* Left: hero copy */}
          <section className="flex-1 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 w-fit">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              New head-to-head goal scoring game
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Fantasy football,
              <span className="text-emerald-400"> simplified to six strikers.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl">
              SixASide is a draft-style fantasy football game. Pick{' '}
              <span className="font-semibold text-slate-100">six goal scorers</span>,
              face your friends head-to-head each gameweek, and climb the table
              over the full season.
            </p>

            {/* How it works */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <h2 className="text-sm font-semibold mb-1">🔢 Draft your six</h2>
                <p className="text-xs text-slate-300">
                  Snake draft, like NFL fantasy. Once a player is picked, no one
                  else in the league can own them. Every manager ends up with
                  <span className="font-semibold"> 6 goal scorers</span>.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <h2 className="text-sm font-semibold mb-1">⚽ Every goal matters</h2>
                <p className="text-xs text-slate-300">
                  Each gameweek runs Friday–Thursday. Your six players&apos; club
                  goals are added up and you take on another manager
                  <span className="font-semibold"> head-to-head</span>.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <h2 className="text-sm font-semibold mb-1">🏆 League points</h2>
                <p className="text-xs text-slate-300">
                  Score more goals than your opponent: 3 points. Draw: 1 point
                  each. We track goal difference and a full league table over
                  the season.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <h2 className="text-sm font-semibold mb-1">🔁 Mid-season redraft</h2>
                <p className="text-xs text-slate-300">
                  At halfway (around GW19), we redraft. Bottom of the table gets
                  <span className="font-semibold"> first pick</span>, so anyone
                  can turn their season around.
                </p>
              </div>
            </div>

            {/* Coming soon / CTA */}
            <div className="mt-4 flex flex-col gap-3 max-w-md">
              <h3 className="text-sm font-semibold text-slate-100">
                Be one of the first to play
              </h3>
              <p className="text-xs text-slate-300">
                We&apos;re building SixASide now. If you want early access when
                the game goes live, drop us an email and we&apos;ll send beta
                invites as soon as we&apos;re ready.
              </p>

              <a
                href="mailto:hello@sixasidefantasy.com?subject=SixASide%20early%20access"
                className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-emerald-400 transition-colors w-fit"
              >
                📧 Email for early access
              </a>

              <p className="text-[11px] text-slate-500">
                This will be replaced with a proper sign-up form (waitlist /
                newsletter) later. For now it just opens your email client.
              </p>
            </div>
          </section>

          {/* Right: simple mock / selling points */}
          <aside className="flex-1 w-full max-w-md">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-emerald-500/5">
              <p className="text-xs font-semibold text-emerald-300 mb-2">
                What makes SixASide different?
              </p>
              <ul className="space-y-3 text-xs text-slate-200">
                <li className="flex gap-2">
                  <span className="mt-1 text-emerald-400">●</span>
                  <span>
                    <span className="font-semibold">Draft format</span> – no
                    duplicate players in a league. Steal your mates&apos; favourites.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 text-emerald-400">●</span>
                  <span>
                    <span className="font-semibold">Only goals matter</span> –
                    no complicated bonus points, just pure strike power.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 text-emerald-400">●</span>
                  <span>
                    <span className="font-semibold">Supports odd-size leagues</span> –
                    if there&apos;s an odd number of players, a dummy team joins
                    the league so everyone has a fixture each week.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 text-emerald-400">●</span>
                  <span>
                    <span className="font-semibold">Full season &amp; mid-season redraft</span> –
                    play the whole campaign, then reshuffle the deck at halfway.
                  </span>
                </li>
              </ul>

              <div className="mt-5 rounded-xl bg-slate-950/60 border border-slate-800 px-4 py-3 text-[11px] text-slate-300">
                <p className="font-semibold mb-1 text-slate-100">
                  Roadmap (v1 launch)
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Premier League to start</li>
                  <li>Live goal tracking Friday–Thursday each week</li>
                  <li>Private leagues with join codes</li>
                  <li>Email login, password reset &amp; updates</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800">
        <div className="mx-auto max-w-5xl px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <span>© {new Date().getFullYear()} SixASide. All rights reserved.</span>
          <span>Six strikers. One winner.</span>
        </div>
      </footer>
    </main>
  );
}
