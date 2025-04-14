import { useEffect } from 'react';
import { useQuill } from 'react-quilljs';

export default function DisplayQuill({ content }) {
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

	return <span ref={quillRef} style={{ border: 'none' }}></span>
}