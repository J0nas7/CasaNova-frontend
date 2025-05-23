"use client"

// External
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from "next/navigation";
import Link from 'next/link';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faBed, faBath, faRulerCombined, faUsers, faMoneyBillWave, faXmark, faArrowLeft, faArrowRight, faHouseChimney } from "@fortawesome/free-solid-svg-icons";

// Dynamically import ReactQuill with SSR disabled
import "react-quill/dist/quill.snow.css"; // Import the Quill styles
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// Internal
import { useMessagesContext, usePropertiesContext } from '@/contexts/'; // Ensure this is correctly set up
import { Message, Property, PropertyImage, PropertyStates, User } from '@/types';
import { selectAuthUser, useTypedSelector } from '@/redux';
import { LoginForm } from '../auth/sign-in';
import { PropertyImageCard } from './image/PropertyImage';
import clsx from 'clsx';
import { Loading, Block, Text } from '@/components';
import { env } from '@/env.urls';

const PropertyDetails: React.FC = () => {
    const { propertyId } = useParams<{ propertyId: string }>(); // Get propertyId from URL
    const { propertyById, readPropertyById } = usePropertiesContext()
    const authUser = useTypedSelector(selectAuthUser) // Redux

    const [renderProperty, setRenderProperty] = useState<PropertyStates>(undefined)

    useEffect(() => { readPropertyById(parseInt(propertyId)); }, [propertyId])
    useEffect(() => {
        if (propertyById) {
            setRenderProperty(propertyById)
            document.title = `Property in ${propertyById?.Property_City} - CasaNova`
        }
    }, [propertyById])

    if (propertyById === false) {
        return (
            <Block className="page-content">
                <Text>Property not found</Text>
                <Link href="/my-listings" className="blue-link-light">Go to Your Listings</Link>
            </Block>
        )
    }

    if (!renderProperty) return <Loading /> // Show loading state while fetching data

    return (
        <PropertyDetailsView
            property={renderProperty}
            authUser={authUser}
        />
    );
};

type PropertyDetailsViewProps = {
    property: Property
    authUser: User | undefined
}

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export const PropertyDetailsView: React.FC<PropertyDetailsViewProps> = ({ property, authUser }) => {
    const [showMessageComposer, setShowMessageComposer] = useState<boolean>(false)
    const [showJumbotronHighlightImage, setShowJumbotronHighlightImage] = useState<PropertyImage | undefined>(undefined)

    if (!property.Property_Title || property.Property_Title === "") {
        return (
            <Block className="page-content">
                <Text>Property not found</Text>
                <Link href="/search" className="blue-link-light">Go to search</Link>
            </Block>
        )
    }

    return (
        <Block className="page-content">
            {/* Property Availability */}
            {!property.Property_Is_Active && (
                <Block className="bg-red-500 bg-opacity-50 text-white p-4 rounded-lg mb-4">
                    <FontAwesomeIcon icon={faHouseChimney} className="mr-2" />
                    This listing is marked as unavailable.
                </Block>
            )}
            
            {/* Jumbotron - Property Images */}
            <JumbotronImageRotation
                property={property}
                numberInRotation={3}
                setShowJumbotronHighlightImage={setShowJumbotronHighlightImage}
                classNames={{
                    rotationWrapper: "grid grid-cols-1 md:grid-cols-3 gap-6",
                    rotationImageWrapper: "relative w-full h-[500px] overflow-hidden rounded-lg shadow-lg hover:cursor-pointer",
                    rotationImage: "w-full h-full object-cover",
                }}
            />

            {/* Highlight Image Modal */}
            {showJumbotronHighlightImage && (
                <JumbotronHighlightImage
                    image={showJumbotronHighlightImage}
                    property={property}
                    setShowJumbotronHighlightImage={setShowJumbotronHighlightImage}
                />
            )}

            {/* Property Information Section */}
            <PropertyInformationSection
                property={property}
                showMessageComposer={showMessageComposer}
                setShowMessageComposer={setShowMessageComposer}
                authUser={authUser}
            />
        </Block>
    );
};

