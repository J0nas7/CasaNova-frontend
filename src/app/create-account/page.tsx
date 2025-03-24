import React from 'react'
import { Block } from '@/components'
import { CreateAccountForm } from '@/components/partials/auth/create-account'

export default function CreateAccountPage() {
    return (
        <Block className="mx-auto w-96 flex flex-col h-full justify-center">
            <CreateAccountForm />
        </Block>
    )
}
