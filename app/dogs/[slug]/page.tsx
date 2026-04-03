import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDogBySlug } from "@/lib/contentstack";
import type { LivePreviewParams } from "@/lib/contentstack";
import ProfileHero from "@/components/dog-profile/ProfileHero";
import AdoptionCTA from "@/components/dog-profile/AdoptionCTA";
import QuickFacts from "@/components/dog-profile/QuickFacts";
import PersonalityTraits from "@/components/dog-profile/PersonalityTraits";
import PhotoGallery from "@/components/dog-profile/PhotoGallery";
import BioSection from "@/components/dog-profile/BioSection";
import CompatibilityChart from "@/components/dog-profile/CompatibilityChart";
import MedicalBadges from "@/components/dog-profile/MedicalBadges";
import InquiryForm from "@/components/dog-profile/InquiryForm";



type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<LivePreviewParams>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const dog = await getDogBySlug(slug);

  if (!dog) {
    return { title: "Dog not found" };
  }

  return {
    title: `Adopt ${dog.title} — Frosted Faces`,
    description: dog.tagline,
    openGraph: {
      title: `Adopt ${dog.title}`,
      description: dog.tagline,
      images: dog.photos?.[0] ? [{ url: dog.photos[0].url }] : [],
    },
  };
}

export default async function DogProfilePage({ params, searchParams }: PageProps) {
  const [{ slug }, previewParams] = await Promise.all([params, searchParams]);
  const dog = await getDogBySlug(slug, previewParams);

  if (!dog) notFound();

  const sortedPhotos = [...(dog.photos || [])].sort((a, b) => a.order - b.order);
  const heroPhoto = sortedPhotos[0] ?? {
    url: "/placeholder-dog.jpg",
    alt: dog.title,
  };

  return (
    <>

      <main className="mx-auto w-full max-w-4xl px-5 py-8 space-y-10">
        <ProfileHero photo={heroPhoto} status={dog.status} editTags={dog.$} />

        <div>
          <h1
            className="font-heading text-3xl font-bold text-charcoal md:text-4xl"
            {...(dog.$ && dog.$.title)}
          >
            {dog.title}
          </h1>
          <p
            className="mt-1 text-lg italic text-pebble"
            {...(dog.$ && dog.$.tagline)}
          >
            {dog.tagline}
          </p>
        </div>

        <AdoptionCTA name={dog.title} adoptionFee={dog.adoption_fee} editTags={dog.$} />

        <QuickFacts
          age={dog.age}
          weight={dog.weight}
          size={dog.size}
          sex={dog.sex}
          breed={dog.breed}
          breedSecondary={dog.breed_secondary}
          color={dog.color}
          fosterLocation={dog.foster_location}
          intakeDate={dog.intake_date}
          editTags={dog.$}
        />

        <PersonalityTraits
          personalityTraits={dog.personality_traits}
          energyLevel={dog.energy_level}
          editTags={dog.$}
        />

        <PhotoGallery photos={sortedPhotos} />

        <BioSection name={dog.title} bio={dog.bio} editTags={dog.$} />

        <CompatibilityChart
          goodWithDogs={dog.good_with_dogs}
          goodWithCats={dog.good_with_cats}
          goodWithKids={dog.good_with_kids}
          houseTrained={dog.house_trained}
          editTags={dog.$}
        />

        <MedicalBadges
          spayedNeutered={dog.spayed_neutered}
          vaccinated={dog.vaccinated}
          microchipped={dog.microchipped}
          specialNeeds={dog.special_needs}
          editTags={dog.$}
        />

        <InquiryForm dogId={dog.uid} dogName={dog.title} />
      </main>
    </>
  );
}
