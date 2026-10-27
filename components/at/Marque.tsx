// Logo de l'espace connecté : la vraie adresse du site, en grand (lisible à l'écran pour les vidéos).
export default function Marque() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon-192.png" alt="" width={34} height={34} className="mc-marque-ic" />
      <span className="mc-marque-mot">Movacash<span>.app</span></span>
    </>
  );
}
