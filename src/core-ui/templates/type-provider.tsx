// External
import React from 'react';

// Internal
import { 
    UsersProvider, PropertiesProvider//, PropertyImagesProvider, MessagesProvider, FavoritesProvider,
} from "@/contexts"

const providers = [
    UsersProvider,
    PropertiesProvider,
    // PropertyImagesProvider,
    // MessagesProvider,
    // FavoritesProvider,
]

export const TypeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return providers.reduceRight((acc, Provider) => <Provider>{acc}</Provider>, children)
}