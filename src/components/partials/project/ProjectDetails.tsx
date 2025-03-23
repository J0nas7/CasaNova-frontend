"use client"

// External
import React, { useEffect, useState } from 'react';
import { useParams } from "next/navigation";
import { TextField, Card, CardContent, Typography, Grid } from '@mui/material';
import Link from 'next/link';
import { faClock, faGauge, faLightbulb, faList, faWindowRestore } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/navigation';

// Dynamically import ReactQuill with SSR disabled
import "react-quill/dist/quill.snow.css"; // Import the Quill styles
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// Internal
import { useProjectsContext } from '@/contexts/';
import { Project, ProjectFields, User } from '@/types';
import { Block, Heading, Text } from '@/components';
import { selectAuthUser, useTypedSelector } from '@/redux';
import { FlexibleBox } from '@/components/ui/flexible-box';

const ProjectDetails: React.FC = () => {
    const router = useRouter()
    const { projectId } = useParams<{ projectId: string }>(); // Get projectId from URL
    const { projectById, readProjectById, saveProjectChanges, removeProject } = useProjectsContext()
    const authUser = useTypedSelector(selectAuthUser) // Redux

    const [renderProject, setRenderProject] = useState<Project | undefined>(undefined)

    useEffect(() => { readProjectById(parseInt(projectId)); }, [projectId]);
    useEffect(() => {
        if (projectId) {
            setRenderProject(projectById)
            document.title = `Project: ${projectById?.Project_Name} - GiveOrTake`
        }
    }, [projectById])

    const handleHTMLInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        handleProjectChange(name as ProjectFields, value)
    };

    // Handle input changes for text fields
    const handleProjectChange = (field: ProjectFields, value: string) => {
        if (!renderProject) return

        setRenderProject((prev) => ({
            ...prev!,
            [field]: value
        }));
    }

    const handleSaveChanges = async () => {
        if (renderProject) await saveProjectChanges(renderProject, renderProject.Team_ID)
    }

    const handleDeleteProject = async () => {
        if (!renderProject || !renderProject.Project_ID) return

        const removed = await removeProject(renderProject.Project_ID, renderProject.Team_ID)
        if (!removed) return
        
        router.push(`/team/${renderProject.Project_ID}`)
    }

    if (!renderProject) {
        return <div>Loading...</div>;
    }

    return (
        <ProjectDetailsView
            renderProject={renderProject}
            authUser={authUser}
            handleProjectChange={handleProjectChange}
            handleSaveChanges={handleSaveChanges}
            handleDeleteProject={handleDeleteProject}
        />
    );
};

export interface ProjectDetailsViewProps {
    renderProject: Project | undefined;
    authUser: User | undefined;
    handleProjectChange: (field: ProjectFields, value: string) => void;
    handleSaveChanges: () => Promise<void>
    handleDeleteProject: () => Promise<void>
}

export const ProjectDetailsView: React.FC<ProjectDetailsViewProps> = ({
    renderProject,
    authUser,
    handleProjectChange,
    handleSaveChanges,
    handleDeleteProject
}) => {
    return (
        <Block className="page-content">
            <Link
                href={`/team/${renderProject?.team?.Team_ID}`}
                className="blue-link"
            >
                &laquo; Go to Team
            </Link>
            {/* <Heading variant="h1">Project Info</Heading> */}
            <FlexibleBox
                title={`Project Info`}
                titleAction={<>
                    <Block className="flex flex-col sm:flex-row gap-2 items-center">
                        <Link
                            href={`/project/dashboard/${renderProject?.Project_ID}`}
                            className="blue-link !inline-flex gap-2 items-center"
                        >
                            <FontAwesomeIcon icon={faGauge} />
                            <Text variant="span">Dashboard</Text>
                        </Link>
                        <Link
                            href={`/backlog/${renderProject?.Project_ID}`}
                            className="blue-link !inline-flex gap-2 items-center"
                        >
                            <FontAwesomeIcon icon={faList} />
                            <Text variant="span">Backlog</Text>
                        </Link>
                        <Link
                            href={`/kanban/${renderProject?.Project_ID}`}
                            className="blue-link !inline-flex gap-2 items-center"
                        >
                            <FontAwesomeIcon icon={faWindowRestore} />
                            <Text variant="span">Kanban Board</Text>
                        </Link>
                        <Link
                            href={`/time-tracks/project/${renderProject?.Project_ID}`}
                            className="blue-link !inline-flex gap-2 items-center"
                        >
                            <FontAwesomeIcon icon={faClock} />
                            <Text variant="span">Time Entries</Text>
                        </Link>
                    </Block>
                </>}
                icon={faLightbulb}
                className="no-box w-auto inline-block"
                numberOfColumns={2}
            >
                <Card>
                    {authUser && renderProject?.team?.organisation?.User_ID === authUser.User_ID ? (
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Edit Project Details
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Project Name"
                                        variant="outlined"
                                        fullWidth
                                        value={renderProject?.Project_Name}
                                        onChange={(e) => handleProjectChange("Project_Name", e.target.value)}
                                        name="Project_Name"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Project Key"
                                        variant="outlined"
                                        fullWidth
                                        value={renderProject?.Project_Key}
                                        onChange={(e) => handleProjectChange("Project_Key", e.target.value)}
                                        name="Project_Key"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Text>Project Description</Text>
                                    <ReactQuill
                                        className="w-full"
                                        theme="snow"
                                        value={renderProject?.Project_Description}
                                        onChange={(e: string) => handleProjectChange("Project_Description", e)}
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
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Start Date"
                                        variant="outlined"
                                        fullWidth
                                        type="date"
                                        value={renderProject?.Project_Start_Date || ''}
                                        onChange={(e) => handleProjectChange("Project_Start_Date", e.target.value)}
                                        name="Project_Start_Date"
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="End Date"
                                        variant="outlined"
                                        fullWidth
                                        type="date"
                                        value={renderProject?.Project_End_Date || ''}
                                        onChange={(e) => handleProjectChange("Project_End_Date", e.target.value)}
                                        name="Project_End_Date"
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                            </Grid>
                            <Block className="mt-2 flex justify-between">
                                <button onClick={handleSaveChanges} className="button-blue">
                                    Save Changes
                                </button>
                                <button onClick={handleDeleteProject} className="blue-link-light red-link-light">
                                    Delete Project
                                </button>
                            </Block>
                        </CardContent>
                    ) : (
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Project Details
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <strong>Project Name:</strong><br />
                                    {renderProject?.Project_Name}
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <strong>Project Status:</strong><br />
                                    {renderProject?.Project_Status}
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <strong>Project Key:</strong><br />
                                    {renderProject?.Project_Key}-0
                                </Grid>
                                <Grid item xs={12}>
                                    <strong>Project Description:</strong><br />
                                    <div className="bg-gray-100 p-2" dangerouslySetInnerHTML={{
                                        __html: renderProject?.Project_Description || 'No description available'
                                    }} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <strong>Start Date:</strong><br />
                                    {renderProject?.Project_Start_Date}
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <strong>End Date</strong><br />
                                    {renderProject?.Project_End_Date}
                                </Grid>
                            </Grid>
                        </CardContent>
                    )}
                </Card>
            </FlexibleBox>
        </Block>
    );
};

export default ProjectDetails;
