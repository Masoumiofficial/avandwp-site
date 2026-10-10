import { BrandStory } from './components/BrandStory';
import { ChatConsole } from './components/ChatConsole';
import { Comparison } from './components/Comparison';
import { Faq } from './components/Faq';
import { FinalCta } from './components/FinalCta';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Pillars } from './components/Pillars';
import { Pricing } from './components/Pricing';
import { Roadmap } from './components/Roadmap';
import { RoiCalculator } from './components/RoiCalculator';
import { Security } from './components/Security';
import { Setup } from './components/Setup';
import { WorkflowSimulator } from './components/WorkflowSimulator';
import { WorkspaceShowcase } from './components/WorkspaceShowcase';

// Section order follows the 14-section brief.
export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        پرش به محتوای اصلی
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <BrandStory />
        <WorkflowSimulator />
        <ChatConsole />
        <Setup />
        <Pillars />
        <Comparison />
        <WorkspaceShowcase />
        <Security />
        <RoiCalculator />
        <Roadmap />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
