import LogoM from "@/components/LogoM";

// Logo de l'espace connecté : le M blanc et la vraie adresse du site, en grand (lisible à l'écran pour les vidéos).
export default function Marque() {
  return (
    <>
      <LogoM className="mc-marque-ic" />
      <span className="mc-marque-mot">Movacash<span>.app</span></span>
    </>
  );
}