export const JumbotronHighlightImage: React.FC<{ image: PropertyImage, property: Property, setShowJumbotronHighlightImage: React.Dispatch<React.SetStateAction<PropertyImage | undefined>> }> = ({ image, property, setShowJumbotronHighlightImage }) => {
    const jumbotronHighlightImageRef = useRef<HTMLDivElement>(null);

    // Handle clicks outside taskDetailContainer but inside taskDetailModalBackground
    const handleBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (jumbotronHighlightImageRef.current && !jumbotronHighlightImageRef.current.contains(event.target as Node)) {
            setShowJumbotronHighlightImage(undefined)
        }
    }

    useEffect(() => {
        // Disable body scrolling when JumbotronHighlightImage is mounted
        document.body.style.overflow = 'hidden'; // Prevent scrolling

        // Effect to listen for the ESC key
        const handleEscPress = (event: KeyboardEvent) => {
            if (event.key === "Escape") setShowJumbotronHighlightImage(undefined)
        };

        // Attach event listener when component is visible
        window.addEventListener("keydown", handleEscPress)

        return () => {
            document.body.style.overflow = ''; // Restore scrolling on unmount
        };
    }, [])

    return (
        <Block
            className="fixed !mt-0 p-3 flex w-full h-full items-center justify-center z-10 bg-black bg-opacity-50"
            onClick={handleBackgroundClick}
        >
            <Block
                className="relative max-w-4xl w-full max-h-full p-1 bg-white shadow-lg rounded-lg"
                ref={jumbotronHighlightImageRef}
            >
                <button
                    className="absolute w-10 h-10 left-auto top-3 right-3 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full"
                    onClick={() => setShowJumbotronHighlightImage(undefined)}
                >
                    <FontAwesomeIcon icon={faXmark} />
                </button>
                <JumbotronImageRotation
                    property={property}
                    enableAutoRotation={false}
                    numberInRotation={1}
                    image={image}
                    setShowJumbotronHighlightImage={setShowJumbotronHighlightImage}
                    classNames={{
                        rotationWrapper: "w-full h-full p-1 flex items-center justify-center",
                        rotationImageWrapper: "relative w-auto h-auto",
                        rotationImage: "w-auto h-auto max-h-[90vh]",
                    }}
                />
            </Block>
        </Block>
    )
};

interface JumbotronImageRotationProps {
    property: Property;
    image?: PropertyImage
    numberInRotation: number; // Number of images to show in rotation at once
    enableAutoRotation?: boolean; // Boolean to enable/disable auto-rotation
    setShowJumbotronHighlightImage: (image: PropertyImage) => void; // Function to show the highlighted image
    classNames: {
        rotationWrapper: string;
        rotationImageWrapper: string;
        rotationImage: string;
    }
}

