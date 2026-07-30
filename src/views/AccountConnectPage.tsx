import React, { useMemo } from "react"
import { ArrowRight, Check, ShieldCheck } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useUnifiedAccount } from "../context/UnifiedAccountContext"
import {
  parseAccountIntent,
  resolveAccountSurfaceLabel,
  sanitizeInternalReturnTo,
} from "../services/account/accountContracts"

const AccountConnectPage: React.FC = () => {
  const account = useUnifiedAccount()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const requestedIntent = parseAccountIntent(params.get("intent"))
  const returnTo = sanitizeInternalReturnTo(params.get("returnTo"))
  const accountError = params.get("accountError") || account.snapshot.error?.message || null
  const connected = account.intent === "manage_account"
  const label = useMemo(
    () => connected ? "Continue to ViewTube" : resolveAccountSurfaceLabel(account.snapshot, "settings"),
    [account.snapshot, connected],
  )

  const proceed = async () => {
    if (connected) {
      navigate(returnTo, { replace: true })
      return
    }
    await account.start(requestedIntent || account.intent, returnTo)
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-180px)] w-full max-w-[920px] items-center justify-center px-4 py-10">
      <section className="w-full overflow-hidden rounded-[22px] border-[4px] border-black bg-white shadow-[8px_8px_0_0_#000]">
        <header className="flex items-center gap-4 border-b-[4px] border-black bg-[#40C6E9] p-5">
          <div className="grid size-14 place-items-center border-r-[4px] border-black bg-[#FF83EA] -m-5 mr-0 h-[96px] w-[76px]">
            <ShieldCheck size={34} strokeWidth={3} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-[-0.04em]">ViewTube Account</h1>
            <p className="text-xs font-black uppercase tracking-[0.12em]">One secure account, channel, billing, and Brain connection</p>
          </div>
        </header>

        <div className="grid gap-5 p-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <h2 className="text-4xl font-black uppercase leading-[0.95] tracking-[-0.05em]">
              {connected ? "Your account is ready" : "Connect without losing your work"}
            </h2>
            <p className="max-w-[58ch] text-base font-bold leading-6 text-black/70">
              Google is used for identity and read-only YouTube access. ViewTube stores refresh credentials on the server and keeps analytics, projects, CSV imports, and Analytics snapshots when you log out or reconnect.
            </p>
            <ul className="space-y-2 text-sm font-black uppercase">
              {["Read-only YouTube scopes", "Secure HttpOnly session", "Return to the tool you requested"].map((item) => (
                <li key={item} className="flex items-center gap-2"><Check size={18} strokeWidth={4} />{item}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col justify-between gap-4 rounded-2xl border-[3px] border-black bg-[#FFFF61] p-5 shadow-[4px_4px_0_0_#000]">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-black/60">Next action</p>
              <p className="mt-2 text-2xl font-black uppercase">{label}</p>
              {accountError ? <p role="alert" className="mt-3 rounded-lg border-2 border-black bg-[#FF8AAF] p-3 text-xs font-black">{accountError}</p> : null}
            </div>
            <button
              type="button"
              onClick={() => void proceed()}
              disabled={account.pending}
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl border-[3px] border-black bg-[#4FFF5B] px-4 py-3 text-sm font-black uppercase shadow-[3px_3px_0_0_#000] transition-transform hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_#000] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60"
            >
              {label}<ArrowRight size={20} strokeWidth={4} aria-hidden="true" />
            </button>
            <p className="text-[10px] font-bold uppercase leading-4 text-black/60">
              By continuing, you acknowledge the ViewTube Terms and Privacy Policy.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default AccountConnectPage
