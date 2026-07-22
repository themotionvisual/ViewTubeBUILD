import React, { useState } from "react"
import {
  CheckCircle2,
  CircleDashed,
  CreditCard,
  Download,
  Lock,
  RefreshCw,
  Save,
  Trash2,
  Upload,
  UserRoundPlus,
  WandSparkles,
} from "lucide-react"
import { useBrain } from "../context/useBrain"
import type { AuthState } from "../types"
import {
  applySimulationToRealState,
  buildSimulationLocalStateSnapshot,
  deleteCustomAccountSimulationPreset,
  deriveFlowChecklist,
  getBuiltInAccountSimulationPresets,
  importRealStateIntoSimulation,
  loadAccountSimulationState,
  loadCustomAccountSimulationPresets,
  resetAccountSimulationState,
  resetRealAccountSimulationState,
  saveAccountSimulationState,
  saveCustomAccountSimulationPreset,
  synchronizeAccountSimulationState,
  type AccountSimulationBillingEvent,
  type AccountSimulationCheckoutStatus,
  type AccountSimulationOauthStatus,
  type AccountSimulationPreset,
} from "../services/accountSimulation"
import type { SubscriptionPlanId } from "../services/subscriptionPlans"
import { SUBSCRIPTION_PLANS } from "../services/subscriptionPlans"

const cardClass =
  "border-[4px] border-black rounded-2xl bg-white shadow-[6px_6px_0px_0px_black]"
const pillClass =
  "px-3 py-2 border-[3px] border-black rounded-xl bg-white font-black uppercase text-[11px] tracking-[0.12em] shadow-[3px_3px_0px_0px_black]"
const buttonClass =
  "px-4 py-3 border-[3px] border-black rounded-xl font-black uppercase text-xs shadow-[3px_3px_0px_0px_black] transition-transform hover:translate-y-[1px]"

const CHECKOUT_STATUS_OPTIONS: AccountSimulationCheckoutStatus[] = [
  "not_started",
  "session_created",
  "completed",
  "payment_failed",
  "canceled",
]

const BILLING_EVENT_OPTIONS: AccountSimulationBillingEvent[] = [
  "none",
  "checkout.session.completed",
  "invoice.paid",
  "invoice.payment_failed",
  "customer.subscription.deleted",
  "topup_purchased",
]

const OAUTH_OPTIONS: AccountSimulationOauthStatus[] = [
  "disconnected",
  "authenticated_unsynced",
  "authenticated_synced",
]

const formatLabel = (value: string): string =>
  value
    .replace(/_/g, " ")
    .replace(/\./g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())

const toDateTimeLocalValue = (iso: string | null): string => {
  if (!iso) return ""
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60_000)
  return local.toISOString().slice(0, 16)
}

const fromDateTimeLocalValue = (value: string): string | null => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

