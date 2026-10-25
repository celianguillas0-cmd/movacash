// Moteur du sondage public, sans React : il écrit le HTML de chaque étape dans un conteneur.
// Le même fichier sert à l'appli (app/quiz/Funnel.tsx) et à la maquette interactive (compilé en script autonome).

import { ETAPES_CALCUL as ETAPES_FR, LEVIERS as LEVIERS_FR, TEMPS as TEMPS_FR, PARCOURS as PARCOURS_FR, PRIX_EBOOK, SLIDER as SLIDER_FR, STEPS as STEPS_FR, scoringAnswers, type Answers, type Step } from "./steps";
import { fmtEur, type T } from "../i18n/t";

export type FunnelPlan = { id: string; name: string; price: number; ebooks: number; features: string[]; highlight?: boolean };

export type FunnelConfig = {
  root: HTMLElement;
  categories: { slug: string; name: string }[];
  plans: FunnelPlan[];
  user: { name?: string } | null;
  demo?: boolean;
  storageKey?: string;
  api: {
    signup: (d: { name: string; email: string; password: string; answers: Answers }) => Promise<{ ok: boolean; error?: string }>;
    saveQuiz: (answers: Record<string, unknown>) => Promise<void>;
    checkout: (plan: string) => Promise<{ url?: string; error?: string }>;
  };
  onUrl?: (url: string) => void;
  // Traduction (le français sert de clé) et langue des montants
  t?: T;
  locale?: string;
};

// Textes des étapes passés dans la traduction
function localizeStep(s: Step, tr: T): Step {
  const f = (x?: string) => (x ? tr(x) : x);
  return {
    ...s,
    kicker: f(s.kicker),
    titre: f(s.titre),
    aide: f(s.aide),
    placeholder: f(s.placeholder),
    sous: f(s.sous),
    cta: f(s.cta),
    apresChoix: f(s.apresChoix),
    libre: s.libre ? { placeholder: tr(s.libre.placeholder), label: f(s.libre.label) } : undefined,
    options: s.options?.map((o) => ({ ...o, label: tr(o.label), detail: f(o.detail), note: f(o.note) })),
  };
}

const AUTRE = "autre";
const VITESSE_FRAPPE = 46; // lettres par seconde

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
const fleche = `<span class="btn-arrow">→</span>`;

// Illustrations dessinées pour Movacash
function jauge(index: number, total: number) {
  const t = total > 1 ? index / (total - 1) : 0;
  const a = Math.PI * (1 - t);
  const x = (32 + 25 * Math.cos(a)).toFixed(1);
  const y = (36 - 25 * Math.sin(a)).toFixed(1);
  return `<svg class="illu" viewBox="0 0 64 44" aria-hidden="true"><path d="M7 36a25 25 0 0 1 50 0" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".3"/><path d="M7 36a25 25 0 0 1 50 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" pathLength="100" stroke-dasharray="${(t * 100).toFixed(1)} 100"/><circle cx="${x}" cy="${y}" r="3.6" fill="currentColor"/></svg>`;
}

function visage(n: number) {
  const c = [-6, -3, 0, 3, 6][n];
  const bouche = c === 0 ? "M17 31h14" : `M17 ${(31 - c / 3).toFixed(1)} Q24 ${(31 + c * 1.5).toFixed(1)} 31 ${(31 - c / 3).toFixed(1)}`;
  return `<svg class="visage" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="18.5" fill="none" stroke="currentColor" stroke-width="1.6" opacity=".45"/><circle cx="18" cy="20.5" r="2" fill="currentColor"/><circle cx="30" cy="20.5" r="2" fill="currentColor"/><path d="${bouche}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
}

const ILLUS: Record<string, string> = {
  etoile: `<svg viewBox="0 0 96 96" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round">${Array.from({ length: 12 }, (_, n) => {
    const a = (n * Math.PI) / 6;
    const r1 = n % 2 ? 16 : 12;
    const r2 = n % 2 ? 30 : 40;
    return `<line x1="${(48 + r1 * Math.cos(a)).toFixed(1)}" y1="${(48 + r1 * Math.sin(a)).toFixed(1)}" x2="${(48 + r2 * Math.cos(a)).toFixed(1)}" y2="${(48 + r2 * Math.sin(a)).toFixed(1)}"/>`;
  }).join("")}<circle cx="48" cy="48" r="5" fill="currentColor" stroke="none"/></svg>`,
  ampoule: `<svg viewBox="0 0 96 96" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M48 12a24 24 0 0 0-15 42.7c3 2.4 5 5.6 5 9.3v2h20v-2c0-3.7 2-6.9 5-9.3A24 24 0 0 0 48 12Z"/><path d="M39 74h18M42 82h12"/><path d="M42 50l6-8 6 8" opacity=".55"/></svg>`,
  livre: `<svg viewBox="0 0 96 96" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M48 26c-8-6-20-7-32-5v52c12-2 24-1 32 5 8-6 20-7 32-5V21c-12-2-24-1-32 5Z"/><path d="M48 26v52"/><path d="M24 36h14M24 46h14M58 36h14M58 46h10" opacity=".45"/></svg>`,
  chemin: `<svg viewBox="0 0 96 96" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 82c14 0 14-14 28-14s14-14 28-14" stroke-dasharray="2 9"/><path d="M70 54V14"/><path d="M70 16h18l-6 8 6 8H70"/><circle cx="14" cy="82" r="4" fill="currentColor" stroke="none"/></svg>`,
};

