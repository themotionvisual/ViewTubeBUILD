/**
 * Expand VT_E1 compound timeline clips into their render/preview children.
 * Timeline/editor state keeps one compound clip; renderers receive ordinary
 * child clips with absolute timing and their original layer references.
 */
export const expandCompoundClips = (clips = []) => {
  const source = Array.isArray(clips) ? clips : [];
  return source.flatMap((clip) => {
    if (!clip || clip.clipType !== 'compound' || !Array.isArray(clip.compoundChildren)) {
      return clip ? [clip] : [];
    }
    const parentStart = Number(clip.start || 0);
    return clip.compoundChildren.map((child, index) => {
      const relativeStart = Number.isFinite(Number(child?.relativeStart))
        ? Number(child.relativeStart)
        : Math.max(0, Number(child?.start || 0) - parentStart);
      const relativeEnd = Number.isFinite(Number(child?.relativeEnd))
        ? Number(child.relativeEnd)
        : relativeStart + Math.max(0.05, Number(child?.end || 0) - Number(child?.start || 0));
      return {
        ...child,
        id: `${clip.id}__child_${index}__${child?.id || 'clip'}`,
        compoundParentId: clip.id,
        start: parentStart + relativeStart,
        end: parentStart + relativeEnd,
        relativeStart: undefined,
        relativeEnd: undefined,
      };
    });
  });
};

export const isCompoundClip = (clip) => Boolean(
  clip
  && clip.clipType === 'compound'
  && Array.isArray(clip.compoundChildren)
);
