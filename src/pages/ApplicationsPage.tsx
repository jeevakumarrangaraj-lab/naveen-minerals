import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Wrench, Cpu, Layers, Sliders, ArrowDown } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useLanguage } from '../context/LanguageContext';
import { SEOHead } from '../components/SEOHead';

interface HighlightItem {
  key: string;
  label: string;
}

interface MachineryItem {
  id: string;
  nameKey: string;
  name: string;
  categoryKey: string;
  category: string;
  purposeKey: string;
  purpose: string;
  howItWorksKey: string;
  howItWorks: string;
  relevantMaterialsKey: string;
  relevantMaterials: string;
  highlights: HighlightItem[];
  icon: React.ReactNode;
}

interface ProcessFlowStep {
  step: string;
  titleKey: string;
  title: string;
  descKey: string;
  desc: string;
}

interface ReferenceTableRow {
  productKey: string;
  product: string;
  machineryKey: string;
  machinery: string;
}

const MACHINERY_CATEGORIES: MachineryItem[] = [
  {
    id: 'jaw-crusher',
    nameKey: 'apps.machine.jaw.name',
    name: 'Jaw Crusher',
    categoryKey: 'apps.machine.jaw.category',
    category: 'Primary Crushing Equipment',
    purposeKey: 'apps.machine.jaw.purpose',
    purpose: 'Primary crushing of large rocks and mineral-bearing material into smaller, manageable pieces.',
    howItWorksKey: 'apps.machine.jaw.howItWorks',
    howItWorks: 'Two heavy-duty crushing plates compress large pieces of rock. A fixed plate and a moving swing jaw compress the feed material against each other, breaking large rocks into smaller fragments through high compressive force.',
    relevantMaterialsKey: 'apps.machine.jaw.relevantMaterials',
    relevantMaterials: 'Limestone, dolomite, feldspar-bearing rock, and quartz-bearing rock, depending on the feed material hardness and primary plant requirements.',
    highlights: [
      { key: 'apps.machine.jaw.h1', label: 'Primary rock crushing' },
      { key: 'apps.machine.jaw.h2', label: 'High reduction ratio for raw feed' },
      { key: 'apps.machine.jaw.h3', label: 'Heavy-duty robust construction' },
      { key: 'apps.machine.jaw.h4', label: 'Typical first stage in a mineral-processing plant' }
    ],
    icon: <Wrench className="w-6 h-6 text-[#D97706]" />
  },
  {
    id: 'impact-cone-crusher',
    nameKey: 'apps.machine.cone.name',
    name: 'Impact Crusher & Cone Crusher',
    categoryKey: 'apps.machine.cone.category',
    category: 'Secondary & Tertiary Crushing Equipment',
    purposeKey: 'apps.machine.cone.purpose',
    purpose: 'Secondary and tertiary crushing to reduce previously crushed rock into smaller aggregate sizes or fine feed for grinding.',
    howItWorksKey: 'apps.machine.cone.howItWorks',
    howItWorks: 'An impact crusher shatters material using high-speed impact forces inside a chamber, while a cone crusher compresses material continuously between an eccentric rotating cone and a concave bowl liner. Note that impact and cone crushers operate on different mechanical principles (impact velocity vs. continuous compression).',
    relevantMaterialsKey: 'apps.machine.cone.relevantMaterials',
    relevantMaterials: 'Limestone, dolomite, feldspar-bearing rock, and quartz-bearing rock, selected according to material abrasiveness, hardness, and required output shape.',
    highlights: [
      { key: 'apps.machine.cone.h1', label: 'Secondary particle size reduction' },
      { key: 'apps.machine.cone.h2', label: 'Crushed stone aggregate preparation' },
      { key: 'apps.machine.cone.h3', label: 'Cubical product shape generation' },
      { key: 'apps.machine.cone.h4', label: 'Equipment selection based on rock hardness and abrasiveness' }
    ],
    icon: <Cpu className="w-6 h-6 text-[#D97706]" />
  },
  {
    id: 'grinding-mill',
    nameKey: 'apps.machine.mill.name',
    name: 'Ball Mill & Grinding Mill',
    categoryKey: 'apps.machine.mill.category',
    category: 'Fine Grinding & Pulverizing Equipment',
    purposeKey: 'apps.machine.mill.purpose',
    purpose: 'Grinding crushed mineral material into fine powders and micro-pulverized mineral fillers.',
    howItWorksKey: 'apps.machine.mill.howItWorks',
    howItWorks: 'A ball mill uses rotating steel balls or ceramic media inside a rotating cylindrical shell to crush and grind material through impact and attrition. Other grinding mills utilize roller or vertical mill mechanisms depending on target fineness and energy efficiency.',
    relevantMaterialsKey: 'apps.machine.mill.relevantMaterials',
    relevantMaterials: 'Limestone, calcite, dolomite, feldspar, and quartz. Note: Quartz is abrasive and requires specialized wear-resistant mill liners, grinding media, and controlled operating parameters.',
    highlights: [
      { key: 'apps.machine.mill.h1', label: 'Fine powder production' },
      { key: 'apps.machine.mill.h2', label: 'Precise particle size control' },
      { key: 'apps.machine.mill.h3', label: 'Heavy-duty grinding media and drum rotation' },
      { key: 'apps.machine.mill.h4', label: 'Wear-resistant engineering for abrasive quartz & feldspar' }
    ],
    icon: <Layers className="w-6 h-6 text-[#D97706]" />
  },
  {
    id: 'screen-classifier',
    nameKey: 'apps.machine.screen.name',
    name: 'Vibrating Screen & Powder Classifier',
    categoryKey: 'apps.machine.screen.category',
    category: 'Sizing, Screening & Classification Equipment',
    purposeKey: 'apps.machine.screen.purpose',
    purpose: 'Separating processed material into precise particle-size ranges and grading finished mineral aggregates.',
    howItWorksKey: 'apps.machine.screen.howItWorks',
    howItWorks: 'Vibrating screens utilize multi-deck mesh screens shaken by eccentric shafts to mechanically sort granular aggregates by particle size. Powder classifiers (such as air classifiers) separate ultra-fine suspended powder particles by balancing centrifugal force and airflow drag.',
    relevantMaterialsKey: 'apps.machine.screen.relevantMaterials',
    relevantMaterials: 'Stone grit, crushed mineral aggregates, limestone powder, calcite powder, dolomite powder, feldspar powder, and other compatible granular or powdered outputs.',
    highlights: [
      { key: 'apps.machine.screen.h1', label: 'Particle size separation and grading' },
      { key: 'apps.machine.screen.h2', label: 'Vibrating decks for coarse stone grit' },
      { key: 'apps.machine.screen.h3', label: 'Air classification for fine mineral powders' },
      { key: 'apps.machine.screen.h4', label: 'Screening efficiency and rigorous process control' }
    ],
    icon: <Sliders className="w-6 h-6 text-[#D97706]" />
  }
];

