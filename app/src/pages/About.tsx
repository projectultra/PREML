import React from 'react';
import { Info, Users, Mail, Github, MapPin, GraduationCap, Cpu, Globe } from 'lucide-react';

const About: React.FC = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Hero Section */}
            <section className="tech-panel p-8 bg-gradient-to-br from-slate-900 to-slate-950">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-blue-600/10 border border-blue-500/30">
                        <Info className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">About the PREML Project</h1>
                        <p className="mono text-xs text-slate-500 font-medium">Final Year Research Initiative // Status: Active</p>
                    </div>
                </div>
                <p className="mono text-base text-slate-400 max-w-3xl leading-relaxed">
                    The PREML (Photometric Redshift Estimation with Machine Learning) project is a final year research
                    project focused on pioneering <span className="font-bold text-slate-200">Physics-Guided Deep Learning</span> for observational cosmology.
                    By bridging the gap between traditional template-fitting methods and modern neural architectures,
                    we provide robust, interpretable, and scalable tools for next-generation astronomical surveys.
                </p>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Core Mission */}
                <div className="lg:col-span-7 space-y-6">
                    <section className="tech-panel">
                        <div className="tech-header">
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-blue-400" />
                                <span className="tech-label">Research_Objectives</span>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { title: 'Hybrid_Inference', desc: 'Integrating SED template fitting with deep neural networks to leverage physical priors.' },
                                { title: 'Multimodal_Fusion', desc: 'Combining photometric magnitudes and image cutouts via cross-attention mechanisms.' },
                                { title: 'Uncertainty_Quantification', desc: 'Implementing Bayesian layers to provide reliable aleatoric uncertainty estimates.' },
                                { title: 'Open_Science', desc: 'Releasing high-quality datasets (PREML Dataset) and open-source models for the community.' },
                            ].map((item, idx) => (
                                <div key={idx} className="space-y-2 p-4 bg-slate-900/50 border border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-3 bg-blue-500" />
                                        <span className="mono text-xs font-bold text-slate-200 uppercase">{item.title}</span>
                                    </div>
                                    <p className="mono text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="tech-panel">
                        <div className="tech-header">
                            <div className="flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-blue-400" />
                                <span className="tech-label">Core_Technology</span>
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="mono text-xs text-slate-400 leading-relaxed mb-4">
                                Our primary contribution is the <span className="font-bold text-slate-200">Physics-Guided Neural Network (PGNN)</span>, which embeds Spectral
                                Energy Distribution (SED) templates directly into the training loop. This ensures that the
                                model's predictions remain consistent with established astrophysical laws while benefiting
                                from the pattern recognition capabilities of deep learning.
                            </p>
                            <div className="flex gap-4">
                                <div className="flex-1 p-3 bg-slate-950 border border-slate-800 text-center">
                                    <span className="mono text-[9px] text-blue-400 font-bold uppercase">Template_Fitting</span>
                                </div>
                                <div className="flex items-center mono text-slate-600">+</div>
                                <div className="flex-1 p-3 bg-slate-950 border border-slate-800 text-center">
                                    <span className="mono text-[9px] text-blue-400 font-bold uppercase">Deep_Learning</span>
                                </div>
                                <div className="flex items-center mono text-slate-600">=</div>
                                <div className="flex-1 p-3 bg-blue-900/20 border border-blue-500/30 text-center">
                                    <span className="mono text-[9px] text-blue-400 font-bold uppercase">PREML_PGNN</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Affiliations & Contact */}
                <div className="lg:col-span-5 space-y-6">
                    <section className="tech-panel">
                        <div className="tech-header">
                            <span className="tech-label">Academic_Affiliations</span>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <GraduationCap className="w-5 h-5 text-blue-400 mt-1" />
                                    <div>
                                        <h4 className="mono text-xs font-bold text-slate-200 uppercase">Don Bosco College of Engineering</h4>
                                        <p className="mono text-[10px] text-slate-500 uppercase">Department of Computer Engineering</p>
                                        <p className="mono text-[10px] text-slate-500 uppercase mt-1">Fatorda, Goa, India</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-800 space-y-4">
                                <a href="mailto:jonasferrao21@gmail.com" className="flex items-center gap-4 p-3 bg-slate-900/50 border border-slate-800 hover:border-blue-500/30 transition-colors group">
                                    <Mail className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                                    <div className="mono text-xs text-slate-300 group-hover:text-blue-400">jonasferrao21@gmail.com</div>
                                </a>
                                <a href="https://github.com/projectultra/PREML" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-3 bg-slate-900/50 border border-slate-800 hover:border-blue-500/30 transition-colors group">
                                    <Github className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                                    <div className="mono text-xs text-slate-300 group-hover:text-blue-400">github.com/projectultra/PREML</div>
                                </a>
                                <div className="flex items-center gap-4 p-3 bg-slate-900/50 border border-slate-800">
                                    <MapPin className="w-4 h-4 text-blue-400" />
                                    <div className="mono text-xs text-slate-300">Goa, India</div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Team Section */}
            <section className="tech-panel">
                <div className="tech-header">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="tech-label">Research_Team</span>
                    </div>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { name: 'Jonas Chris Ferrao', role: 'Lead Researcher', focus: 'Deep Learning' },
                            { name: 'Dickson Dias', role: 'Researcher', focus: 'Data Science' },
                            { name: 'Pranav Naik', role: 'Researcher', focus: 'Astrophysics' },
                            { name: 'Glory D\'Cruz', role: 'Researcher' },
                            { name: 'Anish Naik', role: 'Researcher' },
                            { name: 'Siya Khandeparkar', role: 'Project Guide' },
                            { name: 'Manisha G. Fal Dessai', role: 'Project Guide' },
                        ].map((member, idx) => (
                            <div key={idx} className="p-4 bg-slate-900/50 border border-slate-800 group hover:border-blue-500/30 transition-all">
                                <div className="w-10 h-10 bg-slate-800 border border-slate-700 mb-3 flex items-center justify-center mono text-[10px] text-slate-600">
                                    IMG
                                </div>
                                <h3 className="mono text-sm font-bold text-slate-200 uppercase">{member.name}</h3>
                                <p className="mono text-xs text-blue-400 font-bold uppercase mb-2">{member.role}</p>
                                <div className="h-px w-8 bg-slate-800 mb-2" />
                                {member.focus && (
                                    <p className="mono text-[10px] text-slate-500 uppercase font-bold">Focus: {member.focus}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
