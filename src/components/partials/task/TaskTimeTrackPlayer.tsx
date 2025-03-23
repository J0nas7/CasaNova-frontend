// External
import React, { useEffect, useState } from 'react'
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStop } from '@fortawesome/free-solid-svg-icons';

// Internal
import { Block } from '@/components/ui/block-text'
import { selectAuthUserTaskTimeTrack, useAppDispatch, useAuthActions, useTypedSelector } from '@/redux';
import { useTasksContext, useTaskTimeTrackContext } from '@/contexts';
import { TaskTimeTrack } from '@/types';

export const TaskTimeTrackPlayer = () => {
    const searchParams = useSearchParams();
    const urlTaskIds = searchParams.get("taskIds")

    const { latestUniqueTaskTimeTracksByProject, getLatestUniqueTaskTimeTracksByProject, handleTaskTimeTrack } = useTaskTimeTrackContext()
    const { taskDetail } = useTasksContext()
    const { fetchIsLoggedInStatus } = useAuthActions()
    const dispatch = useAppDispatch()

    const taskTimeTrack = useTypedSelector(selectAuthUserTaskTimeTrack)

    useEffect(() => {
        if (!taskTimeTrack) dispatch(fetchIsLoggedInStatus())

        if (taskTimeTrack) getLatestUniqueTaskTimeTracksByProject(taskTimeTrack.Project_ID)
    }, [taskTimeTrack])

    if (!taskTimeTrack || taskDetail || urlTaskIds) return null

    return (
        <Block className="taskplayer-container">
            <Block className="timetrack-metric">
                {taskTimeTrack && (
                    <Block variant="span" className="w-full flex gap-3 items-center">
                        {taskTimeTrack.task !== undefined && (
                            <Block variant="span" className="block w-8">
                                <button className="timetrack-button timetrack-stopbutton" onClick={() => handleTaskTimeTrack("Stop", taskTimeTrack.task!)}>
                                    <FontAwesomeIcon icon={faStop} />
                                </button>
                            </Block>
                        )}
                        <Block variant="span" className="block w-20 min-w-20">
                            {/* Calculate and display time spent since start */}
                            {taskTimeTrack.Time_Tracking_Start_Time ? (
                                <TimeSpentDisplay startTime={taskTimeTrack.Time_Tracking_Start_Time} />
                            ) : null}
                        </Block>
                        <Link href={`/task/${taskTimeTrack.task?.project?.Project_Key}/${taskTimeTrack.task?.Task_Key}`} className="blue-link-light h-12 overflow-y-hidden break-all">
                            {taskTimeTrack.task?.Task_Title}
                        </Link>
                        {latestUniqueTaskTimeTracksByProject && latestUniqueTaskTimeTracksByProject.length && (
                            <Block variant="span" className="inline">
                                {/* Dropdown to change the task */}
                                <select
                                    onChange={(event) => {
                                        if (!latestUniqueTaskTimeTracksByProject) return

                                        const selectedTaskTimeTrack = latestUniqueTaskTimeTracksByProject?.find(
                                            (timetrack: TaskTimeTrack) => timetrack.Time_Tracking_ID === Number(event.target.value)
                                        );

                                        if (selectedTaskTimeTrack?.task) {
                                            handleTaskTimeTrack("Play", selectedTaskTimeTrack.task);
                                        }
                                    }}
                                    className="timetrack-changetask"
                                >
                                    <option value="">Recent tasks</option>
                                    {latestUniqueTaskTimeTracksByProject.map((timetrack: TaskTimeTrack, key) => {
                                        if (timetrack.Task_ID === taskTimeTrack.Task_ID) return null

                                        return (
                                            <option key={key} value={timetrack.Time_Tracking_ID}>
                                                {timetrack.task?.Task_Title}
                                            </option>
                                        )
                                    })}
                                </select>
                            </Block>
                        )}
                    </Block>
                )}
            </Block>
        </Block>
    )
}

export const CreatedAtToTimeSince = ({ dateCreatedAt }: { dateCreatedAt: string }) => {
    const createdAt = new Date(dateCreatedAt);
    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const formatTime = (date: Date) => {
        return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    };

    const formatDate = (date: Date) => {
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    };

    if (diffMinutes < 60) {
        return `${diffMinutes} minutes ago`; // "x minutes ago"
    } else if (diffHours < 24 && createdAt.getDate() === now.getDate()) {
        return `today, ${formatTime(createdAt)}`; // "today, HH:mm"
    } else if (diffDays === 1 || (diffHours < 48 && createdAt.getDate() === now.getDate() - 1)) {
        return `yesterday, ${formatTime(createdAt)}`; // "yesterday, HH:mm"
    } else if (diffDays <= 5) {
        const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return `${weekdays[createdAt.getDay()]}, ${formatTime(createdAt)}`; // "Weekday, HH:mm"
    } else {
        return createdAt.toLocaleString()
    }
}

export const SecondsToTimeDisplay = ({ totalSeconds }: { totalSeconds: number }) => {
    const [formattedTime, setFormattedTime] = useState<string>('')

    useEffect(() => {
        // Calculate seconds, minutes, and hours
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);

        // Format the time as hh:mm:ss
        const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        setFormattedTime(formattedTime);
    }, [totalSeconds])

    return <>{formattedTime}</>
}

export const TimeSpentDisplay = ({ startTime }: { startTime: string }) => {
    const [diffInSeconds, setDiffInSeconds] = useState<number>(0);

    useEffect(() => {
        const interval = setInterval(() => {
            const startDate = new Date(startTime);
            const currentDate = new Date();
            const diffInMilliseconds = currentDate.getTime() - startDate.getTime();
            const diffInSeconds = Math.floor(diffInMilliseconds / 1000);

            setDiffInSeconds(diffInSeconds)
        }, 1000);

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, [startTime]);

    return <SecondsToTimeDisplay totalSeconds={diffInSeconds} />
};