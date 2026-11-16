"use client";

import { PropertyFilter, PublicUserProfile } from "@/types";
import type { PropertyCardProps } from "@/types";
import { sessionFetch } from "@/utils/auth";

declare global {
    interface Window {
        __nestBuddySessionFetchInstalled?: boolean;
    }
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

/**
 * The pre-migration module contains many endpoint-specific fetch calls. Keep
 * them safe during the staged migration: API requests always use the Django
 * session cookie and legacy Bearer headers are discarded. New code should use
 * sessionFetch directly rather than relying on this bridge.
 */
if (typeof window !== "undefined" && apiBaseUrl && !window.__nestBuddySessionFetchInstalled) {
    const base = apiBaseUrl.replace(/\/$/, "");
    const legacyFetch = window.fetch.bind(window);
    window.fetch = (input: RequestInfo | URL, init: RequestInit = {}) => {
        const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        if (!url.startsWith(base)) return legacyFetch(input, init);
        const headers = new Headers(init.headers);
        headers.delete("Authorization");
        return sessionFetch(input, { ...init, headers });
    };
    window.__nestBuddySessionFetchInstalled = true;
}

export type IdentityVerificationStatus = "NOT_SUBMITTED" | "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED" | "RESUBMISSION_REQUIRED";
export interface IdentityVerificationResponse { status: IdentityVerificationStatus; submitted_at: string | null; reviewed_at: string | null; reason: string; access_allowed: boolean; }

export async function fetchIdentityVerificationStatus(): Promise<IdentityVerificationResponse> {
    const response = await sessionFetch(`${apiBaseUrl}/api/v1/identity-verification/status`);
    if (!response.ok) throw new Error("Unable to load identity verification status.");
    return response.json();
}

export async function submitIdentityVerification(data: FormData): Promise<IdentityVerificationResponse> {
    const response = await sessionFetch(`${apiBaseUrl}/api/v1/identity-verification/submit`, { method: "POST", body: data });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        const message = typeof result.detail === "string" ? result.detail : Object.values(result).flat().find((value) => typeof value === "string");
        throw new Error(typeof message === "string" ? message : "We couldn't submit your verification. Please try again.");
    }
    return result as IdentityVerificationResponse;
}

async function propertyApiError(response: Response, fallback: string): Promise<Error> {
    let payload: unknown;
    try {
        payload = await response.json();
    } catch {
        return new Error(fallback);
    }

    if (typeof payload !== "object" || payload === null) return new Error(fallback);
    const body = payload as Record<string, unknown>;
    const candidates: unknown[] = [body.detail, body.error, body.message, body.non_field_errors];
    for (const value of Object.values(body)) {
        if (Array.isArray(value)) candidates.push(...value);
        else candidates.push(value);
    }

    const message = candidates.find((value): value is string =>
        typeof value === "string" &&
        value.trim().length > 0 &&
        value.length <= 180 &&
        !/axioserror|network error|http error|internal server error|traceback|^\s*[{[]/i.test(value)
    );
    return new Error(message?.trim() || fallback);
}

interface HomepageApiResponse<T> {
    status?: string;
    message?: string;
    data: T;
}

interface HomepageReviewData {
    data: {
        results: {
            id: number;
            user_name: string;
            rating: number;
            title: string | null;
            comment: string;
            property: number;
        }[];
    };
}

export interface FeaturedRoommate {
    id: number | string;
    slug: string;
    main_profile?: {
        profile_image?: string | null;
        user_first_name?: string;
        user_last_name?: string;
        bio?: string | null;
    };
    demographic?: {
        age?: number | null;
        current_city_name?: string | null;
        state_of_residence_name?: string | null;
    };
    roommate_preferences?: {
        preferred_city_name?: string | null;
        seeking?: string | null;
    };
    user_type?: string | null;
    compatibility_score?: number | null;
}

export interface PropertyLocationOption {
    id: number;
    name: string;
    state?: number;
    state_name?: string;
}

export interface CreatePropertyPayload {
    title: string;
    description: string;
    property_type: string;
    listing_type: string;
    price: number;
    rental_period: string | null;
    available_from: string | null;
    accepts_students: boolean;
    accepts_pets: boolean;
    size_sqm: number | null;
    parking_space: boolean;
    num_bedrooms: number;
    num_bathrooms: number;
    is_furnished: boolean;
    is_available: boolean;
    address: string;
    city: number;
    state: number;
}

async function fetchHomepageResource<T>(
    path: string,
    resourceName: string,
): Promise<HomepageApiResponse<T>> {
    if (!apiBaseUrl) {
        throw new Error("The backend API URL is not configured. Set NEXT_PUBLIC_API_URL.");
    }

    const response = await fetch(`${apiBaseUrl.replace(/\/$/, "")}/api/v1/${path}`);
    let result: unknown;

    try {
        result = await response.json();
    } catch {
        if (!response.ok) {
            throw new Error(`${resourceName} could not be loaded (HTTP ${response.status}).`);
        }
        throw new Error(`${resourceName} returned an invalid response.`);
    }

    if (!response.ok) {
        const body = typeof result === "object" && result !== null
            ? result as Record<string, unknown>
            : null;
        const serverMessage = body?.message || body?.detail || body?.error;
        throw new Error(
            typeof serverMessage === "string" && serverMessage.trim()
                ? serverMessage
                : `${resourceName} could not be loaded (HTTP ${response.status}).`
        );
    }

    if (typeof result !== "object" || result === null || !("data" in result)) {
        throw new Error(`${resourceName} returned an invalid response.`);
    }

    const body = result as Record<string, unknown>;
    return {
        status: typeof body.status === "string" ? body.status : undefined,
        message: typeof body.message === "string" ? body.message : undefined,
        data: body.data as T,
    };
}

// Fetch Interests
export async function fetchInterests() {
    const url = `${apiBaseUrl}/api/v1/interests`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
                const result = await response.json();
                console.log("interests:", result)
            return result;
        } else {
            console.log("Error fetching interests");
        }
    } catch (error) {
        console.log(error);
    }
}

