export function ScoreRing({score,size="large"}:{score:number;size?:"large"|"small"}) {
  const color = score >= 85 ? "#416f52" : score >= 65 ? "#c38b3d" : "#c65f42";
  return <div className={`score-ring ${size}`} style={{background:`conic-gradient(${color} ${score*3.6}deg, rgba(255,255,255,.22) 0deg)`}} aria-label={`Hiking score ${score} out of 100`}><span><strong>{score}</strong><small>/100</small></span></div>;
}