const AccountSimulator: React.FC = () => {
  const { setAuthState } = useBrain()
  const [simulation, setSimulation] = useState(() => loadAccountSimulationState())
  const [customPresets, setCustomPresets] = useState<AccountSimulationPreset[]>(() =>
    loadCustomAccountSimulationPresets(),
  )
  const [customPresetLabel, setCustomPresetLabel] = useState("Verse QA Scenario")
  const [status, setStatus] = useState("Sandbox mode. No real state changes until you apply them.")

  const commitSimulation = (nextState: ReturnType<typeof synchronizeAccountSimulationState>) => {
    const saved = saveAccountSimulationState(nextState)
    setSimulation(saved)
    return saved
  }

  const patchSimulation = (updates: Partial<typeof simulation>) => {
    commitSimulation(
      synchronizeAccountSimulationState({
        ...simulation,
        ...updates,
        onboardingState: {
          ...simulation.onboardingState,
          ...(updates.onboardingState || {}),
        },
        aiBrainContext: {
          ...simulation.aiBrainContext,
          ...(updates.aiBrainContext || {}),
        },
      }),
    )
  }

  const builtInPresets = getBuiltInAccountSimulationPresets()
  const allPresets = [...builtInPresets, ...customPresets]
  const checklist = deriveFlowChecklist(simulation)
  const localStatePreview = buildSimulationLocalStateSnapshot(simulation)

  const applyAuthStateToContext = (authState: AuthState) => {
    setAuthState({
      ...authState,
      isAuthenticated: authState.isAuthenticated,
    })
  }

  const handlePresetLoad = (preset: AccountSimulationPreset) => {
    const loaded = commitSimulation(
      synchronizeAccountSimulationState({
        ...preset.state,
        scenarioLabel: preset.label,
      }),
    )
    setStatus(`Loaded preset: ${loaded.scenarioLabel}.`)
  }

  const handleSaveCustomPreset = () => {
    const preset = saveCustomAccountSimulationPreset(customPresetLabel, simulation)
    setCustomPresets(loadCustomAccountSimulationPresets())
    setStatus(`Saved custom preset: ${preset.label}.`)
  }

  const handleDeleteCustomPreset = (presetId: string) => {
    setCustomPresets(deleteCustomAccountSimulationPreset(presetId))
    setStatus("Deleted custom preset.")
  }

  const handleApplyRealState = () => {
    const snapshot = applySimulationToRealState(simulation)
    applyAuthStateToContext(snapshot.authState)
    setStatus("Applied simulator state into real local storage. Navigate normally or reload to verify full rehydration.")
    commitSimulation({
      ...simulation,
      lastAppliedAt: new Date().toISOString(),
    })
  }

  const handleImportRealState = () => {
    const imported = importRealStateIntoSimulation()
    commitSimulation(imported)
    setStatus("Imported current real local state into the simulator.")
  }

  const handleResetSandbox = () => {
    const next = resetAccountSimulationState()
    setSimulation(next)
    setStatus("Sandbox simulator state reset.")
  }

  const handleResetRealState = () => {
    resetRealAccountSimulationState()
    applyAuthStateToContext({
      isAuthenticated: false,
      channelName: null,
      channelHandle: null,
      channelThumbnail: null,
      subscriberCount: null,
      totalViews: null,
      videoCount: null,
      syncedAt: null,
    })
    setStatus("Real local account state reset.")
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 pb-24 pt-8 space-y-8 animate-fade-in">
      <div className="border-[4px] border-black rounded-[28px] bg-[#CCFF00] p-6 shadow-[8px_8px_0px_0px_black]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3 max-w-[900px]">
            <p className="text-xs font-black uppercase tracking-[0.24em]">Canonical Account Simulator</p>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
              Verse ViewTubeX Connect, Billing, Channel, And Sync Harness
            </h1>
            <p className="font-bold text-sm md:text-base">
              This sandbox mirrors the current real hybrid flow in ViewTubeX: email capture,
              subscription choice, Stripe checkout boundary, separate Google OAuth channel connect,
              first sync, and AI brain intake.
            </p>
          </div>
          <div className="space-y-2 min-w-[240px]">
            <div className={`${cardClass} bg-white p-4`}>
              <div className="text-[10px] font-black uppercase tracking-[0.16em]">Active Scenario</div>
              <div className="mt-2 text-2xl font-black uppercase tracking-tight">
                {simulation.scenarioLabel}
              </div>
              <div className="mt-2 text-xs font-bold uppercase text-gray-600">
                Last applied: {simulation.lastAppliedAt ? new Date(simulation.lastAppliedAt).toLocaleString() : "Never"}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button onClick={handleApplyRealState} className={`${buttonClass} bg-[#4FFF5B]`}>
            Apply To Real Local State
          </button>
          <button onClick={handleImportRealState} className={`${buttonClass} bg-white`}>
            Import Current Real State
          </button>
          <button onClick={handleResetSandbox} className={`${buttonClass} bg-[#FFE357]`}>
            Reset Sandbox
          </button>
          <button onClick={handleResetRealState} className={`${buttonClass} bg-[#FF8AAF]`}>
            Reset Real Local State
          </button>
        </div>
        <div className="mt-4 border-[3px] border-black rounded-2xl bg-white px-4 py-3 font-black text-sm">
          {status}
        </div>
      </div>

      <div className={`${cardClass} p-5 bg-[#F8F8F4]`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.16em]">Scenario Presets</div>
            <div className="text-sm font-bold text-gray-700 mt-1">
              Built-ins mirror the main account states. Custom presets let you keep reusable QA setups.
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={customPresetLabel}
              onChange={(event) => setCustomPresetLabel(event.target.value)}
              className="min-w-[240px] border-[3px] border-black rounded-xl px-3 py-2 font-black"
              placeholder="Preset label"
            />
            <button onClick={handleSaveCustomPreset} className={`${buttonClass} bg-[#40C6E9]`}>
              <Save size={14} className="inline mr-2" />
              Save Custom Preset
            </button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {allPresets.map((preset) => (
            <div key={preset.id} className="border-[3px] border-black rounded-2xl bg-white p-3 shadow-[4px_4px_0px_0px_black]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.14em]">
                    {preset.builtIn ? "Built In" : "Custom"}
                  </div>
                  <div className="mt-1 text-lg font-black uppercase leading-tight">
                    {preset.label}
                  </div>
                </div>
                {!preset.builtIn ? (
                  <button
                    onClick={() => handleDeleteCustomPreset(preset.id)}
                    className="p-2 border-[2px] border-black rounded-lg bg-[#FFE357]"
                    aria-label={`Delete preset ${preset.label}`}
                  >
                    <Trash2 size={14} />
                  </button>
                ) : null}
              </div>
              <div className="mt-3 text-[11px] font-bold uppercase text-gray-600">
                {preset.state.selectedPlanId} • {formatLabel(preset.state.oauthStatus)}
              </div>
              <button onClick={() => handlePresetLoad(preset)} className={`${buttonClass} bg-[#CCFF00] mt-3 w-full`}>
                Load Scenario
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
        <div className="space-y-6">
          <div className={`${cardClass} p-5 bg-white`}>
            <div className="flex items-center gap-3">
              <UserRoundPlus size={20} />
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">Step 1 • Connect Email</h2>
                <p className="text-sm font-bold text-gray-700">
                  Mirrors the legacy connection email and the known-user email used by billing and AI intake gates.
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="email"
                value={simulation.signupEmail}
                onChange={(event) => patchSimulation({ signupEmail: event.target.value })}
                className="border-[3px] border-black rounded-xl px-3 py-3 font-black"
                placeholder="tester@viewtube.local"
              />
              <input
                value={simulation.referralCode}
                onChange={(event) => patchSimulation({ referralCode: event.target.value.toUpperCase() })}
                className="border-[3px] border-black rounded-xl px-3 py-3 font-black uppercase"
                placeholder="Referral code"
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() =>
                  patchSimulation({
                    onboardingState: {
                      ...simulation.onboardingState,
                      emailCaptured: true,
                    },
                  })
                }
                className={`${buttonClass} bg-[#4FFF5B]`}
              >
                Mark Email Captured
              </button>
              <button
                onClick={() =>
                  patchSimulation({
                    onboardingState: {
                      ...simulation.onboardingState,
                      referralStepCompleted: Boolean(simulation.referralCode.trim()),
                    },
                  })
                }
                className={`${buttonClass} bg-white`}
              >
                Save Referral Step
              </button>
            </div>
          </div>

          <div className={`${cardClass} p-5 bg-white`}>
            <div className="flex items-center gap-3">
              <CreditCard size={20} />
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">Step 2 • Plan And Checkout Boundary</h2>
                <p className="text-sm font-bold text-gray-700">
                  Free and Beta activate locally. Paid plans stay pending until the checkout outcome becomes successful.
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.14em]">Subscription Plan</label>
                <select
                  value={simulation.selectedPlanId}
                  onChange={(event) =>
                    patchSimulation({
                      selectedPlanId: event.target.value as SubscriptionPlanId,
                      onboardingState: {
                        ...simulation.onboardingState,
                        planSelected: true,
                      },
                    })
                  }
                  className="w-full h-12 border-[3px] border-black rounded-xl px-3 bg-white font-black uppercase"
                >
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.14em]">Trial Eligible</label>
                <button
                  onClick={() => patchSimulation({ trialEligible: !simulation.trialEligible })}
                  className={`${buttonClass} w-full ${simulation.trialEligible ? "bg-[#CCFF00]" : "bg-white"}`}
                >
                  {simulation.trialEligible ? "48-Hour Trial On" : "48-Hour Trial Off"}
                </button>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.14em]">Checkout Status</label>
                <select
                  value={simulation.checkoutStatus}
                  onChange={(event) =>
                    patchSimulation({
                      checkoutStatus: event.target.value as AccountSimulationCheckoutStatus,
                    })
                  }
                  className="w-full h-12 border-[3px] border-black rounded-xl px-3 bg-white font-black uppercase"
                >
                  {CHECKOUT_STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {formatLabel(option)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.14em]">Billing Event Outcome</label>
                <select
                  value={simulation.billingEvent}
                  onChange={(event) =>
                    patchSimulation({
                      billingEvent: event.target.value as AccountSimulationBillingEvent,
                    })
                  }
                  className="w-full h-12 border-[3px] border-black rounded-xl px-3 bg-white font-black uppercase"
                >
                  {BILLING_EVENT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {formatLabel(option)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() =>
                  patchSimulation({
                    checkoutStatus: "session_created",
                    billingEvent: "none",
                  })
                }
                className={`${buttonClass} bg-white`}
              >
                Simulate Session Created
              </button>
              <button
                onClick={() =>
                  patchSimulation({
                    checkoutStatus: "completed",
                    billingEvent: "checkout.session.completed",
                    onboardingState: {
                      ...simulation.onboardingState,
                      accountActivated: true,
                      billingConfirmed: true,
                    },
                  })
                }
                className={`${buttonClass} bg-[#4FFF5B]`}
              >
                Simulate Checkout Complete
              </button>
              <button
                onClick={() =>
                  patchSimulation({
                    checkoutStatus: "payment_failed",
                    billingEvent: "invoice.payment_failed",
                    onboardingState: {
                      ...simulation.onboardingState,
                      billingConfirmed: false,
                    },
                  })
                }
                className={`${buttonClass} bg-[#FFE357]`}
              >
                Simulate Payment Failure
              </button>
              <button
                onClick={() =>
                  patchSimulation({
                    checkoutStatus: "canceled",
                    billingEvent: "customer.subscription.deleted",
                    onboardingState: {
                      ...simulation.onboardingState,
                      billingConfirmed: false,
                    },
                  })
                }
                className={`${buttonClass} bg-[#FF8AAF]`}
              >
                Simulate Subscription Cancel
              </button>
              <button
                onClick={() =>
                  patchSimulation({
                    billingEvent: "topup_purchased",
                    checkoutStatus: simulation.checkoutStatus === "not_started" ? "completed" : simulation.checkoutStatus,
                  })
                }
                className={`${buttonClass} bg-[#40C6E9]`}
              >
                Simulate Top-Up Purchased
              </button>
            </div>
          </div>

          <div className={`${cardClass} p-5 bg-white`}>
            <div className="flex items-center gap-3">
              <Lock size={20} />
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">Step 3 • Google OAuth And First Sync</h2>
                <p className="text-sm font-bold text-gray-700">
                  ViewTube account connection is separate from channel connection. This section mirrors the channel state and first-sync boundary.
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.14em]">OAuth Status</label>
                <select
                  value={simulation.oauthStatus}
                  onChange={(event) =>
                    patchSimulation({
                      oauthStatus: event.target.value as AccountSimulationOauthStatus,
                    })
                  }
                  className="w-full h-12 border-[3px] border-black rounded-xl px-3 bg-white font-black uppercase"
                >
                  {OAUTH_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {formatLabel(option)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.14em]">Channel Name</label>
                <input
                  value={simulation.channelName}
                  onChange={(event) => patchSimulation({ channelName: event.target.value })}
                  className="w-full border-[3px] border-black rounded-xl px-3 py-3 font-black"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.14em]">Channel Handle</label>
                <input
                  value={simulation.channelHandle}
                  onChange={(event) => patchSimulation({ channelHandle: event.target.value })}
                  className="w-full border-[3px] border-black rounded-xl px-3 py-3 font-black"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.14em]">Subscriber Count</label>
                <input
                  type="number"
                  value={simulation.subscriberCount}
                  onChange={(event) => patchSimulation({ subscriberCount: Number(event.target.value || 0) })}
                  className="w-full border-[3px] border-black rounded-xl px-3 py-3 font-black"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.14em]">Total Views</label>
                <input
                  type="number"
                  value={simulation.totalViews}
                  onChange={(event) => patchSimulation({ totalViews: Number(event.target.value || 0) })}
                  className="w-full border-[3px] border-black rounded-xl px-3 py-3 font-black"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.14em]">Video Count</label>
                <input
                  type="number"
                  value={simulation.videoCount}
                  onChange={(event) => patchSimulation({ videoCount: Number(event.target.value || 0) })}
                  className="w-full border-[3px] border-black rounded-xl px-3 py-3 font-black"
                />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.14em]">Sync Timestamp</label>
                <input
                  type="datetime-local"
                  value={toDateTimeLocalValue(simulation.syncTimestamp)}
                  onChange={(event) =>
                    patchSimulation({
                      syncTimestamp: fromDateTimeLocalValue(event.target.value),
                      oauthStatus: event.target.value
                        ? "authenticated_synced"
                        : simulation.oauthStatus === "disconnected"
                          ? "disconnected"
                          : "authenticated_unsynced",
                    })
                  }
                  className="w-full border-[3px] border-black rounded-xl px-3 py-3 font-black"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.14em]">Thumbnail URL</label>
                <input
                  value={simulation.channelThumbnail}
                  onChange={(event) => patchSimulation({ channelThumbnail: event.target.value })}
                  className="w-full border-[3px] border-black rounded-xl px-3 py-3 font-black"
                />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() =>
                  patchSimulation({
                    oauthStatus: "disconnected",
                    syncTimestamp: null,
                  })
                }
                className={`${buttonClass} bg-white`}
              >
                Disconnect
              </button>
              <button
                onClick={() =>
                  patchSimulation({
                    oauthStatus: "authenticated_unsynced",
                    syncTimestamp: null,
                  })
                }
                className={`${buttonClass} bg-[#FFE357]`}
              >
                Authenticated, No Sync
              </button>
              <button
                onClick={() =>
                  patchSimulation({
                    oauthStatus: "authenticated_synced",
                    syncTimestamp: new Date().toISOString(),
                  })
                }
                className={`${buttonClass} bg-[#4FFF5B]`}
              >
                Authenticated And Synced
              </button>
            </div>
          </div>

          <div className={`${cardClass} p-5 bg-white`}>
            <div className="flex items-center gap-3">
              <WandSparkles size={20} />
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">Step 4 • AI Brain Intake</h2>
                <p className="text-sm font-bold text-gray-700">
                  Mirrors the onboarding context that unlocks intent-aware AI tools after account and channel connection.
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-4">
              <textarea
                value={simulation.aiBrainContext.whatNext}
                onChange={(event) =>
                  patchSimulation({
                    aiBrainContext: {
                      ...simulation.aiBrainContext,
                      whatNext: event.target.value,
                    },
                  })
                }
                className="w-full min-h-[96px] border-[3px] border-black rounded-xl px-3 py-3 font-bold"
                placeholder="What is this creator trying to achieve next?"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={simulation.aiBrainContext.primaryGoal}
                  onChange={(event) =>
                    patchSimulation({
                      aiBrainContext: {
                        ...simulation.aiBrainContext,
                        primaryGoal: event.target.value as typeof simulation.aiBrainContext.primaryGoal,
                      },
                    })
                  }
                  className="h-12 border-[3px] border-black rounded-xl px-3 bg-white font-black uppercase"
                >
                  <option value="views">Views</option>
                  <option value="subscribers">Subscribers</option>
                  <option value="revenue">Revenue</option>
                  <option value="retention">Retention</option>
                  <option value="consistency">Consistency</option>
                </select>
                <input
                  value={simulation.aiBrainContext.audienceNiche}
                  onChange={(event) =>
                    patchSimulation({
                      aiBrainContext: {
                        ...simulation.aiBrainContext,
                        audienceNiche: event.target.value,
                      },
                    })
                  }
                  className="border-[3px] border-black rounded-xl px-3 py-3 font-black"
                  placeholder="Audience + niche"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    patchSimulation({
                      aiBrainContext: {
                        ...simulation.aiBrainContext,
                        completedAt: new Date().toISOString(),
                      },
                      onboardingState: {
                        ...simulation.onboardingState,
                        firstToolOpened: true,
                      },
                    })
                  }
                  className={`${buttonClass} bg-[#4FFF5B]`}
                >
                  Mark AI Brain Complete
                </button>
                <button
                  onClick={() =>
                    patchSimulation({
                      aiBrainContext: {
                        ...simulation.aiBrainContext,
                        completedAt: null,
                      },
                    })
                  }
                  className={`${buttonClass} bg-white`}
                >
                  Reset AI Brain Completion
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`${cardClass} p-5 bg-white`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">Flow Checklist</h2>
                <p className="text-sm font-bold text-gray-700">
                  Exact milestone view of what this simulated user has or has not completed.
                </p>
              </div>
              <RefreshCw size={18} />
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(checklist).map(([key, passed]) => (
                <div key={key} className="border-[3px] border-black rounded-xl px-3 py-3 bg-[#F8F8F4] flex items-center justify-between gap-3">
                  <div className="text-xs font-black uppercase tracking-[0.12em]">
                    {formatLabel(key)}
                  </div>
                  <div className={passed ? "text-[#009B2F]" : "text-[#8A8A8A]"}>
                    {passed ? <CheckCircle2 size={18} /> : <CircleDashed size={18} />}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className={pillClass}>Plan: {simulation.selectedPlanId}</span>
              <span className={pillClass}>OAuth: {formatLabel(simulation.oauthStatus)}</span>
              <span className={pillClass}>Sync: {formatLabel(simulation.syncStatus)}</span>
            </div>
          </div>

          <div className={`${cardClass} p-5 bg-white`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">Derived Real Local State</h2>
                <p className="text-sm font-bold text-gray-700">
                  This is the raw state shape the rest of ViewTubeX would consume after applying the simulator.
                </p>
              </div>
              <Download size={18} />
            </div>
            <pre className="mt-4 max-h-[900px] overflow-auto rounded-2xl border-[3px] border-black bg-[#0E0E0E] p-4 text-[11px] leading-5 text-[#CCFF00] whitespace-pre-wrap break-words">
              {JSON.stringify(localStatePreview, null, 2)}
            </pre>
          </div>

          <div className={`${cardClass} p-5 bg-white`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">Simulator Notes</h2>
                <p className="text-sm font-bold text-gray-700">
                  These are the intentional boundaries preserved from the live app.
                </p>
              </div>
              <Upload size={18} />
            </div>
            <div className="mt-4 space-y-3 text-sm font-bold text-gray-800">
              <p>Connect email is local product state. It is not the same thing as YouTube OAuth.</p>
              <p>Paid plans remain pending until the checkout outcome is successful.</p>
              <p>Google auth and first sync stay separate because the real app treats them as separate states.</p>
              <p>Applying to real state writes the same local keys used by onboarding, billing, and auth consumers.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountSimulator
