// to print from new browser tab (or window) to avoid unstable styles from other pages that can be keeped in browser while changing pages without full page reloading
export function stableStylesPrintElement(elementId) {
	const printWindow = window.open('', '', `width=${window.innerWidth},height=${window.innerHeight}`)
	const element = document.getElementById(elementId)

	if (element) {
		const content = element.outerHTML

		// to add html code
		printWindow.document.write('<html><head><title>Print</title>')
		printWindow.document.write('</head><body>')
		printWindow.document.write(content)
		printWindow.document.write('</body></html>')

		printWindow.print()
	}
}
