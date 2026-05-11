import React, { useMemo, useState } from 'react';
import { CustomIcon } from './CustomIcon';
import { getToolboxPaletteColors } from '../styles/toolboxPalette';
import { hexToRgba, AnimatedToggleIcon } from './ToolboxUISystem';
import { Cloud, Zap } from 'lucide-react';

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
  subtitle?: string;
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
  helpText?: string;
  helpGuide?: string[];
  disableCollapseAnimation?: boolean;
}

export const Toolbox: React.FC<ToolboxProps> = ({
  variant = 'scaffold',
  title,
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
  const shadowOffset = variant === 'accordion' ? 6 : 10;
  
  // Stroke hierarchy: Scaffold = 4, Accordion = 3, Sub = 2
  const stroke = variant === 'accordion' ? 3 : (variant === 'scaffold' ? 4 : 4);
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

  return (
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

        {/* Subtitle and help sections removed from core wrapper to focus on clean block aesthetic as per instructions */}

        <div
          className={`grid transition-[grid-template-rows,opacity] ${collapseTransitionClass} ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
          style={{ marginTop: `-${stroke}px` }}
        >
          <div className="overflow-hidden min-h-0">
            {(!unmountWhenClosed || open) && <main className={`flex-1 min-h-0 bg-white ${finalContentClass}`}>{children}</main>}
          </div>
        </div>
      </div>
    </div>
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
  subtitle?: string;
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
  helpText?: string;
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
}

export const SubToolbox: React.FC<SubToolboxProps> = ({
  title,
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
}) => {
  const [internalOpen, setInternalOpen] = useState(isOpenInitial);
  const controlled = typeof isOpen === 'boolean';
  const open = controlled ? Boolean(isOpen) : internalOpen;

  const setOpen = () => {
    if (onToggle) {
      onToggle();
      return;
    }
    if (!controlled) setInternalOpen((prev) => !prev);
  };
  const palette = paletteIndex !== undefined && paletteIndex !== null ? getToolboxPaletteColors(paletteIndex) : null;
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
        border: `4px solid black`,
        borderRadius: `16px`,
        boxShadow: `6px 6px 0px 0px ${shadowColor}`,
      }}
    >
      <header
        className={`flex items-center justify-between select-none relative z-20 group ${collapsible ? 'cursor-pointer' : ''}`}
        onClick={collapsible ? setOpen : undefined}
        style={{
          height: `${CONTROL_SHELL.headerHeight}px`,
          minHeight: `${CONTROL_SHELL.headerHeight}px`,
          backgroundColor: headerHex,
          borderBottom: `4px solid black`,
        }}
      >
        <div className="flex items-center h-full flex-1">
          <IconRail backgroundColor={iconBg} stroke={4}>
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
          {collapsible && (
            <div className="h-full flex items-center justify-center" onClick={setOpen}>
              <AnimatedToggleIcon open={open} size={28} />
            </div>
          )}
        </div>
      </header>

      <div
        className={`grid transition-[grid-template-rows] ${CONTROL_SHELL.transition} ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr] overflow-hidden"}`}
        style={{ marginTop: "-4px" }}
      >
        <div className={`${overflowVisible ? "" : "overflow-hidden"} min-h-0`}>
          <main
            className={`bg-white w-full p-4 text-black flex flex-col transition-opacity ${CONTROL_SHELL.transition} ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            style={contentSizeStyle}
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
  label = "DROP FILES OR CLICK TO UPLOAD",
  icon,
  iconBgColor = "#FF3399",
  onUpload,
  minHeight = "220px",
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div
      className="w-full border-[4px] border-black bg-white rounded-2xl flex-1 flex flex-col items-center justify-center p-3 relative overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={{
        minHeight,
        boxShadow: `6px 6px 0px 0px ${hexToRgba(iconBgColor, 0.5)}`,
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
        <div className="w-16 h-16 border-[3px] border-black rounded-full bg-white flex items-center justify-center">
          {icon || <Zap size={32} strokeWidth={2.5} className="text-black" style={{ color: iconBgColor }} />}
        </div>
        <h3 className="text-[32px] sm:text-[42px] font-[1000] uppercase tracking-tighter text-black leading-none text-center">
          {label.includes('\\n') ? (
            label.split('\\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i < label.split('\\n').length - 1 && <br />}
              </React.Fragment>
            ))
          ) : (
            <>CANVAS<br />STANDBY</>
          )}
        </h3>
        <p className="font-black text-black/40 uppercase tracking-[0.18em] text-[11px] text-center">
          {label.replace('\\n', ' ')}
        </p>
      </div>
    </div>
  );
};

export interface StandardTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minHeight?: string;
  hasBorder?: boolean;
}

export const StandardTextArea: React.FC<StandardTextAreaProps> = ({
  className,
  minHeight = "88px",
  hasBorder = true,
  ...props
}) => {
  return (
    <textarea
      className={`w-full text-sm font-bold outline-none resize-none placeholder:text-black/20 text-black leading-tight ${hasBorder ? "p-4 rounded-2xl border-[4px] bg-white border-black" : "p-0 bg-transparent border-none"} ${className || ""}`}
      style={{ minHeight }}
      {...props}
    />
  );
};
