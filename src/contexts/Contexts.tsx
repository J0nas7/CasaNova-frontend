"use client"

// External
import React, { createContext, useContext, useState } from "react"

// Internal
import { useResourceContext } from "@/contexts"
import { User, Property, PropertyImage, Message, Favorite, UserFields, PropertyFields } from "@/types"
import { useAxios } from "@/hooks";
import { selectAuthUser, selectAuthUserTaskTimeTrack, setAuthUserTaskTimeTrack, useAppDispatch, useAuthActions, useTypedSelector } from "@/redux";

// Context for Users
export type UsersContextType = {
    usersById: User[];
    userDetail: User | undefined;
    newUser: User | undefined;
    setUserDetail: React.Dispatch<React.SetStateAction<User | undefined>>;
    handleChangeNewUser: (field: UserFields, value: string) => Promise<void>
    addUser: (parentId: number, object?: User) => Promise<void>
    saveUserChanges: (itemChanges: User, parentId: number) => Promise<void>
    removeUser: (itemId: number, parentId: number) => Promise<boolean>
    // userLoading: boolean;
    // userError: string | null;
};

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const {
        itemsById: usersById,
        newItem: newUser,
        itemDetail: userDetail,
        setItemDetail: setUserDetail,
        handleChangeNewItem: handleChangeNewUser,
        addItem: addUser,
        saveItemChanges: saveUserChanges,
        removeItem: removeUser,
        // loading: userLoading,
        // error: userError,
    } = useResourceContext<User, "User_ID">(
        "users",
        "User_ID",
        ""
    );

    return (
        <UsersContext.Provider value={{
            usersById,
            userDetail,
            newUser,
            setUserDetail,
            handleChangeNewUser,
            addUser,
            saveUserChanges,
            removeUser,
            // userLoading,
            // userError,
        }}>
            {children}
        </UsersContext.Provider>
    );
};

export const useUsersContext = () => {
    const context = useContext(UsersContext);
    if (!context) {
        throw new Error("useUsersContext must be used within a UsersProvider");
    }
    return context;
};

// Context for Properties
export type PropertiesContextType = {
    properties: Property[];
    propertiesById: Property[];
    propertyById: Property | undefined
    propertyDetail: Property | undefined;
    newProperty: Property | undefined;
    readProperties: (refresh?: boolean) => Promise<void>
    readPropertiesByUserId: (parentId: number) => Promise<void>
    readPropertyById: (itemId: number) => Promise<void>
    setPropertyDetail: React.Dispatch<React.SetStateAction<Property | undefined>>;
    handleChangeNewProperty: (field: PropertyFields, value: string) => Promise<void>
    addProperty: (parentId: number, object?: Property) => Promise<void>
    savePropertyChanges: (propertyChanges: Property, parentId: number) => Promise<void>
    removeProperty: (itemId: number, parentId: number) => Promise<boolean>
};

const PropertiesContext = createContext<PropertiesContextType | undefined>(undefined);

export const PropertiesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const {
        items: properties,
        itemsById: propertiesById,
        itemById: propertyById,
        newItem: newProperty,
        itemDetail: propertyDetail,
        readItems: readProperties,
        readItemsById: readPropertiesByUserId,
        readItemById: readPropertyById,
        setItemDetail: setPropertyDetail,
        handleChangeNewItem: handleChangeNewProperty,
        addItem: addProperty,
        saveItemChanges: savePropertyChanges,
        removeItem: removeProperty,
        // loading: propertyLoading,
        // error: propertyError,
    } = useResourceContext<Property, "Property_ID">(
        "properties",
        "Property_ID",
        "users"
    );

    return (
        <PropertiesContext.Provider value={{
            properties,
            propertiesById,
            propertyById,
            newProperty,
            propertyDetail,
            readProperties,
            readPropertiesByUserId,
            readPropertyById,
            setPropertyDetail,
            handleChangeNewProperty,
            addProperty,
            savePropertyChanges,
            removeProperty,
            // propertyLoading,
            // propertyError,
        }}>
            {children}
        </PropertiesContext.Provider>
    );
};

export const usePropertiesContext = () => {
    const context = useContext(PropertiesContext);
    if (!context) {
        throw new Error("usePropertiesContext must be used within a PropertiesProvider");
    }
    return context;
};
