import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css'
import { useRef } from 'react';

export default function Editor({
	placeholder,
	className,
	style,
	modules,
	formats,
	...field
}) {
	const quillRef = useRef(null);

	modules = modules || {
		toolbar: [
			[{ 'font': [] }, { 'size': ['small', 'medium', 'large', 'huge'] }],
			[{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
			[{ 'align': [] }],
			['bold', 'italic', 'underline', 'strike'],
			[{ 'list': 'ordered' }, { 'list': 'bullet' }],
			[{ 'indent': '-1' }, { 'indent': '+1' }],
			['link'],
			[{ color: [] }, { background: [] }],
			['blockquote'],
			['image', 'video'],
			['clean']
		],
	};

	formats = formats || [
		'header', 'bold', 'italic', 'underline', 'strike',
		'align', 'list', 'indent',
		'size', 'link',
		'image', 'video',
		'color', 'background',
		'clean'
	];

	return (
		<>
			<style>
				{`
					.custom-quill .ql-container {
						min-height: 100px;
					}
				`}
			</style>
			<ReactQuill
				{...field}
				id={field.name}
				ref={quillRef}
				placeholder={placeholder}
				modules={modules}
				formats={formats}
				theme="snow"
				className={`custom-quill ${className}`}
				style={style}
			/>
		</>
	)
}