const PROCESS_FLOW_STEPS: ProcessFlowStep[] = [
  { step: '01', titleKey: 'apps.flow.1.title', title: 'Raw Mineral Feed', descKey: 'apps.flow.1.desc', desc: 'Extraction and delivery of quarried raw rock and mineral aggregates.' },
  { step: '02', titleKey: 'apps.flow.2.title', title: 'Primary Crushing', descKey: 'apps.flow.2.desc', desc: 'Jaw crushers break down large raw boulders into manageable fractions.' },
  { step: '03', titleKey: 'apps.flow.3.title', title: 'Secondary Crushing', descKey: 'apps.flow.3.desc', desc: 'Impact or cone crushers further reduce particle dimensions if required.' },
  { step: '04', titleKey: 'apps.flow.4.title', title: 'Grinding / Milling', descKey: 'apps.flow.4.desc', desc: 'Ball mills or grinding mills pulverize material into fine mineral powders.' },
  { step: '05', titleKey: 'apps.flow.5.title', title: 'Screening / Classification', descKey: 'apps.flow.5.desc', desc: 'Vibrating screens and air classifiers sort materials into precise size grades.' },
  { step: '06', titleKey: 'apps.flow.6.title', title: 'Finished Material', descKey: 'apps.flow.6.desc', desc: 'Final graded aggregates, chips, and industrial powders ready for supply.' }
];