const ICONE_MAIL = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="M3.5 7.5l8.5 6 8.5-6"/></svg>`;
const ICONE_BOUCLIER = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6L12 3Z"/><path d="M8.8 12.2l2.2 2.2 4.4-4.6"/></svg>`;
const EMPREINTE = `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">${[6, 11, 16, 21, 26]
  .map((r, n) => `<path d="M${32 - r} ${36 + n} a${r} ${r + 2} 0 0 1 ${r * 2} 0" opacity="${1 - n * 0.12}"/>`)
  .join("")}<path d="M32 30v14"/></svg>`;

export function mountFunnel(cfg: FunnelConfig) {
  const root = cfg.root;
  const tr: T = cfg.t || ((x) => x);
  const loc = cfg.locale || "fr";
  const euros = (n: number) => fmtEur(Math.round(n), loc);
  const prix = (n: number) => new Intl.NumberFormat(loc, { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(n);
  const STEPS = STEPS_FR.map((x) => localizeStep(x, tr));
  const SLIDER = { ...SLIDER_FR, paliers: SLIDER_FR.paliers.map((p) => ({ ...p, mot: tr(p.mot), note: tr(p.note) })) };
  const LEVIERS = LEVIERS_FR.map((l) => ({ ...l, question: tr(l.question), detail: tr(l.detail), libelle: tr(l.libelle), action: tr(l.action) }));
  const TEMPS: Record<string, string> = Object.fromEntries(Object.entries(TEMPS_FR).map(([k, v]) => [k, tr(v)]));
  const ETAPES_CALCUL = ETAPES_FR.map((x) => tr(x));
  const PARCOURS = PARCOURS_FR.map((e) => ({ titre: tr(e.titre), texte: tr(e.texte) }));
  const KEY = cfg.storageKey || "mc_funnel";
  let user = cfg.user;
  let answers: Answers = {};
  let step = 0;
  let noteAffichee = false;
  let libreOuvert = false;
  let tapes = new Set<string>();
  let timers: number[] = [];
  let popupSuite: ((v: string) => void) | null = null;
  let quizEnvoye = false;

  try {
    const s = JSON.parse(localStorage.getItem(KEY) || "null");
    if (s && typeof s === "object") {
      answers = s.answers || {};
      const i = STEPS.findIndex((x) => x.id === s.step);
      if (i > 0) step = STEPS[i].type === "chargement" ? i - 1 : i;
    }
  } catch {}
  if (!visible(step)) step = suivant(step, 1);

  function sauver() {
    try {
      localStorage.setItem(KEY, JSON.stringify({ answers, step: STEPS[step]?.id }));
    } catch {}
  }

  function visible(i: number) {
    const s = STEPS[i];
    if (!s) return false;
    if (s.type === "compte" && user) return false;
    return !s.condition || s.condition(answers);
  }
  function suivant(i: number, dir: 1 | -1) {
    let j = i + dir;
    while (j >= 0 && j < STEPS.length && (!visible(j) || (dir === -1 && STEPS[j].type === "chargement"))) j += dir;
    return j;
  }
  function arreter() {
    timers.forEach((t) => clearTimeout(t));
    timers = [];
    popupSuite = null;
  }
  function goTo(i: number) {
    arreter();
    step = Math.max(0, Math.min(STEPS.length - 1, i));
    noteAffichee = false;
    libreOuvert = false;
    sauver();
    show();
    window.scrollTo({ top: 0 });
  }
  const next = () => goTo(suivant(step, 1));
  const back = () => goTo(Math.max(0, suivant(step, -1)));

  function progression() {
    const vis = STEPS.map((_, i) => i).filter((i) => visible(i));
    const n = Math.max(0, vis.indexOf(step));
    return Math.round(((n + 1) / vis.length) * 100);
  }
  const barre = () => `<div class="progress"><div class="progress-track" role="progressbar" aria-valuenow="${progression()}" aria-valuemin="0" aria-valuemax="100" aria-label="${tr("Avancement du sondage")}"><div class="progress-fill" style="width:${progression()}%"></div></div></div>`;
  const retour = () => (suivant(step, -1) >= 0 ? `<p class="retour-haut"><button class="btn-ghost" data-action="back">← ${tr("Question précédente")}</button></p>` : "");
  const tete = (s: Step) => `<p class="stage-kicker">${esc(s.kicker)}</p><h1 class="stage-title stage-title-q machine">${esc(s.titre)}</h1>${s.aide ? `<p class="stage-lede">${esc(s.aide)}</p>` : ""}`;
  const bouton = (label: string, action = "next", extra = "") => `<button class="btn btn-primary btn-lg" data-action="${action}" ${extra}>${label} ${fleche}</button>`;
  const prenom = () => esc((user?.name || "").trim());

  function render(html: string) {
    root.innerHTML = html;
    const sec = root.querySelector("[data-reveal]");
    if (sec) requestAnimationFrame(() => requestAnimationFrame(() => sec.classList.add("in")));
    const titre = root.querySelector<HTMLElement>(".machine");
    const id = STEPS[step].id;
    if (titre && !tapes.has(id)) {
      tapes.add(id);
      taper(titre);
    }
  }

  function taper(el: HTMLElement) {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const html = el.innerHTML;
    const texte = el.textContent || "";
    el.style.minHeight = `${el.offsetHeight}px`;
    el.textContent = "";
    el.classList.add("ecrit");
    const debut = performance.now();
    const fin = () => {
      el.innerHTML = html;
      el.classList.remove("ecrit");
      el.style.minHeight = "";
    };
    const pas = (t: number) => {
      if (!el.isConnected) return;
      const n = Math.floor(((t - debut) / 1000) * VITESSE_FRAPPE);
      if (n >= texte.length) return fin();
      el.textContent = texte.slice(0, n);
      requestAnimationFrame(pas);
    };
    requestAnimationFrame(pas);
  }

  // ---------- Écrans ----------

  function showQuestion(s: Step) {
    const a = answers[s.id];
    const opts = s.options || [];
    const cartes = opts
      .map((o, n) => {
        const choisie = a === o.id;
        const dedans = Boolean(o.note && s.notesVisibles);
        const carte = `<button class="option ${s.illustrations ? "option-illu" : ""} ${dedans ? "option-avec-note" : ""} ${choisie ? "selected" : ""}" data-action="answer" data-v="${o.id}">${s.illustrations ? jauge(n, opts.length) : ""}${
          dedans ? `<span class="option-corps"><span class="option-label">${esc(o.label)}</span><span class="option-note">${esc(o.note)}</span></span>` : `<span class="option-label">${esc(o.label)}</span>`
        }</button>`;
        const message = s.apresChoix || o.note;
        return !dedans && choisie && noteAffichee && message ? carte + `<div class="note-tiroir ouvert"><p class="note-choix">${esc(message)}</p></div>` : carte;
      })
      .join("");
    const continuer = (s.confirmer && a) || (s.notesVisibles && a) || (noteAffichee && a);
    render(`${barre()}${retour()}<section class="stage" data-reveal>${tete(s)}<div class="choix"><div class="options ${s.compact ? "options-compact" : ""}">${cartes}</div>${s.libre ? optionLibre(s, false) : ""}${s.libre && libreOuvert ? panneauLibre(s, false) : ""}</div>${continuer ? bouton(tr("Continuer")) : ""}</section>`);
  }

  function optionLibre(s: Step, multi: boolean) {
    const texte = String(answers[s.id + "_libre"] || "").trim();
    const choisie = multi ? ((answers[s.id] as string[]) || []).includes(AUTRE) : answers[s.id] === AUTRE;
    return `<button class="option option-autre ${multi ? "option-check" : ""} ${choisie ? "selected" : ""}" data-action="${multi && choisie ? "retirer-libre" : "ouvrir-libre"}">${multi ? `<span class="option-tick" aria-hidden="true"></span>` : ""}<span class="option-label">${choisie && texte ? esc(texte) : esc(s.libre?.label || tr("Ma réponse n'est pas dans la liste"))}</span><span class="option-detail">${choisie ? (multi ? tr("Cliquer pour retirer") : tr("Modifier ma réponse")) : tr("Écris-la toi-même")}</span></button>`;
  }
  function panneauLibre(s: Step, multi: boolean) {
    return `<div class="libre"><input class="libre-input" id="libre-input" type="text" maxlength="120" value="${esc(answers[s.id + "_libre"] || "")}" placeholder="${esc(s.libre?.placeholder)}"/><div class="libre-actions"><button class="btn btn-primary" data-action="valider-libre" data-multi="${multi ? "1" : ""}">${tr("Valider ma réponse")}</button><button class="btn-ghost" data-action="fermer-libre">${tr("Annuler")}</button></div></div>`;
  }

  function showMulti(s: Step, themes = false) {
    const sel = (answers[s.id] as string[]) || [];
    const opts = themes ? cfg.categories.map((c) => ({ id: c.slug, label: c.name })) : s.options || [];
    const cartes = opts
      .map((o) => `<button class="option option-check ${sel.includes(o.id) ? "selected" : ""}" data-action="toggle" data-v="${o.id}"><span class="option-tick" aria-hidden="true"></span><span class="option-label">${esc(o.label)}</span></button>`)
      .join("");
    const n = sel.length;
    render(`${barre()}${retour()}<section class="stage" data-reveal>${tete(s)}<div class="options ${themes ? "options-grille" : ""}">${cartes}${s.libre ? optionLibre(s, true) : ""}</div>${s.libre && libreOuvert ? panneauLibre(s, true) : ""}<button class="btn btn-primary" data-action="next" ${n ? "" : "disabled"}>${n ? (n > 1 ? tr("Continuer ({n} cochés)", { n }) : tr("Continuer (1 coché)")) : tr("Coche au moins une réponse")} ${fleche}</button></section>`);
  }

  function showPreuve() {
    render(`${barre()}${retour()}<section class="stage stage-center preuve" data-reveal><p class="stage-kicker">${tr("Tu n'es pas seul")}</p><p class="preuve-avant">${tr("Sur Etsy, il y a près de")}</p><p class="compteur"><span id="compteur">0</span><span class="compteur-unite"> ${tr("millions")}</span></p><p class="preuve-apres">${tr("d'acheteurs actifs, qui cherchent chaque jour des guides, des planners et des fiches pratiques.")}</p><p class="preuve-note">${tr("Source : chiffres publiés par Etsy (2024).")}</p>${bouton(tr("Continuer"))}</section>`);
    const el = root.querySelector<HTMLElement>("#compteur");
    const debut = performance.now();
    const tic = (t: number) => {
      if (!el?.isConnected) return;
      const k = Math.min(1, (t - debut) / 1400);
      el.textContent = String(Math.round(90 * (1 - Math.pow(1 - k, 3))));
      if (k < 1) requestAnimationFrame(tic);
    };
    requestAnimationFrame(tic);
  }

  function showExplication() {
    const points = [
      [tr("Tu le crées une seule fois"), tr("Pas de stock, pas d'envoi : le même fichier peut se vendre autant de fois qu'il trouve preneur.")],
      [tr("Etsy a déjà des acheteurs"), tr("Ils y tapent « planner », « guide » ou « recettes ». Une fiche bien rédigée peut apparaître dans leurs recherches.")],
      [tr("Tu fixes ton prix"), tr("C'est toi qui décides combien coûte ton e-book.")],
    ];
    render(`${barre()}${retour()}<section class="stage explication" data-reveal><p class="stage-kicker">${tr("En trente secondes")}</p><h1 class="stage-title stage-title-q machine">${tr("Un e-book à vendre, c'est quoi ?")}</h1><p class="saas-chapo">${tr("Un guide en PDF sur un sujet que des gens cherchent. Tu le crées avec Movacash, tu le mets en vente sur Etsy, et chaque acheteur le télécharge tout seul.")}</p><ol class="saas-points">${points
      .map(([t, p], n) => `<li style="--retard:${n * 90}ms"><span class="saas-num">${n + 1}</span><div><h2>${t}</h2><p>${p}</p></div></li>`)
      .join("")}</ol>${bouton(tr("Compris"))}</section>`);
  }

  function showUrl(s: Step) {
    render(`${barre()}${retour()}<section class="stage" data-reveal>${tete(s)}<div class="url-champ"><input class="free-text url-input" id="url-input" type="text" inputmode="url" autocomplete="url" maxlength="200" placeholder="${esc(s.placeholder)}" value="${esc(answers[s.id] || "")}"/></div><div class="text-actions">${bouton(tr("Continuer"), "save-url")}<button class="btn-ghost" data-action="next">${tr("Passer cette étape")}</button></div></section>`);
    root.querySelector<HTMLInputElement>("#url-input")?.focus();
  }

  function showEchelle(s: Step) {
    render(`${barre()}${retour()}<section class="stage" data-reveal>${tete(s)}<div class="echelle" role="group">${(s.options || [])
      .map((o, n) => `<button class="cran ${answers[s.id] === o.id ? "selected" : ""}" data-action="answer" data-v="${o.id}">${visage(n)}<span class="cran-label">${esc(o.label)}</span></button>`)
      .join("")}</div></section>`);
  }

  const palier = (v: number) => SLIDER.paliers.find((p) => v <= p.jusqua) || SLIDER.paliers[SLIDER.paliers.length - 1];
  const ventes = (v: number) => Math.ceil(v / PRIX_EBOOK);
  const calcul = (v: number) => tr("À {prix} l'e-book, ça représente <strong>{n} ventes</strong> par mois.", { prix: euros(PRIX_EBOOK), n: ventes(v) });
  function showSlider(s: Step) {
    const v = Number(answers[s.id] ?? SLIDER.defaut);
    const part = ((v - SLIDER.min) / (SLIDER.max - SLIDER.min)) * 100;
    render(`${barre()}${retour()}<section class="stage" data-reveal>${tete(s)}<div class="curseur"><div class="curseur-tete"><span class="curseur-montant" id="c-montant">${euros(v)}</span><span class="curseur-palier" id="c-palier">${palier(v).mot}</span></div><input class="curseur-rail" id="c-rail" type="range" min="${SLIDER.min}" max="${SLIDER.max}" step="${SLIDER.pas}" value="${v}" aria-label="${esc(s.titre)}" style="--part:${part.toFixed(1)}%"/><div class="curseur-bornes"><span>${euros(SLIDER.min)}<em>${tr("premier pas")}</em></span><span>${euros(SLIDER.max)}<em>${tr("ambitieux")}</em></span></div><p class="curseur-note" id="c-note">${palier(v).note}</p><p class="curseur-calcul" id="c-calcul">${calcul(v)}</p></div>${bouton(tr("Continuer"), "valider-curseur")}</section>`);
    const rail = root.querySelector<HTMLInputElement>("#c-rail")!;
    rail.addEventListener("input", () => {
      const x = Number(rail.value);
      answers[s.id] = x;
      rail.style.setProperty("--part", `${(((x - SLIDER.min) / (SLIDER.max - SLIDER.min)) * 100).toFixed(1)}%`);
      root.querySelector("#c-montant")!.textContent = euros(x);
      root.querySelector("#c-palier")!.textContent = palier(x).mot;
      root.querySelector("#c-note")!.textContent = palier(x).note;
      root.querySelector("#c-calcul")!.innerHTML = calcul(x);
    });
  }

  function showChargement() {
    render(`${barre()}<section class="stage stage-center calcul" data-reveal><p class="stage-kicker">${tr("Calcul en cours")}</p><h1 class="stage-title stage-title-q">${tr("On prépare ton diagnostic.")}</h1><p class="stage-lede">${tr("Encore deux questions pendant que ça tourne.")}</p><div class="calcul-anneau"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="anneau-fond" cx="60" cy="60" r="54"/><circle class="anneau-trait" id="c-anneau" cx="60" cy="60" r="54" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/></svg><p class="calcul-pct"><b id="c-pct">0</b><i>%</i></p></div><ol class="calcul-etapes">${ETAPES_CALCUL.map((t) => `<li class="calcul-etape"><span class="calcul-coche" aria-hidden="true"></span><span>${t}</span></li>`).join("")}</ol><div class="popup" id="popup" hidden><div class="popup-carte" role="dialog" aria-modal="true" aria-labelledby="popup-q"><p class="popup-question" id="popup-q"></p><p class="popup-detail" id="popup-d"></p><div class="popup-actions"><button class="btn" data-action="levier" data-v="non">${tr("Non")}</button><button class="btn btn-primary" data-action="levier" data-v="oui">${tr("Oui")}</button></div></div></div></section>`);
    const anneau = root.querySelector<SVGCircleElement>("#c-anneau")!;
    const pct = root.querySelector<HTMLElement>("#c-pct")!;
    const etapes = [...root.querySelectorAll(".calcul-etape")];
    const calme = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const pause = calme ? 500 : 2600;
    anneau.style.transition = `stroke-dashoffset ${pause}ms ease`;
    let n = 0;
    const chiffrer = (de: number, vers: number) => {
      const debut = performance.now();
      const tic = (t: number) => {
        if (!pct.isConnected) return;
        const k = Math.min(1, (t - debut) / pause);
        pct.textContent = String(Math.round((de + (vers - de) * k) * 100));
        if (k < 1) requestAnimationFrame(tic);
      };
      requestAnimationFrame(tic);
    };
    const marquer = (part: number) => {
      const atteint = Math.round(part * etapes.length);
      etapes.forEach((li, k) => {
        li.classList.toggle("fait", k + 1 <= atteint);
        li.classList.toggle("encours", k + 1 > atteint && k <= atteint);
      });
    };
    const avancer = () => {
      const avant = n / (LEVIERS.length + 1);
      const part = (n + 1) / (LEVIERS.length + 1);
      chiffrer(avant, part);
      anneau.style.strokeDashoffset = String(Math.max(0, 100 - Math.round(part * 100)));
      marquer(avant);
      timers.push(window.setTimeout(() => marquer(part), pause * 0.9));
      const levier = LEVIERS[n];
      if (!levier) {
        timers.push(window.setTimeout(next, pause + 300));
        return;
      }
      timers.push(
        window.setTimeout(() => {
          const popup = root.querySelector<HTMLElement>("#popup");
          if (!popup) return;
          root.querySelector("#popup-q")!.textContent = levier.question;
          root.querySelector("#popup-d")!.textContent = levier.detail;
          popup.hidden = false;
          popupSuite = (v) => {
            answers[levier.id] = v;
            sauver();
            popup.hidden = true;
            n += 1;
            avancer();
          };
        }, pause),
      );
    };
    timers.push(window.setTimeout(avancer, 60));
  }

  function diagnostic() {
    const objectif = Number(answers.revenu ?? SLIDER.defaut);
    const actions = [
      { libelle: tr("Publier ton premier e-book sur Etsy"), detail: tr("Un sujet précis, relu avec soin.") },
      ...LEVIERS.filter((l) => answers[l.id] === "oui").map((l) => ({ libelle: l.action, detail: l.detail })),
      { libelle: tr("Rester régulier"), detail: answers.time ? tr("{temps} par jour, chaque semaine.", { temps: TEMPS[String(answers.time)] || tr("Un peu de temps") }) : tr("Un peu chaque semaine.") },
    ];
    return { objectif, actions, ventes: ventes(objectif) };
  }
  function showSimulation() {
    const { objectif, actions, ventes: nb } = diagnostic();
    render(`${barre()}${retour()}<section class="stage projection" data-reveal><div class="proj-carte"><p class="proj-grand">${tr("Ton objectif")}</p><p class="proj-montant"><span>${euros(objectif)}</span></p><p class="proj-sous">${tr("par mois : c'est l'objectif que tu as choisi")}</p><div class="proj-barre">${actions
      .map((_, n) => `<span class="seg seg-${Math.min(n, 2)}" style="flex:1"></span>`)
      .join("")}</div><div class="proj-chiffres"><div><b>${nb}</b><span>${tr("ventes par mois")}</span></div><div><b>${euros(PRIX_EBOOK)}</b><span>${tr("si tu vends à ce prix")}</span></div><div><b>${Math.ceil(nb / 30)}</b><span>${tr("par jour environ")}</span></div></div></div><p class="proj-intro">${tr("Pour t'en approcher, voilà ce qu'il faudrait faire :")}</p><div class="proj-lignes">${actions
      .map((l, n) => `<div class="proj-ligne"><i class="pastille pastille-${Math.min(n, 2)}"></i><span class="proj-nom">${esc(l.libelle)}<small>${esc(l.detail)}</small></span></div>`)
      .join("")}</div><p class="hypothese">${tr("Simple calcul à partir de ton objectif, pas une promesse ni une prévision. Tes ventes dépendent de ton sujet, de ta relecture et de ta régularité.")}</p>${bouton(tr("Continuer"))}</section>`);
  }

  function showBarriere() {
    render(`${barre()}${retour()}<section class="stage stage-center barriere" data-reveal><p class="stage-kicker">${tr("Ce qui te manque")}</p><h1 class="stage-title stage-title-q">${tr("Il te manque une méthode")}<br/><em>${tr("et les bons outils.")}</em></h1><p class="barriere-reponse">${tr("Movacash te donne les outils. L'action, c'est toi.")}</p>${bouton(tr("Continuer"))}</section>`);
  }

  function showMessage(s: Step) {
    render(`${barre()}${retour()}<section class="stage message ${s.illustration ? "message-illu" : "message-texte"}" data-reveal>${s.illustration ? `<div class="illu-grande" aria-hidden="true">${ILLUS[s.illustration]}</div>` : ""}<p class="stage-kicker">${esc(s.kicker)}</p><h1 class="stage-title stage-title-q machine">${esc(s.titre)}</h1>${s.sous ? `<p class="stage-lede">${esc(s.sous)}</p>` : ""}${bouton(esc(s.cta || tr("Continuer")))}</section>`);
  }

  function showCompte(erreur = "", valeurs: { name?: string; email?: string; password?: string; cgv?: boolean } = {}) {
    render(`${barre()}<section class="stage stage-center account account-court" data-reveal><span class="account-icone" aria-hidden="true">${ICONE_MAIL}</span><h1 class="stage-title stage-title-q">${tr("Crée ton compte")}<br/><em>${tr("pour débloquer tes résultats.")}</em></h1><form class="account-form" id="signup-form" novalidate><label class="field"><span>${tr("Prénom")}</span><input name="name" type="text" autocomplete="given-name" placeholder="${tr("Camille")}" value="${esc(valeurs.name || "")}" required/></label><label class="field"><span>${tr("E-mail")}</span><input name="email" type="email" autocomplete="email" inputmode="email" placeholder="${tr("camille@exemple.fr")}" value="${esc(valeurs.email || "")}" required/></label><label class="field"><span>${tr("Mot de passe")}</span><input name="password" type="password" autocomplete="new-password" minlength="8" placeholder="${tr("8 caractères minimum")}" required/></label><label class="case"><input name="cgv" type="checkbox"/><span>${tr("J'accepte les")} <a href="/cgv" target="_blank" rel="noopener">${tr("CGV")}</a> ${tr("et la")} <a href="/confidentialite" target="_blank" rel="noopener">${tr("politique de confidentialité")}</a>${tr(", et je comprends qu'aucun revenu n'est garanti.")}</span></label>${erreur ? `<p class="form-error">${esc(erreur)}</p>` : ""}<button class="btn btn-primary btn-lg" type="submit">${tr("Continuer")} ${fleche}</button><p class="form-note">${tr("Tes réponses sont enregistrées dans ton compte. Pas de revente de données.")}</p></form></section>`);
    const form = root.querySelector<HTMLFormElement>("#signup-form")!;
    if (valeurs.password) (form.elements.namedItem("password") as HTMLInputElement).value = valeurs.password;
    if (valeurs.cgv) (form.elements.namedItem("cgv") as HTMLInputElement).checked = true;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const d = new FormData(form);
      const name = String(d.get("name") || "").trim();
      const email = String(d.get("email") || "").trim();
      const password = String(d.get("password") || "");
      const garder = { name, email, password, cgv: Boolean(d.get("cgv")) };
      if (!name) return showCompte(tr("Indique ton prénom."), garder);
      if (!/^\S+@\S+\.\S+$/.test(email)) return showCompte(tr("Adresse e-mail invalide."), garder);
      if (password.length < 8) return showCompte(tr("Mot de passe : 8 caractères minimum."), garder);
      if (!d.get("cgv")) return showCompte(tr("Coche la case pour accepter les CGV."), garder);
      const btn = form.querySelector<HTMLButtonElement>("button[type=submit]")!;
      btn.disabled = true;
      btn.firstChild!.textContent = tr("Création du compte…") + " ";
      const r = await cfg.api.signup({ name, email, password, answers: scoringAnswers(answers, name) }).catch(() => ({ ok: false, error: "" }));
      if (!r.ok) return showCompte(r.error ? tr(r.error) : tr("Une erreur est survenue, réessaie."), garder);
      user = { name };
      next();
    });
  }

  function showText(s: Step) {
    render(`${barre()}${retour()}<section class="stage" data-reveal>${tete(s)}<textarea class="free-text" id="free-text" rows="3" maxlength="320" placeholder="${esc(s.placeholder)}">${esc(answers[s.id] || "")}</textarea><div class="text-actions"><button class="btn btn-primary" data-action="save-text">${tr("Valider")} ${fleche}</button>${s.optional ? `<button class="btn-ghost" data-action="next">${tr("Passer cette étape")}</button>` : ""}</div></section>`);
  }

  function showObjectif() {
    render(`${barre()}${retour()}<section class="stage stage-center objectif" data-reveal><p class="stage-kicker">${tr("Ton cap")}</p><h1 class="stage-title stage-title-q">${tr("Ton objectif est clair.")}<br/><em>${tr("Reste à passer à l'action.")}</em></h1>${bouton(tr("Continuer"))}</section>`);
  }

  function showParcours() {
    envoyerQuiz();
    const p = prenom();
    render(`${barre()}${retour()}<section class="stage parcours" data-reveal><p class="stage-kicker">${tr("Ce qu'on fait maintenant")}</p><h1 class="stage-title stage-title-q">${p ? tr("{prenom}, voilà comment on t'amène", { prenom: p }) : tr("Voilà comment on t'amène")} <em>${tr("à ton premier e-book en vente.")}</em></h1><ol class="etapes">${PARCOURS.map(
      (e, n) => `<li class="etape" style="--retard:${n * 80}ms"><span class="etape-num">${String(n + 1).padStart(2, "0")}</span><div class="etape-corps"><h2>${esc(e.titre)}</h2><p>${esc(e.texte)}</p></div></li>`,
    ).join("")}</ol>${bouton(tr("Continuer"))}</section>`);
  }

  function showSerment() {
    render(`${barre()}${retour()}<section class="stage stage-center serment" data-reveal><p class="stage-kicker">${tr("Ta promesse")}</p><h1 class="stage-title stage-title-q">${tr("Avant d'aller plus loin,")}<br/><em>${tr("fais-toi une promesse.")}</em></h1><blockquote class="serment-texte">${tr("« Je me promets d'aller au bout de mon premier e-book, de le relire avec soin et de le mettre en vente. »")}</blockquote><button class="empreinte" id="empreinte" aria-label="${tr("Rester appuyé pour signer")}"><svg class="empreinte-anneau" viewBox="0 0 120 120" aria-hidden="true"><circle class="empreinte-piste" cx="60" cy="60" r="56"/><circle class="empreinte-jauge" id="e-jauge" cx="60" cy="60" r="56" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/></svg><span class="empreinte-dessin">${EMPREINTE}</span><span class="empreinte-remplie" id="e-remplie">${EMPREINTE}</span></button><p class="serment-aide" id="e-aide">${tr("Reste appuyé une dizaine de secondes pour signer")}</p></section>`);
    const btn = root.querySelector<HTMLButtonElement>("#empreinte")!;
    const jauge = root.querySelector<SVGCircleElement>("#e-jauge")!;
    const remplie = root.querySelector<HTMLElement>("#e-remplie")!;
    const DUREE = 10000;
    let debut = 0;
    let raf = 0;
    let signe = false;
    const peindre = (k: number) => {
      jauge.style.strokeDashoffset = String(100 - k * 100);
      remplie.style.clipPath = `inset(${(100 - k * 100).toFixed(1)}% 0 0 0)`;
    };
    const tic = (t: number) => {
      const k = Math.min(1, (t - debut) / DUREE);
      peindre(k);
      const aide = root.querySelector("#e-aide");
      if (aide && k < 1) aide.textContent = tr("Garde le doigt appuyé… {n} s", { n: Math.ceil((DUREE * (1 - k)) / 1000) });
      if (k >= 1) {
        signe = true;
        btn.classList.add("empreinte-signee");
        root.querySelector("#e-aide")!.textContent = tr("Signé");
        timers.push(window.setTimeout(next, 650));
        return;
      }
      raf = requestAnimationFrame(tic);
    };
    const appui = (e: Event) => {
      e.preventDefault();
      if (signe) return;
      btn.classList.add("empreinte-active");
      debut = performance.now();
      raf = requestAnimationFrame(tic);
    };
    const lacher = () => {
      if (signe) return;
      btn.classList.remove("empreinte-active");
      cancelAnimationFrame(raf);
      peindre(0);
      const aide = root.querySelector("#e-aide");
      if (aide) aide.textContent = tr("Reste appuyé une dizaine de secondes pour signer");
    };
    btn.addEventListener("pointerdown", appui);
    ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => btn.addEventListener(ev, lacher));
    btn.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === " ") && !e.repeat) appui(e);
    });
    btn.addEventListener("keyup", lacher);
  }

  let planChoisi = "";
  function showFormules(erreur = "") {
    const plans = cfg.plans;
    if (!planChoisi) planChoisi = (plans.find((p) => p.highlight) || plans[0]).id;
    const plan = plans.find((p) => p.id === planChoisi) || plans[0];
    const avantages = [
      tr("Des idées d'e-books triées selon tes réponses"),
      tr("Le générateur : plan, chapitres, exemples et couverture"),
      tr("L'export PDF prêt à vendre (A4, A5, US Letter)"),
      tr("La fiche Etsy : titre, description, 13 tags et miniature"),
      tr("Ton plan de 30 jours pour publier et te faire connaître"),
    ];
    const faq = [
      [tr("Que se passe-t-il si je résilie ?"), tr("Tu gardes l'accès jusqu'à la fin de la période payée, puis tu n'es plus prélevé. Tes PDF déjà téléchargés restent à toi.")],
      [tr("Je peux vendre les e-books au prix que je veux ?"), tr("Oui, c'est toi qui fixes ton prix sur Etsy.")],
      [tr("Et si je ne fais aucune vente ?"), tr("C'est possible : l'abonnement paie l'outil, pas un résultat. Commence par l'offre Starter, relis bien et publie régulièrement.")],
      [tr("Le quota d'e-books se renouvelle quand ?"), tr("Le 1er de chaque mois. Les e-books non utilisés ne sont pas reportés.")],
    ];
    render(`${barre()}<section class="stage formules" data-reveal><div class="garantie garantie-forte"><span class="garantie-sceau">${ICONE_BOUCLIER}</span><div><p class="garantie-titre">${tr("Sans engagement")}</p><p class="garantie-texte">${tr("Tu résilies quand tu veux depuis ton espace, en deux clics. L'accès s'ouvre tout de suite après le paiement.")}</p></div></div><h1 class="stage-title stage-title-q">${tr("Choisis ton plan.")}</h1><div class="plans">${plans
      .map(
        (p) =>
          `<button class="plan ${p.id === plan.id ? "selected" : ""} ${p.highlight ? "plan-ruban-la" : ""}" data-action="plan" data-v="${p.id}">${p.highlight ? `<span class="plan-ruban">${tr("Recommandé")}</span>` : ""}<span class="plan-radio"></span><span class="plan-gauche"><span class="plan-duree">${esc(p.name)}</span><span class="plan-prix">${tr("{n} e-books par mois · {prix} / mois", { n: p.ebooks, prix: prix(p.price) })}</span></span><span class="plan-jour"><strong>${prix(p.price / p.ebooks)}</strong><em>${tr("par e-book")}</em></span></button>`,
      )
      .join("")}</div><label class="case case-formules"><input type="checkbox" id="waiver"/><span>${tr("Je demande l'accès immédiat au service et je comprends que je perds mon droit de rétractation de 14 jours dès que je crée mon premier e-book (art. L221-28 du Code de la consommation).")}</span></label>${erreur ? `<p class="form-error">${esc(erreur)}</p>` : ""}<button class="btn btn-primary btn-lg btn-payer" data-action="payer">${tr("Payer et accéder à mon atelier")} · ${tr("{prix} / mois", { prix: prix(plan.price) })}</button><p class="plan-securite">${tr("Paiement sécurisé par Stripe. TVA non applicable, art. 293 B du CGI. Renouvellement automatique, résiliation en 1 clic depuis ton compte, effective à la fin de la période payée. Aucun remboursement d'une période entamée. Movacash est un outil : aucun revenu n'est garanti.")}</p>${cfg.demo ? `<p class="plan-demo">${tr("Mode démo : le paiement n'est pas encore branché, l'abonnement s'active sans être débité.")}</p>` : ""}<section class="vente-bloc"><h2 class="vente-titre">${tr("Ce que tu débloques")}</h2><ul class="plan-contenu">${avantages.map((a) => `<li>${a}</li>`).join("")}</ul></section><section class="vente-bloc"><h2 class="vente-titre">${tr("Questions fréquentes")}</h2><div class="faq">${faq
      .map(([q, r]) => `<details><summary>${q}</summary><p>${r}</p></details>`)
      .join("")}</div></section><p class="resultats-mention">${tr("Aucun revenu n'est garanti : tes ventes dépendent de ton sujet, de ta relecture et de ta régularité.")}</p></section>`);
  }

  function envoyerQuiz() {
    if (quizEnvoye) return;
    quizEnvoye = true;
    cfg.api.saveQuiz(scoringAnswers(answers, user?.name)).catch(() => (quizEnvoye = false));
  }

  function show() {
    const s = STEPS[step];
    switch (s.type) {
      case "q":
        return showQuestion(s);
      case "multi":
        return showMulti(s);
      case "themes":
        return showMulti(s, true);
      case "preuve":
        return showPreuve();
      case "explication":
        return showExplication();
      case "url":
        return showUrl(s);
      case "echelle":
        return showEchelle(s);
      case "slider":
        return showSlider(s);
      case "chargement":
        return showChargement();
      case "simulation":
        return showSimulation();
      case "barriere":
        return showBarriere();
      case "message":
        return showMessage(s);
      case "compte":
        return showCompte();
      case "text":
        return showText(s);
      case "objectif":
        return showObjectif();
      case "parcours":
        return showParcours();
      case "serment":
        return showSerment();
      case "formules":
        return showFormules();
    }
  }

  // ---------- Clics ----------

  async function onClick(ev: Event) {
    const t = (ev.target as HTMLElement).closest<HTMLElement>("[data-action]");
    if (!t || !root.contains(t)) return;
    const s = STEPS[step];
    const v = t.dataset.v || "";
    switch (t.dataset.action) {
      case "back":
        return back();
      case "next":
        return next();
      case "answer": {
        answers[s.id] = v;
        delete answers[s.id + "_libre"];
        libreOuvert = false;
        sauver();
        const o = s.options?.find((x) => x.id === v);
        if (s.type === "echelle") {
          show();
          return timers.push(window.setTimeout(next, 280));
        }
        if (s.notesVisibles || s.confirmer) return show();
        if (s.apresChoix || o?.note) {
          noteAffichee = true;
          return show();
        }
        noteAffichee = false;
        show();
        return timers.push(window.setTimeout(next, 260));
      }
      case "toggle": {
        const sel = new Set((answers[s.id] as string[]) || []);
        if (sel.has(v)) sel.delete(v);
        else if (!s.max || sel.size < s.max) {
          if (s.id === "refus" && v === "rien") sel.clear();
          if (s.id === "refus" && v !== "rien") sel.delete("rien");
          sel.add(v);
        }
        answers[s.id] = [...sel];
        sauver();
        return show();
      }
      case "ouvrir-libre":
        libreOuvert = true;
        show();
        return root.querySelector<HTMLInputElement>("#libre-input")?.focus();
      case "fermer-libre":
        libreOuvert = false;
        return show();
      case "retirer-libre": {
        answers[s.id] = ((answers[s.id] as string[]) || []).filter((x) => x !== AUTRE);
        delete answers[s.id + "_libre"];
        sauver();
        return show();
      }
      case "valider-libre": {
        const texte = root.querySelector<HTMLInputElement>("#libre-input")?.value.trim() || "";
        if (!texte) return root.querySelector<HTMLInputElement>("#libre-input")?.focus();
        answers[s.id + "_libre"] = texte;
        libreOuvert = false;
        if (t.dataset.multi) {
          const sel = new Set((answers[s.id] as string[]) || []);
          sel.add(AUTRE);
          answers[s.id] = [...sel];
          sauver();
          return show();
        }
        answers[s.id] = AUTRE;
        sauver();
        return next();
      }
      case "save-url": {
        const val = root.querySelector<HTMLInputElement>("#url-input")?.value.trim() || "";
        if (val) answers[s.id] = val.slice(0, 200);
        return next();
      }
      case "save-text": {
        const val = root.querySelector<HTMLTextAreaElement>("#free-text")?.value.trim() || "";
        if (!val && !s.optional) return;
        if (val) answers[s.id] = val;
        return next();
      }
      case "valider-curseur":
        answers[s.id] = Number(answers[s.id] ?? SLIDER.defaut);
        return next();
      case "levier":
        return popupSuite?.(v);
      case "plan":
        planChoisi = v;
        return showFormules();
      case "payer": {
        const coche = root.querySelector<HTMLInputElement>("#waiver")?.checked;
        if (!coche) return showFormules("Coche la case pour demander l'accès immédiat.");
        t.setAttribute("disabled", "");
        t.textContent = "Ouverture du paiement…";
        const r = await cfg.api.checkout(planChoisi).catch(() => ({ error: "" }) as { url?: string; error?: string });
        if (!r.url) return showFormules(r.error || "Le paiement n'a pas pu démarrer. Réessaie.");
        try {
          localStorage.removeItem(KEY);
        } catch {}
        return cfg.onUrl ? cfg.onUrl(r.url) : window.location.assign(r.url);
      }
    }
  }

  function onKey(ev: KeyboardEvent) {
    if (ev.key !== "Enter") return;
    const el = ev.target as HTMLElement;
    if (el.id === "libre-input") {
      ev.preventDefault();
      root.querySelector<HTMLElement>("[data-action=valider-libre]")?.click();
    } else if (el.id === "url-input") {
      ev.preventDefault();
      root.querySelector<HTMLElement>("[data-action=save-url]")?.click();
    }
  }

  root.addEventListener("click", onClick);
  root.addEventListener("keydown", onKey);
  show();

  return {
    destroy() {
      arreter();
      root.removeEventListener("click", onClick);
      root.removeEventListener("keydown", onKey);
      root.innerHTML = "";
    },
    restart() {
      answers = {};
      tapes = new Set();
      quizEnvoye = false;
      planChoisi = "";
      goTo(0);
    },
    setUser(u: { name?: string } | null) {
      user = u;
    },
  };
}
