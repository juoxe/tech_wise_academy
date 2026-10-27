import {
  siApachemaven,
  siDocker,
  siGradle,
  siPodman,
  siTrivy,
  siVite,
  type SimpleIcon,
} from "simple-icons";

/* Logos from Simple Icons (ADR-0005), keyed by the slug stored in `tool.icon`.
   A slug without an entry here shows the icon of the category. */
export const LOGOS: Readonly<Record<string, SimpleIcon>> = {
  docker: siDocker,
  podman: siPodman,
  gradle: siGradle,
  apachemaven: siApachemaven,
  vite: siVite,
  trivy: siTrivy,
};