const REFERENCE_TABLE: ReferenceTableRow[] = [
  { productKey: 'apps.ref.limestone.product', product: 'Limestone Powder', machineryKey: 'apps.ref.limestone.machinery', machinery: 'Crushers, grinding mill, air classifier' },
  { productKey: 'apps.ref.calcite.product', product: 'Calcite Powder', machineryKey: 'apps.ref.calcite.machinery', machinery: 'Suitable crushing equipment, grinding mill, air classifier' },
  { productKey: 'apps.ref.dolomite.product', product: 'Dolomite Powder', machineryKey: 'apps.ref.dolomite.machinery', machinery: 'Crushers, grinding mill, air classifier' },
  { productKey: 'apps.ref.feldspar.product', product: 'Feldspar Powder', machineryKey: 'apps.ref.feldspar.machinery', machinery: 'Crushers, suitable grinding mill with wear-resisting liners, classifier' },
  { productKey: 'apps.ref.grit.product', product: 'Stone Grit', machineryKey: 'apps.ref.grit.machinery', machinery: 'Crushers and multi-deck vibrating screens' },
  { productKey: 'apps.ref.quartz.product', product: 'Quartz Chips', machineryKey: 'apps.ref.quartz.machinery', machinery: 'Suitable heavy-duty crushers and vibrating sizing screens' },
  { productKey: 'apps.ref.kolam.product', product: 'Kolam Powder', machineryKey: 'apps.ref.kolam.machinery', machinery: 'Depends on raw raw material source and traditional processing method (Note: traditionally decorative floor powder, not an industrial mineral processed through heavy milling)' }
];

