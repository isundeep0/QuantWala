import {
  Cpu,
  Network,
  Zap,
  Boxes,
  Shield,
  FlaskConical,
  Layers,
  HardDrive,
  Gauge,
  Rocket,
} from "lucide-react";

// Maps the `icon` string in the curriculum data to a lucide component.
const MAP = {
  Cpu,
  Network,
  Zap,
  Boxes,
  Shield,
  FlaskConical,
  Layers,
  HardDrive,
  Gauge,
  Rocket,
};

export function kbIcon(name) {
  return MAP[name] || Cpu;
}
