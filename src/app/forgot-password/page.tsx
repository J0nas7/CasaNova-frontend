import React from 'react'
import { Block } from '@/components'
import { ForgotPasswordForm } from '@/components/partials/auth/forgot-password'

export default function ForgotPasswordPage() {
    return (
        <Block className="mx-auto w-96 flex flex-col h-full justify-center">
            <ForgotPasswordForm />
        </Block>
    )
}
