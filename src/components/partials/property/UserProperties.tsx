"use client";

// External Imports
import { faHouseChimney, faPencil, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

// Internal Imports
import { SignInView } from '@/components/partials/auth/sign-in';
import { Block, Text } from "@/components/ui/block-text";
import { FlexibleBox } from "@/components/ui/flexible-box";
import { usePropertiesContext } from "@/contexts";
import { selectAuthUser, useTypedSelector } from "@/redux";
import { Property } from "@/types";
import Link from "next/link";
import { PropertyCard } from "./SearchProperties";

const UserProperties: React.FC = () => {
    // Hooks
    const router = useRouter();
    const { propertiesById, readPropertiesByUserId, removeProperty } = usePropertiesContext();

    // Redux (Authenticated User)
    const authUser = useTypedSelector(selectAuthUser);

    // Local State
    const [renderProperties, setRenderProperties] = useState<Property[] | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);

    // Fetch properties when component mounts
    useEffect(() => {
        const fetchProperties = async () => {
            if (authUser?.User_ID) {
                await readPropertiesByUserId(authUser.User_ID);
                setLoading(false);
            }
        }
        fetchProperties();
    }, [authUser]);
    useEffect(() => {
        if (Array.isArray(propertiesById)) {
            setRenderProperties(propertiesById)
        }
    }, [propertiesById]);

    // Handle deletion of property
    const handleDelete = async (property: Property) => {
        if (!authUser?.User_ID || !property.Property_ID) return

        await removeProperty(property.Property_ID, authUser.User_ID)
        await readPropertiesByUserId(authUser.User_ID)
    };

    if (!authUser?.User_ID) return <SignInView />

    if (loading) {
        return (
            <div className="flex flex-col gap-4 justify-center items-center">
                <img
                    src="/red-spinner.gif"
                    alt="Loading..."
                    className="w-10 h-10"
                />
                <p className="text-gray-500 text-center">Loading properties...</p>
            </div>
        )
    }

    if (!renderProperties || renderProperties.length === 0) {
        return (
            <Block className="page-content">
                <Text>You have no properties listed. Would you like to add one?</Text>
                <Link href="/search" className="blue-link-light">Go to Search</Link>
            </Block>
        )
    }

    return (
        <div className="container mx-auto py-8">
            <FlexibleBox
                title={`My Listings (${renderProperties?.length || 0})`}
                icon={faHouseChimney}
                className="no-box w-auto mt-4"
            >
                {/* Properties Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {renderProperties.length && renderProperties.map((property) => (
                        <Block className="flex gap-4 flex-col bg-white p-4 rounded-lg shadow-md">
                            <PropertyCard key={property.Property_ID} property={property} />
                            <Block className="flex justify-between">
                                <Link
                                    href={`/edit-listing/${property.Property_ID}`}
                                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
                                >
                                    <FontAwesomeIcon icon={faPencil} />
                                    Edit
                                </Link>
                                <button
                                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
                                >
                                    <FontAwesomeIcon icon={faTrashCan} />
                                    Delete
                                </button>
                            </Block>
                        </Block>
                    ))}
                </div>
            </FlexibleBox>
        </div>
    );
};

export default UserProperties;
