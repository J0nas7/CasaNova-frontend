"use client";

// External
import React, { useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Internal
import { Block, Text, Field } from "@/components";
import { usePropertiesContext } from "@/contexts";
import { Property, propertyTypeMap } from "@/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList, faMap, faSliders } from "@fortawesome/free-solid-svg-icons";
import { PropertyImageCard } from "./image/PropertyImage";
import { JumbotronImageRotation } from "./PropertyDetails";

// Filters interface
interface Filters {
    propertyType: string;
    city: string;
    minPrice: string;
    maxPrice: string;
    bedrooms: string;
    bathrooms: string;
}

export const SearchListingsView = () => {
    const [toggleChecked, setToggleChecked] = React.useState(false);
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
    const filteredProperties = properties.length ? properties.filter((property) => {
        return (
            (filters.city ? property.Property_City.toLowerCase().includes(filters.city.toLowerCase()) : true) &&
            (filters.minPrice ? property.Property_Price_Per_Month >= Number(filters.minPrice) : true) &&
            (filters.maxPrice ? property.Property_Price_Per_Month <= Number(filters.maxPrice) : true) &&
            (filters.bedrooms ? property.Property_Num_Bedrooms >= Number(filters.bedrooms) : true) &&
            (filters.bathrooms ? property.Property_Num_Bathrooms >= Number(filters.bathrooms) : true) &&
            (filters.propertyType ? property.Property_Property_Type == Number(filters.propertyType) : true)
        );
    }) : [];

    const viewAsMap: boolean = searchParams.get("view") === "map";

    if (viewAsMap) {
        return (
            <>
                <Block className="page-content relative h-screen md:h-full !p-0 flex gap-0 flex-col md:flex-row">
                    <span
                        className="toggler absolute top-5 left-auto right-3 z-[500] rounded-full bg-white p-2 shadow-md cursor-pointer md:hidden"
                        onClick={() => setToggleChecked(!toggleChecked)}
                    >
                        <FontAwesomeIcon icon={faSliders} />
                    </span>
                    <input
                        id="mapToggleFilters"
                        type="checkbox"
                        name="toggleBlock"
                        className="hidden"
                        checked={toggleChecked}
                    />
                    <Block theId="mapFilters" className="flex flex-col">
                        <SearchFilters filters={filters} updateFilters={updateFilters} readProperties={readProperties} viewAsMap={viewAsMap} />
                    </Block>
                    <PropertyMap properties={filteredProperties} />
                </Block>
                <style>{`
                    .main-content {
                        padding: 0 !important;
                        margin-top: 160px !important;
                        margin-bottom: 56px !important;

                        @media (min-width: 768px) {
                            margin-top: 85px !important;
                        }
                    }

                    #mapFilters {
                        position: absolute;
                        top: 60px;
                        left: 100%;
                        z-index: 500;
                        transition: left 0.2s ease;

                        @media (min-width: 768px) {
                            position: relative;
                            top: 0;
                            left: 0 !important;
                        }
                    }
                    
                    #mapToggleFilters:checked ~ #mapFilters {
                        left: 10%;
                    }
                `}</style>
            </>
        )
    }

    return (
        <Block className="page-content p-6">
            <Text className="text-3xl font-bold mb-6">🔍 Search for Properties</Text>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Left: Search Filters */}
                <div className="md:col-span-1">
                    <SearchFilters filters={filters} updateFilters={updateFilters} readProperties={readProperties} />
                </div>

                {/* Right: Listings */}
                <div className="md:col-span-3">
                    <PropertyList properties={filteredProperties} />
                </div>
            </div>
        </Block>
    );
};

