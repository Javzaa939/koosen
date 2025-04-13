import { useEffect } from 'react';
import { useQuill } from 'react-quilljs';

export default function DisplayQuill({ content, className, style }) {
	const { quillRef, quill } = useQuill({
		readOnly: true,
		modules: {
			toolbar: false,
		},
	})

	useEffect(() => {
		if (quill && content) {
			quill.setContents(quill.clipboard.convert(content));
		}
	}, [quill])

	return <span ref={quillRef} className={className} style={{ border: 'none', ...style }}></span>
}