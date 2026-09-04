import type { ComponentType } from 'react';
import { Module1WhatIsAStock } from './Module1WhatIsAStock';
import { Module2ReadingAQuote } from './Module2ReadingAQuote';
import { Module3ChartsAndCandlesticks } from './Module3ChartsAndCandlesticks';
import { Module4TrendAndPriceAction } from './Module4TrendAndPriceAction';

export interface EducationModule {
  id: string;
  order: number;
  title: string;
  path: string;
  component: ComponentType;
}

export const educationModules: EducationModule[] = [
  {
    id: 'module-1',
    order: 1,
    title: 'What a Stock Is',
    path: '/education/module-1',
    component: Module1WhatIsAStock,
  },
  {
    id: 'module-2',
    order: 2,
    title: 'Reading a Quote',
    path: '/education/module-2',
    component: Module2ReadingAQuote,
  },
  {
    id: 'module-3',
    order: 3,
    title: 'Charts & Candlesticks',
    path: '/education/module-3',
    component: Module3ChartsAndCandlesticks,
  },
  {
    id: 'module-4',
    order: 4,
    title: 'Trend & Price Action',
    path: '/education/module-4',
    component: Module4TrendAndPriceAction,
  },
];
