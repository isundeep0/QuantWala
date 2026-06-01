import {
  Search,
  MoveHorizontal,
  Link2,
  Layers,
  GitBranch,
  Share2,
  Grid3x3,
  Coins,
  Undo2,
  Binary,
  Type,
  Sigma,
  Boxes,
} from "lucide-react";

const MAP = {
  Search,
  MoveHorizontal,
  Link2,
  Layers,
  GitBranch,
  Share2,
  Grid3x3,
  Coins,
  Undo2,
  Binary,
  Type,
  Sigma,
};

export default function IconByName({ name, ...props }) {
  const Comp = MAP[name] || Boxes;
  return <Comp {...props} />;
}
