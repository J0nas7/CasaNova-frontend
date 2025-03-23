"use client"

// External
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faBed, faBath, faRulerCombined, faUsers, faMoneyBillWave } from "@fortawesome/free-solid-svg-icons";

// Internal
import { usePropertiesContext } from '@/contexts/'; // Ensure this is correctly set up
import { Property, User } from '@/types';
import Link from 'next/link';
import { Block, Text } from '@/components/ui/block-text';
import { selectAuthUser, useTypedSelector } from '@/redux';
import { FlexibleBox } from '@/components/ui/flexible-box';

const PropertyDetails: React.FC = () => {
    const router = useRouter()
    const { propertyId } = useParams<{ propertyId: string }>(); // Get propertyId from URL
    const { propertyById, readPropertyById } = usePropertiesContext()
    const authUser = useTypedSelector(selectAuthUser) // Redux

    const [renderProperty, setRenderProperty] = useState<Property | undefined>(undefined)

    useEffect(() => { readPropertyById(parseInt(propertyId)); }, [propertyId])
    useEffect(() => {
        if (propertyId) {
            setRenderProperty(propertyById)
            document.title = `Property in ${propertyById?.Property_City} - CasaNova`
        }
    }, [propertyById])

    if (!renderProperty) return <div>Loading...</div>

    return (
        <PropertyDetailsView
            property={renderProperty}
            authUser={authUser}
        />
    );
};

type PropertyDetailsViewProps = {
    property: Property
    authUser: User | undefined
}

export const PropertyDetailsView: React.FC<PropertyDetailsViewProps> = ({ property, authUser }) => {
    return (
        <Block className="page-content">
            {/* Jumbotron - Property Images */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {property.images && property.images.length > 0 ? (
                    property.images.slice(0, 3).map((image, index) => (
                        <div key={index} className="relative w-full h-[500px] overflow-hidden rounded-lg shadow-lg">
                            <img
                                src={image.Image_Image_URL}
                                alt={`Property Image ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))
                ) : (
                    Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="relative w-full h-[500px] overflow-hidden rounded-lg shadow-lg">
                            <img
                                src="https://via.placeholder.com/400x500?text=No+Image+Available"
                                alt="No Image Available"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))
                )}
            </div>
            
            {/* Property Information Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {/* Left Section - Title & Description */}
                <div className="col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-4">{property.Property_Title}</h2>
                    <p className="text-gray-600">{property.Property_Description}</p>
                </div>

                {/* Right Section - Property Details */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">🏠 Property Details</h2>
                    <ul className="space-y-3 text-gray-700">
                        <li className="flex items-center gap-3">
                            <FontAwesomeIcon icon={faMoneyBillWave} className="text-green-500" />
                            <span><strong>Price:</strong> ${property.Property_Price_Per_Month} / month</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <FontAwesomeIcon icon={faBed} className="text-blue-500" />
                            <span><strong>Bedrooms:</strong> {property.Property_Num_Bedrooms}</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <FontAwesomeIcon icon={faBath} className="text-blue-400" />
                            <span><strong>Bathrooms:</strong> {property.Property_Num_Bathrooms}</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <FontAwesomeIcon icon={faRulerCombined} className="text-gray-600" />
                            <span><strong>Size:</strong> {property.Property_Square_Feet} sqft</span>
                        </li>
                    </ul>
                </div>
            </div>
        </Block>
    );
};

export default PropertyDetails;