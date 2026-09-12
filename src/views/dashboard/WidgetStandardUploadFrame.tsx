import React, { useState } from "react"

export type WidgetUploadFrameShape = "landscape" | "circle"

export interface WidgetStandardUploadFrameProps {
  icon: React.ReactNode
  title: React.ReactNode
  detail?: React.ReactNode
  shape?: WidgetUploadFrameShape
  preview?: React.ReactNode
  hasValue?: boolean
  onBrowse: () => void
  onDropFile?: (file: File | undefined) => void
  className?: string
}

/**
 * Canonical ViewTube upload target.
 *
 * Color is inherited exclusively from the widget palette variables. The frame
 * deliberately contains no named/hard-coded hue. Resting state is a translucent
 * widget-color interior, a solid widget-color inner rail, and a translucent
 * outer rail touching it with no white gap. Only the interior bands animate.
 */
export const WidgetStandardUploadFrame: React.FC<WidgetStandardUploadFrameProps> = ({
  icon,
  title,
  detail,
  shape = "landscape",
  preview,
  hasValue = false,
  onBrowse,
  onDropFile,
  className = "",
}) => {
  const [isDragging, setIsDragging] = useState(false)

  return (
    <button
      type="button"
      className={`widget-standard-upload is-${shape} ${hasValue ? "has-value" : ""} ${isDragging ? "is-dragging" : ""} ${className}`.trim()}
      onClick={onBrowse}
      onDragOver={(event) => { event.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault()
        setIsDragging(false)
        onDropFile?.(event.dataTransfer.files?.[0])
      }}
      aria-label={`${title}: ${hasValue ? "file selected" : "choose or drop a file"}`}
    >
      <span className="widget-standard-upload__motion" aria-hidden="true">
        {Array.from({ length: 7 }, (_, index) => (
          <i className={`widget-standard-upload__band is-${7 - index}`} key={index} />
        ))}
      </span>

      {preview ? (
        <span className="widget-standard-upload__preview">{preview}</span>
      ) : (
        <span className="widget-standard-upload__content">
          <span className="widget-standard-upload__icon" aria-hidden="true">{icon}</span>
          <strong>{title}</strong>
          {detail ? <small>{detail}</small> : null}
        </span>
      )}

      <style>{`
        .widget-standard-upload {
          --upload-color: var(--widget-color);
          --upload-stroke: var(--widget-border, var(--widget-color));
          position: relative;
          isolation: isolate;
          display: grid;
          place-items: center;
          width: 100%;
          min-width: 0;
          padding: 0;
          overflow: hidden;
          border: 10px solid var(--upload-stroke);
          outline: 6px solid color-mix(in srgb, var(--upload-color) 22%, transparent);
          outline-offset: 0;
          border-radius: 4px;
          background: color-mix(in srgb, var(--upload-color) 38%, white);
          color: var(--upload-stroke);
          cursor: pointer;
        }
        .widget-standard-upload.is-landscape { aspect-ratio: 16 / 9; }
        .widget-standard-upload.is-circle {
          width: min(100%, 220px);
          aspect-ratio: 1;
          border-radius: 50%;
        }
        .widget-standard-upload.is-circle .widget-standard-upload__motion,
        .widget-standard-upload.is-circle .widget-standard-upload__band { border-radius: 50%; }
        .widget-standard-upload__motion {
          position: absolute;
          inset: 0;
          z-index: 1;
          overflow: hidden;
          pointer-events: none;
        }
        .widget-standard-upload__band {
          position: absolute;
          display: block;
          border-radius: 1px;
          background: color-mix(in srgb, var(--upload-color) 58%, transparent);
          opacity: 0;
          pointer-events: none;
        }
        .widget-standard-upload__band:nth-child(odd) {
          background: color-mix(in srgb, var(--upload-color) 18%, transparent);
        }
        .widget-standard-upload__band.is-7 { inset: 0; }
        .widget-standard-upload__band.is-6 { inset: 5px; }
        .widget-standard-upload__band.is-5 { inset: 10px; }
        .widget-standard-upload__band.is-4 { inset: 15px; }
        .widget-standard-upload__band.is-3 { inset: 20px; }
        .widget-standard-upload__band.is-2 { inset: 25px; }
        .widget-standard-upload__band.is-1 { inset: 30px; }
        .widget-standard-upload:is(:hover,.is-dragging) .widget-standard-upload__band {
          animation: widget-standard-upload-interior-reveal .62s both;
        }
        .widget-standard-upload:is(:hover,.is-dragging) .widget-standard-upload__band.is-7 { animation-delay: 0s; }
        .widget-standard-upload:is(:hover,.is-dragging) .widget-standard-upload__band.is-6 { animation-delay: .045s; }
        .widget-standard-upload:is(:hover,.is-dragging) .widget-standard-upload__band.is-5 { animation-delay: .09s; }
        .widget-standard-upload:is(:hover,.is-dragging) .widget-standard-upload__band.is-4 { animation-delay: .135s; }
        .widget-standard-upload:is(:hover,.is-dragging) .widget-standard-upload__band.is-3 { animation-delay: .18s; }
        .widget-standard-upload:is(:hover,.is-dragging) .widget-standard-upload__band.is-2 { animation-delay: .225s; }
        .widget-standard-upload:is(:hover,.is-dragging) .widget-standard-upload__band.is-1 { animation-delay: .27s; }
        .widget-standard-upload__content,
        .widget-standard-upload__preview {
          position: relative;
          z-index: 2;
          display: grid;
          place-items: center;
          justify-items: center;
          min-width: 0;
        }
        .widget-standard-upload__content { gap: 10px; text-align: center; }
        .widget-standard-upload__icon {
          display: grid;
          place-items: center;
          width: clamp(54px, 18%, 92px);
          aspect-ratio: 1;
          border-radius: 50%;
          background: var(--upload-color);
          color: white;
        }
        .widget-standard-upload__icon svg { width: 52%; height: 52%; }
        .widget-standard-upload__content strong {
          color: var(--upload-stroke);
          font-size: clamp(14px, 3.2vw, 30px);
          line-height: 1;
          font-weight: 1000;
          letter-spacing: .08em;
          text-transform: uppercase;
        }
        .widget-standard-upload__content small {
          color: var(--upload-stroke);
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          opacity: .72;
        }
        .widget-standard-upload.is-circle .widget-standard-upload__content strong { font-size: clamp(11px, 2vw, 18px); }
        .widget-standard-upload.is-circle .widget-standard-upload__content small { display: none; }
        @keyframes widget-standard-upload-interior-reveal {
          0% { opacity: 0; transform: scale(.992); }
          45% { opacity: .82; }
          100% { opacity: .36; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .widget-standard-upload__band { animation: none !important; }
          .widget-standard-upload:is(:hover,.is-dragging) .widget-standard-upload__band { opacity: .24; }
        }
      `}</style>
    </button>
  )
}

export default WidgetStandardUploadFrame
