import { SaveConfirmationModal } from '@/components/save-confirmation-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import type { ProductCategoryFormProps as FormProps } from '@/types/pages/products';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Form({ category }: FormProps) {
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    const { data, setData, post, put, processing, errors } = useForm({
        name: category?.name || '',
        slug: category?.slug || '',
        description: category?.description || '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Categories', href: '/categories' },
        { title: category ? 'Edit Category' : 'Create Category', href: '#' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (category) {
            setShowSaveConfirm(true);
        } else {
            post(route('categories.store'));
        }
    };

    const confirmSave = () => {
        if (category) {
            put(route('categories.update', category.id), {
                onSuccess: () => setShowSaveConfirm(false),
                onError: () => setShowSaveConfirm(false),
            });
        }
    };

    const handleNameChange = (name: string) => {
        setData((d) => ({
            ...d,
            name,
            slug: name
                .toLowerCase()
                .replace(/ /g, '-')
                .replace(/[^\w-]+/g, ''),
        }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={category ? 'Edit Category' : 'Create Category'} />
            <SaveConfirmationModal
                isOpen={showSaveConfirm}
                onClose={() => setShowSaveConfirm(false)}
                onConfirm={confirmSave}
                title="Save Category Changes"
                description="Are you sure you want to save these changes to the category?"
                isProcessing={processing}
            />
            <div className="mx-auto max-w-2xl p-4">
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                    <h1 className="mb-6 text-xl font-bold">{category ? 'Edit Category' : 'Create Category'}</h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={data.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Category Name" />
                            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug</Label>
                            <Input id="slug" value={data.slug} onChange={(e) => setData('slug', e.target.value)} placeholder="category-slug" />
                            {errors.slug && <p className="text-xs text-red-500">{errors.slug}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="border-input bg-background focus:ring-ring min-h-[100px] w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                                placeholder="Optional description..."
                            />
                            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Save Category'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
