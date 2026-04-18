import React from "react"

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

const Stuff: React.FC = () => {
	const sectionLoadingFallback = (
		<div className="w-full max-w-[1400px] mx-auto mb-24 bg-white border-[6px] border-black rounded-2xl shadow-[12px_12px_0px_0px_black] p-12 text-center">
			<p className="text-xs font-black uppercase tracking-[0.24em] opacity-50">
				Loading section...
			</p>
		</div>
	)

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

			{/* Section 1: Reference Library */}
			<section className="w-full max-w-[1400px] mx-auto mb-40">
				<div className="p-8 border-b-[8px] border-black bg-white mb-16 text-black shadow-[12px_12px_0px_0px_black] rounded-[2rem] border-[4px]">
					<div className="max-w-[1400px] mx-auto text-center">
						<h2 className="text-4xl font-[1000] uppercase italic tracking-tighter bg-[#B14AED] text-white inline-block px-8 py-4 rounded-xl border-[4px] border-black shadow-[8px_8px_0px_0px_black]">
							Reference Library
						</h2>
						<p className="mt-6 font-black uppercase text-base opacity-50 tracking-[0.2em] text-black">
							Tokyo-Pop Component Repository & Design Tokens
						</p>
					</div>
				</div>
				<React.Suspense fallback={sectionLoadingFallback}>
					<UIReferenceLibraryContent />
				</React.Suspense>
			</section>

			{/* Section 2: Native UI Kit */}
			<section className="w-full max-w-[1400px] mx-auto mb-40">
				<div className="p-8 border-b-[8px] border-black bg-white mb-16 text-black shadow-[12px_12px_0px_0px_black] rounded-[2rem] border-[4px]">
					<div className="max-w-[1400px] mx-auto text-center">
						<h2 className="text-4xl font-[1000] uppercase italic tracking-tighter bg-[#CCFF00] text-black inline-block px-8 py-4 rounded-xl border-[4px] border-black shadow-[8px_8px_0px_0px_black]">
							Native UI Kit
						</h2>
						<p className="mt-6 font-black uppercase text-base opacity-50 tracking-[0.2em] text-black">
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
			</section>

			{/* Section 3: Component Catalog */}
			<section className="w-full max-w-[1400px] mx-auto mb-40">
				<div className="p-8 border-b-[8px] border-black bg-white mb-16 text-black shadow-[12px_12px_0px_0px_black] rounded-[2rem] border-[4px]">
					<div className="max-w-[1400px] mx-auto text-center">
						<h2 className="text-4xl font-[1000] uppercase italic tracking-tighter bg-[#CCFF00] text-black inline-block px-8 py-4 rounded-xl border-[4px] border-black shadow-[8px_8px_0px_0px_black]">
							Component Catalog
						</h2>
						<p className="mt-6 font-black uppercase text-base opacity-50 tracking-[0.2em] text-black">
							Central Index of All Reusable Studio Components
						</p>
					</div>
				</div>
				<React.Suspense fallback={sectionLoadingFallback}>
					<ComponentCatalog />
				</React.Suspense>
			</section>
		</div>
	)
}

export default Stuff