// Fetch Religions
export async function fetchReligions() {
    const url = `${apiBaseUrl}/api/v1/religions`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            console.log("Error fetching religions");
        }
    } catch (error) {
        console.log(error);
    }
}

// Fetch Tribe
export async function fetchTribes() {
    const url = `${apiBaseUrl}/api/v1/tribes`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            console.log("Error fetching tribes");
        }
    } catch (error) {
        console.log(error);
    }
}

// Fetch Featured Properties
export async function fetchFeaturedProperties() {
    return fetchHomepageResource<PropertyCardProps[]>("properties/featured", "Featured properties");
}

export async function fetchHomepageReviews() {
    return fetchHomepageResource<HomepageReviewData>("reviews/?page_size=4", "Homepage reviews");
}

export async function fetchPropertyListingLocations() {
    const [states, cities] = await Promise.all([
        fetchHomepageResource<PropertyLocationOption[]>("states", "States"),
        fetchHomepageResource<PropertyLocationOption[]>("cities", "Cities"),
    ]);

    if (!Array.isArray(states.data) || !Array.isArray(cities.data)) {
        throw new Error("The backend returned invalid state or city options.");
    }

    return { states: states.data, cities: cities.data };
}

export async function createPropertyListing(payload: CreatePropertyPayload) {
    if (!apiBaseUrl) {
        throw new Error("The backend API URL is not configured. Set NEXT_PUBLIC_API_URL.");
    }

    const response = await sessionFetch(`${apiBaseUrl.replace(/\/$/, "")}/api/v1/properties/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    let result: unknown;
    try {
        result = await response.json();
    } catch {
        if (!response.ok) {
            throw new Error(`The listing could not be created (HTTP ${response.status}).`);
        }
        throw new Error("The listing service returned an invalid response.");
    }

    if (!response.ok) {
        const body = typeof result === "object" && result !== null
            ? result as Record<string, unknown>
            : null;
        const detail = body?.detail || body?.message || body?.error;
        const fieldErrors = body
            ? Object.entries(body)
                .filter(([key]) => !["detail", "message", "error"].includes(key))
                .flatMap(([field, messages]) => {
                    if (typeof messages === "string") return [`${field}: ${messages}`];
                    if (Array.isArray(messages)) return messages.map((message) => `${field}: ${String(message)}`);
                    return [];
                })
                .join(" ")
            : "";
        const message = typeof detail === "string" && detail.trim() ? detail : fieldErrors;
        throw new Error(message || `The listing could not be created (HTTP ${response.status}).`);
    }

    if (
        typeof result !== "object" ||
        result === null ||
        !("id" in result) ||
        typeof result.id !== "number" ||
        !("slug" in result) ||
        typeof result.slug !== "string" ||
        !result.slug
    ) {
        throw new Error("The listing was submitted, but the server returned no property slug.");
    }

    return result as { id: number; slug: string };
}

// Fetch States
export async function fetchStates() {
    const url = `${apiBaseUrl}/api/v1/states`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            console.log("Error fetching states");
        }
    } catch (error) {
        console.log(error);
    }
}

// Fetch Cities
export async function fetchCities() {
    const url = `${apiBaseUrl}/api/v1/cities`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            console.log("Error fetching cities");
        }
    } catch (error) {
        console.log(error);
    }
}

// Fetch Schools
export async function fetchSchools() {
    const url = `${apiBaseUrl}/api/v1/schools`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            console.log("Error fetching schools");
        }
    } catch (error) {
        console.log(error);
    }
}

// Fetch Departments
export async function fetchDepartments() {
    const url = `${apiBaseUrl}/api/v1/departments`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            console.log("Error fetching departments");
        }
    } catch (error) {
        console.log(error);
    }
}

// Fetch Professions
export async function fetchProfessions() {
    const url = `${apiBaseUrl}/api/v1/professions`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            console.log("Error fetching professions");
        }
    } catch (error) {
        console.log(error);
    }
}

// Fetch Profiles
export async function fetchProfiles() {
    const url = `${apiBaseUrl}/api/v1/profiles`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            console.log("Error fetching profiles");
        }
    } catch (error) {
        console.log(error);
    }
}

// Fetch Profile Detail
export async function fetchProfileDetail(profileId: string) {
    const url = `${apiBaseUrl}/api/v1/profiles/${profileId}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            console.log(`Error fetching profile with ID: ${profileId}`);
        }
    } catch (error) {
        console.log(error);
    }
}

export interface PublicProfileResponse {
    status: "success";
    is_current_user: boolean;
    is_favorited?: boolean;
    data?: PublicUserProfile;
}

