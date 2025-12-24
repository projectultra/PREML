import React from 'react';
import { Database, Layers, Filter, Globe, Download, Box, FileSpreadsheet, Zap, CheckCircle2 } from 'lucide-react';

const Dataset: React.FC = () => {
    const kpis = [
        { label: 'Total_Objects', value: '5,830,934', sub: 'Aggregated Catalog' },
        { label: 'Multimodal_Sample', value: '395,585', sub: 'HSC Images + Photometry' },
        { label: 'SDSS_Coverage', value: '4.6M+', sub: 'Galaxies, Quasars, Stars' },
        { label: 'HSC_PDR3_Rows', value: '816,743', sub: 'Deep Photometry' },
    ];

    const fileStructure = [
        {
            name: 'Photometric Data.zip',
            icon: Box,
            children: [
                { name: 'HSC_PDR3/galaxy_photometry.csv', count: '816,743 Rows', type: 'Galaxy' },
                { name: 'SDSS_DR18/galaxy_photometry.csv', count: '2,790,253 Rows', type: 'Galaxy' },
                { name: 'SDSS_DR18/quasar_photometry.csv', count: '866,338 Rows', type: 'Quasar' },
                { name: 'SDSS_DR18/star_photometry.csv', count: '962,162 Rows', type: 'Star' },
            ]
        },
        {
            name: 'HSC Photometry.zip',
            icon: FileSpreadsheet,
            children: [
                { name: 'HSC Photometry.csv', count: '395,585 Rows', type: 'Multimodal_Base' },
            ]
        },
        {
            name: 'HSC Images.zip',
            icon: Layers,
            children: [
                { name: '395,585 .npy files', count: 'Object_ID named', type: 'Image_Data' },
            ]
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Hero Section */}
            <section className="tech-panel p-8 bg-gradient-to-br from-slate-900 to-slate-950">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-blue-600/10 border border-blue-500/30">
                        <Database className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="mono text-3xl font-bold text-slate-100 tracking-tighter uppercase">PREML_Data_Inventory</h1>
                        <p className="mono text-xs text-blue-400 font-bold">ZENODO_DOI: 10.5281/zenodo.15426393 // MULTIMODAL_RESEARCH_SET</p>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <p className="mono text-sm text-slate-400 max-w-3xl leading-relaxed flex-1">
                        The PREML project utilizes a massive multi-survey dataset combining **HSC-SSP PDR3** and **SDSS DR18**.
                        While the photometric catalog spans over 5.8 million objects, the core **Multimodal Research Set**
                        integrates high-resolution image cutouts with photometric data for 395,585 galaxies,
                        enabling physics-guided deep learning.
                    </p>
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                        <a
                            href="https://zenodo.org/record/15426393"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-tech btn-tech-primary justify-center"
                        >
                            <Download className="w-3 h-3" />
                            Access_on_Zenodo
                        </a>
                    </div>
                </div>
            </section>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi, idx) => (
                    <div key={idx} className="tech-panel p-4 bg-slate-900/40 border-slate-800/50">
                        <span className="tech-label text-[9px]">{kpi.label}</span>
                        <div className="mono text-2xl font-bold text-blue-400 mt-1">{kpi.value}</div>
                        <p className="mono text-[8px] text-slate-600 uppercase font-bold mt-1">{kpi.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* File Structure Explorer */}
                <div className="lg:col-span-12 space-y-6">
                    <section className="tech-panel">
                        <div className="tech-header">
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-blue-400" />
                                <span className="tech-label">Repository_Structure_&_Inventory</span>
                            </div>
                        </div>
                        <div className="p-6 overflow-x-auto">
                            <table className="w-full mono text-[10px]">
                                <thead>
                                    <tr className="border-b border-slate-800 text-slate-500 text-left uppercase font-bold">
                                        <th className="pb-3 px-4">Archive_Name / File_Path</th>
                                        <th className="pb-3 px-4">Description</th>
                                        <th className="pb-3 px-4 text-right">Object_Count</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-300">
                                    {[
                                        { name: 'HSC_PDR3/galaxy_photometry.csv', desc: 'HSC Deep Photometry (galaxies)', count: '816,743 Rows' },
                                        { name: 'SDSS_DR18/galaxy_photometry.csv', desc: 'SDSS Galaxy Catalog', count: '2,790,253 Rows' },
                                        { name: 'SDSS_DR18/quasar_photometry.csv', desc: 'SDSS Quasar Catalog', count: '866,338 Rows' },
                                        { name: 'SDSS_DR18/star_photometry.csv', desc: 'SDSS Star Catalog', count: '962,162 Rows' },
                                        { name: 'HSC Photometry.csv', desc: 'Multimodal Base (Photometry)', count: '395,585 Rows' },
                                        { name: 'HSC Images.zip', desc: 'Multimodal Base (5-band .npy)', count: '395,585 Files' },
                                    ].map((row, idx) => (
                                        <tr key={idx} className="border-b border-slate-900/50 hover:bg-slate-900/30 transition-colors">
                                            <td className="py-3 px-4 text-blue-400 font-bold">{row.name}</td>
                                            <td className="py-3 px-4">{row.desc}</td>
                                            <td className="py-3 px-4 text-slate-500 uppercase font-bold text-right">{row.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Data Quality & KPIs */}
                <section className="tech-panel">
                    <div className="tech-header">
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-blue-400" />
                            <span className="tech-label">Data_Quality_KPIs</span>
                        </div>
                    </div>
                    <div className="p-6 space-y-6">
                        {[
                            { label: 'Photometric_Accuracy', value: '99.8%', desc: 'After quality cuts (flags == 0)', icon: CheckCircle2 },
                            { label: 'Spectroscopic_Reliability', value: 'z_conf > 0.9', desc: 'SDSS/HSC high-confidence set', icon: CheckCircle2 },
                            { label: 'Image_Consistency', value: '64x64px', desc: 'Normalized .npy spectral frames', icon: CheckCircle2 },
                            { label: 'Class_Balance', value: 'Optimized', sub: 'Galaxy / Quasar / Star ratio', icon: CheckCircle2 },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-start gap-4 p-3 bg-slate-900/50 border border-slate-800">
                                <item.icon className="w-4 h-4 text-blue-500 mt-1" />
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="mono text-[10px] font-bold text-slate-200 uppercase">{item.label}</span>
                                        <span className="mono text-[10px] text-blue-400 font-bold">{item.value}</span>
                                    </div>
                                    <p className="mono text-[9px] text-slate-500">{item.desc || item.sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Spectral Coverage */}
                <section className="tech-panel">
                    <div className="tech-header">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-blue-400" />
                            <span className="tech-label">Spectral_Bands_&_Coverage</span>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <span className="tech-label text-[9px]">HSC_Bands</span>
                                <div className="flex flex-wrap gap-2">
                                    {['G', 'R', 'I', 'Z', 'Y'].map(b => (
                                        <span key={b} className="mono text-[8px] px-2 py-1 bg-blue-900/20 border border-blue-500/30 text-blue-400 font-bold">{b}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <span className="tech-label text-[9px]">SDSS_Bands</span>
                                <div className="flex flex-wrap gap-2">
                                    {['U', 'G', 'R', 'I', 'Z'].map(b => (
                                        <span key={b} className="mono text-[8px] px-2 py-1 bg-slate-800 border border-slate-700 text-slate-500 font-bold">{b}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-800">
                            <p className="mono text-[10px] text-slate-500 leading-relaxed">
                                The multimodal subset exclusively utilizes HSC data (grizy), while the photometric
                                catalog leverages the full spectral range from both surveys (ugriz + grizy).
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dataset;
