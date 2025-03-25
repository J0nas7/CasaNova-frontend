import React from 'react'
import { Property, PropertyImage } from '@/types';

interface PropertyImageProps {
    property?: Property;
    propertyImage?: PropertyImage;
    alt?: string;
    className?: string;
}

export const PropertyImageCard: React.FC<PropertyImageProps> = ({ property, propertyImage, alt, className }) => {
    // Determine the image source
    let imageSrc: string = "https://via.placeholder.com/400x300"
    
    if (propertyImage) {
        imageSrc = propertyImage.Image_URL
            ? propertyImage.Image_URL
            : propertyImage.Image_Path
                ? `http://localhost:8000/storage/${propertyImage.Image_Path}`
                : imageSrc
    } else if (property) {
        imageSrc = property.images?.[0]?.Image_URL
            ? property.images[0].Image_URL
            : property.images?.[0]?.Image_Path
                ? `http://localhost:8000/storage/${property.images[0].Image_Path}`
                : imageSrc
    }
    
    return (
        <img
            src={imageSrc}
            alt={alt || property?.Property_Title}
            className={className}
        />
    )
}