export const JumbotronImageRotation: React.FC<JumbotronImageRotationProps> = ({
    property,
    image,
    numberInRotation,
    enableAutoRotation = true, // Default to true if not provided
    setShowJumbotronHighlightImage,
    classNames
}) => {
    const [currentImageOrderNr, setCurrentImageOrderNr] = useState<number>(0)
    const [currentRight, setCurrentRight] = useState<number>(0);
    const [nextRight, setNextRight] = useState<number>(100);
    const [rotationEnabled, setRotationEnabled] = useState<boolean>(enableAutoRotation);
    const imageCount = property.images?.length || 0;

    /**
     * Methods
     */

    // Function to run slider animation
    const runSliderAnimation = (duration = 1000, reverse = false) => {
        const stepTime = 10; // Update every 10ms
        const steps = duration / stepTime;
        const increment = 100 / steps;

        let current = reverse ? -100 : 0;
        let next = reverse ? 0 : 100;

        const currentInterval = setInterval(() => {
            current += reverse ? increment : -increment;
            if ((reverse && current >= 0) || (!reverse && current <= -100)) {
                current = reverse ? 0 : -100;
                clearInterval(currentInterval);
            }
            setCurrentRight(Math.round(current));
        }, stepTime);

        const nextInterval = setInterval(() => {
            next += reverse ? increment : -increment;
            if ((reverse && next >= 100) || (!reverse && next <= 0)) {
                next = reverse ? 100 : 0;
                clearInterval(nextInterval);
            }
            setNextRight(Math.round(next));
        }, stepTime);
    }

    useEffect(() => {
        if (rotationEnabled && imageCount > numberInRotation) {
            const mainInterval = setInterval(() => {
                runSliderAnimation()
            }, 3000); // Run every 3 seconds

            return () => clearInterval(mainInterval);
        }
    }, [imageCount, rotationEnabled, numberInRotation]);

    // Handle the interval logic based on rotationEnabled
    useEffect(() => {
        let timeout: NodeJS.Timeout | null = null;
        let interval: NodeJS.Timeout | null = null;

        if (rotationEnabled && imageCount > numberInRotation) {
            console.log("Starting rotation (delay first by 3s)");

            timeout = setTimeout(() => {
                interval = setInterval(() => {
                    if (rotationEnabled) {
                        console.log("Rotating to next image", rotationEnabled);
                        setCurrentImageOrderNr((prevNr) => (prevNr + 1) % imageCount);
                    }
                }, 3000); // Rotate every 3 seconds after initial delay
            }, 3000); // Delay first rotation by 3 seconds
        } else {
            console.log("Rotation disabled");
        }

        return () => {
            if (timeout) {
                clearTimeout(timeout);
                console.log("First delay cleared");
            }
            if (interval) {
                clearInterval(interval);
                console.log("Interval cleared");
            }
        };
    }, [imageCount, rotationEnabled, numberInRotation])

    const handlePrev = () => {
        setRotationEnabled(false)
        runSliderAnimation(250, true)
        setCurrentImageOrderNr((prevNr) => (prevNr - 1 + imageCount) % imageCount);
    };

    const handleNext = () => {
        setRotationEnabled(false)
        runSliderAnimation(250)
        setCurrentImageOrderNr((prevNr) => (prevNr + 1) % imageCount);
    };

    useEffect(() => {
        if (image && numberInRotation === 1) {
            const index = image.Image_Order || 0;
            setCurrentImageOrderNr(index - 1)
        }
    }, [image, numberInRotation])

    // Get the N images in rotation (in this case, `numberInRotation` is dynamic)
    const currentImages = imageCount > 0 && property.images
        ? Array.from({ length: Math.min(numberInRotation, imageCount) }).map((_, i) => {
            if (!property.images) return undefined;

            const index = (currentImageOrderNr + i) % imageCount;
            const nextIndex = (index + 1) % imageCount;
            const sortedImages = [...property.images].sort((a, b) => a.Image_Order - b.Image_Order);
            return {
                current: sortedImages[index],
                next: sortedImages[nextIndex],
            };
        })
        : [];

    return (
        <div className="relative max-h-full">
            {/* Image Grid */}
            <div className={classNames.rotationWrapper}>
                {currentImages.length > 0 ? (
                    currentImages.map((image, i) => (
                        <div
                            key={i}
                            className={classNames.rotationImageWrapper}
                            onClick={() => setShowJumbotronHighlightImage(
                                currentRight === -100 ? image?.next!
                                    : image?.current!
                            )}
                        >
                            <img
                                src={image?.current?.Image_URL || `${env.url.API_URL}/storage/${image?.current?.Image_Path}`}
                                alt={`Property Image ${currentImageOrderNr + i + 1}`}
                                className={clsx(
                                    classNames.rotationImage,
                                    { ["absolute"]: numberInRotation > 1 }
                                )}
                                style={{ left: `${(currentRight)}%` }}
                            />
                            <img
                                src={image?.next?.Image_URL || `${env.url.API_URL}/storage/${image?.next?.Image_Path}`}
                                alt={`Property Image ${currentImageOrderNr + i + 2}`}
                                className={clsx(
                                    classNames.rotationImage,
                                    { ["absolute left-auto"]: numberInRotation > 1 },
                                    { ["hidden"]: numberInRotation === 1 },
                                )}
                                style={{ right: `-${nextRight}%` }}
                            />
                            <span
                                className={clsx(
                                    "absolute top-auto left-auto bottom-2 right-0 mr-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded",
                                    { ["hidden"]: (
                                        currentRight === -100 && numberInRotation > 1
                                    ) }
                                )}
                            >
                                {(currentImageOrderNr + i) % imageCount + 1} / {imageCount}
                            </span>
                            <span
                                className={clsx(
                                    "absolute top-auto left-auto bottom-2 mr-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded",
                                    { ["hidden"]: numberInRotation === 1 }
                                )}
                                style={{
                                    right: (numberInRotation > 1 ? `-${nextRight}%` : "8px"),
                                }}
                            >
                                {(currentImageOrderNr + i + 1) % imageCount + 1} / {imageCount}
                            </span>
                        </div>
                    ))
                ) : (
                    Array.from({ length: numberInRotation }).map((_, index) => (
                        <div key={index} className={classNames.rotationImageWrapper}>
                            <img
                                src="https://placecats.com/400/500"
                                alt="No Image Available"
                                className={classNames.rotationImage}
                            />
                        </div>
                    ))
                )}
            </div>

            {/* Left Arrow */}
            {imageCount > numberInRotation && (
                <button
                    onClick={handlePrev}
                    className={clsx(
                        "absolute w-10 h-10 left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full",
                        { ["hidden md:block"]: numberInRotation > 1 }
                    )}
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                </button>
            )}

            {/* Right Arrow */}
            {imageCount > numberInRotation && (
                <button
                    onClick={handleNext}
                    className={clsx(
                        "absolute w-10 h-10 left-auto right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full",
                        { ["hidden md:block"]: numberInRotation > 1 }
                    )}
                >
                    <FontAwesomeIcon icon={faArrowRight} />
                </button>
            )}
        </div>
    );
};

