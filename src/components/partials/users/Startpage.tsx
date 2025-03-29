"use client";

// External
import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { faHouseChimney } from "@fortawesome/free-solid-svg-icons";

// Internal
import { Block, FlexibleBox, Text } from "@/components";
import { selectAuthUser, useTypedSelector } from "@/redux";
import { usePropertiesContext } from "@/contexts";
import { Property, propertyTypeMap } from "@/types";
import { PropertyImageCard } from "../property/image/PropertyImage";
import { JumbotronImageRotation } from "../property/PropertyDetails";

export const Startpage = () => {
    const authUser = useTypedSelector(selectAuthUser)
    const { properties, readProperties } = usePropertiesContext()

    const [numberOfProperties, setNumberOfProperties] = useState<number>(0)

    useEffect(() => { readProperties() }, [])
    useEffect(() => { setNumberOfProperties(properties.length) }, [properties])
    useEffect(() => {
        if (numberOfProperties > 0) {
            document.title = `Search among ${numberOfProperties} available properties - CasaNova`;
        }
    }, [numberOfProperties]);

    return (
        <Block className="page-content p-6">
            {/* Welcome Section */}
            <FlexibleBox
                title={`Search among ${numberOfProperties} available properties`}
                icon={faHouseChimney}
                className="no-box w-auto mt-4"
            >
                <LatestAds properties={properties} />
                <PropertyCategories />
                <PopularCities properties={properties} />
                <PopularAds properties={properties} />
            </FlexibleBox>
        </Block>
    );
};

interface StartpageProps {
    properties: Property[]
}

export const LatestAds: React.FC<StartpageProps> = ({ properties }) => {
    if (!Array.isArray(properties) || properties.length === 0) {
        return (
            <Block className="mt-8">
                <Text className="text-2xl font-bold">🆕 Latest Listings</Text>
                <Text className="text-gray-600 mt-4">No properties available at the moment.</Text>
            </Block>
        );
    }

    const latestProperties = properties
        .sort((a, b) => (b.Property_ID ?? 0) - (a.Property_ID ?? 0)) // Sort by Property_ID in descending order
        .slice(0, 6); // Show only the latest 6 ads

    return (
        <Block className="mt-8">
            <Text className="text-2xl font-bold">🆕 Latest Listings</Text>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {latestProperties?.map((property: Property) => (
                    <div
                        key={property.Property_ID}
                        className="bg-white p-4 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition group"
                    >
                        <div className="relative w-full h-48 rounded-md overflow-hidden">
                            {(() => {
                                const image = property.images?.find(img => img.Image_Order === 1)

                                return (
                                    <>
                                        <JumbotronImageRotation
                                            property={property}
                                            enableAutoRotation={false}
                                            numberInRotation={1}
                                            image={image || undefined}
                                            setShowJumbotronHighlightImage={() => null}
                                            classNames={{
                                                rotationWrapper: "w-full h-full p-1 flex items-center justify-center",
                                                rotationImageWrapper: "relative w-full h-auto",
                                                rotationImage: "w-full h-auto max-h-48 object-cover group-hover:opacity-80 transition",
                                            }}
                                        />
                                        {/* <PropertyImageCard
                                            property={property}
                                            className="w-full h-48 object-cover group-hover:opacity-80 transition"
                                        /> */}
                                    </>
                                )
                            })()}
                        </div>

                        <Link href={`/listing/${property.Property_ID}`}>
                            <div className="mt-3">
                                <Text className="text-lg font-semibold">{property.Property_Title}</Text>
                                <Text className="text-gray-600">
                                    {property.Property_City}
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
                    </div>
                ))}
            </div>
        </Block>
    );
};

export const PropertyCategories = () => {
    const categories = [
        { name: "Apartments", icon: "🏢", id: 1 },
        { name: "Rooms", icon: "🏘", id: 2 },
        { name: "Houses", icon: "🏡", id: 3 },
        { name: "Townhouses", icon: "🏰", id: 4 },
        { name: "All rentals", icon: "", id: 0 }
    ];

    return (
        <Block className="mt-8">
            <Text className="text-2xl font-bold">🏡 Property Categories</Text>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                {categories.map((category, index) => (
                    <Link
                        key={index}
                        className="bg-white p-4 rounded-lg shadow-md flex items-center gap-3"
                        href={`/search${category.id ? `?propertyType=${category.id}` : ""}`}
                    >
                        <Text className="text-2xl">{category.icon}</Text>
                        <Text className="text-lg font-semibold">{category.name}</Text>
                    </Link>
                ))}
            </div>
        </Block>
    );
};

