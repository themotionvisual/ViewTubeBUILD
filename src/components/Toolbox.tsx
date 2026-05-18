import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CustomIcon } from './CustomIcon';
import { getToolboxPaletteColors } from '../styles/toolboxPalette';
import { hexToRgba, AnimatedToggleIcon } from './ToolboxUISystem';
import { ChevronDown, CircleQuestionMark, Cloud, Zap } from 'lucide-react';

// Canonical shell tokens shared by SubToolbox, DropdownControl, and ActionControlButton.
export const CONTROL_SHELL = {
  headerHeight: 56, // Header block height; 56 + 4px stroke seam = 60px control rhythm.
  height: 60,
  stroke: 4,
  radius: 16,
  railSize: 56,
  shadowOffset: 6,
  transition: "duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
} as const;
const MAIN_TOOLBOX_STROKE = 5;
const MAIN_TOOLBOX_SHADOW = 10;
const SUB_TOOLBOX_STROKE = 4;
const SUB_TOOLBOX_SHADOW = 6;
const SUB_TOOLBOX_INNER_STROKE = 4;
const SUB_TOOLBOX_INNER_SHADOW = 4;

const resolveSubtoolboxMinHeight = (
  openUnits: number,
  heightMode: "standard" | "compact"
) => {
  // Target total = openUnits * 60 + (openUnits-1) * 24
  const gap = 24;
  const overhead = 60; // 56 header + 2px top + 2px bottom (approx)
  const computed = openUnits * 60 + (openUnits - 1) * gap - overhead;
  if (heightMode === "compact") return Math.max(0, Math.min(computed, 144));
  return Math.max(0, computed);
};

interface IconRailProps {
  backgroundColor: string;
  stroke?: number;
  children: React.ReactNode;
}

const IconRail: React.FC<IconRailProps> = ({ backgroundColor, stroke = 2, children }) => (
  <div
    className="h-full flex items-center justify-center shrink-0 transition-all duration-500"
    style={{
      width: `${CONTROL_SHELL.headerHeight}px`,
      backgroundColor,
      borderRight: `${stroke}px solid black`,
    }}
  >
    {children}
  </div>
);

type PaletteCycleContextValue = {
  mainPaletteIndex: number | null;
  allocateSubPaletteIndex: () => number | null;
  currentSubPaletteIndex: number | null;
};

const PaletteCycleContext = React.createContext<PaletteCycleContextValue>({
  mainPaletteIndex: null,
  allocateSubPaletteIndex: () => null,
  currentSubPaletteIndex: null,
});

export type ToolboxVariant = 'scaffold' | 'accordion' | 'sub' | 'header';
export type ToolboxIndicator = 'symbols' | 'plusminus' | 'none';