export async function fetchPublicProfile(profileSlug: string): Promise<PublicProfileResponse> {
    if (!apiBaseUrl) throw new Error("The profile service is not configured.");
    const accessToken = localStorage.getItem("access_token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (accessToken) headers.Authorization = "Bearer " + accessToken;
    const response = await fetch(
        `${apiBaseUrl.replace(/\/$/, "")}/api/v1/profiles/${encodeURIComponent(profileSlug)}/public`,
        {
            headers,
        },
    );

    if (response.status === 404) {
        throw Object.assign(new Error("Profile not found"), { status: 404 });
    }
    if (!response.ok) {
        throw Object.assign(new Error("Unable to load this profile right now."), { status: response.status });
    }

    const result: unknown = await response.json();
    if (typeof result !== "object" || result === null || !("status" in result)) {
        throw new Error("The profile service returned an invalid response.");
    }

    const payload = result as PublicProfileResponse;
    if (payload.status !== "success" || typeof payload.is_current_user !== "boolean") {
        throw new Error("The profile service returned an invalid response.");
    }
    return payload;
}

// Update Profile
export async function updateProfile(profileId: string | number, data: FormData) {
    const url = `${apiBaseUrl}/api/v1/profiles/${profileId}/`;
    const access_token = localStorage.getItem('access_token');

    try {
        const response = await fetch(url, {
            method: "PATCH",
            headers: {
                'Authorization': `Bearer ${access_token}`,
            },
            body: data,
        });

        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            const errorData = await response.json().catch(() => null);
            return errorData;
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// Update Profile Section
export async function updateProfileSection(section: string, data: FormData) {
    const url = `${apiBaseUrl}/api/v1/profiles/update_section`;
    const access_token = localStorage.getItem('access_token');

    try {
        const response = await fetch(url, {
            method: "PATCH",
            headers: {
                'Authorization': `Bearer ${access_token}`,
            },
            body: data,

        });

        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            const errorData = await response.json();
            return errorData;
            
        }
    } catch (error) {
        console.log(error);
        
    }
}


// Delete Profile
export async function deleteProfile(profileId: string) {
    const url = `${apiBaseUrl}/api/v1/profiles/${profileId}`;

    try {
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            console.log(`Profile with ID: ${profileId} deleted successfully`);
            return true;
        } else {
            console.log(`Error deleting profile with ID: ${profileId}`);
        }
    } catch (error) {
        console.log(error);
    }
}


// Fetch Current Profile Detail
export async function fetchCurrentProfile() {
        const url = `${apiBaseUrl}/api/v1/profiles/my_profile`;
        const access_token = localStorage.getItem('access_token')
    
        try {
            const response = await fetch(url, {
                method: "GET",
                    headers: {
                     'Authorization': `Bearer ${access_token}`,
                    "Content-Type": "application/json",
                },
            });
    
            if (response.ok) {
                const result = await response.json();
                return result;
            } else {
                console.log(`Error fetching current user profile`);
            }
        } catch (error) {
            console.log(error);
        }
    }



// Fetch Current Student Profile Detail
export async function fetchCurrentStudentProfile() {
    const url = `${apiBaseUrl}/api/v1/student-profile/current`;
    const access_token = localStorage.getItem('access_token')

    try {
        const response = await fetch(url, {
            method: "GET",
                headers: {
                 'Authorization': `Bearer ${access_token}`,
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            console.log(`Error fetching current user student profile`);
        }
    } catch (error) {
        console.log(error);
    }
}


// Fetch Current Working Class Profile Detail
export async function fetchCurrentWorkingClassProfile() {
    const url = `${apiBaseUrl}/api/v1/working-profile/current`;
    const access_token = localStorage.getItem('access_token')

    try {
        const response = await fetch(url, {
            method: "GET",
                headers: {
                 'Authorization': `Bearer ${access_token}`,
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            console.log(`Error fetching current user Working Class profile`);
        }
    } catch (error) {
        console.log(error);
    }
}



// Update student Profile
export async function updateStudentProfile(profileID:any, profileData: any) {
    const url = `${apiBaseUrl}/api/v1/student-profile/${profileID}`;
    const access_token = localStorage.getItem('access_token')

try {
    const response = await fetch(url, {
        method: "PUT",
        body: profileData,
        headers: {
                'Authorization': `Bearer ${access_token}`,
            
        },
        
    });

    if (response.ok) {
        const result = await response.json();
        return result;
    } else {
        console.log(`Error updating current student-profile profile with ${profileID}`);
    }
} catch (error) {
    console.log(error);
}
}



// Update Working Class Profile
export async function updateWorkingClassProfile(profileID:any, profileData: any) {
    const url = `${apiBaseUrl}/api/v1/working-class-profile/${profileID}`;
    const access_token = localStorage.getItem('access_token')

try {
    const response = await fetch(url, {
        method: "PUT",
        body: profileData,
        headers: {
                'Authorization': `Bearer ${access_token}`,
            
        },
        
    });

    if (response.ok) {
        const result = await response.json();
        return result;
    } else {
        console.log(`Error updating current working-class-profile profile with ${profileID}`);
    }
} catch (error) {
    console.log(error);
}
}



// Fetch Quiz Questions
export async function fetchQuizQuestions() {
    const url = `${apiBaseUrl}/api/v1/quiz-questions`;
    const access_token = localStorage.getItem('access_token');

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${access_token}`,
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const result = await response.json();
            console.log("quiz questions:", result)
            return result;
        } else {
            console.log("Error fetching quiz questions");
        }
    } catch (error) {
        console.log(error);
    }
}

// Fetch Quiz Options
export async function fetchQuizOptions(questionId?: string) {
    let url = `${apiBaseUrl}/api/v1/quiz-options`;
    if (questionId) {
        url += `?question_id=${questionId}`;
    }
    const access_token = localStorage.getItem('access_token');

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${access_token}`,
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            console.log("Error fetching quiz options");
        }
    } catch (error) {
        console.log(error);
    }
}

// Fetch Quiz Answers
export async function fetchQuizAnswers() {
    const url = `${apiBaseUrl}/api/v1/quiz-answers`;
    const access_token = localStorage.getItem('access_token');

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${access_token}`,
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            console.log("Error fetching quiz answers");
        }
    } catch (error) {
        console.log(error);
    }
}

// Save Quiz Answer
export async function saveQuizAnswer(answerData: any) {
    const url = `${apiBaseUrl}/api/v1/quiz-answers`;
    const access_token = localStorage.getItem('access_token');

    try {
        const response = await fetch(url, {
            method: "POST",
            body: JSON.stringify(answerData),
            headers: {
                'Authorization': `Bearer ${access_token}`,
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            console.log("Error saving quiz answer");
        }
    } catch (error) {
        console.log(error);
    }
}

// Bulk Save Quiz Answers
export async function bulkSaveQuizAnswers(answers: any[]) {
    const url = `${apiBaseUrl}/api/v1/quiz-answers/bulk_save`;
    const access_token = localStorage.getItem('access_token');

    try {
        const response = await fetch(url, {
            method: "POST",
            body: JSON.stringify({ answers }),
            headers: {
                'Authorization': `Bearer ${access_token}`,
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            console.log("Error bulk saving quiz answers");
        }
    } catch (error) {
        console.log(error);
    }
}

// Fetch Potential Roommate Matches
export async function fetchPotentialMatches(
    page: number = 1, 
    pageSize: number = 12,
    filters?: {
        search_name?: string;
        city?: string;
        preferred_city?: string;
        school?: string;
        department?: string;
        min_budget?: string;
        max_budget?: string;
        preferred_age_min?: string;
        preferred_age_max?: string;
        seeking?: string;
        preferred_tribe?: string;
        preferred_gender?: string;
        preferred_religion?: string;
        max_roommates?: string;
        interests?: string[];
        user_type?: string;
        level?: string;
        profession?: string;
        state_of_origin?: string;
        min_compatibility?: string;
    },
    signal?: AbortSignal,
) {
    if (!apiBaseUrl) {
        throw new Error("The backend API URL is not configured.");
    }

    const queryParams = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
    });
    Object.entries(filters ?? {}).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            const items = value.map((item) => item.trim()).filter(Boolean);
            if (items.length) queryParams.set(key, items.join(","));
        } else if (typeof value === "string" && value.trim()) {
            queryParams.set(key, value.trim());
        }
    });
    const url = `${apiBaseUrl.replace(/\/$/, "")}/api/v1/roommate-matching/potential_matches?${queryParams.toString()}`;
    const access_token = localStorage.getItem('access_token');

    const response = await fetch(url, {
        method: "GET",
        headers: {
            ...(access_token ? { Authorization: `Bearer ${access_token}` } : {}),
            "Content-Type": "application/json",
        },
        signal,
    });
    let result: unknown;
    try {
        result = await response.json();
    } catch {
        throw new Error(response.ok
            ? "The roommate service returned an unreadable response."
            : `Unable to load roommate matches (HTTP ${response.status}).`);
    }
    if (!response.ok) {
        const body = typeof result === "object" && result !== null
            ? result as Record<string, unknown>
            : null;
        const serverMessage = body?.message || body?.detail || body?.error;
        const error = new Error(
            typeof serverMessage === "string" && serverMessage.trim()
                ? serverMessage
                : `Unable to load roommate matches (HTTP ${response.status}).`,
        );
        Object.assign(error, { status: response.status });
        throw error;
    }
    return result;
}

export async function requestManualMatchRefresh(): Promise<{
    matching_status: "pending" | "processing";
    retry_after: number;
}> {
    if (!apiBaseUrl) {
        throw new Error("The backend API URL is not configured.");
    }

    const accessToken = localStorage.getItem("access_token");
    const response = await fetch(
        apiBaseUrl.replace(/\/$/, "") + "/api/v1/roommate-matching/refresh_matches",
        {
            method: "POST",
            headers: {
                ...(accessToken ? { Authorization: "Bearer " + accessToken } : {}),
                "Content-Type": "application/json",
            },
        },
    );

    let payload: unknown;
    try {
        payload = await response.json();
    } catch {
        throw new Error("The matching service returned an unreadable response.");
    }
    if (typeof payload !== "object" || payload === null) {
        throw new Error("The matching service returned an invalid response.");
    }

    const body = payload as Record<string, unknown>;
    if (!response.ok) {
        const error = new Error(
            typeof body.message === "string"
                ? body.message
                : "We couldn't refresh your roommate matches.",
        );
        Object.assign(error, {
            status: response.status,
            retryAfter: typeof body.retry_after === "number" ? body.retry_after : null,
        });
        throw error;
    }

    return {
        matching_status: body.matching_status === "processing" ? "processing" : "pending",
        retry_after: typeof body.retry_after === "number" ? body.retry_after : 0,
    };
}

export interface RoommateFilterOptions {
    states: { id: number; name: string }[];
    cities: { id: number; name: string }[];
    schools: { id: number; name: string }[];
    departments: { id: number; name: string }[];
    religions: { id: number; name: string }[];
    interests: { id: number; interest: string }[];
    tribes: { id: number; name: string }[];
}

export async function fetchRoommateFilterOptions(): Promise<{
    options: Partial<RoommateFilterOptions>;
    failed: string[];
}> {
    if (!apiBaseUrl) throw new Error("The backend API URL is not configured.");

    const resources = [
        ["states", "states"],
        ["cities", "cities"],
        ["schools", "schools"],
        ["departments", "departments"],
        ["religions", "religions"],
        ["interests", "interests"],
        ["tribes", "tribes"],
    ] as const;
    const results = await Promise.allSettled(resources.map(async ([key, path]) => {
        const response = await fetch(`${apiBaseUrl.replace(/\/$/, "")}/api/v1/${path}`);
        if (!response.ok) throw new Error(`${path} returned HTTP ${response.status}`);
        const body: unknown = await response.json();
        if (typeof body !== "object" || body === null) throw new Error(`${path} response was invalid`);
        const data = (body as { data?: unknown }).data;
        if (!Array.isArray(data)) throw new Error(`${path} response did not contain a list`);
        return [key, data] as const;
    }));

    const options: Partial<RoommateFilterOptions> = {};
    const failed: string[] = [];
    results.forEach((result, index) => {
        if (result.status === "fulfilled") {
            const [key, value] = result.value;
            options[key] = value as never;
        } else {
            failed.push(resources[index][0]);
            console.error(`Unable to load roommate filter options: ${resources[index][0]}`, result.reason);
        }
    });
    return { options, failed };
}

// Fetch Featured Roommates
export async function fetchFeaturedRoommates() {
    return fetchHomepageResource<FeaturedRoommate[]>("featured-roommates/", "Featured roommates");
}

// Fetch Compatibility Details with a Specific User
export async function fetchCompatibilityDetails(userSlug: string) {
    const url = `${apiBaseUrl}/api/v1/roommate-matching/${encodeURIComponent(userSlug)}/compatibility_details`;
    const access_token = localStorage.getItem('access_token');

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${access_token}`,
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            console.error(`Error fetching compatibility details for roommate slug: ${userSlug}`);
            throw new Error('Failed to fetch compatibility details');
        }
    } catch (error) {
        console.error('Compatibility details error:', error);
        throw error;
    }
}

export async function requestCompatibilityAnalysis(userSlug: string, forceRegenerate = false) {
    if (!apiBaseUrl) throw new Error("The compatibility service is not configured.");
    const accessToken = localStorage.getItem("access_token");
    const response = await fetch(
        `${apiBaseUrl.replace(/\/$/, "")}/api/v1/roommate-matching/${encodeURIComponent(userSlug)}/request_analysis`,
        {
            method: "POST",
            body: JSON.stringify(forceRegenerate ? { force_regenerate: true } : {}),
            headers: {
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                "Content-Type": "application/json",
            },
        },
    );

    let payload: unknown;
    try {
        payload = await response.json();
    } catch {
        throw new Error("The analysis service returned an unreadable response.");
    }

    if (typeof payload !== "object" || payload === null) {
        throw new Error("The analysis service returned an invalid response.");
    }

    const body = payload as Record<string, unknown>;
    if (!response.ok) {
        const error = new Error(
            typeof body.message === "string"
                ? body.message
                : "We couldn't generate the compatibility analysis.",
        );
        Object.assign(error, {
            status: response.status,
            retryable: body.retryable === true || response.status === 429,
            retryAfter: typeof body.retry_after === "number"
                ? body.retry_after
                : Number(response.headers.get("Retry-After")) || null,
            errorCode: typeof body.error_code === "string" ? body.error_code : null,
        });
        throw error;
    }

    return body as {
        analysis_status: "pending" | "processing" | "completed";
        data: { analysis_text: string; generated_at?: string } | null;
    };
}

// Fetch Properties
export async function fetchProperties(
    page: number = 1,
    pageSize: number = 5,
    filters?: PropertyFilter,
) {
    let url = `${apiBaseUrl}/api/v1/properties/?page=${page}&page_size=${pageSize}`;

    // Add filters if they exist
    if (filters) {
        const queryParams = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                if (key === 'ordering') {
                    // Handle ordering separately since it's a query parameter
                    queryParams.append(key, value.toString());
                } else {
                    queryParams.append(key, value.toString());
                }
            }
        });
        
        const queryString = queryParams.toString();
        if (queryString) {
            url += `&${queryString}`;
        }
    }
    
    try {
        const response = await sessionFetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        
        if (!response.ok) {
            throw await propertyApiError(response, "Properties couldn't be loaded right now.");
        }
        
        const data = await response.json();
        return data; // Return the raw response from the backend
    } catch (error) {
        console.error("Error fetching properties:", error);
        throw error;
    }
}

