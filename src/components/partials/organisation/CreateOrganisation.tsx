"use client";

// External
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Internal
import { useOrganisationsContext } from "@/contexts";
import { Organisation, OrganisationFields } from "@/types";
import { Block, Text } from "@/components/ui/block-text";
import { FlexibleBox } from "@/components/ui/flexible-box";
import { faBuilding } from "@fortawesome/free-solid-svg-icons";

// Dynamically import ReactQuill with SSR disabled
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css"; // Import the Quill styles
import { Card } from "../task/TaskDetails";
import { Heading } from "@/components/ui/heading";
import { Field } from "@/components/ui/input-field";
import { selectAuthUser, useTypedSelector } from "@/redux";

const CreateOrganisation: React.FC = () => {
    // Hooks
    const router = useRouter();
    const { addOrganisation } = useOrganisationsContext();

    // Redux
    const authUser = useTypedSelector(selectAuthUser)
    
    const [newOrganisation, setNewOrganisation] = useState<Organisation>({
        User_ID: 0, // This should be set based on the authenticated user
        Organisation_Name: "",
        Organisation_Description: "",
    });

    /**
     * Methods
     */
    // Handle input changes
    const handleInputChange = (field: OrganisationFields, value: string) => {
        setNewOrganisation((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Handle form submission
    const handleCreateOrganisation = async () => {
        if (!newOrganisation.Organisation_Name) {
            alert("Please enter an organisation name.");
            return;
        }

        if (newOrganisation.User_ID === 0) {
            alert("An error happened, assigning the organisation to you. Please try again.");
            return;
        }

        await addOrganisation(newOrganisation.User_ID, newOrganisation);
        router.push("/"); // Redirect after successful creation
    };

    /**
     * Effects
     */
    useEffect(() => {
        if (authUser && authUser.User_ID) setNewOrganisation({
            ...newOrganisation,
            User_ID: authUser.User_ID
        })
    }, [authUser])

    return (
        <Block className="page-content">
            <div className="mb-8">
                <FlexibleBox
                    title="Create New Organisation"
                    icon={faBuilding}
                    className="no-box w-auto inline-block"
                    numberOfColumns={2}
                >
                    <div className="bg-white shadow-md rounded-xl p-6">
                        <h2 className="text-xl font-semibold mb-4">Organisation Details</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field
                                lbl="Organisation Name"
                                value={newOrganisation.Organisation_Name}
                                onChange={(e: string) => handleInputChange("Organisation_Name", e)}
                                type="text"
                                disabled={false}
                                className="w-full"
                            />
                            <div className="col-span-1 sm:col-span-2">
                                <Text>Organisation Description</Text>
                                <ReactQuill
                                    className="w-full mt-2 border border-gray-300 rounded-md"
                                    theme="snow"
                                    value={newOrganisation.Organisation_Description}
                                    onChange={(value) => handleInputChange("Organisation_Description", value)}
                                    modules={{
                                        toolbar: [
                                            [{ header: "1" }, { header: "2" }, { font: [] }],
                                            [{ list: "ordered" }, { list: "bullet" }],
                                            ["bold", "italic", "underline", "strike"],
                                            [{ align: [] }],
                                            ["link"],
                                            ["blockquote"],
                                        ],
                                    }}
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <button 
                                onClick={handleCreateOrganisation}
                                className="button-blue"
                            >
                                Create Organisation
                            </button>
                        </div>
                    </div>
                </FlexibleBox>
            </div>
        </Block>
    );
};

export default CreateOrganisation;
