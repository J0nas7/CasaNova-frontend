"use client"

// External
import Link from 'next/link'
import { useState, FormEvent } from 'react'
import { useTranslation } from 'next-i18next'

// Internal
import { Block, Field, Heading, Text } from "@/components"

export const CreateAccountForm = () => {
    // Internal variables
    const { t } = useTranslation(['guest'])
    const [userEmail, setUserEmail] = useState<string>('')
    const [userPassword, setUserPassword] = useState<string>('')
    const [userPassword2, setUserPassword2] = useState<string>('')
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [createPending, setCreatePending] = useState<boolean>(false)

    // Methods
    const doRegister = (e?: FormEvent) => {
        e?.preventDefault()

        if (!createPending) {
            setCreatePending(true)
            // Simulate async profile creation
            setTimeout(() => {
                console.log("Profile created with email:", userEmail)
                console.log("Password:", userPassword)
                setCreatePending(false) // Reset pending state
            }, 1000)
        }
    }

    const ifEnter = (e: React.KeyboardEvent) => 
        (e.key === 'Enter') ? doRegister(e as any) : null

    return (
        <Block className="register-page">
            <Heading variant="h2" className="text-black mb-4">
                {t('guest:h2:Register')} {t('guest:h2:account')}
            </Heading>
            <form onSubmit={doRegister} className="guest-form flex gap-4 flex-col">
                <Field
                    type="text"
                    lbl={t('guest:forms:Email')}
                    innerLabel={true}
                    value={userEmail}
                    onChange={(e: string) => setUserEmail(e)}
                    onKeyDown={(event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => 
                        ifEnter(event)
                    }
                    disabled={createPending}
                    className="register-field w-full"
                    required={true}
                />
                <Field
                    type={showPassword ? 'text' : 'password'}
                    lbl={t('guest:forms:Password')}
                    innerLabel={true}
                    value={userPassword}
                    onChange={(e: string) => setUserPassword(e)}
                    onKeyDown={(event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => 
                        ifEnter(event)
                    }
                    endButton={() => setShowPassword(!showPassword)}
                    endContent={!showPassword ? t('guest:forms:Show') : t('guest:forms:Hide')}
                    disabled={createPending}
                    className="register-field w-full"
                    required={true}
                />
                <Field
                    type="password"
                    lbl={t('guest:forms:Confirm-password')}
                    innerLabel={true}
                    value={userPassword2}
                    onChange={(e: string) => setUserPassword2(e)}
                    onKeyDown={(event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => 
                        ifEnter(event)
                    }
                    disabled={createPending}
                    className="register-field w-full"
                    required={true}
                />
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        name="accept-terms"
                        value="accept-terms"
                        required={true}
                        className="checkbox appearance-none rounded text-[#1ab11f] mr-2 h-4 w-4 border border-solid border-gray-300 checked:bg-[#1ab11f]"
                    />
                    <label htmlFor="accept-terms" className="text-black">
                        {t('guest:forms:Accept-Terms-of-Service')}
                    </label>
                </div>
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        name="confirmMarketing"
                        value="1"
                        className="checkbox appearance-none rounded text-[#1ab11f] mr-2 h-4 w-4 border border-solid border-gray-300 checked:bg-[#1ab11f]"
                    />
                    <label htmlFor="confirmnewsletter" className="text-black">
                        {t('guest:forms:Sign-me-up-for-news-and-marketing')}
                    </label>
                </div>
                <input
                    type="submit"
                    value={t('guest:forms:buttons:Sign-up')}
                    className="w-full text-center py-3 rounded bg-[#1ab11f] text-white focus:outline-none"
                    disabled={createPending} // Disable submit if pending
                />
            </form>
            <p className="mt-2">
                <Link className="text-[#1ab11f] font-bold" href="/sign-in">
                    {t('guest:links:Already-have-an-account')}
                </Link>
            </p>
        </Block>
    )
}