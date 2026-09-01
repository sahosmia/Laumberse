import { cn } from '@/lib/utils';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Strikethrough } from 'lucide-react';
import * as React from 'react';
import { FormError } from './form-error';
import { FormLabel } from './form-label';

interface RichTextEditorProps {
    id?: string;
    label?: string;
    required?: boolean;
    error?: string;
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    containerClassName?: string;
}

function ToolbarButton({
    onClick,
    active,
    children,
    title,
}: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    title: string;
}) {
    return (
        <button
            type="button"
            title={title}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            className={cn(
                'flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
                active && 'bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-neutral-100',
            )}
        >
            {children}
        </button>
    );
}

export function RichTextEditor({ id, label, required, error, value, onChange, placeholder, containerClassName }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [StarterKit, Placeholder.configure({ placeholder })],
        content: value,
        editorProps: {
            attributes: {
                class: 'tiptap-content min-h-[160px] px-3 py-2 text-sm focus:outline-none',
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange(html === '<p></p>' ? '' : html);
        },
    });

    React.useEffect(() => {
        if (!editor) return;
        if (value !== editor.getHTML() && !(value === '' && editor.getHTML() === '<p></p>')) {
            editor.commands.setContent(value || '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, editor]);

    return (
        <div className={cn('flex w-full flex-col gap-1.5', containerClassName)}>
            {label && (
                <FormLabel htmlFor={id} required={required}>
                    {label}
                </FormLabel>
            )}
            <div
                className={cn(
                    'w-full overflow-hidden rounded-xl border border-neutral-200 bg-transparent dark:border-neutral-800',
                    error && 'border-red-500',
                )}
            >
                {editor && (
                    <div className="flex items-center gap-0.5 border-b border-neutral-200 bg-neutral-50 px-2 py-1 dark:border-neutral-800 dark:bg-neutral-800/50">
                        <ToolbarButton
                            title="Bold"
                            active={editor.isActive('bold')}
                            onClick={() => editor.chain().focus().toggleBold().run()}
                        >
                            <Bold className="h-3.5 w-3.5" />
                        </ToolbarButton>
                        <ToolbarButton
                            title="Italic"
                            active={editor.isActive('italic')}
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                        >
                            <Italic className="h-3.5 w-3.5" />
                        </ToolbarButton>
                        <ToolbarButton
                            title="Strikethrough"
                            active={editor.isActive('strike')}
                            onClick={() => editor.chain().focus().toggleStrike().run()}
                        >
                            <Strikethrough className="h-3.5 w-3.5" />
                        </ToolbarButton>
                        <div className="mx-1 h-4 w-px bg-neutral-200 dark:bg-neutral-700" />
                        <ToolbarButton
                            title="Bullet List"
                            active={editor.isActive('bulletList')}
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                        >
                            <List className="h-3.5 w-3.5" />
                        </ToolbarButton>
                        <ToolbarButton
                            title="Numbered List"
                            active={editor.isActive('orderedList')}
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        >
                            <ListOrdered className="h-3.5 w-3.5" />
                        </ToolbarButton>
                    </div>
                )}
                <div id={id} onClick={() => editor?.chain().focus().run()} className="cursor-text bg-transparent dark:text-neutral-100">
                    <EditorContent editor={editor} />
                </div>
            </div>
            <FormError message={error} />
        </div>
    );
}
