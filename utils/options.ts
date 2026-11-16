interface Option {
    value: string;
    label: string;
}

// Property type options
export const propertyTypeOptions: Option[] = [
    { value: "Self Contain", label: "Self Contain" },
    { value: "Single Room", label: "Single Room" },
    { value: "Shared Apartment", label: "Shared Apartment" },
    { value: "Mini Flat", label: "Mini Flat" },
    { value: "Flat", label: "Flat" },
    { value: "Duplex", label: "Duplex" },
    { value: "Bungalow", label: "Bungalow" },
    { value: "Terrace", label: "Terrace" },
    { value: "Mansion", label: "Mansion" },
    { value: "Penthouse", label: "Penthouse" },
    { value: "Commercial Space", label: "Commercial Space" },
    { value: "Office Space", label: "Office Space" },
    { value: "Shop", label: "Shop" },
    { value: "Warehouse", label: "Warehouse" },
    { value: "Land", label: "Land" },
    { value: "Farm Land", label: "Farm Land" },
    { value: "Industrial Land", label: "Industrial Land" },
    { value: "Estate", label: "Estate" },
    { value: "Real Estate", label: "Real Estate" },
    { value: "Hotel or Lodge", label: "Hotel or Lodge" },
    { value: "Student Lodge", label: "Student Lodge" },
    { value: "Other", label: "Other" }
];

// Listing type options
export const listingTypeOptions: Option[] = [
    { value: "Rent", label: "Rent" },
    { value: "Sale", label: "Sale" },
    { value: "Lease", label: "Lease" },
    { value: "Short Term", label: "Short Term" }
];

// Property status options
export const propertyStatusOptions: Option[] = [
    { value: "Available", label: "Available" },
    { value: "Pending", label: "Pending" },
    { value: "Rented", label: "Rented" },
    { value: "Sold", label: "Sold" },
    { value: "Maintenance", label: "Maintenance" },
    { value: "Off Market", label: "Off Market" }
];

// Rental period options
export const rentalPeriodOptions: Option[] = [
    { value: "Daily", label: "Daily" },
    { value: "Weekly", label: "Weekly" },
    { value: "Monthly", label: "Monthly" },
    { value: "Quarterly", label: "Quarterly" },
    { value: "Biannually", label: "Biannually" },
    { value: "Annually", label: "Annually" }
];