const extractHexFromBgClass = (bgClass: string): string | null => {
  const match = bgClass.match(/bg-\[#([0-9a-fA-F]{3,6})\]/);
  if (!match) return null;
  return `#${match[1]}`;
};

// hexToRgba is now imported from ToolboxUISystem

interface ToolboxProps {
  variant?: ToolboxVariant;
  title: string;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  iconName?: string;
  headerColor?: string;
  iconBoxColor?: string;
  textColor?: string;
  paletteIndex?: number;
  collapsible?: boolean;
  isOpen?: boolean;
  isOpenInitial?: boolean;
  onToggle?: () => void;
  unmountWhenClosed?: boolean;
  headerActions?: React.ReactNode;
  indicator?: ToolboxIndicator;
  outerClassName?: string;
  shellClassName?: string;
  contentClassName?: string;
  embedded?: boolean;
  children?: React.ReactNode;
  helpTitle?: string;
  helpText?: React.ReactNode;
  helpGuide?: string[];
  disableCollapseAnimation?: boolean;
}

export const Toolbox: React.FC<ToolboxProps> = ({
  variant = 'scaffold',
  title,
  subtitle,
  helpText,
  helpGuide,
  icon,
  iconName,
  headerColor = 'bg-[#FFDD00]',
  iconBoxColor = 'bg-white',
  textColor = 'text-black',
  paletteIndex,
  collapsible = false,
  isOpen,
  isOpenInitial = true,
  onToggle,
  unmountWhenClosed = true,
  headerActions,
  indicator = 'symbols',
  outerClassName = '',
  shellClassName = '',
  contentClassName = '',
  embedded = false,
  children,
  disableCollapseAnimation = false,
}) => {
  const [internalOpen, setInternalOpen] = useState(isOpenInitial);
  const [showHelpRail, setShowHelpRail] = useState(false);
  const subPaletteCursorRef = useRef(0);
  const controlled = typeof isOpen === 'boolean';
  const open = controlled ? Boolean(isOpen) : internalOpen;

  const setOpen = () => {
    if (onToggle) {
      onToggle();
      return;
    }
    if (!controlled) setInternalOpen((prev) => !prev);
  };

  const isCollapsible = collapsible || indicator === 'plusminus' || indicator === 'symbols';
  const palette = paletteIndex !== undefined && paletteIndex !== null ? getToolboxPaletteColors(paletteIndex) : null;
  const headerStyle = palette ? { backgroundColor: palette.header } : undefined;
  const iconStyle = palette ? { backgroundColor: palette.icon } : undefined;
  const headerHex = palette?.header ?? extractHexFromBgClass(headerColor);
  
  // Canonical colored shadow logic
  const shadowColor = headerHex ? hexToRgba(headerHex, 0.45) : 'rgba(0,0,0,0.45)';
  const shadowOffset = MAIN_TOOLBOX_SHADOW;
  
  // Stroke hierarchy: Scaffold = 4, Accordion = 3, Sub = 2
  const stroke = MAIN_TOOLBOX_STROKE;
  const radius = variant === 'accordion' ? 12 : 16;
  const finalContentClass = useMemo(() => {
    if (contentClassName) return contentClassName;
    if (variant === 'accordion') return 'p-6 bg-white text-black';
    return embedded ? 'p-0' : 'p-8';
  }, [contentClassName, variant, embedded]);

  const resolvedIcon = useMemo(() => {
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon as React.ReactElement<any>, { size: 56, strokeWidth: 2.0 });
    }
    if (icon) return icon;
    if (iconName) return <CustomIcon name={iconName} size={56} strokeWidth={2.0} />;
    return null;
  }, [icon, iconName]);

  if (variant === 'header') {
    return (
      <header
        className={`${headerColor} ${textColor} h-[80px] flex items-center justify-between px-0 overflow-hidden border-b-[5px] border-black rounded-t-2xl mb-0 select-none ${outerClassName}`}
        style={headerStyle}
      >
        <div className="flex items-center h-full">
          <div
            className={`${iconBoxColor} h-full w-[80px] flex items-center justify-center border-r-[5px] border-black flex-shrink-0`}
            style={iconStyle}
          >
            {resolvedIcon}
          </div>
          <h1 className="text-[50px] font-[1000] uppercase tracking-tighter pl-8 leading-none mt-1 select-none pointer-events-none">{title}</h1>
        </div>
        <div className="flex items-center gap-6 pr-6">{headerActions}</div>
      </header>
    );
  }

  const frameClass = `w-full bg-white overflow-hidden flex flex-col relative ${outerClassName}`;
  const collapseTransitionClass = disableCollapseAnimation
    ? "duration-0 ease-linear"
    : "duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)]";
  
  const headerHeight = variant === 'accordion' ? 56 : 80;
  const paletteCycleContextValue = useMemo<PaletteCycleContextValue>(() => {
    return {
      mainPaletteIndex: paletteIndex ?? null,
      allocateSubPaletteIndex: () => {
        if (paletteIndex === undefined || paletteIndex === null) return null;
        const allocated = paletteIndex + 1 + subPaletteCursorRef.current;
        subPaletteCursorRef.current += 1;
        return allocated;
      },
      currentSubPaletteIndex:
        paletteIndex === undefined || paletteIndex === null
          ? null
          : paletteIndex + subPaletteCursorRef.current,
    };
  }, [paletteIndex]);

  return (
    <PaletteCycleContext.Provider value={paletteCycleContextValue}>
      <div className={`w-full ${shellClassName} ${outerClassName}`}>
        <div
          className={frameClass}
          style={{
            border: `${stroke}px solid black`,
            borderRadius: `${radius}px`,
            isolation: 'isolate',
            contain: 'content',
            boxShadow: `${shadowOffset}px ${shadowOffset}px 0px 0px ${shadowColor}`
          }}
        >
        <header
          className={`${headerColor} ${textColor} flex items-center justify-between select-none relative z-20 group ${isCollapsible ? 'cursor-pointer' : ''}`}
          onClick={isCollapsible ? setOpen : undefined}
          style={{
            ...headerStyle,
            height: `${headerHeight}px`,
            borderBottom: `${stroke}px solid black`
          }}
        >
          <div className="flex items-center h-full flex-1">
            <div
              className={`${iconBoxColor} flex items-center justify-center transition-all`}
              style={{
                ...iconStyle,
                height: '100%',
                width: `${headerHeight}px`,
                borderRight: `${stroke}px solid black`
              }}
            >
              {resolvedIcon}
            </div>

            <div className={`flex flex-col pl-4 justify-center pointer-events-none select-none`}>
              {variant === 'accordion' ? (
                <h3 className="text-[32px] font-[900] uppercase tracking-tighter leading-none mt-0.5">{title}</h3>
              ) : (
                <h1 className="text-[50px] font-[1000] uppercase tracking-tighter leading-none mt-1">{title}</h1>
              )}
            </div>
          </div>

          <div
            className={`flex items-center ${variant === 'accordion' ? 'gap-3 pr-4' : 'gap-6 pr-6'} h-full`}
            onClick={(event) => event.stopPropagation()}
          >
            {headerActions}
            {isCollapsible && (subtitle || helpText || (helpGuide && helpGuide.length > 0)) && (
              <button
                type="button"
                onClick={() => setShowHelpRail((prev) => !prev)}
                className="group h-full flex items-center justify-center cursor-pointer transition-all hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px]"
                style={{ width: variant === "accordion" ? "48px" : "64px" }}
                aria-label="Toggle toolbox help"
              >
                <span className="inline-flex items-center justify-center w-9 h-9 border-[3px] border-black rounded-full bg-white shadow-[4px_4px_0px_0px_black] transition-all group-active:shadow-[2px_2px_0px_0px_black]">
                  <CircleQuestionMark size={variant === 'accordion' ? 20 : 22} strokeWidth={2.6} />
                </span>
              </button>
            )}
            {indicator === 'symbols' && isCollapsible && (
              <div
                onClick={setOpen}
                className="h-full flex items-center justify-center cursor-pointer"
                style={{ 
                  width: variant === "accordion" ? "48px" : "64px"
                }}
              >
                <AnimatedToggleIcon open={open} size={variant === 'accordion' ? 32 : 44} />
              </div>
            )}
          </div>
        </header>

        {(subtitle || helpText || (helpGuide && helpGuide.length > 0)) && (
          <div
            className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              showHelpRail ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            }`}
            style={{ marginTop: open ? `-${stroke}px` : "0px" }}
          >
            <div className="overflow-hidden min-h-0">
              <div className={`bg-white px-6 py-3 ${open ? "border-b-[4px] border-black" : ""}`}>
                {(helpText || subtitle) && (
                  typeof (helpText || subtitle) === "string" ? (
                    <p className="text-[11px] font-black uppercase tracking-[0.14em] text-black/55">
                      {helpText || subtitle}
                    </p>
                  ) : (
                    <div className="text-[11px] font-black tracking-[0.02em] text-black/80">
                      {helpText || subtitle}
                    </div>
                  )
                )}
                {!helpText && helpGuide && helpGuide.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {helpGuide.slice(0, 4).map((item, idx) => (
                      <li key={`${title}-help-${idx}`} className="text-[11px] font-black uppercase tracking-[0.08em] text-black/70">
                        {idx + 1}. {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        <div
          className={`grid transition-[grid-template-rows,opacity] ${collapseTransitionClass} ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
          style={{ marginTop: showHelpRail ? "0px" : `-${stroke}px` }}
        >
          <div className="overflow-hidden min-h-0">
            {(!unmountWhenClosed || open) && (
              <main
                className={`flex-1 min-h-0 bg-white vt-main-toolbox-content ${finalContentClass}`}
                style={
                  {
                    ["--vt-level1-stroke" as any]: "4px",
                    ["--vt-level1-shadow" as any]: "6px",
                    ["--vt-level1-shadow-color" as any]: headerHex ? hexToRgba(headerHex, 0.45) : "rgba(0,0,0,0.35)",
                  } as React.CSSProperties
                }
              >
                {children}
              </main>
            )}
          </div>
        </div>
        </div>
      </div>
    </PaletteCycleContext.Provider>
  );
};

// --- Canonical wrapper exports (consolidated UI system) ---

interface AccordionContainerProps {
  title: string;
  subtitle?: string;
  icon: string | React.ReactNode;
  children: React.ReactNode;
  headerColor?: string;
  iconBoxColor?: string;
  paletteIndex?: number;
  isOpenInitial?: boolean;
  unmountWhenClosed?: boolean;
  helpTitle?: string;
  helpText?: string;
  helpGuide?: string[];
}

export const AccordionContainer: React.FC<AccordionContainerProps> = ({
  title,
  subtitle,
  icon,
  children,
  headerColor = "bg-[#FFDD00]",
  iconBoxColor = "bg-[#FF3399]",
  paletteIndex,
  isOpenInitial = false,
  unmountWhenClosed = false,
  helpTitle,
  helpText,
  helpGuide,
}) => (
  <Toolbox
    variant="accordion"
    title={title}
    subtitle={subtitle}
    icon={typeof icon === 'string' ? <CustomIcon name={icon} size={40} /> : icon}
    headerColor={headerColor}
    iconBoxColor={iconBoxColor}
    paletteIndex={paletteIndex}
    collapsible
    isOpenInitial={isOpenInitial}
    unmountWhenClosed={unmountWhenClosed}
    // Canonical collapse indicator for reference-studio and toolbox-sized controls.
    // Do not switch this back to plus/minus variants.
    indicator="symbols"
    contentClassName="p-6 bg-white text-black"
    helpTitle={helpTitle}
    helpText={helpText}
    helpGuide={helpGuide}
  >
    {children}
  </Toolbox>
);

interface ToolboxScaffoldProps {
  title: string;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  iconName?: string;
  headerColor?: string;
  iconBoxColor?: string;
  paletteIndex?: number;
  collapsible?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  unmountWhenClosed?: boolean;
  embedded?: boolean;
  outerClassName?: string;
  shellClassName?: string;
  contentClassName?: string;
  disableCollapseAnimation?: boolean;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  helpTitle?: string;
  helpText?: React.ReactNode;
  helpGuide?: string[];
}

export const ToolboxScaffold: React.FC<ToolboxScaffoldProps> = ({
  title,
  subtitle,
  icon,
  iconName,
  headerColor = "bg-[#FFDD00]",
  iconBoxColor = "bg-[#FF3399]",
  paletteIndex,
  collapsible = false,
  isOpen = true,
  onToggle,
  unmountWhenClosed = false,
  embedded = false,
  outerClassName = "",
  shellClassName = "",
  contentClassName = "",
  disableCollapseAnimation = false,
  headerActions,
  children,
  helpTitle,
  helpText,
  helpGuide,
}) => (
  <Toolbox
    variant="scaffold"
    title={title}
    subtitle={subtitle}
    icon={icon}
    iconName={iconName}
    headerColor={headerColor}
    iconBoxColor={iconBoxColor}
    paletteIndex={paletteIndex}
    collapsible={collapsible}
    isOpen={isOpen}
    onToggle={onToggle}
    unmountWhenClosed={unmountWhenClosed}
    embedded={embedded}
    outerClassName={outerClassName}
    shellClassName={shellClassName}
    contentClassName={contentClassName || (embedded ? "p-0" : "p-8")}
    headerActions={headerActions}
    indicator={collapsible ? "symbols" : "none"}
    disableCollapseAnimation={disableCollapseAnimation}
    helpTitle={helpTitle}
    helpText={helpText}
    helpGuide={helpGuide}
  >
    {children}
  </Toolbox>
);

interface SubToolboxProps {
  title: string;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode | string;
  headerColor?: string;
  textColor?: string;
  paletteIndex?: number;
  children: React.ReactNode;
  actionButton?: React.ReactNode;
  contentClassName?: string;
  shellClassName?: string;
  collapsible?: boolean;
  isOpen?: boolean;
  isOpenInitial?: boolean;
  onToggle?: () => void;
  unmountOnClose?: boolean;
  openUnits?: number;
  heightMode?: "standard" | "compact";
  overflowVisible?: boolean;
  helpText?: React.ReactNode;
}

export const SubToolbox: React.FC<SubToolboxProps> = ({
  title,
  subtitle,
  icon,
  headerColor = "bg-[#00CCFF]",
  textColor = "text-black",
  paletteIndex,
  children,
  actionButton,
  contentClassName,
  shellClassName = "",
  collapsible = false,
  isOpen,
  isOpenInitial = true,
  onToggle,
  unmountOnClose = false,
  openUnits = 3,
  heightMode = "standard",
  overflowVisible = false,
  helpText,
}) => {
  const paletteCycle = React.useContext(PaletteCycleContext);
  const allocatedPaletteRef = useRef<number | null>(null);
  if (allocatedPaletteRef.current === null && (paletteIndex === undefined || paletteIndex === null)) {
    allocatedPaletteRef.current = paletteCycle.allocateSubPaletteIndex();
  }

  const [internalOpen, setInternalOpen] = useState(isOpenInitial);
  const [showHelpRail, setShowHelpRail] = useState(false);
  const controlled = typeof isOpen === 'boolean';
  const open = controlled ? Boolean(isOpen) : internalOpen;

  const setOpen = () => {
    if (onToggle) {
      onToggle();
      return;
    }
    if (!controlled) setInternalOpen((prev) => !prev);
  };
  const effectivePaletteIndex =
    paletteIndex !== undefined && paletteIndex !== null ? paletteIndex : allocatedPaletteRef.current;
  const palette = effectivePaletteIndex !== undefined && effectivePaletteIndex !== null
    ? getToolboxPaletteColors(effectivePaletteIndex)
    : null;
  const headerHex = palette?.header ?? extractHexFromBgClass(headerColor) ?? "#00CCFF";
  const iconBg = palette?.icon ?? headerHex;
  
  const shadowColor = hexToRgba(headerHex, 0.5);
  const minInnerHeight = resolveSubtoolboxMinHeight(openUnits, heightMode);

  const contentSizeStyle = heightMode === "compact" ? undefined : { minHeight: `${Math.max(0, minInnerHeight)}px` };

  const finalIcon = React.isValidElement(icon)
    ? React.cloneElement(icon as React.ReactElement<any>, { size: 40, strokeWidth: 1.75 })
    : (typeof icon === 'string' ? <CustomIcon name={icon} size={40} strokeWidth={1.75} /> : icon);

  return (
    <div
      className={`w-full bg-white relative flex flex-col transition-all duration-300 ${overflowVisible ? "" : "overflow-hidden"} ${shellClassName}`}
      style={{
        border: `${SUB_TOOLBOX_STROKE}px solid black`,
        borderRadius: `16px`,
        boxShadow: `${SUB_TOOLBOX_SHADOW}px ${SUB_TOOLBOX_SHADOW}px 0px 0px ${shadowColor}`,
      }}
    >
      <header
        className={`flex items-center justify-between select-none relative z-20 group ${collapsible ? 'cursor-pointer' : ''}`}
        onClick={collapsible ? setOpen : undefined}
        style={{
          height: `${CONTROL_SHELL.headerHeight}px`,
          minHeight: `${CONTROL_SHELL.headerHeight}px`,
          backgroundColor: headerHex,
          borderBottom: `${SUB_TOOLBOX_INNER_STROKE}px solid black`,
        }}
      >
        <div className="flex items-center h-full flex-1">
          <IconRail backgroundColor={iconBg} stroke={SUB_TOOLBOX_INNER_STROKE}>
            <div className="text-black">{finalIcon}</div>
          </IconRail>

          <div className="flex items-center pl-2.5 h-full pointer-events-none select-none">
            <h3 className="font-[900] uppercase tracking-tighter text-black leading-none text-[32px] sm:text-[36px] md:text-[40px]">
              {title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 pr-3 h-full" onClick={e => e.stopPropagation()}>
          {actionButton}
          {collapsible && (subtitle || helpText) && (
            <button
              type="button"
              onClick={() => setShowHelpRail((prev) => !prev)}
              className="group h-full flex items-center justify-center transition-all hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px]"
              aria-label="Toggle subtoolbox help"
            >
              <span className="inline-flex items-center justify-center w-8 h-8 border-[3px] border-black rounded-full bg-white shadow-[4px_4px_0px_0px_black] transition-all group-active:shadow-[2px_2px_0px_0px_black]">
                <CircleQuestionMark size={18} strokeWidth={2.6} />
              </span>
            </button>
          )}
          {collapsible && (
            <div className="h-full flex items-center justify-center" onClick={setOpen}>
              <AnimatedToggleIcon open={open} size={28} />
            </div>
          )}
        </div>
      </header>

      {(subtitle || helpText) && (
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            showHelpRail ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
          style={{ marginTop: `-${SUB_TOOLBOX_INNER_STROKE}px` }}
        >
          <div className="overflow-hidden min-h-0">
            <div className="bg-white border-b-[3px] border-black px-4 py-2">
              {typeof (helpText || subtitle) === "string" ? (
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-black/55">{helpText || subtitle}</p>
              ) : (
                <div className="text-[10px] font-black tracking-[0.02em] text-black/75">{helpText || subtitle}</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div
        className={`grid transition-[grid-template-rows] ${CONTROL_SHELL.transition} ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr] overflow-hidden"}`}
        style={{ marginTop: `-${SUB_TOOLBOX_INNER_STROKE}px` }}
      >
        <div className={`${overflowVisible ? "" : "overflow-hidden"} min-h-0`}>
          <main
            className={`bg-white w-full p-4 text-black flex flex-col transition-opacity vt-subtoolbox-content ${CONTROL_SHELL.transition} ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            style={{
              ...contentSizeStyle,
              // Provide parent accent to all inner controls via CSS vars
              ["--vt-subtoolbox-fill" as any]: headerHex,
              ["--vt-subtoolbox-shadow" as any]: hexToRgba(headerHex, 0.45),
              ["--vt-inner-stroke" as any]: "3px",
              ["--vt-inner-shadow" as any]: "4px",
            }}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export interface StandardUploadBoxProps {
  label?: string;
  icon?: React.ReactNode;
  iconBgColor?: string;
  onUpload?: (files: FileList | null) => void;
  minHeight?: string;
}

export const StandardUploadBox: React.FC<StandardUploadBoxProps> = ({
  label = "UPLOAD.\nDROP FILES HERE OR CLICK BELOW.",
  icon,
  iconBgColor = "#FF3399",
  onUpload,
  minHeight = "220px",
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div
      className="w-full border-[3px] border-black bg-white rounded-2xl flex-1 flex flex-col items-center justify-center p-3 relative overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={{
        minHeight,
        boxShadow: `${SUB_TOOLBOX_INNER_SHADOW}px ${SUB_TOOLBOX_INNER_SHADOW}px 0px 0px rgba(0,0,0,0.35)`,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => onUpload?.(e.target.files)}
      />
      <div
        onClick={() => inputRef.current?.click()}
        className="w-full h-full border-[3px] border-[#9ca3af] border-dashed rounded-2xl bg-gray-100 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-gray-200 transition-colors"
      >
        <div className="w-16 h-16 mt-2 border-[3px] border-black rounded-full bg-white flex items-center justify-center">
          {icon || <Zap size={32} strokeWidth={2.5} className="text-black" style={{ color: iconBgColor }} />}
        </div>
        <h3 className="text-[32px] sm:text-[42px] font-[1000] uppercase tracking-tighter text-black leading-none text-center">
          {label.includes('\n') ? (
            label.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i < label.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))
          ) : (
            <>{label}</>
          )}
        </h3>
      </div>
    </div>
  );
};

export interface StandardTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minHeight?: string;
  hasBorder?: boolean;
  sizeMode?: "content" | "fill";
  borderWidth?: 3 | 4;
}

export interface StandardInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  minHeight?: string;
  hasBorder?: boolean;
  sizeMode?: "content" | "fill";
  borderWidth?: 3 | 4;
}

export const StandardInput: React.FC<StandardInputProps> = ({
  className,
  minHeight = "48px",
  hasBorder = true,
  sizeMode = "content",
  borderWidth = 3,
  ...props
}) => {
  return (
    <input
      className={`vt-input-standard ${sizeMode === "fill" ? "vt-field-fill" : "vt-field-content"} ${hasBorder ? "" : "border-none bg-transparent p-0"} ${className || ""}`}
      data-border-width={borderWidth}
      style={{ minHeight }}
      {...props}
    />
  );
};

export const StandardTextArea: React.FC<StandardTextAreaProps> = ({
  className,
  minHeight = "96px",
  hasBorder = true,
  sizeMode = "content",
  borderWidth = 3,
  ...props
}) => {
  return (
    <textarea
      className={`vt-input-standard vt-textarea-standard ${sizeMode === "fill" ? "vt-field-fill" : "vt-field-content"} ${hasBorder ? "" : "p-0 bg-transparent border-none"} ${className || ""}`}
      data-border-width={borderWidth}
      style={{ minHeight }}
      {...props}
    />
  );
};

type SubtoolboxControlTone = "pink" | "orange" | "yellow" | "green" | "cyan" | "blue" | "purple";

const SUBTOOLBOX_CONTROL_THEMES: Record<SubtoolboxControlTone, { surface: string; control: string; shadow: string }> = {
  pink: { surface: "#FF77D6", control: "#FF9CD8", shadow: "#E95EC6" },
  orange: { surface: "#FFB158", control: "#FFC587", shadow: "#F59E46" },
  yellow: { surface: "#F9F36B", control: "#FFE357", shadow: "#D9CC3C" },
  green: { surface: "#57F15C", control: "#8CFF8F", shadow: "#3CCF41" },
  cyan: { surface: "#45C8E9", control: "#73DEFF", shadow: "#2AA8C7" },
  blue: { surface: "#579AFF", control: "#86B5FF", shadow: "#3979DB" },
  purple: { surface: "#B14BFF", control: "#D08BFF", shadow: "#8F31D9" },
};

type SubToolboxDropdownControlProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (option: string) => void;
  tone?: SubtoolboxControlTone;
  className?: string;
};

type SubToolboxDropdownTopTitleControlProps = {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  multiSelect?: boolean;
  selectedValues?: string[];
  tone?: SubtoolboxControlTone;
  className?: string;
  borderWidth?: 3 | 4;
};

export const SubToolboxDropdownControl: React.FC<SubToolboxDropdownControlProps> = ({
  label,
  value,
  options,
  onChange,
  tone = "orange",
  className = "",
}) => {
  const theme = SUBTOOLBOX_CONTROL_THEMES[tone];
  const resolvedSurface = `var(--vt-subtoolbox-fill, ${theme.surface})`;
  const resolvedShadow = `var(--vt-subtoolbox-shadow, ${hexToRgba(theme.shadow, 0.45)})`;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [menuRect, setMenuRect] = useState<{ left: number; top: number; width: number } | null>(null);

  const recalcMenuRect = () => {
    if (!rootRef.current) return;
    const trigger = rootRef.current.querySelector("button");
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setMenuRect({
      left: rect.left,
      top: rect.bottom - CONTROL_SHELL.stroke,
      width: rect.width,
    });
  };

  useEffect(() => {
    const onOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    recalcMenuRect();
    const onWindowChange = () => recalcMenuRect();
    window.addEventListener("resize", onWindowChange);
    window.addEventListener("scroll", onWindowChange, true);
    return () => {
      window.removeEventListener("resize", onWindowChange);
      window.removeEventListener("scroll", onWindowChange, true);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`w-full relative ${className}`} style={{ zIndex: open ? 140 : 1 }}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => {
            const next = !v;
            if (next) setTimeout(() => recalcMenuRect(), 0);
            return next;
          });
        }}
        className={`group w-full border-[3px] border-black overflow-hidden transition-[border-radius] ${CONTROL_SHELL.transition} block appearance-none p-0 ${
          open ? "rounded-t-[16px] rounded-b-none" : "rounded-[16px]"
        }`}
        style={{
          backgroundColor: resolvedSurface,
          height: `${CONTROL_SHELL.height}px`,
          boxShadow: `${SUB_TOOLBOX_INNER_SHADOW}px ${SUB_TOOLBOX_INNER_SHADOW}px 0px 0px ${resolvedShadow}`,
        }}
      >
        <div className="h-full flex items-center justify-between px-4">
          <div className="flex flex-col items-start justify-center">
            <span className="text-[8px] font-black uppercase tracking-[0.14em] text-black/65 leading-none">
              {label}
            </span>
            <span className="text-[20px] font-[900] uppercase tracking-tighter leading-none mt-1">
              {value}
            </span>
          </div>
          <ChevronDown size={22} strokeWidth={3} className={`text-black transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>
      {open && menuRect &&
        createPortal(
          <div
            className="border-x-[3px] border-b-[3px] border-black rounded-b-[16px] overflow-hidden bg-white"
            style={{
              position: "fixed",
              left: menuRect.left,
              top: menuRect.top,
              width: menuRect.width,
              zIndex: 1200,
            }}
          >
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className="w-full h-11 border-t-[3px] border-black bg-white hover:brightness-95 text-left px-4 text-[20px] font-[900] uppercase tracking-tighter leading-none"
              >
                {option}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
};

export const SubToolboxDropdownTopTitleControl: React.FC<SubToolboxDropdownTopTitleControlProps> = ({
  label,
  value,
  options,
  onChange,
  multiSelect = false,
  selectedValues = [],
  tone = "green",
  className = "",
  borderWidth = 3,
}) => {
  const theme = SUBTOOLBOX_CONTROL_THEMES[tone];
  const resolvedSurface = `var(--vt-subtoolbox-fill, ${theme.surface})`;
  const resolvedShadow = `var(--vt-subtoolbox-shadow, ${hexToRgba(theme.shadow, 0.45)})`;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [menuRect, setMenuRect] = useState<{ left: number; top: number; width: number } | null>(null);
  const borderClass = borderWidth === 3 ? "border-[3px]" : "border-[4px]";
  const rowBorderClass = borderWidth === 3 ? "border-b-[3px]" : "border-b-[4px]";

  const recalcMenuRect = () => {
    if (!rootRef.current) return;
    const trigger = rootRef.current.querySelector("button");
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setMenuRect({
      left: rect.left,
      top: rect.bottom - borderWidth,
      width: rect.width,
    });
  };

  useEffect(() => {
    const onOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    recalcMenuRect();
    const onWindowChange = () => recalcMenuRect();
    window.addEventListener("resize", onWindowChange);
    window.addEventListener("scroll", onWindowChange, true);
    return () => {
      window.removeEventListener("resize", onWindowChange);
      window.removeEventListener("scroll", onWindowChange, true);
    };
  }, [open, borderWidth]);

  return (
    <div ref={rootRef} className={`w-full relative ${className}`} style={{ zIndex: open ? 140 : 1 }}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => {
            const next = !v;
            if (next) setTimeout(() => recalcMenuRect(), 0);
            return next;
          });
        }}
        className={`group w-full border-black overflow-hidden transition-[border-radius] ${CONTROL_SHELL.transition} block appearance-none p-0 ${
          open ? "rounded-t-[16px] rounded-b-none" : "rounded-[16px]"
        } ${borderClass}`}
        style={{
          backgroundColor: resolvedSurface,
          height: `${CONTROL_SHELL.height}px`,
          boxShadow: `${borderWidth === 4 ? SUB_TOOLBOX_SHADOW : SUB_TOOLBOX_INNER_SHADOW}px ${borderWidth === 4 ? SUB_TOOLBOX_SHADOW : SUB_TOOLBOX_INNER_SHADOW}px 0px 0px ${resolvedShadow}`,
        }}
      >
        <div className="h-full w-full flex flex-col">
          <div className={`h-1/2 ${rowBorderClass} border-black text-[9px] font-black uppercase tracking-[0.14em] flex items-center justify-center px-2 leading-none`}>
            {label}
          </div>
          <div className="h-1/2 flex items-center justify-between px-3">
            <div className="text-[20px] font-[900] uppercase tracking-tighter leading-none text-center">
              {value}
            </div>
            <ChevronDown size={18} strokeWidth={3} className={`text-black transition-transform ${open ? "rotate-180" : ""}`} />
          </div>
        </div>
      </button>
      {open && menuRect &&
        createPortal(
          <div
            className={`${borderClass} border-black rounded-b-[16px] overflow-hidden bg-white`}
            style={{
              position: "fixed",
              left: menuRect.left,
              top: menuRect.top,
              width: menuRect.width,
              zIndex: 1400,
              boxShadow: `${borderWidth === 4 ? SUB_TOOLBOX_SHADOW : SUB_TOOLBOX_INNER_SHADOW}px ${borderWidth === 4 ? SUB_TOOLBOX_SHADOW : SUB_TOOLBOX_INNER_SHADOW}px 0px 0px ${resolvedShadow}`,
            }}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  if (!multiSelect) setOpen(false);
                }}
                className={`w-full h-11 ${rowBorderClass} last:border-b-0 border-black bg-white hover:brightness-95 text-left px-4 text-[20px] font-[900] uppercase tracking-tighter leading-none`}
              >
                {multiSelect && (
                  <span className="inline-block w-6 mr-2 text-center">
                    {selectedValues.includes(option.value) ? "✓" : ""}
                  </span>
                )}
                {option.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
};

type SubToolboxActionButtonProps = {
  label: string;
  iconName?: string;
  onClick: () => void;
  tone?: SubtoolboxControlTone;
  disabled?: boolean;
  className?: string;
};

type SubToolboxRefineButtonStyleProps = {
  label: string;
  iconName?: string;
  showIconSection?: boolean;
  onClick: () => void;
  tone?: SubtoolboxControlTone;
  surfaceColor?: string;
  controlColor?: string;
  shadowColor?: string;
  disabled?: boolean;
  className?: string;
  borderWidth: 3 | 4;
};

const SubToolboxRefineButtonBase: React.FC<SubToolboxRefineButtonStyleProps> = ({
  label,
  iconName = "zap",
  showIconSection = false,
  onClick,
  tone = "yellow",
  surfaceColor,
  controlColor,
  shadowColor,
  disabled = false,
  className = "",
  borderWidth,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const theme = SUBTOOLBOX_CONTROL_THEMES[tone];
  const resolvedSurface = surfaceColor ?? `var(--vt-subtoolbox-fill, ${theme.surface})`;
  const resolvedControl = controlColor ?? theme.control;
  const resolvedShadow = shadowColor ?? `var(--vt-subtoolbox-shadow, ${hexToRgba(theme.shadow, 0.45)})`;
  const border = `${borderWidth}px solid black`;
  const baseShadow = borderWidth === 4 ? SUB_TOOLBOX_SHADOW : SUB_TOOLBOX_INNER_SHADOW;
  const hoverShadow = Math.max(1, Math.floor(baseShadow / 2));
  const appliedShadow = isPressing ? 0 : isHovering ? hoverShadow : baseShadow;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setIsPressing(false);
      }}
      onMouseDown={() => setIsPressing(true)}
      onMouseUp={() => setIsPressing(false)}
      disabled={disabled}
      className={`w-full rounded-[16px] overflow-hidden transition-all shrink-0 flex items-center justify-center appearance-none p-0 hover:translate-y-[1.5px] active:translate-y-[3px] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed ${className}`}
      style={{
        height: `${CONTROL_SHELL.height}px`,
        backgroundColor: resolvedSurface,
        border,
        boxShadow: `${appliedShadow}px ${appliedShadow}px 0px 0px ${resolvedShadow}`,
      }}
    >
      <div className="h-full w-full flex items-center">
        {showIconSection && (
          <div
            className="h-full shrink-0 flex items-center justify-center"
            style={{
              width: borderWidth === 4 ? "56px" : "48px",
              backgroundColor: resolvedControl,
              borderRight: border,
            }}
          >
            <CustomIcon name={iconName} size={borderWidth === 4 ? 20 : 18} />
          </div>
        )}
        <div className="h-full flex-1 flex items-center justify-center px-3">
        <span
          className="font-[900] uppercase tracking-tighter leading-none mt-0.5 text-black text-center"
          style={{ fontSize: borderWidth === 4 ? "30px" : "20px" }}
        >
          {label}
        </span>
        </div>
      </div>
    </button>
  );
};

type SubToolboxGridActionButtonProps = Omit<SubToolboxRefineButtonStyleProps, "borderWidth">;
type SubToolboxInnerActionButtonProps = Omit<SubToolboxRefineButtonStyleProps, "borderWidth">;

// 4px standard: for sub-toolbox grids (sub-toolbox color behavior, larger type)
export const SubToolboxGridActionButton: React.FC<SubToolboxGridActionButtonProps> = (props) => (
  <SubToolboxRefineButtonBase {...props} borderWidth={4} />
);

// 3px standard: for controls inside sub-toolboxes (same shell, compact stroke)
export const SubToolboxInnerActionButton: React.FC<SubToolboxInnerActionButtonProps> = (props) => (
  <SubToolboxRefineButtonBase {...props} borderWidth={3} />
);

export const SubToolboxActionButton: React.FC<SubToolboxActionButtonProps> = ({
  label,
  iconName = "zap",
  onClick,
  tone = "yellow",
  disabled = false,
  className = "",
}) => {
  return <SubToolboxGridActionButton label={label} iconName={iconName} onClick={onClick} tone={tone} disabled={disabled} className={className} />;
};
