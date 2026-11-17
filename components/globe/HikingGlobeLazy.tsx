"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { HikingGlobe as Globe } from "./HikingGlobe";

/**
 * Every page renders through one route, so a client component imported by any
 * page lands in the bundle all pages share. Loading the globe through this
 * wrapper keeps its code (and three.js, which it imports dynamically) off every
 * other page. The placeholder holds the stage height so nothing shifts.
 */
const HikingGlobe = dynamic(() => import("./HikingGlobe").then((module) => module.HikingGlobe), {
  ssr: false,
  loading: () => <div className="globe-explorer"><div className="globe-stage"/></div>,
});

export function HikingGlobeLazy(props: ComponentProps<typeof Globe>) {
  return <HikingGlobe {...props}/>;
}
