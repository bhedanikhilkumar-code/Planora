import { z } from 'zod';
import { DATE_ERROR, DATE_MAX, DATE_MIN } from '../config/constants.js';

export const dateInAllowedRange = z.coerce.date().refine((d) => d >= DATE_MIN && d <= DATE_MAX, DATE_ERROR);

export const ensureDateRange = (date: Date) => {
  if (date < DATE_MIN || date > DATE_MAX) {
    throw new Error(DATE_ERROR);
  }
};
