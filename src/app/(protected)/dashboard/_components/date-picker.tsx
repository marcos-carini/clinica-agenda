"use client";

import { addMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { createParser, useQueryState } from "nuqs";
import * as React from "react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Cria um parser customizado para datas
const dateParser = createParser({
  parse: (value: string) => {
    // Garante que a data seja interpretada como UTC à meia-noite
    const date = new Date(value + "T12:00:00Z");
    return isNaN(date.getTime()) ? null : date;
  },
  serialize: (date: Date) => {
    // Serializa apenas a data em formato YYYY-MM-DD
    return date.toISOString().split("T")[0];
  },
});

export function DatePicker({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [from, setFrom] = useQueryState(
    "from",
    dateParser.withDefault(new Date()),
  );
  const [to, setTo] = useQueryState(
    "to",
    dateParser.withDefault(addMonths(new Date(), 1)),
  );

  const handleDateSelect = (dateRange: DateRange | undefined) => {
    if (dateRange?.from) {
      setFrom(dateRange.from, {
        shallow: false,
      });
    }
    if (dateRange?.to) {
      setTo(dateRange.to, {
        shallow: false,
      });
    }
  };

  const date = {
    from,
    to,
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "justify-start text-left font-normal",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y", {
                    locale: ptBR,
                  })}{" "}
                  -{" "}
                  {format(date.to, "LLL dd, y", {
                    locale: ptBR,
                  })}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateSelect}
            numberOfMonths={2}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
