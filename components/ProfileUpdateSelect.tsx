"use client";

import Select, {
    type GroupBase,
    type Props,
    type StylesConfig,
} from "react-select";

interface ProfileSelectOption {
    value: string;
    label: string;
}

type ProfileUpdateSelectProps = Props<
    ProfileSelectOption,
    false,
    GroupBase<ProfileSelectOption>
>;

const selectStyles: StylesConfig<
    ProfileSelectOption,
    false,
    GroupBase<ProfileSelectOption>
> = {
    control: (base, state) => ({
        ...base,
        minHeight: 48,
        borderColor: state.isFocused ? "#2879ef" : "#d7e1ed",
        borderRadius: 12,
        backgroundColor: "#fff",
        boxShadow: state.isFocused ? "0 0 0 3px rgba(40, 121, 239, 0.14)" : "none",
        cursor: "text",
        transition: "border-color 160ms ease, box-shadow 160ms ease",
        "&:hover": {
            borderColor: state.isFocused ? "#2879ef" : "#a9c9f4",
        },
    }),
    valueContainer: (base) => ({
        ...base,
        padding: "2px 12px",
    }),
    input: (base) => ({
        ...base,
        margin: 0,
        padding: 0,
        color: "#243b53",
    }),
    placeholder: (base) => ({
        ...base,
        color: "#94a3b8",
        fontSize: 14,
    }),
    singleValue: (base) => ({
        ...base,
        color: "#243b53",
        fontSize: 14,
    }),
    indicatorsContainer: (base) => ({
        ...base,
        paddingRight: 6,
    }),
    dropdownIndicator: (base, state) => ({
        ...base,
        color: state.isFocused ? "#2879ef" : "#8093aa",
        padding: 8,
        "&:hover": {
            color: "#2879ef",
        },
    }),
    clearIndicator: (base) => ({
        ...base,
        color: "#8093aa",
        "&:hover": {
            color: "#475569",
        },
    }),
    indicatorSeparator: () => ({
        display: "none",
    }),
    menu: (base) => ({
        ...base,
        zIndex: 50,
        marginTop: 6,
        overflow: "hidden",
        border: "1px solid #e2eaf4",
        borderRadius: 12,
        boxShadow: "0 12px 28px rgba(15, 23, 42, 0.12)",
    }),
    menuList: (base) => ({
        ...base,
        padding: 5,
    }),
    option: (base, state) => ({
        ...base,
        borderRadius: 8,
        backgroundColor: state.isSelected
            ? "#2879ef"
            : state.isFocused
                ? "#eff6ff"
                : "#fff",
        color: state.isSelected ? "#fff" : "#334b68",
        cursor: "pointer",
        fontSize: 14,
        "&:active": {
            backgroundColor: state.isSelected ? "#2879ef" : "#dbeafe",
        },
    }),
    noOptionsMessage: (base) => ({
        ...base,
        color: "#64748b",
        fontSize: 14,
    }),
};

export default function ProfileUpdateSelect(props: ProfileUpdateSelectProps) {
    return (
        <Select<ProfileSelectOption, false, GroupBase<ProfileSelectOption>>
            {...props}
            classNamePrefix="nb-select"
            styles={selectStyles}
        />
    );
}
