import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout.jsx";
import ScrollToTop from "./components/layout/ScrollToTop.jsx";
import Landing from "./pages/Landing.jsx";
import AlgorithmsHub from "./pages/algorithms/AlgorithmsHub.jsx";
import AlgorithmDetail from "./pages/algorithms/AlgorithmDetail.jsx";
import SystemDesign from "./pages/system-design/SystemDesign.jsx";
import SystemDesignLesson from "./pages/system-design/SystemDesignLesson.jsx";
import HFT from "./pages/hft/HFT.jsx";
import HFTTopic from "./pages/hft/HFTTopic.jsx";
import KernelBypass from "./pages/kernel-bypass/KernelBypass.jsx";
import KernelBypassPhase from "./pages/kernel-bypass/KernelBypassPhase.jsx";
import CPHub from "./pages/cp/CPHub.jsx";
import CPThemeDetail from "./pages/cp/CPThemeDetail.jsx";
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
          <Route path="/system-design/:topicId" element={<SystemDesignLesson />} />
          <Route path="/hft" element={<HFT />} />
          <Route path="/hft/:topicId" element={<HFTTopic />} />
          <Route path="/kernel-bypass" element={<KernelBypass />} />
          <Route path="/kernel-bypass/:phaseId" element={<KernelBypassPhase />} />
          <Route path="/cp" element={<CPHub />} />
          <Route path="/cp/:phaseId/:themeId" element={<CPThemeDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </>
  );
}