// Fetch single property by ID
export async function fetchPropertyBySlug(propertySlug: string) {
    const url = `${apiBaseUrl}/api/v1/properties/${encodeURIComponent(propertySlug)}/`;
    try {
        const response = await sessionFetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        
        if (!response.ok) {
            throw await propertyApiError(response, "This property could not be loaded right now.");
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error(`Error fetching property slug ${propertySlug}:`, error);
        throw error;
    }
}

export async function fetchPropertyById(propertyId: number) {
    return fetchPropertyBySlug(String(propertyId));
}

// Fetch States, Cities, Amenities for filters
export async function fetchPropertyFilterOptions() {
    const statesUrl = `${apiBaseUrl}/api/v1/states`;
    const citiesUrl = `${apiBaseUrl}/api/v1/cities`;
    const amenitiesUrl = `${apiBaseUrl}/api/v1/amenities`;
    
    try {
        const [statesResponse, citiesResponse, amenitiesResponse] = await Promise.all([
            fetch(statesUrl),
            fetch(citiesUrl),
            fetch(amenitiesUrl),
        ]);
        
        const [states, cities, amenities] = await Promise.all([
            statesResponse.json(),
            citiesResponse.json(),
            amenitiesResponse.json(),
        ]);
        
        return {
            states: states.data || [],
            cities: cities.data || [],
            amenities: amenities.data || [],
        };
    } catch (error) {
        console.error("Error fetching filter options:", error);
        throw error;
    }
}

// Fetch favorite properties
export async function fetchFavoriteProperties(page: number = 1, pageSize: number = 10) {
    if (!apiBaseUrl) throw new Error("The API URL is not configured.");
    const url = `${apiBaseUrl.replace(/\/$/, "")}/api/v1/favorites/properties/?page=${page}&page_size=${pageSize}`;
    const access_token = localStorage.getItem('access_token');
    
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                ...(access_token ? { 'Authorization': `Bearer ${access_token}` } : {}),
                "Content-Type": "application/json",
            },
        });
        
        if (!response.ok) {
            throw await propertyApiError(response, "Saved properties couldn't be loaded right now.");
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error fetching favorite properties:", error);
        throw error;
    }
}

