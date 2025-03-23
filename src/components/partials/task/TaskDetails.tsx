"use client"

// External
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faPaperPlane, faArrowUpRightFromSquare, faTrashCan, faArrowUpFromBracket, faPlay, faStop, faXmark } from "@fortawesome/free-solid-svg-icons";

import "react-quill/dist/quill.snow.css"; // Import the Quill styles
import "quill-mention/dist/quill.mention.css";
import dynamic from "next/dynamic";
// Dynamically import ReactQuill with SSR disabled
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
// Import Quill & register mention module in useEffect
let Quill: any
// Ensure Quill is loaded properly
const loadQuill = async () => {
    if (typeof window !== "undefined") {
        // Dynamically import quill
        const { default: QuillLibrary } = await import("quill");
        Quill = QuillLibrary;
    }
};

// Internal components and hooks
import styles from "@/core-ui/styles/modules/TaskDetail.module.scss";
import { useTaskCommentsContext, useTaskMediaFilesContext, useTasksContext, useTaskTimeTrackContext } from "@/contexts";
import { Task, TaskComment, TaskMediaFile, TaskTimeTrack, TeamUserSeat, User } from "@/types";
import Link from "next/link";
import { Block, Text } from "@/components/ui/block-text";
import { Heading } from "@/components/ui/heading";
import clsx from "clsx";
import { selectAuthUser, selectAuthUserTaskTimeTrack, setAuthUserTaskTimeTrack, useAppDispatch, useAuthActions, useTypedSelector } from "@/redux";
import { CreatedAtToTimeSince, SecondsToTimeDisplay, TimeSpentDisplay } from "./TaskTimeTrackPlayer";
import { Router } from "next/router";

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
    return <Block className={`bg-white rounded-lg p-4 mb-4 ${className}`}>{children}</Block>;
};

const TitleArea: React.FC<{ task: Task }> = ({ task }) => {
    const { readTasksByProjectId, readTaskByKeys, saveTaskChanges } = useTasksContext();
    const inputRef = useRef<HTMLInputElement>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(task.Task_Title || "");

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
        }
    }, [isEditing]);

    const handleBlur = async () => {
        setIsEditing(false);

        await saveTaskChanges(
            { ...task, Task_Title: title },
            task.Project_ID
        );

        //// Task changed
        if (task) {
            if (task.Project_ID) readTasksByProjectId(task.Project_ID, true)
            if (task.project?.Project_Key && task.Task_Key) readTaskByKeys(task.project.Project_Key, task.Task_Key.toString())
        }
    };

    useEffect(() => {
        setTitle(task.Task_Title)
    }, [task])

    return (
        <TitleAreaView
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            title={title}
            setTitle={setTitle}
            inputRef={inputRef}
            task={task}
            handleBlur={handleBlur}
        />
    );
};

interface TitleAreaViewProps {
    isEditing: boolean
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>
    title: string
    setTitle: React.Dispatch<React.SetStateAction<string>>
    inputRef: React.RefObject<HTMLInputElement | null>
    task: Task;
    handleBlur: () => Promise<void>
}

export const TitleAreaView: React.FC<TitleAreaViewProps> = ({
    isEditing, setIsEditing, title, setTitle, inputRef, task, handleBlur
}) => {
    return (
        <Block className={styles.titleArea}>
            {!isEditing ? (
                <Block className={styles.titlePlaceholder} onClick={() => setIsEditing(true)}>
                    {title || "Click to add title..."}
                </Block>
            ) : (
                <input
                    className={styles.titleInput}
                    ref={inputRef}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleBlur}
                />
            )}
        </Block>
    );
};

