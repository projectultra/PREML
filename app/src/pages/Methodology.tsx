import React from 'react';
import { BookOpen, Cpu, Zap, BarChart3, Binary, Layers, BrainCircuit, Share2, Target } from 'lucide-react';

const Methodology: React.FC = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Hero Section */}
            <section className="tech-panel p-8 bg-gradient-to-br from-slate-900 to-slate-950">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-blue-600/10 border border-blue-500/30">
                        <BookOpen className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Physics-Guided Methodology</h1>
                        <p className="mono text-xs text-slate-500 font-medium">Technical Framework // Hybrid Inference Approach</p>
                    </div>
                </div>
                <p className="mono text-base text-slate-400 max-w-3xl leading-relaxed">
                    Our framework integrates <span className="font-bold text-slate-200">Spectral Energy Distribution (SED) template fitting</span> with <span className="font-bold text-slate-200">Deep Learning</span> using a multimodal physics-guided neural network. By embedding physical priors directly into the
                    architecture, the model achieves superior accuracy and interpretability compared to purely data-driven approaches.
                </p>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Architecture Breakdown */}
                <div className="lg:col-span-8 space-y-6">
                    <section className="tech-panel">
                        <div className="tech-header">
                            <div className="flex items-center gap-2">
                                <BrainCircuit className="w-4 h-4 text-blue-400" />
                                <span className="tech-label">Multimodal PGNN Architecture</span>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <div className="p-4 bg-slate-900/50 border border-slate-800 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Binary className="w-3 h-3 text-blue-400" />
                                        <span className="mono text-xs font-bold text-slate-200">Magnitude Block</span>
                                    </div>
                                    <p className="mono text-xs text-slate-500 leading-relaxed">
                                        Processes 5-band cModel magnitudes via FC layers with PReLU activation and Dropout regularization.
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-900/50 border border-slate-800 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Layers className="w-3 h-3 text-blue-400" />
                                        <span className="mono text-xs font-bold text-slate-200">Image Block</span>
                                    </div>
                                    <p className="mono text-xs text-slate-500 leading-relaxed">
                                        Extracts spatial features from 5-band 64x64 image cutouts using 2D Conv layers and Max Pooling.
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-900/50 border border-slate-800 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Share2 className="w-3 h-3 text-blue-400" />
                                        <span className="mono text-xs font-bold text-slate-200">Attention Bridge</span>
                                    </div>
                                    <p className="mono text-xs text-slate-500 leading-relaxed">
                                        8-head Cross-Attention mechanism. Magnitudes (Q) selectively attend to Image features (K, V).
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-2">
                                    <Target className="w-3 h-3 text-blue-400" />
                                    <span className="tech-label text-[9px]">Physics Integration Pipeline</span>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { step: 'SED Template Embedding', desc: 'Predicts probabilities for various SED template classes to construct a weighted rest-frame model.' },
                                        { step: 'Synthetic Flux Generation', desc: 'Redshifts model SEDs and integrates across transmission curves to yield synthetic fluxes.' },
                                        { step: 'Bayesian Uncertainty', desc: 'Integrated Bayesian layers quantify aleatoric uncertainty for every redshift prediction.' },
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex gap-4 group">
                                            <div className="mono text-xs text-blue-400 font-bold w-48 shrink-0">{item.step}</div>
                                            <div className="flex-1 mono text-xs text-slate-500 leading-relaxed group-hover:text-slate-300 transition-colors">
                                                {item.desc}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Performance Metrics */}
                <div className="lg:col-span-4 space-y-6">
                    <section className="tech-panel">
                        <div className="tech-header">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-blue-400" />
                                <span className="tech-label">Validation Metrics</span>
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { label: 'RMS Error', value: '0.0507', sub: 'Root Mean Square Error' },
                                    { label: 'Bias', value: '0.0028', sub: 'Systematic Offset' },
                                    { label: 'Outlier Rate', value: '0.13%', sub: '3-sigma Catastrophic' },
                                ].map((metric, idx) => (
                                    <div key={idx} className="p-4 bg-slate-900/50 border border-slate-800">
                                        <span className="tech-label text-[9px]">{metric.label}</span>
                                        <div className="mono text-2xl font-bold text-blue-400">{metric.value}</div>
                                        <p className="mono text-[8px] text-slate-600 uppercase font-bold">{metric.sub}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 border border-blue-500/20 bg-blue-500/5">
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap className="w-3 h-3 text-blue-400" />
                                    <span className="tech-label text-[9px]">LSST Compliance</span>
                                </div>
                                <p className="mono text-xs text-slate-400 leading-relaxed">
                                    The model satisfies <span className="font-bold text-slate-200">2 of the 3</span> LSST photometric redshift requirements for redshifts below 3,
                                    demonstrating its readiness for next-generation surveys.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Inference Flow */}
            <section className="tech-panel">
                <div className="tech-header">
                    <span className="tech-label">Inference Logic Flow</span>
                </div>
                <div className="p-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        {['Photometry + Images', 'Multimodal Fusion', 'SED Class Prediction', 'Weighted SED Scaling', 'Final Redshift + σ'].map((step, i) => (
                            <React.Fragment key={i}>
                                <div className="flex-1 p-3 bg-slate-900 border border-slate-800 text-center">
                                    <span className="mono text-sm text-slate-300 font-bold uppercase">{step}</span>
                                </div>
                                {i < 4 && <div className="hidden md:block w-4 h-px bg-slate-800" />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Methodology;
