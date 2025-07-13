"use client";

// External
import { faArrowLeft, faArrowRight, faBuilding, faCamera, faFaucetDrip, faHouseChimney, faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import "react-quill/dist/quill.snow.css"; // Import the Quill styles

// Dynamically import ReactQuill with SSR disabled
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// Internal
import { Block, Field, FlexibleBox, Heading, Loading, Text } from "@/components";
import { SignInView } from '@/components/partials/auth/sign-in';
import { usePropertiesContext } from "@/contexts";
import { env } from "@/env.urls";
import { selectAuthUser, useTypedSelector } from "@/redux";
import { Property, PropertyFields, PropertyStates, propertyTypeMap } from "@/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import Link from "next/link";

const EditProperty: React.FC = () => {
    // Hooks
    const router = useRouter();
    const { propertyById, readPropertyById, updatePropertyWithImages, updatePropertyAvailability } = usePropertiesContext();

    // Redux
    const authUser = useTypedSelector(selectAuthUser);

    // State
    const [uploadedFiles, setUploadedFiles] = useState<(File | string)[]>([]);
    const [renderProperty, setRenderProperty] = useState<PropertyStates>(undefined);
    const [togglePropertyImages, setTogglePropertyImages] = useState<boolean>(false);
    const [togglePropertyAmendities, setTogglePropertyAmendities] = useState<boolean>(false);

    const { propertyId } = useParams<{ propertyId: string }>(); // Get propertyId from URL

    /**
     * Methods
     */
    // Handle input changes
    const handleInputChange = (field: PropertyFields, value: string | number) => {
        if (renderProperty) {
            setRenderProperty({
                ...renderProperty,
                [field]: typeof value === "number" ? parseInt(value.toString(), 10) : value,
            });
        }
    };

    const doTogglePropertyImages = () => setTogglePropertyImages(!togglePropertyImages);
    const doTogglePropertyAmendities = () => setTogglePropertyAmendities(!togglePropertyAmendities);

    // Handle form submission for saving the property
    const handleSaveProperty = async () => {
        if (!renderProperty) return;

        // Validation rules (similar to CreateProperty validation)
        const errors: string[] = [];

        if (!renderProperty.Property_Title || renderProperty.Property_Title.length > 255) {
            errors.push("Property title is required and must be less than 255 characters.");
        }

        if (!renderProperty.Property_Address || renderProperty.Property_Address.length > 500) {
            errors.push("Property address is required and must be less than 500 characters.");
        }

        if (!renderProperty.Property_City || renderProperty.Property_City.length > 255) {
            errors.push("Property city is required and must be less than 255 characters.");
        }

        if (!renderProperty.Property_Zip_Code || renderProperty.Property_Zip_Code.length > 20) {
            errors.push("Property zip code is required and must be less than 20 characters.");
        }

        if (renderProperty.Property_Price_Per_Month <= 0) {
            errors.push("Property price per month must be a positive number.");
        }

        if (renderProperty.Property_Num_Bedrooms < 1) {
            errors.push("Property must have at least 1 bedroom.");
        }

        if (renderProperty.Property_Num_Bathrooms < 1) {
            errors.push("Property must have at least 1 bathroom.");
        }

        if (renderProperty.Property_Square_Feet < 0) {
            errors.push("Property square feet must be a positive number.");
        }

        if (!renderProperty.Property_Property_Type || renderProperty.Property_Property_Type.toString().length > 50) {
            errors.push("Property type is required and must be less than 50 characters.");
        }

        if (errors.length > 0) {
            alert(errors.join("\n"));
            return;
        }

        // Save property changes
        const property = await updatePropertyWithImages(renderProperty, uploadedFiles)
        if (property) {
            router.push(`/edit-listing/${property.Property_ID}`)
        } else {
            alert("An error happened, please try again.")
        }
    };

    const handleUpdateAvailability = async () => {
        if (!confirm("Are you sure you want to change the avaiability of your listing?") || !renderProperty) return

        const property = await updatePropertyAvailability(renderProperty, {
            Property_Available_From: renderProperty.Property_Available_From,
            Property_Is_Active: !renderProperty.Property_Is_Active
        })

        if (property) {
            window.location.href = `/edit-listing/${property.Property_ID}`;
        } else {
            alert("An error happened, please try again.")
        }
    };

    /**
     * Effects
     */
    useEffect(() => {
        if (authUser && authUser.User_ID) {
            const fetchProperty = async () => {
                await readPropertyById(parseInt(propertyId));
            };
            fetchProperty();
        }
    }, [authUser, propertyId]);
    useEffect(() => {
        setRenderProperty(propertyById)

        const fetchExistingImages = async () => {
            if (propertyById && propertyById.images) {
                const files = await Promise.all(
                    propertyById.images
                        .sort((a, b) => a.Image_Order - b.Image_Order)
                        .map(async (image) => {
                            return `${image.Image_Path}`;
                        })
                );

                setUploadedFiles(files);
            }
        };
        fetchExistingImages()
    }, [propertyById])

    if (!authUser?.User_ID) return <SignInView />;

    if (propertyById === false) {
        return (
            <Block className="page-content">
                <Text>Property not found</Text>
                <Link href="/my-listings" className="blue-link-light">Go to Your Listings</Link>
            </Block>
        )
    }

    return (
        <Block className="page-content">
            <div className="mb-8">
                <FlexibleBox
                    title="Edit your rental listing"
                    icon={faBuilding}
                    className="no-box w-auto inline-block"
                    numberOfColumns={2}
                >
                    {!renderProperty && (
                        <Loading />
                    )}

                    {renderProperty && (
                        <>
                            {togglePropertyImages ? (
                                <PropertyImagesForm
                                    uploadedFiles={uploadedFiles}
                                    setUploadedFiles={setUploadedFiles}
                                    doTogglePropertyImages={doTogglePropertyImages}
                                />
                            ) : togglePropertyAmendities ? (
                                <PropertyAmenditiesForm
                                    newProperty={renderProperty}
                                    handleInputChange={handleInputChange}
                                    doTogglePropertyAmendities={doTogglePropertyAmendities}
                                />
                            ) : (
                                <PropertyDetailsForm
                                    newProperty={renderProperty}
                                    handleInputChange={handleInputChange}
                                    doTogglePropertyImages={doTogglePropertyImages}
                                    doTogglePropertyAmendities={doTogglePropertyAmendities}
                                    handleSaveProperty={handleSaveProperty}
                                    handleUpdateAvailability={handleUpdateAvailability}
                                />
                            )}
                        </>
                    )}
                </FlexibleBox>
            </div>
        </Block>
    );
};

interface PropertyImagesFormProps {
    uploadedFiles: (string | File)[]
    setUploadedFiles: React.Dispatch<React.SetStateAction<(string | File)[]>>
    doTogglePropertyImages: () => void;
}

export const PropertyImagesForm: React.FC<PropertyImagesFormProps> = ({
    uploadedFiles,
    setUploadedFiles,
    doTogglePropertyImages,
}) => {
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            setUploadedFiles([...uploadedFiles, ...Array.from(files)]);
        }
        event.target.value = ""; // Reset input field
    };

    const handleRemoveFile = (index: number) => {
        setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
    };

    const moveFile = (index: number, direction: "left" | "right") => {
        const newFiles = [...uploadedFiles];
        const swapIndex = direction === "left" ? index - 1 : index + 1;

        // Swap elements
        [newFiles[index], newFiles[swapIndex]] = [newFiles[swapIndex], newFiles[index]];

        setUploadedFiles(newFiles);
    };

    // Drag-and-drop handling
    const moveDraggedFile = (dragIndex: number, hoverIndex: number) => {
        // Use the previous state to get the most up-to-date value
        setUploadedFiles((prevFiles) => {
            const newFiles = [...prevFiles]; // Create a copy of the previous state

            const draggedFile = newFiles[dragIndex];

            // Remove the dragged file from its current position
            newFiles.splice(dragIndex, 1);

            // Insert the dragged file at the new position
            newFiles.splice(hoverIndex, 0, draggedFile);

            return newFiles; // Return the new state
        });
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="bg-white shadow-md rounded-xl p-6">
                <h2 className="text-xl font-semibold">Property Images</h2>

                <label className="mt-4 block w-full max-w-[200px]">
                    <button
                        type="button"
                        className="button-blue w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        onClick={() => document.getElementById("file-upload")?.click()}
                    >
                        Upload Images
                    </button>
                    <input
                        id="file-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </label>

                <Block className="mt-4">
                    {uploadedFiles.length} images uploaded
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {uploadedFiles.map((file, index) => (
                            <ImageItem
                                key={index}
                                index={index}
                                file={file}
                                moveFile={moveFile}
                                moveDraggedFile={moveDraggedFile}
                                handleRemoveFile={handleRemoveFile}
                                uploadedFiles={uploadedFiles}
                            />
                        ))}
                    </div>
                </Block>

                <div className="mt-4">
                    <button
                        onClick={doTogglePropertyImages}
                        className="button-blue"
                    >
                        Back to Listing Details
                    </button>
                </div>
            </div>
        </DndProvider>
    );
};

