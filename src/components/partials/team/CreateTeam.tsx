"use client";

// External
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Internal
import { useOrganisationsContext, useTeamsContext } from "@/contexts";
import { Team, TeamFields } from "@/types";
import { Block, Text } from "@/components/ui/block-text";
import { FlexibleBox } from "@/components/ui/flexible-box";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import { Heading } from "@/components/ui/heading";
import { Field } from "@/components/ui/input-field";
import { selectAuthUser, useTypedSelector } from "@/redux";

// Dynamically import ReactQuill with SSR disabled
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css"; // Import Quill styles

const CreateTeam: React.FC = () => {
    // Hooks
    const router = useRouter();
    const authUser = useTypedSelector(selectAuthUser)
    const { addTeam } = useTeamsContext()
    const { organisationById, readOrganisationById } = useOrganisationsContext()
    
    // Internal variables
    const { organisationId } = useParams<{ organisationId: string }>(); // Get organisationId from URL
    const [newTeam, setNewTeam] = useState<Team>({
        Organisation_ID: parseInt(organisationId),
        Team_Name: "",
        Team_Description: "",
    });

    /**
     * Methods
     */
    // Handle input changes
    const handleInputChange = (field: TeamFields, value: string) => {
        setNewTeam((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Handle form submission
    const handleCreateTeam = async () => {
        if (!newTeam.Team_Name.trim()) {
            alert("Please enter a team name.");
            return;
        }

        await addTeam(parseInt(organisationId), newTeam);
        router.push(`/organisation/${organisationId}`); // Redirect to organisation page
    };

    /**
     * Effects
     */
    useEffect(() => {
        if (organisationId) readOrganisationById(parseInt(organisationId))
    }, [organisationId])

    useEffect(() => {
        if (organisationById && authUser) {
            if (organisationById.User_ID !== authUser.User_ID) {
                router.push(`/organisation/${organisationById.Organisation_ID}`)
            }
        }
    }, [organisationById])

    return (
        <Block className="page-content">
            <div className="mb-8">
                <FlexibleBox
                    title="Create New Team"
                    icon={faUsers}
                    className="no-box w-auto inline-block"
                    numberOfColumns={2}
                >
                    <div className="bg-white shadow-md rounded-xl p-6">
                        <Heading variant="h2" className="mb-4">
                            Team Details
                        </Heading>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field
                                lbl="Team Name"
                                value={newTeam.Team_Name}
                                onChange={(e: string) => handleInputChange("Team_Name", e)}
                                type="text"
                                disabled={false}
                                className="w-full"
                            />
                            <div className="col-span-1 sm:col-span-2">
                                <Text>Team Description</Text>
                                <ReactQuill
                                    className="w-full mt-2 border border-gray-300 rounded-md"
                                    theme="snow"
                                    value={newTeam.Team_Description || ""}
                                    onChange={(value) => handleInputChange("Team_Description", value)}
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
                                onClick={handleCreateTeam}
                                className="button-blue"
                            >
                                Create Team
                            </button>
                        </div>
                    </div>
                </FlexibleBox>
            </div>
        </Block>
    );
};

export default CreateTeam;
