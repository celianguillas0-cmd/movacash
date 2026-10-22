export default function Bars({ n }: { n: number }) {
  return (
    <div className="bars" aria-label={`${n} sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => <i key={i} className={i <= n ? "on" : ""} />)}
    </div>
  );
}
