import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  Compass,
  Heart,
  Home,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works | NestBuddy",
  description:
    "See how NestBuddy helps you discover compatible roommates, explore properties, and take the next step toward a home that fits.",
  openGraph: {
    title: "How It Works | NestBuddy",
    description:
      "Discover compatible roommates, explore properties, and coordinate your next steps with NestBuddy.",
    type: "website",
  },
};

const roommateSteps = [
  {
    title: "Create your profile",
    description:
      "Share details such as your bio, education or profession, lifestyle, interests, and living situation.",
    icon: ClipboardList,
    href: "/profile-update/basic",
    link: "Complete your profile",
  },
  {
    title: "Set your preferences",
    description:
      "Add the roommate and home preferences available in your profile, including budget, location, and lifestyle choices.",
    icon: SlidersHorizontal,
    href: "/profile-update/roommate-preferrence",
    link: "Set your preferences",
  },
  {
    title: "Explore potential matches",
    description:
      "Browse roommate profiles and use compatibility details to compare areas such as location, budget, lifestyle, interests, and quiz answers.",
    icon: Sparkles,
    href: "/ai-roommate-finder",
    link: "Find roommates",
  },
  {
    title: "Connect and make plans",
    description:
      "Open a profile to learn more, review compatibility where available, then start a direct chat to get to know each other.",
    icon: MessageCircle,
    href: "/ai-roommate-finder",
    link: "Browse profiles",
  },
];

const propertySteps = [
  {
    title: "Search for a home",
    description:
      "Browse property listings and narrow your search with available filters such as location, price, and property type.",
    icon: Search,
    href: "/find-a-place",
    link: "Explore properties",
  },
  {
    title: "Compare the details",
    description:
      "Review each listing's photos, description, price, location, features, and amenities before deciding what to ask.",
    icon: Home,
    href: "/find-a-place",
    link: "Browse listings",
  },
  {
    title: "Ask the owner or agent",
    description:
      "Use the questions section on a property listing to ask about the home. You can also message the agent directly when that option is available.",
    icon: MessageCircle,
    href: "/find-a-place",
    link: "Find a property",
  },
  {
    title: "Request a viewing",
    description:
      "Choose a preferred date and time on an available listing. The owner or agent can review your request and confirm or update it.",
    icon: CalendarDays,
    href: "/find-a-place",
    link: "Find a place to view",
  },
];

const benefits = [
  {
    title: "Compatibility to explore",
    description:
      "Compare roommate preferences and lifestyle factors using profile and quiz information.",
    icon: Heart,
  },
  {
    title: "Discovery with filters",
    description:
      "Refine roommate and property searches using the options available for each journey.",
    icon: SlidersHorizontal,
  },
  {
    title: "Property information together",
    description:
      "Review listing details, photos, prices, location, features, and amenities in one place.",
    icon: Home,
  },
  {
    title: "Direct conversations",
    description:
      "Chat with potential roommates and message property agents where messaging is available.",
    icon: MessageCircle,
  },
  {
    title: "Viewing coordination",
    description:
      "Send a viewing request and follow its status from the property page.",
    icon: CalendarDays,
  },
  {
    title: "Room to make an informed choice",
    description:
      "Review the information, ask questions, and discuss details before you make a decision.",
    icon: Compass,
  },
];

