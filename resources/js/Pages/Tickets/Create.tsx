import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import JoditEditor from 'jodit-react';
import { FormEvent, useEffect, useMemo } from 'react';
import { playSuccessSound } from '@/utils/soundNotification';

type Project = {
    id: number;
    name: string;
};

type Props = PageProps<{
    projects: Project[];
}>;

export default function TicketsCreate({ projects }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        project_id: '',
        category: '',
        description: '',
        attachments: [] as File[],
    });

    useEffect(() => {
        if (projects.length === 1 && !data.project_id) {
            setData('project_id', String(projects[0].id));
        }
    }, [data.project_id, projects, setData]);

    const editorConfig = useMemo(
        () => ({
            readonly: false,
            placeholder: 'Tulis deskripsi tiket…',
            height: 260,
            toolbarAdaptive: false,
            showCharsCounter: false,
            showWordsCounter: false,
            showXPathInStatusbar: false,
        }),
        [],
    );

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('tickets.store'), { 
            forceFormData: true, 
            onSuccess: () => playSuccessSound(),
            showProgress: true
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        New Ticket
                    </h2>
                    <Link
                        href={route('tickets.index')}
                        className="text-sm font-semibold text-slate-700 hover:text-slate-900"
                    >
                        Back to My Tickets
                    </Link>
                </div>
            }
        >
            <Head title="New Ticket" />

            <div className="py-8">
                <div className="w-full max-w-none sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6">
                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-12 md:col-span-8">
                                    <InputLabel htmlFor="title" value="Title" />
                                    <TextInput
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="mt-1 block w-full"
                                        required
                                        autoFocus
                                    />
                                    <InputError message={errors.title} className="mt-2" />
                                </div>

                                <div className="col-span-12 md:col-span-4">
                                    <InputLabel htmlFor="project_id" value="Project" />
                                    <select
                                        id="project_id"
                                        value={data.project_id}
                                        onChange={(e) => setData('project_id', e.target.value)}
                                        disabled={projects.length === 1}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">
                                            {projects.length === 1 ? 'Project otomatis' : '-- Pilih Project --'}
                                        </option>
                                        {projects.map((p) => (
                                            <option key={p.id} value={String(p.id)}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.project_id} className="mt-2" />
                                </div>

                                <div className="col-span-12 md:col-span-6">
                                    <InputLabel htmlFor="category" value="Unit Tujuan" />
                                    <select
                                        id="category"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">-- Pilih Unit Tujuan --</option>
                                        <option value="IT">IT</option>
                                        <option value="IPSRS">IPSRS</option>
                                    </select>
                                    <InputError message={errors.category} className="mt-2" />
                                </div>

                                <div className="col-span-12">
                                    <InputLabel htmlFor="description" value="Description" />
                                    <div className="mt-1 overflow-hidden rounded-md border border-gray-300 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                                        <JoditEditor
                                            value={data.description}
                                            config={editorConfig}
                                            onBlur={(value) => setData('description', value)}
                                            onChange={(value) => setData('description', value)}
                                        />
                                    </div>
                                    <InputError message={errors.description} className="mt-2" />
                                </div>

                                <div className="col-span-12">
                                    <div className="rounded-md border border-gray-300 bg-white px-3 py-3">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="file"
                                                multiple
                                                accept=".jpg,.jpeg,.png,.gif,.doc,.docx,.pdf,.xlsx,.csv,.xls"
                                                onChange={(e) => {
                                                    const files = Array.from(e.target.files ?? []);
                                                    setData('attachments', files);
                                                }}
                                                className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                                            />
                                        </div>
                                        <div className="mt-2 text-xs text-slate-500">
                                            Only jpg, jpeg, png, gif, doc, docx, pdf, xlsx, csv, xls is allowed
                                        </div>

                                        {data.attachments.length > 0 && (
                                            <div className="mt-3 border-t border-slate-100 pt-3">
                                                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                                    Selected File
                                                </div>
                                                <div className="mt-2 space-y-1 text-sm text-slate-700">
                                                    {data.attachments.map((f) => (
                                                        <div key={`${f.name}-${f.size}`} className="truncate">
                                                            {f.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <InputError message={errors.attachments} className="mt-2" />
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-end gap-3">
                                <Link
                                    href={route('tickets.index')}
                                    className="rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                                >
                                    Cancel
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    {processing ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : (
                                        'Create Ticket'
                                    )}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
