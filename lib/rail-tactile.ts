// Curseur (input range) facile à attraper au doigt : toute la hauteur de la barre (48 px) sert de prise,
// et le rond saute directement sous le doigt puis le suit, au lieu de devoir viser le petit rond.
// Sur iPhone, Safari ne laisse glisser un curseur que si on touche exactement le rond : on gère donc le toucher nous-mêmes.
// Fonctionne avec un champ géré par React (onChange) comme avec un champ simple (événement input).

const POUCE = 28; // largeur du rond en px, pour que le doigt tombe au centre du rond

function poser(input: HTMLInputElement, clientX: number) {
  const r = input.getBoundingClientRect();
  const min = Number(input.min || 0), max = Number(input.max || 100), pas = Number(input.step || 1);
  const k = Math.min(1, Math.max(0, (clientX - r.left - POUCE / 2) / Math.max(1, r.width - POUCE)));
  const v = Math.min(max, Math.max(min, Math.round((min + k * (max - min)) / pas) * pas));
  if (String(v) === input.value) return;
  // Passe par le setter natif pour que React voie le changement
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input, String(v));
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

export function railTactile(input: HTMLInputElement) {
  let actif: number | null = null;
  const bas = (e: PointerEvent) => {
    if (e.pointerType === "mouse") return; // à la souris, le curseur natif marche très bien
    actif = e.pointerId;
    input.setPointerCapture?.(e.pointerId);
    poser(input, e.clientX);
  };
  const bouge = (e: PointerEvent) => { if (e.pointerId === actif) poser(input, e.clientX); };
  const fin = (e: PointerEvent) => {
    if (e.pointerId !== actif) return;
    actif = null;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  };
  // Empêche le navigateur de gérer le toucher en double (et de faire défiler la page pendant qu'on glisse)
  const toucher = (e: TouchEvent) => { if (e.cancelable) e.preventDefault(); };
  input.addEventListener("pointerdown", bas);
  input.addEventListener("pointermove", bouge);
  input.addEventListener("pointerup", fin);
  input.addEventListener("pointercancel", fin);
  input.addEventListener("touchstart", toucher, { passive: false });
  return () => {
    input.removeEventListener("pointerdown", bas);
    input.removeEventListener("pointermove", bouge);
    input.removeEventListener("pointerup", fin);
    input.removeEventListener("pointercancel", fin);
    input.removeEventListener("touchstart", toucher);
  };
}
