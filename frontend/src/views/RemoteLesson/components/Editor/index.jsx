import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css'
import { useEffect } from 'react';
import useLoader from '@src/utility/hooks/useLoader';

export default function Editor({
	placeholder,
	className = '',
	style,
	modules,
	formats,
	saveFileApi,
	name,
	value,
	onChange
}) {
	const { fetchData } = useLoader({});

	modules = modules || {
		toolbar: [
			[{ 'font': [] }, { 'size': ['small', 'medium', 'large', 'huge'] }],
			[{ 'header': '1' }, { 'header': '2' }],
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
		'clean', 'font', 'blockquote'
	];

	const { quill, quillRef } = useQuill({
		modules: modules,
		theme: 'snow',
		formats: formats,
		readOnly: false,
		placeholder: placeholder,
	});

	const insertToEditor = (url) => {
		const range = quill.getSelection();
		quill.insertEmbed(range.index, 'image', url);
	};

	async function saveToServer(file) {
		const fileFormData = new FormData();
		fileFormData.append('file', file);

		const { success, data } = await fetchData(saveFileApi(fileFormData))
		insertToEditor(data);
	}

	function selectLocalImage() {
		const input = document.createElement('input');
		input.setAttribute('type', 'file');
		input.setAttribute('accept', 'image/*');
		input.click();

		input.onchange = () => {
			const file = input.files[0];
			saveToServer(file);
		};
	}

	useEffect(() => {
		if (quill) {
			quill.getModule('toolbar').addHandler('image', selectLocalImage);

			if (onChange) {
				quill.on('text-change', () => {
					onChange(quill.root.innerHTML);
				});
			}
		}
	}, [quill]);

	useEffect(() => {
		if (quill && value !== quill.root.innerHTML) {
			quill.root.innerHTML = value;
		}
	}, [value]);

	return (
		<div>
			<div
				name={name}
				id={name}
				ref={quillRef}
				className={className}
				style={style}
			/>
		</div>
	)
}