interface ImageItemProps {
    file: File | string;
    index: number;
    moveFile: (index: number, direction: "left" | "right") => void
    moveDraggedFile: (dragIndex: number, hoverIndex: number) => void
    handleRemoveFile: (index: number) => void;
    uploadedFiles: (File | string)[];
}

// Image Item Component for Drag and Drop
const ImageItem: React.FC<ImageItemProps> = ({ file, index, moveFile, moveDraggedFile, handleRemoveFile, uploadedFiles }) => {
    // Drag hook to track the dragged item
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'image',
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    // Drop hook to handle when the image is dropped
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'image',
        drop: (item: { index: number }) => {
            if (item.index !== index) {
                moveDraggedFile(item.index, index); // Move file when dropped
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));

    // Combine drag and drop refs
    const dragDropRef = (node: HTMLDivElement | null) => {
        drag(node); // Apply drag to this element
        drop(node); // Apply drop to this element
    };

    return (
        <div
            ref={dragDropRef} // Use the combined ref function
            className={clsx(
                "relative flex flex-col items-center",
                { "opacity-10": isDragging },
                { "border-2 border-dashed border-blue-600": isOver },
            )}
            style={{ aspectRatio: "1 / 1" }}
        >
            <img
                src={typeof file === 'string'
                    ? `${env.url.API_URL}/storage/${file}`
                    : URL.createObjectURL(file)}
                alt={file instanceof File ? file.name : "Image"}
                className="w-full h-full object-cover rounded-md hover:cursor-move"
            />

            {/* Remove button */}
            <button
                type="button"
                onClick={() => handleRemoveFile(index)}
                className="absolute w-8 h-8 top-2 left-auto right-2 bg-red-500 bg-opacity-50 hover:bg-opacity-100 text-white p-1 rounded-full"
            >
                <FontAwesomeIcon icon={faXmark} />
            </button>

            {/* Arrows for reordering */}
            <div className="flex justify-between w-full mt-2">
                <button
                    type="button"
                    onClick={() => moveFile(index, "left")}
                    className={`text-gray-600 hover:text-black ${index === 0 ? "opacity-30 cursor-not-allowed" : ""}`}
                    disabled={index === 0}
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                </button>

                <button
                    type="button"
                    onClick={() => moveFile(index, "right")}
                    className={`text-gray-600 hover:text-black ${index === uploadedFiles.length - 1 ? "opacity-30 cursor-not-allowed" : ""}`}
                    disabled={index === uploadedFiles.length - 1}
                >
                    <FontAwesomeIcon icon={faArrowRight} />
                </button>
            </div>
        </div>
    );
};