const DescriptionArea: React.FC<{ task: Task }> = ({ task }) => {
    const { readTaskByKeys, readTasksByProjectId, saveTaskChanges } = useTasksContext();
    const [isEditing, setIsEditing] = useState(false);
    const [description, setDescription] = useState(task.Task_Description || "");

    const handleSave = () => {
        setIsEditing(false);
        saveTaskChanges(
            { ...task, Task_Description: description },
            task.Project_ID
        )

        //// Task changed
        if (task) {
            if (task.Project_ID) readTasksByProjectId(task.Project_ID, true)
            if (task.project?.Project_Key && task.Task_Key) readTaskByKeys(task.project.Project_Key, task.Task_Key.toString())
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    // Quill Editor Modules (Mention plugin added)
    const [mentionUsers, setMentionUsers] = useState<any[]>([])
    useEffect(() => {
        const restructureUsers = task.project?.team?.user_seats?.map((seat: TeamUserSeat) => ({
            id: seat.user?.User_ID, // Ensure the id field is used for mentions
            value: `${seat.user?.User_FirstName || ''} ${seat.user?.User_Surname || ''}`, // Concatenating first & last name
        })) || [];

        setMentionUsers(restructureUsers);
    }, [task])

    const quillModule = useMemo(() => ({
        mention: {
            allowedChars: /^[A-Za-z\s]*$/,
            mentionDenotationChars: ["@"], // Trigger character
            source: (searchTerm: string, renderList: Function) => {
                // Filter users based on search term
                const matches = mentionUsers && mentionUsers.filter(user => user.value.toLowerCase().includes(searchTerm.toLowerCase()));
                renderList(matches);
            },
            /*renderItem: (item: any) => {
                const memberLink = document.createElement("a");
                memberLink.href = `/profile/${item.id}`; // Adjust link as needed
                memberLink.style.color = "#007bff"; // Bootstrap primary color or your preference
                memberLink.style.textDecoration = "none";
                memberLink.textContent = item.value;
                return memberLink;
            }*/
        }
    }), [mentionUsers]);

    return (
        <DescriptionAreaView
            task={task}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            description={description}
            setDescription={setDescription}
            handleSave={handleSave}
            handleCancel={handleCancel}
            quillModule={quillModule}
        />
    );
};

interface DescriptionAreaViewProps {
    task: Task
    isEditing: boolean
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>
    description: string
    setDescription: React.Dispatch<React.SetStateAction<string>>
    handleSave: () => void
    handleCancel: () => void
    quillModule: {
        mention: {
            allowedChars: RegExp;
            mentionDenotationChars: string[];
            source: (searchTerm: string, renderList: Function) => void;
        };
    }
}

export const DescriptionAreaView: React.FC<DescriptionAreaViewProps> =
    ({
        task,
        isEditing,
        setIsEditing,
        description,
        setDescription,
        handleSave,
        handleCancel,
        quillModule
    }) => {
        return (
            <Card className={styles.descriptionSection}>
                <h2>Task Description</h2>
                {!isEditing ? (
                    <div
                        className={styles.descriptionPlaceholder}
                        onClick={() => setIsEditing(true)}
                        dangerouslySetInnerHTML={{ __html: description || "Click to add a description..." }}
                    />
                ) : (
                    <Block className={styles.descriptionEditor}>
                        <ReactQuill
                            className={styles.descriptionInput}
                            theme="snow"
                            value={description}
                            onChange={setDescription}
                            onBlur={handleSave}
                            modules={quillModule}
                        />
                        <Block className={styles.editDescriptionActions}>
                            <button className={styles.sendButton} onClick={handleSave}>
                                <FontAwesomeIcon icon={faPaperPlane} />
                            </button>
                            <button className={styles.cancelButton} onClick={handleCancel}>
                                Cancel
                            </button>
                        </Block>
                    </Block>
                )}
            </Card>
        );
    };

const MediaFilesArea: React.FC<{ task: Task }> = ({ task }) => {
    const [toggleAddFile, setToggleAddFile] = useState<boolean>(false)
    const { removeTaskMediaFile } = useTaskMediaFilesContext()
    const { readTasksByProjectId, readTaskByKeys } = useTasksContext()

    // Handle file deletion
    const handleDelete = async (taskMediaFile: TaskMediaFile) => {
        if (!task.Task_ID || !taskMediaFile.Media_ID) return

        // Send the file ID to the API through the context function
        if (taskMediaFile.Media_ID) {
            await removeTaskMediaFile(taskMediaFile.Media_ID, taskMediaFile.Task_ID)

            //// Task changed
            if (task) {
                if (task.Project_ID) await readTasksByProjectId(task.Project_ID, true)
                if (task.Task_Key && task.project?.Project_Key) await readTaskByKeys(task.project?.Project_Key, task.Task_Key.toString())
            }

            setToggleAddFile(false);
        }
    };

    return (
        <>
            {!toggleAddFile ? (
                <MediaFilesAreaView
                    task={task}
                    setToggleAddFile={setToggleAddFile}
                    handleDelete={handleDelete}
                />
            ) : (
                <AddTaskMediaFile
                    task={task}
                    setToggleAddFile={setToggleAddFile}
                />
            )}
        </>
    );
};

interface MediaFilesAreaViewProps {
    task: Task;
    setToggleAddFile: React.Dispatch<React.SetStateAction<boolean>>
    handleDelete: (taskMediaFile: TaskMediaFile) => Promise<void>
}

export const MediaFilesAreaView: React.FC<MediaFilesAreaViewProps> = ({ task, setToggleAddFile, handleDelete }) => {
    return (
        <Card className={styles.mediaSection}>
            <Block className="flex gap-2 items-center">
                <h2>Media Files</h2>
                <button
                    className="blue-link-light"
                    onClick={() => setToggleAddFile(true)}
                >
                    Add file
                </button>
            </Block>
            <Block className={styles.mediaPlaceholders}>
                {task.media_files?.map((media, index) => (
                    <Block key={index} className={clsx(
                        styles.mediaItem,
                        "flex flex-col items-center"
                    )}>
                        <Block variant="span" className="font-semibold text-xs">
                            {/* Split the Media_File_Name by hyphen (-) and get the part after the first hyphen */}
                            {media.Media_File_Name.split('-').slice(1).join('-')}
                        </Block>
                        {media.Media_File_Type === "jpeg" ? (
                            <img
                                className={styles.mediaPlaceholder}
                                src={`http://localhost:8000/storage/${media.Media_File_Path}`}
                            />
                        ) : (
                            <Link
                                className={styles.mediaPlaceholder}
                                href={`http://localhost:8000/storage/${media.Media_File_Path}`}
                                target="_blank"
                            >
                                <Text variant="span" className="text-sm font-semibold">PDF</Text>
                            </Link>
                        )}
                        <Block className={styles.mediaMeta}>
                            <Block>
                                <Block>
                                    Created:{" "}
                                    {media.Media_CreatedAt && (
                                        <CreatedAtToTimeSince dateCreatedAt={media.Media_CreatedAt} />
                                    )}
                                    </Block>
                                <Block>By: {media.user?.User_FirstName} {media.user?.User_Surname}</Block>
                            </Block>
                            <button
                                className={styles.mediaActions}
                                onClick={() => handleDelete(media)}
                            >
                                <FontAwesomeIcon icon={faTrashCan} className={styles.icon} />
                            </button>
                        </Block>
                    </Block>
                ))}
            </Block>
        </Card>
    );
};

type AddTaskMediaFileProps = {
    task: Task; // Task ID to associate the media file with
    setToggleAddFile: React.Dispatch<React.SetStateAction<boolean>>
};

export const AddTaskMediaFile: React.FC<AddTaskMediaFileProps> = ({ task, setToggleAddFile }) => {
    // Hooks
    const { addTaskMediaFile } = useTaskMediaFilesContext()
    const { readTasksByProjectId, readTaskByKeys } = useTasksContext()

    // Internal variables
    const [file, setFile] = useState<File | null>(null);
    const [mediaFileName, setMediaFileName] = useState<string>("");
    const [mediaFileType, setMediaFileType] = useState<string>("");

    /**
     * Methods
     */
    // Handle file change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setMediaFileName(selectedFile.name);
            setMediaFileType(selectedFile.type);
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!task.Task_ID) return

        if (!file || !mediaFileName || !mediaFileType) {
            alert("Please select a file and provide all necessary details.");
            return;
        }

        // Prepare the media file object
        const newMediaFile: TaskMediaFile = {
            Task_ID: task.Task_ID,
            Uploaded_By_User_ID: 1, // You can get the user ID dynamically (e.g., from auth context)
            Media_File: file,
            Media_File_Name: mediaFileName,
            Media_File_Path: "", // Will be populated by the response from API
            Media_File_Type: mediaFileType,
            Media_CreatedAt: new Date().toISOString(), // Current timestamp
            Media_UpdatedAt: new Date().toISOString(),
        };

        // Send the file to the API through the context function
        if (addTaskMediaFile) {
            await addTaskMediaFile(task.Task_ID, newMediaFile);
            alert("Media file uploaded successfully!");
            // Clear form
            setFile(null);
            setMediaFileName("");
            setMediaFileType("");

            //// Task changed
            if (task) {
                if (task.Project_ID) await readTasksByProjectId(task.Project_ID, true)
                if (task.Task_Key && task.project?.Project_Key) await readTaskByKeys(task.project?.Project_Key, task.Task_Key.toString())
            }

            setToggleAddFile(false);
        }
    };

    if (!task.Task_ID) return

    return (
        <Card className={styles.mediaSection}>
            <Block className="flex gap-2 items-center">
                <h2>Upload Media File</h2>
                <button
                    className="blue-link-light"
                    onClick={() => setToggleAddFile(false)}
                >
                    Cancel
                </button>
            </Block>
            <form
                onSubmit={handleSubmit}
                className="flex items-center justify-between"
            >
                <input
                    type="file"
                    id="mediaFile"
                    name="mediaFile"
                    accept="image/jpeg, image/png, application/pdf"
                    onChange={handleFileChange}
                />
                <button
                    type="submit"
                    disabled={!file}
                    className="blue-link"
                >
                    Upload Media File
                </button>
            </form>
        </Card>
    );
};

