import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

type ProfileFormData = {
    name: string;
    email: string;
    telegram_chat_id: string;
    telegram_username: string;
};

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const user = usePage().props.auth.user;
    const isAdmin = user.role === 'admin';

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm<ProfileFormData>({
            name: user.name,
            email: user.email,
            telegram_chat_id: user.telegram_chat_id ?? '',
            telegram_username: user.telegram_username ?? '',
        });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const avatarUrl = (user as any).avatar_url ?? null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setSelectedFile(file);
        setUploadError(null);
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const submitAvatar: FormEventHandler = (e) => {
        e.preventDefault();
        if (!selectedFile) return;

        setUploading(true);
        setUploadError(null);

        router.post(
            route('profile.avatar'),
            { avatar: selectedFile },
            {
                forceFormData: true,
                onSuccess: () => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setUploading(false);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                },
                onError: (errs) => {
                    setUploading(false);
                    setUploadError(errs.avatar ?? 'Upload gagal.');
                },
            },
        );
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    const submitTelegram: FormEventHandler = (e) => {
        e.preventDefault();
        router.post(route('profile.telegram.connect'), {
            telegram_chat_id: data.telegram_chat_id,
            telegram_username: data.telegram_username,
        });
    };

    const testTelegram: FormEventHandler = (e) => {
        e.preventDefault();
        router.post(route('profile.telegram.test'), {
            telegram_chat_id: data.telegram_chat_id,
        });
    };

    const displayAvatar = previewUrl ?? avatarUrl;
    const initials = user.name.slice(0, 2).toUpperCase();

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Profile Information
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Update your account's profile information and email address.
                </p>
            </header>

            {/* Avatar Section */}
            <div className="mt-6">
                <div className="flex items-center gap-6">
                    {/* Avatar Preview */}
                    <div className="relative">
                        {displayAvatar ? (
                            <img
                                src={displayAvatar}
                                alt="Avatar"
                                className="h-20 w-20 rounded-full object-cover ring-2 ring-teal-500 ring-offset-2"
                            />
                        ) : (
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 ring-2 ring-teal-500 ring-offset-2">
                                <span className="text-xl font-bold text-white">{initials}</span>
                            </div>
                        )}
                        {/* Camera icon overlay */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-teal-500 text-white shadow-md hover:bg-teal-600 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                                <circle cx="12" cy="13" r="4"/>
                            </svg>
                        </button>
                    </div>

                    {/* Upload controls */}
                    <form onSubmit={submitAvatar} className="flex-1">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-700">Foto Profil</p>
                            <p className="text-xs text-gray-500">JPG, PNG, atau WebP. Maksimal 2MB.</p>
                        </div>
                        {selectedFile && (
                            <div className="mt-3 flex items-center gap-2">
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="rounded-lg bg-teal-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-600 disabled:opacity-50 transition-colors"
                                >
                                    {uploading ? 'Mengupload...' : 'Upload'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedFile(null);
                                        setPreviewUrl(null);
                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                    }}
                                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </button>
                            </div>
                        )}
                        {status === 'avatar-updated' && !selectedFile && (
                            <p className="mt-2 text-xs font-medium text-green-600">Foto profil berhasil diperbarui.</p>
                        )}
                        {uploadError && (
                            <p className="mt-2 text-xs text-red-600">{uploadError}</p>
                        )}
                    </form>
                </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Name" />
                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />
                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800">
                            Your email address is unverified.{' '}
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>
                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                A new verification link has been sent to your email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">Saved.</p>
                    </Transition>
                </div>
            </form>

            {isAdmin && (
            <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Telegram Notification</h3>
                        <p className="text-sm text-slate-600">
                            {user.telegram_chat_id
                                ? 'Akun Telegram Anda sudah terhubung.'
                                : 'Hubungkan Telegram untuk menerima notifikasi tiket.'}
                        </p>
                    </div>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${user.telegram_chat_id ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {user.telegram_chat_id ? 'Terhubung' : 'Belum terhubung'}
                    </span>
                </div>

                <div className="mt-4 space-y-4">
                    <div>
                        <InputLabel htmlFor="telegram_chat_id" value="Chat ID Telegram" />
                        <TextInput
                            id="telegram_chat_id"
                            type="text"
                            value={data.telegram_chat_id}
                            onChange={(e) => setData('telegram_chat_id', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="Contoh: 123456789"
                        />
                        <InputError className="mt-2" message={errors.telegram_chat_id} />
                        <p className="mt-1 text-xs text-slate-500">
                            Isi angka Chat ID dari bot Telegram, bukan username @nama.
                        </p>
                    </div>

                    <div>
                        <InputLabel htmlFor="telegram_username" value="Username Telegram" />
                        <TextInput
                            id="telegram_username"
                            type="text"
                            value={data.telegram_username}
                            onChange={(e) => setData('telegram_username', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="Contoh: @nama_user"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={submitTelegram}
                            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
                        >
                            Hubungkan Telegram
                        </button>

                        <button
                            type="button"
                            onClick={testTelegram}
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                        >
                            Test Telegram
                        </button>
                    </div>

                    {status === 'telegram-connected' && (
                        <p className="text-sm font-medium text-green-600">Telegram berhasil disimpan.</p>
                    )}

                    {status === 'telegram-test-sent' && (
                        <p className="text-sm font-medium text-green-600">Pesan test Telegram sedang dikirim.</p>
                    )}
                </div>
            </div>
            )}
        </section>
    );
}
