"use client"

// External
import React, { useEffect, useMemo, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { TFunction, useTranslation } from "next-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEllipsisV, faList, faPlus, faSortDown, faSortUp } from "@fortawesome/free-solid-svg-icons"

// Internal
import styles from "@/core-ui/styles/modules/Backlog.module.scss"
import { Block, Text, Field, Heading } from "@/components"
import { useProjectsContext, useTasksContext } from "@/contexts"
import { Project, Task, TaskFields } from "@/types";
import { selectAuthUser, useTypedSelector } from "@/redux";
import Link from "next/link";
import { FlexibleBox } from "@/components/ui/flexible-box";
import { TaskBulkActionMenu } from "../task/TaskBulkActionMenu";
import { CreatedAtToTimeSince } from "../task/TaskTimeTrackPlayer";

const BacklogContainer = () => {
    const { projectId } = useParams<{ projectId: string }>(); // Get projectId from URL
    const searchParams = useSearchParams();
    const router = useRouter();
    const { t } = useTranslation(['backlog'])

    const { projectById, readProjectById } = useProjectsContext()
    const { tasksById, readTasksByProjectId, newTask, setTaskDetail, handleChangeNewTask, addTask, removeTask } = useTasksContext()
    const authUser = useTypedSelector(selectAuthUser) // Redux

    const [renderProject, setRenderProject] = useState<Project | undefined>(undefined)
    const [renderTasks, setRenderTasks] = useState<Task[] | undefined>(undefined)

    const urlTaskIds = searchParams.get("taskIds")
    const urlTaskBulkFocus = searchParams.get("taskBulkFocus")
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
    const [selectAll, setSelectAll] = useState(false); // To track the "Select All" checkbox

    useEffect(() => {
        // console.log("tasksByID changed")
        if (tasksById.length == 0 && renderTasks) {
            setRenderTasks(undefined)
        }
        if (tasksById.length && !renderTasks) {
            console.log("renderTasks", renderTasks, "tasksById", tasksById)
            setRenderTasks(tasksById)
        }
    }, [tasksById])
    useEffect(() => {
        readTasksByProjectId(parseInt(projectId))
        readProjectById(parseInt(projectId))
    }, [projectId])
    useEffect(() => {
        if (projectId) {
            setRenderProject(projectById)
            handleChangeNewTask("Task_Status", "To Do")
            document.title = `Backlog: ${projectById?.Project_Name} - GiveOrTake`
        }
    }, [projectById])

    // Get user IDs from URL
    useEffect(() => {
        if (urlTaskIds) {
            // If userIds exist in the URL, use them
            const taskIdsFromURL = urlTaskIds ? urlTaskIds.split(",") : [];
            setSelectedTaskIds(taskIdsFromURL);
        } else {
            setSelectedTaskIds([])
        }
    }, [urlTaskIds])

    const currentSort = searchParams.get("sort") || "Task_ID";
    const currentOrder = searchParams.get("order") || "desc";

    const SORT_KEYS: Record<number, keyof Task> = {
        1: "Task_Title",
        2: "Task_Status",
        3: "Assigned_User_ID",
        4: "Task_CreatedAt",
    };

    // Default sorting field if an invalid key is used
    const DEFAULT_SORT_KEY: keyof Task = "Task_ID";

    // Function to toggle sorting order
    const handleSort = (column: string) => {
        const newOrder = currentSort === column && currentOrder === "asc" ? "desc" : "asc";
        router.push(`?sort=${column}&order=${newOrder}`);
    };

    // Sorting logic based on URL query parameters
    const sortedTasks = useMemo(() => {
        console.log("renderTasks sortedTasks = ")
        if (!Array.isArray(renderTasks)) return []; // Ensure tasks is an array

        let arrayToSort: Task[] = renderTasks

        if (urlTaskBulkFocus && urlTaskIds) {
            const taskIdsBulkFocus: string[] = urlTaskIds.split(",")

            arrayToSort = arrayToSort.filter(task => taskIdsBulkFocus.includes(task.Task_ID!.toString()))
        }

        const sortField = SORT_KEYS[Number(currentSort)] || DEFAULT_SORT_KEY; // Convert number to field name

        return [...arrayToSort].sort((a, b) => {
            const aValue = a[sortField] ?? "";
            const bValue = b[sortField] ?? "";

            if (typeof aValue === "string" && typeof bValue === "string") {
                return currentOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            } else if (typeof aValue === "number" && typeof bValue === "number") {
                return currentOrder === "asc" ? aValue - bValue : bValue - aValue;
            }
            return 0;
        });
    }, [renderTasks, currentSort, currentOrder, urlTaskBulkFocus, urlTaskIds]);

    const ifEnter = (e: React.KeyboardEvent) => (e.key === 'Enter') ? prepareCreateTask() : null

    const prepareCreateTask = async () => {
        const newTaskPlaceholder: Task = {
            Project_ID: parseInt(projectId),
            Team_ID: renderProject?.team?.Team_ID ? renderProject?.team?.Team_ID : 0,
            Task_Title: newTask?.Task_Title || "",
            Task_Status: newTask?.Task_Status || "To Do",
            Assigned_User_ID: newTask?.Assigned_User_ID
        }

        await addTask(parseInt(projectId), newTaskPlaceholder)

        await readTasksByProjectId(parseInt(projectId), true)
    }

    const archiveTask = async (task: Task) => {
        if (!task.Task_ID) return

        await removeTask(task.Task_ID, task.Project_ID)

        await readTasksByProjectId(parseInt(projectId), true)
    }

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = event.target;

        let updatedTaskIds = selectedTaskIds;

        if (checked) {
            updatedTaskIds = [...selectedTaskIds, value]; // Add new ID
        } else {
            updatedTaskIds = selectedTaskIds.filter(id => id !== value); // Remove unchecked ID
        }

        updateURLParams(updatedTaskIds)
    };

    const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { checked } = e.target;
        setSelectAll(checked);

        let updatedTaskIds = selectedTaskIds

        if (checked) {
            // Select all task IDs
            updatedTaskIds = sortedTasks.map((task) => task.Task_ID!.toString())
        } else {
            // Deselect all task IDs
            updatedTaskIds = []
        }

        updateURLParams(updatedTaskIds)
    };

    const updateURLParams = (newTaskIds?: string[] | string, returnUrl?: boolean) => {
        const url = new URL(window.location.href)

        if (newTaskIds === undefined) {
            url.searchParams.delete("taskIds")
        } else if (Array.isArray(newTaskIds)) { // Handle taskIds (convert array to a comma-separated string)
            if (newTaskIds.length > 0 && newTaskIds.length <= tasksById.length) {
                url.searchParams.set("taskIds", newTaskIds.join(",")); // Store as comma-separated values
            } else {
                url.searchParams.delete("taskIds"); // Remove if empty
            }
        }
        // } else if (newUserId || userId) {
        //     url.searchParams.set("userId", newUserId || userId!);
        // }

        if (returnUrl) {
            return url.toString()
        } else {
            router.push(url.toString(), { scroll: false }); // Prevent full page reload
        }
    };

    return (
        <>
            <TaskBulkActionMenu />
            <BacklogContainerView
                renderProject={renderProject}
                sortedTasks={sortedTasks}
                newTask={newTask}
                currentSort={currentSort}
                currentOrder={currentOrder}
                t={t}
                selectedTaskIds={selectedTaskIds}
                selectAll={selectAll}
                handleSort={handleSort}
                handleCreateTask={prepareCreateTask}
                ifEnter={ifEnter}
                handleChangeNewTask={handleChangeNewTask}
                setTaskDetail={setTaskDetail}
                handleCheckboxChange={handleCheckboxChange}
                handleSelectAllChange={handleSelectAllChange}
            />
        </>
    );
}

