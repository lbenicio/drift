"use client";

import dynamic from "next/dynamic";

const CmdK = dynamic(() => import("./index"), { ssr: false });

export default function CmdKWrapper() {
  return <CmdK />;
}