// Fetch user's favorites (alias for backward compatibility)
export async function fetchFavorites(page: number = 1, pageSize: number = 10) {
    return fetchFavoriteProperties(page, pageSize);
}

// Fetch favorite roommates
export async function fetchFavoriteRoommates(page: number = 1, pageSize: number = 10) {
    if (!apiBaseUrl) throw new Error("The API URL is not configured.");
    const url = `${apiBaseUrl.replace(/\/$/, "")}/api/v1/favorites/roommates/?page=${page}&page_size=${pageSize}`;
    const access_token = localStorage.getItem('access_token');

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                ...(access_token ? { 'Authorization': `Bearer ${access_token}` } : {}),
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || "Saved roommates couldn't be loaded right now.");
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error fetching favorite roommates:", error);
        throw error;
    }
}

// Remove a property favorite
export async function removeFavoriteProperty(propertyId: number) {
    return toggleFavorite(propertyId);
}

// Remove a roommate favorite
export async function removeFavoriteRoommate(userId: number) {
    return removeFavorite(userId);
}

// Toggle favorite status for a property
export async function toggleFavorite(propertyId: number) {
    const url = `${apiBaseUrl}/api/v1/favorites/toggle/`;
    const access_token = localStorage.getItem('access_token');
    
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${access_token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ property: propertyId }),
        });
        
        if (!response.ok) {
            throw await propertyApiError(response, "We couldn't update your saved properties. Please try again.");
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error toggling favorite:", error);
        throw error;
    }
}

