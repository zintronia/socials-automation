export interface User {
    primaryEmailAddress: {
        emailAddress: string | null
    };
    firstName: string;
    lastName: string;
    imageUrl?: string;

}