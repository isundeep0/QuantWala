import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout.jsx";
import ScrollToTop from "./components/layout/ScrollToTop.jsx";
import Landing from "./pages/Landing.jsx";
import AlgorithmsHub from "./pages/algorithms/AlgorithmsHub.jsx";
import AlgorithmDetail from "./pages/algorithms/AlgorithmDetail.jsx";
import SystemDesign from "./pages/system-design/SystemDesign.jsx";
import SystemDesignTopic from "./pages/system-design/SystemDesignTopic.jsx";
import HFT from "./pages/hft/HFT.jsx";
import HFTTopic from "./pages/hft/HFTTopic.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/algorithms" element={<AlgorithmsHub />} />
          <Route path="/algorithms/:slug" element={<AlgorithmDetail />} />
          <Route path="/system-design" element={<SystemDesign />} />
          <Route path="/system-design/:topicId" element={<SystemDesignTopic />} />
          <Route path="/hft" element={<HFT />} />
          <Route path="/hft/:topicId" element={<HFTTopic />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </>
  );
}
