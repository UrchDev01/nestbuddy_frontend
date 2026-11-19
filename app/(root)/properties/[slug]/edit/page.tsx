"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  fetchCurrentProfile,
  fetchPropertyBySlug,
  fetchPropertyListingLocations,
  updatePropertyListing,
} from "@/utils/api";
import type { CreatePropertyPayload, PropertyLocationOption } from "@/utils/api";
import type { PropertyDetailProps } from "@/types";
import AuthGuard from "@/app/hoc/AuthGuard";
import VerificationGuard from "@/components/VerificationGuard";

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
  "Commercial Space",
  "Office Space",
  "Shop",
  "Warehouse",
  "Land",
  "Farm Land",
  "Industrial Land",
  "Estate",
  "Real Estate",
  "Hotel or Lodge",
  "Student Lodge",
  "Other",
];
const listingTypes = ["Rent", "Sale", "Lease", "Short Term"];
const rentalPeriods = ["Daily", "Weekly", "Monthly", "Quarterly", "Biannually", "Annually"];

interface PropertyForm {
  title: string;
  description: string;
  property_type: string;
  listing_type: string;
  price: string;
  rental_period: string;
  available_from: string;
  address: string;
  state: string;
  city: string;
  num_bedrooms: string;
  num_bathrooms: string;
  size_sqm: string;
  accepts_students: boolean;
  accepts_pets: boolean;
  is_furnished: boolean;
  parking_space: boolean;
  is_available: boolean;
}

const emptyForm: PropertyForm = {
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
  is_available: true,
};

function accountIdFromProfile(payload: unknown): number | null {
  if (typeof payload !== "object" || payload === null) return null;
  const root = payload as Record<string, unknown>;
  const data = typeof root.data === "object" && root.data !== null
    ? root.data as Record<string, unknown>
    : root;
  const account = typeof data.user === "object" && data.user !== null
    ? data.user as Record<string, unknown>
    : data;
  const id = Number(account.id);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function formFromProperty(property: PropertyDetailProps): PropertyForm {
  return {
    title: property.title,
    description: property.description,
    property_type: property.property_type,
    listing_type: property.listing_type,
    price: String(property.price),
    rental_period: property.rental_period || "Monthly",
    available_from: property.available_from?.slice(0, 10) || "",
    address: property.address,
    state: String(property.state),
    city: String(property.city),
    num_bedrooms: String(property.num_bedrooms),
    num_bathrooms: String(property.num_bathrooms),
    size_sqm: property.size_sqm === null ? "" : String(property.size_sqm),
    accepts_students: property.accepts_students,
    accepts_pets: property.accepts_pets,
    is_furnished: property.is_furnished,
    parking_space: property.parking_space,
    is_available: property.is_available,
  };
}

function EditPropertyContent() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [property, setProperty] = useState<PropertyDetailProps | null>(null);
  const [states, setStates] = useState<PropertyLocationOption[]>([]);
  const [cities, setCities] = useState<PropertyLocationOption[]>([]);
  const [form, setForm] = useState<PropertyForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [retry, setRetry] = useState(0);

  const availableCities = useMemo(
    () => cities.filter((city) => !form.state || String(city.state) === form.state),
    [cities, form.state],
  );

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [response, locations, currentProfile] = await Promise.all([
          fetchPropertyBySlug(slug),
          fetchPropertyListingLocations(),
          fetchCurrentProfile(),
        ]);
        if (!active) return;
        if (response?.status !== "success" || !response.data) {
          throw new Error("This property could not be loaded.");
        }

        const details = response.data as PropertyDetailProps;
        setProperty(details);
        const viewerId = accountIdFromProfile(currentProfile);
        if (viewerId === null) {
          throw new Error("We couldn't verify your account to edit this property.");
        }
        if (viewerId !== details.agent.id) {
          setAccessDenied(true);
          setError("Only the property owner can edit this listing.");
          return;
        }
        if (!Number.isFinite(Number(details.city)) || !Number.isFinite(Number(details.state))) {
          throw new Error("This listing is missing its location information.");
        }

        setStates(locations.states);
        setCities(locations.cities);
        setForm(formFromProperty(details));
      } catch (cause) {
        if (active) {
          setError(cause instanceof Error ? cause.message : "Unable to load this listing.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [retry, slug]);

  function updateForm<Key extends keyof PropertyForm>(key: Key, value: PropertyForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submitChanges(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!property) return;
    setSaving(true);
    setError(null);

    try {
      if (!form.state || !form.city) {
        throw new Error("Choose both a state and a city for this listing.");
      }

      const payload: CreatePropertyPayload = {
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
        is_available: form.is_available,
        address: form.address.trim(),
        city: Number(form.city),
        state: Number(form.state),
      };
      const result = await updatePropertyListing(property.slug, payload);
      router.push(`/properties/${result.slug}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update this listing.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="nb2-listing-page"><p role="status">Loading property details…</p></main>;
  }

  if (error || !property) {
    return (
      <main className="nb2-listing-page">
        <section className="nb2-listing-panel">
          <p className="nb2-kicker">Edit property</p>
          <h1>{accessDenied ? "Editing unavailable" : "Unable to edit this listing"}</h1>
          <p role="alert">{error || "This property could not be loaded."}</p>
          <div className="nb2-listing-actions">
            {!accessDenied && (
              <button type="button" className="nb2-amber" onClick={() => {
                setError(null);
                setLoading(true);
                setRetry((current) => current + 1);
              }}>
                Try again
              </button>
            )}
            <Link href={property ? `/properties/${property.slug}` : "/find-a-place"}>Back to property</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="nb2-listing-page">
      <section className="nb2-listing-panel">
        <p className="nb2-kicker">Manage your listing</p>
        <h1>Edit property</h1>
        <p>Update your property details and save the changes.</p>

        {error && <p className="nb2-listing-error" role="alert">{error}</p>}

        <form className="nb2-listing-form" onSubmit={submitChanges}>
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
                {listingTypes.map((type) => <option key={type}>{type}</option>)}
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
              <select required value={form.state} onChange={(event) => {
                updateForm("state", event.target.value);
                updateForm("city", "");
              }}>
                <option value="">Choose a state</option>
                {states.map((state) => <option key={state.id} value={state.id}>{state.name}</option>)}
              </select>
            </label>
            <label>
              City
              <select required value={form.city} disabled={!form.state} onChange={(event) => updateForm("city", event.target.value)}>
                <option value="">Choose a city</option>
                {availableCities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
              </select>
            </label>
            <label className="nb2-listing-full">
              Street address
              <input required maxLength={255} value={form.address} onChange={(event) => updateForm("address", event.target.value)} />
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
            <label><input type="checkbox" checked={form.is_available} onChange={(event) => updateForm("is_available", event.target.checked)} /> Listing available</label>
          </fieldset>

          <div className="nb2-listing-actions">
            <button type="submit" className="nb2-amber" disabled={saving}>
              {saving ? "Saving changes…" : "Save changes"}
            </button>
            <Link href={`/properties/${property.slug}`}>Cancel</Link>
          </div>
        </form>
      </section>
    </main>
  );
}

export default function EditPropertyPage() {
  return (
    <AuthGuard>
      <VerificationGuard>
        <EditPropertyContent />
      </VerificationGuard>
    </AuthGuard>
  );
}