const CommentsArea: React.FC<{ task: Task }> = ({ task }) => {
    const { addTaskComment, saveTaskCommentChanges, removeTaskComment } = useTaskCommentsContext();
    const { readTasksByProjectId, readTaskByKeys } = useTasksContext()
    const authUser = useTypedSelector(selectAuthUser)

    const [createComment, setCreateComment] = useState<string>("");
    const [editComment, setEditComment] = useState<string>("");
    const [isCreateCommentVisible, setIsCreateCommentVisible] = useState<boolean>(false);
    const [isEditCommentVisible, setIsEditCommentVisible] = useState<TaskComment | undefined>(undefined);

    const handleAddComment = async () => {
        if (!authUser) return

        if (createComment.trim() && authUser.User_ID) {
            const theNewComment: TaskComment = {
                Task_ID: task.Task_ID ?? 0,
                User_ID: authUser.User_ID,
                Comment_Text: createComment.trim()
            }
            console.log("theNewComment", theNewComment)
            await addTaskComment(theNewComment.Task_ID, theNewComment)

            setCreateComment("");
            setIsCreateCommentVisible(false)

            //// Task changed
            if (task) {
                if (task.Project_ID) readTasksByProjectId(task.Project_ID, true)
                if (task.Task_Key && task.project?.Project_Key) await readTaskByKeys(task.project?.Project_Key, task.Task_Key.toString())
            }
        }
    }

    // Handle new comment cancel
    const handleCommentCancel = () => {
        setCreateComment("");
        setIsCreateCommentVisible(false); // Hide editor after cancel
    };

    const handleEditComment = async () => {
        if (!authUser || !isEditCommentVisible) return

        if (editComment.trim() && authUser.User_ID) {
            const theEditedComment: TaskComment = {
                ...isEditCommentVisible,
                Comment_Text: editComment.trim()
            }

            await saveTaskCommentChanges(theEditedComment, theEditedComment.Task_ID)

            setEditComment("");
            setIsEditCommentVisible(undefined)

            //// Task changed
            if (task) {
                if (task.Project_ID) readTasksByProjectId(task.Project_ID, true)
                if (task.Task_Key && task.project?.Project_Key) await readTaskByKeys(task.project?.Project_Key, task.Task_Key.toString())
            }
        }
    }

    // Handle new comment cancel
    const handleEditCommentCancel = () => {
        setEditComment("");
        setIsEditCommentVisible(undefined); // Hide editor after cancel
    };

    // Handle comment deletion
    const handleDeleteComment = async (taskComment: TaskComment) => {
        if (!task.Task_ID || !taskComment.Comment_ID) return

        // Send the comment ID to the API through the context function
        if (taskComment.Comment_ID) {
            await removeTaskComment(taskComment.Comment_ID, taskComment.Task_ID)
            if (isEditCommentVisible && isEditCommentVisible.Comment_ID === taskComment.Comment_ID) {
                setEditComment("")
                setIsEditCommentVisible(undefined)
            }

            //// Task changed
            if (task) {
                if (task.Project_ID) await readTasksByProjectId(task.Project_ID, true)
                if (task.Task_Key && task.project?.Project_Key) await readTaskByKeys(task.project?.Project_Key, task.Task_Key.toString())
            }
        }
    };

    /**
     * Effects
     */
    useEffect(() => {
        // Only load Quill and mention module on the client
        loadQuill().then(() => {
            // if (Quill) {
            //     Quill.register("modules/mention", Mention);
            // }
            if (Quill) {
                // Dynamically import quill-mention once Quill is loaded
                import("quill-mention").then((mentionModule) => {
                    if (Quill && mentionModule) {
                        // Quill.register("modules/mention", mentionModule);
                    }
                });
            }
        });
    }, [Quill])

    // Quill Editor Modules (Mention plugin added)
    const [mentionUsers, setMentionUsers] = useState<any[]>([])
    useEffect(() => {
        const restructureUsers = task.project?.team?.user_seats?.map((seat: TeamUserSeat) => ({
            id: seat.user?.User_ID, // Ensure the id field is used for mentions
            value: `${seat.user?.User_FirstName || ''} ${seat.user?.User_Surname || ''}`, // Concatenating first & last name
        })) || [];

        setMentionUsers(restructureUsers);
    }, [task])

    const quillModule = useMemo(() => ({
        toolbar: [["bold", "italic", "underline"], [{ list: "ordered" }, { list: "bullet" }]],
        mention: {
            allowedChars: /^[A-Za-z\s]*$/,
            mentionDenotationChars: ["@"], // Trigger character
            source: (searchTerm: string, renderList: Function) => {
                // Filter users based on search term
                const matches = mentionUsers && mentionUsers.filter(user => user.value.toLowerCase().includes(searchTerm.toLowerCase()));
                renderList(matches);
            },
            /*renderItem: (item: any) => {
                const memberLink = document.createElement("a");
                memberLink.href = `/profile/${item.id}`; // Adjust link as needed
                memberLink.style.color = "#007bff"; // Bootstrap primary color or your preference
                memberLink.style.textDecoration = "none";
                memberLink.textContent = item.value;
                return memberLink;
            }*/
        }
    }), [mentionUsers]);

    return (
        <CommentsAreaView
            createComment={createComment}
            setCreateComment={setCreateComment}
            editComment={editComment}
            setEditComment={setEditComment}
            isCreateCommentVisible={isCreateCommentVisible}
            setIsCreateCommentVisible={setIsCreateCommentVisible}
            isEditCommentVisible={isEditCommentVisible}
            setIsEditCommentVisible={setIsEditCommentVisible}
            task={task}
            authUser={authUser}
            addTaskComment={addTaskComment}
            handleAddComment={handleAddComment}
            handleCommentCancel={handleCommentCancel}
            handleEditComment={handleEditComment}
            handleEditCommentCancel={handleEditCommentCancel}
            handleDeleteComment={handleDeleteComment}
            quillModule={quillModule}
        />
    );
};

