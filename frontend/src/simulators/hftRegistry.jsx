import OrderBookSim from "./hft/OrderBookSim.jsx";
import LatencyLadderSim from "./hft/LatencyLadderSim.jsx";
import CacheSim from "./hft/CacheSim.jsx";
import RingBufferSim from "./hft/RingBufferSim.jsx";
import MarketMakingSim from "./hft/MarketMakingSim.jsx";
import BranchSim from "./hft/BranchSim.jsx";
import MicropriceSim from "./hft/MicropriceSim.jsx";

// Maps a lesson `visualizer` key to a render function.
const REGISTRY = {
  "order-book": () => <OrderBookSim />,
  "latency-ladder": () => <LatencyLadderSim />,
  cache: () => <CacheSim />,
  "ring-buffer": () => <RingBufferSim />,
  "market-making": () => <MarketMakingSim />,
  "branch-prediction": () => <BranchSim />,
  microprice: () => <MicropriceSim />,
};

export function hasHftSim(key) {
  return Boolean(key && REGISTRY[key]);
}

export function renderHftSim(key) {
  const fn = REGISTRY[key];
  return fn ? fn() : null;
}