// Check if a property is favorited
export async function checkIsFavorited(propertyId: number) {
    const url = `${apiBaseUrl}/api/v1/favorites/is_favorited/?property=${propertyId}`;
    const access_token = localStorage.getItem('access_token');
    
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${access_token}`,
                "Content-Type": "application/json",
            },
        });
        
        if (!response.ok) {
            throw await propertyApiError(response, "We couldn't check whether this property is saved.");
        }
        
        const result = await response.json();
        return result.is_favorited;
    } catch (error) {
        console.error("Error checking favorite status:", error);
        throw error;
    }
}

// Questions & Answers API endpoints
export async function fetchPropertyQuestions(propertyId: number, page: number = 1, pageSize: number = 5) {
    const url = `${apiBaseUrl}/api/v1/questions?property=${propertyId}&page=${page}&page_size=${pageSize}`;
    const access_token = localStorage.getItem('access_token');
    
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                ...(access_token ? { 'Authorization': `Bearer ${access_token}` } : {}),
                "Content-Type": "application/json",
            },
        });
        
        if (!response.ok) {
            throw await propertyApiError(response, "Questions couldn't be loaded right now.");
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error fetching property questions:", error);
        throw error;
    }
}

export async function postPropertyQuestion(propertyId: number, question: string) {
    const url = `${apiBaseUrl}/api/v1/questions/`;
    const access_token = localStorage.getItem('access_token');
    
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${access_token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                property: propertyId,
                question: question
            }),
        });
        
        if (!response.ok) {
            throw await propertyApiError(response, "We couldn't send your question right now. Please try again.");
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error posting property question:", error);
        throw error;
    }
}

export async function deletePropertyQuestion(questionId: number) {
	const url = `${apiBaseUrl}/api/v1/questions/${questionId}/`;
	const access_token = localStorage.getItem('access_token');

	try {
		const response = await fetch(url, {
			method: "DELETE",
			headers: {
				'Authorization': `Bearer ${access_token}`,
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) throw await propertyApiError(response, "This question couldn't be deleted.");

		// Many DELETE endpoints return 204 No Content
		if (response.status === 204) {
			return true;
		}

		try {
			const result = await response.json();
			return result;
		} catch (_) {
			return true;
		}
	} catch (error) {
		console.error("Error deleting property question:", error);
		throw error;
	}
}

export async function updatePropertyQuestion(
	questionId: number,
	payload: { question?: string; property?: number }
) {
	const url = `${apiBaseUrl}/api/v1/questions/${questionId}/`;
	const access_token = localStorage.getItem('access_token');

	try {
		const response = await fetch(url, {
			method: "PUT",
			headers: {
				'Authorization': `Bearer ${access_token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) throw await propertyApiError(response, "This question couldn't be updated.");
        

		const result = await response.json();
		return result;
	} catch (error) {
		console.error("Error updating property question:", error);
		throw error;
	}
}

// Property Delete Question

// Property Update Question

