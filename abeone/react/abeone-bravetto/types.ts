/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

export const PHI = 1.6180339887;
export const GOLDEN_ANGLE = 137.50776405; // 360 / PHI^2

export interface SectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export interface Laureate {
  name: string;
  image: string; // placeholder url
  role: string;
  desc: string;
}