interface SearchFiltersProps {
    filters: Filters;
    updateFilters: (key: string, value: string) => void;
    readProperties: () => void;
    viewAsMap?: boolean
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ filters, updateFilters, readProperties, viewAsMap }) => (
    <>
        {viewAsMap ? (
            <>
                <div
                    className="bg-yellow-100 p-6 rounded-lg shadow-md mb-3 text-center hover:cursor-pointer transition flex justify-center items-center gap-2"
                    onClick={() => updateFilters("view", "")}
                >
                    <FontAwesomeIcon icon={faList} />
                    <span>Go to list</span>
                </div>
            </>
        ) : (
            <div
                className="bg-yellow-100 p-6 rounded-lg shadow-md mb-3 text-center hover:cursor-pointer transition flex justify-center items-center gap-2"
                onClick={() => updateFilters("view", "map")}
                style={{
                    backgroundImage: 'url("/DK.jpg")',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            >
                <FontAwesomeIcon icon={faMap} />
                <span>Map</span>
            </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md">
            <Text className="text-xl font-semibold mb-4">Filters</Text>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Property Type</label>
                <select
                    value={filters.propertyType}
                    onChange={(e) => updateFilters("propertyType", e.target.value)}
                    className="w-full p-2 border rounded-md mt-1"
                >
                    <option value="">Any</option>
                    {Object.entries(propertyTypeMap).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                    ))}
                </select>
            </div>

            <Field
                type="text"
                lbl="City"
                placeholder="Enter city"
                value={filters.city}
                onChange={(e: string) => updateFilters("city", e)}
                className="w-full mt-4"
                disabled={false}
            />

            <div className="flex gap-2 mt-4">
                <Field type="number" lbl="Min Price" placeholder="0" value={filters.minPrice} onChange={(e: string) => updateFilters("minPrice", e)} disabled={false} />
                <Field type="number" lbl="Max Price" placeholder="10000" value={filters.maxPrice} onChange={(e: string) => updateFilters("maxPrice", e)} disabled={false} />
            </div>

            <div className="flex gap-2 mt-4">
                <Field type="number" lbl="Bedrooms" placeholder="1+" value={filters.bedrooms} onChange={(e: string) => updateFilters("bedrooms", e)} disabled={false} />
                <Field type="number" lbl="Bathrooms" placeholder="1+" value={filters.bathrooms} onChange={(e: string) => updateFilters("bathrooms", e)} disabled={false} />
            </div>

            <button className="bg-blue-600 text-white px-4 py-2 mt-4 rounded-md w-full hover:bg-blue-700 transition" onClick={readProperties}>
                Search
            </button>
        </div>
    </>
);

interface PropertyCardProps {
    property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-md transition hover:shadow-lg group">
            <div className="relative w-full h-48 rounded-md overflow-hidden flex items-center justify-center">
                <JumbotronImageRotation
                    property={property}
                    enableAutoRotation={false}
                    numberInRotation={1}
                    image={property.images?.[0] || undefined}
                    setShowJumbotronHighlightImage={() => null}
                    classNames={{
                        rotationWrapper: "w-full h-full max-h-48 p-1 flex items-center justify-center",
                        rotationImageWrapper: "relative w-full h-auto max-h-48 flex items-center",
                        rotationImage: "w-full h-full object-cover group-hover:opacity-80 transition",
                    }}
                />
                {/* <PropertyImageCard property={property} className="w-full h-full object-cover" /> */}
            </div>

            <Link href={`/listing/${property.Property_ID}`}>
                <div className="mt-3">
                    <Text className="text-lg font-semibold">{property.Property_Title}</Text>
                    <Text className="text-gray-600">{property.Property_City}</Text>
                    <Text className="text-lg font-bold text-green-600">${property.Property_Price_Per_Month} / month</Text>
                </div>

                <div className="flex justify-between items-center mt-3 text-gray-600 text-sm">
                    <span>{property.Property_Num_Bedrooms} Beds</span>
                    <span>{property.Property_Num_Bathrooms} Baths</span>
                    <span>{propertyTypeMap[property.Property_Property_Type]}</span>
                </div>
            </Link>
        </div>
    );
}

interface PropertyListProps {
    properties: Property[];
}

const PropertyList: React.FC<PropertyListProps> = ({ properties }) => (
    properties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
                <PropertyCard key={property.Property_ID} property={property} />
            ))}
        </div>
    ) : (
        <Text className="text-gray-500 text-lg">No properties found. Try adjusting your filters.</Text>
    )
);

interface PropertyMapProps {
    properties: Property[];
}

const markerIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

const PropertyMap: React.FC<PropertyMapProps> = ({ properties }) => {
    const [defaultCenter, setDefaultCenter] = React.useState<[number, number]>([37.7749, -122.4194]); // Default to San Francisco

    useEffect(() => {
        if (properties.length > 0) {
            setDefaultCenter([properties[0].Property_Latitude, properties[0].Property_Longitude]);
        }
    }, [properties]);

    return (
        <div className="w-full h-full rounded-lg overflow-hidden shadow-md">
            <MapContainer
                center={[39.8283, -98.5795]} // Center of the USA
                zoom={4} // Zoomed out to show the entire USA
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {properties.map((property: Property) => (
                    <Marker
                        key={property.Property_ID}
                        position={[property.Property_Latitude, property.Property_Longitude]}
                        icon={markerIcon}
                    >
                        <Popup>
                            <div className="block w-[280px] h-[110px]">
                                <div className="flex gap-2">
                                    {/* Property Image with Fixed Width */}
                                    <JumbotronImageRotation
                                        property={property}
                                        enableAutoRotation={false}
                                        numberInRotation={1}
                                        image={property.images?.[0] || undefined}
                                        setShowJumbotronHighlightImage={() => null}
                                        classNames={{
                                            rotationWrapper: "w-full h-full p-1 flex items-center justify-center",
                                            rotationImageWrapper: "relative w-full h-auto",
                                            rotationImage: "w-full h-[110px] object-cover rounded-lg",
                                        }}
                                    />
                                    {/* <PropertyImageCard property={property} className="w-1/3 h-[110px] object-cover rounded-lg" /> */}
                                    
                                    <Link href={`/listing/${property.Property_ID}`}>
                                        <div className="flex-1 flex flex-col justify-between">
                                            {/* Property Postal Code and City */}
                                            <div className="text-sm text-gray-600">
                                                <span className="font-semibold">{property.Property_City}</span>
                                                <span className="ml-2 text-gray-500">{property.Property_Zip_Code}</span>
                                            </div>

                                            {/* Property Title */}
                                            <div className="mt-1 text-sm text-gray-800">
                                                {property.Property_Title}
                                            </div>

                                            <div className="mt-1 flex justify-between items-center">
                                                {/* Property Size and Rooms */}
                                                <div className="flex space-x-2">
                                                    <div className="text-sm text-gray-500">
                                                        {property.Property_Square_Feet}<small> m²</small>
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {property.Property_Num_Bedrooms}<small> vær.</small>
                                                    </div>
                                                </div>

                                                {/* Property Price */}
                                                <div className="text-lg font-bold text-green-600">
                                                    {property.Property_Price_Per_Month.toLocaleString()} kr.
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};
