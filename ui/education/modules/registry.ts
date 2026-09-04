import type { ComponentType } from 'react';
import { Module1WhatIsAStock } from './Module1WhatIsAStock';

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
];
