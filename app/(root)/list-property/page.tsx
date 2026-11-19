"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createPropertyListing, fetchPropertyListingLocations, PropertyLocationOption, uploadPropertyImage } from "@/utils/api";
import { isAuthenticated } from "@/utils/auth";

const propertyTypes = [
  "Self Contain",
  "Single Room",
  "Shared Apartment",
  "Mini Flat",
  "Flat",
  "Duplex",
  "Bungalow",
  "Terrace",
  "Mansion",
  "Penthouse",
  "Student Lodge",
  "Other",
];

const rentalPeriods = ["Daily", "Weekly", "Monthly", "Quarterly", "Biannually", "Annually"];

function ListPropertyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [states, setStates] = useState<PropertyLocationOption[]>([]);
  const [cities, setCities] = useState<PropertyLocationOption[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [createdListingSlug, setCreatedListingSlug] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    property_type: "Flat",
    listing_type: "Rent",
    price: "",
    rental_period: "Monthly",
    available_from: "",
    address: "",
    state: "",
    city: "",
    num_bedrooms: "1",
    num_bathrooms: "1",
    size_sqm: "",
    accepts_students: true,
    accepts_pets: false,
    is_furnished: false,
    parking_space: false,
  });
  const returnTo = searchParams.toString()
    ? `/list-property?${searchParams.toString()}`
    : "/list-property";

  const availableCities = useMemo(
    () => cities.filter((city) => !form.state || String(city.state) === form.state),
    [cities, form.state],
  );

  async function loadLocations() {
    setLocationsLoading(true);
    setLocationError(null);
    try {
      const options = await fetchPropertyListingLocations();
      setStates(options.states);
      setCities(options.cities);
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : "Unable to load state and city options.");
    } finally {
      setLocationsLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    isAuthenticated()
      .then((result) => {
        if (active) setAuthenticated(result);
      })
      .catch(() => {
        if (active) setAuthenticated(false);
      });
    void loadLocations();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const listingType = searchParams.get("listing_type");
    if (["Rent", "Sale", "Lease", "Short Term"].includes(listingType || "")) {
      setForm((current) => ({
        ...current,
        listing_type: listingType || current.listing_type,
      }));
    }
  }, [searchParams]);

  function updateForm<Key extends keyof typeof form>(key: Key, value: (typeof form)[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submitListing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      if (!form.state || !form.city) {
        throw new Error("Choose both a state and a city for this listing.");
      }

      const result = await createPropertyListing({
        title: form.title.trim(),
        description: form.description.trim(),
        property_type: form.property_type,
        listing_type: form.listing_type,
        price: Number(form.price),
        rental_period: form.listing_type === "Sale" ? null : form.rental_period,
        available_from: form.available_from || null,
        accepts_students: form.accepts_students,
        accepts_pets: form.accepts_pets,
        size_sqm: form.size_sqm ? Number(form.size_sqm) : null,
        parking_space: form.parking_space,
        num_bedrooms: Number(form.num_bedrooms),
        num_bathrooms: Number(form.num_bathrooms),
        is_furnished: form.is_furnished,
        is_available: true,
        address: form.address.trim(),
        city: Number(form.city),
        state: Number(form.state),
      });

      try {
        for (const [index, image] of images.entries()) {
          await uploadPropertyImage(result.id, image, index === 0);
        }
      } catch (error) {
        setCreatedListingSlug(result.slug);
        const reason = error instanceof Error ? ` ${error.message}` : "";
        setSubmitError(`Your listing was created, but one or more images could not be uploaded.${reason}`);
        return;
      }

      router.push(`/properties/${result.slug}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to create the listing. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (authenticated === null) {
    return <div className="nb2-listing-page"><p role="status">Checking your sign-in status…</p></div>;
  }

  if (!authenticated) {
    return (
      <main className="nb2-listing-page">
        <section className="nb2-listing-panel">
          <p className="nb2-kicker">List your property</p>
          <h1>Sign in to create a listing</h1>
          <p>You need a NestBuddy account to publish and manage a property.</p>
          <Link href={`/sign-in?next=${encodeURIComponent(returnTo)}`} className="nb2-amber">Sign in to continue</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="nb2-listing-page">
      <section className="nb2-listing-panel">
        <p className="nb2-kicker">List your property</p>
        <h1>Share a place with the NestBuddy community</h1>
        <p>Add the key details so prospective tenants or buyers can find your property.</p>

        {locationError && (
          <div className="nb2-home-error" role="alert">
            <p>{locationError}</p>
            <button type="button" onClick={() => void loadLocations()}>Retry location options</button>
          </div>
        )}

        {submitError && (
          <p className="nb2-listing-error" role="alert">
            {submitError}{" "}
            {createdListingSlug && (
              <Link href={`/properties/${createdListingSlug}`}>View the created listing.</Link>
            )}
          </p>
        )}

        <form className="nb2-listing-form" onSubmit={submitListing}>
          <label>
            Listing title
            <input required maxLength={255} value={form.title} onChange={(event) => updateForm("title", event.target.value)} />
          </label>

          <label>
            Description
            <textarea required rows={4} value={form.description} onChange={(event) => updateForm("description", event.target.value)} />
          </label>

          <div className="nb2-listing-fields">
            <label>
              Listing type
              <select value={form.listing_type} onChange={(event) => updateForm("listing_type", event.target.value)}>
                {["Rent", "Sale", "Lease", "Short Term"].map((type) => <option key={type}>{type}</option>)}
              </select>
            </label>
            <label>
              Property type
              <select value={form.property_type} onChange={(event) => updateForm("property_type", event.target.value)}>
                {propertyTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
            </label>
            <label>
              Price (NGN)
              <input required type="number" min="1" step="1000" value={form.price} onChange={(event) => updateForm("price", event.target.value)} />
            </label>
            {form.listing_type !== "Sale" && (
              <label>
                Rental period
                <select value={form.rental_period} onChange={(event) => updateForm("rental_period", event.target.value)}>
                  {rentalPeriods.map((period) => <option key={period}>{period}</option>)}
                </select>
              </label>
            )}
            <label>
              Available from
              <input type="date" value={form.available_from} onChange={(event) => updateForm("available_from", event.target.value)} />
            </label>
            <label>
              State
              <select required value={form.state} disabled={locationsLoading} onChange={(event) => {
                updateForm("state", event.target.value);
                updateForm("city", "");
              }}>
                <option value="">Choose a state</option>
                {states.map((state) => <option key={state.id} value={state.id}>{state.name}</option>)}
              </select>
            </label>
            <label>
              City
              <select required value={form.city} disabled={locationsLoading || !form.state} onChange={(event) => updateForm("city", event.target.value)}>
                <option value="">Choose a city</option>
                {availableCities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
              </select>
            </label>
            <label className="nb2-listing-full">
              Street address
              <input required maxLength={255} value={form.address} onChange={(event) => updateForm("address", event.target.value)} />
            </label>
            <label className="nb2-listing-full">
              Property images
              <input
                type="file"
                accept="image/*"
                multiple
                aria-describedby="property-images-help"
                onChange={(event) => setImages(Array.from(event.currentTarget.files ?? []))}
              />
              <span id="property-images-help" className="font-normal text-slate-500">
                Select one or more images. The first image will be the primary photo.
              </span>
            </label>
            <label>
              Bedrooms
              <input type="number" min="0" value={form.num_bedrooms} onChange={(event) => updateForm("num_bedrooms", event.target.value)} />
            </label>
            <label>
              Bathrooms
              <input type="number" min="0" value={form.num_bathrooms} onChange={(event) => updateForm("num_bathrooms", event.target.value)} />
            </label>
            <label>
              Size (m²)
              <input type="number" min="0" step="0.1" value={form.size_sqm} onChange={(event) => updateForm("size_sqm", event.target.value)} />
            </label>
          </div>

          <fieldset className="nb2-listing-checks">
            <legend>Property details</legend>
            <label><input type="checkbox" checked={form.accepts_students} onChange={(event) => updateForm("accepts_students", event.target.checked)} /> Students welcome</label>
            <label><input type="checkbox" checked={form.accepts_pets} onChange={(event) => updateForm("accepts_pets", event.target.checked)} /> Pets allowed</label>
            <label><input type="checkbox" checked={form.is_furnished} onChange={(event) => updateForm("is_furnished", event.target.checked)} /> Furnished</label>
            <label><input type="checkbox" checked={form.parking_space} onChange={(event) => updateForm("parking_space", event.target.checked)} /> Parking available</label>
          </fieldset>

          <div className="nb2-listing-actions">
            <button type="submit" className="nb2-amber" disabled={submitting || locationsLoading || Boolean(createdListingSlug)}>
              {submitting ? "Creating listing…" : createdListingSlug ? "Listing created" : "Publish listing"}
            </button>
            <Link href="/find-a-place">Cancel</Link>
          </div>
        </form>
      </section>
    </main>
  );
}

export default function ListPropertyPage() {
  return (
    <Suspense fallback={<div className="nb2-wrap p-8 text-center text-slate-500">Loading form...</div>}>
      <ListPropertyContent />
    </Suspense>
  );
}
