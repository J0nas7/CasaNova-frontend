// External
import React, { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCopy, faEye, faEyeSlash, faPencil, faTrashCan, faXmark } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

// Internal
import { Block, Field, Heading, Text } from '@/components'
import { useAxios } from '@/hooks';
import { useProjectsContext, useTasksContext } from '@/contexts';
import { Router } from 'next/router';
import clsx from 'clsx';
import { Project, Task } from '@/types';

export const TaskBulkActionMenu = () => {
    // Hooks
    const router = useRouter()
    const { projectId } = useParams<{ projectId: string }>(); // Get projectId from URL
    const searchParams = useSearchParams()
    const { httpPostWithData } = useAxios()
    const { readTasksByProjectId } = useTasksContext()

    // Internal variables
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
    const [copySuccess, setCopySuccess] = useState(false)
    const [taskBulkEditing, setTaskBulkEditing] = useState(false)
    const [taskBulkFocus, setTaskBulkFocus] = useState<boolean>(false)
    const urlTaskIds = searchParams.get("taskIds")
    const urlTaskBulkFocus = searchParams.get("taskBulkFocus")

    // Methods
    const updateURLParams = (returnUrl?: boolean) => {
        const url = new URL(window.location.href);

        url.searchParams.delete("taskIds")

        if (returnUrl) {
            return url.toString()
        } else {
            router.push(url.toString(), { scroll: false }); // Prevent full page reload
        }
    }

    const handleCopy = async (textToCopy: string) => {
        try {
            // Copy the text to clipboard
            await navigator.clipboard.writeText(textToCopy);
            setCopySuccess(true);
            // Clear the success message after a short time
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            setCopySuccess(false);
            console.error("Failed to copy text:", err);
        }
    }

    const handleEdit = async () => setTaskBulkEditing(true)

    const handleDelete = async () => {
        if (!selectedTaskIds.length) return

        if (!confirm("Are you sure you want to delete the items?")) return

        const result = await httpPostWithData("tasks/bulk-destroy", {
            task_ids: JSON.stringify(selectedTaskIds)
        })

        if (result.success) {
            await readTasksByProjectId(parseInt(projectId), true)

            updateURLParams()
        }
    }

    const handleFocus = (newFocus: boolean) => {
        const url = new URL(window.location.href);
        if (newFocus) {
            url.searchParams.set("taskBulkFocus", "1")
        } else {
            url.searchParams.delete("taskBulkFocus")
        }
        
        return url.toString()
    }

    /**
     * Effects
     */
    // Get user IDs from URL
    useEffect(() => {
        if (urlTaskIds) {
            // If userIds exist in the URL, use them
            const taskIdsFromURL = urlTaskIds ? urlTaskIds.split(",") : [];
            setSelectedTaskIds(taskIdsFromURL);
        }
    }, [urlTaskIds])

    useEffect(() => {
        setTaskBulkFocus(urlTaskBulkFocus ? true : false)
    }, [urlTaskBulkFocus])

    if (!urlTaskIds) return null

    return (
        <>
            <Block
                className={clsx(
                    "task-bulkedit-container",
                    { ["task-bulkedit-container-open"]: taskBulkEditing }
                )}
            >
                {taskBulkEditing && <BulkEdit selectedTaskIds={selectedTaskIds} setTaskBulkEditing={setTaskBulkEditing} />}
            </Block>
            <Block className="taskplayer-container flex items-center justify-between">
                <Block className="flex gap-2 items-center">
                    <Link href={`/backlog/${projectId}`}>
                        <FontAwesomeIcon icon={faXmark} />
                    </Link>
                    <strong>{selectedTaskIds.length} tasks selected</strong>
                </Block>

                <Link
                    href={handleFocus(!taskBulkFocus)}
                    className="flex gap-2 items-center cursor-pointer"
                >
                    <FontAwesomeIcon icon={taskBulkFocus ? faEye : faEyeSlash} />
                    <Text variant="span">
                        {taskBulkFocus ? (
                            <>Show</>
                        ) : (
                            <>Hide</>
                        )}
                        {" "}others
                    </Text>
                </Link>

                <Block className="flex gap-2 items-center cursor-pointer" onClick={() => handleEdit()}>
                    <FontAwesomeIcon icon={faPencil} />
                    <Text variant="span">Edit</Text>
                </Block>

                {copySuccess ? (
                    <Block className="flex gap-2 items-center">
                        <FontAwesomeIcon icon={faCheck} />
                        <Text variant="span">{selectedTaskIds.length} items copied</Text>
                    </Block>
                ) : (
                    <Block className="flex gap-2 items-center cursor-pointer" onClick={() => handleCopy("tester")}>
                        <FontAwesomeIcon icon={faCopy} />
                        <Text variant="span">Copy to clipboard</Text>
                    </Block>
                )}

                <Block className="flex gap-2 items-center cursor-pointer" onClick={() => handleDelete()}>
                    <FontAwesomeIcon icon={faTrashCan} />
                    <Text variant="span">Delete</Text>
                </Block>
            </Block>
        </>
    )
}

