// Traduction par texte source : le français sert de clé, comme gettext. Une phrase absente du dictionnaire reste en français.
export type Dict = Record<string, string>;
export type Vars = Record<string, string | number>;
export type T = (fr: string, vars?: Vars) => string;

export function makeT(dict: Dict | null | undefined): T {
  return (fr, vars) => {
    let s = (dict && dict[fr]) || fr;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
    return s;
  };
}

// Marque un texte à traduire plus tard (listes de constantes) : ne change rien, sert à l'extraction.
export const tk = (fr: string) => fr;

// Prix en euros au format de la langue (19,90 € en français, €19.90 en anglais…).
export function fmtEur(n: number, locale: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", minimumFractionDigits: Number.isInteger(n) ? 0 : 2 }).format(n);
}
