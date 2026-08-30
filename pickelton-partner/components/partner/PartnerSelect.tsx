"use client";

import { ChevronDown } from "lucide-react";
import {
  Children,
  Fragment,
  isValidElement,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
  type SelectHTMLAttributes,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import "./PartnerSelect.css";

type PartnerSelectProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "multiple" | "onChange" | "size"
> & {
  onValueChange: (value: string) => void;
};

type SelectOption = {
  disabled: boolean;
  key: string;
  label: ReactNode;
  text: string;
  value: string;
};

type MenuPosition = {
  left: number;
  top?: number;
  bottom?: number;
  width: number;
};

function textFromNode(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (!isValidElement<{ children?: ReactNode }>(node)) return "";
  return Children.toArray(node.props.children).map(textFromNode).join(" ");
}

function readOptions(children: ReactNode): SelectOption[] {
  const options: SelectOption[] = [];

  function visit(nodes: ReactNode) {
    Children.forEach(nodes, (node) => {
      if (!isValidElement<{ children?: ReactNode; disabled?: boolean; value?: string | number }>(node)) return;

      if (node.type === "option") {
        const text = textFromNode(node.props.children).trim();
        const value = String(node.props.value ?? text);
        options.push({
          disabled: Boolean(node.props.disabled),
          key: String(node.key ?? `${value}-${options.length}`),
          label: node.props.children,
          text,
          value,
        });
        return;
      }

      if (node.type === Fragment || node.type === "optgroup") visit(node.props.children);
    });
  }

  visit(children);
  return options;
}

function nextEnabledIndex(options: SelectOption[], start: number, direction: 1 | -1) {
  if (!options.length) return -1;
  for (let step = 1; step <= options.length; step += 1) {
    const index = (start + direction * step + options.length) % options.length;
    if (!options[index].disabled) return index;
  }
  return -1;
}

export default function PartnerSelect({
  "aria-describedby": ariaDescribedBy,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  children,
  className,
  disabled = false,
  id,
  name,
  onBlur,
  onValueChange,
  onFocus,
  required,
  style,
  value,
}: PartnerSelectProps) {
  const generatedId = useId();
  const controlId = id ?? `partner-select-${generatedId.replace(/:/g, "")}`;
  const listboxId = `${controlId}-listbox`;
  const options = useMemo(() => readOptions(children), [children]);
  const selectedValue = String(value ?? "");
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === selectedValue));
  const selectedOption = options[selectedIndex];
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  function positionMenu() {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const gap = 6;
    const estimatedHeight = Math.min(280, options.length * 42 + 12);
    const roomBelow = window.innerHeight - rect.bottom;
    const openAbove = roomBelow < estimatedHeight + gap && rect.top > roomBelow;
    setMenuPosition({
      left: Math.max(8, Math.min(rect.left, window.innerWidth - rect.width - 8)),
      width: Math.min(rect.width, window.innerWidth - 16),
      ...(openAbove
        ? { bottom: window.innerHeight - rect.top + gap }
        : { top: rect.bottom + gap }),
    });
  }

  function openMenu() {
    if (disabled) return;
    const current = options.findIndex((option) => option.value === selectedValue && !option.disabled);
    setActiveIndex(current >= 0 ? current : nextEnabledIndex(options, -1, 1));
    positionMenu();
    setOpen(true);
  }

  function closeMenu(restoreFocus = false) {
    setOpen(false);
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function choose(option: SelectOption) {
    if (option.disabled) return;
    onValueChange(option.value);
    closeMenu(true);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      setActiveIndex((current) => nextEnabledIndex(options, current, event.key === "ArrowDown" ? 1 : -1));
      return;
    }

    if (event.key === "Home" || event.key === "End") {
      if (!open) return;
      event.preventDefault();
      const start = event.key === "Home" ? -1 : 0;
      setActiveIndex(nextEnabledIndex(options, start, event.key === "Home" ? 1 : -1));
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!open) openMenu();
      else if (activeIndex >= 0) choose(options[activeIndex]);
      return;
    }

    if (event.key === "Escape" && open) {
      event.preventDefault();
      closeMenu(true);
    }
  }

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) closeMenu();
    };
    const handleViewportChange = () => positionMenu();
    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [open, options.length]);

  useEffect(() => {
    if (!open) setActiveIndex(selectedIndex);
  }, [open, selectedIndex]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    document.getElementById(`${listboxId}-option-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, listboxId, open]);

  const rootStyle: CSSProperties | undefined = style ? {
    alignSelf: style.alignSelf,
    flex: style.flex,
    flexBasis: style.flexBasis,
    flexGrow: style.flexGrow,
    flexShrink: style.flexShrink,
    gridArea: style.gridArea,
    gridColumn: style.gridColumn,
    gridRow: style.gridRow,
    maxWidth: style.maxWidth,
    minWidth: style.minWidth,
    width: style.width,
  } : undefined;

  return (
    <div
      ref={rootRef}
      className="partner-select"
      data-disabled={disabled || undefined}
      data-open={open || undefined}
      style={rootStyle}
    >
      {name && <input type="hidden" name={name} value={selectedValue} disabled={disabled} />}
      <button
        ref={triggerRef}
        id={controlId}
        type="button"
        className={["partner-select__trigger", className].filter(Boolean).join(" ")}
        role="combobox"
        aria-activedescendant={open && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
        aria-controls={listboxId}
        aria-describedby={ariaDescribedBy}
        aria-disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-required={required}
        disabled={disabled}
        onBlur={(event) => onBlur?.(event as unknown as FocusEvent<HTMLSelectElement>)}
        onClick={() => (open ? closeMenu() : openMenu())}
        onFocus={(event) => onFocus?.(event as unknown as FocusEvent<HTMLSelectElement>)}
        onKeyDown={handleKeyDown}
      >
        <span className="partner-select__value">{selectedOption?.label ?? "Select an option"}</span>
        <ChevronDown className="partner-select__chevron" size={18} aria-hidden="true" />
      </button>

      {open && menuPosition && createPortal(
        <div
          ref={menuRef}
          id={listboxId}
          className="partner-select__menu"
          role="listbox"
          aria-labelledby={ariaLabelledBy ?? controlId}
          style={menuPosition}
        >
          {options.map((option, index) => {
            const selected = option.value === selectedValue;
            const active = index === activeIndex;
            return (
              <div
                id={`${listboxId}-option-${index}`}
                key={option.key}
                className="partner-select__option"
                role="option"
                aria-disabled={option.disabled || undefined}
                aria-selected={selected}
                data-active={active || undefined}
                data-selected={selected || undefined}
                onClick={() => choose(option)}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => !option.disabled && setActiveIndex(index)}
              >
                {option.label}
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </div>
  );
}
