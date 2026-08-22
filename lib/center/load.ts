// The one file that knows where the center lives.

import centerJson from "@/app/data/cs2/players.json";
import type { Center } from "./types";

export const center = centerJson as unknown as Center;
