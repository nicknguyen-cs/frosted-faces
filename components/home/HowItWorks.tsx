import { Search, FileText, Home, type LucideIcon } from "lucide-react";
import Container from "@/components/layout/Container";
import type { EditableTags } from "@/lib/contentstack";

const iconMap: Record<string, LucideIcon> = {
  search: Search,
  "file-text": FileText,
  home: Home,
};

interface StepItem {
  number: number;
  title: string;
  description: string;
  icon: string;
  $?: EditableTags;
}

interface HowItWorksProps {
  steps?: StepItem[];
  editTags?: EditableTags;
}

export default function HowItWorks({ steps: stepsFromCms, editTags }: HowItWorksProps) {
  const steps = stepsFromCms ?? [];

  return (
    <section className="bg-charcoal py-14">
      <Container>
        <div className="space-y-8">
          <h2 className="font-heading text-2xl font-bold text-white md:text-3xl">
            How it works
          </h2>
          <div
            className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8"
            {...(editTags && editTags.steps)}
          >
            {steps.length === 0 && (
              <div className="col-span-full rounded-2xl border-2 border-dashed border-stone/30 p-8 text-center text-sm text-sand-200/60">
                Add steps to show how it works
              </div>
            )}
            {steps.map((step, index) => {
              const Icon = iconMap[step.icon] || Search;
              return (
                <div
                  key={index}
                  className="relative flex flex-col items-center text-center"
                  {...(editTags && editTags[`steps__${index}`])}
                >
                  {index < steps.length - 1 && (
                    <div className="absolute top-6 left-[calc(50%+32px)] hidden h-px w-[calc(100%-64px)] border-t border-dashed border-stone md:block" />
                  )}

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta text-white font-heading font-semibold text-base">
                    {step.number}
                  </div>

                  <Icon size={28} className="mt-4 text-sand-200" />

                  <h3
                    className="mt-3 font-heading font-semibold text-white"
                    {...(step.$ && step.$.title)}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="mt-1 text-sm text-sand-200 font-body max-w-xs"
                    {...(step.$ && step.$.description)}
                  >
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
