import React from "react"
import { Link2 } from "lucide-react"
import { SubToolboxSection, SubToolboxStack } from "../layouts"
import { StudioDropdown } from "../primitives/StudioDropdown"
import { StudioButton, StudioInput, StudioSearchInput, StudioTextArea } from "../primitives/StudioControls"

export const VIDEO_SELECTOR = "VIDEO_SELECTOR"
export const TEXT_GENERATOR = "TEXT_GENERATOR"
export const MEDIA_UPLOAD = "MEDIA_UPLOAD"
export const TAG_EDITOR = "TAG_EDITOR"
export const METRIC_STRIP = "METRIC_STRIP"
export const SEARCH_RESULTS = "SEARCH_RESULTS"
export const ASSET_SELECTOR = "ASSET_SELECTOR"
export const CONNECTION_REQUIRED = "CONNECTION_REQUIRED"
export const PUBLISH_ACTIONS = "PUBLISH_ACTIONS"
export const AI_GENERATOR = "AI_GENERATOR"
export const METADATA_EDITOR = "METADATA_EDITOR"

export const STUDIO_RECIPE_IDS = [
  VIDEO_SELECTOR,
  TEXT_GENERATOR,
  MEDIA_UPLOAD,
  TAG_EDITOR,
  METRIC_STRIP,
  SEARCH_RESULTS,
  ASSET_SELECTOR,
  CONNECTION_REQUIRED,
  PUBLISH_ACTIONS,
  AI_GENERATOR,
  METADATA_EDITOR,
] as const

export type StudioRecipeId = (typeof STUDIO_RECIPE_IDS)[number]

export interface VideoSelectorRecipeProps {
  connected: boolean
  value?: string
  options: Array<{ value: string; label: React.ReactNode; disabled?: boolean }>
  onChange?: (value: string) => void
  searchValue?: string
  onSearchChange?: (value: string) => void
  onConnect?: () => void
}

export const VideoSelectorRecipe: React.FC<VideoSelectorRecipeProps> = ({
  connected,
  value,
  options,
  onChange,
  searchValue = "",
  onSearchChange,
  onConnect,
}) => (
  <SubToolboxStack>
    <SubToolboxSection label="Choose Video">
      <StudioDropdown
        ariaLabel="Choose video"
        value={value}
        options={connected ? options : []}
        onChange={onChange}
        connectionMessage={connected ? undefined : "Connect your YouTube channel to load videos"}
      />
    </SubToolboxSection>
    {connected ? (
      <StudioSearchInput
        aria-label="Search videos"
        value={searchValue}
        onChange={(event) => onSearchChange?.(event.target.value)}
        placeholder="Search videos…"
      />
    ) : (
      <StudioButton sizeVariant="action" onClick={onConnect}>
        <Link2 size={20} aria-hidden="true" /> Connect Channel
      </StudioButton>
    )}
  </SubToolboxStack>
)

export interface MetadataEditorRecipeProps {
  title: string
  description: string
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
}

export const MetadataEditorRecipe: React.FC<MetadataEditorRecipeProps> = ({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
}) => (
  <SubToolboxStack>
    <SubToolboxSection label="Title">
      <StudioInput value={title} onChange={(event) => onTitleChange(event.target.value)} />
    </SubToolboxSection>
    <SubToolboxSection label="Description">
      <StudioTextArea value={description} onChange={(event) => onDescriptionChange(event.target.value)} />
    </SubToolboxSection>
  </SubToolboxStack>
)

export const SearchResultsRecipe: React.FC<{
  query: string
  onQueryChange: (value: string) => void
  children: React.ReactNode
}> = ({ query, onQueryChange, children }) => (
  <SubToolboxStack>
    <StudioSearchInput
      aria-label="Search results"
      value={query}
      onChange={(event) => onQueryChange(event.target.value)}
      placeholder="Search…"
    />
    <div role="region" aria-label="Search results list">{children}</div>
  </SubToolboxStack>
)