interface CommentsAreaViewProps {
    createComment: string
    setCreateComment: React.Dispatch<React.SetStateAction<string>>
    editComment: string
    setEditComment: React.Dispatch<React.SetStateAction<string>>
    isCreateCommentVisible: boolean
    setIsCreateCommentVisible: React.Dispatch<React.SetStateAction<boolean>>
    isEditCommentVisible: TaskComment | undefined
    setIsEditCommentVisible: React.Dispatch<React.SetStateAction<TaskComment | undefined>>
    task: Task;
    authUser: User | undefined
    addTaskComment: (taskId: number, comment: TaskComment) => Promise<void>
    handleAddComment: () => Promise<void>
    handleCommentCancel: () => void
    handleEditComment: () => Promise<void>
    handleEditCommentCancel: () => void
    handleDeleteComment: (taskComment: TaskComment) => Promise<void>
    quillModule: {
        toolbar: (string[] | {
            list: string;
        }[])[];
        mention: {
            allowedChars: RegExp;
            mentionDenotationChars: string[];
            source: (searchTerm: string, renderList: Function) => void;
        };
    }
}

export const CommentsAreaView: React.FC<CommentsAreaViewProps> = ({
    createComment,
    setCreateComment,
    editComment,
    setEditComment,
    isCreateCommentVisible,
    setIsCreateCommentVisible,
    isEditCommentVisible,
    setIsEditCommentVisible,
    task,
    authUser,
    addTaskComment,
    handleAddComment,
    handleCommentCancel,
    handleEditComment,
    handleEditCommentCancel,
    handleDeleteComment,
    quillModule
}) => {
    return (
        <Card className={styles.commentsSection}>
            <h2>Comments</h2>
            {isEditCommentVisible ? (
                <Block className={styles.commentEditor}>
                    <ReactQuill
                        value={editComment}
                        onChange={setEditComment}
                        placeholder="Write a comment..."
                        className={styles.commentInput}
                        theme="snow"
                        modules={quillModule}
                    />
                    <Block className={styles.newCommentActions}>
                        <button className={styles.sendButton} onClick={handleEditComment}>
                            <FontAwesomeIcon icon={faPaperPlane} />
                        </button>
                        <button className={styles.cancelButton} onClick={handleEditCommentCancel}>
                            Cancel
                        </button>
                    </Block>
                </Block>
            ) : (
                <>
                    {!isCreateCommentVisible ? (
                        <Block className={styles.commentPlaceholder} onClick={() => setIsCreateCommentVisible(true)}>
                            Add a new comment...
                        </Block>
                    ) : (
                        <Block className={styles.commentEditor}>
                            <ReactQuill
                                value={createComment}
                                onChange={setCreateComment}
                                placeholder="Write a comment..."
                                className={styles.commentInput}
                                theme="snow"
                                modules={quillModule}
                            />
                            <Block className={styles.newCommentActions}>
                                <button className={styles.sendButton} onClick={handleAddComment}>
                                    <FontAwesomeIcon icon={faPaperPlane} />
                                </button>
                                <button className={styles.cancelButton} onClick={handleCommentCancel}>
                                    Cancel
                                </button>
                            </Block>
                        </Block>
                    )}
                </>
            )}
            {task.comments?.map((comment, index) => (
                <Block key={index} className={styles.commentItem}>
                    <div
                        className={styles.comment}
                        dangerouslySetInnerHTML={{ __html: comment.Comment_Text }}
                    />
                    <Block className={styles.commentMeta}>
                        <Block>
                            <Block>
                                Created:{" "}
                                {comment.Comment_CreatedAt && (
                                    <CreatedAtToTimeSince dateCreatedAt={comment.Comment_CreatedAt} />
                                )}
                            </Block>
                            <Block>
                                By: {comment.user?.User_FirstName} {comment.user?.User_Surname}
                            </Block>
                        </Block>
                        <Block className={styles.commentActions}>
                            <FontAwesomeIcon icon={faPencil} className={styles.icon} onClick={() => {
                                setEditComment(comment.Comment_Text)
                                setIsEditCommentVisible(comment)
                            }} />
                            <button
                                className={styles.mediaActions}
                                onClick={() => handleDeleteComment(comment)}
                            >
                                <FontAwesomeIcon icon={faTrashCan} className={styles.icon} />
                            </button>
                        </Block>
                    </Block>
                </Block>
            ))}
        </Card>
    );
};

