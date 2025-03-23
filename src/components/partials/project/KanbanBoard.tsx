"use client"

// External
import React, { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { useDrag, useDrop, DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTrash, faWindowRestore } from "@fortawesome/free-solid-svg-icons"

// Internal
import styles from "@/core-ui/styles/modules/KanbanBoard.module.scss"
import { Block, Text, Heading } from "@/components"
import { useProjectsContext, useTasksContext } from "@/contexts"
import { Project, Task } from "@/types"
import { selectAuthUser, useTypedSelector } from "@/redux"
import Link from "next/link"
import { FlexibleBox } from "@/components/ui/flexible-box"
import clsx from "clsx"

const ItemType = { TASK: "task" }

interface TaskCardProps {
    task: Task
    setTaskDetail: (task: Task) => void
    archiveTask: (task: Task) => Promise<void>
}

const TaskCard: React.FC<TaskCardProps> = ({
    task, setTaskDetail, archiveTask
}) => {
    const dragRef = useRef<HTMLDivElement>(null);

    const [{ isDragging }, drag] = useDrag({
        type: ItemType.TASK,
        item: task,
        collect: monitor => ({
            isDragging: !!monitor.isDragging()
        })
    })

    drag(dragRef);

    return (
        <div ref={dragRef} className={styles.taskCard} style={{ opacity: isDragging ? 0.5 : 1 }}>
            <Text onClick={() => setTaskDetail(task)} className={styles.taskTitle}>
                {task.Task_Title}
            </Text>
            <button onClick={() => archiveTask(task)} className={styles.removeButton}>
                <FontAwesomeIcon icon={faTrash} />
            </button>
        </div>
    );
}

interface ColumnProps {
    status: "To Do" | "In Progress" | "Waiting for Review" | "Done"
    label: string
    tasks: Task[] | undefined
    archiveTask: (task: Task) => Promise<void>
    setTaskDetail: (task: Task) => void
    moveTask: (task: Task, newStatus: "To Do" | "In Progress" | "Waiting for Review" | "Done") => Promise<void>
}

const Column: React.FC<ColumnProps> = ({
    status, label, tasks, archiveTask, setTaskDetail, moveTask
}) => {
    const dropRef = useRef<HTMLDivElement>(null);

    const [{ isOver }, drop] = useDrop(() => ({
        accept: ItemType.TASK,
        drop: (item: Task) => moveTask(item, status),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));

    drop(dropRef);

    return (
        <div ref={dropRef} className={clsx(
            styles.column,
            {
                [styles.isOver]: isOver
            }
        )}>
            <Heading variant="h2" className={styles.columnTitle}>{label}</Heading>
            <Block className={styles.taskList}>
                {tasks && tasks.map((task) => (
                    <TaskCard
                        key={task.Task_ID}
                        task={task}
                        setTaskDetail={setTaskDetail}
                        archiveTask={archiveTask}
                    />
                ))}
            </Block>
        </div>
    );
};

const KanbanBoardContainer = () => {
    const { projectId } = useParams<{ projectId: string }>(); // Get projectId from URL
    const { projectById, readProjectById } = useProjectsContext()
    const { tasksById, readTasksByProjectId, newTask, setTaskDetail, handleChangeNewTask, addTask, removeTask, saveTaskChanges } = useTasksContext()
    const authUser = useTypedSelector(selectAuthUser) // Redux

    const [renderProject, setRenderProject] = useState<Project | undefined>(undefined)
    const [renderTasks, setRenderTasks] = useState<Task[] | undefined>(undefined)

    useEffect(() => {
        console.log("tasksByID changed")
        if (tasksById.length == 0 && renderTasks) {
            setRenderTasks(undefined)
        }
        if (tasksById.length && !renderTasks) {
            console.log("renderTasks", renderTasks)
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
            document.title = `Kanban: ${projectById?.Project_Name} - GiveOrTake`
        }
    }, [projectById])

    const columns: {
        [key: string]: "To Do" | "In Progress" | "Waiting for Review" | "Done"
    } = {
        todo: "To Do",
        inProgress: "In Progress",
        review: "Waiting for Review",
        done: "Done"
    }

    const archiveTask = async (task: Task) => {
        if (!task.Task_ID) return

        await removeTask(task.Task_ID, task.Project_ID)

        await readTasksByProjectId(parseInt(projectId), true)
    }

    const moveTask = async (task: Task, newStatus: "To Do" | "In Progress" | "Waiting for Review" | "Done") => {
        await saveTaskChanges(
            { ...task, Task_Status: newStatus },
            task.Project_ID
        )

        await readTasksByProjectId(parseInt(projectId), true)
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <KanbanBoardView
                project={renderProject}
                tasks={renderTasks}
                columns={columns}
                archiveTask={archiveTask}
                setTaskDetail={setTaskDetail}
                moveTask={moveTask}
            />
        </DndProvider>
    )
}

export interface KanbanBoardViewProps {
    project: Project | undefined
    tasks: Task[] | undefined
    columns: {
        [key: string]: "To Do" | "In Progress" | "Waiting for Review" | "Done"
    }
    archiveTask: (task: Task) => Promise<void>
    setTaskDetail: (task: Task) => void
    moveTask: (task: Task, newStatus: "To Do" | "In Progress" | "Waiting for Review" | "Done") => Promise<void>
}

export const KanbanBoardView: React.FC<KanbanBoardViewProps> = ({
    project,
    tasks,
    columns,
    archiveTask,
    setTaskDetail,
    moveTask
}) => {
    return (
        <Block className="page-content">
            <Link
                href={`/project/${project?.Project_ID}`}
                className="blue-link"
            >
                &laquo; Go to Project
            </Link>
            <FlexibleBox
                title={`Kanban: ${project?.Project_Name}`}
                icon={faWindowRestore}
                className="no-box w-auto inline-block"
                numberOfColumns={2}
            >
                <Block className={styles.board}>
                    {Object.entries(columns).map(([key, label]) => (
                        <Column
                            key={key}
                            status={label}
                            label={label}
                            tasks={tasks ? tasks.filter(task => task.Task_Status === label) : undefined}
                            archiveTask={archiveTask}
                            setTaskDetail={setTaskDetail}
                            moveTask={moveTask}
                        />
                    ))}
                </Block>
            </FlexibleBox>
        </Block>
    )
}

export const KanbanBoard = () => (
    <KanbanBoardContainer />
)