// Property Question Answer (for agents)
export async function answerPropertyQuestion(questionId: number, answer: string) {
	const url = `${apiBaseUrl}/api/v1/questions/${questionId}/answer/`;
	const access_token = localStorage.getItem('access_token');

	try {
		const response = await fetch(url, {
			method: "POST",
			headers: {
				'Authorization': `Bearer ${access_token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				answer: answer
			}),
		});

		if (!response.ok) {
			throw await propertyApiError(response, "We couldn't submit your answer right now. Please try again.");
		}

		const result = await response.json();
		return result;
	} catch (error) {
		console.error("Error answering property question:", error);
		throw error;
	}
}

// Property Question Edit Answer (for agents)
export async function editPropertyQuestionAnswer(questionId: number, answer: string) {
	const url = `${apiBaseUrl}/api/v1/questions/${questionId}/edit_answer/`;
	const access_token = localStorage.getItem('access_token');

	try {
		const response = await fetch(url, {
			method: "PUT",
			headers: {
				'Authorization': `Bearer ${access_token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				answer: answer
			}),
		});

				if (!response.ok) {
					throw await propertyApiError(response, "We couldn't update your answer right now. Please try again.");
		}
        

		const result = await response.json();
		return result;
	} catch (error) {
		console.error("Error editing property question answer:", error);
		throw error;
	}
}

// Property Reviews API endpoints
export async function fetchPropertyReviews(propertyId: number, page: number = 1, pageSize: number = 5) {
    const url = `${apiBaseUrl}/api/v1/reviews?property=${propertyId}&page=${page}&page_size=${pageSize}`;
    const access_token = localStorage.getItem('access_token');
    
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                ...(access_token ? { 'Authorization': `Bearer ${access_token}` } : {}),
                "Content-Type": "application/json",
            },
        });
        
        if (!response.ok) {
            throw await propertyApiError(response, "Reviews couldn't be loaded right now.");
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error fetching property reviews:", error);
        throw error;
    }
}

export async function deletePropertyReview(reviewId: number) {
	const url = `${apiBaseUrl}/api/v1/reviews/${reviewId}/`;
	const access_token = localStorage.getItem('access_token');

	try {
		const response = await fetch(url, {
			method: "DELETE",
			headers: {
				'Authorization': `Bearer ${access_token}`,
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) throw await propertyApiError(response, "This review couldn't be deleted.");

		// Many DELETE endpoints return 204 No Content
		if (response.status === 204) {
			return true;
		}

		try {
			const result = await response.json();
			return result;
		} catch (_) {
			return true;
		}
	} catch (error) {
		console.error("Error deleting property review:", error);
		throw error;
	}
}

export async function editPropertyReview(reviewId: number, reviewData: {
    rating: number;
    title?: string;
    comment: string;
}) {
    const url = `${apiBaseUrl}/api/v1/reviews/${reviewId}/`;
    const access_token = localStorage.getItem('access_token');

	try {
		const response = await fetch(url, {
			method: "PUT",
			headers: {
				'Authorization': `Bearer ${access_token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(reviewData),
		});

		if (!response.ok) throw await propertyApiError(response, "This review couldn't be updated.");
        

		const result = await response.json();
		return result;
	} catch (error) {
		console.error("Error editing property question answer:", error);
		throw error;
	}
}

export async function postPropertyReview(propertyId: number, reviewData: {
    rating: number;
    title?: string;
    comment: string;
}) {
    const url = `${apiBaseUrl}/api/v1/reviews/`;
    const access_token = localStorage.getItem('access_token');
    
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${access_token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                property: propertyId,
                ...reviewData
            }),
        });
        
        if (!response.ok) {
            throw await propertyApiError(response, "We couldn't submit your review. Please try again.");
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error posting property review:", error);
        throw error;
    }
}

// Property Viewing Requests and Edit
export async function schedulePropertyViewing(propertyId: number, viewingData: {
    preferred_date: string;
    preferred_time: string;
    alternate_date?: string;
    alternate_time?: string;
    notes?: string;
}, viewingId?: number) {
    const url = viewingId 
        ? `${apiBaseUrl}/api/v1/viewings/${viewingId}/` 
        : `${apiBaseUrl}/api/v1/viewings/`;
    const access_token = localStorage.getItem('access_token');
    
    try {
        const response = await fetch(url, {
            method: viewingId ? "PUT" : "POST",
            headers: {
                'Authorization': `Bearer ${access_token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                property: propertyId,
                ...viewingData
            }),
        });
        
        if (!response.ok) {
            throw await propertyApiError(response, "We couldn't submit your viewing request. Please try again.");
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error(viewingId ? "Error updating property viewing:" : "Error scheduling property viewing:", error);
        throw error;
    }
}

// Function to cancel a property viewing
export async function cancelPropertyViewing(propertyId: number, viewingId: number) {
    const url = `${apiBaseUrl}/api/v1/viewings/${viewingId}/`;
    const access_token = localStorage.getItem('access_token');
    
    try {
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${access_token}`,
                "Content-Type": "application/json",
            },
        });
        
        if (!response.ok) {
            throw await propertyApiError(response, "We couldn't cancel this viewing request. Please try again.");
        }
        
        // Return true for successful deletion (status 204)
        return response.status === 204;
    } catch (error) {
        console.error("Error cancelling property viewing:", error);
        throw error;
    }
}

export async function updateViewingStatus(viewingId: number, status: 'requested' | 'confirmed' | 'cancelled' | 'completed') {
    const url = `${apiBaseUrl}/api/v1/viewings/${viewingId}/update_status/`;
    const access_token = localStorage.getItem('access_token');
    
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${access_token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status })
        });
        
        if (!response.ok) {
            throw await propertyApiError(response, "We couldn't update this viewing request. Please try again.");
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error updating viewing status:", error);
        throw error;
    }
}





//Get Current User Property Viewing Requests
export async function getUserPropertyViewings(
    propertyId: number, 
    { as_owner, page = 1 }: { as_owner?: boolean; page?: number } = {}
) {
    const url = `${apiBaseUrl}/api/v1/viewings/?property=${propertyId}${as_owner ? '&as_owner=true' : ''}&page=${page}`;
    const access_token = localStorage.getItem('access_token');

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${access_token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw await propertyApiError(response, "Viewing requests couldn't be loaded right now.");
        }

        const result = await response.json();
        return {
            ...result,
            data: {
                ...result.data,
                currentPage: page
            }
        };
    } catch (error) {
        console.error("Error fetching user property viewings:", error);
        throw error;
    }
}




// Property Bookings
export async function createPropertyBooking(propertyId: number, bookingData: {
    start_date: string;
    end_date: string;
    notes?: string;
}) {
    const url = `${apiBaseUrl}/api/v1/bookings/`;
    const access_token = localStorage.getItem('access_token');
    
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${access_token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                property: propertyId,
                ...bookingData
            }),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error creating property booking:", error);
        throw error;
    }
}

// Fetch Property Bookings with filters
export async function fetchPropertyBookings(
    page: number = 1,
    pageSize: number = 10,
    filters?: {
        property?: number;
        status?: 'pending' | 'approved' | 'active' | 'completed' | 'cancelled' | 'rejected';
        as_owner?: boolean;
    }
) {
    let url = `${apiBaseUrl}/api/v1/bookings/?page=${page}&page_size=${pageSize}`;
    
    if (filters) {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value.toString());
            }
        });
        const queryString = queryParams.toString();
        if (queryString) {
            url += `&${queryString}`;
        }
    }

    const access_token = localStorage.getItem('access_token');
    
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${access_token}`,
                "Content-Type": "application/json",
            },
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error fetching property bookings:", error);
        throw error;
    }
}

// Roommate Favorites API

// Add a user to favorites
export async function addFavorite(userId: number) {
    const url = `${apiBaseUrl}/api/v1/favorites/add_favorite`;
    const access_token = localStorage.getItem('access_token');

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${access_token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: userId }),
        });

        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error adding favorite");
        }
    } catch (error) {
        console.error("Error adding favorite:", error);
        throw error;
    }
}

