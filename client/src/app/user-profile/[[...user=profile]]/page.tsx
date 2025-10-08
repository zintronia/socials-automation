import { UserProfile } from '@clerk/nextjs'
import React from 'react'

const page = () => {
    return (
        <div className='w-full h-[100vh] flex justify-center items-center'>
            <UserProfile
                path="/user-profile"
                appearance={{
                    elements: {
                        rootBox: "w-full",
                        card: "shadow-none border-0 w-full",
                    }
                }}
            />
        </div>


    )
}

export default page