interface CtaButtonsProps {
    task: Task
}

const CtaButtons: React.FC<CtaButtonsProps> = ({ task }) => {
    const router = useRouter()
    const { taskDetail, setTaskDetail, removeTask, readTasksByProjectId } = useTasksContext()

    const archiveTask = async (task: Task) => {
        if (!task.Task_ID) return

        const removed = await removeTask(task.Task_ID, task.Project_ID)
        if (!removed) return

        await readTasksByProjectId(task.Project_ID, true)

        if (taskDetail) {
            setTaskDetail(undefined)
        } else {
            router.push(`/project/${task.Project_ID}`, { scroll: false })
        }
    }

    const shareTask = async () => {
        try {
            const url = new URL(window.location.href)
            // Copy the task url to clipboard
            await navigator.clipboard.writeText(url.toString());
            alert("Link to task was copied to your clipboard");
        } catch (err) {
            alert("Failed to copy link to task");
        }
    };

    return (
        <CtaButtonsView
            task={task}
            taskDetail={taskDetail}
            archiveTask={archiveTask}
            shareTask={shareTask}
        />
    );
};

interface CtaButtonsViewProps {
    task: Task
    taskDetail: Task | undefined
    archiveTask: (task: Task) => Promise<void>
    shareTask: () => Promise<void>
}

