"use client"

// External
import React, { createContext, useContext, useState, useEffect } from "react"

// Internal
import { Task, TaskFields, TasksContextType } from "@/types"
import { useTasksAPI } from "@/hooks"

// Context API for Tasks
const TasksContext = createContext<TasksContextType | undefined>(undefined)

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { fetchTasks, postTask, updateTask, deleteTask } = useTasksAPI()
    const [tasks, setTasks] = useState<Task[]>([])
    const [taskDetail, setTaskDetail] = useState<Task | undefined>(undefined)
    const [newTask, setNewTask] = useState<Task | undefined>(undefined)

    useEffect(() => {
        const fetchOnMount = async () => {
            const data = await fetchTasks() // Fetch tasks on mount
            if (data) setTasks(data)
        }
        fetchOnMount()
    }, [])

    const addTask = async () => {
        if (newTask?.Task_Title.trim()) {
            const createdTask = await postTask(newTask)
            if (createdTask) {
                const data = await fetchTasks() // Refresh tasks from API
                if (data) {
                    setTasks(data)
                    setNewTask(undefined)
                }
            }
        }
    }

    const handleChangeNewTask = (field: TaskFields, value: string) => {
        setNewTask((prevState) => ({
            ...prevState,
            [field]: value,
            Task_UpdatedAt: new Date().toISOString(), // Ensure update timestamp is refreshed
        } as Task))
    }

    const saveTaskChanges = async (taskChanges: Task) => {
        const updatedTask = await updateTask(taskChanges)
        if (updatedTask) {
            const data = await fetchTasks() // Refresh tasks from API
            if (data) {
                setTasks(data)
            }
        }
    }

    const removeTask = async (id: number) => {
        const success = await deleteTask(id)
        if (success) {
            const data = await fetchTasks() // Refresh tasks after deletion
            if (data) setTasks(data)
        }
    }

    return (
        <TasksContext.Provider value={{ taskDetail, tasks, newTask, setTaskDetail, handleChangeNewTask, addTask, saveTaskChanges, removeTask }}>
            {children}
        </TasksContext.Provider>
    )
}

export const useTasksContext = () => {
    const context = useContext(TasksContext)
    if (!context) {
        throw new Error("useTasksContext must be used within a TasksProvider")
    }
    return context
}