// Remove a user from favorites
export async function removeFavorite(userId: number) {
    const url = `${apiBaseUrl}/api/v1/favorites/remove_favorite`;
    const access_token = localStorage.getItem('access_token');

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${access_token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: userId }),
        });

        if (response.ok) {
            const result = await response.json();
            return result;
        } else if (response.status === 404) {
            throw new Error("Favorite not found");
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error removing favorite");
        }
    } catch (error) {
        console.error("Error removing favorite:", error);
        throw error;
    }
}

// Get user's favorite list
export async function getMyFavorites(page: number = 1, pageSize: number = 10) {
    let url = `${apiBaseUrl}/api/v1/favorites/my_favorites?page=${page}&page_size=${pageSize}`;
    const access_token = localStorage.getItem('access_token');

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${access_token}`,
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            console.error("Error fetching favorites");
            throw new Error("Failed to fetch favorites");
        }
    } catch (error) {
        console.error("Error fetching favorites:", error);
        throw error;
    }
}

// Check if a specific user is favorited
export async function checkIsFavoritedUser(userId: number) {
    const url = `${apiBaseUrl}/api/v1/favorites/is_favorited?user_id=${userId}`;
    const access_token = localStorage.getItem('access_token');

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${access_token}`,
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const result = await response.json();
            return result.is_favorited === true;
        } else {
            console.error("Error checking favorite status");
            return false;
        }
    } catch (error) {
        console.error("Error checking favorite status:", error);
        return false;
    }
}

// Fetch Active Sessions
export async function fetchActiveSessions() {
    const url = `${apiBaseUrl}/api/v1/auth/sessions/`;
    const access_token = localStorage.getItem('access_token');

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${access_token}`,
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || "Failed to fetch active sessions");
        }
    } catch (error) {
        console.error("Error fetching active sessions:", error);
        throw error;
    }
}

// Revoke a specific session
export async function revokeSession(sessionId: string) {
    const url = `${apiBaseUrl}/api/v1/auth/sessions/${sessionId}/`;
    const access_token = localStorage.getItem('access_token');

    try {
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${access_token}`,
                "Content-Type": "application/json",
            },
        });

        const result = await response.json().catch(() => ({}));
        if (response.ok) {
            return result;
        } else {
            throw new Error(result.message || "Failed to sign out session");
        }
    } catch (error) {
        console.error("Error revoking session:", error);
        throw error;
    }
}

// Revoke all other sessions
export async function revokeOtherSessions() {
    const url = `${apiBaseUrl}/api/v1/auth/sessions/revoke-others/`;
    const access_token = localStorage.getItem('access_token');

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${access_token}`,
                "Content-Type": "application/json",
            },
        });

        const result = await response.json().catch(() => ({}));
        if (response.ok) {
            return result;
        } else {
            throw new Error(result.message || "Failed to sign out all other sessions");
        }
    } catch (error) {
        console.error("Error revoking other sessions:", error);
        throw error;
    }
}
