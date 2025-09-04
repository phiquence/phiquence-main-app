
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ArrowDownLeft, ArrowUpRight, MinusSquare, CircleDollarSign, Users } from 'lucide-react';
import React from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const getTransactionIcon = (type: string): React.ReactNode => {
    switch (type) {
        case 'deposit':
            return React.createElement(ArrowDownLeft, { className: "h-4 w-4 text-green-500" });
        case 'withdraw':
            return React.createElement(ArrowUpRight, { className: "h-4 w-4 text-red-500" });
        case 'stake_daily':
        case 'reward':
            return React.createElement(CircleDollarSign, { className: "h-4 w-4 text-yellow-500" });
        case 'commission':
            return React.createElement(Users, { className: "h-4 w-4 text-blue-500" });
        default:
            return React.createElement(MinusSquare, { className: "h-4 w-4 text-muted-foreground" });
    }
}

export const getTransactionColor = (type: string): string => {
      switch (type) {
          case 'deposit':
              return 'text-green-500';
          case 'withdraw':
              return 'text-red-500';
          case 'reward':
          case 'stake_daily':
          case 'commission':
               return 'text-yellow-500';
          default:
              return '';
      }
}
