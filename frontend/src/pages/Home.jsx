import { useDispatch, useSelector } from "react-redux";
import ArtifactPanel from "../components/ArtifactPanel";
import ChatArea from "../components/ChatArea";
import Sidebar from "../components/Sidebar";
import ImageGenerator from "../components/ImageGenerator";
import DocumentAnalyzer from "../components/DocumentAnalyzer";

function Home() {
  const { userData } = useSelector((state) => state.user);
  const { artifacts } = useSelector((state) => state.message);
  const { currentView } = useSelector((state) => state.conversation);
  const hasArtifacts = artifacts?.length > 0;

  if (!userData) return null;

  return (
    <div className="h-dvh flex bg-app text-app overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 min-h-0">
        {currentView === "imageGenerator" ? (
          <ImageGenerator />
        ) : currentView === "documentAnalyzer" ? (
          <DocumentAnalyzer />
        ) : (
          <ChatArea />
        )}
      </main>
      {hasArtifacts && currentView !== "imageGenerator" && currentView !== "documentAnalyzer" && <ArtifactPanel />}
    </div>
  );
}

export default Home;
