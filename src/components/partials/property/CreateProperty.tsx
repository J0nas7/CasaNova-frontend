"use client";

// External
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { faArrowLeft, faArrowRight, faBuilding, faCamera, faFaucetDrip, faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";

// Dynamically import ReactQuill with SSR disabled
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css"; // Import the Quill styles

// Internal
import { usePropertiesContext } from "@/contexts";
import { Property, PropertyFields, propertyTypeMap } from "@/types";
import { Block, Text } from "@/components/ui/block-text";
import { FlexibleBox } from "@/components/ui/flexible-box";
import { Heading } from "@/components/ui/heading";
import { Field } from "@/components/ui/input-field";
import { selectAuthUser, useTypedSelector } from "@/redux";
import { SignInView } from "@/app/sign-in/page";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const CreateProperty: React.FC = () => {
    // Hooks
    const router = useRouter();
    const { createPropertyWithImages } = usePropertiesContext();

    // Redux
    const authUser = useTypedSelector(selectAuthUser)

    // State
    const [togglePropertyImages, setTogglePropertyImages] = useState<boolean>(false)
    const [togglePropertyAmendities, setTogglePropertyAmendities] = useState<boolean>(false)
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [newProperty, setNewProperty] = useState<Property>({
        User_ID: 0,
        Property_Title: "",
        Property_Description: "",
        Property_Address: "",
        Property_City: "",
        // Property_State: "",
        Property_Zip_Code: "",
        Property_Latitude: 0,
        Property_Longitude: 0,
        Property_Price_Per_Month: 0,
        Property_Num_Bedrooms: 0,
        Property_Num_Bathrooms: 0,
        Property_Square_Feet: 0,
        Property_Amenities: [],
        Property_Property_Type: 0,
        Property_Available_From: "",
        Property_Is_Active: true,
    });

    /**
     * Methods
     */
    // Handle input changes
    const handleInputChange = (field: PropertyFields, value: string | number) => {
        setNewProperty((prev) => ({
            ...prev,
            [field]: typeof value === "number" ? parseInt(value.toString(), 10) : value,
        }))
    }

    const doTogglePropertyImages = () => setTogglePropertyImages(!togglePropertyImages)
    const doTogglePropertyAmendities = () => setTogglePropertyAmendities(!togglePropertyAmendities)

    // Handle form submission with validation
    const handleCreateProperty = async () => {
        // Validation rules
        const errors: string[] = [];

        if (!newProperty.Property_Title || newProperty.Property_Title.length > 255) {
            errors.push("Property title is required and must be less than 255 characters.");
        }

        if (!newProperty.Property_Address || newProperty.Property_Address.length > 500) {
            errors.push("Property address is required and must be less than 500 characters.");
        }

        if (!newProperty.Property_City || newProperty.Property_City.length > 255) {
            errors.push("Property city is required and must be less than 255 characters.");
        }

        // if (!newProperty.Property_State || newProperty.Property_State.length > 255) {
        //     errors.push("Property state is required and must be less than 255 characters.");
        // }

        if (!newProperty.Property_Zip_Code || newProperty.Property_Zip_Code.length > 20) {
            errors.push("Property zip code is required and must be less than 20 characters.");
        }

        if (newProperty.Property_Price_Per_Month <= 0) {
            errors.push("Property price per month must be a positive number.");
        }

        if (newProperty.Property_Num_Bedrooms < 1) {
            errors.push("Property must have at least 1 bedroom.");
        }

        if (newProperty.Property_Num_Bathrooms < 1) {
            errors.push("Property must have at least 1 bathroom.");
        }

        if (newProperty.Property_Square_Feet < 0) {
            errors.push("Property square feet must be a positive number.");
        }

        if (!newProperty.Property_Property_Type || newProperty.Property_Property_Type.toString().length > 50) {
            errors.push("Property type is required and must be less than 50 characters.");
        }

        if (errors.length > 0) {
            alert(errors.join("\n"));
            return;
        }

        if (newProperty.User_ID === 0) {
            alert("An error happened, assigning the property to you. Please try again.");
            return;
        }

        const property = await createPropertyWithImages(newProperty, uploadedFiles)
        if (property) {
            router.push(`/listing/${property.Property_ID}`)
        } else {
            alert("An error happened, please try again.")
        }
    };

    /**
     * Effects
     */
    useEffect(() => {
        if (authUser && authUser.User_ID) setNewProperty({
            ...newProperty,
            User_ID: authUser.User_ID
        })
    }, [authUser])

    if (!authUser?.User_ID) return <SignInView />

    return (
        <Block className="page-content">
            <div className="mb-8">
                <FlexibleBox
                    title="Rent out your home and find a new tenant for free"
                    icon={faBuilding}
                    className="no-box w-auto inline-block"
                    numberOfColumns={2}
                >
                    {newProperty.Property_Address === "" ? (
                        <PropertyAddressForm
                            newProperty={newProperty}
                            handleInputChange={handleInputChange}
                        />
                    ) : togglePropertyImages ? (
                        <PropertyImagesForm
                            uploadedFiles={uploadedFiles}
                            setUploadedFiles={setUploadedFiles}
                            doTogglePropertyImages={doTogglePropertyImages}
                        />
                    ) : togglePropertyAmendities ? (
                        <PropertyAmenditiesForm
                            newProperty={newProperty}
                            handleInputChange={handleInputChange}
                            doTogglePropertyAmendities={doTogglePropertyAmendities}
                        />
                    ) : (
                        <PropertyDetailsForm
                            newProperty={newProperty}
                            handleInputChange={handleInputChange}
                            doTogglePropertyImages={doTogglePropertyImages}
                            doTogglePropertyAmendities={doTogglePropertyAmendities}
                            handleCreateProperty={handleCreateProperty}
                        />
                    )}
                </FlexibleBox>
            </div>
        </Block>
    );
}

interface PropertyFormProps {
    newProperty: Property;
    handleInputChange: (field: PropertyFields, value: string | number) => void
}

export const PropertyAddressForm: React.FC<PropertyFormProps> = ({ newProperty, handleInputChange }) => {
    const [searchAddress, setSearchAddress] = useState<string>("");
    const [searchResults, setSearchResults] = useState<
        {
            display_name: string;
            lat: number;
            lon: number;
        }[]
    >([])

    useEffect(() => {
        const fetchAddresses = async () => {
            if (!searchAddress) return;

            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}`
                );
                const data = await response.json();

                // Extract street name, house number, city, and postcode
                setSearchResults(
                    data.map((place: any) => ({
                        display_name: place.display_name,
                        lat: place.lat,
                        lon: place.lon
                    }))
                );
            } catch (error) {
                console.error("Error fetching address:", error);
            }
        };

        // Debounce API call (waits 500ms after typing)
        const delayDebounce = setTimeout(fetchAddresses, 500);

        return () => clearTimeout(delayDebounce); // Cleanup on unmount
    }, [searchAddress]);

    return (
        <div className="bg-white shadow-md rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Select your rental from the list or create a new one</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Postal and City Input */}
                <Field
                    lbl="Enter postal code"
                    value={newProperty.Property_Zip_Code}
                    onChange={(e: string) => handleInputChange("Property_Zip_Code", parseInt(e))}
                    type="text"
                    disabled={false}
                    className="w-full"
                />
                <Field
                    lbl="Enter city"
                    value={newProperty.Property_City}
                    onChange={(e: string) => handleInputChange("Property_City", e)}
                    type="text"
                    disabled={false}
                    className="w-full"
                />
                {/* Search Input */}
                <Field
                    lbl="Search for address"
                    value={searchAddress}
                    onChange={(e: string) => setSearchAddress(e)}
                    type="text"
                    disabled={false}
                    className="w-full"
                />
            </div>

            {/* Display Search Results */}
            {searchResults.length > 0 && (
                <ul className="w-full md:w-1/2 bg-white border rounded-lg shadow-md mt-4">
                    {searchResults.slice(0, 5).map((result, index) => (
                        <li
                            key={index}
                            className="flex items-center justify-between p-2 hover:bg-gray-200"
                        >
                            <span>{result.display_name}</span>
                            <button className="button-blue" onClick={() => {
                                if (!result.display_name.includes(newProperty.Property_Zip_Code) ||
                                    !result.display_name.includes(newProperty.Property_City)) {
                                    alert("Please select an address within the city and postal code you entered.")
                                    return
                                }

                                handleInputChange("Property_Latitude", parseInt(result.lat.toString(), 10))
                                handleInputChange("Property_Longitude", parseInt(result.lon.toString(), 10))
                                handleInputChange("Property_Address", result.display_name)
                            }}>Choose</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

interface PropertyImagesFormProps {
    uploadedFiles: File[]
    setUploadedFiles: React.Dispatch<React.SetStateAction<File[]>>
    doTogglePropertyImages: () => void
}

export const PropertyImagesForm: React.FC<PropertyImagesFormProps> = ({ uploadedFiles, setUploadedFiles, doTogglePropertyImages }) => {
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

    return (
        <div className="bg-white shadow-md rounded-xl p-6">
            <Heading variant="h2">Upload Images</Heading>

            <label className="mt-4 block w-[200px]">
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

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                {uploadedFiles.map((file, index) => (
                    <div key={index} className="relative flex flex-col items-center" style={{ aspectRatio: "1 / 1" }}>
                        {/* Image Preview */}
                        <img
                            src={URL.createObjectURL(file)}
                            alt={`Uploaded ${file.name}`}
                            className="w-full h-full object-cover rounded-md"
                        />

                        {/* Remove Button */}
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
                ))}
            </div>

            <div className="mt-4">
                <button onClick={doTogglePropertyImages} className="button-blue">
                    Back to Listing Details
                </button>
            </div>
        </div>
    );
};

export const PropertyAmenditiesForm: React.FC<PropertyFormProps & { doTogglePropertyAmendities: () => void }> = (
    { newProperty, handleInputChange, doTogglePropertyAmendities }
) => (
    <div className="bg-white shadow-md rounded-xl p-6">
        <Heading variant="h2">Listing Amenities</Heading>
        <Heading variant="h3">Select amenities that apply to your listing</Heading>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {[
                { id: 1, label: "Air Conditioning" },
                { id: 2, label: "Heating" },
                { id: 3, label: "Internet" },
                { id: 4, label: "Cable TV" },
                { id: 5, label: "Washer" },
                { id: 6, label: "Dryer" },
                { id: 7, label: "Dishwasher" },
                { id: 8, label: "Parking" },
                { id: 9, label: "Pool" },
                { id: 10, label: "Gym" },
                { id: 11, label: "Elevator" },
                { id: 12, label: "Wheelchair Accessible" },
                { id: 13, label: "Pets Allowed" },
                { id: 14, label: "Smoking Allowed" },
            ].map((amenity) => (
                <div key={amenity.id} className="flex items-center">
                    <input
                        type="checkbox"
                        id={`amenity-${amenity.id}`}
                        value={amenity.id}
                        checked={newProperty.Property_Amenities.includes(amenity.id.toString())}
                        onChange={(e) => {
                            const selectedAmenities = new Set(newProperty.Property_Amenities);
                            if (e.target.checked) {
                                selectedAmenities.add(amenity.id.toString());
                            } else {
                                selectedAmenities.delete(amenity.id.toString());
                            }
                            handleInputChange("Property_Amenities", Array.from(selectedAmenities).toString());
                        }}
                        className="mr-2"
                    />
                    <label htmlFor={`amenity-${amenity.id}`} className="text-sm">
                        {amenity.label}
                    </label>
                </div>
            ))}
        </div>
        <div className="mt-4">
            <button
                onClick={doTogglePropertyAmendities}
                className="button-blue"
            >
                Back to Listing Details
            </button>
        </div>
    </div>
)

export const PropertyDetailsForm: React.FC<
    PropertyFormProps & {
        doTogglePropertyImages: () => void,
        doTogglePropertyAmendities: () => void,
        handleCreateProperty: () => void
    }
> = ({
    newProperty, handleInputChange, doTogglePropertyImages, doTogglePropertyAmendities, handleCreateProperty
}) => (
        <div className="bg-white shadow-md rounded-xl p-6">
            <Heading variant="h2">Listing details</Heading>
            <Heading variant="h3">{newProperty.Property_Address}</Heading>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 items-center">
                <Field
                    lbl="Listing Title"
                    value={newProperty.Property_Title}
                    onChange={(e: string) => handleInputChange("Property_Title", e)}
                    type="text"
                    disabled={false}
                    className="w-full"
                />
                <Field
                    lbl="Price Per Month"
                    value={newProperty.Property_Price_Per_Month.toString()}
                    onChange={(e: string) => handleInputChange("Property_Price_Per_Month", e)}
                    type="number"
                    disabled={false}
                    className="w-full"
                />
                <Field
                    lbl="Number of Bedrooms"
                    value={newProperty.Property_Num_Bedrooms.toString()}
                    onChange={(e: string) => handleInputChange("Property_Num_Bedrooms", e)}
                    type="number"
                    disabled={false}
                    className="w-full"
                />
                <Field
                    lbl="Number of Bathrooms"
                    value={newProperty.Property_Num_Bathrooms.toString()}
                    onChange={(e: string) => handleInputChange("Property_Num_Bathrooms", e)}
                    type="number"
                    disabled={false}
                    className="w-full"
                />
                <Field
                    lbl="Square Feet"
                    value={newProperty.Property_Square_Feet.toString()}
                    onChange={(e: string) => handleInputChange("Property_Square_Feet", e)}
                    type="number"
                    disabled={false}
                    className="w-full"
                />
                <div className="w-full">
                    <label className="block">
                        Property Type
                    </label>
                    <select
                        value={newProperty.Property_Property_Type.toString()}
                        onChange={(e) => handleInputChange("Property_Property_Type", e.target.value)}
                        className="mt-1 px-3 h-14 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                        value={newProperty.Property_Description}
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
                    />
                </div>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row justify-between gap-4">
                <button
                    onClick={doTogglePropertyImages}
                    className="button-blue !flex gap-2 justify-center items-center"
                >
                    <FontAwesomeIcon icon={faCamera} />
                    <span>Add Listing Images</span>
                </button>
                <button
                    onClick={doTogglePropertyAmendities}
                    className="button-blue !flex gap-2 justify-center items-center"
                >
                    <FontAwesomeIcon icon={faFaucetDrip} />
                    <span>Add Listing Amenities</span>
                </button>
                <button
                    onClick={handleCreateProperty}
                    className="button-blue !flex gap-2 justify-center items-center"
                >
                    <FontAwesomeIcon icon={faPlus} />
                    <span>Create Listing</span>
                </button>
            </div>
        </div>
    )

export default CreateProperty;