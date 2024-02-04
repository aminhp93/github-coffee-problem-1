'use client';

import { PLOT_DATA } from "./constants";
import Plot from "@/@core/plot";

export default function Home() {
  return (
    <div>
      Plot
      <Plot 
      // data={PLOT_DATA} 
      />
    </div>
  );
}