const faqs = [
  {
    question: "What is NestBuddy?",
    answer:
      "NestBuddy helps people explore potential roommates and property listings. You can use either journey on its own, or explore both as you plan your next move.",
  },
  {
    question: "How does roommate matching work?",
    answer:
      "Complete your profile and roommate preferences, then browse potential roommates. Available compatibility details compare profile, preference, lifestyle, location, budget, interest, and quiz information.",
  },
  {
    question: "How is compatibility determined?",
    answer:
      "The compatibility score is based on the matching information available in the app, including location, budget, lifestyle, interests, and quiz answers. It is a guide for comparing profiles, not a prediction of how well you will get along.",
  },
  {
    question: "Can I search for a property without looking for a roommate?",
    answer:
      "Yes. You can browse property listings from Find a Place without first choosing the roommate-matching journey.",
  },
  {
    question: "How do I contact a property owner or agent?",
    answer:
      "Open a listing to see its available contact options. You can submit a property question, and direct chat is available with the agent where provided.",
  },
  {
    question: "How can I arrange a property viewing?",
    answer:
      "On an available listing, choose Request a viewing and submit your preferred date and time. The request is not confirmed until the owner or agent responds.",
  },
  {
    question: "Do I need to complete my profile before searching?",
    answer:
      "You can start browsing properties without completing a roommate profile. Roommate discovery and compatibility are more useful when you have filled in the relevant profile and preference information.",
  },
  {
    question: "Does a compatibility score guarantee we will get along?",
    answer:
      "No. A score only summarizes how the information provided compares. Take time to review profiles, ask questions, and decide whether the arrangement feels right for you.",
  },
];