interface PropertyInformationSectionProps {
    property: Property
    showMessageComposer: boolean
    setShowMessageComposer: React.Dispatch<React.SetStateAction<boolean>>
    authUser: User | undefined
}

export const PropertyInformationSection: React.FC<PropertyInformationSectionProps> = ({ property, showMessageComposer, setShowMessageComposer, authUser }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Left Section - Title & Description */}
        <div className="col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">{property.Property_Title}</h2>
            <div
                className="text-gray-600"
                dangerouslySetInnerHTML={{ __html: property.Property_Description }}
            />
        </div>

        {/* Right Section - Property Details */}
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">🏠 Property Details</h2>
            <ul className="space-y-3 text-gray-700">
                <li className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="text-green-500" />
                    <span><strong>Price:</strong> ${property.Property_Price_Per_Month} / month</span>
                </li>
                <li className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faBed} className="text-blue-500" />
                    <span><strong>Bedrooms:</strong> {property.Property_Num_Bedrooms}</span>
                </li>
                <li className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faBath} className="text-blue-400" />
                    <span><strong>Bathrooms:</strong> {property.Property_Num_Bathrooms}</span>
                </li>
                <li className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faRulerCombined} className="text-gray-600" />
                    <span><strong>Size:</strong> {property.Property_Square_Feet} sqft</span>
                </li>
            </ul>
            <Block className="space-y-3 mt-3">
                {authUser && property.messages && property.messages.length > 0 ? (
                    <Link
                        href={`/messages?property=${property.Property_ID}`}
                        className="button-blue inline"
                    >
                        View Messages
                    </Link>
                ) : (
                    <>
                        <button
                            className="button-blue"
                            onClick={() => setShowMessageComposer(!showMessageComposer)}
                        >
                            Write message to landlord
                        </button>
                        {showMessageComposer && (
                            <PropertyMessageComposer
                                property={property}
                                authUser={authUser}
                                setShowMessageComposer={setShowMessageComposer}
                            />
                        )}
                    </>
                )}
            </Block>
        </div>
    </div>
)

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
    return <Block className={`bg-white rounded-lg p-4 mb-4 ${className}`}>{children}</Block>;
};

interface PropertyMessageComposerProps {
    property: Property;
    authUser: User | undefined;
    setShowMessageComposer: React.Dispatch<React.SetStateAction<boolean>>
}

