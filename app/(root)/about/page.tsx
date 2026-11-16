import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Compass,
  Heart,
  Home,
  MessageCircle,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About NestBuddy | Find Where You Belong",
  description:
    "Learn how NestBuddy brings roommate discovery and property search together to help people make more informed choices about where and how they live.",
  openGraph: {
    title: "About NestBuddy | Find Where You Belong",
    description:
      "Roommate discovery and property search, brought together in one place.",
    type: "website",
  },
};

const values = [
  {
    title: "People first",
    description:
      "Finding a place to live is personal. The experience should respect the people making that decision.",
    icon: Heart,
  },
  {
    title: "Better-informed choices",
    description:
      "Useful information, clear communication, and thoughtful comparisons can help people decide with more confidence.",
    icon: Compass,
  },
  {
    title: "Compatibility and connection",
    description:
      "A good shared living arrangement involves more than budget. Lifestyle, expectations, and communication matter too.",
    icon: Users,
  },
  {
    title: "Transparency and responsibility",
    description:
      "Compatibility insights and listing information should be clear about what they can—and cannot—tell you.",
    icon: ShieldCheck,
  },
];

const previewSteps = [
  {
    number: "01",
    title: "Create your profile",
    description:
      "Share relevant details and preferences to support your roommate search.",
    icon: Users,
  },
  {
    number: "02",
    title: "Discover your options",
    description:
      "Explore potential roommates, compatibility details, and available properties.",
    icon: SlidersHorizontal,
  },
  {
    number: "03",
    title: "Connect and take the next step",
    description:
      "Start conversations, ask questions, and coordinate next steps using the available workflows.",
    icon: MessageCircle,
  },
];

