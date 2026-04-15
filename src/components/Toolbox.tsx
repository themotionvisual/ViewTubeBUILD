import React, { useMemo, useState } from 'react';
import { CustomIcon } from './CustomIcon';
import { getToolboxPaletteColors } from '../styles/toolboxPalette';
import { hexToRgba, CONTROL_SHELL, AnimatedToggleIcon } from './ToolboxUISystem';

export type ToolboxVariant = 'scaffold' | 'accordion' | 'sub' | 'header';
export type ToolboxIndicator = 'symbols' | 'plusminus' | 'none';

const extractHexFromBgClass = (bgClass: string): string | null => {
  const match = bgClass.match(/bg-\[#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\]/);
  if (!match) return null;
  return `#${match[1]}`;
};

// hexToRgba is now imported from ToolboxUISystem

interface ToolboxProps {
  variant?: ToolboxVariant;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  headerColor: string;
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
  headerColor,
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
  const shadowOffset = variant === 'accordion' || variant === 'sub' ? 6 : 10;
  
  const accentShadowStyle = { 
    boxShadow: `${shadowOffset}px ${shadowOffset}px 0px 0px ${shadowColor}` 
  };

  const finalContentClass = useMemo(() => {
    if (contentClassName) return contentClassName;
    if (variant === 'accordion') return 'p-6 bg-white text-black';
    if (variant === 'sub') return 'p-6 flex-1 flex flex-col space-y-6';
    return embedded ? 'p-0' : 'p-8';
  }, [contentClassName, embedded, variant]);

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
            {icon}
          </div>
          <h1 className="text-[50px] font-[1000] uppercase tracking-tighter pl-8 leading-none mt-1 select-none pointer-events-none">{title}</h1>
        </div>

        <div className="flex items-center gap-6 pr-6">{headerActions}</div>
      </header>
    );
  }

  // Common stroke and radius rules
  const stroke = variant === 'sub' || variant === 'accordion' ? 4 : 5;
  const radius = 16;

  if (variant === 'sub') {
    return (
      <div 
        className={`bg-white border-black rounded-2xl overflow-hidden flex flex-col h-full self-start ${outerClassName}`}
        style={{
          border: `${stroke}px solid black`,
          borderRadius: `${radius}px`,
          ...accentShadowStyle
        }}
      >
        <div
          className={`${headerColor} ${textColor} p-4 flex justify-between items-center select-none`}
          style={{
            ...headerStyle,
            height: '60px',
            borderBottom: `${stroke}px solid black`
          }}
        >
          <div className="flex items-center h-full flex-1">
             <div className="h-[60px] w-[60px] flex items-center justify-center shrink-0 border-r-[4px] border-black -ml-4 mr-4" style={iconStyle}>
               {icon}
             </div>
            <span className="font-black uppercase text-2xl tracking-tighter leading-none select-none pointer-events-none">{title}</span>
          </div>
          {headerActions}
        </div>
        <div className={finalContentClass}>{children}</div>
      </div>
    );
  }

  const frameClass = `w-full bg-white overflow-hidden flex flex-col relative ${outerClassName}`;
  const collapseTransitionClass = disableCollapseAnimation
    ? "duration-0 ease-linear"
    : CONTROL_SHELL.transition;
  
  const headerHeight = variant === 'accordion' ? 56 : 80;

  return (
    <div className={`w-full ${shellClassName} ${outerClassName}`}>
      <div 
        className={frameClass} 
        style={{
          border: `${stroke}px solid black`,
          borderRadius: `${radius}px`,
          ...accentShadowStyle
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
              className={`${iconBoxColor} flex items-center justify-center border-r-[4px] border-black flex-shrink-0 transition-all`}
              style={{
                ...iconStyle,
                height: '100%',
                width: `${headerHeight}px`
              }}
            >
              {icon}
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
            {indicator === 'plusminus' && (
              <div
                onClick={setOpen}
                className="h-full px-2 flex items-center justify-center cursor-pointer border-l-[4px] border-black"
              >
                <span className="text-2xl font-black leading-none text-black">{open ? '−' : '+'}</span>
              </div>
            )}
            {indicator === 'symbols' && isCollapsible && (
              <div
                onClick={setOpen}
                className="h-full px-1 flex items-center justify-center cursor-pointer border-l-[4px] border-black"
                style={{ width: variant === "accordion" ? "48px" : "64px" }}
              >
                <AnimatedToggleIcon
                  open={open}
                  size={variant === 'accordion' ? 32 : 44}
                />
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
            {(!unmountWhenClosed || open) && <main className={`flex-1 bg-white ${finalContentClass}`}>{children}</main>}
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
  icon: React.ReactNode;
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
  icon?: React.ReactNode;
  headerColor?: string;
  textColor?: string;
  paletteIndex?: number;
  children: React.ReactNode;
  actionButton?: React.ReactNode;
  contentClassName?: string;
  collapsible?: boolean;
  isOpenInitial?: boolean;
  unmountOnClose?: boolean;
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
  collapsible = false,
  isOpenInitial = true,
  unmountOnClose = false,
}) => (
  <SubToolboxInner
    title={title}
    icon={icon}
    headerColor={headerColor}
    textColor={textColor}
    paletteIndex={paletteIndex}
    actionButton={actionButton}
    contentClassName={contentClassName}
    collapsible={collapsible}
    isOpenInitial={isOpenInitial}
    unmountOnClose={unmountOnClose}
  >
    {children}
  </SubToolboxInner>
);

const SubToolboxInner: React.FC<SubToolboxProps> = ({
  title,
  icon,
  headerColor = "bg-[#00CCFF]",
  textColor = "text-black",
  paletteIndex,
  children,
  actionButton,
  contentClassName,
  collapsible = false,
  isOpenInitial = true,
  unmountOnClose = false,
}) => {
  const [open, setOpen] = useState(isOpenInitial);
  const palette = paletteIndex !== undefined && paletteIndex !== null ? getToolboxPaletteColors(paletteIndex) : null;
  const headerStyle = palette ? { backgroundColor: palette.header } : undefined;
  const iconStyle = palette ? { backgroundColor: palette.icon } : undefined;
  const headerHex = palette?.header ?? extractHexFromBgClass(headerColor);
  
  const shadowColor = headerHex ? hexToRgba(headerHex, 0.45) : 'rgba(0,0,0,0.45)';
  const shadowOffset = 6;

  const content = (
    <div className={`flex-1 bg-white ${contentClassName || "p-6 flex flex-col space-y-6"}`}>
      {children}
    </div>
  );

  if (!collapsible) {
    return (
      <Toolbox
        variant="sub"
        title={title}
        icon={icon}
        headerColor={headerColor}
        textColor={textColor}
        paletteIndex={paletteIndex}
        headerActions={actionButton}
        contentClassName={contentClassName || "p-6 flex-1 flex flex-col space-y-6"}
      >
        {children}
      </Toolbox>
    );
  }

  return (
    <div
      className="bg-white overflow-hidden flex flex-col self-start"
      style={{
        border: '4px solid black',
        borderRadius: '16px',
        boxShadow: `${shadowOffset}px ${shadowOffset}px 0px 0px ${shadowColor}`
      }}
    >
      <header
        className={`${headerColor} ${textColor} flex justify-between items-center select-none cursor-pointer`}
        onClick={() => setOpen((prev) => !prev)}
        style={{
          ...headerStyle,
          height: '60px',
          borderBottom: '4px solid black'
        }}
      >
        <div className="flex items-center h-full flex-1">
          <div 
            className="h-full w-[60px] flex items-center justify-center shrink-0 border-r-[4px] border-black"
            style={iconStyle}
          >
            {icon}
          </div>
          <span className="font-black uppercase text-2xl tracking-tighter leading-none select-none pointer-events-none pl-4">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-3 pr-4" onClick={(event) => event.stopPropagation()}>
          {actionButton}
          <div
            onClick={() => setOpen((prev) => !prev)}
            className={`h-full w-[56px] cursor-pointer transition-all duration-700 ease-in-out transform border-l-[4px] border-black flex items-center justify-center ${
              open ? "rotate-180 scale-110" : "rotate-0 scale-100"
            }`}
          >
            <CustomIcon
              name={open ? "SYMBOLS 19" : "SYMBOLS 22"}
              size={28}
              className="opacity-80 hover:opacity-100 transition-opacity text-black"
            />
          </div>
        </div>
      </header>
      <div
        className={`grid transition-[grid-template-rows,opacity] ${CONTROL_SHELL.transition} ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
        style={{ marginTop: "-4px" }}
      >
        <div className="overflow-hidden min-h-0">{open || !unmountOnClose ? content : null}</div>
      </div>
    </div>
  );
};
