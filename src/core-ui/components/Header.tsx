// External
import clsx from "clsx"
import React, { FormEvent, useEffect, useState } from "react"
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faDoorOpen, faEnvelope, faHouseChimney, faPlus, faUser, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "next-i18next"
import { useRouter } from "next/navigation"

// Internal
import styles from "../styles/modules/Header.module.scss";
import { Block, Text, Field, Heading } from "@/components"
import SearchBar from "./SearchBar";
import { selectAuthUser, useTypedSelector } from "@/redux";
import { useAuth } from "@/hooks";
import { LoginForm } from "@/components/partials/auth/sign-in";

export const Header: React.FC = () => {
    // Hooks
    const { handleLogoutSubmit } = useAuth()

    // Redux
    const authUser = useTypedSelector(selectAuthUser)

    // Internal variables
    const [showLoginForm, setShowLoginForm] = useState<boolean>(false)
    const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false)

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link href="/">
                    <Block className={styles['logo-wrapper']}>
                        <Image
                            src="/casanova-logo.png"
                            alt="CasaNova Logo"
                            width={54}
                            height={36}
                        />
                        <Text variant="span">
                            <Text variant="span" className={styles.title}>
                                CasaNova
                            </Text>
                        </Text>
                    </Block>
                </Link>

                <SearchBar />

                <nav>
                    {authUser && (
                        <>
                            <FontAwesomeIcon className={styles.mobileMenuTrigger} icon={faBars} onClick={() => setShowMobileMenu(true)} />
                            <ul className={clsx(
                                styles.navList, 
                                styles.authUser,
                                { [styles.showMobileMenu]: showMobileMenu }
                            )}>
                                <li className={styles.closeMobile}>
                                    <FontAwesomeIcon className={styles.mobileMenuTrigger} icon={faXmark} onClick={() => setShowMobileMenu(false)} />
                                </li>
                                <li>
                                    <Block variant="span" className="flex items-center space-x-3">
                                        {authUser.User_Profile_Picture ? (
                                            <img
                                                src={authUser.User_Profile_Picture}
                                                alt={authUser.User_First_Name}
                                                className="w-5 h-5 rounded-full border border-gray-300"
                                            />
                                        ) : (
                                            <FontAwesomeIcon icon={faUser} />
                                        )}
                                        <Link
                                            href="/profile"
                                            className={clsx(
                                                `inline-block text-sm`
                                            )}
                                        >
                                            <Text variant="span" className="text-sm text-white">{authUser.User_First_Name} {authUser.User_Last_Name}</Text>
                                        </Link>
                                    </Block>
                                </li>
                                <li>
                                    <Block variant="span" className="flex items-center space-x-3">
                                        <FontAwesomeIcon icon={faHouseChimney} />
                                        <Link
                                            href="/my-listings"
                                            className={clsx(
                                                `inline-block text-sm`
                                            )}
                                        >
                                            <Text variant="span" className="text-sm text-white">My Listings</Text>
                                        </Link>
                                    </Block>
                                </li>
                                <li>
                                    <Block variant="span" className="flex items-center space-x-3">
                                        <FontAwesomeIcon icon={faPlus} />
                                        <Link
                                            href="/new-listing"
                                            className={clsx(
                                                `inline-block text-sm`
                                            )}
                                        >
                                            <Text variant="span" className="text-sm text-white">New Listing</Text>
                                        </Link>
                                    </Block>
                                </li>
                                <li>
                                    <Block variant="span" className="flex items-center space-x-3">
                                        <FontAwesomeIcon icon={faEnvelope} />
                                        <Link
                                            href="/messages"
                                            className={clsx(
                                                `inline-block text-sm`
                                            )}
                                        >
                                            <Text variant="span" className="text-sm text-white">Messages</Text>
                                        </Link>
                                    </Block>
                                </li>
                                <li>
                                    <Block variant="span" className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faDoorOpen} />
                                        <Block
                                            variant="span"
                                            className={clsx(
                                                `inline-block text-sm text-white cursor-pointer`
                                            )}
                                            onClick={handleLogoutSubmit}
                                        >
                                            Log out
                                        </Block>
                                    </Block>
                                </li>
                            </ul>
                        </>
                    )}
                    {!authUser && (
                        <ul className={styles.navList}>
                            <li>
                                <Block className="relative">
                                    <Block
                                        variant="span"
                                        className="flex items-center gap-2"
                                        onClick={() => setShowLoginForm(!showLoginForm)}
                                    >
                                        <FontAwesomeIcon icon={faUser} />
                                        <Block variant="span" className={`inline-block text-sm text-white cursor-pointer`}>
                                            Log on
                                        </Block>
                                    </Block>
                                    {showLoginForm && (
                                        <Block className="absolute w-[300px] bg-white p-4 top-7 left-auto right-0 rounded-lg shadow-lg">
                                            <LoginForm />
                                        </Block>
                                    )}
                                </Block>
                            </li>
                        </ul>
                    )}
                </nav>
            </div>
        </header>
    );
}