/* The difficulty of the games SQL-Bausteine, Code beurteilen and Memory. The player chooses it in the
   Game tab; each task or deck belongs to one of the three levels. */
export type Difficulty = 1 | 2 | 3;

export const DIFFICULTIES = [
  { level: 1, name: "Kennen" },
  { level: 2, name: "Intermediate" },
  { level: 3, name: "Expert" },
] as const satisfies readonly { level: Difficulty; name: string }[];