interface BulkEditProps {
    selectedTaskIds: string[]
    setTaskBulkEditing: React.Dispatch<React.SetStateAction<boolean>>
}

const BulkEdit: React.FC<BulkEditProps> =
    ({
        selectedTaskIds,
        setTaskBulkEditing
    }) => {
        // Hooks
        const { projectId } = useParams<{ projectId: string }>(); // Get projectId from URL
        const { httpPostWithData } = useAxios()
        const { projectById } = useProjectsContext()
        const { readTasksByProjectId } = useTasksContext()

        // Internal variables
        const [renderProject, setRenderProject] = useState<Project | undefined>(undefined)
        const [newUserId, setNewUserId] = useState<number | undefined>(undefined)
        const [newDueDate, setNewDueDate] = useState<string>("")
        const [newStatus, setNewStatus] = useState<string>("")

        /**
         * Methods
         */
        const handleBulkUpdate = async () => {
            if (!selectedTaskIds.length) return;

            const updatedTasks = selectedTaskIds.map((taskId) => ({
                Task_ID: taskId,
                Task_Status: newStatus, // Assuming newStatus is set somewhere in the UI
                Task_Due_Date: newDueDate, // Assuming newDueDate is set in the UI
                Assigned_User_ID: newUserId, // Assuming newUserId is set in the UI
            }))

            const result = await httpPostWithData("tasks/bulk-update", { tasks: updatedTasks });

            if (result.updated_tasks) {
                await readTasksByProjectId(parseInt(projectId), true);
                setTaskBulkEditing(false)
            }
        };

        /**
         * Effects
         */
        useEffect(() => {
            if (projectById) {
                setRenderProject(projectById)
            }
        }, [projectById])

        if (!renderProject) return null

        return (
            <Block className="flex flex-col gap-3">
                <Block className="flex justify-between">
                    <Heading variant="h3" className="font-bold text-xl">Bulk edit</Heading>
                    <Text className="text-xl">{selectedTaskIds.length} tasks</Text>
                </Block>
                <Block>
                    <Text variant="span" className="font-semibold">Assignee</Text>
                    {/* Dropdown to change the user assignee */}
                    <select
                        value={newUserId}
                        onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                            const newAssigneeID = event.target.value as unknown as Task["Assigned_User_ID"]
                            if (newAssigneeID) setNewUserId(newAssigneeID)
                        }}
                        className="p-2 border rounded bg-gray-200 w-60 h-14"
                    >
                        <option value="">Assignee</option>
                        {renderProject?.team?.user_seats?.map(userSeat => {
                            return (
                                <option value={userSeat.user?.User_ID}>{userSeat.user?.User_FirstName} {userSeat.user?.User_Surname}</option>
                            )
                        })}
                    </select>
                </Block>
                <Block>
                    <Text variant="span" className="font-semibold">Due Date</Text>
                    <Field
                        type="date"
                        lbl=""
                        value={newDueDate}
                        className="bg-gray-200 w-60"
                        onChange={(e: string) => setNewDueDate(e)}
                        disabled={false}
                    />
                </Block>
                <Block>
                    <Text variant="span" className="font-semibold">Status</Text>
                    {/* Dropdown to change the status */}
                    <select
                        value={newStatus}
                        onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                            const newStatus = event.target.value as Task["Task_Status"]
                            setNewStatus(newStatus)
                        }}
                        className="p-2 border rounded bg-gray-200 w-60 h-14"
                    >
                        <option value="">Status</option>
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Waiting for Review">Waiting for Review</option>
                        <option value="Done">Done</option>
                    </select>
                </Block>
                <Block className="flex gap-2 ml-auto">
                    <button onClick={() => setTaskBulkEditing(false)}>
                        Cancel
                    </button>
                    <button className="button-blue" onClick={handleBulkUpdate}>
                        Confirm
                    </button>
                </Block>
            </Block>
        )
    }
