import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{
    mustVerifyEmail: boolean;
    status?: string;
}>) {
    const page = usePage();
    const params = new URLSearchParams(page.url.split('?')[1] ?? '');
    const section = params.get('section');
    const showPassword = section === 'password';

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="w-full max-w-none space-y-6 sm:px-6 lg:px-8">
                    {showPassword ? (
                        <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                            <UpdatePasswordForm className="max-w-xl" />
                        </div>
                    ) : (
                        <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className="max-w-xl"
                            />
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
