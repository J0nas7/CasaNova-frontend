"use client"

// External
import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { TextField, Card, CardContent, Typography, Grid, Box, Select, MenuItem, FormControl, InputLabel, FormControlLabel, Checkbox } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'next-i18next';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChair, faPlus } from '@fortawesome/free-solid-svg-icons';

// Internal
import { useTeamsContext, useTeamUserSeatsContext, useUsersContext } from '@/contexts';
import { Team, TeamUserSeat, TeamUserSeatFields, User } from '@/types';
import { Block, Heading, Text } from '@/components';
import { selectAuthUser, useTypedSelector } from '@/redux';
import { useAxios } from '@/hooks';
import { FlexibleBox } from '@/components/ui/flexible-box';

const TeamUserSeatsManager: React.FC = () => {
    const { t } = useTranslation(['team'])
    const router = useRouter()
    const searchParams = useSearchParams()

    const { teamId } = useParams<{ teamId: string }>(); // Get teamId from URL
    const urlSeatId = searchParams.get("seatId")

    const {
        teamUserSeatsById,
        readTeamUserSeatsByTeamId,
        addTeamUserSeat,
        saveTeamUserSeatChanges,
        removeTeamUserSeat
    } = useTeamUserSeatsContext();
    const { teamById, readTeamById } = useTeamsContext();
    const { addUser } = useUsersContext(); // Assuming you have a `UsersContext` for adding new users
    const authUser = useTypedSelector(selectAuthUser); // Redux

    const [renderUserSeats, setRenderUserSeats] = useState<TeamUserSeat[]>([]);
    const [renderTeam, setRenderTeam] = useState<Team | undefined>(undefined);
    const [selectedSeat, setSelectedSeat] = useState<TeamUserSeat | undefined>(undefined);
    const [displayInviteForm, setDisplayInviteForm] = useState<boolean>(false);
    // New User Form State
    const [newUserDetails, setNewUserDetails] = useState({
        email: '',
        firstName: '',
        lastName: '',
        role: 'user', // default role
        status: 'active', // default status
    });
    
    /** 
     * Methods
     */
    const handleSaveChanges = () => {
        console.log("selectedSeat", selectedSeat)
        if (selectedSeat) {
            saveTeamUserSeatChanges(selectedSeat, parseInt(teamId));
        }
    };

    const handleRemoveSeat = (seatId: number) => removeTeamUserSeat(seatId, parseInt(teamId))

    const handleSeatChange = (field: TeamUserSeatFields, value: string) => {
        if (selectedSeat) {
            setSelectedSeat((prevSeat) => ({
                ...prevSeat!,
                [field]: value,
            }));
        }
    };

    const handleSelectSeat = (seat: TeamUserSeat) => {
        if (!seat.Seat_ID) return

        const url = new URL(window.location.href)
        url.searchParams.set("seatId", seat.Seat_ID.toString())

        router.push(url.toString(), { scroll: false }); // Prevent full page reload
    };

    const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewUserDetails((prevDetails) => ({
            ...prevDetails,
            [name]: value,
        }));
    };

    const handleCreateNewUser = async () => {
        const { email, firstName, lastName, role, status } = newUserDetails;
        if (!email || !firstName || !lastName) {
            alert(t('team:seatsManager:pleaseFillInAllFields'));
            return;
        }

        // Add new user
        const newUser: User = {
            User_Email: email,
            User_FirstName: firstName,
            User_Surname: lastName,
            User_Status: status,
            User_CreatedAt: new Date().toISOString(),
        };
        await addUser(parseInt(teamId), newUser);

        // After user is created, add the seat for the user
        // Assuming you have a method to create a seat for the user
        const newSeat: TeamUserSeat = {
            Seat_Role: role,
            Seat_Status: status,
            Team_ID: parseInt(teamId),
        };
        await saveTeamUserSeatChanges(newSeat, parseInt(teamId));
    };

    const availablePermissions = [
        "Manage Team Members", "Modify Team Settings", "Modify Organisation Settings"
    ];

    const togglePermission = (permission: string, isChecked: boolean) => {
        setSelectedSeat((prevSeat) => {
            if (!prevSeat) return prevSeat;
            
            const updatedPermissions = isChecked
                ? [
                    ...(Array.isArray(prevSeat.Seat_Permissions)
                        ? prevSeat.Seat_Permissions
                        : JSON.parse(prevSeat.Seat_Permissions || "[]")), // Parse JSON if it's a string
                    permission
                ]
                : (
                    (Array.isArray(prevSeat.Seat_Permissions)
                        ? prevSeat.Seat_Permissions
                        : JSON.parse(prevSeat.Seat_Permissions || "[]"))
                ).filter((perm: string) => perm !== permission);

            return { ...prevSeat, Seat_Permissions: JSON.stringify(updatedPermissions) };
        });
    };

    /**
     * Effects
     */
    useEffect(() => {
        if (teamId) {
            readTeamById(parseInt(teamId))
            readTeamUserSeatsByTeamId(parseInt(teamId));
        }
    }, [teamId]);

    useEffect(() => {
        setRenderUserSeats(teamUserSeatsById);
        setRenderTeam(teamById)
    }, [teamUserSeatsById, teamById]);

    useEffect(() => {
        if (urlSeatId && authUser && renderTeam?.organisation?.User_ID !== authUser.User_ID) {
            router.push(`/team/${renderTeam?.Team_ID}/seats`)
            return
        }

        if (urlSeatId === "new") {
            setDisplayInviteForm(true)
            setSelectedSeat(undefined)
        } else if (urlSeatId && renderUserSeats.length) {
            const seat = renderUserSeats.find(seat => seat.Seat_ID === parseInt(urlSeatId))
            setDisplayInviteForm(false)
            setSelectedSeat(seat)
        }
    }, [urlSeatId, renderUserSeats])

    return (
        <TeamUserSeatsView
            renderUserSeats={renderUserSeats}
            renderTeam={renderTeam}
            authUser={authUser}
            selectedSeat={selectedSeat}
            displayInviteForm={displayInviteForm}
            newUserDetails={newUserDetails}
            teamId={teamId}
            t={t}
            availablePermissions={availablePermissions}
            addTeamUserSeat={addTeamUserSeat}
            readTeamUserSeatsByTeamId={readTeamUserSeatsByTeamId}
            handleSelectSeat={handleSelectSeat}
            handleRemoveSeat={handleRemoveSeat}
            handleSaveChanges={handleSaveChanges}
            handleSeatChange={handleSeatChange}
            handleUserInputChange={handleUserInputChange}
            handleCreateNewUser={handleCreateNewUser}
            setNewUserDetails={setNewUserDetails}
            setSelectedSeat={setSelectedSeat}
            setDisplayInviteForm={setDisplayInviteForm}
            togglePermission={togglePermission}
        />
    );
};

