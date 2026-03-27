import { NextResponse } from "next/server";

import { getFractionsIntroTurn } from "@/lib/fractions-lesson";
import { TutorSession } from "@/lib/tutor-types";

export async function POST() {
  const turn = getFractionsIntroTurn();

  const session: TutorSession = {
    id: crypto.randomUUID(),
    topic: "fractions",
    stepId: turn.stepId,
    status: turn.status,
    lastTurn: turn,
  };

  return NextResponse.json({ session, turn });
}