interface PropertyAmenditiesFormProps {
    newProperty: Property;
    handleInputChange: (field: PropertyFields, value: string | number) => void;
    doTogglePropertyAmendities: () => void;
}

export const PropertyAmenditiesForm: React.FC<PropertyAmenditiesFormProps> = ({
    newProperty,
    handleInputChange,
    doTogglePropertyAmendities,
}) => {
    const amenities = [
        "Pool",
        "Gym",
        "Parking",
        "Garden",
        "Air Conditioning",
        "Heater",
        "Furnished",
        "Wi-Fi",
    ];

    const handleAmenityChange = (amenity: string, isChecked: boolean) => {
        const selectedAmenities = isChecked
            ? [...newProperty.Property_Amenities, amenity]
            : newProperty.Property_Amenities.filter((a) => a !== amenity);
        handleInputChange("Property_Amenities", Array.from(selectedAmenities).toString());
    };

    return (
        <div className="bg-white shadow-md rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Property Amenities</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center">
                        <input
                            type="checkbox"
                            id={amenity}
                            checked={newProperty.Property_Amenities.includes(amenity)}
                            onChange={(e) =>
                                handleAmenityChange(amenity, e.target.checked)
                            }
                            className="mr-2"
                        />
                        <label htmlFor={amenity}>{amenity}</label>
                    </div>
                ))}
            </div>

            <button
                type="button"
                className="mt-4 button-blue"
                onClick={doTogglePropertyAmendities}
            >
                Back to Listing Details
            </button>
        </div>
    );
};

interface PropertyDetailsFormProps {
    newProperty: Property;
    handleInputChange: (field: PropertyFields, value: string | number) => void;
    doTogglePropertyImages: () => void;
    doTogglePropertyAmendities: () => void;
    handleSaveProperty: () => void;
    handleUpdateAvailability: () => Promise<void>;
}