export interface TeamUserSeatsViewProps {
    renderUserSeats: TeamUserSeat[];
    renderTeam: Team | undefined;
    authUser: User | undefined;
    selectedSeat: TeamUserSeat | undefined;
    displayInviteForm: boolean | undefined
    newUserDetails: {
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        status: string;
    };
    teamId: string
    t: TFunction
    availablePermissions: string[]
    addTeamUserSeat: (parentId: number, object?: TeamUserSeat) => Promise<void>
    readTeamUserSeatsByTeamId: (parentId: number) => Promise<void>
    handleSelectSeat: (seat: TeamUserSeat) => void;
    handleRemoveSeat: (seatId: number) => void;
    handleSaveChanges: () => void;
    handleSeatChange: (field: TeamUserSeatFields, value: string) => void;
    handleUserInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleCreateNewUser: () => void;
    setNewUserDetails: (value: React.SetStateAction<{
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        status: string;
    }>) => void
    setSelectedSeat: React.Dispatch<React.SetStateAction<TeamUserSeat | undefined>>
    setDisplayInviteForm: React.Dispatch<React.SetStateAction<boolean>>
    togglePermission: (permission: string, isChecked: boolean) => void
}

export const TeamUserSeatsView: React.FC<TeamUserSeatsViewProps> = ({
    renderUserSeats,
    renderTeam,
    authUser,
    selectedSeat,
    displayInviteForm,
    newUserDetails,
    teamId,
    t,
    availablePermissions,
    addTeamUserSeat,
    readTeamUserSeatsByTeamId,
    handleSelectSeat,
    handleRemoveSeat,
    handleSaveChanges,
    handleSeatChange,
    handleUserInputChange,
    handleCreateNewUser,
    setNewUserDetails,
    setSelectedSeat,
    setDisplayInviteForm,
    togglePermission
}) => {
    return (
        <Block className="page-content">
            <Box mb={6}>
                <Link
                    href={`/team/${renderTeam?.Team_ID}`}
                    className="blue-link"
                >
                    &laquo; Go to Team
                </Link>
                {/* <Heading variant="h1">{t('team:seatsManager:manageTeamUserSeats')}</Heading> */}
                <FlexibleBox
                    title={t('team:seatsManager:manageTeamUserSeats')}
                    icon={faChair}
                    className="no-box w-auto inline-block"
                    numberOfColumns={2}
                >
                    <Card className="shadow-lg rounded-lg mb-4">
                        <CardContent>
                            {authUser && renderTeam?.organisation?.User_ID === authUser.User_ID && (
                                <Link
                                    className="blue-link mb-3 !inline-flex gap-2 items-center"
                                    href="?seatId=new"
                                >
                                    <FontAwesomeIcon icon={faPlus} />
                                    <Text variant="span">New Invite</Text>
                                </Link>
                            )}
                            <Typography variant="h6" gutterBottom>
                                {t('team:seatsManager:teamUserSeats')}: {renderTeam?.Team_Name}
                            </Typography>

                            {!renderUserSeats.length && authUser && renderTeam?.organisation?.User_ID === authUser.User_ID ? (
                                <Block>{t('team:seatsManager:length0_iamowner')}</Block>
                            ) : (
                                <Grid container spacing={3}>
                                    {Array.isArray(renderUserSeats) && renderUserSeats.map((seat) => (
                                        <Grid item xs={12} sm={6} md={4} key={seat.Seat_ID}>
                                            <Card className="border border-gray-300 rounded-lg hover:shadow-xl transition-all">
                                                <CardContent className="p-4">
                                                    <Block variant="span" className="flex flex-col gap-3">
                                                        <Typography variant="h6" className="font-semibold text-lg">
                                                            {seat.user?.User_FirstName} {seat.user?.User_Surname}
                                                        </Typography>
                                                        <Typography variant="body2" color="textSecondary">
                                                            {t('team:seatsManager:role')}: {seat.Seat_Role}
                                                        </Typography>
                                                        <Typography variant="body2" color="textSecondary">
                                                            {t('team:seatsManager:status')}: {seat.Seat_Status}
                                                        </Typography>

                                                        {authUser && renderTeam?.organisation?.User_ID === authUser.User_ID && (
                                                            <div className="flex justify-between mt-4">
                                                                <button
                                                                    onClick={() => handleSelectSeat(seat)}
                                                                    className="blue-link w-[48%]"
                                                                >
                                                                    {t('team:seatsManager:edit')}
                                                                </button>
                                                                <button
                                                                    onClick={() => seat.Seat_ID && handleRemoveSeat(seat.Seat_ID)}
                                                                    className="blue-link w-[48%]"
                                                                >
                                                                    {t('team:seatsManager:remove')}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </Block>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </CardContent>
                    </Card>
                </FlexibleBox>

                {selectedSeat ? (
                    <Card className="shadow-lg rounded-lg mt-4">
                        <CardContent className="p-4">
                            <Block className="mb-4">
                                <Typography variant="h6" gutterBottom className="font-semibold">
                                    {t('team:seatsManager:editUserSeat')}
                                </Typography>
                                <Text variant="span" className="font-semibold">
                                    {selectedSeat.user?.User_FirstName} {selectedSeat.user?.User_Surname}
                                </Text>
                            </Block>

                            <Grid container spacing={3}>
                                {/* Role Input */}
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label={t('team:seatsManager:userRole')}
                                        variant="outlined"
                                        fullWidth
                                        value={selectedSeat.Seat_Role}
                                        onChange={(e) => handleSeatChange('Seat_Role', e.target.value)}
                                        className="bg-white"
                                    />
                                </Grid>

                                {/* Status Dropdown */}
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>{t('team:seatsManager:status')}</InputLabel>
                                        <Select
                                            value={selectedSeat.Seat_Status}
                                            onChange={(e) => handleSeatChange('Seat_Status', e.target.value)}
                                            className="bg-white"
                                        >
                                            <MenuItem value="Active">{t('team:seatsManager:active')}</MenuItem>
                                            <MenuItem value="Inactive">{t('team:seatsManager:inactive')}</MenuItem>
                                            <MenuItem value="Pending">{t('team:seatsManager:pending')}</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>

                            {/* Permissions Section */}
                            <Box mt={4}>
                                <Typography variant="subtitle1" gutterBottom>
                                    {t('team:seatsManager:permissions')}
                                </Typography>

                                <Grid container spacing={2}>
                                    {renderTeam?.projects?.map(project => {
                                        const permissions = [
                                            {
                                                key: `editProject.${project.Project_ID}`,
                                                label: `Manage Project: ${project.Project_Name}`
                                            },
                                            {
                                                key: `archivingTasks.${project.Project_ID}`,
                                                label: `Archiving Tasks: ${project.Project_Name}`
                                            }
                                        ]

                                        return permissions.map(permission => (
                                            <Grid item key={permission.key} xs={6} sm={4}>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={selectedSeat.Seat_Permissions?.includes(permission.key) || false}
                                                            onChange={(e) => togglePermission(permission.key, e.target.checked)}
                                                        />
                                                    }
                                                    label={permission.label}
                                                />
                                            </Grid>
                                        ))
                                    })}

                                    {availablePermissions.map((permission) => (
                                        <Grid item key={permission} xs={6} sm={4}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={selectedSeat.Seat_Permissions?.includes(permission) || false}
                                                        onChange={(e) => togglePermission(permission, e.target.checked)}
                                                    />
                                                }
                                                label={permission}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>

                            {/* Actions */}
                            <Box mt={4} className="flex gap-4 justify-end">
                                <button
                                    className="blue-link-light"
                                    onClick={() => {
                                        setSelectedSeat(undefined)
                                        setDisplayInviteForm(false)
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="button-blue px-6 py-2"
                                    onClick={handleSaveChanges}
                                >
                                    {t('team:seatsManager:saveChanges')}
                                </button>
                            </Box>
                        </CardContent>
                    </Card>
                ) : displayInviteForm ? (
                    <Card className="shadow-lg rounded-lg mt-6">
                        <InviteUserForm
                            teamId={teamId}
                            t={t}
                            addTeamUserSeat={addTeamUserSeat}
                            readTeamUserSeatsByTeamId={readTeamUserSeatsByTeamId}
                            setSelectedSeat={setSelectedSeat}
                            setDisplayInviteForm={setDisplayInviteForm}
                        />
                    </Card>
                ) : (
                    <></>
                )}
            </Box>
        </Block>
    );
};

export interface InviteUserFormProps {
    teamId: string
    t: TFunction
    addTeamUserSeat: (parentId: number, object?: TeamUserSeat) => Promise<void>
    readTeamUserSeatsByTeamId: (parentId: number) => Promise<void>
    setSelectedSeat: React.Dispatch<React.SetStateAction<TeamUserSeat | undefined>>
    setDisplayInviteForm: React.Dispatch<React.SetStateAction<boolean>>
}

const InviteUserForm: React.FC<InviteUserFormProps> = ({
    teamId,
    t,
    addTeamUserSeat,
    readTeamUserSeatsByTeamId,
    setSelectedSeat,
    setDisplayInviteForm
}) => {
    // Hooks
    const { httpPostWithData } = useAxios();

    // Internal variables
    const [email, setEmail] = useState("");
    const [user, setUser] = useState<User | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearchUser = async () => {
        // Email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(email)) {
            setError(t("team:seatsManager:invalidEmail"));
            return;
        }

        setLoading(true);
        setError(null);
        setUser(undefined);

        try {
            const data = await httpPostWithData("users/userByEmail", { email });
            console.log(data)

            if (data.message) {
                throw new Error(t("team:seatsManager:userNotFound"));
                return;
            }

            setUser(data);
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.log(error || "An error occurred while searching for the user.");
                setError(error.message)
            } else {
                console.log("An unknown error occurred.");
                setError("An unknown error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSendInvite = async () => {
        if (!user) {
            setError(t("team:seatsManager:userNotFound"));
            return;
        }

        // Construct the new seat object
        const newSeat: TeamUserSeat = {
            Team_ID: parseInt(teamId),
            User_ID: user.User_ID, // Use the found user's ID
            Seat_Role: "Member", // Default role
            Seat_Status: "Pending", // Default status
        };

        try {
            // Send a request to create the new seat for the user
            await addTeamUserSeat(newSeat.Team_ID, newSeat);

            // Refresh seats list
            await readTeamUserSeatsByTeamId(parseInt(teamId))

            // Show success message
            alert(`${t("team:seatsManager:inviteSent")} ${email}`);
        } catch (err) {
            console.error("Failed to create seat:", err);
            setError(t("team:seatsManager:createSeatError"));
        }
    };

    return (
        <CardContent className="p-4">
            <Typography variant="h6" gutterBottom>
                {t("team:seatsManager:searchAndInviteUser")}
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <TextField
                        label={t("team:seatsManager:email")}
                        variant="outlined"
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-white"
                    />
                </Grid>
            </Grid>

            <Box mt={4} className="flex gap-4 justify-end">
                <button
                    className="blue-link-light"
                    onClick={() => {
                        setDisplayInviteForm(false)
                        setSelectedSeat(undefined)
                    }}
                >
                    Cancel
                </button>
                <button
                    onClick={handleSearchUser}
                    disabled={loading}
                    className="button-blue px-6 py-2"
                >
                    {t("team:seatsManager:searchUser")}
                </button>
            </Box>

            {error && <Typography color="error" mt={2}>{error}</Typography>}
            {user && (
                <Box mt={4}>
                    <Typography>{t("team:seatsManager:userFound")}</Typography>
                    <Block variant="span">
                        Name: {user.User_FirstName + " " + user.User_Surname}
                    </Block>
                    <button
                        onClick={handleSendInvite}
                        className="button-blue mt-2 px-6 py-2"
                    >
                        {t("team:seatsManager:sendInvite")}
                    </button>
                </Box>
            )}
        </CardContent>
    );
}

export default TeamUserSeatsManager;
