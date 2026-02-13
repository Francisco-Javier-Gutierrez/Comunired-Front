import ComuniRed from "../../ComuniRed";
import Footer from "../Footer";
import NavBar from "../NavBar";

export default function MobileLayout({ pathsState }: any) {
  return (
    <>
      {pathsState.showNavBar && <NavBar />}
      <ComuniRed />
      {pathsState.showFooter && <Footer />}
    </>
  );
}
