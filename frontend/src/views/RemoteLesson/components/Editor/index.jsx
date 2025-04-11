import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css'
import { useEffect } from 'react';
// import useLoader from '@src/utility/hooks/useLoader';

export default function Editor({
	placeholder,
	className = '',
	style,
	modules,
	formats,
	// saveFileApi,
	name,
	value,
	onChange
}) {
	// const { fetchData } = useLoader({});

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
			// ['image', 'video'],
			['clean']
		],
	};

	formats = formats || [
		'header', 'bold', 'italic', 'underline', 'strike',
		'align', 'list', 'indent',
		'size', 'link',
		// 'image', 'video',
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

	/*
		NOTE: it is very dangerous to upload files to CDN using Quill, because it requires removing.
		Builtin removing event does not exist.
		If parsing will be used to implement "onRemove" event to remove from CDN then after random update it can be ruined and CDN space can be ended.

	const insertToEditor = (url, type) => {
		const range = quill.getSelection();
		quill.insertEmbed(range.index, type, url);
	};

	async function saveToServer(file, type) {
		const fileFormData = new FormData();
		fileFormData.append('file', file);

		const { success, data } = await fetchData(saveFileApi(fileFormData))
		insertToEditor(data, type);
	}

	function selectLocalFile(type) {
		const input = document.createElement('input');
		input.setAttribute('type', 'file');

		if (type === 'image') {
			input.setAttribute('accept', 'image/*');
		}

		input.click();

		input.onchange = () => {
			const file = input.files[0];
			saveToServer(file, type);
		};
	}
	*/

	useEffect(() => {
		if (quill) {
			/*
				NOTE: it is very dangerous to upload files to CDN using Quill, because it requires removing.
				Builtin removing event does not exist.
				If parsing will be used to implement "onRemove" event to remove from CDN then after random update it can be ruined and CDN space can be ended.
			*/
			// quill.getModule('toolbar').addHandler('image', () => selectLocalFile('image'));
			// quill.getModule('toolbar').addHandler('video', () => selectLocalFile('video'));

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