function Journey({
  id,
  eyebrow,
  title,
  description,
  icon: JourneyIcon,
  steps,
  accent,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: typeof Users;
  steps: typeof roommateSteps;
  accent: "blue" | "gold";
}) {
  const isBlue = accent === "blue";

  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-24 rounded-3xl border border-[#e2edf8] bg-white-1 p-5 shadow-[0_10px_35px_rgba(24,84,180,0.06)] sm:p-8 lg:p-10"
    >
      <div className="max-w-2xl">
        <div
          className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${
            isBlue ? "bg-[#eaf3ff] text-[#2879ef]" : "bg-[#fff5d9] text-[#bd8100]"
          }`}
        >
          <JourneyIcon aria-hidden="true" size={24} />
        </div>
        <p
          className={`mt-5 text-xs font-bold uppercase tracking-[0.18em] ${
            isBlue ? "text-[#2879ef]" : "text-[#a36d00]"
          }`}
        >
          {eyebrow}
        </p>
        <h2
          id={`${id}-title`}
          className="mt-2 text-2xl font-extrabold tracking-tight text-[#163e70] sm:text-3xl"
        >
          {title}
        </h2>
        <p className="mt-3 text-sm leading-7 text-[#526b87] sm:text-base">
          {description}
        </p>
      </div>

      <ol className="mt-8 grid gap-4 sm:grid-cols-2">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          return (
            <li
              key={step.title}
              className="flex h-full flex-col rounded-2xl border border-[#e6eef7] bg-[#fbfdff] p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`grid h-9 w-9 place-items-center rounded-full text-sm font-extrabold ${
                    isBlue
                      ? "bg-[#eaf3ff] text-[#2879ef]"
                      : "bg-[#fff5d9] text-[#a36d00]"
                  }`}
                  aria-label={`Step ${index + 1}`}
                >
                  {index + 1}
                </span>
                <StepIcon
                  aria-hidden="true"
                  className={isBlue ? "text-[#73aaf0]" : "text-[#d3a33a]"}
                  size={20}
                />
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#163e70]">
                {step.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-[#526b87]">
                {step.description}
              </p>
              <Link
                href={step.href}
                className={`mt-4 inline-flex min-h-10 w-fit items-center gap-2 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef] focus-visible:ring-offset-2 ${
                  isBlue ? "text-[#2879ef]" : "text-[#986500]"
                }`}
              >
                {step.link}
                <ArrowRight aria-hidden="true" size={16} />
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export default function HowItWorksPage() {
  return (
    <main className="bg-[#f5f9ff] pb-16 text-[#163e70]">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-9 lg:px-8">
        <section
          aria-labelledby="how-it-works-title"
          className="relative overflow-hidden rounded-3xl bg-[#0d3157] px-5 py-10 text-white-1 shadow-[0_18px_50px_rgba(13,49,87,0.16)] sm:px-10 sm:py-14 lg:px-14 lg:py-16"
        >
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-32 h-80 w-80 rounded-full border-[48px] border-white-1/5"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-36 right-1/4 h-72 w-72 rounded-full border-[42px] border-[#64a9ff]/10"
          />
          <div className="relative max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white-1/20 bg-white-1/10 px-3 py-1.5 text-xs font-bold tracking-wide text-blue-100">
              <Sparkles aria-hidden="true" size={14} />
              YOUR NEXT MOVE STARTS HERE
            </span>
            <h1
              id="how-it-works-title"
              className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-white-1 sm:text-5xl lg:text-6xl"
            >
              Find your place.
              <br className="hidden sm:block" /> Find your people.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg sm:leading-8">
              Whether you are looking for a compatible roommate or your next
              home, NestBuddy helps you discover options that fit your
              preferences, budget, and location.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/ai-roommate-finder"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#2879ef] px-5 py-3 text-sm font-bold text-white-1 shadow-sm transition-colors hover:bg-[#1766d5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white-1 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d3157] motion-reduce:transition-none"
              >
                <Users aria-hidden="true" size={18} />
                Find a Roommate
                <ArrowRight aria-hidden="true" size={16} />
              </Link>
              <Link
                href="/find-a-place"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white-1/35 bg-white-1/10 px-5 py-3 text-sm font-bold text-white-1 transition-colors hover:bg-white-1/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white-1 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d3157] motion-reduce:transition-none"
              >
                <Home aria-hidden="true" size={18} />
                Explore Properties
              </Link>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="journeys-title"
          className="py-12 sm:py-16"
        >
          <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2879ef]">
              Two ways to get started
            </p>
            <h2
              id="journeys-title"
              className="mt-2 text-3xl font-extrabold tracking-tight text-[#163e70] sm:text-4xl"
            >
              Choose the journey that fits
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#526b87] sm:text-base">
              Search for a roommate, a home, or explore both. You can start with
              either one.
            </p>
          </div>
          <div className="space-y-6">
            <Journey
              id="find-a-roommate"
              eyebrow="Roommate journey"
              title="Find a compatible roommate"
              description="Build a useful profile, set the preferences that matter to you, and get to know potential roommates before making plans."
              icon={Users}
              steps={roommateSteps}
              accent="blue"
            />
            <Journey
              id="find-a-property"
              eyebrow="Property journey"
              title="Find a property"
              description="Explore listings, learn about each home, ask the owner or agent questions, and request a viewing when you are ready."
              icon={Home}
              steps={propertySteps}
              accent="gold"
            />
          </div>
        </section>

        <section
          aria-labelledby="benefits-title"
          className="rounded-3xl bg-[#eaf3ff] px-5 py-10 sm:px-9 sm:py-12"
        >
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2879ef]">
              Why NestBuddy
            </p>
            <h2
              id="benefits-title"
              className="mt-2 text-3xl font-extrabold tracking-tight text-[#163e70] sm:text-4xl"
            >
              A smarter way to find where you belong
            </h2>
          </div>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map(({ title, description, icon: BenefitIcon }) => (
              <li
                key={title}
                className="rounded-2xl border border-white-1 bg-white-1 p-5"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eaf3ff] text-[#2879ef]">
                  <BenefitIcon aria-hidden="true" size={20} />
                </span>
                <h3 className="mt-4 font-bold text-[#163e70]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#526b87]">
                  {description}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="getting-started-title"
          className="mt-12 flex flex-col gap-8 rounded-3xl border border-[#e2edf8] bg-white-1 p-5 shadow-[0_10px_35px_rgba(24,84,180,0.05)] sm:mt-16 sm:p-9 lg:flex-row lg:justify-between lg:p-12"
        >
          <div>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eaf3ff] text-[#2879ef]">
              <Compass aria-hidden="true" size={24} />
            </span>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#2879ef]">
              Getting started
            </p>
            <h2
              id="getting-started-title"
              className="mt-2 text-3xl font-extrabold tracking-tight text-[#163e70]"
            >
              Your first steps are simple
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#526b87]">
              Create an account to use roommate matching and profile features.
              Property discovery is ready to explore whenever you are.
            </p>
            <Link
              href="/sign-up"
              className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#2879ef] px-5 py-3 text-sm font-bold text-white-1 transition-colors hover:bg-[#1766d5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef] focus-visible:ring-offset-2 motion-reduce:transition-none"
            >
              Create your account
              <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>
          <ol className="space-y-4">
            {[
              "Sign up or log in to use roommate profiles and messaging.",
              "Add the profile and preferences relevant to your search.",
              "Choose roommate discovery, property search, or both.",
              "Review profiles or listings, then ask questions and connect.",
              "Coordinate next steps, including a property viewing if needed.",
            ].map((step, index) => (
              <li key={step} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#eaf3ff] text-xs font-extrabold text-[#2879ef]">
                  {index + 1}
                </span>
                <span className="text-sm leading-6 text-[#355d8c]">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section
          aria-labelledby="safety-title"
          className="mt-12 grid gap-5 rounded-3xl border border-[#d8e9fb] bg-[#fafdff] p-5 sm:mt-16 sm:grid-cols-[auto_1fr] sm:items-start sm:p-8"
        >
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eaf3ff] text-[#2879ef]">
            <ShieldCheck aria-hidden="true" size={24} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2879ef]">
              Make an informed choice
            </p>
            <h2
              id="safety-title"
              className="mt-2 text-2xl font-extrabold tracking-tight text-[#163e70]"
            >
              Take time to check the details
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#526b87]">
              Review profile and property information carefully, ask about
              anything unclear, and confirm viewing arrangements directly
              before you go. Avoid sharing sensitive personal or financial
              information unnecessarily, and verify important details in
              person before making a commitment. Profile or listing information
              is provided to help you decide; it is not a guarantee of a
              particular outcome.
            </p>
          </div>
        </section>

        <section
          aria-labelledby="faq-title"
          className="mx-auto mt-12 max-w-4xl sm:mt-16"
        >
          <div className="mb-6 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2879ef]">
              Helpful answers
            </p>
            <h2
              id="faq-title"
              className="mt-2 text-3xl font-extrabold tracking-tight text-[#163e70] sm:text-4xl"
            >
              Frequently asked questions
            </h2>
          </div>
          <div className="divide-y divide-[#e6eef7] rounded-2xl border border-[#e2edf8] bg-white-1 px-5 sm:px-7">
            {faqs.map(({ question, answer }) => (
              <details key={question} className="group py-4">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-lg text-left font-bold text-[#163e70] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef] focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
                  {question}
                  <span
                    aria-hidden="true"
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f2f7fd] text-[#2879ef] transition-transform group-open:rotate-45 motion-reduce:transition-none"
                  >
                    <span className="text-xl leading-none">+</span>
                  </span>
                </summary>
                <p className="max-w-3xl pb-1 pr-10 pt-2 text-sm leading-7 text-[#526b87]">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-12 overflow-hidden rounded-3xl bg-[#0d3157] px-5 py-10 text-center text-white-1 sm:mt-16 sm:px-10 sm:py-12">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white-1/10 text-blue-100">
            <MapPin aria-hidden="true" size={24} />
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white-1 sm:text-4xl">
            Your next home starts with the right connection.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
            Discover potential roommates, explore properties, and take the next
            step toward a place that feels right for you.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/ai-roommate-finder"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#2879ef] px-5 py-3 text-sm font-bold text-white-1 transition-colors hover:bg-[#1766d5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white-1 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d3157] motion-reduce:transition-none"
            >
              <Users aria-hidden="true" size={17} />
              Find Your Roommate
            </Link>
            <Link
              href="/find-a-place"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white-1/35 bg-white-1/10 px-5 py-3 text-sm font-bold text-white-1 transition-colors hover:bg-white-1/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white-1 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d3157] motion-reduce:transition-none"
            >
              <Home aria-hidden="true" size={17} />
              Browse Available Homes
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