export const PropertyDetailsForm: React.FC<PropertyDetailsFormProps> = ({
    newProperty,
    handleInputChange,
    doTogglePropertyImages,
    doTogglePropertyAmendities,
    handleSaveProperty,
    handleUpdateAvailability
}) => {
    return (
        <div className="bg-white shadow-md rounded-xl p-6">
            <Block className="flex flex-col md:flex-row justify-between">
                <Block>
                    <Heading variant="h2">Listing details</Heading>
                    <Heading variant="h3">{newProperty.Property_Address}</Heading>
                </Block>
                <Block className="flex gap-2">
                    <Link href={`/listing/${newProperty.Property_ID}`} className="button-blue !flex gap-2 items-center">
                        <FontAwesomeIcon icon={faHouseChimney} />
                        <span>View Listing</span>
                    </Link>
                    <button
                        type="button"
                        className="button-blue"
                        onClick={handleUpdateAvailability}
                    >
                        {newProperty.Property_Is_Active ? "Mark listing as rented out" : "Mark listing as available"}
                    </button>
                </Block>
            </Block>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 items-center">
                <Field
                    lbl="Property Title"
                    value={(newProperty.Property_Title ?? "").toString()}
                    onChange={(e: string) => handleInputChange("Property_Title", e)}
                    type="text"
                    disabled={!newProperty.Property_Is_Active}
                    className="w-full"
                />
                <Field
                    lbl="Property Price (per month)"
                    value={(newProperty.Property_Price_Per_Month ?? "").toString()}
                    onChange={(e: string) => handleInputChange("Property_Price_Per_Month", parseInt(e))}
                    type="number"
                    disabled={!newProperty.Property_Is_Active}
                    className="w-full"
                />
                <Field
                    lbl="Number of Bedrooms"
                    value={(newProperty.Property_Num_Bedrooms ?? "").toString()}
                    onChange={(e: string) => handleInputChange("Property_Num_Bedrooms", parseInt(e))}
                    type="number"
                    disabled={!newProperty.Property_Is_Active}
                    className="w-full"
                />
                <Field
                    lbl="Number of Bathrooms"
                    value={(newProperty.Property_Num_Bathrooms ?? "").toString()}
                    onChange={(e: string) => handleInputChange("Property_Num_Bathrooms", parseInt(e))}
                    type="number"
                    disabled={!newProperty.Property_Is_Active}
                    className="w-full"
                />
                <Field
                    lbl="Square Feet"
                    value={(newProperty.Property_Square_Feet ?? "").toString()}
                    onChange={(e: string) => handleInputChange("Property_Square_Feet", parseInt(e))}
                    type="number"
                    disabled={!newProperty.Property_Is_Active}
                    className="w-full"
                />
                <div className="w-full">
                    <label className="block">
                        Property Type
                    </label>
                    <select
                        value={(newProperty.Property_Property_Type ?? "").toString()}
                        onChange={(e) => handleInputChange("Property_Property_Type", e.target.value)}
                        className="mt-1 px-3 h-14 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        disabled={!newProperty.Property_Is_Active}
                    >
                        <option value="">Select a property type</option>
                        {Object.entries(propertyTypeMap).map(([key, value]) => (
                            <option key={key} value={key}>
                                {value}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col-span-1 sm:col-span-2">
                    <Text>Listing Description</Text>
                    <ReactQuill
                        className="w-full mt-2 border border-gray-300 rounded-md"
                        theme="snow"
                        value={(newProperty.Property_Description ?? "").toString()}
                        onChange={(value) => handleInputChange("Property_Description", value)}
                        modules={{
                            toolbar: [
                                [{ header: "1" }, { header: "2" }, { font: [] }],
                                [{ list: "ordered" }, { list: "bullet" }],
                                ["bold", "italic", "underline", "strike"],
                                [{ align: [] }],
                                ["link"],
                                ["blockquote"],
                            ],
                        }}
                        readOnly={!newProperty.Property_Is_Active}
                    />
                </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row justify-between gap-4">
                <button
                    onClick={doTogglePropertyImages}
                    className="button-blue !flex gap-2 justify-center items-center"
                >
                    <FontAwesomeIcon icon={faCamera} />
                    <span>Listing Images</span>
                </button>
                <button
                    onClick={doTogglePropertyAmendities}
                    className="button-blue !flex gap-2 justify-center items-center"
                >
                    <FontAwesomeIcon icon={faFaucetDrip} />
                    <span>Listing Amenities</span>
                </button>
                <button
                    onClick={handleSaveProperty}
                    className="button-blue !flex gap-2 justify-center items-center"
                >
                    <FontAwesomeIcon icon={faPlus} />
                    <span>Save Listing</span>
                </button>
            </div>
        </div>
    );
};

export default EditProperty;