export const CtaButtonsView: React.FC<CtaButtonsViewProps> = ({ task, taskDetail, archiveTask, shareTask }) => {
    return (
        <Block className={styles.ctaButtons}>
            <button
                className={clsx(
                    "blue-link",
                    styles.ctaButton
                )}
                onClick={() => archiveTask(task)}
            >
                <FontAwesomeIcon icon={faTrashCan} />
                <Text variant="span">Archive</Text>
            </button>
            <button
                className={clsx(
                    "blue-link",
                    styles.ctaButton
                )}
                onClick={() => shareTask()}
            >
                <FontAwesomeIcon icon={faArrowUpFromBracket} />
                <Text variant="span">Share</Text>
            </button>
            {taskDetail !== undefined && (
                <Link href={`/task/${taskDetail.project?.Project_Key}/${taskDetail.Task_Key}`} className={clsx(
                    "blue-link",
                    styles.ctaButton
                )}>
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                    <Text variant="span">Open in URL</Text>
                </Link>
            )}
        </Block>
    )
}

interface TaskDetailsAreaProps {
    task: Task
}

const TaskDetailsArea: React.FC<TaskDetailsAreaProps> = ({ task }) => {
    const { projectId, taskId } = useParams<{ projectId: string, taskId: string }>(); // Get projectId, taskId from URL
    const { readTasksByProjectId, readTaskByKeys, taskDetail, setTaskDetail, saveTaskChanges } = useTasksContext()
    const { taskTimeTracksById, readTaskTimeTracksByTaskId, addTaskTimeTrack, saveTaskTimeTrackChanges, handleTaskTimeTrack } = useTaskTimeTrackContext()

    const [taskTimeSpent, setTaskTimeSpent] = useState<number>(0) // Total amount of seconds spend

    useEffect(() => {
        if (task.Task_ID) {
            readTaskTimeTracksByTaskId(task.Task_ID)
        }
    }, [task])

    useEffect(() => {
        if (Array.isArray(taskTimeTracksById)) {
            const totalTimeInSeconds = taskTimeTracksById.reduce((total, timeTrack) => {
                // If 'Time_Tracking_Duration' exists, add it to the total time in seconds
                if (timeTrack.Time_Tracking_Duration) {
                    return total + timeTrack.Time_Tracking_Duration;
                }
                return total;
            }, 0);

            // Update the taskTimeSpent state with the calculated total time in seconds
            setTaskTimeSpent(totalTimeInSeconds);
        }
    }, [taskTimeTracksById])

    // Handle status change
    const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = event.target.value as Task["Task_Status"]
        handleTaskChanges("Task_Status", newStatus)
    };

    const handleAssigneeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newAssigneeID = event.target.value as unknown as Task["Assigned_User_ID"]
        if (newAssigneeID) handleTaskChanges("Assigned_User_ID", newAssigneeID.toString())
    }

    const handleTaskChanges = async (field: keyof Task, value: string) => {
        // Update the task change (this will update it in the database)
        await saveTaskChanges(
            { ...task, [field]: value },
            task.Project_ID
        )

        //// Task changed
        if (task) {
            if (task.Project_ID) readTasksByProjectId(task.Project_ID, true)
            if (task.Task_Key && task.project?.Project_Key) await readTaskByKeys(task.project?.Project_Key, task.Task_Key.toString())
        }

        if (taskDetail) {
            setTaskDetail({
                ...taskDetail,
                [field]: value
            })
        }
    }

    return (
        <TaskDetailsView
            task={task}
            taskDetail={taskDetail}
            taskTimeSpent={taskTimeSpent}
            taskTimeTracksById={taskTimeTracksById}
            setTaskDetail={setTaskDetail}
            saveTaskChanges={saveTaskChanges}
            handleStatusChange={handleStatusChange}
            handleAssigneeChange={handleAssigneeChange}
            handleTaskChanges={handleTaskChanges}
            handleTaskTimeTrack={handleTaskTimeTrack}
        />
    );
};

