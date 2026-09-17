# Studio Hub Component Library source of truth

`ToolboxUIReferenceLibrary.tsx` is the Studio Hub entry point and shell. It must not maintain an independent subset of component examples.

`StudioHubCompletePrimitiveCatalog.tsx` owns the canonical family registry and rendered examples. Add reusable component families there so they automatically appear in the Studio Hub toolbox.

`studio-hub-complete-primitive-catalog.css` owns catalog-only presentation. Production primitive geometry should continue moving toward shared primitive/token ownership rather than feature-local overrides.

Main Toolbox and SubToolbox are separate structural levels. Main Toolbox authority is 80px header / 5px stroke / 16px radius / 10px shadow / 26px title. Standard SubToolbox authority remains 56px / 4px / 12px / 6px / 20px. Do not globally map the main toolbox header to 56px.
