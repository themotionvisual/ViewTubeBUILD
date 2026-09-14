import type {TemplateDefinition} from '../core/schema';
import {CANVASES, VIEWTUBE_INK, VIEWTUBE_PALETTE, VIEWTUBE_WHITE} from '../core/tokens';

const c = CANVASES.landscape;

function makeCta(id: string, name: string, headline: string, body: string, button: string, color: string, tags: string[]): TemplateDefinition {
  return {
    id,
    name,
    category: 'engagement',
    tags: ['cta', 'engagement', ...tags],
    aspectRatio: 'responsive',
    width: c.width,
    height: c.height,
    durationFrames: 120,
    responsive: true,
    customizable: true,
    style: {
      colors: {primary: color, background: color, foreground: VIEWTUBE_INK, border: VIEWTUBE_INK, shadow: VIEWTUBE_INK},
    },
    entrance: {preset: 'spring', durationFrames: 20, easing: 'back.out(1.7)'},
    emphasis: {preset: 'pop', startFrame: 42, durationFrames: 12},
    elements: [
      {id: `${id}-panel`, type: 'svg', name: 'Panel', x: 120, y: 150, width: 1680, height: 780, fillToken: 'colors.background', strokeToken: 'colors.border', strokeWidthToken: 'sizing.strokeWidth', editable: true},
      {id: `${id}-title`, type: 'text', name: 'Headline', x: 250, y: 300, width: 1420, height: 210, text: headline, fillToken: 'colors.foreground', fontFamilyToken: 'typography.displayFamily', fontSizeToken: 'sizing.titleSize', fontWeightToken: 'typography.fontWeight', editable: true, animation: {preset: 'spring'}},
      {id: `${id}-body`, type: 'text', name: 'Supporting text', x: 250, y: 545, width: 1420, height: 90, text: body, fillToken: 'colors.foreground', fontFamilyToken: 'typography.bodyFamily', fontSizeToken: 'sizing.bodySize', editable: true, animation: {preset: 'slide', delayFrames: 6}},
      {id: `${id}-button`, type: 'text', name: 'Button', x: 250, y: 690, width: 620, height: 110, text: button, fill: VIEWTUBE_WHITE, fontFamilyToken: 'typography.labelFamily', fontSize: 36, fontWeight: 900, editable: true, animation: {preset: 'pop', delayFrames: 12}},
    ],
    responsiveLayouts: {
      portrait: {sizing: {titleSize: 112, subtitleSize: 48, bodySize: 34, iconSize: 68, strokeWidth: 8, radius: 24, shadowOffset: 12, scale: 1}, spacing: {padding: 72, gap: 24, insetX: 72, insetY: 80}},
      square: {sizing: {titleSize: 104, subtitleSize: 44, bodySize: 32, iconSize: 64, strokeWidth: 7, radius: 22, shadowOffset: 10, scale: 1}},
    },
  };
}

export const engagementTemplates: TemplateDefinition[] = [
  makeCta('cta-subscribe', 'Subscribe', 'SUBSCRIBE', 'More videos like this every week.', 'SUBSCRIBE', VIEWTUBE_PALETTE[0], ['subscribe']),
  makeCta('cta-like', 'Like This Video', 'LIKE THIS VIDEO', 'If this helped, tap like.', 'LIKE', VIEWTUBE_PALETTE[7], ['like']),
  makeCta('cta-comment', 'Leave a Comment', 'LEAVE A COMMENT', 'What should we cover next?', 'COMMENT BELOW', VIEWTUBE_PALETTE[3], ['comment']),
  makeCta('cta-like-subscribe', 'Like + Subscribe', 'LIKE + SUBSCRIBE', 'Support the channel in two taps.', 'LIKE + SUBSCRIBE', VIEWTUBE_PALETTE[10], ['like', 'subscribe']),
  makeCta('cta-part-two', 'Like for Part Two', 'WANT PART TWO?', 'Like this video so I know.', 'LIKE FOR PART 2', VIEWTUBE_PALETTE[5], ['like', 'part-two']),
  makeCta('cta-opinion', 'Tell Me Your Take', 'TELL ME YOUR TAKE', 'Agree, disagree, or add context.', 'LEAVE A COMMENT', VIEWTUBE_WHITE, ['comment', 'opinion']),
  makeCta('cta-next-chapter', 'Join the Next Chapter', 'JOIN THE NEXT CHAPTER', 'Subscribe and keep watching.', 'SUBSCRIBE + CONTINUE', VIEWTUBE_PALETTE[2], ['subscribe', 'continue']),
  makeCta('cta-history-question', 'History Discussion', 'WHAT WOULD YOU HAVE DONE?', 'Add your answer in the comments.', 'JOIN THE DISCUSSION', VIEWTUBE_PALETTE[8], ['history', 'comment', 'question']),
];