export const PropertyMessageComposer: React.FC<PropertyMessageComposerProps> = ({ property, authUser, setShowMessageComposer }) => {
    const router = useRouter()
    const { addMessage } = useMessagesContext()
    const messageComposerRef = useRef<HTMLDivElement>(null);
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [message, setMessage] = useState("")
    
    // Handle clicks outside taskDetailContainer but inside taskDetailModalBackground
    const handleBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (messageComposerRef.current && !messageComposerRef.current.contains(event.target as Node)) {
            setShowMessageComposer(false)
        }
    }

    const handleMessageSend = async () => {
        if (!authUser || !authUser.User_ID || !property.Property_ID) {
            alert("User or Property ID is missing. Try again.");
            return
        }
        
        const messageData: Message = {
            Sender_ID: authUser.User_ID,
            Receiver_ID: property.User_ID,
            Property_ID: property.Property_ID,
            Message_Text: message
        };
        
        setMessage(""); // Clear the message after sending
        setShowMessageComposer(false); // Close the composer
        
        // Send the messageData to your backend or API
        const messageSend = await addMessage(authUser.User_ID, messageData)
        router.push(`/messages?property=${property.Property_ID}`)
    }

    useEffect(() => {
        // Disable body scrolling when PropertyMessageComposer is mounted
        document.body.style.overflow = 'hidden'; // Prevent scrolling

        // Effect to listen for the ESC key
        const handleEscPress = (event: KeyboardEvent) => {
            if (event.key === "Escape") setShowMessageComposer(false)
        };

        // Attach event listener when component is visible
        window.addEventListener("keydown", handleEscPress)

        return () => {
            document.body.style.overflow = ''; // Restore scrolling on unmount
        };
    }, [])

    return (
        <Block
            className="fixed !mt-0 p-3 flex w-full h-full items-center justify-center z-10 bg-black bg-opacity-40"
            onClick={handleBackgroundClick}
        >
            <Block className="max-w-xl w-full mx-auto p-6 bg-white shadow-lg rounded-lg" ref={messageComposerRef}>
                <Block className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Send a Message to the Landlord</h2>
                    <button onClick={() => setShowMessageComposer(false)}>
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </Block>

                {authUser ? (
                    <>
                        {isSubscribed ? (
                            <>
                                <ReactQuill
                                    className="w-full mb-4"
                                    theme="snow"
                                    value={message}
                                    onChange={(value) => setMessage(value)}
                                    modules={{
                                        toolbar: [
                                            [{ header: [1, 2, false] }],
                                            ['bold', 'italic', 'underline'],
                                            ['image', 'code-block'],
                                        ],
                                    }}
                                    formats={['header', 'bold', 'italic', 'underline', 'image', 'code-block']}
                                    style={{ height: 'auto' }} // This makes sure the container adapts
                                />
                                <style>
                                    {`
                                        .ql-editor {
                                          min-height: 150px !important;
                                        }
                                      `}
                                </style>

                                <button className="w-full blue-link-light" onClick={handleMessageSend}>Send Message</button>
                            </>
                        ) : (
                            <Card className="p-4">
                                <Block>
                                    <h3 className="text-lg font-semibold mb-2">Subscribe to Contact Landlords</h3>
                                    <p className="text-sm mb-4">
                                        Get full access to contact landlords and apply for properties.
                                    </p>

                                    <div className="space-y-3">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input type="radio" name="plan" value="24h" className="hidden" />
                                            <span className="w-4 h-4 border-2 border-gray-400 rounded-full flex items-center justify-center">
                                                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                            </span>
                                            <span>24 Hours Access - 29 kr.</span>
                                        </label>

                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input type="radio" name="plan" value="4weeks" className="hidden" defaultChecked />
                                            <span className="w-4 h-4 border-2 border-blue-600 rounded-full flex items-center justify-center">
                                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                            </span>
                                            <span>4 Weeks Full Access - 349 kr.</span>
                                        </label>

                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input type="radio" name="plan" value="2months" className="hidden" />
                                            <span className="w-4 h-4 border-2 border-gray-400 rounded-full flex items-center justify-center">
                                                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                            </span>
                                            <span>2 Months Full Access - 499 kr.</span>
                                        </label>
                                    </div>

                                    <button className="blue-link-light w-full mt-4" onClick={() => setIsSubscribed(true)}>
                                        Subscribe & Unlock Messaging
                                    </button>
                                </Block>
                            </Card>
                        )}
                    </>
                ) : (
                    <>
                        <LoginForm />
                    </>
                )}

            </Block>
        </Block>
    );
}

export default PropertyDetails;