interface TaskDetailsViewProps {
    task: Task
    taskDetail: Task | undefined
    taskTimeSpent: number
    taskTimeTracksById: TaskTimeTrack[]
    setTaskDetail: React.Dispatch<React.SetStateAction<Task | undefined>>
    saveTaskChanges: (taskChanges: Task, parentId: number) => void
    handleStatusChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
    handleAssigneeChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
    handleTaskChanges: (field: keyof Task, value: string) => void
    handleTaskTimeTrack: (action: "Play" | "Stop", task: Task) => Promise<Task | undefined>
}

interface TimeSpentDisplayViewProps {
    task: Task
    handleTaskTimeTrack: (action: "Play" | "Stop", task: Task) => Promise<Task | undefined>
}

const TimeSpentDisplayView: React.FC<TimeSpentDisplayViewProps> = ({
    task,
    handleTaskTimeTrack
}) => {
    const authUser = useTypedSelector(selectAuthUser)
    const taskTimeTrack = useTypedSelector(selectAuthUserTaskTimeTrack)

    return (
        <>
            {(taskTimeTrack && taskTimeTrack.Task_ID === task.Task_ID) ? (
                <Block variant="span" className="flex gap-2 items-center">
                    <button className={clsx("timetrack-button", "timetrack-stopbutton")} onClick={() => handleTaskTimeTrack("Stop", task)}>
                        <FontAwesomeIcon icon={faStop} />
                    </button>
                    <Block variant="span">
                        {/* Calculate and display time spent since start */}
                        {taskTimeTrack.Time_Tracking_Start_Time ? (
                            <TimeSpentDisplay startTime={taskTimeTrack.Time_Tracking_Start_Time} />
                        ) : null}
                    </Block>
                </Block>
            ) : (
                <button className={clsx("timetrack-button", "timetrack-playbutton")} onClick={() => handleTaskTimeTrack("Play", task)}>
                    <FontAwesomeIcon icon={faPlay} />
                </button>
            )}
        </>
    )
}

export const TaskDetailsView: React.FC<TaskDetailsViewProps> = ({
    task,
    taskDetail,
    taskTimeSpent,
    taskTimeTracksById,
    setTaskDetail,
    saveTaskChanges,
    handleStatusChange,
    handleAssigneeChange,
    handleTaskChanges,
    handleTaskTimeTrack,
}) => {
    return (
        <Card className={styles.detailsSection}>
            <Heading variant="h2" className="font-bold">Task Details</Heading>
            {/* Task Status */}
            <p>
                <strong>Status:</strong>
                {/* Dropdown to change the status */}
                <select value={task.Task_Status} onChange={handleStatusChange} className="p-2 border rounded">
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Waiting for Review">Waiting for Review</option>
                    <option value="Done">Done</option>
                </select>
            </p>
            <p>
                <strong>Assigned To:</strong>
                {/* Dropdown to change the user assignee */}
                <select
                    value={task.Assigned_User_ID || ""}
                    onChange={handleAssigneeChange}
                    className="p-2 border rounded"
                >
                    <option value="">Unassigned</option>
                    {task.project?.team?.user_seats?.map(userSeat => {
                        return (
                            <option value={userSeat.user?.User_ID}>{userSeat.user?.User_FirstName} {userSeat.user?.User_Surname}</option>
                        )
                    })}
                </select>
            </p>
            <p>
                <strong>Team:</strong>{" "}
                {task.project?.team?.Team_Name}</p>
            <p>
                <strong>Created At:</strong>{" "}
                {task.Task_CreatedAt && (
                    <CreatedAtToTimeSince dateCreatedAt={task.Task_CreatedAt} />
                )}
            </p>
            <p>
                <strong>Due Date:</strong>{" "}
                {task.Task_Due_Date ? (
                    new Date(task.Task_Due_Date).toLocaleString()
                ) : (
                    "N/A"
                )}
            </p>
            <p className="timetrack-metric">
                <strong>Time Tracking:</strong>
                <TimeSpentDisplayView task={task} handleTaskTimeTrack={handleTaskTimeTrack} />
            </p>
            <p className="timespent-metric mt-2">
                <strong>Time Spent:</strong>
                <Block variant="span">
                    <SecondsToTimeDisplay totalSeconds={taskTimeSpent} />{" "}
                    <Block variant="small">({taskTimeTracksById.length} entries)</Block>
                </Block>
            </p>
        </Card>
    )
}

