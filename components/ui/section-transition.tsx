type SectionTransitionProps = {
  from: string;
  to: string;
  height?: number;
};

export default function SectionTransition({ 
  from, 
  to, 
  height = 140 
}: SectionTransitionProps) {
  return (
    <div
      className="section-transition"
      style={{
        background: `linear-gradient(to bottom, ${from}, ${to})`,
        height: `${height}px`
      }}
    />
  );
}
