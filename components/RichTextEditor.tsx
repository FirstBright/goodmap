
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    forwardRef,
    useEffect,
    useImperativeHandle,
} from 'react';

interface RichTextEditorProps {
    initialContent: string;
    onChange: (content: string) => void;
    onBlur?: () => void;
    disabled?: boolean;
}

export interface RichTextEditorRef {
    clearContent: () => void;
}

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
    ({ initialContent, onChange, onBlur, disabled }, ref) => {
        const editor = useEditor({
            immediatelyRender: false, // Add this line to fix SSR issue
            extensions: [
                StarterKit.configure({
                    // Disable heading levels that are not needed
                    heading: {
                        levels: [1, 2, 3],
                    },
                }),
                Image.configure({
                    inline: false, // Images will be on their own line
                    allowBase64: false, // We are using URLs
                }),
            ],
            content: initialContent,
            editable: !disabled,
            onUpdate: ({ editor }) => {
                onChange(editor.getHTML());
            },
            onBlur: () => {
                onBlur?.();
            },
            editorProps: {
                attributes: {
                    class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[150px] border rounded-md p-2',
                },
                handleDrop: function (view, event, slice, moved) {
                    event.preventDefault();

                    // Handle file drop
                    if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
                        const file = event.dataTransfer.files[0];

                        if (!file.type.startsWith('image/')) {
                            return false;
                        }

                        const formData = new FormData();
                        formData.append('file', file);

                        fetch('/api/images/upload', {
                            method: 'POST',
                            body: formData,
                        })
                            .then((response) => response.json())
                            .then((data) => {
                                if (data.url) {
                                    const { schema } = view.state;
                                    const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                                    const node = schema.nodes.image.create({ src: data.url });
                                    const transaction = view.state.tr.insert(coordinates?.pos ?? 0, node);
                                    view.dispatch(transaction);
                                } else {
                                    console.error('Image upload failed:', data.error);
                                }
                            })
                            .catch((error) => {
                                console.error('Error uploading image:', error);
                            });

                        return true;
                    }

                    // Handle URL drop
                    const url = event.dataTransfer?.getData('URL');
                    if (url) {
                        fetch('/api/images/upload-from-url', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ url }),
                        })
                            .then((response) => response.json())
                            .then((data) => {
                                if (data.url) {
                                    const { schema } = view.state;
                                    const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                                    const node = schema.nodes.image.create({ src: data.url });
                                    const transaction = view.state.tr.insert(coordinates?.pos ?? 0, node);
                                    view.dispatch(transaction);
                                } else {
                                    console.error('Image upload from URL failed:', data.error);
                                }
                            })
                            .catch((error) => {
                                console.error('Error uploading image from URL:', error);
                            });

                        return true;
                    }

                    return false;
                },
            },
        });

        // Expose a function to clear the content
        useImperativeHandle(ref, () => ({
            clearContent: () => {
                editor?.commands.clearContent();
            },
        }));

        useEffect(() => {
            if (editor && disabled !== !editor.isEditable) {
                editor.setEditable(!disabled);
            }
        }, [disabled, editor]);

        useEffect(() => {
            if (editor && initialContent !== editor.getHTML()) {
                editor.commands.setContent(initialContent, { emitUpdate: false });
            }
        }, [initialContent, editor]);

        const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (file && editor) {
                const formData = new FormData();
                formData.append('file', file);

                fetch('/api/images/upload', {
                    method: 'POST',
                    body: formData,
                })
                    .then((response) => response.json())
                    .then((data) => {
                        if (data.url) {
                            const { schema } = editor.view.state;
                            const node = schema.nodes.image.create({ src: data.url });
                            const transaction = editor.view.state.tr.insert(editor.state.selection.from, node);
                            editor.view.dispatch(transaction);
                        } else {
                            console.error('Image upload failed:', data.error);
                        }
                    })
                    .catch((error) => {
                        console.error('Error uploading image:', error);
                    });
            }
        };

        return (
            <div className="border rounded-md">
                <div className="p-1 border-b">
                    <input
                        type="file"
                        id="fileInput"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                        accept="image/*"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('fileInput')?.click()}
                    >
                        <ImagePlus className="h-4 w-4" />
                    </Button>
                </div>
                <EditorContent editor={editor} />
            </div>
        );
    }
);

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
