"use client";

import { useId, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { CalendarDays, ChevronDown } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { id as indonesia } from "react-day-picker/locale";
import { BUSINESS_TIME_ZONE, fromCalendarDate, toCalendarDate } from "@/lib/business-date";
import { formatDate } from "@/lib/cashflow";

type Props = {
  label: string;
  value: string;
  max: string;
  onChange: (date: string) => void;
  name?: string;
  disabled?: boolean;
};

export function DatePicker({ label, value, max, onChange, name, disabled }: Props) {
  const labelId = useId();
  const valueId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const selected = toCalendarDate(value);
  const lastDay = toCalendarDate(max);

  return (
    <div className="admin-date-picker">
      <label id={labelId} htmlFor={valueId}>{label}</label>
      {name && <input type="hidden" name={name} value={value} />}
      <Popover.Root open={open} onOpenChange={(next) => {
        // Portals inside a native modal must stay in that modal's top layer.
        if (next) setPortalContainer(trigger.current?.closest("dialog") ?? null);
        setOpen(next);
      }}>
        <Popover.Trigger asChild>
          <button
            id={valueId}
            ref={trigger}
            type="button"
            className="admin-date-trigger"
            disabled={disabled}
            aria-labelledby={`${labelId} ${valueId}-text`}
          >
            <CalendarDays size={18} aria-hidden="true" />
            <span id={`${valueId}-text`}>{formatDate(value)}</span>
            <ChevronDown size={16} aria-hidden="true" className="ml-auto shrink-0" />
          </button>
        </Popover.Trigger>
        <Popover.Portal container={portalContainer}>
          <Popover.Content
            className="admin-calendar-popover"
            aria-label={`Kalender ${label.toLowerCase()}`}
            align="end"
            sideOffset={8}
            collisionPadding={12}
            data-lenis-prevent
            onEscapeKeyDown={(event) => event.stopPropagation()}
          >
            <DayPicker
              className="admin-calendar"
              mode="single"
              required
              selected={selected}
              defaultMonth={selected}
              today={lastDay}
              endMonth={lastDay}
              disabled={{ after: lastDay }}
              timeZone={BUSINESS_TIME_ZONE}
              locale={indonesia}
              weekStartsOn={1}
              navLayout="around"
              autoFocus
              showOutsideDays
              fixedWeeks
              labels={{
                labelPrevious: () => "Bulan sebelumnya",
                labelNext: () => "Bulan berikutnya",
                labelDayButton: (day, modifiers) => `${formatDate(fromCalendarDate(day))}${modifiers.today ? ", hari ini" : ""}${modifiers.selected ? ", dipilih" : ""}`,
              }}
              onSelect={(day) => {
                onChange(fromCalendarDate(day));
                setOpen(false);
              }}
            />
            <p className="admin-calendar-note">Waktu Indonesia Barat · Senin–Minggu</p>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
