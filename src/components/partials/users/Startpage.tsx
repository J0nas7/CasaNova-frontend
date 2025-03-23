"use client";

// External
import React, { useEffect } from "react";
import Link from "next/link";
import { faBuilding, faPlus, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Internal
import { Block, FlexibleBox, Text } from "@/components";
import { selectAuthUser, useTypedSelector } from "@/redux";
import { usePropertiesContext } from "@/contexts";
import { Property } from "@/types";

export const Startpage = () => {
    const authUser = useTypedSelector(selectAuthUser);
    const { properties, readProperties } = usePropertiesContext();

    useEffect(() => {
        readProperties();
        document.title = "Welcome - CasaNova";
    }, []);

    return (
        <Block className="page-content p-6">
            {/* Welcome Section */}
            <FlexibleBox
                title={`Hej ${authUser?.User_First_Name} 👋`}
                titleAction={
                    <Block className="flex gap-3">
                        <Link href={`/property/create`} className="inline-flex gap-2 items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition">
                            <FontAwesomeIcon icon={faPlus} />
                            <Text variant="span">Create Property</Text>
                        </Link>
                    </Block>
                }
                icon={faUser}
                className="no-box w-auto mt-4"
            >
                <LatestAds properties={properties} />
                <PropertyCategories />
                <PopularCities />
                <PopularAds properties={properties} />
            </FlexibleBox>
        </Block>
    );
};

interface StartpageProps {
    properties: Property[]
}

export const LatestAds: React.FC<StartpageProps> = ({ properties }) => {
    const latestProperties = properties?.slice(0, 6); // Show only the latest 6 ads

    return (
        <Block className="mt-8">
            <Text className="text-2xl font-bold">🆕 Latest Listings</Text>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {latestProperties?.map((property) => (
                    <Link key={property.Property_ID} href={`/property/${property.Property_ID}`} className="group">
                        <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition">
                            <img
                                src={property.images?.[0]?.Image_Image_URL || "https://via.placeholder.com/400x250"}
                                alt={property.Property_Title}
                                className="w-full h-48 object-cover group-hover:opacity-80 transition"
                            />
                            <div className="p-4">
                                <Text className="text-lg font-semibold text-gray-900">{property.Property_Title}</Text>
                                <Text className="text-sm text-gray-600">{property.Property_City}, {property.Property_State}</Text>
                                <Text className="text-lg font-bold text-blue-600 mt-2">
                                    ${property.Property_Price_Per_Month} / month
                                </Text>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </Block>
    );
};

export const PropertyCategories = () => {
    const categories = [
        { name: "Apartments", icon: "🏢" },
        { name: "Houses", icon: "🏡" },
        { name: "Condos", icon: "🏘" },
        { name: "Villas", icon: "🏰" },
        { name: "Studios", icon: "🎨" },
    ];

    return (
        <Block className="mt-8">
            <Text className="text-2xl font-bold">🏡 Property Categories</Text>
            <div className="flex gap-4 mt-4">
                {categories.map((category, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-md flex items-center gap-3">
                        <Text className="text-2xl">{category.icon}</Text>
                        <Text className="text-lg font-semibold">{category.name}</Text>
                    </div>
                ))}
            </div>
        </Block>
    );
};

export const PopularCities = () => {
    const popularCities = [
        { name: "New York", listings: 120 },
        { name: "Los Angeles", listings: 95 },
        { name: "San Francisco", listings: 85 },
        { name: "Chicago", listings: 75 },
        { name: "Miami", listings: 65 },
    ];

    return (
        <Block className="mt-8">
            <Text className="text-2xl font-bold">🌆 Popular Cities</Text>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-4">
                {popularCities.map((city, index) => (
                    <div key={index} className="bg-blue-600 text-white p-4 rounded-lg shadow-md text-center">
                        <Text className="text-lg font-semibold">{city.name}</Text>
                        <Text className="text-sm">Listings: {city.listings}</Text>
                    </div>
                ))}
            </div>
        </Block>
    );
};

export const PopularAds: React.FC<StartpageProps> = ({ properties }) => {
    const popularProperties = properties?.sort((a, b) => b.Property_Price_Per_Month - a.Property_Price_Per_Month).slice(0, 3); // Sort by price (as a placeholder for popularity)

    return (
        <Block className="mt-8">
            <Text className="text-2xl font-bold">🔥 Most Popular Ads</Text>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {popularProperties?.map((property) => (
                    <div key={property.Property_ID} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition">
                        <img
                            src={property.images?.[0]?.Image_Image_URL || "https://via.placeholder.com/400x250"}
                            alt={property.Property_Title}
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                            <Text className="text-lg font-semibold text-gray-900">{property.Property_Title}</Text>
                            <Text className="text-sm text-gray-600">{property.Property_City}</Text>
                            <Text className="text-lg font-bold text-blue-600 mt-2">
                                ${property.Property_Price_Per_Month} / month
                            </Text>
                        </div>
                    </div>
                ))}
            </div>
        </Block>
    );
};
