import { AsyncLocalStorage } from "node:async_hooks";

// Compte à l'origine des appels API en cours (posé par withUser), pour le suivi des dépenses par compte.
export const usageContext = new AsyncLocalStorage<{ userId: number }>();
