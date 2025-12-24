import React from 'react';
import { FileText, Download, ExternalLink, Award, Calendar } from 'lucide-react';

const Publications: React.FC = () => {
    const publications = [
        {
            title: 'Template-Fitting Meets Deep Learning: Redshift Estimation Using Physics-Guided Neural Networks',
            authors: 'Jonas Chris Ferrao, Dickson Dias, Pranav Naik, Glory D\'Cruz, Anish Naik, Siya Khandeparkar, Manisha Gokuldas Fal Dessai',
            journal: 'arXiv Preprint',
            date: '2025-07-01',
            doi: 'arXiv:2507.00866',
            type: 'Preprint',
            tags: ['Physics-Guided ML', 'HSC-SSP', 'Redshift Estimation', 'Cross-Attention', 'Bayesian DL']
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Hero Section */}
            <section className="tech-panel p-8 bg-gradient-to-br from-slate-900 to-slate-950">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-blue-600/10 border border-blue-500/30">
                        <FileText className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="mono text-3xl font-bold text-slate-100 tracking-tighter uppercase">Research_Publications</h1>
                        <p className="mono text-xs text-blue-400 font-bold">RECORDS_FOUND: {publications.length} // LAST_UPDATE: 2025-12-24</p>
                    </div>
                </div>
                <p className="mono text-sm text-slate-400 max-w-3xl leading-relaxed">
                    The primary research output of the PREML project, focusing on the integration of
                    physical models with deep learning for astronomical applications.
                </p>
            </section>

            <div className="space-y-6">
                {publications.map((pub, idx) => (
                    <section key={idx} className="tech-panel group hover:border-blue-500/30 transition-all">
                        <div className="tech-header flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Award className="w-3 h-3 text-blue-400" />
                                <span className="tech-label">{pub.type}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3 text-slate-600" />
                                <span className="mono text-[10px] text-slate-500 font-bold uppercase">{pub.date}</span>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                                <div className="space-y-3 flex-1">
                                    <h2 className="mono text-lg font-bold text-slate-100 group-hover:text-blue-400 transition-colors leading-tight">
                                        {pub.title}
                                    </h2>
                                    <p className="mono text-xs text-slate-400 font-bold uppercase tracking-wider">
                                        {pub.authors}
                                    </p>
                                    <p className="mono text-[10px] text-slate-500 italic">
                                        {pub.journal}
                                    </p>
                                    <div className="flex gap-2 pt-2">
                                        {pub.tags.map((tag, i) => (
                                            <span key={i} className="mono text-[8px] px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-500 uppercase font-bold">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                                    <a
                                        href={`https://arxiv.org/pdf/${pub.doi.split(':')[1]}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-tech btn-tech-primary flex-1 md:w-40 justify-center"
                                    >
                                        <Download className="w-3 h-3" />
                                        Download_PDF
                                    </a>
                                    <a
                                        href={`https://arxiv.org/abs/${pub.doi.split(':')[1]}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-tech flex-1 md:w-40 justify-center"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        View_ArXiv
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>
                ))}
            </div>

            {/* Citation Info */}
            <section className="tech-panel bg-blue-600/5 border-blue-500/20">
                <div className="p-6 flex items-center gap-6">
                    <div className="hidden md:block p-4 bg-blue-600/10 border border-blue-500/30">
                        <FileText className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="mono text-sm font-bold text-slate-200 uppercase">Citing_PREML</h3>
                        <p className="mono text-[10px] text-slate-500 leading-relaxed">
                            If you use our models or the PREML dataset in your research, please cite our ArXiv preprint
                            (Ferrao et al. 2025) and acknowledge the HSC-SSP data release.
                        </p>
                        <div className="p-3 bg-black/40 border border-slate-800 mono text-[9px] text-blue-400/80 break-all whitespace-pre-wrap">
                            {`@article{ferrao2025preml,
  title={Template-Fitting Meets Deep Learning: Redshift Estimation Using Physics-Guided Neural Networks},
  author={Ferrao, Jonas Chris and Dias, Dickson and Naik, Pranav and D'Cruz, Glory and Naik, Anish and Khandeparkar, Siya and Fal Dessai, Manisha Gokuldas},
  journal={arXiv preprint arXiv:2507.00866},
  year={2025}
}`}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Publications;