export const PopularCities: React.FC<StartpageProps> = ({ properties }) => {
    if (!Array.isArray(properties) || properties.length === 0) {
        return (
            <Block className="mt-8">
                <Text className="text-2xl font-bold">🌆 Popular Cities</Text>
                <Text className="text-gray-600 mt-4">No popular cities to display at the moment.</Text>
            </Block>
        );
    }

    const cityPicture: { [key: string]: string } = {
        "New York": "https://media.timeout.com/images/105699755/750/422/image.jpg",
        "Los Angeles": "https://www.thediscoveriesof.com/wp-content/uploads/2023/02/Hollywood-Walk-of-Fame-shutterstock_1054499282.jpg.webp",
        "Chicago": "https://offloadmedia.feverup.com/secretchicago.com/wp-content/uploads/2021/05/13044548/Riverwalk-1024x608.jpg",
        "Houston": "https://diamondexchangehouston.com/wp-content/uploads/2022/04/history-of-houston.jpg",
        "San Francisco": "https://images.fineartamerica.com/images/artworkimages/mediumlarge/3/san-francisco-waterfront-downtown-david-zanzinger.jpg",
        "Miami": "https://www.chase.com/content/dam/unified-assets/photography/chase/chase-travel/properties/miami/south_beach_ocean_drive_street_16x9.jpg",
        "Virum": "https://www.landskabsarkitekter.dk/wp-content/uploads/2023/08/U34_Base-Camp-Lyngby_1920-1920x1080.jpg",
    }

    // Count listings for each city
    const cityCounts: { [key: string]: number } = {};

    properties.forEach((property) => {
        const city = property.Property_City;
        if (city) {
            if (!cityCounts[city]) {
                cityCounts[city] = 0;
            }
            cityCounts[city] += 1;
        }
    });

    // Convert cityCounts object to an array of popular cities
    const popularCities = Object.entries(cityCounts).map(([name, listings]) => ({
        name,
        listings
    }));

    return (
        <Block className="mt-8">
            <Text className="text-2xl font-bold">🌆 Popular Cities</Text>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-4">
                {popularCities.map((city, index) => (
                    <Link
                        key={index}
                        className="bg-white text-black rounded-lg shadow-md"
                        href={`/search?city=${city.name.replace(/ /g, "+")}`}
                    >
                        <Block className="relative w-full h-32 rounded-md overflow-hidden">
                            <img
                                src={cityPicture[city.name] || "https://via.placeholder.com/400x300"}
                                alt={city.name}
                                className="w-full h-32 object-cover"
                            />
                        </Block>
                        <Block className="flex flex-col sm:flex-row items-center justify-between p-2">
                            <Text className="text-lg font-semibold">{city.name}</Text>
                            <Text className="text-sm text-gray-500">
                                {city.listings} listing{city.listings > 1 ? "s" : ""}
                            </Text>
                        </Block>
                    </Link>
                ))}
            </div>
        </Block>
    );
};

export const PopularAds: React.FC<StartpageProps> = ({ properties }) => {
    if (!Array.isArray(properties) || properties.length === 0) {
        return (
            <Block className="mt-8">
                <Text className="text-2xl font-bold">🔥 Most Popular Ads</Text>
                <Text className="text-gray-600 mt-4">No popular ads to display at the moment.</Text>
            </Block>
        );
    }

    const popularProperties = properties?.sort((a, b) => b.Property_Price_Per_Month - a.Property_Price_Per_Month).slice(0, 3); // Sort by price (as a placeholder for popularity)

    return (
        <Block className="mt-8">
            <Text className="text-2xl font-bold">🔥 Most Popular Ads</Text>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {popularProperties?.map((property: Property) => (
                    <div
                        key={property.Property_ID}
                        className="bg-white p-4 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition group"
                    >
                        <div className="relative w-full h-48 rounded-md overflow-hidden">
                            {(() => {
                                const image = property.images?.find(img => img.Image_Order === 1)

                                return (
                                    <>
                                        <JumbotronImageRotation
                                            property={property}
                                            enableAutoRotation={false}
                                            numberInRotation={1}
                                            image={property.images?.[0] || undefined}
                                            setShowJumbotronHighlightImage={() => null}
                                            classNames={{
                                                rotationWrapper: "w-full h-full p-1 flex items-center justify-center",
                                                rotationImageWrapper: "relative w-full h-auto",
                                                rotationImage: "w-full h-auto max-h-48 object-cover group-hover:opacity-80 transition",
                                            }}
                                        />
                                        {/* <PropertyImageCard
                                            property={property}
                                            className="w-full h-48 object-cover group-hover:opacity-80 transition"
                                        /> */}
                                    </>
                                )
                            })()}
                        </div>

                        <Link href={`/listing/${property.Property_ID}`}>
                            <div className="mt-3">
                                <Text className="text-lg font-semibold">{property.Property_Title}</Text>
                                <Text className="text-gray-600">
                                    {property.Property_City}
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
                    </div>
                ))}
            </div>
        </Block>
    );
};
