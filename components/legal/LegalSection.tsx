import React from "react";

export interface LegalSubSection {
  title?: string;
  paragraphs?: string[];
  list?: string[];
}

export interface LegalSectionProps {
  id?: string;
  number?: string | number;
  title: string;
  intro?: string;
  paragraphs?: string[];
  list?: string[];
  subsections?: LegalSubSection[];
  children?: React.ReactNode;
}

export const LegalSection: React.FC<LegalSectionProps> = ({
  id,
  number,
  title,
  intro,
  paragraphs,
  list,
  subsections,
  children,
}) => {
  const displayTitle = number !== undefined ? `${number}. ${title}` : title;

  return (
    <section id={id} className="space-y-3 pt-2 border-t border-slate-900 first:border-0 first:pt-0">
      <h2 className="text-lg font-bold text-white tracking-tight flex items-baseline gap-1.5">
        {displayTitle}
      </h2>

      {intro && <p className="text-slate-300 leading-relaxed">{intro}</p>}

      {paragraphs &&
        paragraphs.map((p, idx) => (
          <p key={idx} className="text-slate-300 leading-relaxed">
            {p}
          </p>
        ))}

      {list && list.length > 0 && (
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-300">
          {list.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      )}

      {subsections &&
        subsections.map((sub, idx) => (
          <div key={idx} className="mt-3 pl-2 sm:pl-3 border-l-2 border-slate-800 space-y-2">
            {sub.title && <h3 className="text-sm font-semibold text-slate-200">{sub.title}</h3>}
            {sub.paragraphs?.map((p, pIdx) => (
              <p key={pIdx} className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {p}
              </p>
            ))}
            {sub.list && (
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-400">
                {sub.list.map((lItem, lIdx) => (
                  <li key={lIdx}>{lItem}</li>
                ))}
              </ul>
            )}
          </div>
        ))}

      {children}
    </section>
  );
};
