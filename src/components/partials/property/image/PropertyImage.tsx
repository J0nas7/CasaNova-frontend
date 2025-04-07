import React from 'react'
import { Property, PropertyImage } from '@/types';
import { env } from '@/env.urls';

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
                ? `${env.url.API_URL}/storage/${propertyImage.Image_Path}`
                : imageSrc
    } else if (property) {
        const image = property.images?.find(img => img.Image_Order === 1)
        imageSrc = image?.Image_URL
            ? image?.Image_URL
            : image?.Image_Path
                ? `${env.url.API_URL}/storage/${image?.Image_Path}`
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