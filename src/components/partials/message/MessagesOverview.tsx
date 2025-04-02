"use client";

// External
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";

// Internal
import styles from "@/core-ui/styles/modules/Messages.module.scss";
import { useMessagesContext } from "@/contexts";
import { selectAuthUser, useTypedSelector } from "@/redux";
import { Message, Property, User } from "@/types";
import { SignInView } from "@/app/sign-in/page";
import { Block, Text } from "@/components/ui/block-text";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

export const MessagesOverview = () => {
    // Hooks
    const { messagesById, readMessagesByUserId } = useMessagesContext();
    const searchParams = useSearchParams();

    // State
    const authUser = useTypedSelector(selectAuthUser);
    const [openedMessagesList, setOpenedMessagesList] = useState<boolean>(false)

    // Get Property_ID from search params
    const propertyIdFromUrl = searchParams.get("property");
    const selectedProperty = Array.isArray(messagesById) && messagesById.length > 0
        ? messagesById.find(
            (msg) => msg.Property_ID?.toString() === propertyIdFromUrl
        )?.property
        : undefined;

    // Fetch messages when user logs in
    useEffect(() => {
        if (authUser?.User_ID) readMessagesByUserId(authUser.User_ID)

        document.title = "Messages - CasaNova";
    }, [authUser]);

    if (!authUser?.User_ID) return <SignInView />

    return (
        <div className={styles.messagesWrapper}>
            {/* Left Sidebar - Messages List */}
            <div className={styles.mobileMenuTrigger}>
                <span>See all messages</span>
                <FontAwesomeIcon 
                    icon={faBars}
                    onClick={() => setOpenedMessagesList(!openedMessagesList)} 
                />
            </div>
            <div className={clsx(
                styles.messagesList,
                { [styles.opened]: openedMessagesList },
            )}>
                <MessagesList
                    messages={messagesById}
                    authUserId={authUser.User_ID}
                    selectedProperty={selectedProperty}
                />
            </div>

            {/* Right Side - Message Conversation */}
            <div className={styles.messageConversation}>
                {selectedProperty ? (
                    <MessageConversation
                        messages={messagesById}
                        selectedProperty={selectedProperty}
                        authUserId={authUser?.User_ID}
                    />
                ) : (
                    <>
                        {propertyIdFromUrl ? (
                            <div className={styles.notFound}>
                                The conversation was not found
                            </div>
                        ) : (
                            <div className={styles.selectConversation}>
                                Select a conversation to start chatting
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

interface MessagesListProps {
    messages: Message[];
    authUserId: number;
    selectedProperty: Property | undefined
}

export const MessagesList: React.FC<MessagesListProps> = ({ messages, authUserId, selectedProperty }) => {
    const [uniqueProperties, setUniqueProperties] = useState<Record<number, Property>>({}) // Group messages by property

    useEffect(() => {
        if (Array.isArray(messages) && messages.length > 0) {
            const propertiesMap: Record<number, Property> = {};
            messages.forEach((msg) => {
                const property = msg.property;
                if (property?.Property_ID) {
                    propertiesMap[property.Property_ID] = property;
                }
            });
            setUniqueProperties(propertiesMap);
        }
    }, [messages])

    if (!Array.isArray(messages) || !messages.length) {
        return (
            <div className="p-4">
                <h2 className="text-lg font-semibold mb-4">Messages ({Object.keys(uniqueProperties).length})</h2>
                <div className="flex items-center justify-center h-full text-gray-500">
                    No messages found
                </div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Messages ({Object.keys(uniqueProperties).length})</h2>
            <ul>
                {Object.values(uniqueProperties).map((property) => (
                    <li
                        key={property.Property_ID}
                        className={clsx(
                            "p-3 rounded-lg cursor-pointer transition",
                            {
                                "bg-gray-200": selectedProperty?.Property_ID === property.Property_ID,
                                "hover:bg-gray-100": selectedProperty?.Property_ID !== property.Property_ID,
                            }
                        )}
                    >
                        <Link href={`?property=${property.Property_ID}`}>
                            <div className="flex items-center gap-3">
                                {(() => {
                                    const image = property.images?.find(img => img.Image_Order === 1)
                                    const imageSrc = image?.Image_URL || `http://localhost:8000/storage/${image?.Image_Path}`
                                    
                                    return (
                                        <img
                                            src={imageSrc}
                                            alt={property.Property_Title}
                                            className="h-14 w-14 object-cover rounded-full"
                                        />
                                    )
                                })()}
                                <span className="text-sm">{property.Property_Address} {property.Property_City}</span>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

interface MessageConversationProps {
    messages: Message[];
    selectedProperty: Property;
    authUserId?: number;
}

export const MessageConversation: React.FC<MessageConversationProps> = ({ messages, selectedProperty, authUserId }) => {
    const [conversation, setConversation] = useState<Message[]>([]);

    useEffect(() => {
        if (selectedProperty.User_ID) {
            const conversation = messages
                .filter(
                    (msg) => (msg.sender?.User_ID === selectedProperty.User_ID || msg.receiver?.User_ID === selectedProperty.User_ID) &&
                        (msg.Property_ID === selectedProperty.Property_ID)
                )
                .sort((a, b) =>
                    new Date(a.Message_CreatedAt || 0).getTime() - new Date(b.Message_CreatedAt || 0).getTime()
                );

            setConversation(conversation)
        }
    }, [messages, selectedProperty]);

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 bg-white border-b flex items-center gap-3">
                {(() => {
                    const image = selectedProperty.images?.find(img => img.Image_Order === 1);
                    const imageSrc = image?.Image_URL || `http://localhost:8000/storage/${image?.Image_Path}`;

                    return (
                        <Link href={`/listing/${selectedProperty.Property_ID}`}>
                            <img
                                src={imageSrc}
                                alt={selectedProperty.Property_Title}
                                className="h-14 w-14 bg-gray-300 object-cover rounded-full"
                            />
                        </Link>
                    );
                })()}
                <Block>
                    <Link href={`/listing/${selectedProperty.Property_ID}`} className="text-lg font-semibold">
                        {selectedProperty.Property_Address}, {selectedProperty.Property_City}
                    </Link>
                    <span className="text-md text-gray-500 block">
                        {selectedProperty.user?.User_First_Name} {selectedProperty.user?.User_Last_Name}
                    </span>
                </Block>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto">
                {conversation.map((msg: Message) => (
                    <div key={msg.Message_ID} className="mb-4">
                        <Block className={clsx("my-1 flex gap-2", {
                            "justify-end": msg.Sender_ID === authUserId,
                            "justify-start": msg.Sender_ID !== authUserId
                        })}>
                            <Text variant="span" className={clsx(
                                "text-xs font-semibold",
                                {
                                    "text-right": msg.Sender_ID === authUserId,
                                    "text-left": msg.Sender_ID !== authUserId
                                }
                            )}>
                                {msg.sender?.User_First_Name} {msg.sender?.User_Last_Name}
                            </Text>
                            <Text variant="span" className={clsx(
                                "text-xs text-gray-500",
                                {
                                    "text-right": msg.Sender_ID === authUserId,
                                    "text-left": msg.Sender_ID !== authUserId
                                }
                            )}>
                                {msg.Message_CreatedAt && new Date(msg.Message_CreatedAt).toLocaleString()}
                            </Text>
                        </Block>
                        <div className={clsx(
                            "p-2 max-w-xs rounded-lg",
                            {
                                "bg-blue-500 text-white ml-auto": msg.Sender_ID === authUserId,
                                "bg-gray-200 text-gray-800": msg.Sender_ID !== authUserId
                            }
                        )}>
                            {msg.Message_Text}
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Field */}
            <div className="p-4 bg-white border-t flex items-center flex-col sm:flex-row">
                <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 border rounded-lg p-2"
                />
                <button className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg">
                    Send
                </button>
            </div>
        </div>
    );
};