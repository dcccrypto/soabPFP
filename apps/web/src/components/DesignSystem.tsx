import { SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export function DesignSystem() {
  return (
    <div className="max-w-7xl mx-auto p-8 space-y-12">
      {/* Typography */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Typography</h2>
        <div className="space-y-4">
          <h1 className="heading-gradient text-5xl">Heading Gradient</h1>
          <h2 className="text-4xl font-bold text-glow">Glowing Heading</h2>
          <p className="text-gradient text-2xl">Gradient Text</p>
          <p className="text-text-secondary">Secondary Text</p>
          <p className="font-mono text-sm">Monospace Text</p>
        </div>
      </section>

      {/* Colors */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-brand-primary rounded-lg">Brand Primary</div>
          <div className="p-4 bg-brand-secondary rounded-lg">Brand Secondary</div>
          <div className="p-4 bg-background-secondary rounded-lg">Background</div>
          <div className="p-4 bg-state-success text-white rounded-lg">Success</div>
        </div>
      </section>

      {/* Buttons */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <button className="btn-primary">
            Primary Button
          </button>
          <button className="btn-primary" disabled>
            Disabled
          </button>
          <button className="btn-secondary">
            Secondary Button
          </button>
          <button className="btn-primary flex items-center gap-2">
            <SparklesIcon className="w-5 h-5" />
            With Icon
          </button>
          <button className="btn-primary flex items-center gap-2">
            <ArrowPathIcon className="w-5 h-5 animate-spin" />
            Loading
          </button>
        </div>
      </section>

      {/* Cards */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card hover-glow">
            <h3 className="text-xl font-semibold mb-2">Basic Card</h3>
            <p className="text-text-secondary">With hover glow effect</p>
          </div>
          <div className="glass-panel p-6">
            <h3 className="text-xl font-semibold mb-2">Glass Panel</h3>
            <p className="text-text-secondary">With blur backdrop</p>
          </div>
          <div className="card bg-gradient-dark">
            <h3 className="text-xl font-semibold mb-2">Gradient Card</h3>
            <p className="text-text-secondary">With dark gradient</p>
          </div>
        </div>
      </section>

      {/* Forms */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Form Elements</h2>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-2">Input Field</label>
            <input
              type="text"
              className="input-primary"
              placeholder="Enter text..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Select Menu</label>
            <select className="input-primary">
              <option>Option 1</option>
              <option>Option 2</option>
              <option>Option 3</option>
            </select>
          </div>
        </div>
      </section>

      {/* Loading States */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Loading States</h2>
        <div className="flex gap-8">
          <div className="loading-spinner" />
          <div className="loading-pulse w-32 h-8" />
          <div className="animate-bounce">
            <SparklesIcon className="w-6 h-6 text-brand-primary" />
          </div>
        </div>
      </section>

      {/* Parallax Elements */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Parallax Effects</h2>
        <div className="parallax h-64 relative overflow-hidden rounded-xl">
          <div className="parallax-deep absolute inset-0 bg-gradient-dark opacity-50" />
          <div className="parallax-layer absolute inset-0 flex items-center justify-center">
            <h3 className="text-4xl font-bold text-glow-lg">Parallax Layer</h3>
          </div>
          <div className="parallax-shallow absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-glow opacity-20" />
          </div>
        </div>
      </section>

      {/* Animations */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Animations</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="card animate-fade-in">Fade In</div>
          <div className="card animate-slide-up">Slide Up</div>
          <div className="card animate-glow-pulse">Glow Pulse</div>
          <div className="card float-animation">Float</div>
        </div>
      </section>
    </div>
  );
} 