export const ApplicationsPage: React.FC = () => {
  const { settings } = useAppData();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen text-[#1F2937]">
      <SEOHead
        title={`${t('apps.machineryTitle', 'Mineral Processing Machinery & Workflow')} | ${settings.companyName}`}
        description={t('apps.seoDesc', 'Explore the industrial machinery used in mining, crushing, grinding, screening, and processing minerals supplied by Naveen Minerals.')}
      />

      {/* Header Banner — Soft Cream #FFF7ED */}
      <section className="bg-[#FFF7ED]/85 border-b border-[#F3F4F6] py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold text-[#D97706] mb-2">
              {t('apps.machineryGuide', 'Industrial Mineral Processing Guide')}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0F172A] mb-4">
              {t('apps.machineryTitle', 'Mineral-Processing Machinery & Workflow')}
            </h1>
            <p className="text-base text-[#1F2937] leading-relaxed">
              {t('apps.machineryDesc', 'Understand the industrial equipment utilized in mining, primary and secondary crushing, fine grinding, vibrating screening, and powder classification across mineral manufacturing operations.')}
            </p>
          </div>
        </div>
      </section>

      {/* Machinery Guide Section */}
      <section className="py-16 lg:py-20 bg-transparent border-b border-[#F3F4F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <p className="text-xs font-semibold text-[#D97706] mb-1.5">
              {t('apps.equipCategories', 'Equipment Categories')}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0F172A]">
              {t('apps.keyMachinery', 'Key Machinery in Mineral Processing')}
            </h2>
            <p className="text-sm text-[#1F2937] mt-2">
              {t('apps.machinerySub', 'Each machine plays a specialized role in transforming raw quarried rock into graded aggregates or pulverized powders.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {MACHINERY_CATEGORIES.map((machine) => (
              <div
                key={machine.id}
                className="bg-[#FFFFFF] border border-[#F3F4F6] rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#FFF7ED] border border-[#D97706]/20 flex items-center justify-center">
                      {machine.icon}
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 bg-[#F3F4F6] text-[#0F172A] rounded-full">
                      {t(machine.categoryKey, machine.category)}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-bold text-[#0F172A] mb-3">
                    {t(machine.nameKey, machine.name)}
                  </h3>

                  <div className="space-y-3 mb-6">
                    <div>
                      <h4 className="text-xs font-semibold text-[#D97706] uppercase tracking-wider mb-1">
                        {t('apps.purpose', 'Purpose')}
                      </h4>
                      <p className="text-sm text-[#1F2937] leading-relaxed">
                        {t(machine.purposeKey, machine.purpose)}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-[#D97706] uppercase tracking-wider mb-1">
                        {t('apps.howItWorks', 'How It Works')}
                      </h4>
                      <p className="text-sm text-[#1F2937] leading-relaxed">
                        {t(machine.howItWorksKey, machine.howItWorks)}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-[#D97706] uppercase tracking-wider mb-1">
                        {t('apps.relevantMaterials', 'Relevant Materials')}
                      </h4>
                      <p className="text-sm text-[#1F2937] leading-relaxed">
                        {t(machine.relevantMaterialsKey, machine.relevantMaterials)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#F3F4F6]">
                  <h4 className="text-xs font-semibold text-[#0F172A] mb-2">{t('apps.keyFocus', 'Key Operating Focus:')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {machine.highlights.map((h, i) => (
                      <span
                        key={i}
                        className="text-xs bg-[#FFF7ED] text-[#92400E] px-2.5 py-1 rounded-md font-medium"
                      >
                        {t(h.key, h.label)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Processing Workflow Section */}
      <section className="py-16 lg:py-20 bg-[#FFF7ED]/85 border-b border-[#F3F4F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <p className="text-xs font-semibold text-[#D97706] mb-1.5">
              {t('apps.processFlow', 'General Process Flow')}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0F172A]">
              {t('apps.processSequence', 'Typical Mineral-Processing Sequence')}
            </h2>
            <p className="text-sm text-[#1F2937] mt-2">
              {t('apps.processDisclaimer', 'This sequence represents a general educational example. Actual production lines vary depending on the raw material feed, desired output size, and purity requirements. Not every product undergoes every processing step.')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {PROCESS_FLOW_STEPS.map((s, idx) => (
              <div
                key={s.step}
                className="bg-[#FFFFFF] border border-[#F3F4F6] rounded-xl p-5 relative flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold px-2 py-1 bg-[#D97706]/10 text-[#D97706] rounded">
                      {s.step}
                    </span>
                    {idx < PROCESS_FLOW_STEPS.length - 1 && (
                      <ArrowDown className="w-4 h-4 text-[#D97706] lg:hidden" />
                    )}
                  </div>
                  <h3 className="font-display text-base font-bold text-[#0F172A] mb-2">
                    {t(s.titleKey, s.title)}
                  </h3>
                  <p className="text-xs text-[#1F2937] leading-relaxed">
                    {t(s.descKey, s.desc)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product-to-Machinery Reference Table Section */}
      <section className="py-16 lg:py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <p className="text-xs font-semibold text-[#D97706] mb-1.5">
              {t('apps.equipAlignment', 'Equipment Alignment Reference')}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0F172A]">
              {t('apps.alignmentTitle', 'Product-to-Machinery Reference Guide')}
            </h2>
            <p className="text-sm text-[#1F2937] mt-2">
              {t('apps.alignmentDesc', 'General reference mapping Naveen Minerals catalogue items to potentially relevant processing machinery. Equipment selection depends on raw material feed, target particle size, capacity, and final specifications.')}
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#F3F4F6] rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FFF7ED] border-b border-[#F3F4F6]">
                    <th className="py-4 px-6 font-display text-sm font-bold text-[#0F172A]">
                      {t('apps.productNameCol', 'Product Name')}
                    </th>
                    <th className="py-4 px-6 font-display text-sm font-bold text-[#0F172A]">
                      {t('apps.relevantMachineryCol', 'Potentially Relevant Machinery')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6] text-sm text-[#1F2937]">
                  {REFERENCE_TABLE.map((row, i) => (
                    <tr key={i} className="hover:bg-[#FFF7ED]/50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-[#0F172A]">
                        {t(row.productKey, row.product)}
                      </td>
                      <td className="py-4 px-6 text-[#1F2937] leading-relaxed">
                        {t(row.machineryKey, row.machinery)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 bg-[#0F172A] text-[#FFFFFF] rounded-2xl p-8 border border-[#D97706]/30">
            <div>
              <h3 className="font-display text-lg font-bold text-[#FFFFFF] mb-1">
                {t('apps.specPrompt', 'Looking for Specific Material Specifications?')}
              </h3>
              <p className="text-sm text-slate-300">
                {t('apps.contactTeam', 'Contact our team in Namakkal to discuss your industrial mineral or decorative powder requirements.')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#0F172A] bg-[#FFFFFF] hover:bg-[#FFF7ED] rounded-lg transition-colors whitespace-nowrap"
              >
                <span>{t('applications.browseProducts', 'Browse Products')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/request-quote"
                className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold text-[#FFFFFF] bg-[#DC2626] hover:bg-[#B91C1C] rounded-lg transition-colors whitespace-nowrap"
              >
                {t('nav.requestQuote', 'Request a Quote')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
