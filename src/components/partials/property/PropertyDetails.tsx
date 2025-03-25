"use client"

// External
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from "next/navigation";
import Link from 'next/link';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faBed, faBath, faRulerCombined, faUsers, faMoneyBillWave, faXmark, faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

// Dynamically import ReactQuill with SSR disabled
import "react-quill/dist/quill.snow.css"; // Import the Quill styles
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// Internal
import { usePropertiesContext } from '@/contexts/'; // Ensure this is correctly set up
import { Property, PropertyImage, User } from '@/types';
import { Block, Text } from '@/components/ui/block-text';
import { selectAuthUser, useTypedSelector } from '@/redux';
import { FlexibleBox } from '@/components/ui/flexible-box';
import { LoginForm } from '../auth/sign-in';
import { PropertyImageCard } from './image/PropertyImage';

const PropertyDetails: React.FC = () => {
    const router = useRouter()
    const { propertyId } = useParams<{ propertyId: string }>(); // Get propertyId from URL
    const { propertyById, readPropertyById } = usePropertiesContext()
    const authUser = useTypedSelector(selectAuthUser) // Redux

    const [renderProperty, setRenderProperty] = useState<Property | undefined>(undefined)

    useEffect(() => { readPropertyById(parseInt(propertyId)); }, [propertyId])
    useEffect(() => {
        if (propertyId) {
            setRenderProperty(propertyById)
            document.title = `Property in ${propertyById?.Property_City} - CasaNova`
        }
    }, [propertyById])

    if (!renderProperty) return <div>Loading...</div>

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
                className="relative max-w-4xl w-full max-h-full mx-auto p-1 bg-white shadow-lg rounded-lg"
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
                        rotationImageWrapper: "relative w-full h-auto max-h-full",
                        rotationImage: "w-full h-auto max-h-full",
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
    const [currentIndex, setCurrentIndex] = useState(0);
    const imageCount = property.images?.length || 0;

    // Handle the interval logic based on enableAutoRotation
    useEffect(() => {
        if (enableAutoRotation && imageCount > numberInRotation) {
            const interval = setInterval(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % imageCount);
            }, 3000); // Rotate every 3 seconds

            return () => clearInterval(interval);
        }
    }, [imageCount, enableAutoRotation, numberInRotation]);

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + imageCount) % imageCount);
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % imageCount);
    };

    useEffect(() => {
        if (image && numberInRotation === 1) {
            const index = property.images?.findIndex((img) => img.Image_ID === image.Image_ID) || 0;
            setCurrentIndex(index);
        }
    }, [image, numberInRotation])

    // Get the N images in rotation (in this case, `numberInRotation` is dynamic)
    const currentImages = imageCount > 0 && property.images
        ? Array.from({ length: numberInRotation }).map((_, i) => {
            if (!property.images) return undefined

            const index = (currentIndex + i) % imageCount;
            return property.images[index];
        })
        : [];

    return (
        <div className="relative">
            {/* Image Grid */}
            <div className={classNames.rotationWrapper}>
                {currentImages.length > 0 ? (
                    currentImages.map((image, i) => (
                        <div
                            key={i}
                            className={classNames.rotationImageWrapper}
                            onClick={() => setShowJumbotronHighlightImage(image!)}
                        >
                            <img
                                src={image?.Image_URL || `http://localhost:8000/storage/${image?.Image_Path}`}
                                alt={`Property Image ${currentIndex + i + 1}`}
                                className={classNames.rotationImage}
                            />
                            <span className="absolute top-auto left-auto bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                {currentIndex + i + 1} / {imageCount}
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
                    className="absolute w-10 h-10 left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                </button>
            )}

            {/* Right Arrow */}
            {imageCount > numberInRotation && (
                <button
                    onClick={handleNext}
                    className="absolute w-10 h-10 left-auto right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
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
            <p className="text-gray-600">{property.Property_Description}</p>
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
            <Block className="space-y-3">
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
    const messageComposerRef = useRef<HTMLDivElement>(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [message, setMessage] = useState("")

    // Handle clicks outside taskDetailContainer but inside taskDetailModalBackground
    const handleBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (messageComposerRef.current && !messageComposerRef.current.contains(event.target as Node)) {
            setShowMessageComposer(false)
        }
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

                                <button className="w-full blue-link-light">Send Message</button>
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