export interface BacklogContainerViewProps {
    renderProject?: Project | undefined;
    sortedTasks: Task[];
    newTask: Task | undefined;
    currentSort: string;
    currentOrder: string;
    t: TFunction
    selectedTaskIds: string[]
    selectAll: boolean
    handleSort: (column: string) => void;
    handleCreateTask: () => void;
    ifEnter: (e: React.KeyboardEvent) => Promise<void> | null
    handleChangeNewTask: (field: TaskFields, value: string) => Promise<void>
    setTaskDetail: (task: Task) => void;
    handleCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    handleSelectAllChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const BacklogContainerView: React.FC<BacklogContainerViewProps> = ({
    renderProject,
    sortedTasks,
    currentSort,
    currentOrder,
    newTask,
    selectedTaskIds,
    selectAll,
    handleSort,
    handleCreateTask,
    ifEnter,
    handleChangeNewTask,
    setTaskDetail,
    handleCheckboxChange,
    handleSelectAllChange
}) => {
    return (
        <Block className="page-content">
            <Link
                href={`/project/${renderProject?.Project_ID}`}
                className="blue-link"
            >
                &laquo; Go to Project
            </Link>
            {/* <Heading variant="h1">{`Backlog: ${renderProject?.Project_Name}`}</Heading> */}
            <FlexibleBox
                title={`Backlog: ${renderProject?.Project_Name}`}
                icon={faList}
                className="no-box w-auto inline-block"
                numberOfColumns={2}
            >
                <Block className="overflow-x-auto">
                    <table className={styles.taskTable}>
                        <thead>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        checked={selectAll}
                                        onChange={handleSelectAllChange}
                                    />
                                </th>
                                <th onClick={() => handleSort("2")}>
                                    <Text variant="span">Task Key</Text>
                                    {currentSort === "2" && <FontAwesomeIcon icon={currentOrder === "asc" ? faSortUp : faSortDown} />}
                                </th>
                                <th onClick={() => handleSort("1")}>
                                    <Text variant="span">Task Title</Text>
                                    {currentSort === "1" && <FontAwesomeIcon icon={currentOrder === "asc" ? faSortUp : faSortDown} />}
                                </th>
                                <th onClick={() => handleSort("3")}>
                                    <Text variant="span">Status</Text>
                                    {currentSort === "3" && <FontAwesomeIcon icon={currentOrder === "asc" ? faSortUp : faSortDown} />}
                                </th>
                                <th onClick={() => handleSort("4")}>
                                    <Text variant="span">Assignee</Text>
                                    {currentSort === "4" && <FontAwesomeIcon icon={currentOrder === "asc" ? faSortUp : faSortDown} />}
                                </th>
                                <th onClick={() => handleSort("5")}>
                                    <Text variant="span">Created At</Text>
                                    {currentSort === "5" && <FontAwesomeIcon icon={currentOrder === "asc" ? faSortUp : faSortDown} />}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan={2}></td>
                                <td>
                                    <Field
                                        type="text"
                                        lbl="New Task"
                                        innerLabel={true}
                                        value={newTask?.Task_Title ?? ''}
                                        onChange={(e: string) => handleChangeNewTask("Task_Title", e)}
                                        onKeyDown={
                                            (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) =>
                                                ifEnter(event)
                                        }
                                        disabled={false}
                                        className="w-full"
                                    />
                                </td>
                                <td>
                                    {/* Dropdown to change the status */}
                                    <select
                                        value={newTask?.Task_Status}
                                        onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                                            const newStatus = event.target.value as Task["Task_Status"]
                                            handleChangeNewTask("Task_Status", newStatus)
                                        }}
                                        className="p-2 border rounded"
                                    >
                                        <option value="To Do">To Do</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Waiting for Review">Waiting for Review</option>
                                        <option value="Done">Done</option>
                                    </select>
                                </td>
                                <td>
                                    {/* Dropdown to change the user assignee */}
                                    <select
                                        value={newTask?.Assigned_User_ID}
                                        onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                                            const newAssigneeID = event.target.value as unknown as Task["Assigned_User_ID"]
                                            if (newAssigneeID) handleChangeNewTask("Assigned_User_ID", newAssigneeID.toString())
                                        }}
                                        className="p-2 border rounded"
                                    >
                                        <option value="">Assignee</option>
                                        {renderProject?.team?.user_seats?.map(userSeat => {
                                            return (
                                                <option value={userSeat.user?.User_ID}>{userSeat.user?.User_FirstName} {userSeat.user?.User_Surname}</option>
                                            )
                                        })}
                                    </select>
                                </td>
                                <td>
                                    <button type="submit" onClick={handleCreateTask} className={styles.addButton}>
                                        <FontAwesomeIcon icon={faPlus} /> Create
                                    </button>
                                </td>
                            </tr>
                            {sortedTasks.map((task) => (
                                <tr key={task.Task_ID}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            value={task.Task_ID}
                                            checked={task.Task_ID ? selectedTaskIds.includes(task.Task_ID.toString()) : false}
                                            onChange={handleCheckboxChange}
                                        />
                                    </td>
                                    <td onClick={() => setTaskDetail(task)} className="cursor-pointer hover:underline">
                                        {renderProject?.Project_Key}-{task.Task_Key}
                                    </td>
                                    <td onClick={() => setTaskDetail(task)} className="cursor-pointer hover:underline">
                                        {task.Task_Title}
                                    </td>
                                    <td className={styles.status}>{task.Task_Status}</td>
                                    {(() => {
                                        const assignee = renderProject?.team?.user_seats?.find(userSeat => userSeat.User_ID === task.Assigned_User_ID)?.user
                                        return (
                                            <td>{assignee ? `${assignee.User_FirstName} ${assignee.User_Surname}` : "Unassigned"}</td>
                                        )
                                    })()}
                                    <td>
                                        {task.Task_CreatedAt && (
                                            <CreatedAtToTimeSince dateCreatedAt={task.Task_CreatedAt} />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Block>
            </FlexibleBox>
        </Block >
    );
};

export const Backlog = () => (
    <BacklogContainer />
)