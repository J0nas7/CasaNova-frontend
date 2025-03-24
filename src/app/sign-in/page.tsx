import React from 'react'
import { LoginForm } from '@/components/partials/auth/sign-in'
import { Block } from '@/components'

export default function SignInPage() {
    return (
        <SignInView />
    )
}

export const SignInView = () => {
    return (
        <Block className="mx-auto w-96 flex flex-col h-full justify-center">
            <LoginForm />
        </Block>
    )
}