interface TaskDetailProps {
    theTask: Task
}

export const TaskDetail: React.FC<TaskDetailProps> = ({ theTask }) => {
    const { taskDetail, setTaskDetail } = useTasksContext()

    if (!theTask) return null

    return (
        <>
            <Block className="flex justify-between">
                <Link
                    onClick={() => setTaskDetail(undefined)}
                    href={`/project/${theTask.project?.Project_ID}`}
                    className="blue-link"
                >
                    &laquo; Go to Project
                </Link>
                {taskDetail !== undefined && (
                    <button onClick={() => setTaskDetail(undefined)} className="blue-link">
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                )}
            </Block>
            <Block className={styles.content}>
                <Block className={styles.leftPanel}>
                    <TitleArea task={theTask} />
                    <DescriptionArea task={theTask} />
                    <MediaFilesArea task={theTask} />
                    <CommentsArea task={theTask} />
                </Block>
                <Block className={styles.rightPanel}>
                    <CtaButtons task={theTask} />
                    <TaskDetailsArea task={theTask} />
                </Block>
            </Block>
        </>
    );
};

export const TaskDetailWithModal = () => {
    const taskDetailRef = useRef<HTMLDivElement>(null);
    const { taskDetail, setTaskDetail, tasksById } = useTasksContext()

    // Handle clicks outside taskDetailContainer but inside taskDetailModalBackground
    const handleBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (taskDetail && taskDetailRef.current && !taskDetailRef.current.contains(event.target as Node)) {
            setTaskDetail(undefined)
        }
    }

    useEffect(() => {
        // Disable body scrolling when TaskDetailContainer is mounted
        if (taskDetail) {
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }

        // Effect to listen for the ESC key
        const handleEscPress = (event: KeyboardEvent) => {
            if (event.key === "Escape" && taskDetail) setTaskDetail(undefined)
        };

        // Attach event listener when component is visible
        window.addEventListener("keydown", handleEscPress)

        return () => {
            document.body.style.overflow = ''; // Restore scrolling on unmount
        };
    }, [taskDetail])

    useEffect(() => {
        if (tasksById.length) {
            const updatedTask = tasksById.find(task => task.Task_ID === taskDetail?.Task_ID)
            if (updatedTask) setTaskDetail({ ...updatedTask })
        }
    }, [tasksById])

    if (!taskDetail) return null

    return (
        <Block className={styles.taskDetailModalBackground} onClick={handleBackgroundClick}>
            <Block className={clsx(styles.taskDetailContainer, styles.withModal)} ref={taskDetailRef}>
                <TaskDetail theTask={taskDetail} />
            </Block>
        </Block>
    )
}

export const TaskDetailWithoutModal = () => {
    const { projectKey, taskKey } = useParams<{ projectKey: string, taskKey: string }>(); // Get taskId from URL
    const { taskByKeys, readTaskByKeys, setTaskDetail } = useTasksContext()
    const taskDetailRef = useRef<HTMLDivElement>(null);

    const [renderTask, setRenderTask] = useState<Task | undefined>(undefined)

    useEffect(() => {
        const fetch = async () => {
            setRenderTask(undefined)
            await readTaskByKeys(projectKey, taskKey)
            setTaskDetail(undefined)
        }

        if (projectKey && taskKey) fetch()
    }, [projectKey, taskKey])

    useEffect(() => {
        if (taskKey) {
            setRenderTask(taskByKeys)
            document.title = `Task: ${taskByKeys?.Task_Title} - GiveOrTake`
        }
    }, [taskByKeys])

    if (!renderTask) return <Block>Task not found</Block>

    return (
        <Block className="page-content">
            <Block className={styles.taskDetailContainer} ref={taskDetailRef}>
                <TaskDetail theTask={renderTask} />
            </Block>
        </Block>
    )
}
