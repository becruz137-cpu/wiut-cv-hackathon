import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import LiveDemo from './components/LiveDemo';
import Approach from './components/Approach';
import EDA from './components/EDA';
import Results from './components/Results';
import Report from './components/Report';
import Team from './components/Team';
import Footer from './components/Footer';

export default function App() {
  const [activeSection, setActiveSection] = useState('demo');

  const scrollToDemo = () => {
    setActiveSection('demo');
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />
      
      <main className="flex-1">
        <Hero onExploreDemo={scrollToDemo} />
        <LiveDemo />
        <Results />
        <EDA />
        <Approach />
        <Team />
        <Report />
      </main>

      <Footer />
    </div>
  );
}
