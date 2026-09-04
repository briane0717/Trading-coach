import type { ComponentType } from 'react';
import { Module1WhatIsAStock } from './Module1WhatIsAStock';
import { Module2ReadingAQuote } from './Module2ReadingAQuote';
import { Module3ChartsAndCandlesticks } from './Module3ChartsAndCandlesticks';
import { Module4TrendAndPriceAction } from './Module4TrendAndPriceAction';
import { Module5VolumeAndWhatItTellsYou } from './Module5VolumeAndWhatItTellsYou';
import { Module6SupportAndResistance } from './Module6SupportAndResistance';
import { Module7TechnicalIndicators } from './Module7TechnicalIndicators';

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
  {
    id: 'module-5',
    order: 5,
    title: 'Volume & What It Tells You',
    path: '/education/module-5',
    component: Module5VolumeAndWhatItTellsYou,
  },
  {
    id: 'module-6',
    order: 6,
    title: 'Support & Resistance',
    path: '/education/module-6',
    component: Module6SupportAndResistance,
  },
  {
    id: 'module-7',
    order: 7,
    title: 'Technical Indicators: Moving Averages',
    path: '/education/module-7',
    component: Module7TechnicalIndicators,
  },
];
