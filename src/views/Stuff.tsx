import React, { useState, useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"

const UIReferenceLibraryContent = React.lazy(
	() => import("../components/UIReferenceLibraryContent"),
)
const NativeUIKit = React.lazy(() =>
	import("../components/NativeUIKit").then((module) => ({
		default: module.NativeUIKit,
	})),
)
const ComponentCatalog = React.lazy(
	() => import("./referenceStudio/ComponentCatalog"),
)
const SectionSourcesLab = React.lazy(
	() => import("./referenceStudio/SectionSourcesLab"),
)
const ChartCatalog = React.lazy(
	() => import("./referenceStudio/ChartCatalog"),
)
const ChartSpecImplementation = React.lazy(
	() => import("./referenceStudio/ChartSpecImplementation"),
)
const ToolboxRecreation = React.lazy(
	() => import("./referenceStudio/ToolboxRecreation"),
)

type StuffTab =
	| "sources-lab"
	| "component-catalog"
	| "library"
	| "native-kit"
	| "legacy-tools"
	| "chart-catalog"
	| "chart-spec-implementation"
	| "toolbox-recreation"

const STUFF_TABS: { id: StuffTab; label: string; accent: string }[] = [
	{ id: "sources-lab", label: "Sources Lab", accent: "bg-[#FFB158]" },
	{ id: "component-catalog", label: "Component Catalog", accent: "bg-[#B14AED]" },
	{ id: "library", label: "Library", accent: "bg-[#B14AED]" },
	{ id: "native-kit", label: "Native Kit", accent: "bg-[#CCFF00]" },
	{ id: "legacy-tools", label: "Legacy Tools", accent: "bg-[#FF7497]" },
	{ id: "chart-catalog", label: "Chart Catalog", accent: "bg-[#00CCFF]" },
	{ id: "chart-spec-implementation", label: "Chart Spec Implementation", accent: "bg-[#FFE357]" },
	{ id: "toolbox-recreation", label: "Toolbox Recreation", accent: "bg-[#FF7497]" },
]

const DEFAULT_STUFF_TAB: StuffTab = "sources-lab"

const isStuffTab = (value: string | undefined): value is StuffTab =>
	!!value && STUFF_TABS.some((tab) => tab.id === value)

const Stuff: React.FC = () => {
	const navigate = useNavigate()
	const { tabId } = useParams<{ tabId?: string }>()
	const activeStuffTab: StuffTab = isStuffTab(tabId) ? tabId : DEFAULT_STUFF_TAB

	const sectionLoadingFallback = (
		<div className="w-full max-w-[1400px] mx-auto mb-24 bg-white border-[6px] border-black rounded-2xl shadow-[12px_12px_0px_0px_black] p-12 text-center">
			<p className="text-xs font-black uppercase tracking-[0.24em] opacity-50">
				Loading section...
			</p>
		</div>
	)

	useState(() => {
		if (!isStuffTab(tabId)) {
			navigate(`/stuff/${DEFAULT_STUFF_TAB}`, { replace: true })
		}
	})

	const openStuffTab = (tab: StuffTab) => {
		navigate(`/stuff/${tab}`)
		window.scrollTo({ top: 0, behavior: "smooth" })
	}

	return (
		<div className="min-h-screen w-full bg-[#f3f4f6] flex flex-col p-4 overflow-y-auto custom-scrollbar animate-fade-in">
			{/* Header */}
			<div className="w-full max-w-[1400px] mx-auto mb-12">
				<h1 className="text-6xl font-[1000] uppercase italic tracking-tighter bg-[#B14AED] text-white inline-block px-12 py-6 rounded-2xl border-[5px] border-black shadow-[10px_10px_0px_0px_black]">
					STUFF
				</h1>
				<p className="mt-4 font-black uppercase text-sm opacity-40 tracking-[0.4em] pl-2">
					Component Library & Design System Repository
				</p>
			</div>

			{/* Tab Navigation */}
			<div className="w-full max-w-[1400px] mx-auto mb-10 bg-white border-[5px] border-black rounded-2xl shadow-[8px_8px_0px_0px_black] p-4">
				<div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
					{STUFF_TABS.map((tab) => {
						const isActive = activeStuffTab === tab.id
						return (
							<button
								key={tab.id}
								onClick={() => openStuffTab(tab.id)}
								className={`h-11 border-[3px] border-black rounded-xl font-black uppercase text-[11px] tracking-widest transition-all ${
									isActive
										? `${tab.accent} shadow-[3px_3px_0px_0px_black]`
										: "bg-white hover:bg-[#f3f4f6]"
								}`}>
								{tab.label}
							</button>
						)
					})}
				</div>
			</div>

			{/* Section: Sources Lab */}
			{activeStuffTab === "sources-lab" && (
				<React.Suspense fallback={sectionLoadingFallback}>
					<SectionSourcesLab />
				</React.Suspense>
			)}

			{/* Section: Component Catalog */}
			{activeStuffTab === "component-catalog" && (
				<React.Suspense fallback={sectionLoadingFallback}>
					<ComponentCatalog />
				</React.Suspense>
			)}

			{/* Section: Library */}
			{activeStuffTab === "library" && (
				<div className="w-full max-w-[1400px] mx-auto mb-40">
					<div className="p-12 border-b-[12px] border-black bg-white mb-20 text-black shadow-[16px_16px_0px_0px_black] rounded-[3rem] border-[4px]">
						<div className="max-w-[1400px] mx-auto text-center">
							<h2 className="text-6xl font-[1000] uppercase italic tracking-tighter bg-[#B14AED] text-white inline-block px-12 py-6 rounded-2xl border-[5px] border-black shadow-[10px_10px_0px_0px_black]">
								REFERENCE LIBRARY
							</h2>
							<p className="mt-8 font-black uppercase text-lg opacity-50 tracking-[0.3em] text-black">
								Tokyo-Pop Component Repository & Design Tokens
							</p>
						</div>
					</div>
					<React.Suspense fallback={sectionLoadingFallback}>
						<UIReferenceLibraryContent />
					</React.Suspense>
				</div>
			)}

			{/* Section: Native Kit */}
			{activeStuffTab === "native-kit" && (
				<div className="w-full max-w-[1400px] mx-auto mb-40">
					<div className="p-12 border-b-[12px] border-black bg-white mb-20 text-black shadow-[16px_16px_0px_0px_black] rounded-[3rem] border-[4px]">
						<div className="max-w-[1400px] mx-auto text-center">
							<h2 className="text-6xl font-[1000] uppercase italic tracking-tighter bg-[#CCFF00] text-black inline-block px-12 py-6 rounded-2xl border-[5px] border-black shadow-[10px_10px_0px_0px_black]">
								NATIVE UI KIT
							</h2>
							<p className="mt-8 font-black uppercase text-lg opacity-50 tracking-[0.3em] text-black">
								Standalone Component Kit Pulled In From Shared Library Modules
							</p>
						</div>
					</div>
					<div className="bg-white border-[6px] border-black rounded-[48px] shadow-[12px_12px_0px_0px_black] overflow-hidden">
						<div className="bg-black text-white px-8 py-4 flex justify-between items-center">
							<span className="font-[1000] uppercase tracking-widest text-lg">
								Native UI Kit
							</span>
							<div className="flex gap-2">
								<div className="w-3 h-3 rounded-full bg-[#FF3399]" />
								<div className="w-3 h-3 rounded-full bg-[#CCFF00]" />
								<div className="w-3 h-3 rounded-full bg-[#00CCFF]" />
							</div>
						</div>
						<div className="p-8 bg-white">
							<React.Suspense fallback={sectionLoadingFallback}>
								<NativeUIKit />
							</React.Suspense>
						</div>
					</div>
				</div>
			)}

			{/* Section: Legacy Tools */}
			{activeStuffTab === "legacy-tools" && (
				<div className="w-full max-w-[1400px] mx-auto mb-40">
					<div className="p-12 border-b-[12px] border-black bg-white mb-8 text-black shadow-[16px_16px_0px_0px_black] rounded-[3rem] border-[4px]">
						<div className="max-w-[1400px] mx-auto text-center">
							<h2 className="text-6xl font-[1000] uppercase italic tracking-tighter bg-[#FF7497] text-black inline-block px-12 py-6 rounded-2xl border-[5px] border-black shadow-[10px_10px_0px_0px_black]">
								LEGACY TOOLS
							</h2>
							<p className="mt-8 font-black uppercase text-lg opacity-50 tracking-[0.3em] text-black">
								Archive of legacy components and patterns
							</p>
						</div>
					</div>
					<div className="bg-white border-[6px] border-black rounded-[32px] shadow-[12px_12px_0px_0px_black] overflow-hidden p-8">
						<p className="font-black uppercase text-center opacity-50">
							Legacy tools archive coming soon
						</p>
					</div>
				</div>
			)}

			{/* Section: Chart Catalog */}
			{activeStuffTab === "chart-catalog" && (
				<React.Suspense fallback={sectionLoadingFallback}>
					<ChartCatalog />
				</React.Suspense>
			)}

			{/* Section: Chart Spec Implementation */}
			{activeStuffTab === "chart-spec-implementation" && (
				<React.Suspense fallback={sectionLoadingFallback}>
					<ChartSpecImplementation />
				</React.Suspense>
			)}

			{/* Section: Toolbox Recreation */}
			{activeStuffTab === "toolbox-recreation" && (
				<React.Suspense fallback={sectionLoadingFallback}>
					<ToolboxRecreation />
				</React.Suspense>
			)}
		</div>
	)
}

export default Stuff