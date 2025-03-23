"use client";

// External
import React, { useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

// Internal
import { Block, Text, Field } from "@/components";
import { usePropertiesContext } from "@/contexts";
import { Property } from "@/types";

// Property type mapping (number -> string)
const propertyTypeMap: { [key: number]: string } = {
    1: "Apartment",
    2: "Room",
    3: "House",
    4: "Townhouse",
};

// Reverse mapping (string -> number)
const reversePropertyTypeMap: { [key: string]: number } = {
    Apartment: 1,
    Room: 2,
    House: 3,
    Townhouse: 4,
};

export const SearchListingsView = () => {
    const { properties, readProperties } = usePropertiesContext();
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        readProperties();
        document.title = "Search Listings - CasaNova";
    }, []);

    // Get filter values from search params
    const filters = {
        city: searchParams.get("city") || "",
        minPrice: searchParams.get("minPrice") || "",
        maxPrice: searchParams.get("maxPrice") || "",
        bedrooms: searchParams.get("bedrooms") || "",
        bathrooms: searchParams.get("bathrooms") || "",
        propertyType: searchParams.get("propertyType") || "",
    };

    // Update search params
    const updateFilters = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }

        router.push(`?${params.toString()}`);
    };

    // Filter properties based on search params
    const filteredProperties = properties.filter((property) => {
        return (
            (filters.city ? property.Property_City.toLowerCase().includes(filters.city.toLowerCase()) : true) &&
            (filters.minPrice ? property.Property_Price_Per_Month >= Number(filters.minPrice) : true) &&
            (filters.maxPrice ? property.Property_Price_Per_Month <= Number(filters.maxPrice) : true) &&
            (filters.bedrooms ? property.Property_Num_Bedrooms >= Number(filters.bedrooms) : true) &&
            (filters.bathrooms ? property.Property_Num_Bathrooms >= Number(filters.bathrooms) : true) &&
            (filters.propertyType ? property.Property_Property_Type == Number(filters.propertyType) : true)
        );
    });

    return (
        <Block className="page-content p-6">
            <Text className="text-3xl font-bold mb-6">🔍 Search for Properties</Text>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Left: Search Form */}
                <div className="bg-white p-6 rounded-lg shadow-md md:col-span-1">
                    <Text className="text-xl font-semibold mb-4">Filters</Text>

                    {/* Property Type Select Dropdown */}
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Property Type</label>
                        <select
                            value={filters.propertyType}
                            onChange={(e) => updateFilters("propertyType", e.target.value)}
                            className="w-full p-2 border rounded-md mt-1"
                        >
                            <option value="">Any</option>
                            <option value="1">Apartment</option>
                            <option value="2">Room</option>
                            <option value="3">House</option>
                            <option value="4">Townhouse</option>
                        </select>
                    </div>
                    
                    <Field
                        type="text"
                        lbl="City"
                        placeholder="Enter city"
                        value={filters.city}
                        onChange={(e: string) => updateFilters("city", e)}
                        required={false}
                        disabled={false}
                        className="w-full mt-4"
                    />

                    <div className="flex gap-2 mt-4">
                        <Field
                            type="number"
                            lbl="Min Price"
                            placeholder="0"
                            value={filters.minPrice}
                            onChange={(e: string) => updateFilters("minPrice", e)}
                            required={false}
                            disabled={false}
                        />
                        <Field
                            type="number"
                            lbl="Max Price"
                            placeholder="10000"
                            value={filters.maxPrice}
                            onChange={(e: string) => updateFilters("maxPrice", e)}
                            required={false}
                            disabled={false}
                        />
                    </div>

                    <div className="flex gap-2 mt-4">
                        <Field
                            type="number"
                            lbl="Bedrooms"
                            placeholder="1+"
                            value={filters.bedrooms}
                            onChange={(e: string) => updateFilters("bedrooms", e)}
                            required={false}
                            disabled={false}
                        />
                        <Field
                            type="number"
                            lbl="Bathrooms"
                            placeholder="1+"
                            value={filters.bathrooms}
                            onChange={(e: string) => updateFilters("bathrooms", e)}
                            required={false}
                            disabled={false}
                        />
                    </div>

                    <button
                        className="bg-blue-600 text-white px-4 py-2 mt-4 rounded-md w-full hover:bg-blue-700 transition"
                        onClick={() => readProperties()}
                    >
                        Search
                    </button>
                </div>

                {/* Right: Listings Grid */}
                <div className="md:col-span-3">
                    {filteredProperties.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProperties.map((property) => (
                                <Link
                                    key={property.Property_ID}
                                    href={`/listing/${property.Property_ID}`}
                                    className="bg-white p-4 rounded-lg shadow-md transition hover:shadow-lg"
                                >
                                    <div className="relative w-full h-48 rounded-md overflow-hidden">
                                        <img
                                            src={property.images?.[0]?.Image_Image_URL || "https://via.placeholder.com/400x300"}
                                            alt={property.Property_Title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="mt-3">
                                        <Text className="text-lg font-semibold">{property.Property_Title}</Text>
                                        <Text className="text-gray-600">
                                            {property.Property_City}, {property.Property_State}
                                        </Text>
                                        <Text className="text-lg font-bold text-green-600">
                                            ${property.Property_Price_Per_Month} / month
                                        </Text>
                                    </div>

                                    <div className="flex justify-between items-center mt-3 text-gray-600 text-sm">
                                        <span>{property.Property_Num_Bedrooms} Beds</span>
                                        <span>{property.Property_Num_Bathrooms} Baths</span>
                                        <span>{propertyTypeMap[property.Property_Property_Type]}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <Text className="text-gray-500 text-lg">No properties found. Try adjusting your filters.</Text>
                    )}
                </div>
            </div>
        </Block>
    );
};