export default function AboutPage() {
  return (
    <div className="bg-white-1 text-[#163e70]">
      <section
        aria-labelledby="about-title"
        className="mx-auto grid min-h-[min(760px,calc(100svh-72px))] w-full max-w-7xl bg-[#f3f8ff] px-4 sm:px-6 lg:px-8 lg:grid-cols-2"
      >
        <div className="flex items-center py-14 sm:py-20 lg:py-24">
          <div className="w-full">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#d7e8fb] bg-white-1 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#2879ef]">
              <Sparkles aria-hidden="true" size={15} />
              About NestBuddy
            </span>
            <h1
              id="about-title"
              className="mt-6 max-w-[15ch] text-4xl font-extrabold leading-[1.08] tracking-tight text-[#0d3157] sm:text-5xl lg:text-6xl 2xl:text-7xl"
            >
              A better way to find where you belong.
            </h1>
            <p className="mt-6 max-w-prose text-base leading-8 text-[#526b87] sm:text-lg">
              Finding a place to live is about more than four walls. It is
              about finding the right people, the right space, and a place
              where you can feel at home. NestBuddy brings roommate discovery
              and property search together to help make that journey easier.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/ai-roommate-finder"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#2879ef] px-5 py-3 text-sm font-bold text-white-1 shadow-sm transition-colors hover:bg-[#1766d5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef] focus-visible:ring-offset-2 motion-reduce:transition-none"
              >
                <Users aria-hidden="true" size={18} />
                Find a Roommate
                <ArrowRight aria-hidden="true" size={16} />
              </Link>
              <Link
                href="/find-a-place"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#c9dbef] bg-white-1 px-5 py-3 text-sm font-bold text-[#22558e] transition-colors hover:border-[#2879ef] hover:bg-[#f5f9ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef] focus-visible:ring-offset-2 motion-reduce:transition-none"
              >
                <Home aria-hidden="true" size={18} />
                Explore Properties
              </Link>
            </div>
          </div>
        </div>

          <Image
            src="/new ui/down-bannar-image.png"
            alt="Roommates sharing a welcoming home"
            priority
            width={800}
            height={1000}
            className="object-cover h-full"
          />
          
      </section>

      <section
        aria-labelledby="why-title"
        className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-8 lg:py-28"
      >
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2879ef]">
            Why NestBuddy exists
          </p>
          <h2
            id="why-title"
            className="mt-3 max-w-[16ch] text-3xl font-extrabold leading-tight tracking-tight text-[#0d3157] sm:text-4xl lg:text-5xl"
          >
            Finding a home should feel more connected.
          </h2>
          <div className="mt-6 h-1 w-16 rounded-full bg-[#e6b23b]" />
        </div>
        <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:gap-8">
          <div className="space-y-5 text-base leading-8 text-[#526b87]">
            <p>
              Finding a place to live can be overwhelming. Finding someone to
              share it with can be just as challenging. People often have to
              navigate different platforms, compare countless options, and
              figure out whether a potential roommate will fit their
              lifestyle.
            </p>
            <p>
              NestBuddy brings these parts of the journey together. By
              combining roommate discovery, compatibility-focused matching,
              and property search in one place, we aim to help people make
              more informed decisions about where and how they live.
            </p>
            <p className="font-semibold text-[#355d8c]">
              Because finding a home should be about more than availability.
              It should be about finding a place and a living arrangement that
              work for you.
            </p>
          </div>
          <div className="hidden flex-col items-center gap-3 pt-2 text-[#2879ef] sm:flex">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eaf3ff]">
              <Home aria-hidden="true" size={22} />
            </span>
            <span className="h-14 w-px bg-[#d7e8fb]" />
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff5d9] text-[#a36d00]">
              <Heart aria-hidden="true" size={22} />
            </span>
          </div>
        </div>
      </section>

      <section
        aria-label="NestBuddy mission and vision"
        className="mx-auto grid w-full max-w-7xl gap-px bg-[#dce9f7] px-4 sm:grid-cols-2 sm:px-6 lg:px-8"
      >
        <article className="bg-[#0d3157] px-5 py-12 text-white-1 sm:px-10 sm:py-16 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9bc7ff]">
            Our mission
          </p>
          <h2 className="mt-4 max-w-[18ch] text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            Make the search simpler, more informed, and more accessible.
          </h2>
          <p className="mt-5 max-w-prose text-sm leading-7 text-blue-100 sm:text-base">
            To make finding compatible roommates and suitable places to live
            simpler, more informed, and more accessible.
          </p>
        </article>
        <article className="bg-[#eaf3ff] px-5 py-12 sm:px-10 sm:py-16 lg:px-8 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2879ef]">
            Our vision
          </p>
          <h2 className="mt-4 max-w-[18ch] text-3xl font-extrabold leading-tight tracking-tight text-[#0d3157] sm:text-4xl">
            A more connected way to find home.
          </h2>
          <p className="mt-5 max-w-prose text-sm leading-7 text-[#526b87] sm:text-base">
            A world where finding a home and the right people to share it with
            feels less stressful and more connected.
          </p>
        </article>
      </section>

      <section
        aria-labelledby="journeys-title"
        className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28"
      >
        <div className="mb-9 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2879ef]">
              What we do
            </p>
            <h2
              id="journeys-title"
              className="mt-3 max-w-[20ch] text-3xl font-extrabold tracking-tight text-[#0d3157] sm:text-4xl lg:text-5xl"
            >
              One platform. Two important journeys.
            </h2>
          </div>
          <p className="max-w-prose text-sm leading-7 text-[#526b87] sm:text-base">
            Whether you are looking for someone to share a home with or a place
            to call your own, you can start with the journey that fits.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <article className="flex h-full flex-col rounded-3xl border border-[#dce9f7] bg-[#f5f9ff] p-6 sm:p-8 lg:p-10">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e3efff] text-[#2879ef]">
              <Users aria-hidden="true" size={24} />
            </span>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-[#2879ef]">
              Find your people
            </p>
            <h3 className="mt-2 text-2xl font-extrabold text-[#163e70] sm:text-3xl">
              Roommate discovery with compatibility in mind
            </h3>
            <p className="mt-4 flex-1 text-sm leading-7 text-[#526b87] sm:text-base">
              Build a profile, share your preferences, and discover potential
              roommates. Explore the compatibility information available in
              the app to help compare lifestyle and living preferences—without
              expecting any score to guarantee a perfect fit.
            </p>
            <Link
              href="/ai-roommate-finder"
              className="mt-7 inline-flex min-h-11 w-fit items-center gap-2 rounded-xl bg-[#2879ef] px-5 py-3 text-sm font-bold text-white-1 transition-colors hover:bg-[#1766d5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef] focus-visible:ring-offset-2 motion-reduce:transition-none"
            >
              Discover Roommate Matching
              <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </article>
          <article className="flex h-full flex-col rounded-3xl border border-[#efdfb8] bg-[#fffaf0] p-6 sm:p-8 lg:p-10">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff0c9] text-[#a36d00]">
              <Home aria-hidden="true" size={24} />
            </span>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-[#986500]">
              Find your place
            </p>
            <h3 className="mt-2 text-2xl font-extrabold text-[#163e70] sm:text-3xl">
              Explore homes and compare the details
            </h3>
            <p className="mt-4 flex-1 text-sm leading-7 text-[#526b87] sm:text-base">
              Browse available properties, review listing details, and ask
              questions. Contact options include direct chat with the agent
              where available, and you can request a viewing on eligible
              listings.
            </p>
            <Link
              href="/find-a-place"
              className="mt-7 inline-flex min-h-11 w-fit items-center gap-2 rounded-xl border border-[#d8b969] bg-white-1 px-5 py-3 text-sm font-bold text-[#805600] transition-colors hover:bg-[#fff4d8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a36d00] focus-visible:ring-offset-2 motion-reduce:transition-none"
            >
              Explore Properties
              <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </article>
        </div>
      </section>

      <section
        aria-labelledby="designed-title"
        className="mx-auto w-full max-w-7xl bg-[#f3f8ff] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
      >
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-14">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2879ef]">
              A thoughtful approach
            </p>
            <h2
              id="designed-title"
              className="mt-3 max-w-[15ch] text-3xl font-extrabold tracking-tight text-[#0d3157] sm:text-4xl lg:text-5xl"
            >
              Designed around real living
            </h2>
            <p className="mt-5 max-w-prose text-sm leading-7 text-[#526b87] sm:text-base">
              Moving is a big decision. NestBuddy brings useful discovery and
              communication tools together to help people take it one step at
              a time.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Compatibility matters",
                text: "Consider lifestyle, preferences, and living arrangements when exploring roommate matches.",
                icon: Heart,
              },
              {
                title: "Personalized discovery",
                text: "Narrow searches using the preferences and filters available in the product.",
                icon: SlidersHorizontal,
              },
              {
                title: "Property discovery",
                text: "Review listing information such as photos, prices, features, and location.",
                icon: Home,
              },
              {
                title: "Direct communication",
                text: "Connect with potential roommates and use property questions or agent chat where available.",
                icon: MessageCircle,
              },
              {
                title: "Viewing coordination",
                text: "Request a viewing and follow its status through the property workflow.",
                icon: Compass,
              },
              {
                title: "Informed decisions",
                text: "Ask questions, compare details, and discuss arrangements before committing.",
                icon: ShieldCheck,
              },
            ].map(({ title, text, icon: BenefitIcon }) => (
              <li
                key={title}
                className="rounded-2xl border border-[#e2edf8] bg-white-1 p-5 sm:p-6"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eaf3ff] text-[#2879ef]">
                  <BenefitIcon aria-hidden="true" size={20} />
                </span>
                <h3 className="mt-4 font-bold text-[#163e70]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#526b87]">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="values-title"
        className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
      >
        <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2879ef]">
              Our values
            </p>
            <h2
              id="values-title"
              className="mt-3 text-3xl font-extrabold tracking-tight text-[#0d3157] sm:text-4xl"
            >
              What we believe in
            </h2>
          </div>
          <p className="max-w-prose text-sm leading-7 text-[#526b87]">
            These principles guide how we think about the home-finding journey.
          </p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {values.map(({ title, description, icon: ValueIcon }, index) => (
            <li
              key={title}
              className="rounded-2xl border border-[#e2edf8] bg-white-1 p-5 sm:p-6"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#eaf3ff] text-[#2879ef]">
                  <ValueIcon aria-hidden="true" size={21} />
                </span>
                <span className="text-sm font-extrabold tracking-widest text-[#a8bfd9]">
                  0{index + 1}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-bold text-[#163e70]">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#526b87]">
                {description}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="preview-title"
        className="mx-auto w-full max-w-7xl border-y border-[#e2edf8] bg-[#fbfdff] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
      >
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2879ef]">
              A simple place to start
            </p>
            <h2
              id="preview-title"
              className="mt-3 max-w-[19ch] text-3xl font-extrabold tracking-tight text-[#0d3157] sm:text-4xl"
            >
              How it works, at a glance
            </h2>
          </div>
          <Link
            href="/how-it-works"
            className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl border border-[#c9dbef] bg-white-1 px-5 py-3 text-sm font-bold text-[#22558e] transition-colors hover:border-[#2879ef] hover:bg-[#f5f9ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef] focus-visible:ring-offset-2 motion-reduce:transition-none"
          >
            See How It Works
            <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>
        <ol className="mt-8 grid gap-4 lg:grid-cols-3">
          {previewSteps.map(({ number, title, description, icon: StepIcon }) => (
            <li
              key={number}
              className="rounded-2xl border border-[#e2edf8] bg-white-1 p-5 sm:p-7"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold tracking-[0.16em] text-[#2879ef]">
                  {number}
                </span>
                <StepIcon
                  aria-hidden="true"
                  className="text-[#7aaeea]"
                  size={22}
                />
              </div>
              <h3 className="mt-5 text-xl font-bold text-[#163e70]">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#526b87]">
                {description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="responsible-title"
        className="mx-auto grid w-full max-w-7xl gap-6 bg-[#fffaf0] px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[auto_1fr] lg:items-start lg:gap-8 lg:px-8 lg:py-20"
      >
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff0c9] text-[#986500]">
          <ShieldCheck aria-hidden="true" size={24} />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#986500]">
            Trust and responsible use
          </p>
          <h2
            id="responsible-title"
            className="mt-2 text-2xl font-extrabold tracking-tight text-[#163e70] sm:text-3xl"
          >
            Take the time to make the choice that is right for you.
          </h2>
          <p className="mt-4 max-w-prose text-sm leading-7 text-[#526b87] sm:text-base">
            Review profile and property information carefully, ask questions
            when details are unclear, verify important information, and
            confirm arrangements before making a commitment. Compatibility
            details and listing information are there to support your decision;
            they do not guarantee compatibility, safety, or property quality.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="about-cta-title"
        className="mx-auto w-full max-w-7xl bg-[#0d3157] px-4 py-14 text-white-1 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
      >
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9bc7ff]">
              Take your next step
            </p>
            <h2
              id="about-cta-title"
              className="mt-3 max-w-[20ch] text-3xl font-extrabold leading-tight tracking-tight text-white-1 sm:text-4xl lg:text-5xl"
            >
              Your next chapter starts with the right connection.
            </h2>
            <p className="mt-4 max-w-prose text-sm leading-7 text-blue-100 sm:text-base">
              Whether you are looking for someone to share a home with or
              searching for your next place, NestBuddy is here to help you
              explore your options.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <Link
              href="/ai-roommate-finder"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#2879ef] px-5 py-3 text-sm font-bold text-white-1 transition-colors hover:bg-[#1766d5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white-1 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d3157] motion-reduce:transition-none"
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
              Browse Properties
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
