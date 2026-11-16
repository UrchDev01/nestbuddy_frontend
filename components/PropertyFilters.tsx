"use client";

import React, { useEffect, useState } from "react";
import { FaFilter, FaBed, FaBath, FaBuilding, FaChevronDown, FaListUl } from "react-icons/fa";
import { MdDateRange, MdAttachMoney, MdLocationOn, MdHomeWork, MdSchedule } from "react-icons/md";
import { BiSolidCategory } from "react-icons/bi";
import Select from "react-select";
import useDebounce from "@/hooks/useDebounce";
import { fetchPropertyFilterOptions } from "@/utils/api";
import { PropertyFilter } from "@/types";
import { propertyTypeOptions, listingTypeOptions, rentalPeriodOptions, propertyStatusOptions } from "@/utils/options";

interface Option {
        value: string;
        label: string;
}

interface PropertyFiltersProps {
        onFilterChange: (filters: PropertyFilter) => void;
        initialFilters?: PropertyFilter;
        totalProperties: number;
}

const PropertyFilters: React.FC<PropertyFiltersProps> = ({
        onFilterChange,
        initialFilters = {},
        totalProperties,
}) => {
        // Add isInitialRender ref
        const isInitialRender = React.useRef(true);

        // Filter states
        const [minPrice, setMinPrice] = useState(initialFilters.min_price || "");
        const [maxPrice, setMaxPrice] = useState(initialFilters.max_price || "");
        const [minBedrooms, setMinBedrooms] = useState(initialFilters.min_bedrooms || "");
        const [maxBedrooms, setMaxBedrooms] = useState(initialFilters.max_bedrooms || "");
        const [minBathrooms, setMinBathrooms] = useState(initialFilters.min_bathrooms || "");
        const [maxBathrooms, setMaxBathrooms] = useState(initialFilters.max_bathrooms || "");
        const [propertyType, setPropertyType] = useState<Option | null>(
                initialFilters.property_type
                        ? { value: initialFilters.property_type, label: initialFilters.property_type }
                        : null
        );
        const [listingType, setListingType] = useState<Option | null>(
                initialFilters.listing_type
                        ? { value: initialFilters.listing_type, label: initialFilters.listing_type }
                        : null
        );
        const [state, setState] = useState<Option | null>(
                initialFilters.state
                        ? { value: initialFilters.state, label: initialFilters.state }
                        : null
        );
        const [city, setCity] = useState<Option | null>(
                initialFilters.city
                        ? { value: initialFilters.city, label: initialFilters.city }
                        : null
        );
        const [selectedAmenities, setSelectedAmenities] = useState<Option[]>(
                initialFilters.amenities
                        ? initialFilters.amenities.split(',').map(id => ({ value: id, label: id }))
                        : []
        );
        const [acceptsPets, setAcceptsPets] = useState<boolean | null>(
                initialFilters.accepts_pets === undefined ? null : initialFilters.accepts_pets
        );
        const [acceptsStudents, setAcceptsStudents] = useState<boolean | null>(
                initialFilters.accepts_students === undefined ? null : initialFilters.accepts_students
        );
        const [isFurnished, setIsFurnished] = useState<boolean | null>(
                initialFilters.is_furnished === undefined ? null : initialFilters.is_furnished
        );

        const [availableFrom, setAvailableFrom] = useState(initialFilters.available_from || "");
        const [rentalPeriod, setRentalPeriod] = useState<Option | null>(
                initialFilters.rental_period
                        ? { value: initialFilters.rental_period, label: initialFilters.rental_period }
                        : null
        );
        const [searchTerm, setSearchTerm] = useState(initialFilters.search || "");
        const [propertyStatus, setPropertyStatus] = useState<Option | null>(
                initialFilters.property_status
                        ? { value: initialFilters.property_status, label: initialFilters.property_status }
                        : null
        );

        // Options for select fields
        const [stateOptions, setStateOptions] = useState<Option[]>([]);
        const [cityOptions, setCityOptions] = useState<Option[]>([]);
        const [amenityOptions, setAmenityOptions] = useState<Option[]>([]);
        const [isFilterOpen, setIsFilterOpen] = useState(false)
        const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);



        // Debounce input values to prevent excessive API calls
        const debouncedMinPrice = useDebounce(minPrice, 800);
        const debouncedMaxPrice = useDebounce(maxPrice, 800);
        const debouncedMinBedrooms = useDebounce(minBedrooms, 800);
        const debouncedMaxBedrooms = useDebounce(maxBedrooms, 800);
        const debouncedMinBathrooms = useDebounce(minBathrooms, 800);
        const debouncedMaxBathrooms = useDebounce(maxBathrooms, 800);
        const debouncedSearchTerm = useDebounce(searchTerm, 800);

        // Fetch filter options from API
        useEffect(() => {
                const loadFilterOptions = async () => {
                        try {
                                const options = await fetchPropertyFilterOptions();

                                // Format state options
                                const stateOpts = options.states.map((state: { id: number, name: string }) => ({
                                        value: state.name,
                                        label: state.name
                                }));
                                setStateOptions(stateOpts);

                                // Format city options
                                const cityOpts = options.cities.map((city: { id: number, name: string }) => ({
                                        value: city.name,
                                        label: city.name
                                }));
                                setCityOptions(cityOpts);

                                // Format amenity options
                                const amenityOpts = options.amenities.map((amenity: { id: number, name: string }) => ({
                                        value: amenity.id.toString(),
                                        label: amenity.name
                                }));
                                setAmenityOptions(amenityOpts);
                        } catch (error) {
                                console.error("Error loading filter options:", error);
                        }
                };

                loadFilterOptions();
        }, []);

        // Update filters when any filter value changes
        useEffect(() => {
                // Skip the first render to prevent infinite loops
                if (isInitialRender.current) {
                        isInitialRender.current = false;
                        return;
                }

                const filters: PropertyFilter = {};

                // Only add filters that have values
                if (debouncedMinPrice) filters.min_price = debouncedMinPrice;
                if (debouncedMaxPrice) filters.max_price = debouncedMaxPrice;
                if (debouncedMinBedrooms) filters.min_bedrooms = debouncedMinBedrooms;
                if (debouncedMaxBedrooms) filters.max_bedrooms = debouncedMaxBedrooms;
                if (debouncedMinBathrooms) filters.min_bathrooms = debouncedMinBathrooms;
                if (debouncedMaxBathrooms) filters.max_bathrooms = debouncedMaxBathrooms;
                if (propertyType) filters.property_type = propertyType.value;
                if (listingType) filters.listing_type = listingType.value;
                if (state) filters.state = state.value;
                if (city) filters.city = city.value;
                if (selectedAmenities.length > 0) {
                        filters.amenities = selectedAmenities.map(a => a.value).join(',');
                }
                if (acceptsPets !== null) filters.accepts_pets = acceptsPets;
                if (acceptsStudents !== null) filters.accepts_students = acceptsStudents;
                if (isFurnished !== null) filters.is_furnished = isFurnished;
                if (availableFrom) filters.available_from = availableFrom;
                if (rentalPeriod) filters.rental_period = rentalPeriod.value;
                if (debouncedSearchTerm) filters.search = debouncedSearchTerm;
                if (propertyStatus) filters.property_status = propertyStatus.value;

                onFilterChange(filters);
        }, [
                debouncedMinPrice, debouncedMaxPrice,
                debouncedMinBedrooms, debouncedMaxBedrooms,
                debouncedMinBathrooms, debouncedMaxBathrooms,
                propertyType, listingType, state, city,
                selectedAmenities, acceptsPets, acceptsStudents,
                rentalPeriod, debouncedSearchTerm, propertyStatus,

        ]);

        // Input validation for numbers
        const validateNumberInput = (value: string) => {
                const digitsOnly = value.replace(/\D/g, '');
                return digitsOnly;
        };

        // Clear all filters
        const clearFilters = () => {
                setMinPrice("");
                setMaxPrice("");
                setMinBedrooms("");
                setMaxBedrooms("");
                setMinBathrooms("");
                setMaxBathrooms("");
                setPropertyType(null);
                setListingType(null);
                setState(null);
                setCity(null);
                setSelectedAmenities([]);
                setAcceptsPets(null);
                setAcceptsStudents(null);
                setIsFurnished(null);
                setAvailableFrom("");
                setRentalPeriod(null);
                setSearchTerm("");
                setPropertyStatus(null);
        };

        return (
                <div className="mt-6  rounded-xl   w-full mb-4">
                        <div className="flex flex-wrap items-center justify-between mb-4">
                                <button className="flex items-center text-sm border border-gray-300 shadow-sm rounded-md p-2" onClick={() => setIsFilterOpen(!isFilterOpen)}>
                                        <FaFilter className="mr-1 text-gray-4 font-bold text-sm" />
                                        <h2 className="text-sm font-semibold text-white-1 font-playfair">{isFilterOpen ? "Hide" : "Show"} Filters</h2>
                                </button>
                                <div className="flex items-center gap-2">

                                        <button
                                                onClick={clearFilters}
                                                className="font-bold text-yellow-100 text-sm hover:text-red-500 font-poppins"
                                        >
                                                Clear all
                                        </button>
                                </div>
                        </div>

                        {/* Search Term */}
                        <div className="mb-4">
                                <input
                                        type="text"
                                        placeholder="Search by keyword"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                />
                        </div>

                        {isFilterOpen && (
                                <div>

                                        {/* First row of filters */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                                {/* Price Range */}
                                                <div>
                                                        <label className="block text-sm font-medium text-white-1  mb-1 font-montserrat">
                                                                <MdAttachMoney className="inline mr-1 text-gray-4" />
                                                                Price Range
                                                        </label>
                                                        <div className="flex space-x-2">
                                                                <input
                                                                        type="text"
                                                                        placeholder="Min"
                                                                        value={minPrice}
                                                                        onChange={(e) => setMinPrice(validateNumberInput(e.target.value))}
                                                                        className="w-full p-2 border text-black-1 border-gray-300 rounded-md"
                                                                />
                                                                <input
                                                                        type="text"
                                                                        placeholder="Max"
                                                                        value={maxPrice}
                                                                        onChange={(e) => setMaxPrice(validateNumberInput(e.target.value))}
                                                                        className="w-full p-2 border text-black-1 border-gray-300 rounded-md"
                                                                />
                                                        </div>
                                                </div>

                                                {/* Property Type */}
                                                <div>
                                                        <label className="block text-sm font-medium text-white-1  mb-1 font-montserrat">
                                                                <FaBuilding className="inline mr-1 text-gray-4" />
                                                                Property Type
                                                        </label>
                                                        <Select
                                                                instanceId="property-type-select"
                                                                options={propertyTypeOptions}
                                                                value={propertyTypeOptions.find(option => option.value === propertyType?.value)}
                                                                onChange={(selectedOption) => {
                                                                        setPropertyType(selectedOption);
                                                                }}
                                                                placeholder="Select type"
                                                                isClearable={true}
                                                                className="text-sm text-black-1"
                                                        />
                                                </div>

                                                {/* Bedrooms */}
                                                <div>
                                                        <label className="block text-sm font-medium text-white-1   mb-1 font-montserrat">
                                                                <FaBed className="inline mr-1 text-gray-4" />
                                                                Bedrooms
                                                        </label>
                                                        <div className="flex space-x-2">
                                                                <input
                                                                        type="text"
                                                                        placeholder="Min"
                                                                        value={minBedrooms}
                                                                        onChange={(e) => setMinBedrooms(validateNumberInput(e.target.value))}
                                                                        className="w-full p-2 border text-black-1 border-gray-300 rounded-md"
                                                                />
                                                                <input
                                                                        type="text"
                                                                        placeholder="Max"
                                                                        value={maxBedrooms}
                                                                        onChange={(e) => setMaxBedrooms(validateNumberInput(e.target.value))}
                                                                        className="w-full p-2 border border-gray-300 text-black-1 rounded-md"
                                                                />
                                                        </div>
                                                </div>

                                                {/* Bathrooms */}
                                                <div>
                                                        <label className="block text-sm font-medium text-white-1   mb-1 font-montserrat">
                                                                <FaBath className="inline mr-1 text-gray-4" />
                                                                Bathrooms
                                                        </label>
                                                        <div className="flex space-x-2">
                                                                <input
                                                                        type="text"
                                                                        placeholder="Min"
                                                                        value={minBathrooms}
                                                                        onChange={(e) => setMinBathrooms(validateNumberInput(e.target.value))}
                                                                        className="w-full p-2 border text-black-1 border-gray-300 rounded-md"
                                                                />
                                                                <input
                                                                        type="text"
                                                                        placeholder="Max"
                                                                        value={maxBathrooms}
                                                                        onChange={(e) => setMaxBathrooms(validateNumberInput(e.target.value))}
                                                                        className="w-full p-2 border text-black-1 border-gray-300 rounded-md"
                                                                />
                                                        </div>
                                                </div>
                                        </div>

                                        {/* Second row of basic filters */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                                {/* Location */}
                                                <div>
                                                        <label className="block text-sm font-medium text-white-1   mb-1 font-montserrat">
                                                                <MdLocationOn className="inline mr-1 text-gray-4" />
                                                                State
                                                        </label>
                                                        <Select
                                                                value={state}
                                                                onChange={setState}
                                                                options={stateOptions}
                                                                placeholder="Select state"
                                                                isClearable
                                                                className="text-sm text-black-1"
                                                        />
                                                </div>

                                                {/* City */}
                                                <div>
                                                        <label className="block text-sm font-medium text-white-1   mb-1 font-montserrat">
                                                                <MdLocationOn className="inline mr-1 text-gray-4 font-bold" />
                                                                City
                                                        </label>
                                                        <Select
                                                                value={city}
                                                                onChange={setCity}
                                                                options={cityOptions}
                                                                placeholder="Select city"
                                                                isClearable
                                                                className="text-sm"
                                                        />
                                                </div>

                                                {/* Listing Type */}
                                                <div>
                                                        <label className="block text-sm font-medium text-white-1 mb-1 font-montserrat">
                                                                <FaListUl className="inline mr-1 text-gray-4" />
                                                                Listing Type
                                                        </label>
                                                        <Select
                                                                value={listingType}
                                                                onChange={setListingType}
                                                                options={listingTypeOptions}
                                                                placeholder="Select listing type"
                                                                isClearable
                                                                className="text-sm text-black-1"
                                                        />
                                                </div>

                                                {/* Availability Date */}
                                                <div>
                                                        <label className="block text-sm font-medium text-white-1  mb-1 font-montserrat">
                                                                <MdDateRange className="inline mr-1 text-gray-4 font-bold" />
                                                                Available From
                                                        </label>
                                                        <input
                                                                type="date"
                                                                value={availableFrom}
                                                                onChange={(e) => setAvailableFrom(e.target.value)}
                                                                className="w-full p-2 border border-gray-300 rounded-md text-black-1"
                                                        />
                                                </div>
                                        </div>

                                        {/* Toggle Advanced Filters */}
                                        <button
                                                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                                                className="flex items-center justify-center w-full py-2 text-gray-4 font-bold rounded-md hover:bg-gray-3 transition-colors font-poppins"
                                        >
                                                {isAdvancedOpen ? "Hide Advanced Filters" : "Show Advanced Filters"}
                                                <FaChevronDown className={`ml-2 transform ${isAdvancedOpen ? "rotate-180" : ""}`} />
                                        </button>

                                        {/* Advanced Filters */}
                                        {isAdvancedOpen && (
                                                <div className="mt-4 border-t pt-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                                                {/* Amenities */}
                                                                <div className="lg:col-span-2">
                                                                        <label className="block text-sm font-medium text-white-1  mb-1 font-montserrat">
                                                                                <MdHomeWork className="inline mr-1 text-gray-4" />
                                                                                Amenities
                                                                        </label>
                                                                        <Select
                                                                                isMulti
                                                                                value={selectedAmenities}
                                                                                onChange={(newValue) => setSelectedAmenities(newValue as Option[])}
                                                                                options={amenityOptions}
                                                                                placeholder="Select amenities"
                                                                                className="text-sm"
                                                                        />
                                                                </div>

                                                                {/* Property Status */}
                                                                <div>
                                                                        <label className="block text-sm font-medium text-white-1   mb-1 font-montserrat">
                                                                                <BiSolidCategory className="inline mr-1 text-gray-4" />
                                                                                Property Status
                                                                        </label>
                                                                        <Select
                                                                                value={propertyStatus}
                                                                                onChange={setPropertyStatus}
                                                                                options={propertyStatusOptions}
                                                                                placeholder="Select status"
                                                                                isClearable
                                                                                className="text-sm"
                                                                        />
                                                                </div>

                                                                {/* Rental Period */}
                                                                <div>
                                                                        <label className="block text-sm font-medium text-white-1  mb-1 font-montserrat">
                                                                                <MdSchedule className="inline mr-1 text-gray-4" />
                                                                                Rental Period
                                                                        </label>
                                                                        <Select
                                                                                value={rentalPeriod}
                                                                                onChange={setRentalPeriod}
                                                                                options={rentalPeriodOptions}
                                                                                placeholder="Select period"
                                                                                isClearable
                                                                                className="text-sm"
                                                                        />
                                                                </div>
                                                        </div>

                                                        {/* Checkboxes for boolean filters */}
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                                                {/* Accepts Pets */}
                                                                <div className="flex items-center">
                                                                        <input
                                                                                id="accepts-pets"
                                                                                type="checkbox"
                                                                                checked={acceptsPets === true}
                                                                                onChange={(e) => setAcceptsPets(e.target.checked ? true : null)}
                                                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                                                        />
                                                                        <label htmlFor="accepts-pets" className="ml-2 text-sm text-white-1   font-montserrat">
                                                                                Accepts Pets
                                                                        </label>
                                                                </div>

                                                                {/* Accepts Students */}
                                                                <div className="flex items-center">
                                                                        <input
                                                                                id="accepts-students"
                                                                                type="checkbox"
                                                                                checked={acceptsStudents === true}
                                                                                onChange={(e) => setAcceptsStudents(e.target.checked ? true : null)}
                                                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                                                        />
                                                                        <label htmlFor="accepts-students" className="ml-2 text-sm text-white-1   font-montserrat">
                                                                                Accepts Students
                                                                        </label>
                                                                </div>

                                                                {/* Is Furnished */}
                                                                <div className="flex items-center">
                                                                        <input
                                                                                id="is-furnished"
                                                                                type="checkbox"
                                                                                checked={isFurnished === true}
                                                                                onChange={(e) => setIsFurnished(e.target.checked ? true : null)}
                                                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                                                        />
                                                                        <label htmlFor="is-furnished" className="ml-2 text-sm text-white-1  font-montserrat">
                                                                                Furnished
                                                                        </label>
                                                                </div>


                                                        </div>
                                                </div>
                                        )}

                                </div>
                        )}
                </div>
        );
};

export default PropertyFilters;