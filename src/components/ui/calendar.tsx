"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

const gregorianMonths = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  month: pMonth,
  onMonthChange: pOnMonthChange,
  ...props
}: CalendarProps) {
  const [internalMonth, setInternalMonth] = React.useState(pMonth || (props.selected as Date) || new Date());
  
  const month = pMonth || internalMonth;
  const onMonthChange = pOnMonthChange || setInternalMonth;

  const fromYear = props.fromDate?.getFullYear() || new Date().getFullYear() - 100;
  const toYear = props.toDate?.getFullYear() || new Date().getFullYear();
  const years = Array.from({ length: toYear - fromYear + 1 }, (_, i) => toYear - i);

  const currentYear = month.getFullYear();
  const currentMonth = month.getMonth();

  const handleYearChange = (newYearStr: string) => {
    const newYear = Number(newYearStr);
    const newDate = new Date(month);
    newDate.setFullYear(newYear);
    onMonthChange(newDate);
  };

  const handleMonthChange = (newMonthIndexStr: string) => {
    const newMonthIndex = Number(newMonthIndexStr);
    const newDate = new Date(month);
    newDate.setMonth(newMonthIndex);
    onMonthChange(newDate);
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      month={month}
      onMonthChange={onMonthChange}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "hidden",
        caption_dropdowns: "flex justify-center gap-1",
        nav: "space-x-1 flex items-center",
        nav_button: "hidden",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Caption: () => (
          <div className="flex justify-center gap-2 mb-4">
            <Select
              value={currentMonth.toString()}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="w-[120px] focus:ring-0">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {gregorianMonths.map((month, i) => (
                  <SelectItem key={month} value={i.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={currentYear.toString()}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="w-[100px] focus:ring-0">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-80">
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
        ),
        IconLeft: () => null,
        IconRight: () => null,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
